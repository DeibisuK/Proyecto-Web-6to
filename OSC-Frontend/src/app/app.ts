import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { Login } from "./acceso/login/login";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule, Login],
  template:`
    <header>
      <button (click)="abrirLogin()">👤</button>
    </header>
    
    <div *ngIf="mostrarLogin" class="modal-overlay">
      <app-login (cerrarModal)="cerrarLogin()"></app-login>
    </div>
  `,
  styleUrl: './app.css'
})
export class App {
  title = 'OSC-Frontend';
  
  // Agregar estas líneas:
  mostrarLogin = false;

  abrirLogin() {
    this.mostrarLogin = true;
  }

  cerrarLogin() {
    this.mostrarLogin = false;

}
}
