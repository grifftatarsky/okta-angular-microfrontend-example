import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SessionStorageService } from 'ngx-webstorage';

@Injectable()
export class AuthServerProvider {
    constructor(
        private $sessionStorage: SessionStorageService
    ) { }

    logout(): Observable<any> {
        return new Observable((observer) => {
            this.$sessionStorage.clear('authToken');
            observer.complete();
        });
    }
}
