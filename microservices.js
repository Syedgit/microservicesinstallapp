
  it('should call updateFormWithDate, patch dateOfBirth, validate the form, and dispatch getMemberInfoAndToken action with correct payload', () => {
    const updateFormWithDateSpy = jest.spyOn(component, 'updateFormWithDate').mockReturnValue('1990-12-25');
    const patientInfo  = {
      firstName: 'John',
      lastName: 'Doe',
      memberId: '12345',
      dateOfBirth: '1990-12-25',
      flowName: 'MEMBER_ID_LOOKUP',
      source: 'CMK'
    };
    // const patchValueSpy = jest.spyOn(component.memberForm, 'patchValue');
    component.memberForm.setValue({
      firstName: ['John'],
      lastName: ['Doe'],
      memberId: ['12345'],
      dateOfBirth: ['']
    });
    
    const storeSpy = jest.spyOn(component.store, 'getMemberInfoAndToken');
    component.getMemberInfoAndToken();
  
    expect(updateFormWithDateSpy).toHaveBeenCalled();
    expect(storeSpy).toHaveBeenCalledWith(patientInfo);
    expect(component.memberForm.value.dateOfBirth).toEqual({ dateOfBirth: '1990-12-25' });
    
    
  });

Error

  ● MemberAuthenticationComponent › should call updateFormWithDate, patch dateOfBirth, validate the form, and dispatch getMemberInfoAndToken action with correct payload

    expect(jest.fn()).toHaveBeenCalledWith(...expected)

    Expected: {"dateOfBirth": "1990-12-25", "firstName": "John", "flowName": "MEMBER_ID_LOOKUP", "lastName": "Doe", "memberId": "12345", "source": "CMK"}

    Number of calls: 0

      108 |   
      109 |     expect(updateFormWithDateSpy).toHaveBeenCalled();
    > 110 |     expect(storeSpy).toHaveBeenCalledWith(patientInfo);
          |                      ^
      111 |     expect(component.memberForm.value.dateOfBirth).toEqual({ dateOfBirth: '1990-12-25' });
      112 |     
      113 |     

      at src/lib/member-authentication.component.spec.ts:110:22
      at _ZoneDelegate.invoke (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone.umd.js:416:32)
      at ProxyZoneSpec.Object.<anonymous>.ProxyZoneSpec.onInvoke (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone-testing.umd.js:2164:43)
      at _ZoneDelegate.invoke (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone.umd.js:415:38)
      at ZoneImpl.run (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone.umd.js:147:47)
      at Object.wrappedFunc (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone-testing.umd.js:450:38)
