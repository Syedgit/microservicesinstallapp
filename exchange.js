export class SubmitRxClaimGuard implements CanActivate {
  constructor(private featureFlagService: FeatureFlagService) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {

    return this.featureFlagService.openFeatureClient$.pipe(map((featureFlags) => {
      const flag = featureFlags.getBooleanValue('dmr-blocks', false);
      if (flag) {
        window.location.href = '/pharmacy/benefits/reimbursement-claims/home';
      } else {
        Utility.setSessionData('cmk-aem-rx-claim', featureFlags.getBooleanValue('cmk-aem-rx-claim', true));
      }
      return !flag;
    }));
  }
