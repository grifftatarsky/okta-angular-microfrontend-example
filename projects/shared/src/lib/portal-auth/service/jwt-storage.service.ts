import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { Principal } from './principal.service';
import { ConfigService } from './config.service';

@Injectable()
export class JwtStorageService
{

    private rememberMe: boolean;
    private intervalId: number | undefined;
    public stime: number | undefined;
    public jtime: number | undefined;

    constructor(
        private jwtHelperService: JwtHelperService,
        private http: HttpClient,
        private principal: Principal,
        private configService: ConfigService,
    ) {
        this.checkForStoredToken = this.checkForStoredToken.bind(this);
        this.renewToken = this.renewToken.bind(this);
        this.rememberMe = false;
    }

    storeToken(token: string) {
        // always store JWT because session storage is more widely accessible than cookie service
        sessionStorage.setItem('authToken', token);
        this.principal.identityJWT(false).then();
        this.principal.setToken(token);
        this.startSessionTimer(token);
    }

    checkForStoredToken(): string | null {
        const sessionToken =  sessionStorage.getItem('authToken');

        if (sessionToken) {
            if (this.jwtHelperService.isTokenExpired(sessionToken)) {
                this.timeoutUser();
                return null;
            }
            this.startSessionTimer(sessionToken);
            return sessionToken;
        } else {
            return null;
        }
    }

    deleteToken() {
        window.clearInterval(this.intervalId);
        // @ts-ignore
        this.intervalId = null;
        this.principal.identityJWT(false).then();
        this.principal.setToken('');
        this.principal.setIdentity();
        this.principal.authenticate(null);
        this.logout().subscribe(
            () => {
                if (typeof this.configService.LOGOUT_URL === "string") {
                    window.location.href = this.configService.LOGOUT_URL;
                }
            }
        );
        if (typeof this.configService.LOGOUT_URL === "string") {
            window.location.href = this.configService.LOGOUT_URL;
        }
    }

    logout(): Observable<any> {
        alert("You have been logged out. Your JWT may have expired.")
        return this.http.post(this.configService.MICROFICHE_API + 'logout', {});
    }

    private startSessionTimer(token: string) {
        if (this.intervalId != null) {
            return;
        }

        // @ts-ignore
        const sessionTime = this.jwtHelperService.getTokenExpirationDate(token).getTime() - 1000 * 60 * 5 - Date.now();

        this.stime = sessionTime;
        // @ts-ignore
        this.jtime = this.jwtHelperService.getTokenExpirationDate(token).getTime();
        if (sessionTime <= 0) {
            return this.timeoutUser();
        }
        this.intervalId = window.setTimeout(() => console.log("Session Time: " + sessionTime));
    }

    renewToken(): Observable<any> {
        const checkedToken = this.checkForStoredToken();
        if (!checkedToken) {
            // @ts-ignore
            return;
        }
        checkedToken.replace('\'', '').replace('\'', '');
        return this.http
            .get(`${this.configService.PAM_API}api/v1/account/renew-jwt`, { params: new HttpParams().set('rememberMe', this.rememberMe.toString()) }).pipe(
                tap((token: any) => {
                    const jwt = token.id_token;
                    window.clearInterval(this.intervalId);
                    // @ts-ignore
                    this.intervalId = null;
                    this.storeToken(jwt);
                }),
                map((token) => !!token),
                map((token) => {
                    this.http.post(this.configService.MICROFICHE_API + 'api/renewaccountjwt', token);
                })
            );
    }

    public timeoutUser() {
        // TODO | GRIFF: Figure out why the config is not saving any of these props (BASE_PATH, LOGOUT_URL).
        this.deleteToken();
        if (typeof this.configService.LOGOUT_URL === "string") {
            window.location.href = this.configService.LOGOUT_URL;
        } else if (this.configService.LOGOUT_URL == undefined) {
            window.location.href = `${location.origin}/logout`;
        }
    }

}
