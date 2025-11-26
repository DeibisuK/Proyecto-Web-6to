import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TiempoRealControl } from '../../components/tiempo-real-control/tiempo-real-control';
import { EventosPartido } from '../../components/eventos-partido/eventos-partido';
import { AlineacionesPartido } from '../../components/alineaciones-partido/alineaciones-partido';
import { ClasificacionTorneo } from '../../components/clasificacion-torneo/clasificacion-torneo';

@Component({
  selector: 'app-arbitro-panel',
  imports: [
    CommonModule,
    TiempoRealControl,
    EventosPartido,
    AlineacionesPartido,
    ClasificacionTorneo
  ],
  templateUrl: './arbitro-panel.html',
  styleUrl: './arbitro-panel.css',
})
export class ArbitroPanel implements OnInit {
  private route = inject(ActivatedRoute);

  idPartido = signal<number>(0);
  idTorneo = signal<number>(0);
  tabActiva = signal<string>('tiempo');

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.idPartido.set(+params['idPartido']);
    });

    this.route.queryParams.subscribe(params => {
      if (params['idTorneo']) {
        this.idTorneo.set(+params['idTorneo']);
      }
    });
  }

  cambiarTab(tab: string): void {
    this.tabActiva.set(tab);
  }
}
