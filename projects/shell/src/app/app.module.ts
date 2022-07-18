import { APP_INITIALIZER, Injector, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ProductsComponent } from './products/products.component';
import { ProductComponent } from './products/product.component';

import { OKTA_CONFIG, OktaAuthModule } from '@okta/okta-angular';
import { OktaAuth } from '@okta/okta-auth-js';
import { NgxWebstorageModule, SessionStorageService } from "ngx-webstorage";
import { JWT_OPTIONS, JwtHelperService, JwtModule } from "@auth0/angular-jwt";
import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import {
  AccountService,
  AuthServerProvider,
  AuthExpiredInterceptor,
  AuthInterceptor,
  ConfigService,
  JwtStorageService,
  LoginService,
  StateStorageService,
  UserDataService,
  Principal
} from "@shared";
import { CookieService } from "ngx-cookie-service";

// OKTA Authentication (Demos shared auth).
const oktaAuth = new OktaAuth({
  issuer: 'https://dev-51619246.okta.com/oauth2/default',
  clientId: '0oa5rts878FmyhIqi5d7',
  redirectUri: window.location.origin + '/login/callback',
  scopes: ['openid', 'profile', 'email']
});

export const whitelistedDomains = [/\.fema\.net$/i, /\.fema\.gov$/i, /localhost/i];

export function jwtOptionsFactory(): any {
  return {
    tokenGetter: () => sessionStorage.getItem('authToken'),
    whitelistedDomains
  };
}

@NgModule({
  declarations: [
    AppComponent,
    ProductsComponent,
    ProductComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    OktaAuthModule,
    HttpClientModule,
    NgxWebstorageModule.forRoot({ prefix: 'jhi', separator: '-' }),
    JwtModule.forRoot({
      jwtOptionsProvider: {
        provide: JWT_OPTIONS,
        useFactory: jwtOptionsFactory,
        deps: [SessionStorageService]
      }
    }),
  ],
  providers: [
    ConfigService,
    UserDataService,
    Principal,
    AccountService,
    AuthServerProvider,
    JwtStorageService,
    LoginService,
    StateStorageService,
    CookieService,
    { provide: OKTA_CONFIG, useValue: { oktaAuth } },
    { provide: JwtHelperService, useValue: new JwtHelperService() },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
      deps: [
        SessionStorageService
      ]
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthExpiredInterceptor,
      multi: true,
      deps: [Injector]
    },
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: (configService: ConfigService, principal: Principal) => () => {
        return () => configService.getAppConfig()
            .toPromise()
            .then(
                () => new Promise<void>(
                    (res) => {
                      const jwtToken = sessionStorage.getItem('authToken');
                      principal.authenticate({token: jwtToken});
                      res();
                    }
                  )
            )
      },
      deps: [ConfigService, Principal]
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
