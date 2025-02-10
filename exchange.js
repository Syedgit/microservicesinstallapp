import { isPlatformBrowser } from '@angular/common';
import {
  Directive,
  ElementRef,
  Input,
  Renderer2,
  inject,
  AfterViewInit,
  PLATFORM_ID,
  OnChanges,
  DestroyRef,
  OnInit
} from '@angular/core';
import { ConfigFacade } from '@digital-blocks/angular/core/store/config';
import { Loader } from '@googlemaps/js-api-loader';
import { firstValueFrom, take } from 'rxjs';

import {
  createDriverIconWithAttributes,
  driverOptionsExist,
  setupDriverMarkerPostition
} from './maps.directive.config';
import { GoogleMapOptions, GoogleMapOptionsCenter } from './maps.interfaces';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector -- not sure why this is erroring out here but not in the other file
  selector: '[utilGoogleMaps]'
})
export class GoogleMapsDirective implements AfterViewInit, OnChanges, OnInit {
  @Input() options!: GoogleMapOptions | null;
  @Input() driverOptionsInput!: GoogleMapOptions | null;
  @Input() delivered!: boolean | null;
  @Input() mapHeight = '18.75rem';

  config = inject(ConfigFacade);
  destroyRef = inject(DestroyRef);
  elementRef = inject(ElementRef);
  platformId = inject(PLATFORM_ID);
  renderer = inject(Renderer2);

  driverIcon!: HTMLElement;
  heartIcon!: HTMLElement;

  apiKey!: string;
  driverOptions!: GoogleMapOptions;
  driverMarker!: google.maps.marker.AdvancedMarkerElement;
  deliveryLocationMarker!: google.maps.marker.AdvancedMarkerElement;

  dynamicMap!: google.maps.Map;
  markers: GoogleMapOptionsCenter[] = [];

  async ngOnInit() {
    /** map will load on initialization */
    if (typeof window !== 'undefined') {
      this.apiKey = await firstValueFrom(this.config.googleMapsAPIKey$);

      const loader = new Loader({
        apiKey: this.apiKey,
        version: 'weekly'
      });
      const googleMaps = await loader.importLibrary('maps');

      this.dynamicMap = new googleMaps.Map(this.elementRef.nativeElement, {
        mapId: 'CVS-MAP'
      });
    }
  }

  ngOnChanges(): void {
    if (this.delivered === false) {
      if (this.driverMarker) this.driverMarker.remove();
      if (this.dynamicMap) {
        this.dynamicMap.setOptions({
          ...this.options
        });
      } else {
        this.createMap();
      }
      const bounds = new google.maps.LatLngBounds();

      if (this.options?.center) {
        bounds.extend(this.options.center);
        this.dynamicMap.fitBounds(bounds);
      }
    } else {
      let driverOptionsAvailable =
        !!this.driverOptionsInput?.center?.lat &&
        !!this.driverOptionsInput?.center?.lng;

      if (driverOptionsAvailable) {
        this.driverOptions = this
          .driverOptionsInput as unknown as GoogleMapOptions;
      }

      if (
        driverOptionsAvailable &&
        this.options?.center.lat === this.driverOptions.center.lat &&
        this.options?.center.lng === this.driverOptions.center.lng
      ) {
        driverOptionsAvailable = false;
      }

      this.createMap({ driver: driverOptionsAvailable });
      this.markers = [];
    }
  }

  async ngAfterViewInit() {
    this.renderer.setStyle(
      this.elementRef.nativeElement,
      'height',
      this.mapHeight
    );
    this.heartIcon = this.renderer.createElement('img');
    this.generateMapIcon(
      '/blocks/store-locator/cvs.png',
      this.heartIcon,
      'cvs-heart-image'
    );

    if (isPlatformBrowser(this.platformId)) {
      this.apiKey = await firstValueFrom(this.config.googleMapsAPIKey$);
      this.createMap();
    }
  }

  private generateMapIcon(path: string, icon: Element, alt = 'cvs-icon'): void {
    this.config.assetsBasePath$.pipe(take(1)).subscribe((domain) => {
      const logoPath = `${domain}${path}`;

      this.renderer.setAttribute(icon, 'src', logoPath);
      this.renderer.setAttribute(icon, 'alt', alt);
      this.renderer.setAttribute(icon, 'height', '40px');
      this.renderer.setAttribute(icon, 'width', '40px');
    });
  }

  private handleTheMap(googleMaps: google.maps.MapsLibrary): void {
    if (this.dynamicMap) {
      this.dynamicMap.setOptions({
        ...this.options
      });
    } else {
      this.dynamicMap = new googleMaps.Map(this.elementRef.nativeElement, {
        zoom: 18,
        ...this.options,
        mapId: 'CVS-MAP'
      });
    }
  }

