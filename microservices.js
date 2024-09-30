import { TestBed } from '@angular/core/testing';
import { Actions } from '@ngrx/effects';
import { provideMockActions } from '@ngrx/effects/testing';
import { of, throwError } from 'rxjs';

import { PrescriptionsListService } from '../services';

import { PrescriptionsListActions } from './prescriptions-list.actions';
import { PrescriptionsListEffects } from './prescriptions-list.effects';
import { ReportableError } from '@digital-blocks/core/util/error-handler';

describe('PrescriptionsListEffects', () => {
  let actions$: Actions;
  let effects: PrescriptionsListEffects;
  let prescriptionsListService: PrescriptionsListService;

  const mockError: ReportableError = {
    message: 'Transfer failed',
    tag: 'PrescriptionsList',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PrescriptionsListEffects,
        provideMockActions(() => actions$),
        {
          provide: PrescriptionsListService,
          useValue: {
            submitTransfer: jest.fn()
          }
        }
      ]
    });

    effects = TestBed.inject(PrescriptionsListEffects);
    prescriptionsListService = TestBed.inject(PrescriptionsListService);
  });

  describe('submitTransfer$', () => {
    it('should return submitTransferFailure action on failed transfer', (done) => {
      // Mocking the action stream
      actions$ = of(PrescriptionsListActions.submitTransfer({ request: {} }));

      // Mock the service to throw an error
      (prescriptionsListService.submitTransfer as jest.Mock).mockReturnValue(throwError(() => mockError));

      // Subscribe to the effect
      effects.submitTransfer$.subscribe({
        next: (action) => {
          // Expect a failure action
          expect(action).toEqual(
            PrescriptionsListActions.submitTransferFailure({ error: mockError })
          );
          done(); // Signal the test is done
        },
        error: (error) => {
          done.fail(error); // In case of error, fail the test
        }
      });
    });
  });
});
