 FAIL   angular-pharmacy-transfer-prescriptions-blocks-submit-transfer  libs/angular/pharmacy/transfer-prescriptions/blocks/submit-transfer/src/lib/submit-transfer.component.spec.ts
  ● SubmitTransferComponent › submitTransfer › should handle a successful transfer submission

    expect(jest.fn()).toHaveBeenCalled()

    Expected number of calls: >= 1
    Received number of calls:    0

      102 |       component.submitTransfer();
      103 |
    > 104 |       expect(spySubmitTransfer).toHaveBeenCalled();
          |                                 ^
      105 |       expect(component.errorMessage).toBeNull();
      106 |
      107 |       mockStore.setState({ submitTransferResponse: mockedResponse });

      at src/lib/submit-transfer.component.spec.ts:104:33
      at _ZoneDelegate.invoke (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone.umd.js:416:32)
      at ProxyZoneSpec.Object.<anonymous>.ProxyZoneSpec.onInvoke (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone-testing.umd.js:2164:43)
      at _ZoneDelegate.invoke (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone.umd.js:415:38)
      at ZoneImpl.run (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone.umd.js:147:47)
      at Object.wrappedFunc (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone-testing.umd.js:450:38)

  ● SubmitTransferComponent › submitTransfer › should handle a failed transfer submission

    expect(jest.fn()).toHaveBeenCalled()

    Expected number of calls: >= 1
    Received number of calls:    0

      123 |       component.submitTransfer();
      124 |
    > 125 |       expect(spySubmitTransfer).toHaveBeenCalled();
          |                                 ^
      126 |
      127 |       mockStore.setState({ submitTransferResponse: errorResponse });
      128 |       mockStore.refreshState();

      at src/lib/submit-transfer.component.spec.ts:125:33
      at _ZoneDelegate.invoke (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone.umd.js:416:32)
      at ProxyZoneSpec.Object.<anonymous>.ProxyZoneSpec.onInvoke (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone-testing.umd.js:2164:43)
      at _ZoneDelegate.invoke (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone.umd.js:415:38)
      at ZoneImpl.run (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone.umd.js:147:47)
      at Object.wrappedFunc (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone-testing.umd.js:450:38)

  ● SubmitTransferComponent › buildTransferOrderRequest › should build the transfer order request correctly

    expect(received).toBe(expected) // Object.is equality

    Expected: "John"
    Received: undefined

      147 |
      148 |       expect(request.data.externalTransfer.length).toBe(1);
    > 149 |       expect(request.data.externalTransfer[0].patient.firstName).toBe('John');
          |                                                                  ^
      150 |       expect(request.data.externalTransfer[0].rxDetails[0].fromPharmacy.pharmacyName).toBe('Pharmacy 1');
      151 |     });
      152 |

      at src/lib/submit-transfer.component.spec.ts:149:66
      at _ZoneDelegate.invoke (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone.umd.js:416:32)
      at ProxyZoneSpec.Object.<anonymous>.ProxyZoneSpec.onInvoke (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone-testing.umd.js:2164:43)
      at _ZoneDelegate.invoke (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone.umd.js:415:38)
      at ZoneImpl.run (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone.umd.js:147:47)
      at Object.wrappedFunc (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone-testing.umd.js:450:38)

  ● SubmitTransferComponent › mapRxDetails › should map the prescription details correctly

    expect(received).toBe(expected) // Object.is equality

    Expected: "Pharmacy 1"
    Received: "ALLIANCERX WALGREENS PRIME 16280"

      165 |
      166 |       expect(result?.drugDetails.length).toBe(1);
    > 167 |       expect(result?.fromPharmacy.pharmacyName).toBe('Pharmacy 1');
          |                                                 ^
      168 |     });
      169 |
      170 |     it('should return null if no selected prescriptions', () => {

      at src/lib/submit-transfer.component.spec.ts:167:49
      at _ZoneDelegate.invoke (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone.umd.js:416:32)
      at ProxyZoneSpec.Object.<anonymous>.ProxyZoneSpec.onInvoke (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone-testing.umd.js:2164:43)
      at _ZoneDelegate.invoke (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone.umd.js:415:38)
      at ZoneImpl.run (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone.umd.js:147:47)
      at Object.wrappedFunc (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone-testing.umd.js:450:38)

  ● SubmitTransferComponent › mapPatientDetails › should map the patient details correctly

    expect(received).toBe(expected) // Object.is equality

    Expected: "John"
    Received: undefined

      182 |       const result = component.mapPatientDetails(prescription);
      183 |
    > 184 |       expect(result.firstName).toBe('John');
          |                                ^
      185 |       expect(result.email).toBe('');
      186 |     });
      187 |

      at src/lib/submit-transfer.component.spec.ts:184:32
      at _ZoneDelegate.invoke (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone.umd.js:416:32)
      at ProxyZoneSpec.Object.<anonymous>.ProxyZoneSpec.onInvoke (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone-testing.umd.js:2164:43)
      at _ZoneDelegate.invoke (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone.umd.js:415:38)
      at ZoneImpl.run (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone.umd.js:147:47)
      at Object.wrappedFunc (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone-testing.umd.js:450:38)

