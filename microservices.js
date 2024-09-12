 TypeError: Cannot read properties of undefined (reading 'statusCode')

      93 |       this.memberTokenResponse$.subscribe(
      94 |         (data: GetMemberInfoAndTokenResponse) => {
    > 95 |           if (data.statusCode === '0000' && data.access_token) {
         |                    ^
      96 |             this.navigationService.navigate(
      97 |               '/pharmacy/-/transfer/current-prescriptions',
      98 |               { queryParamsHandling: 'preserve' },
