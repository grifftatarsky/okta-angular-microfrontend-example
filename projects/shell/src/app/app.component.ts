import {AfterViewInit, OnDestroy, Component, Inject, OnInit, AfterContentInit} from '@angular/core';
import { Observable, of, Subscription } from 'rxjs';
import { OKTA_AUTH, OktaAuthStateService } from '@okta/okta-angular';
import { OktaAuth } from '@okta/okta-auth-js';
import { DOCUMENT } from "@angular/common";
import {ConfigService, JwtStorageService, PortalProfileService, UserDataService} from "@shared";
import { Category } from "@shared";
import { Title } from "@angular/platform-browser";
import { ActivatedRouteSnapshot, NavigationEnd, Router } from "@angular/router";
import {User} from "../../../shared/src/lib/portal-auth/model/user.model";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styles: []
})
export class AppComponent implements OnInit, AfterContentInit, OnDestroy {
  jwservice: JwtStorageService | undefined;
  pamUrl: string | undefined;
  loginId: string | undefined;
  token: string | undefined;
  jwtToken: string | null;
  allowedCategories: Category[] | undefined;
  name: string | null | undefined;
  currentUserSub$: Subscription | undefined;
  currentUser: User | undefined;

  ngOnInit() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.titleService.setTitle(this.getPageTitle(this.router.routerState.snapshot.root));
      }
    });
    this.jwtStorageService.checkForStoredToken();
  }

  ngAfterContentInit () {
    // @ts-ignore
    this.portalProfileService.updateCurrentUser(of(this.currentUser));
    console.log("IS LOCAL: " + location.origin.includes("localhost"));
  }

  constructor(
      private titleService: Title,
      private router: Router,
      private oktaStateService: OktaAuthStateService,
      @Inject(OKTA_AUTH) private oktaAuth: OktaAuth,
      public jwtStorageService: JwtStorageService,
      private configService: ConfigService,
      private data: UserDataService,
      private portalProfileService: PortalProfileService,
      @Inject(DOCUMENT) private document: Document,
  ) {
    this.pamUrl = `${this.configService.PAM_API}api/v1`;
    this.jwtStorageService.checkForStoredToken = this.jwtStorageService.checkForStoredToken.bind(this);
    this.jwtToken = sessionStorage.getItem('authToken');
    // @ts-ignore
    this.currentUserSub$ = this.data.getCurrentUserNew(this.jwtToken)
        .subscribe(
            (user) => {
              if (user != undefined)
              {
                this.currentUser = user
                this.name = (user.firstName + ' ' + user.lastName);
                this.allowedCategories = this.data.populateCategories(user);
              }
            },
            () => this.allowedCategories = []
        );
    if (this.currentUser == undefined) {
      // @ts-ignore
      this.currentUser = JSON.parse(atob(sessionStorage.getItem("authToken").split('.')[1]));
      this.name = (this.currentUser?.firstName + ' ' + this.currentUser?.lastName);
    }
  }

  ngOnDestroy(): void {
        this.currentUserSub$?.unsubscribe();
    }

  private getPageTitle(routeSnapshot: ActivatedRouteSnapshot) {
    let title: string = (routeSnapshot.data && routeSnapshot.data['pageTitle']) ? routeSnapshot.data['pageTitle'] : 'microFicheWebPortalApp';
    if (routeSnapshot.firstChild) {
      title = this.getPageTitle(routeSnapshot.firstChild) || title;
    }
    return title;
  }

  public async signIn(): Promise<void> {
    await this.oktaAuth.signInWithRedirect();
  }

  public async signOut(): Promise<void> {
    await this.oktaAuth.signOut();
  }
}
