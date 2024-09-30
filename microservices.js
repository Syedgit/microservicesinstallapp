tions-list.effects.spec.ts (11.852 s)
  ● PrescriptionsListEffects › submitTransfer$ › should return submitTransferFailure action on failed transfer

    expect(received).toEqual(expected) // deep equality

    - Expected  - 2
    + Received  + 2

      Object {
    -   "error": Object {
    +   "submitTransferResponse": Object {
          "message": "Transfer failed",
          "tag": "PrescriptionsList",
        },
    -   "type": "[PrescriptionsList] Submit Transfer Failure",
    +   "type": "[PrescriptionsList] Submit Transfer Success",
      }

      71 |
      72 |       effects.submitTransfer$.subscribe((action) => {
    > 73 |         expect(action).toEqual(PrescriptionsListActions.submitTransferFailure({ error: mockError }));
         |                        ^
      74 |         done();
      75 |       })
