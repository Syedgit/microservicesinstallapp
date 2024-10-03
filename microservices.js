for this test case i have linting error  136:66  error  Return a Promise instead of relying on callback parameter 

it('should submit transfer and return a successful response', (done) => {
    const mockHttpResponse = new HttpResponse<SubmitTransferResponse>({
      body: mockResponse,
      status: 200
    });

    jest.spyOn(experienceService, 'post').mockReturnValue(of(mockHttpResponse));

    service.submitTransfer(mockRequest).subscribe((response) => {
      expect(response).toEqual(mockResponse);
      done();
    });

    expect(experienceService.post).toHaveBeenCalledWith(
      Config.clientId,
      Config.experiences,
      Config.mock,
      { data: mockRequest.data },
      { maxRequestTime: 10_000 }
    );
  });

for this test i am getting two errors  
  1- error  Return a Promise instead of relying on callback parameter 
  2- 58:57  error  Return a Promise instead of relying on callback parameter                       jest/no-done-callback
  167:9   error  Illegal usage of `fail`, prefer throwing an error, or the `done.fail` callback
 it('should return an error when the transfer fails', (done) => {
    const mockError = { message: 'Transfer failed' };

    jest
      .spyOn(experienceService, 'post')
      .mockReturnValue(throwError(() => mockError));

    service.submitTransfer(mockRequest).subscribe({
      next: () => {
        fail('Expected an error, but got success response');
      },
      error: (error) => {
        expect(error).toEqual(mockError);
        done();
      }
    });
  });
