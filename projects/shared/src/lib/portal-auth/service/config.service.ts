import {Injectable} from '@angular/core';
import {HttpClient, HttpParams, HttpResponse} from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AppConfig } from '../config/appconfig';

@Injectable()
export class ConfigService {
    public PAM_API: string | undefined = "";
    public PAM_UI: string | undefined = "";
    public BASE_PATH: string | undefined = "";
    public MICROFICHE_API: string | undefined = "";
    public MICROFICHE_UI: string | undefined = "";
    public VERSION: string | undefined = "";
    public LOGOUT_URL: string | undefined = "";
    public url: string | undefined = "";
    private userLoginType: string | undefined = "";

    constructor(
        private http: HttpClient
    ) { }

    getAppConfig(): Observable<AppConfig> {
        const params = new HttpParams();
        if (location.origin.includes("localhost")) {
            this.BASE_PATH = "";
            this.MICROFICHE_API = `${location.origin}/microfiche/microfiche-services/`;
            this.MICROFICHE_UI = `${location.origin}/microfiche/`;
            this.LOGOUT_URL = `${location.origin}/logout`;
        } else {
            this.BASE_PATH = location.pathname.replace("microfiche/", "");
            this.MICROFICHE_API = `${location.origin}${this.BASE_PATH}microfiche/microfiche-services/`;
            this.MICROFICHE_UI = `${location.origin}${this.BASE_PATH}microfiche/`;
            this.LOGOUT_URL = `${location.origin}${this.BASE_PATH}logout`;
        }
        this.PAM_UI = `${location.origin}${this.BASE_PATH}web-portal/`;
        this.PAM_API = `${location.origin}${this.BASE_PATH}pam/`;
        // @ts-ignore
        return this.http.get<AppConfig>(this.MICROFICHE_API + 'api/app-config',
            { params, observe: 'response' }).pipe(map((response: HttpResponse<AppConfig>) => {
            const appConfigObject = response.body;

            if(response.headers.has("Authorization"))
            {
                // @ts-ignore
                sessionStorage.setItem("authToken", response.headers.get("Authorization").replace('Bearer ',''));
            }
            // @ts-ignore
            const currentUser = JSON.parse(atob(sessionStorage.getItem("authToken").split('.')[1]));
            if(!currentUser.userLoginType)
            { return; }
            this.userLoginType = currentUser.userLoginType as string;
            // @ts-ignore
            this.VERSION = appConfigObject.version;
            // we want to basically fail here... nobody should be UNKNOWN. that's real bad.
            if (this.userLoginType == "UNKNOWN") {
                return;
            }
            if (this.userLoginType == "INTERNAL") {
                this.LOGOUT_URL = `${location.origin}${this.BASE_PATH}web-portal/#/timeout`;
            }

            return appConfigObject;
        }));
    }
}
