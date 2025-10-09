import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-articulo-cancha',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './articulo-cancha.html',
  styleUrls: ['./articulo-cancha.css']

})
export class ArticuloCanchaComponent {
  constructor(private router: Router) {}

  navigateToArticle() {
    this.router.navigate(['/articulos/cancha-futbol']);
  }
}