it('should dispatch getMemberInfoAndToken action with correct payload when form is valid and date is valid', () => {
  // Set valid form values
  component.memberForm.get('firstName')?.setValue('John');
  component.memberForm.get('lastName')?.setValue('Doe');
  component.memberForm.get('memberId')?.setValue('12345');

  // Set valid date fields
  component.month = { nativeElement: { value: '12' } } as ElementRef;
  component.day = { nativeElement: { value: '25' } } as ElementRef;
  component.year = { nativeElement: { value: '1990' } } as ElementRef;

  // Spy on the date validation function to ensure it's called
  const isDateValidSpy = jest.spyOn(component, 'isDateValid').mockReturnValue(true);

  // Spy on the updateFormWithDate function to verify it updates the form with the correct date
  const updateFormWithDateSpy = jest.spyOn(component, 'updateFormWithDate').mockReturnValue('1990-12-25');

  // Spy on the dispatch function to capture any dispatched actions
  const dispatchSpy = jest.spyOn(store, 'dispatch');

  // Call the function being tested
  component.getMemberInfoAndToken();

  // Ensure date validation was called
  expect(isDateValidSpy).toHaveBeenCalled();

  // Ensure the form was updated with the correct date
  expect(updateFormWithDateSpy).toHaveBeenCalled();

  // Ensure the correct backend payload is constructed and dispatched
  const expectedPayload: MemberInfo = {
    firstName: 'John',
    lastName: 'Doe',
    memberId: '12345',
    dateOfBirth: '1990-12-25', // Correct date
    flowName: 'MEMBER_ID_LOOKUP',
    source: 'CMK'
  };

  expect(dispatchSpy).toHaveBeenCalledWith(
    MemberAuthenticationActions.getMemberInfoAndToken({
      request: {
        data: {
          idType: 'PBM_QL_ENC_PARTICIPANT_ID_TYPE',
          lookupReq: expectedPayload
        }
      },
      useTransferSecret: true
    })
  );
});