  private handleDeliveryLocationMarker(
    AdvancedMarkerElement: typeof google.maps.marker.AdvancedMarkerElement
  ): void {
    if (this.deliveryLocationMarker) {
      this.deliveryLocationMarker.position = new google.maps.LatLng(
        this.options?.center?.lat ?? Number.NaN,
        this.options?.center?.lng ?? Number.NaN
      );
    } else {
      this.deliveryLocationMarker = new AdvancedMarkerElement({
        map: this.dynamicMap,
        position: this.options?.center ?? { lat: Number.NaN, lng: Number.NaN },
        content: this.heartIcon
      });
    }
  }

  public async createMap(mapOptions?: { driver: boolean }): Promise<void> {
    if (
      typeof window !== 'undefined' &&
      this.options &&
      !Number.isNaN(this.options?.center?.lat) &&
      this.apiKey
    ) {
      const loader = new Loader({
        apiKey: this.apiKey,
        version: 'weekly'
      });
      const googleMaps = await loader.importLibrary('maps');
      const { AdvancedMarkerElement } = await loader.importLibrary('marker');

      this.handleTheMap(googleMaps);
      this.handleDeliveryLocationMarker(AdvancedMarkerElement);

      this.markers.push(this.options.center);

      const bounds = new google.maps.LatLngBounds();

      this.resetMapBasedOnBounds(
        mapOptions,
        AdvancedMarkerElement,
        bounds,
        this.options,
        googleMaps
      );

      if (this.markers.length > 1) {
        const directionsService = new google.maps.DirectionsService();
        const directionsRenderer = new google.maps.DirectionsRenderer();

        if (directionsService && directionsRenderer)
          this.handleDirections(
            directionsRenderer,
            directionsService,
            google.maps.TravelMode.DRIVING,
            google.maps.DirectionsStatus.OK
          );
      }
    }
  }

  private resetMapBasedOnBounds(
    mapOptions: { driver: boolean } | undefined,
    AdvancedMarkerElement: typeof google.maps.marker.AdvancedMarkerElement,
    bounds: google.maps.LatLngBounds,
    options: GoogleMapOptions,
    googleMaps: google.maps.MapsLibrary
  ): void {
    if (driverOptionsExist(mapOptions, this.dynamicMap, this.driverOptions)) {
      this.driverIcon = this.renderer.createElement('img');
      this.driverIcon = createDriverIconWithAttributes(
        this.driverIcon,
        this.renderer
      );
      this.driverMarker = setupDriverMarkerPostition(
        AdvancedMarkerElement,
        this.driverMarker,
        this.driverOptions,
        this.driverIcon,
        this.dynamicMap
      );

      this.markers.push(this.driverOptions.center);

      for (const marker of this.markers) {
        bounds.extend(marker);
      }

      const calculatedZoom = this.calculateDistanceInMiles(
        options.center.lat,
        options.center.lng,
        this.driverOptions.center.lat,
        this.driverOptions.center.lng
      );

      if (calculatedZoom === 0) {
        this.dynamicMap.fitBounds(bounds);
      } else {
        this.dynamicMap.fitBounds(bounds, calculatedZoom);
      }
    } else {
      this.dynamicMap = new googleMaps.Map(this.elementRef.nativeElement, {
        zoom: 18,
        ...this.options,
        mapId: 'CVS-MAP'
      });

      const marker = new AdvancedMarkerElement({});

      marker.map = this.dynamicMap;
      marker.position = options.center;
      marker.content = this.heartIcon;
    }
  }

  private handleDirections(
    directionsRenderer: google.maps.DirectionsRenderer,
    directionsService: google.maps.DirectionsService,
    mode: google.maps.TravelMode,
    status: google.maps.DirectionsStatus
  ): void {
    directionsRenderer.setMap(this.dynamicMap);
    directionsService.route(
      {
        origin: this.markers[1],
        destination: this.markers[0],
        travelMode: mode
      },
      (result, _status) => {
        _status === status
          ? directionsRenderer.setDirections(result)
          : console.warn('Directions could not be obtained at this moment.');
      }
    );
  }

  private calculateDistanceInMiles(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    let circumference = 0;

    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lng2 - lng1) * Math.PI) / 180;
    const area =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    circumference = 2 * Math.atan2(Math.sqrt(area), Math.sqrt(1 - area));

    const distance = 3958.8 * circumference;

    let zoom;

    if (distance < 0.025) {
      zoom = 250;
    } else if (distance <= 0.25) {
      zoom = 150;
    } else if (distance <= 0.5) {
      zoom = 125;
    } else {
      zoom = 0;
    }

    return zoom;
  }
}
