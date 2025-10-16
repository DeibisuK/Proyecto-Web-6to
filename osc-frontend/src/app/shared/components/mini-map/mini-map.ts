import { Component, Input, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';

@Component({
  selector: 'app-mini-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div #mapContainer class="mini-map-container"></div>
  `,
  styles: [`
    .mini-map-container {
      width: 100%;
      height: 200px;
      border-radius: 8px;
      overflow: hidden;
    }
  `]
})
export class MiniMapComponent implements AfterViewInit, OnDestroy {
  @Input() latitud!: number;
  @Input() longitud!: number;
  @Input() zoom: number = 14;
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;
  
  private map?: L.Map;
  private marker?: L.Marker;

  ngAfterViewInit(): void {
    // Pequeño delay para asegurar que el DOM esté listo
    setTimeout(() => {
      this.initMap();
    }, 100);
  }

  private initMap(): void {
    if (!this.mapContainer || !this.latitud || !this.longitud) {
      return;
    }

    try {
      // Inicializar el mapa
      this.map = L.map(this.mapContainer.nativeElement, {
        center: [this.latitud, this.longitud],
        zoom: this.zoom,
        zoomControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: false,
        boxZoom: false,
        keyboard: false,
        attributionControl: false
      });

      // Agregar tiles de OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
      }).addTo(this.map);

      // Icono personalizado del marcador
      const customIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      // Agregar marcador
      this.marker = L.marker([this.latitud, this.longitud], { icon: customIcon })
        .addTo(this.map);

      // Invalidar el tamaño después de un momento para asegurar renderizado correcto
      setTimeout(() => {
        this.map?.invalidateSize();
      }, 200);
    } catch (error) {
      console.error('Error inicializando mini-mapa:', error);
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }
}