Jest: "global" coverage threshold for branches (80%) not met: 77.21%
Test Suites: 1 failed, 1 total
Tests:       5 failed, 5 passed, 10 total
Snapshots:   0 total
Time:        4.597 s, estimated 8 s

——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Ran target test for project angular-pharmacy-transfer-prescriptions-blocks-submit-transfer (7s)

   ✖  1/1 failed
   ✔  0/1 succeeded [0 read from cache]

MACC02GP3L81PG4:cvs-digital-blocks z243545$ nx run angular-pharmacy-transfer-prescriptions-blocks-submit-transfer:test:ci

> nx run angular-pharmacy-transfer-prescriptions-blocks-submit-transfer:test:ci

 FAIL   angular-pharmacy-transfer-prescriptions-blocks-submit-transfer  libs/angular/pharmacy/transfer-prescriptions/blocks/submit-transfer/src/lib/submit-transfer.component.spec.ts
  ● SubmitTransferComponent › submitTransfer › should handle a successful transfer submission

    expect(jest.fn()).toHaveBeenCalled()

    Expected number of calls: >= 1
    Received number of calls:    0

      144 |       component.submitTransfer();
      145 |
    > 146 |       expect(spySubmitTransfer).toHaveBeenCalled();
          |                                 ^
      147 |       expect(component.errorMessage).toBeNull();
      148 |
      149 |       mockStore.setState({ submitTransferResponse: mockedResponse });

      at src/lib/submit-transfer.component.spec.ts:146:33
      at _ZoneDelegate.invoke (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone.umd.js:416:32)
      at ProxyZoneSpec.Object.<anonymous>.ProxyZoneSpec.onInvoke (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone-testing.umd.js:2164:43)
      at _ZoneDelegate.invoke (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone.umd.js:415:38)
      at ZoneImpl.run (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone.umd.js:147:47)
      at Object.wrappedFunc (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone-testing.umd.js:450:38)

  ● SubmitTransferComponent › submitTransfer › should handle a failed transfer submission

    expect(jest.fn()).toHaveBeenCalled()

    Expected number of calls: >= 1
    Received number of calls:    0

      165 |       component.submitTransfer();
      166 |
    > 167 |       expect(spySubmitTransfer).toHaveBeenCalled();
          |                                 ^
      168 |
      169 |       mockStore.setState({ submitTransferResponse: errorResponse });
      170 |       mockStore.refreshState();

      at src/lib/submit-transfer.component.spec.ts:167:33
      at _ZoneDelegate.invoke (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone.umd.js:416:32)
      at ProxyZoneSpec.Object.<anonymous>.ProxyZoneSpec.onInvoke (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone-testing.umd.js:2164:43)
      at _ZoneDelegate.invoke (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone.umd.js:415:38)
      at ZoneImpl.run (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone.umd.js:147:47)
      at Object.wrappedFunc (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone-testing.umd.js:450:38)

  ● SubmitTransferComponent › buildTransferOrderRequest › should build the transfer order request correctly

    TypeError: Cannot read properties of null (reading 'npi')

      200 |   public mapProviderDetails(prescriber: any): Provider {
      201 |     return {
    > 202 |       npi: prescriber.npi || '',
          |                       ^
      203 |       firstName: prescriber.firstName || '',
      204 |       lastName: prescriber.lastName || '',
      205 |       phoneNumber: prescriber.phone || '',

      at SubmitTransferComponent.mapProviderDetails (src/lib/submit-transfer.component.ts:202:23)
      at map (src/lib/submit-transfer.component.ts:141:28)
          at Array.map (<anonymous>)
      at SubmitTransferComponent.mapRxDetails (src/lib/submit-transfer.component.ts:129:8)
      at map (src/lib/submit-transfer.component.ts:84:52)
          at Array.map (<anonymous>)
      at SubmitTransferComponent.buildTransferOrderRequest (src/lib/submit-transfer.component.ts:83:30)
      at src/lib/submit-transfer.component.spec.ts:188:33
      at _ZoneDelegate.invoke (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone.umd.js:416:32)
      at ProxyZoneSpec.Object.<anonymous>.ProxyZoneSpec.onInvoke (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone-testing.umd.js:2164:43)
      at _ZoneDelegate.invoke (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone.umd.js:415:38)
      at ZoneImpl.run (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone.umd.js:147:47)
      at Object.wrappedFunc (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone-testing.umd.js:450:38)

  ● SubmitTransferComponent › buildTransferOrderRequest › should return empty externalTransfer array if no prescriptions are selected

    expect(received).toBe(expected) // Object.is equality

    Expected: 0
    Received: 1

      197 |       component.currentPrescriptions = currentPrescriptions;
      198 |       const request = component.buildTransferOrderRequest(currentPrescriptions);
    > 199 |       expect(request.data.externalTransfer.length).toBe(0);
          |                                                    ^
      200 |     });
      201 |   });
      202 |

      at src/lib/submit-transfer.component.spec.ts:199:52
      at _ZoneDelegate.invoke (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone.umd.js:416:32)
      at ProxyZoneSpec.Object.<anonymous>.ProxyZoneSpec.onInvoke (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone-testing.umd.js:2164:43)
      at _ZoneDelegate.invoke (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone.umd.js:415:38)
      at ZoneImpl.run (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone.umd.js:147:47)
      at Object.wrappedFunc (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone-testing.umd.js:450:38)

  ● SubmitTransferComponent › mapRxDetails › should map the prescription details correctly

    TypeError: Cannot read properties of null (reading 'npi')

      200 |   public mapProviderDetails(prescriber: any): Provider {
      201 |     return {
    > 202 |       npi: prescriber.npi || '',
          |                       ^
      203 |       firstName: prescriber.firstName || '',
      204 |       lastName: prescriber.lastName || '',
      205 |       phoneNumber: prescriber.phone || '',

      at SubmitTransferComponent.mapProviderDetails (src/lib/submit-transfer.component.ts:202:23)
      at map (src/lib/submit-transfer.component.ts:141:28)
          at Array.map (<anonymous>)
      at SubmitTransferComponent.mapRxDetails (src/lib/submit-transfer.component.ts:129:8)
      at src/lib/submit-transfer.component.spec.ts:206:32
      at _ZoneDelegate.invoke (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone.umd.js:416:32)
      at ProxyZoneSpec.Object.<anonymous>.ProxyZoneSpec.onInvoke (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone-testing.umd.js:2164:43)
      at _ZoneDelegate.invoke (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone.umd.js:415:38)
      at ZoneImpl.run (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone.umd.js:147:47)
      at Object.wrappedFunc (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone-testing.umd.js:450:38)

  ● SubmitTransferComponent › mapRxDetails › should return null if no selected prescriptions

    expect(received).toBeNull()

    Received: {"drugDetails": [{"daySupply": 90, "drugName": "EVISTA 60MG TAB", "encPrescriptionLookupKey": undefined, "prescriptionLookupKey": {"id": "403283882", "idType": "PBM_QL_PARTICIPANT_ID_TYPE", "rxNumber": ""}, "provider": {"address": {"city": "", "line": [""], "phoneNumber": "", "postalCode": "", "state": ""}, "faxNumber": "", "firstName": "DEMSER L", "lastName": "BLEIFER", "npi": "", "phoneNumber": "8475205636"}, "quantity": 90, "recentFillDate": "2024-03-03"}], "fromPharmacy": {"address": {"city": "WOONSOCKET", "line": ["GREY 1 CVS DRIVE"], "phoneNumber": "8005414959", "postalCode": "02895", "state": "RI"}, "pharmacyName": "ALLIANCERX WALGREENS PRIME 16280", "storeId": "99999"}, "toPharmacy": {"address": {"city": "WOONSOCKET", "line": ["GREY 1 CVS DRIVE"], "phoneNumber": "8005414959", "postalCode": "02895", "state": "RI"}, "pharmacyName": "ALLIANCERX WALGREENS PRIME 16280", "storeId": "99999"}}

      215 |       const result = component.mapRxDetails(prescription);
      216 |
    > 217 |       expect(result).toBeNull();
          |                      ^
      218 |     });
      219 |   });
      220 |

      at src/lib/submit-transfer.component.spec.ts:217:22
      at _ZoneDelegate.invoke (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone.umd.js:416:32)
      at ProxyZoneSpec.Object.<anonymous>.ProxyZoneSpec.onInvoke (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone-testing.umd.js:2164:43)
      at _ZoneDelegate.invoke (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone.umd.js:415:38)
      at ZoneImpl.run (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone.umd.js:147:47)
      at Object.wrappedFunc (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone-testing.umd.js:450:38)

  ● SubmitTransferComponent › mapPatientDetails › should map the patient details correctly

    expect(received).toBe(expected) // Object.is equality

    Expected: "John"
    Received: "BRIAN"

      224 |       const result = component.mapPatientDetails(prescription);
      225 |
    > 226 |       expect(result.firstName).toBe('John');
          |                                ^
      227 |       expect(result.email).toBe('');
      228 |     });
      229 |

      at src/lib/submit-transfer.component.spec.ts:226:32
      at _ZoneDelegate.invoke (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone.umd.js:416:32)
      at ProxyZoneSpec.Object.<anonymous>.ProxyZoneSpec.onInvoke (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone-testing.umd.js:2164:43)
      at _ZoneDelegate.invoke (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone.umd.js:415:38)
      at ZoneImpl.run (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone.umd.js:147:47)
      at Object.wrappedFunc (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone-testing.umd.js:450:38)
