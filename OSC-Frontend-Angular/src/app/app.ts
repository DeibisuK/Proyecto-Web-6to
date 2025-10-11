import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Navbar } from "./core/components/navbar/navbar";
import { ScrollService } from './core/services/scroll.service';
import { Footer } from './core/components/footer/footer';
import { ScrollTop } from './core/components/scroll-top/scroll-top';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule, RouterOutlet, Navbar, Footer, ScrollTop],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  title = 'OSC-Frontend';
  
  mostrarLogin = false;

  constructor(private scrollService: ScrollService) {}

  abrirLogin() {
    this.mostrarLogin = true;
  }

  cerrarLogin() {
    this.mostrarLogin = false;
  }
}
