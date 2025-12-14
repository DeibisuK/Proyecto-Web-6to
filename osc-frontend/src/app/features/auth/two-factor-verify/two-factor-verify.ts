import { Component, EventEmitter, Output, Input, inject, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NotificationService } from '@core/services/notification.service';
import { TwoFactorService } from '@core/services/two-factor.service';

interface UsuarioTemporal {
  uid: string;
  email: string;
  nombre: string;
}

@Component({
  selector: 'app-two-factor-verify',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './two-factor-verify.html',
  styleUrls: ['./two-factor-verify.css'],
})
export class TwoFactorVerify implements OnInit, OnDestroy {
  private twoFactorService = inject(TwoFactorService);
  private notificationService = inject(NotificationService);

  @Input() usuario!: UsuarioTemporal;
  @Output() verificacionExitosa = new EventEmitter<{ tokenDispositivo?: string }>();
  @Output() cancelar = new EventEmitter<void>();

  // Código dividido en 6 inputs
  codigo = ['', '', '', '', '', ''];

  // Estado
  verificando = false;
  mantenerSesion = false;
  tiempoRestante = 180; // 180 segundos
  intervalo: any = null;
  expiro = false;

  ngOnInit() {
    this.iniciarContador();
  }

  ngOnDestroy() {
    if (this.intervalo) {
      clearInterval(this.intervalo);
    }
  }

  iniciarContador() {
    this.tiempoRestante = 180;
    this.expiro = false;

    if (this.intervalo) {
      clearInterval(this.intervalo);
    }

    this.intervalo = setInterval(() => {
      this.tiempoRestante--;

      if (this.tiempoRestante <= 0) {
        clearInterval(this.intervalo);
        this.expiro = true;
        this.notificationService.notify({
          message: 'El código ha expirado. Solicita uno nuevo.',
          type: 'error',
        });
      }
    }, 1000);
  }

  onInput(index: number, event: any) {
    const input = event.target as HTMLInputElement;
    const valor = input.value;

    // Solo permitir números
    if (!/^\d*$/.test(valor)) {
      input.value = this.codigo[index];
      return;
    }

    // Actualizar el código
    this.codigo[index] = valor.slice(-1); // Solo el último carácter
    input.value = this.codigo[index];

    // Auto-focus al siguiente input
    if (this.codigo[index] && index < 5) {
      const siguienteInput = document.getElementById(`codigo-${index + 1}`) as HTMLInputElement;
      if (siguienteInput) {
        siguienteInput.focus();
      }
    }

    // Si se completaron los 6 dígitos, verificar automáticamente
    if (this.codigo.every(d => d !== '') && !this.verificando) {
      this.verificarCodigo();
    }
  }

  onKeyDown(index: number, event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;

    // Backspace: borrar y regresar al anterior
    if (event.key === 'Backspace') {
      if (!this.codigo[index] && index > 0) {
        const anteriorInput = document.getElementById(`codigo-${index - 1}`) as HTMLInputElement;
        if (anteriorInput) {
          this.codigo[index - 1] = '';
          anteriorInput.value = '';
          anteriorInput.focus();
        }
      } else {
        this.codigo[index] = '';
        input.value = '';
      }
    }

    // Flecha izquierda
    if (event.key === 'ArrowLeft' && index > 0) {
      const anteriorInput = document.getElementById(`codigo-${index - 1}`) as HTMLInputElement;
      if (anteriorInput) {
        anteriorInput.focus();
      }
    }

    // Flecha derecha
    if (event.key === 'ArrowRight' && index < 5) {
      const siguienteInput = document.getElementById(`codigo-${index + 1}`) as HTMLInputElement;
      if (siguienteInput) {
        siguienteInput.focus();
      }
    }

    // Pegar
    if (event.key === 'v' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      navigator.clipboard.readText().then(texto => {
        this.pegarCodigo(texto);
      });
    }
  }

  pegarCodigo(texto: string) {
    const numeros = texto.replace(/\D/g, '').slice(0, 6);
    for (let i = 0; i < 6; i++) {
      this.codigo[i] = numeros[i] || '';
      const input = document.getElementById(`codigo-${i}`) as HTMLInputElement;
      if (input) {
        input.value = this.codigo[i];
      }
    }

    // Si se pegó un código completo, verificar
    if (numeros.length === 6 && !this.verificando) {
      this.verificarCodigo();
    }
  }

  async verificarCodigo() {
    if (this.expiro) {
      this.notificationService.notify({
        message: 'El código ha expirado. Solicita uno nuevo.',
        type: 'error',
      });
      return;
    }

    const codigoCompleto = this.codigo.join('');

    if (codigoCompleto.length !== 6) {
      this.notificationService.notify({
        message: 'Ingresa el código completo de 6 dígitos.',
        type: 'error',
      });
      return;
    }

    this.verificando = true;

    try {
      const resultado = await this.twoFactorService.verificarCodigo(
        this.usuario.uid,
        codigoCompleto,
        this.mantenerSesion
      ) as any;

      if (resultado.success) {
        clearInterval(this.intervalo);
        this.notificationService.notify({
          message: 'Código verificado. Accediendo...',
          type: 'success',
        });

        // Emitir evento de verificación exitosa
        this.verificacionExitosa.emit({
          tokenDispositivo: resultado.tokenDispositivo
        });
      } else {
        this.notificationService.notify({
          message: resultado.error || 'Código incorrecto.',
          type: 'error',
        });

        // Limpiar código
        this.codigo = ['', '', '', '', '', ''];
        const primerInput = document.getElementById('codigo-0') as HTMLInputElement;
        if (primerInput) {
          primerInput.focus();
        }
      }
    } catch (error: any) {
      this.notificationService.notify({
        message: error.message || 'Error al verificar el código.',
        type: 'error',
      });
    } finally {
      this.verificando = false;
    }
  }

  async reenviarCodigo() {
    if (this.verificando) return;

    this.verificando = true;

    try {
      const resultado = await this.twoFactorService.reenviarCodigo(this.usuario.uid) as any;

      if (resultado.success) {
        this.notificationService.notify({
          message: 'Código reenviado a tu correo',
          type: 'success',
        });

        // Reiniciar contador
        this.iniciarContador();

        // Limpiar código
        this.codigo = ['', '', '', '', '', ''];
        const primerInput = document.getElementById('codigo-0') as HTMLInputElement;
        if (primerInput) {
          primerInput.focus();
        }
      } else {
        this.notificationService.notify({
          message: resultado.error || 'Error al reenviar código.',
          type: 'error',
        });
      }
    } catch (error: any) {
      this.notificationService.notify({
        message: error.message || 'Error al reenviar código.',
        type: 'error',
      });
    } finally {
      this.verificando = false;
    }
  }

  get tiempoFormateado(): string {
    const minutos = Math.floor(this.tiempoRestante / 60);
    const segundos = this.tiempoRestante % 60;
    return `${minutos}:${segundos.toString().padStart(2, '0')}`;
  }

  cancelarVerificacion() {
    if (this.intervalo) {
      clearInterval(this.intervalo);
    }
    this.cancelar.emit();
  }
}
