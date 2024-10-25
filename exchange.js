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
import { filter, Observable, of, switchMap } from 'rxjs';

import { AdobeTaggingConstants, Constants } from './member-authentication.constant';
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
  public errors = Constants;
  public backendErr = false;
  memberForm: FormGroup;
  public eventCalled = 'initial';

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
    this.store.logMemberAuthPageView(
      AdobeTaggingConstants.MEMBER_AUTH_PAGE_LOAD
    );
  }

  public getMemberInfoAndToken(): void {
    this.validateDate();
    this.validateFormFields();
    this.formatDate();
  
    if (this.memberForm.valid && this.formErrors['dateOfBirth'] === '') {
      this.store.resetAllStateValues();
      this.deleteCookie();
  
      const patientInfo: MemberInfo = {
        firstName: this.memberForm.get('firstName')!.value,
        lastName: this.memberForm.get('lastName')!.value,
        memberId: this.memberForm.get('memberId')!.value,
        dateOfBirth: this.memberForm.get('dateOfBirth')!.value,
        flowName: 'MEMBER_ID_LOOKUP',
        source: 'CMK'
      };
      this.store.getMemberInfoAndToken(patientInfo);
      this.store.memberTokenResponse$
        .pipe(
          filter((data: GetMemberInfoAndTokenResponse) => !!data && !!data.statusCode),
          switchMap((data: GetMemberInfoAndTokenResponse) => {
            if (data.statusCode === '0000' && data.access_token) {
              this.navigationService.navigate(
                '/pharmacy/benefits/transfer/current-prescriptions',
                { queryParamsHandling: 'preserve' },
                {
                  navigateByPath: true
                }
              );
              this.store.saveMemberInfoRehydrate(['patientInfo']);
              this.store.logMemberAuthLink(
                AdobeTaggingConstants.ONCLICK_CONTINUE.link_name,
                AdobeTaggingConstants.ONCLICK_CONTINUE.details
              );
            } else {
              const tagData = AdobeTaggingConstants.VALIDATION_ERROR;
              this.store.logMemberAuthLink(tagData.link_name, {
                field_errors: tagData.details.field_error,
                error_messages: '1'
              });
              this.backendErr = true;
              this.hasErrors = true;
            }
            return of(null);
          })
        )
        .subscribe();
    } else {
      this.hasErrors = true;
    }
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
    this.formErrors['dateOfBirth'] = this.isDateValid();

    this.formErrors['firstName'] = this.memberForm
      .get('firstName')!
      .hasError('required')
      ? Constants.F_NAME_ERROR
      : this.patternTernary();

    this.formErrors['lastName'] = this.memberForm
      .get('lastName')!
      .hasError('required')
      ? Constants.L_NAME_ERROR
      : this.patternTernary();

    this.formErrors['memberId'] = this.memberForm
      .get('memberId')!
      .hasError('required')
      ? Constants.MEM_ID_ERROR
      : '';
  }

  patternTernary(): string {
    return this.memberForm.get('firstName')!.hasError('pattern')
      ? Constants.F_NAME_PTRN
      : '';
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

    // creating date our of the year, month day
    // 2/29/2023 turn into Mar 01 2023 so date.getDate() == d is false ( 01 != 29 )
    // +num -> returns the numeric value of the string, or NaN if the string isn't purely numeric characters
    // month goes from 0-11 instead of 1-12
    const date = new Date(y, m - 1, d);

    //validates leapyear and dates exceeding month
    if (
      Number.isNaN(date.getDate()) ||
      y < 1000 ||
      this.memberForm.get('month')!.value == '' ||
      this.memberForm.get('day')!.value == '' ||
      this.memberForm.get('year')!.value == ''
    )
      return Constants.DOB_PTRN_ERROR;
    else if (
      // date not valid
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

  deleteCookie(): void {
    const cookieName = 'access_token';
    const possiblePaths = ['/api/oauth2/v2', '/'];

    if (typeof document === 'undefined') {
      return;
    }
    for (const path of possiblePaths) {
      // eslint-disable-next-line unicorn/no-document-cookie -- Necessary for testing
      document.cookie = `${cookieName}=; Path=${path}; Expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
    }
  }
}
