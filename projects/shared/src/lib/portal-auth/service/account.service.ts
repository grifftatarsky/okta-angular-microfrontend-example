import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserDataService } from './userdata.service';
import { Account } from "../model/account.model";

@Injectable()
export class AccountService {
    constructor(private http: HttpClient, private userDataService: UserDataService) {

    }

    get(): Observable<HttpResponse<Account>> {
        return this.http.get<Account>(this.userDataService.getPARTServiceURL() + 'api/account', { observe: 'response' });
    }
    getJWT(): Observable<HttpResponse<Account>> {
        return this.http.get<Account>(this.userDataService.getPARTServiceURL() + 'api/accountjwt', { observe: 'response' });
    }
    save(account: any): Observable<HttpResponse<any>> {
        return this.http.post(this.userDataService.getPARTServiceURL() + 'api/account', account, { observe: 'response' });
    }
}
