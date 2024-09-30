ponent.spec.ts
  ● SubmitTransferComponent › submitTransfer › should handle a successful transfer submission

    expect(jest.fn()).toHaveBeenCalledWith(...expected)

    Expected: {"data": {"externalTransfer": [{"carrierId": "", "clinicalRuleDate": "09/16/2024", "patient": {"address": {"city": "", "line": [""], "phoneNumber": "", "postalCode": "", "state": ""}, "dateOfBirth": "01/01/1990", "email": "john.doe@example.com", "firstName": "John", "gender": undefined, "lastName": "Doe", "memberId": "7389902", "patientId": "7389902", "patientIdType": "PBM_QL_PARTICIPANT_ID_TYPE", "profileId": null}, "requestedChannel": "", "rxDetails": [{"drugDetails": [{"daySupply": undefined, "drugName": "Drug 1", "encPrescriptionLookupKey": "lookupKey1", "prescriptionLookupKey": {"id": "133225401", "idType": "PBM_QL_PARTICIPANT_ID_TYPE", "rxNumber": "lookupKey1"}, "provider": {"address": {"city": "Town", "line": [Array], "phoneNumber": "123-456-7890", "postalCode": "90210", "state": "CA"}, "faxNumber": "", "firstName": "John", "lastName": "Doe", "npi": "1234567890", "phoneNumber": ""}, "quantity": undefined, "recentFillDate": undefined}], "fromPharmacy": {"address": {"city": "WOONSOCKET", "line": ["GREY 1 CVS DRIVE"], "phoneNumber": "8005414959", "postalCode": "02895", "state": "RI"}, "pharmacyName": "ALLIANCERX WALGREENS PRIME 16280", "storeId": "99999"}, "toPharmacy": {"address": {"city": "WOONSOCKET", "line": ["GREY 1 CVS DRIVE"], "phoneNumber": "8005414959", "postalCode": "02895", "state": "RI"}, "pharmacyName": "ALLIANCERX WALGREENS PRIME 16280", "storeId": "99999"}}]}], "idType": "PBM_QL_PARTICIPANT_ID_TYPE", "profile": null}}

    Number of calls: 0

      110 |       component.submitTransfer();
      111 |
    > 112 |       expect(spySubmitTransfer).toHaveBeenCalledWith(expectedRequest);
          |                                 ^
      113 |       expect(component.errorMessage).toBeNull();
      114 |     });
      115 |

      at src/lib/submit-transfer.component.spec.ts:112:33
      at _ZoneDelegate.invoke (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone.umd.js:416:32)
      at ProxyZoneSpec.Object.<anonymous>.ProxyZoneSpec.onInvoke (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone-testing.umd.js:2164:43)
      at _ZoneDelegate.invoke (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone.umd.js:415:38)
      at ZoneImpl.run (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone.umd.js:147:47)
      at Object.wrappedFunc (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone-testing.umd.js:450:38)

  ● SubmitTransferComponent › submitTransfer › should handle a failed transfer submission

    expect(jest.fn()).toHaveBeenCalledWith(...expected)

    Expected: {"data": {"externalTransfer": [{"carrierId": "", "clinicalRuleDate": "09/16/2024", "patient": {"address": {"city": "", "line": [""], "phoneNumber": "", "postalCode": "", "state": ""}, "dateOfBirth": "01/01/1990", "email": "john.doe@example.com", "firstName": "John", "gender": undefined, "lastName": "Doe", "memberId": "7389902", "patientId": "7389902", "patientIdType": "PBM_QL_PARTICIPANT_ID_TYPE", "profileId": null}, "requestedChannel": "", "rxDetails": [{"drugDetails": [{"daySupply": undefined, "drugName": "Drug 1", "encPrescriptionLookupKey": "lookupKey1", "prescriptionLookupKey": {"id": "133225401", "idType": "PBM_QL_PARTICIPANT_ID_TYPE", "rxNumber": "lookupKey1"}, "provider": {"address": {"city": "Town", "line": [Array], "phoneNumber": "123-456-7890", "postalCode": "90210", "state": "CA"}, "faxNumber": "", "firstName": "John", "lastName": "Doe", "npi": "1234567890", "phoneNumber": ""}, "quantity": undefined, "recentFillDate": undefined}], "fromPharmacy": {"address": {"city": "WOONSOCKET", "line": ["GREY 1 CVS DRIVE"], "phoneNumber": "8005414959", "postalCode": "02895", "state": "RI"}, "pharmacyName": "ALLIANCERX WALGREENS PRIME 16280", "storeId": "99999"}, "toPharmacy": {"address": {"city": "WOONSOCKET", "line": ["GREY 1 CVS DRIVE"], "phoneNumber": "8005414959", "postalCode": "02895", "state": "RI"}, "pharmacyName": "ALLIANCERX WALGREENS PRIME 16280", "storeId": "99999"}}]}], "idType": "PBM_QL_PARTICIPANT_ID_TYPE", "profile": null}}

    Number of calls: 0

      129 |       component.submitTransfer();
      130 |
    > 131 |       expect(spySubmitTransfer).toHaveBeenCalledWith(expectedRequest);
          |                                 ^
      132 |
      133 |       mockStore.setState({ submitTransferResponse: errorResponse });
      134 |       mockStore.refreshState();

      at src/lib/submit-transfer.component.spec.ts:131:33
      at _ZoneDelegate.invoke (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone.umd.js:416:32)
      at ProxyZoneSpec.Object.<anonymous>.ProxyZoneSpec.onInvoke (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone-testing.umd.js:2164:43)
      at _ZoneDelegate.invoke (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone.umd.js:415:38)
      at ZoneImpl.run (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone.umd.js:147:47)
      at Object.wrappedFunc (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone-testing.umd.js:450:38)
