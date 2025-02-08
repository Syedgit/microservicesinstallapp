import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlPharmacyMapService {
  private readonly googleMapsApiKey: string = 'YOUR_GOOGLE_MAPS_API_KEY';
  private scriptLoaded = false;
  public mapReady$ = new BehaviorSubject<boolean>(false);

  constructor() {
    this.loadGoogleMapsScript();
  }

  /**
   * Dynamically loads the Google Maps script and ensures it's loaded before usage.
   */
  public loadGoogleMapsScript(): Observable<boolean> {
    return new Observable<boolean>((observer) => {
      // If script is already loaded, emit true
      if (this.scriptLoaded) {
        observer.next(true);
        observer.complete();
        return;
      }

      // Check if Google Maps is already available (e.g., script loaded by another instance)
      if (typeof google !== 'undefined' && google.maps) {
        this.scriptLoaded = true;
        this.mapReady$.next(true);
        observer.next(true);
        observer.complete();
        return;
      }

      // Create the script element
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.googleMapsApiKey}&callback=__googleMapsLoaded`;
      script.async = true;
      script.defer = true;

      // Define the callback function on the window object
      (window as any).__googleMapsLoaded = () => {
        this.scriptLoaded = true;
        this.mapReady$.next(true);
        observer.next(true);
        observer.complete();
      };

      // Handle script load errors
      script.onerror = (error) => {
        console.error('Google Maps script failed to load', error);
        observer.error(error);
      };

      // Append the script to the document body
      document.body.appendChild(script);
    });
  }
}
