import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
    @Output() cerrarModal = new EventEmitter<void>();

  usuario = '';
  password = '';

  login() {
    console.log('Login con:', this.usuario);
    // Si login exitoso:
    this.cerrarModal.emit();
  }


}
