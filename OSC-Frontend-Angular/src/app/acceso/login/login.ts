import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

declare const google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {
  @Output() cerrarModal = new EventEmitter<void>();
  @Output() abrirRecuperarPassword = new EventEmitter<void>();

  usuario = '';
  password = '';
  isClosing = false;
  isRegisterMode = false;
  isAnimating = false;

  // Formulario de registro
  nombre = '';
  email = '';
  passwordRegistro = '';
  confirmarPassword = '';

  // Estado legible para la UI sobre la inicialización de Google
  googleStatus: string = '';
  // Cliente OAuth2 para abrir el popup y obtener access_token
  tokenClient: any = null;
  // Indica si ya se renderizó el botón oficial de Google
  googleRendered: boolean = false;

  private clientId = '32739807675-1frcp2slu3sm3snpgmq7m5i12tc5ptuk.apps.googleusercontent.com';

  ngOnInit(): void {
    // Pre-cargar la librería de Google para poder renderizar el botón cuando
    // el modal se abra. No lanza prompt automáticamente.
    this.initializeGoogleSignIn();
  }

  // -------------------- Modal --------------------
  abrirModal() {
    this.isClosing = false;
    // Keep as fallback if needed
    setTimeout(() => this.initializeGoogleSignIn(), 100);
  }

  cerrar() {
    this.isClosing = true;
    setTimeout(() => this.cerrarModal.emit(), 300);
  }

  abrirRecuperacion() {
    this.isClosing = true;
    setTimeout(() => this.abrirRecuperarPassword.emit(), 300);
  }

  toggleForm() {
    if (this.isAnimating) return;
    this.isAnimating = true;
    this.isRegisterMode = !this.isRegisterMode;
    setTimeout(() => (this.isAnimating = false), 800);
  }

  login() {
    console.log('Login con:', this.usuario);
    this.cerrar();
  }

  register() {
    console.log('Registro con:', this.nombre, this.email);
    this.cerrar();
  }

  // -------------------- Google --------------------
  initializeGoogleSignIn() {
    if ((window as any).googleInitialized) {
      this.googleStatus = 'Google Sign-In ya inicializado';
      this.renderGoogleButtons();
      return;
    }

    this.googleStatus = 'Cargando Google Sign-In...';
    const existing = document.querySelector('script[src*="accounts.google.com/gsi/client"]');
    if (existing) {
      // Si ya existe el script, marcamos inicializado y renderizamos
      (window as any).googleInitialized = true;
      this.googleStatus = 'Script de Google ya presente';
      setTimeout(() => this.renderGoogleButtons(), 100);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;

    script.onload = () => {
      this.googleStatus = 'Script de Google cargado';

      if (typeof google === 'undefined' || !google.accounts) {
        this.googleStatus = 'Google API no disponible después de cargar script';
        console.error(this.googleStatus);
        return;
      }

      try {
        google.accounts.id.initialize({
          client_id: this.clientId,
          callback: (response: any) => this.handleGoogleResponse(response),
          auto_select: false,
          cancel_on_tap_outside: true
        });

        // Inicializa tokenClient si la API oauth2 está disponible
        try {
          if (google.accounts.oauth2 && google.accounts.oauth2.initTokenClient) {
            this.tokenClient = google.accounts.oauth2.initTokenClient({
              client_id: this.clientId,
              scope: 'openid profile email',
              callback: (tokenResponse: any) => this.handleTokenResponse(tokenResponse)
            });
          }
        } catch (err) {
          console.warn('No se pudo inicializar tokenClient:', err);
        }

        (window as any).googleInitialized = true;
        this.googleStatus = 'Google inicializado';
        this.renderGoogleButtons();
      } catch (error) {
        this.googleStatus = 'Error al inicializar Google: ' + (error as any).toString();
        console.error(error);
      }
    };

    script.onerror = () => {
      this.googleStatus = 'Error al cargar el script de Google';
      console.error('Error al cargar el script de Google');
    };

    document.head.appendChild(script);
  }

  renderGoogleButtons() {
    // Renderiza el botón de Google en ambos formularios
    setTimeout(() => {
      const loginButton = document.getElementById('google-signin-login');
      const registerButton = document.getElementById('google-signin-register');

      if (typeof google === 'undefined' || !google.accounts) {
        this.googleStatus = 'Google API no disponible para renderizar botones';
        console.error(this.googleStatus);
        return;
      }

      if (loginButton && !loginButton.hasChildNodes()) {
        try {
          google.accounts.id.renderButton(
            loginButton,
            {
              theme: 'outline',
              size: 'large',
              text: 'signin_with',
              width: loginButton.offsetWidth
            }
          );
          this.googleStatus = '';
          this.googleRendered = true;
        } catch (err) {
          this.googleStatus = 'Error al renderizar botón de login';
          console.error(err);
        }
      }

      if (registerButton && !registerButton.hasChildNodes()) {
        try {
          google.accounts.id.renderButton(
            registerButton,
            {
              theme: 'outline',
              size: 'large',
              text: 'signup_with',
              width: registerButton.offsetWidth
            }
          );
          this.googleStatus = '';
          this.googleRendered = true;
        } catch (err) {
          this.googleStatus = 'Error al renderizar botón de registro';
          console.error(err);
        }
      }
    }, 100);
  }

  handleGoogleResponse(response: any) {
    console.log('Token de Google (One Tap / credential):', response.credential);

    try {
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      console.log('Datos del usuario (credential):', payload);
      alert(`¡Bienvenido ${payload.name}! 🎉`);
      this.cerrar();
    } catch (err) {
      console.error('Error al procesar credential:', err);
    }
  }

  // Maneja la respuesta del tokenClient (popup OAuth2)
  handleTokenResponse(tokenResponse: any) {
    try {
      if (!tokenResponse || !tokenResponse.access_token) {
        console.error('No se recibió access_token desde Google', tokenResponse);
        alert('No fue posible obtener credenciales de Google.');
        return;
      }

      // Obtener información del usuario usando el access_token
      fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: 'Bearer ' + tokenResponse.access_token
        }
      })
        .then(res => res.json())
        .then(profile => {
          console.log('Perfil Google:', profile);
          alert(`¡Bienvenido ${profile.name}! (${profile.email})`);
          this.cerrar();
        })
        .catch(err => {
          console.error('Error al obtener perfil de Google:', err);
          alert('Error al obtener información de perfil de Google.');
        });
    } catch (err) {
      console.error('handleTokenResponse error:', err);
    }
  }

  // Botón fallback: intenta abrir el prompt de Google si la librería ya está cargada,
  // o inicializarla y volver a intentar.
  triggerGooglePrompt(event?: Event) {
    if (event) event.preventDefault();

    try {
      // Preferimos abrir el popup OAuth2 con tokenClient para que el usuario vea
      // la ventana de autenticación estándar (y mantengamos nuestro botón rojo).
      if (this.tokenClient) {
        this.tokenClient.requestAccessToken({ prompt: 'consent' });
        return;
      }

      // Si tokenClient no está disponible, usar prompt() como fallback
      if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
        google.accounts.id.prompt();
        return;
      }

      // Si no está lista, intenta cargar/inicializar y reintentar
      this.initializeGoogleSignIn();
      setTimeout(() => {
        if (this.tokenClient) {
          this.tokenClient.requestAccessToken({ prompt: 'consent' });
        } else if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
          google.accounts.id.prompt();
        } else {
          alert('No fue posible iniciar sesión con Google en este momento. Intenta más tarde.');
        }
      }, 500);
    } catch (err) {
      console.error('Error al intentar abrir prompt de Google:', err);
    }
  }
}
