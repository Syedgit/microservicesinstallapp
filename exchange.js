<!-- eslint-disable @angular-eslint/template/no-call-expression -->
<ng-container>
  <ng-container *ngIf="loading$ | async; else memberAuthTemplate">
    <ps-tile>
      <util-spinning-loader [loading]="loading$ | async"></util-spinning-loader>
    </ps-tile>
  </ng-container>

  <ng-template #memberAuthTemplate>
    <ng-container>
      <div class="member-container">
         <ps-alert-bar *ngIf="(error$ | async) && !hasErrors">
          <h2 slot="heading">
            {{ backendError.heading }}
          </h2>
          <p>{{ backendError.description }}</p>
        </ps-alert-bar>
        <ps-alert-bar *ngIf="hasErrors && !(error$ | async)">
          <h2 slot="heading">
            {{ genericError.heading }}
          </h2>
          <p>{{ genericError.description }}</p>
        </ps-alert-bar>
        <div class="sub-header-content">
          <lib-transfer-prescriptions-sub-header
            [isCmsHeading]="true"
            [heading]="
              (store.cmsSpotContents$ | async)?.TransferRxIntroSpot ?? ''
            "></lib-transfer-prescriptions-sub-header>
        </div>
        <p>All fields required.</p>
        <ng-container>
          <form [formGroup]="memberForm">
            <ps-input
              label="First Name"
              [error]="
                getError('first') == '' ? undefined : formErrors['firstName']
              ">
              <input
                formControlName="firstName"
                ngDefaultControl
                slot="input"
                required
                is-error-announced="true" />
            </ps-input>
            <ps-input
              label="Last Name"
              [error]="
                getError('last') == '' ? undefined : formErrors['lastName']
              ">
              <input
                formControlName="lastName"
                ngDefaultControl
                input-required="true"
                slot="input"
                is-error-announced="true" />
            </ps-input>
            <ps-date-fieldset
              legend="Date of Birth"
              is-dob
              [error]="getError('dob')">
              <!-- eslint-disable-next-line -- custom inputs are needed -->
              <input slot="month" formControlName="month" ngDefaultControl />
              <!-- eslint-disable-next-line -- custom inputs are needed -->
              <input slot="day" formControlName="day" ngDefaultControl />
              <!-- eslint-disable-next-line -- custom inputs are needed -->
              <input slot="year" formControlName="year" ngDefaultControl />
            </ps-date-fieldset>
            <ps-input
              label="Member ID"
              [error]="hasErrors ? getError('memberId') : undefined">
              <input
                formControlName="memberId"
                ngDefaultControl
                name="memberId"
                slot="input"
                input-required="true"
                is-error-announced="true" />
            </ps-input>
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
    </ng-container>
  </ng-template>
</ng-container>


component.ts


/* eslint-disable @typescript-eslint/no-non-null-assertion -- memberForm.get('var') should always be initialized*/
/* eslint-disable ternary/nesting -- error for validate form fields*/
import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  Input,
  OnInit,
  Renderer2
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { SpinningLoaderComponent } from '@digital-blocks/angular/core/components';
import { LayoutFacade } from '@digital-blocks/angular/core/store/layout';
import { RehydrateFacade } from '@digital-blocks/angular/core/store/rehydrate';
import { NavigationService } from '@digital-blocks/angular/core/util/services';
import { SanitizeHtmlPipe } from '@digital-blocks/angular/pharmacy/shared/util/pipe';
import { TransferPrescriptionsSubHeaderComponent } from '@digital-blocks/angular/pharmacy/transfer-prescriptions/components';
import {
  MemberInfo,
  MemberAuthenticationModule,
  GetMemberInfoAndTokenResponse
} from '@digital-blocks/angular/pharmacy/transfer-prescriptions/store/member-authentication';
import { ITransferPrescriptionCmsContents } from '@digital-blocks/angular/pharmacy/transfer-prescriptions/store/transfer-prescriptions';
import { Observable, timer } from 'rxjs';

import {
  AdobeTaggingConstants,
  Constants
} from './member-authentication.constant';
import { MemberAuthenticationStore } from './member-authentication.store';

