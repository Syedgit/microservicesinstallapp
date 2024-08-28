html

<ng-container *ngIf="loading$ | async; else memberAuthTemplate">
  <ps-tile>
    <util-spinning-loader [loading]="loading$ | async"></util-spinning-loader>
  </ps-tile>
</ng-container>
<ng-template #memberAuthTemplate>
  <div class="member-container">
    <ng-container>
      <form [formGroup]="memberForm">
        <ps-helper helper-id="helper-245">
          Hyvee will not be in your network staring November 1, 2024, we will
          help you transfer your current prescription to new pharmacy
        </ps-helper>
        <ps-input
          formControlName="firstName"
          ngDefaultControl
          name="firstName"
          input-required="true"
          label="First Name">
        </ps-input>
        <ps-input
          formControlName="lastName"
          ngDefaultControl
          name="lastName"
          input-required="true"
          label="Last Name">
        </ps-input>
        <ps-date-fieldset
        legend="Date of Birth"
      >
        <input slot="month" />
        <input slot="day" />
        <input slot="year" />
      </ps-date-fieldset>
        <ps-input
          formControlName="memberId"
          ngDefaultControl
          name="memberId"
          input-required="true"
          label="Member ID">
        </ps-input>
        <ps-helper helper-id="helper-123"> CMS content </ps-helper>
        <ps-checkbox label="I Agree"></ps-checkbox>
        <div>
          <ps-button
            is-full-width="true"
            size="md"
            submit="true"
            variant="solid"
            [isFullWidth]="layoutFacade.breakpointSmall$ | async"
            (keydown)="handleKeyDown($event)"
            (click)="getMemberInfoAndToken()"
            class="continue-button">
            Continue
          </ps-button>
        </div>
      </form>
    </ng-container>
  </div>
</ng-template>


ts

import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { SpinningLoaderComponent } from '@digital-blocks/angular/core/components';
import { LayoutFacade } from '@digital-blocks/angular/core/store/layout';
import { NavigationService } from '@digital-blocks/angular/core/util/services';
import {
  MemberInfo,
  MemberAuthenticationModule,
  GetMemberInfoAndTokenResponse
} from '@digital-blocks/angular/pharmacy/transfer-prescriptions/store/member-authentication';

import { MemberAuthenticationStore } from './member-authentication.store';

@Component({
  selector: 'lib-member-authentication',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MemberAuthenticationModule,
    SpinningLoaderComponent
  ], // Use FormsModule for template-driven forms
  templateUrl: 'member-authentication.component.html',
  styleUrls: ['member-authentication.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [MemberAuthenticationStore],
  host: { ngSkipHydration: 'true' }
})
export class MemberAuthenticationComponent {
  protected readonly navigationService = inject(NavigationService);
  protected readonly layoutFacade = inject(LayoutFacade);
  public readonly store = inject(MemberAuthenticationStore);
  private fb = inject(FormBuilder);
  public readonly memberTokenResponse$ = this.store.memberTokenResponse$;
  public readonly loading$ = this.store.loading$;
  memberForm: FormGroup;

  constructor() {
    this.memberForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      memberId: ['', Validators.required]
    });
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      this.getMemberInfoAndToken();
      event.preventDefault();
    }
  }

  public getMemberInfoAndToken(): void {
    if (this.memberForm.valid) {
      const patientInfo: MemberInfo = {
        ...this.memberForm.value,
        flowName: 'MEMBER_ID_LOOKUP',
        source: 'CMK'
      };

      this.store.getMemberInfoAndToken(patientInfo);
      this.memberTokenResponse$.subscribe(
        (data: GetMemberInfoAndTokenResponse) => {
          if (data.statusCode === '0000' && data.access_token) {
            sessionStorage.setItem('mTkn', data.access_token);
            this.navigationService.navigate(
              '/pharmacy/-/transfer/current-prescriptions',
              { queryParamsHandling: 'preserve' },
              {
                navigateByPath: true
              }
            );
          }
        }
      );
    }
  }
}
