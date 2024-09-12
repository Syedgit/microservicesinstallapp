it('should call store.getMemberInfoAndToken, subscribe to memberTokenResponse$ and navigate on success', () => {
  // Spy on updateFormWithDate and mock the return value
  const updateFormWithDateSpy = jest.spyOn(component, 'updateFormWithDate').mockReturnValue('1990-12-25');

  // Mocked patient info
  const patientInfo  = {
    firstName: 'John',
    lastName: 'Doe',
    memberId: '12345',
    dateOfBirth: '1990-12-25',
    flowName: 'MEMBER_ID_LOOKUP',
    source: 'CMK'
  };

  // Set valid form values
  component.memberForm.setValue({
    firstName: 'John',
    lastName: 'Doe',
    memberId: '12345',
    dateOfBirth: ''
  });

  // Mock the form to be valid
  Object.defineProperty(component.memberForm, 'valid', { value: true });

  // Spy on the store method
  const storeSpy = jest.spyOn(component.store, 'getMemberInfoAndToken');

  // Spy on navigationService.navigate
  const navigateSpy = jest.spyOn(component.navigationService, 'navigate');

  // Mock memberTokenResponse$ to emit a success response
  const memberTokenResponse$ = new BehaviorSubject({
    statusCode: '0000',
    access_token: 'someToken'
  });
  component.memberTokenResponse$ = memberTokenResponse$;

  // Call the method to test
  component.getMemberInfoAndToken();

  // Ensure updateFormWithDate is called
  expect(updateFormWithDateSpy).toHaveBeenCalled();

  // Ensure store method is called with the correct payload
  expect(storeSpy).toHaveBeenCalledWith(patientInfo);

  // Emit the value and ensure navigation is triggered
  memberTokenResponse$.next({
    statusCode: '0000',
    access_token: 'someToken'
  });

  // Ensure navigation is called with the correct arguments
  expect(navigateSpy).toHaveBeenCalledWith(
    '/pharmacy/-/transfer/current-prescriptions',
    { queryParamsHandling: 'preserve' },
    { navigateByPath: true }
  );
});
