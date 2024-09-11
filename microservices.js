it('should call updateFormWithDate, patch dateOfBirth, validate the form, and dispatch getMemberInfoAndToken action with correct payload', () => {
  // Initialize the form in the test
  component.memberForm = new FormBuilder().group({
    firstName: ['John'],
    lastName: ['Doe'],
    memberId: ['12345'],
    dateOfBirth: ['']
  });

  // Spy on the updateFormWithDate method and mock return value
  const updateFormWithDateSpy = jest.spyOn(component, 'updateFormWithDate').mockReturnValue('1990-12-25');

  // Spy on patchValue to ensure dateOfBirth is patched
  const patchValueSpy = jest.spyOn(component.memberForm, 'patchValue');

  // Spy on dispatch to check if the correct action is called
  const dispatchSpy = jest.spyOn(store, 'dispatch');

  // Call the method that triggers everything
  component.getMemberInfoAndToken();

  // Ensure updateFormWithDate was called
  expect(updateFormWithDateSpy).toHaveBeenCalled();

  // Ensure patchValue is called with the correct date of birth
  expect(patchValueSpy).toHaveBeenCalledWith({ dateOfBirth: '1990-12-25' });

  // Create the expected payload for the backend call
  const expectedPatientInfo = {
    firstName: 'John',
    lastName: 'Doe',
    memberId: '12345',
    dateOfBirth: '1990-12-25',
    flowName: 'MEMBER_ID_LOOKUP',
    source: 'CMK'
  };

  const expectedRequest = {
    data: {
      idType: 'PBM_QL_ENC_PARTICIPANT_ID_TYPE',
      lookupReq: expectedPatientInfo
    }
  };

  // Ensure the dispatch method was called with the correct action and payload
  expect(dispatchSpy).toHaveBeenCalledWith(
    MemberAuthenticationActions.getMemberInfoAndToken({
      request: expectedRequest,
      useTransferSecret: true
    })
  );
});
