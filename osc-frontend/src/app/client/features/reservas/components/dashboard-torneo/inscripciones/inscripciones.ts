import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inscripciones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inscripciones.html',
  styleUrls: ['./inscripciones.css']
})
export class Inscripciones implements OnInit {
  inscripciones: any[] = [];

  ngOnInit(): void {
    // Aquí puedes cargar las inscripciones desde un servicio
    this.loadInscripciones();
  }

  loadInscripciones(): void {
    // TODO: Implementar la carga de inscripciones
    this.inscripciones = [];
  }
}
