import { inject, Injectable } from '@angular/core';
import { AuthFacade } from '@digital-blocks/angular/core/store/auth';
import { PageDefinitionFacade } from '@digital-blocks/angular/core/store/page-definition';
import { ExperienceService } from '@digital-blocks/angular/core/util/experience-service';
import { mapResponseBody } from '@digital-blocks/angular/core/util/services';
import { filter, map, Observable, of, switchMap } from 'rxjs';

import { CMSAPIResponse, PageData } from '../../../../static-page-spots/src/lib/static-page-spots-interface';
import { CmsContentConfig } from './pl-pharmacy-content-spot.config';
import { SpotRequest } from './pl-pharmacy-content-spot.actions';

@Injectable({
  providedIn: 'root'
})
export class PlPharmacyContentSpotService {
  private readonly experienceService = inject(ExperienceService);
  private readonly pageDefinition = inject(PageDefinitionFacade);
  private readonly authFacade = inject(AuthFacade);

  /**
   * @description Fetches multiple PlPharmacyContentSpots data from the CMS.
   * 
   * @param cmsSpots The array of SpotRequest objects.
   * @returns Observable containing an array of PageData objects.
   */
  public fetchMultiplePlPageContents(cmsSpots: SpotRequest[]): Observable<PageData[]> {
    return this.pageDefinition.page$.pipe(
      filter((page) => page !== undefined),
      switchMap((page) => {
        return page.metadata?.authenticated
          ? of(true)
          : this.authFacade.guestTokenValid$.pipe(
              filter((guestTokenValid) => guestTokenValid),
              map(() => false)
            );
      }),
      switchMap((isAuth) => {
        return this.experienceService
          .post<CMSAPIResponse>(
            CmsContentConfig.clientId,
            CmsContentConfig.experiences,
            `${CmsContentConfig.mock}${isAuth ? '_auth.json' : '_unauth.json'}`,
            {
              data: {
                cmsContentInput: {
                  spots: cmsSpots // Send array of objects
                }
              }
            },
            {
              maxRequestTime: 10_000, // Matches gateway timeout
              additionalHeaders: {
                'x-appName': CmsContentConfig.appName
              }
            }
          )
          .pipe(
            mapResponseBody(),
            map((response) => 
              response.data.cmsContent.flatMap((spot) => spot.content) // Extracts & flattens content
            )
          );
      })
    );
  }
}
