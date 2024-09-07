component.ts
import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
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
  ],
  templateUrl: 'member-authentication.component.html',
  styleUrls: ['member-authentication.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [MemberAuthenticationStore],
  host: { ngSkipHydration: 'true' }
})
export class MemberAuthenticationComponent implements OnInit {
  @ViewChild('month') month!: ElementRef;
  @ViewChild('day') day!: ElementRef;
  @ViewChild('year') year!: ElementRef;
  error: boolean;
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
    this.error = false;
  }
  ngOnInit(): void {}

  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      this.getMemberInfoAndToken();
      event.preventDefault();
    }
  }
  handleButtonClick() {
    const isValid = this.isDateValid();
    this.error = !isValid;
    if (isValid) {
      console.log('Date is valid!');
    }
  }
  
  public getMemberInfoAndToken(): void {
    if (this.memberForm.valid) {
      const patientInfo: MemberInfo = this.constructBackendReq();
      this.store.getMemberInfoAndToken(patientInfo);
      this.memberTokenResponse$.subscribe(
        (data: GetMemberInfoAndTokenResponse) => {
          if (data.statusCode === '0000' && data.access_token) {
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

  private constructBackendReq() {
    const patientInfo: MemberInfo = {
      ...this.memberForm.value,
      flowName: 'MEMBER_ID_LOOKUP',
      source: 'CMK'
    };

    return patientInfo;
  }

  isDateValid() {
    const { month, day, year } = this;
    const m = parseInt(month.nativeElement.value, 10);
    const d = parseInt(day.nativeElement.value, 10);
    const y = parseInt(year.nativeElement.value, 10);
    const hasAllFields = m && d && y;
    const date = new Date(`${m}/${d}/${y}`);
    const isValid =
      !isNaN(date as any) &&
      date.getMonth() + 1 === m &&
      date.getDate() === d &&
      date.getFullYear() === y;

    return Boolean(hasAllFields && isValid);
  }
}

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
          <h3>Transfer your HyVee prescriptions to an in-network pharmacy</h3>
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
          is-dob
          >
          <input
            slot="month"
            #month
          />
          <input
            slot="day"
            #day
          />
          <input
            slot="year"
            #year
          />
          <ul
            *ngIf="error"
            slot="error"
          >
    <li>Please add a valid month</li>
    <li>Please add a valid day</li>
    <li>Please add a valid year</li>
  </ul>
</ps-date-fieldset>
        <!-- <ps-input
          formControlName="dateOfBirth"
          ngDefaultControl
          name="dateOfBirth"
          input-required="true"
          label="Date Of Birth"></ps-input> -->
        <ps-input
          formControlName="memberId"
          ngDefaultControl
          name="memberId"
          input-required="true"
          label="Member ID">
        </ps-input>
        <div>
          <ps-button
            is-full-width="true"
            size="md"
            submit="true"
            variant="solid"
            [isFullWidth]="layoutFacade.breakpointSmall$ | async"
            (keydown)="handleKeyDown($event)"
            (click)="handleButtonClick()"
            class="continue-button">
            Continue
          </ps-button>
        </div>
      </form>
    </ng-container>
  </div>
</ng-template>
