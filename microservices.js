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
  ngOnInit(): void {}

  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
    }
  }

  public getMemberInfoAndToken(): void {
    const isDateValid = this.isDateValid();
    if (isDateValid) () => this.updateFormWithDate();
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
    const date = `${y}-${m}-${d}`;
    return Boolean(hasAllFields);
  }

  updateFormWithDate(): void {
    const m = this.month.nativeElement.value;
    const d = this.day.nativeElement.value;
    const y = this.year.nativeElement.value;
    const dateOfBirth = `${y}-${m}-${d}`;
    this.memberForm.value.dateOfBirth = dateOfBirth;
  }
}

