import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface Valor {
  titulo: string;
  descripcion: string;
}

@Component({
  selector: 'app-mision-vision',
  imports: [CommonModule],
  templateUrl: './mision-vision.html',
  styleUrl: './mision-vision.css'
})
export class MisionVision {
valores: Valor[] = [
    {
      titulo: 'Excelencia',
      descripcion: 'Nos esforzamos por brindar el mejor servicio y calidad en cada aspecto de nuestra plataforma.'
    },
    {
      titulo: 'Innovación',
      descripcion: 'Buscamos constantemente nuevas formas de mejorar y facilitar la experiencia deportiva.'
    },
    {
      titulo: 'Compromiso',
      descripcion: 'Estamos dedicados a promover el deporte y el bienestar en nuestra comunidad.'
    },
    {
      titulo: 'Integridad',
      descripcion: 'Actuamos con honestidad y transparencia en todas nuestras operaciones.'
    },
    {
      titulo: 'Pasión',
      descripcion: 'Amamos el deporte y trabajamos con entusiasmo para servir a nuestra comunidad deportiva.'
    }
  ];
}