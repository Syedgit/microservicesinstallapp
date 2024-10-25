<!-- eslint-disable @angular-eslint/template/no-call-expression -->
<ng-container *ngIf="loading$ | async; else memberAuthTemplate">
  <ps-tile>
    <util-spinning-loader [loading]="loading$ | async"></util-spinning-loader>
  </ps-tile>
</ng-container>

<ng-template #memberAuthTemplate>
  <div class="member-container">
    @if (hasErrors) {
      <ps-alert-bar class="alert-banner">
        <ps-label>Required Information is missing</ps-label>
        <p>Please complete all fields.</p>
      </ps-alert-bar>
    }
    <div class="sub-header-content">
      <lib-transfer-prescriptions-sub-header
        [isCmsHeading]="true"
        [heading]="
          (store.cmsSpotContents$ | async)?.TransferRxIntroHyveeSpot ?? ''
        "></lib-transfer-prescriptions-sub-header>
    </div>
    <p>All fields required.</p>
    <ng-container>
      <form [formGroup]="memberForm">
        <ps-input
          label="First Name"
          [error]="
            hasErrors
              ? memberForm.get('firstName')?.hasError('pattern')
                ? errors.F_NAME_PTRN
                : memberForm.get('firstName')?.hasError('required')
                  ? errors.F_NAME_ERROR
                  : undefined
              : memberForm.get('firstName')?.hasError('pattern')
                ? errors.F_NAME_PTRN
                : undefined
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
            hasErrors
              ? memberForm.get('lastName')?.hasError('pattern')
                ? errors.L_NAME_PTRN
                : memberForm.get('lastName')?.hasError('required')
                  ? errors.L_NAME_ERROR
                  : undefined
              : memberForm.get('lastName')?.hasError('pattern')
                ? errors.L_NAME_PTRN
                : undefined
          ">
          <input
            formControlName="lastName"
            ngDefaultControl
            input-required="true"
            slot="input"
            is-error-announced="true" />
        </ps-input>
        <ps-date-fieldset legend="Date of Birth" is-dob>
          <!-- eslint-disable-next-line -- custom inputs are needed -->
          <input slot="month" formControlName="month" ngDefaultControl />
          <!-- eslint-disable-next-line -- custom inputs are needed -->
          <input slot="day" formControlName="day" ngDefaultControl />
          <!-- eslint-disable-next-line -- custom inputs are needed -->
          <input slot="year" formControlName="year" ngDefaultControl />
          <ul *ngIf="validateDate()" slot="error">
            <li>{{ formErrors['dateOfBirth'] }}</li>
          </ul>
        </ps-date-fieldset>
        <ps-input
          label="Member ID"
          [error]="
            hasErrors && !memberForm.controls['memberId'].valid
              ? errors.MEM_ID_ERROR
              : backendErr
                ? errors.MEM_ID_BACKEND_ERR
                : undefined
          ">
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
</ng-template>



import { RehydrateState } from '@digital-blocks/angular/core/store/rehydrate';
import { ReportableError } from '@digital-blocks/angular/core/util/error-handler';
import { ActionReducer, createFeature, createReducer, on } from '@ngrx/store';

import { MemberAuthenticationActions } from './member-authentication.actions';
import {
  GetMemberInfoAndTokenResponse,
  MemberInfo
} from './member-authentication.interfaces';

export interface MemberAuthenticationState extends RehydrateState {
  memberTokenResponse: GetMemberInfoAndTokenResponse;
  loading: boolean;
  error: ReportableError | undefined;
  patientInfo: MemberInfo;
}

export const initialState: MemberAuthenticationState = {
  memberTokenResponse: {
    statusCode: '',
    statusDescription: '',
    token_type: '',
    access_token: ''
  },
  loading: false,
  error: undefined,
  patientInfo: {
    memberId: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    flowName: '',
    source: ''
  },
  rehydrate: ['patientInfo']
};

export const MEMBER_AUTHENTICATION_FEATURE_KEY = 'member-authentication';

export const reducer: ActionReducer<MemberAuthenticationState> = createReducer(
  initialState,
  on(MemberAuthenticationActions.getMemberInfoAndToken, (state) => ({
    ...state,
    loading: true,
    error: undefined
  })),
  on(
    MemberAuthenticationActions.getMemberInfoAndTokenSuccess,
    (state, { memberTokenResponse }) => ({
      ...state,
      memberTokenResponse,
      loading: false,
      error: undefined
    })
  ),
  on(
    MemberAuthenticationActions.getMemberInfoAndTokenFailure,
    (state, { error }) => ({
      ...state,
      loading: false,
      error
    })
  ),
  on(
    MemberAuthenticationActions.saveMemberInfoRehydrateValue,
    (state, { rehydrate }) => ({
      ...state,
      rehydrate
    })
  ),
  on(MemberAuthenticationActions.resetMemberAuthenticationState, (state) => ({
    ...state,
    ...initialState
  }))
);

export const MemberAuthenticationFeature = createFeature({
  name: MEMBER_AUTHENTICATION_FEATURE_KEY,
  reducer
});


effects


import { inject, Injectable } from '@angular/core';
import { errorMessage } from '@digital-blocks/angular/core/util/error-handler';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, map, of, switchMap } from 'rxjs';

import { MemberAuthenticationService } from '../services/member-authentication.service';

import { MemberAuthenticationActions } from './member-authentication.actions';
import { GetMemberInfoAndTokenResponse } from './member-authentication.interfaces';
import { MemberAuthenticationState } from './member-authentication.reducer';

@Injectable()
export class MemberAuthenticationEffects {
  private readonly actions$ = inject(Actions);
  private readonly memberAuthService = inject(MemberAuthenticationService);
  private readonly store = inject(Store<MemberAuthenticationState>);
  private readonly errorTag = 'MemberAuthenticationEffects';

  public getMemberInfoAndToken$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MemberAuthenticationActions.getMemberInfoAndToken),
      switchMap(({ request, useTransferSecret }) => {
        return this.memberAuthService
          .getMemberInfoAndToken(request, useTransferSecret)
          .pipe(
            map((response) => {
              const memberTokenResponse: GetMemberInfoAndTokenResponse =
                response;

              return response?.statusCode === '0000'
                ? MemberAuthenticationActions.getMemberInfoAndTokenSuccess({
                    memberTokenResponse
                  })
                : MemberAuthenticationActions.getMemberInfoAndTokenFailure({
                    error: errorMessage(
                      this.errorTag,
                      'B2B Member Authentication API failed'
                    )
                  });
            }),
            catchError((error: unknown) => {
              return of(
                MemberAuthenticationActions.getMemberInfoAndTokenFailure({
                  error: errorMessage(this.errorTag, error)
                })
              );
            })
          );
      })
    );
  });
}
