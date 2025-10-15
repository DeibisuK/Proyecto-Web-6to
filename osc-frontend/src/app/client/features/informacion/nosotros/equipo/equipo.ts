import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface TeamMember {
  nombre: string;
  cargo: string;
  descripcion: string;
  imagen: string;
  correo: string;
}

@Component({
  selector: 'app-equipo',
  imports: [CommonModule, FormsModule],
  templateUrl: './equipo.html',
  styleUrl: './equipo.css'
})
export class Equipo {
teamMembers: TeamMember[] = [
    {
      nombre: 'Gary Barreiro',
      cargo: 'Full Stack Developer',
      descripcion: 'Especialista en Angular y Node.js con experiencia en el desarrollo de aplicaciones web escalables.',
      imagen: 'por poner',
      correo: 'gbarreiro2@utmachala.edu.ec'
    },
    {
      nombre: 'Jhon Cruz',
      cargo: 'Backend Developer',
      descripcion: 'Programador backend con amplio conocimiento en bases de datos y APIs RESTful.',
      imagen: 'por poner',
      correo: 'jcruz21@utmachala.edu.ec'
    },
    {
      nombre: 'Javier Cellan',
      cargo: 'Backend Developer',
      descripcion: 'Programador backend con amplio conocimiento en bases de datos y APIs RESTful.',
      imagen: 'por poner',
      correo: 'jcellan2@utmachala.edu.ec'
    },
    {
      nombre: 'Sanyi Cajamarca',
      cargo: 'Frontend Developer',
      descripcion: 'Desarrolladora frontend con experiencia en Angular y diseño de interfaces.',
      imagen: 'por poner',
      correo: 'nose@gmail.com'
    },
    {
      nombre: 'Sandy Cajamarca',
      cargo: 'Frontend Developer',
      descripcion: 'Desarrolladora frontend con experiencia en Angular y diseño de interfaces.',
      imagen: 'por poner',
      correo: 'nose@gmail.com'
    }
  ];
}