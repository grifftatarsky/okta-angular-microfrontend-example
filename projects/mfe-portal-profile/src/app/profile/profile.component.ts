import { AfterContentInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, of, Subscription } from 'rxjs';
import { PortalProfileService } from "@shared";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styles: []
})
export class ProfileComponent implements OnInit, AfterContentInit, OnDestroy {
  public userSub$: Subscription | undefined;
  public userName$: Observable<string> | undefined;
  public email$: Observable<string> | undefined;
  public userString$: Observable<string> | undefined;



  constructor(
      private portalProfileService: PortalProfileService
  ) {}

  ngOnDestroy(): void {
        this.userSub$?.unsubscribe();
    }

  ngOnInit(): void {
  }

  ngAfterContentInit(): void {
    this.userSub$ = this.portalProfileService.getCurrentUser()?.subscribe(
      (user) => {
        this.userString$ = of(JSON.stringify(user));
        this.userName$ = of(user.firstName + ' ' + user.lastName);
        this.email$ = of(`${user.email}`);
      }
    );
  }
}
