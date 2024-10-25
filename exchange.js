import { inject, Injectable } from '@angular/core';
import { errorMessage } from '@digital-blocks/angular/core/util/error-handler';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { NavigationService } from '@digital-blocks/angular/core/util/services';

import { MemberAuthenticationService } from '../services/member-authentication.service';
import { MemberAuthenticationActions } from './member-authentication.actions';
import { GetMemberInfoAndTokenResponse } from './member-authentication.interfaces';
import { MemberAuthenticationState } from './member-authentication.reducer';
import { AdobeTaggingConstants } from '../../constants';

@Injectable()
export class MemberAuthenticationEffects {
  private readonly actions$ = inject(Actions);
  private readonly memberAuthService = inject(MemberAuthenticationService);
  private readonly store = inject(Store<MemberAuthenticationState>);
  private readonly navigationService = inject(NavigationService);
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

  // Effect to handle navigation, rehydration, and logging on success
  public handleNavigationOnSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(MemberAuthenticationActions.getMemberInfoAndTokenSuccess),
        tap(() => {
          // Navigate to the next page
          this.navigationService.navigate(
            '/pharmacy/benefits/transfer/current-prescriptions',
            { queryParamsHandling: 'preserve' },
            { navigateByPath: true }
          );

          // Save member info and log the authentication action
          this.store.dispatch(
            MemberAuthenticationActions.saveMemberInfoRehydrate({
              rehydrate: ['patientInfo']
            })
          );
          this.store.dispatch(
            MemberAuthenticationActions.logMemberAuthLink({
              linkName: AdobeTaggingConstants.ONCLICK_CONTINUE.link_name,
              details: AdobeTaggingConstants.ONCLICK_CONTINUE.details
            })
          );
        })
      ),
    { dispatch: false }
  );

  // Handle failure case by logging the error
  public handleAuthFailure$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(MemberAuthenticationActions.getMemberInfoAndTokenFailure),
        tap(() => {
          const tagData = AdobeTaggingConstants.VALIDATION_ERROR;
          this.store.dispatch(
            MemberAuthenticationActions.logMemberAuthLink({
              linkName: tagData.link_name,
              details: {
                field_errors: tagData.details.field_error,
                error_messages: '1'
              }
            })
          );
        })
      ),
    { dispatch: false }
  );
}
