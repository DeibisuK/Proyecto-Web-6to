import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-articulo-padel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './articulo-padel.html',
  styleUrls: ['./articulo-padel.css']

})
export class ArticuloPadelComponent {
  constructor(private router: Router) {}

  navigateToArticle() {
    this.router.navigate(['/articulos/padel-beneficios']);
  }
}