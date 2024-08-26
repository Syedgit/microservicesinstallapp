import { inject, Injectable } from '@angular/core';
import { errorMessage } from '@digital-blocks/core/util/error-handler';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, map, of, switchMap } from 'rxjs';

import { MemberAuthenticationService } from '../services/member-authentication.service';

import { MemberAuthenticationActions } from './member-authentication.actions';
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
            map((memberTokenResponse) => {
              return MemberAuthenticationActions.getMemberInfoAndTokenSuccess({
                memberTokenResponse
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
