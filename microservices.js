import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  inject,
  Input,
  OnInit,
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
import { RehydrateFacade } from '@digital-blocks/angular/core/store/rehydrate';

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
export class MemberAuthenticationComponent implements AfterViewInit, OnInit {
  @ViewChild('month') month!: ElementRef;
  @ViewChild('day') day!: ElementRef;
  @ViewChild('year') year!: ElementRef;
  @Input() public heading = '';
  protected readonly navigationService = inject(NavigationService);
  protected readonly layoutFacade = inject(LayoutFacade);
  public readonly store = inject(MemberAuthenticationStore);
  private readonly rehydrateFacade = inject(RehydrateFacade);
  private fb = inject(FormBuilder);
  public readonly memberTokenResponse$ = this.store.memberTokenResponse$;
  public readonly loading$ = this.store.loading$;
  public hasErrors: boolean = false;
  public errors = Constants;
  public backendErr: boolean = false;
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
    const isDateValid = this.isDateValid();
    this.validateFormFields();
    this.formatDate();
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
            this.store.saveMemberInfoRehydrate([
              'patientInfo'
            ]);
            this.navigationService.navigate(
              '/pharmacy/-/transfer/current-prescriptions',
              { queryParamsHandling: 'preserve' },
              {
                navigateByPath: true
              }
            );
          } else if (data.statusCode !== '0000') {
            this.backendErr = true;
          }
        }
      );
    } else {
      this.hasErrors = true;
    }
  }

  formatDate() {
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
    const isValidDate = this.isDateValid();

    this.formErrors['dateOfBirth'] = isValidDate ? '' : Constants.DOB_ERROR;
  }


  addDateFieldListeners(): void {
    this.rendered.listen(this.month.nativeElement, 'input', () =>
      this.validateFormFields()
    );
    this.rendered.listen(this.day.nativeElement, 'input', () =>
      this.validateFormFields()
    );
    this.rendered.listen(this.year.nativeElement, 'input', () =>
      this.validateFormFields()
    );
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

  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
    }
  }
}
