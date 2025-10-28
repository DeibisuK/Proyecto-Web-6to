import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-torneo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './torneo.html',
  styleUrls: ['./torneo.css']
})
export class Torneo implements OnInit {
  torneos: any[] = [];

  ngOnInit(): void {
    this.loadTorneos();
  }

  loadTorneos(): void {
    // TODO: Implementar la carga de torneos desde el servicio
    this.torneos = [];
  }
}