@Component({
  selector: 'lib-member-authentication',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MemberAuthenticationModule,
    SpinningLoaderComponent,
    TransferPrescriptionsSubHeaderComponent,
    SanitizeHtmlPipe
  ],
  templateUrl: 'member-authentication.component.html',
  styleUrls: ['member-authentication.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [MemberAuthenticationStore],
  host: { ngSkipHydration: 'true' }
})
export class MemberAuthenticationComponent implements OnInit {
  @Input() public heading = '';
  @Input() public genericError = {
    heading: '',
    description: ''
  };
  @Input() public backendError = {
    heading: '',
    description: ''
  };
  protected readonly navigationService = inject(NavigationService);
  protected readonly layoutFacade = inject(LayoutFacade);
  public readonly store = inject(MemberAuthenticationStore);
  private readonly rehydrateFacade = inject(RehydrateFacade);
  private fb = inject(FormBuilder);
  public readonly memberTokenResponse$ = this.store.memberTokenResponse$;
  public readonly loading$ = this.store.loading$;
  public content: ITransferPrescriptionCmsContents | undefined;
  public readonly error$: Observable<unknown> = this.store.error$;
  public hasErrors = false;
  public clickedContinue = false;
  public errors = Constants;
  public backendErr = false;
  memberForm: FormGroup;
  public eventCalled = 'initial';
  public taggingErrors = '';

  public formErrors: { [key: string]: string } = {
    firstName: '',
    lastName: '',
    memberId: '',
    dateOfBirth: ''
  };

