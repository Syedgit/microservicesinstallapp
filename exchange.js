import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlPharmacyMapService {
  private readonly bingMapApiKey: string = 'YOUR_BING_MAPS_API_KEY';

  constructor() {}

  /** ✅ Declare Microsoft globally for TypeScript */
  declare const Microsoft: any;

  /** ✅ Load Bing Maps API Dynamically */
  public loadBingMapScript(): Observable<void> {
    return from(
      new Promise<void>((resolve, reject) => {
        if (document.querySelector('#bing-map-script')) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.id = 'bing-map-script';
        script.src = `https://www.bing.com/api/maps/mapcontrol?callback=__onBingLoaded&key=${this.bingMapApiKey}`;
        script.async = true;
        script.defer = true;

        script.addEventListener('load', () => resolve());
        script.addEventListener('error', (error) => reject(error));

        document.body.appendChild(script);
      })
    );
  }

  /** ✅ Initialize Bing Map */
  public initializeMap(mapContainerId: string, latitude: number, longitude: number): void {
    if (!window['Microsoft'] || !window['Microsoft'].Maps) {
      console.error('Bing Maps API not loaded yet.');
      return;
    }

    const map = new Microsoft.Maps.Map(document.getElementById(mapContainerId), {
      credentials: this.bingMapApiKey,
      center: new Microsoft.Maps.Location(latitude, longitude),
      zoom: 12,
      mapTypeId: Microsoft.Maps.MapTypeId.road
    });

    const pushpin = new Microsoft.Maps.Pushpin(new Microsoft.Maps.Location(latitude, longitude));
    map.entities.push(pushpin);
  }
}
