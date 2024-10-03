it('should submit transfer and return a successful response', async () => {
  const mockHttpResponse = new HttpResponse<SubmitTransferResponse>({
    body: mockResponse,
    status: 200
  });

  jest.spyOn(experienceService, 'post').mockReturnValue(of(mockHttpResponse));

  const response = await firstValueFrom(service.submitTransfer(mockRequest));

  expect(response).toEqual(mockResponse);

  expect(experienceService.post).toHaveBeenCalledWith(
    Config.clientId,
    Config.experiences,
    Config.mock,
    { data: mockRequest.data },
    { maxRequestTime: 10_000 }
  );
});


it('should return an error when the transfer fails', async () => {
  const mockError = { message: 'Transfer failed' };

  jest
    .spyOn(experienceService, 'post')
    .mockReturnValue(throwError(() => mockError));

  try {
    await firstValueFrom(service.submitTransfer(mockRequest));
    throw new Error('Expected an error, but got success response');
  } catch (error) {
    expect(error).toEqual(mockError);
  }
});
