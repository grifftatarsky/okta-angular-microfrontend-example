import { Injectable } from '@angular/core';
import { User } from "../model/user.model";
import {Observable, of} from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class PortalProfileService {
    private currentUser: Observable<User> | undefined;

    constructor() { }

    public getCurrentUser(): Observable<User> | undefined {
        if (this.currentUser != undefined) {
            return this.currentUser;
        } else {
            return undefined;
        }
    }

    public updateCurrentUser(currentUser: Observable<User>): Observable<User> {
        this.currentUser = currentUser;
        return this.currentUser;
    }
}

