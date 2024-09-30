import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ExperienceService } from '@digital-blocks/angular/core/util/services';
import { errorMessage } from '@digital-blocks/core/util/error-handler';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { Observable, firstValueFrom, of, throwError } from 'rxjs';

import { CurrentPrescriptionsService } from '../services/current-prescriptions.service';

import { CurrentPrescriptionsActions } from './current-prescriptions.actions';
import { CurrentPrescriptionsEffects } from './current-prescriptions.effects';
import { getPrescriptionsForTransferResponse } from './mock-data/get-prescriptions-for-transfer-response.mock';

describe('CurrentPrescriptionsEffects', () => {
  let actions$: Observable<any>;
  let effects: CurrentPrescriptionsEffects;
  let service: CurrentPrescriptionsService;
  const mockExperienceService = { post: jest.fn() };
  const errorText = 'No prescription available';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        CurrentPrescriptionsEffects,
        provideMockStore(),
        provideMockActions(() => actions$),
        CurrentPrescriptionsService,
        { provide: ExperienceService, useValue: mockExperienceService }
      ]
    });
    effects = TestBed.inject(CurrentPrescriptionsEffects);
    service = TestBed.inject(CurrentPrescriptionsService);
  });

  describe('getCurrentPrescriptions$', () => {
    it('should return the getCurrentPrescriptionsSuccess action when ngrxOnInitEffects loads prescription data successfully', async () => {
      const mockApiResponse =
        service.constructMemberDetailsFromGetPrescriptionResponse(
          getPrescriptionsForTransferResponse.data.getLinkedMemberPatients
        );
      const expectedAction =
        CurrentPrescriptionsActions.getCurrentPrescriptionsSuccess({
          currentPrescriptions: mockApiResponse
        });

      actions$ = of(CurrentPrescriptionsActions.getCurrentPrescriptions());

      jest
        .spyOn(service, 'getPrescriptionsForTransferExperienceApi')
        .mockReturnValue(of(mockApiResponse));

      expect(await firstValueFrom(effects.getCurrentPrescriptions$)).toEqual(
        expectedAction
      );
    });

    it('should return the getCurrentPrescriptionsFailure action when ngrxOnInitEffects loads prescription data with empty member', async () => {
      actions$ = of(CurrentPrescriptionsActions.getCurrentPrescriptions());

      jest
        .spyOn(service, 'getPrescriptionsForTransferExperienceApi')
        .mockReturnValue(of([]));

      expect(
        await firstValueFrom(effects.getCurrentPrescriptions$)
      ).toMatchObject({
        error: {
          tag: '[CurrentPrescriptionsEffects]',
          message: errorText
        }
      });
    });

    it('should return the getCurrentPrescriptionsFailure action when ngrxOnInitEffects loads get prescription fails', async () => {
      actions$ = of(CurrentPrescriptionsActions.getCurrentPrescriptions());

      jest
        .spyOn(service, 'getPrescriptionsForTransferExperienceApi')
        .mockReturnValue(
          throwError(() => {
            return errorMessage(effects.constructor.name, errorText);
          })
        );

      expect(
        await firstValueFrom(effects.getCurrentPrescriptions$)
      ).toMatchObject({
        error: {
          tag: '[CurrentPrescriptionsEffects]',
          message: errorText
        }
      });
    });
  });
});
