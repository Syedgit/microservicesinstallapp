import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  inject,
  Input,
  Renderer2,
  ViewChild
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
import { NavigationService } from '@digital-blocks/angular/core/util/services';
import { TransferPrescriptionsSubHeaderComponent } from '@digital-blocks/angular/pharmacy/transfer-prescriptions/components';
import {
  MemberInfo,
  MemberAuthenticationModule,
  GetMemberInfoAndTokenResponse
} from '@digital-blocks/angular/pharmacy/transfer-prescriptions/store/member-authentication';

import { Constants } from './member-authentication.constant';
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
    TransferPrescriptionsSubHeaderComponent
  ],
  templateUrl: 'member-authentication.component.html',
  styleUrls: ['member-authentication.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [MemberAuthenticationStore],
  host: { ngSkipHydration: 'true' }
})
export class MemberAuthenticationComponent implements AfterViewInit {
  @ViewChild('month') month!: ElementRef;
  @ViewChild('day') day!: ElementRef;
  @ViewChild('year') year!: ElementRef;
  @Input() public heading = '';
  protected readonly navigationService = inject(NavigationService);
  protected readonly layoutFacade = inject(LayoutFacade);
  public readonly store = inject(MemberAuthenticationStore);
  private fb = inject(FormBuilder);
  public readonly memberTokenResponse$ = this.store.memberTokenResponse$;
  public readonly loading$ = this.store.loading$;
  public hasErrors = false;
  memberForm: FormGroup;

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
      dateOfBirth: [''],
      memberId: ['', [Validators.required]]
    });
  }

  ngAfterViewInit(): void {
    this.addDateFieldListeners();
  }

  public getMemberInfoAndToken(): void {
    const isDateValid = this.isDateValid();

    this.memberForm.markAllAsTouched();
    this.validateFormFields();
    this.updateFormWithDate();
    if (this.memberForm.valid && isDateValid) {
      const patientInfo: MemberInfo = {
        ...this.memberForm.value,
        flowName: 'MEMBER_ID_LOOKUP',
        source: 'CMK'
      };

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
    } else {
      this.hasErrors = true;
    }
  }

  isDateValid() {
    const { day, month, year } = this;
    const m = Number.parseInt(month.nativeElement.value, 10);
    const d = Number.parseInt(day.nativeElement.value, 10);
    const y = Number.parseInt(year.nativeElement.value, 10);
    const isValidMonth = m >= 1 && m <= 12;
    const isValidDay = d >= 1 && d <= 31;
    const isValidYear = y >= 1900 && y <= new Date().getFullYear();

    return isValidMonth && isValidDay && isValidYear;
  }

  updateFormWithDate() {
    const m = this.month.nativeElement.value;
    const d = this.day.nativeElement.value;
    const y = this.year.nativeElement.value;
    const dateOfBirth = `${y}-${m}-${d}`;

    this.memberForm.patchValue({
      dateOfBirth: dateOfBirth
    });

    return dateOfBirth;
  }

  validateFormFields(): void {
    const firstNameControl = this.memberForm.get('firstName');
    const lastNameControl = this.memberForm.get('lastName');
    const memberIdControl = this.memberForm.get('memberId');

    if (firstNameControl?.hasError('required') && firstNameControl.touched) {
      this.formErrors['firstName'] = Constants.F_NAME_ERROR;
    } else if (
      firstNameControl?.hasError('pattern') &&
      firstNameControl.touched
    ) {
      this.formErrors['firstName'] = Constants.F_NAME_PTRN;
    }
    if (lastNameControl?.hasError('required') && lastNameControl.touched) {
      this.formErrors['lastName'] = Constants.L_NAME_ERROR;
    } else if (
      lastNameControl?.hasError('pattern') &&
      lastNameControl.touched
    ) {
      this.formErrors['lastName'] = Constants.L_NAME_PTRN;
    }

    // Check member ID
    if (memberIdControl?.hasError('required') && memberIdControl.touched) {
      this.formErrors['memberId'] = Constants.MEM_ID_ERROR;
    }

    this.validateDateField();
  }

  validateDateField(): void {
    const isValidDate = this.isDateValid();

    this.formErrors['dateOfBirth'] = isValidDate ? '' : Constants.DOB_ERROR;
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
    }
  }

  addDateFieldListeners(): void {
    this.rendered.listen(this.month.nativeElement, 'input', () =>
      this.validateDateField()
    );
    this.rendered.listen(this.day.nativeElement, 'input', () =>
      this.validateDateField()
    );
    this.rendered.listen(this.year.nativeElement, 'input', () =>
      this.validateDateField()
    );
  }
}
