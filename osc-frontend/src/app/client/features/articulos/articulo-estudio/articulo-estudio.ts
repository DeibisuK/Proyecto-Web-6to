import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-articulo-estudio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './articulo-estudio.html',
  styleUrls: ['./articulo-estudio.css']

})
export class ArticuloEstudioComponent {
  constructor(private router: Router) {}

  navigateToArticle() {
    this.router.navigate(['/articulos/estudio-deportivo']);
  }
}