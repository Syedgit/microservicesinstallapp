import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ExperienceService } from '@digital-blocks/angular/core/util/services';
import { of } from 'rxjs';

import { getPrescriptionsForTransferResponse } from '../+state/mock-data/get-prescriptions-for-transfer-response.mock';

import { CurrentPrescriptionsService } from './current-prescriptions.service';

describe(CurrentPrescriptionsService.name, () => {
  let service: CurrentPrescriptionsService;
  const mockExperienceService = { post: jest.fn() };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        CurrentPrescriptionsService,
        { provide: ExperienceService, useValue: mockExperienceService }
      ]
    });
    service = TestBed.inject(CurrentPrescriptionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should execute the getPrescriptionsForTransferExperienceApi method', () => {
    mockExperienceService.post.mockReturnValue(
      of(getPrescriptionsForTransferResponse)
    );

    service.getPrescriptionsForTransferExperienceApi().subscribe((response) => {
      const updatedPrescriptionData =
        service.constructMemberDetailsFromGetPrescriptionResponse(
          getPrescriptionsForTransferResponse?.data?.getLinkedMemberPatients
        );

      expect(response).toEqual(updatedPrescriptionData);
    });
  });

  it('should execute the getPrescriptionsForTransferExperienceApi method and response has no member info', () => {
    const prescriptionResponseWithoutMemberDetails: any = {
      ...getPrescriptionsForTransferResponse,
      data: {
        ...getPrescriptionsForTransferResponse.data,
        getLinkedMemberPatients: null
      }
    };

    mockExperienceService.post.mockReturnValue(
      of(prescriptionResponseWithoutMemberDetails)
    );

    service.getPrescriptionsForTransferExperienceApi().subscribe((response) => {
      expect(response).toEqual([]);
    });
  });

  it('should add custom parameter with prescription data', () => {
    const memberPrescriptions = service.addCustomPrameterToPrescriptionObject(
      getPrescriptionsForTransferResponse.data.getLinkedMemberPatients[0]
        .patient.prescriptionforPatient
    );

    expect(memberPrescriptions[0]).toHaveProperty('isSelected', false);
  });

  it('should return with empty array for no memberDetails', () => {
    const memberDetails =
      service.constructMemberDetailsFromGetPrescriptionResponse([]);

    expect(memberDetails).toEqual([]);
  });

  it('should return with no memberDetails', () => {
    const memberDetails =
      service.constructMemberDetailsFromGetPrescriptionResponse(null);

    expect(memberDetails).toEqual([]);
  });

  it('should return with transformed member detail array when passed memberDetails', () => {
    const memberDetails =
      service.constructMemberDetailsFromGetPrescriptionResponse(
        getPrescriptionsForTransferResponse.data.getLinkedMemberPatients
      );

    for (const memberData of memberDetails) {
      expect(memberData).toHaveProperty('id');
      expect(memberData).toHaveProperty('firstName');
      expect(memberData).toHaveProperty('lastName');
      expect(memberData).toHaveProperty('personCode');
      expect(memberData).toHaveProperty('prescriptionforPatient');
    }
  });
  it('should return with transformed member detail array when passed memberDetails - with no id', () => {
    const prescriptionResponseWithoutMemberDetails: any = {
      ...getPrescriptionsForTransferResponse,
      data: {
        ...getPrescriptionsForTransferResponse.data,
        getLinkedMemberPatients:
          getPrescriptionsForTransferResponse.data.getLinkedMemberPatients.map(
            () => ({})
          )
      }
    };
    const memberDetails =
      service.constructMemberDetailsFromGetPrescriptionResponse(
        prescriptionResponseWithoutMemberDetails.data.getLinkedMemberPatients
      );

    for (const memberData of memberDetails) {
      expect(memberData).toHaveProperty('id', undefined);
      expect(memberData).toHaveProperty('firstName', undefined);
      expect(memberData).toHaveProperty('lastName', undefined);
      expect(memberData).toHaveProperty('personCode', undefined);
      expect(memberData).toHaveProperty('prescriptionforPatient', undefined);
    }
  });
  it('should return with transformed member detail array when passed memberDetails - with null', () => {
    const prescriptionResponseWithoutMemberDetails: any = {
      ...getPrescriptionsForTransferResponse,
      data: {
        ...getPrescriptionsForTransferResponse.data,
        getLinkedMemberPatients:
          getPrescriptionsForTransferResponse.data.getLinkedMemberPatients.map(
            () => null
          )
      }
    };
    const memberDetails =
      service.constructMemberDetailsFromGetPrescriptionResponse(
        prescriptionResponseWithoutMemberDetails.data.getLinkedMemberPatients
      );

    for (const memberData of memberDetails) {
      expect(memberData).toHaveProperty('id', undefined);
      expect(memberData).toHaveProperty('firstName', undefined);
      expect(memberData).toHaveProperty('lastName', undefined);
      expect(memberData).toHaveProperty('personCode', undefined);
      expect(memberData).toHaveProperty('prescriptionforPatient', undefined);
    }
  });
});



prescription service

import { inject, Injectable } from '@angular/core';
import {
  ExperienceService,
  mapResponseBody
} from '@digital-blocks/angular/core/util/services';

import { Config } from './prescriptions-list.service.config';
import { SubmitTransferResponse, TransferOrderRequest } from '@digital-blocks/angular/pharmacy/transfer-prescriptions/store/prescriptions-list';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PrescriptionsListService {
  private readonly experienceService = inject(ExperienceService);
  submitTransfer(request: TransferOrderRequest): Observable<SubmitTransferResponse>  {
    return this.experienceService
      .post<SubmitTransferResponse>(
        Config.clientId,
        Config.experiences,
        Config.mock,
        {
          data: request.data
        },
        {
          maxRequestTime: 10_000
        }
      ).pipe(
        mapResponseBody(),
        map((response: any) => {
          return response;
        })
      );
  }
}


precription service specs 

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ExperienceService } from '@digital-blocks/angular/core/util/services';
import { StoreModule } from '@ngrx/store';

import { PrescriptionsListService } from './prescriptions-list.service';

// const mockExperienceService = {
//     post: jest.fn()
// };

describe('PrescriptionsListService', () => {
  let service: PrescriptionsListService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, StoreModule.forRoot({})],
      providers: [ExperienceService, PrescriptionsListService]
      //   PrescriptionsListService,
      //   { provide: ExperienceService, useValue: mockExperienceService }
      // ]
    });

    service = TestBed.inject(PrescriptionsListService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should submit transfer and return a response', () => {
    // service.submitTransfer().subscribe(response => {
    //   expect(response).toBeDefined();
    //   done();
    // })
  });

  //   it('should call post method of ExperienceService and process response', (done) => {
  //     const mockResponse = { data: 'mockData' };
  //     mockExperienceService.post.mockReturnValue(of(mockResponse));

  //     jest.spyOn(global, 'mapResponseBody').mockImplementation(() => of(mockResponse));

  //     service.submitTransfer().subscribe(response => {
  //       expect(response).toEqual(mockResponse);
  //       expect(mockExperienceService.post).toHaveBeenCalledWith(
  //         Config.clientId,
  //         Config.experiences,
  //         Config.MOCK,
  //         {},
  //         { maxRequestTime: 10_000 }
  //       )
  //       done();
  //     });
  //   });
});