  constructor(private rendered: Renderer2) {
    this.memberForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.pattern('^[a-zA-Z]+$')]],
      lastName: ['', [Validators.required, Validators.pattern('^[a-zA-Z]+$')]],
      month: [''],
      day: [''],
      year: [''],
      dateOfBirth: [''],
      memberId: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.rehydrateFacade.rehydrated$.subscribe({
      next: (rehydrated) => {
        if (!rehydrated) {
          this.store.saveMemberInfoRehydrate([]);
        }
      }
    });
  }

  public getMemberInfoAndToken(): void {
    this.validateFormFields();
    this.formatDate();
    if (this.memberForm.valid && this.formErrors['dateOfBirth'] == '') {
      this.store.resetAllStateValues();
      const patientInfo: MemberInfo = {
        firstName: this.memberForm.get('firstName')!.value,
        lastName: this.memberForm.get('lastName')!.value,
        memberId: this.memberForm.get('memberId')!.value,
        dateOfBirth: this.memberForm.get('dateOfBirth')!.value,
        flowName: 'MEMBER_ID_LOOKUP',
        source: 'CMK'
      };

      this.store.getMemberInfoAndToken(patientInfo);
      this.memberTokenResponse$.subscribe(
        (data: GetMemberInfoAndTokenResponse) => {
          if (data.statusCode === '0000' && data.access_token) {
            this.navigationService.navigate(
              '/pharmacy/benefits/transfer/current-prescriptions',
              { queryParamsHandling: 'preserve' },
              {
                navigateByPath: true
              }
            );
            this.timerForSetLoader();
            this.store.saveMemberInfoRehydrate(['patientInfo']);
            this.tagLogging(
              AdobeTaggingConstants.ONCLICK_CONTINUE.link_name,
              AdobeTaggingConstants.ONCLICK_CONTINUE.details
            );
          } else if (data.statusCode !== '0000') {
            const tagData = AdobeTaggingConstants.VALIDATION_ERROR;

            this.tagLogging(tagData.link_name, {
              field_errors: 'member not found:please try again'
            });
          }
        }
      );
    } else {
      this.hasErrors = true;
    }
  }

  timerForSetLoader() {
    timer(2000).subscribe(() => {
      this.store.setLoader();
    });
  }

  formatDate() {
    const m = this.memberForm.get('month')!.value;
    const d = this.memberForm.get('day')!.value;
    const y = this.memberForm.get('year')!.value;
    const dateOfBirth = `${y}-${m}-${d}`;

    this.memberForm.patchValue({
      dateOfBirth: dateOfBirth
    });

    return dateOfBirth;
  }

  validateFormFields(): void {
    this.clickedContinue = true;
    this.taggingErrors = '';

    this.formErrors['firstName'] = this.getError('first');

    this.formErrors['lastName'] = this.getError('last');

    this.formErrors['dateOfBirth'] = this.getError('dob');

    this.formErrors['memberId'] = this.getError('memberId');

    this.clickedContinue = false;

    this.tagLogging(AdobeTaggingConstants.ONCLICK_CONTINUE.link_name, {
      field_errors: 'l1=' + this.taggingErrors.slice(0, -1),
      error_messages: '500'
    });
  }

  tagLogging(linkName: string, data: Record<string, string>): void {
    this.store.logMemberAuthLink(linkName, data);
  }

  getError(field: string): string {
    let message;

    switch (field) {
      case 'first': {
        return this.firstNameError();
      }
      case 'last': {
        return this.lastNameError();
      }
      case 'dob': {
        if (this.clickedContinue)
          this.formErrors['dateOfBirth'] = this.isDateValid();
        else this.validateDate();

        if (this.formErrors['dateOfBirth'] != '')
          this.taggingErrors += this.formErrors['dateOfBirth'] + '|';

        return this.formErrors['dateOfBirth'];
      }
      case 'memberId': {
        if (!this.memberForm.controls['memberId'].valid)
          message = Constants.MEM_ID_ERROR;
        else if (this.backendErr) {
          message = Constants.MEM_ID_BACKEND_ERR;
        } else message = '';

        this.formErrors['memberId'] = message;
        if (message != '') this.taggingErrors += message + '|';

        return message;
      }
      default: {
        return 'This is default case. Choose an option';
      }
    }
  }

  firstNameError(): string {
    let message;

    if (this.hasErrors || this.clickedContinue) {
      if (this.memberForm.get('firstName')!.hasError('pattern'))
        message = Constants.F_NAME_PTRN;
      else if (this.memberForm.get('firstName')!.hasError('required'))
        message = Constants.F_NAME_ERROR;
      else message = '';
    } else {
      message = this.memberForm.get('firstName')!.hasError('pattern')
        ? Constants.F_NAME_PTRN
        : '';
    }

    this.formErrors['firstName'] = message;
    if (message == Constants.F_NAME_PTRN)
      this.taggingErrors += 'first name' + ':';
    if (message != '') this.taggingErrors += message + '|';

    return message;
  }

  lastNameError(): string {
    let message;

    if (this.hasErrors || this.clickedContinue) {
      if (this.memberForm.get('lastName')!.hasError('pattern'))
        message = Constants.L_NAME_PTRN;
      else if (this.memberForm.get('lastName')!.hasError('required'))
        message = Constants.L_NAME_ERROR;
      else message = '';
    } else {
      message = this.memberForm.get('lastName')!.hasError('pattern')
        ? Constants.L_NAME_PTRN
        : '';
    }

    this.formErrors['lastName'] = message;
    if (message == Constants.L_NAME_PTRN)
      this.taggingErrors += 'last name' + ':';
    if (message != '') this.taggingErrors += message + '|';

    return message;
  }

  validateDate(): boolean {
    if (
      this.hasErrors ||
      (this.memberForm.get('month')!.value != '' &&
        this.memberForm.get('day')!.value != '' &&
        this.memberForm.get('year')!.value != '')
    )
      this.formErrors['dateOfBirth'] = this.isDateValid();

    return this.formErrors['dateOfBirth'] != '';
  }

  isDateValid() {
    const m = +this.memberForm.get('month')!.value;
    const d = +this.memberForm.get('day')!.value;
    const y = +this.memberForm.get('year')!.value;
    const date = new Date(y, m - 1, d);

    if (
      Number.isNaN(date.getDate()) ||
      y < 1000 ||
      this.memberForm.get('month')!.value == '' ||
      this.memberForm.get('day')!.value == '' ||
      this.memberForm.get('year')!.value == ''
    )
      return Constants.DOB_PTRN_ERROR;
    else if (
      !date ||
      date.getDate() != d ||
      date.getMonth() != m - 1 ||
      y < 1800 ||
      new Date().getFullYear() < y
    )
      return Constants.DOB_INVALID_ERROR;
    else return '';
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
    }
  }
}
