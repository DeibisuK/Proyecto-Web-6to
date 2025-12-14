import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CanchaService } from '@shared/services/index';
import { SedeService } from '@shared/services/index';
import { RatingService } from '@shared/services/rating.service';
import { AuthService } from '@core/services/auth.service';
import { NotificationService } from '@core/services/notification.service';
import { Sedes } from '@shared/models/index';
import { Cancha } from '@shared/models/index';
import { Rating, RatingEstadisticas } from '@shared/models/rating.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import QRCode from 'qrcode';

@Component({
  selector: 'app-detalle-reservar-cancha',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './detalle-reservar-cancha.html',
  styleUrls: ['./detalle-reservar-cancha.css']
})
export class DetalleReservarCancha implements OnInit, AfterViewInit {

  @ViewChild('qrCanvas', { static: false }) qrCanvas!: ElementRef<HTMLCanvasElement>;

  private ratingService = inject(RatingService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  cancha?: Cancha;
  sede?: Sedes;

  fechaSeleccionada: string = '';
  minDate: string = '';
  duracionSeleccionada: number = 1;
  duracionTexto: string = '1 Hora';
  dropdownDuracionAbierto: boolean = false;
  opcionesDuracion = [
    { valor: 1, texto: '1 Hora' },
    { valor: 1.5, texto: '1.5 Horas' },
    { valor: 2, texto: '2 Horas' },
    { valor: 3, texto: '3 Horas' }
  ];
  horariosDisponibles: { hora: string, reservado: boolean }[] = [];
  horarioSeleccionado: any = null;
  totalPagar: number = 0;

  // Ratings
  comentarios: Rating[] = [];
  estadisticas?: RatingEstadisticas;
  promedioEstrellas: number = 0;
  totalRatings: number = 0;

  // Modal de nuevo rating
  mostrarModalRating: boolean = false;
  nuevaCalificacion: number = 0;
  nuevoComentario: string = '';
  enviandoRating: boolean = false;
  modoEdicion: boolean = false;
  ratingEditandoId?: number;

  // Loading state
  cargando: boolean = true;

  // Exponer Math para el template
  Math = Math;

  constructor(
    private route: ActivatedRoute,
    private canchaService: CanchaService,
    private sedeService: SedeService
  ) {}

  ngOnInit(): void {
    // ✅ Establecer la fecha mínima (hoy)
    const hoy = new Date();
    this.minDate = hoy.toISOString().split('T')[0];

    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.cargarCancha(id);
      this.cargarRatings(id);
    }

    // Cargar horarios de ejemplo (simulación temporal)
    this.horariosDisponibles = [
      { hora: '09:00', reservado: false },
      { hora: '10:00', reservado: false },
      { hora: '11:00', reservado: true },
      { hora: '12:00', reservado: false },
      { hora: '13:00', reservado: false },
      { hora: '14:00', reservado: true },
      { hora: '17:00', reservado: false },
      { hora: '18:00', reservado: false },
      { hora: '19:00', reservado: false },
      { hora: '20:00', reservado: false },
      { hora: '21:00', reservado: false },
    ];
  }

  ngAfterViewInit(): void {
    // Genera el QR después de que la vista se inicialice
    setTimeout(() => this.generarQR(), 100);
  }

  /** Carga los datos de la cancha por ID desde la API */
  cargarCancha(id: number): void {
    this.cargando = true;
    this.canchaService.getCanchaById(id).subscribe({
      next: (data) => {
        this.cancha = data;

        // Si la cancha tiene id_sede, cargamos su información
        if (data.id_sede) {
          this.cargarSede(data.id_sede);
        }
        this.cargando = false;
      },
      error: (err) => {
        this.cargando = false;
      }
    });
  }

  /** Carga la información de la sede asociada a la cancha */
  cargarSede(idSede: number): void {
    this.sedeService.getSedeById(idSede).subscribe({
      next: (sedeData) => {
        this.sede = sedeData;
      },
      error: (err) => {
      }
    });
  }

  /** Selecciona un horario disponible */
  seleccionarHorario(horario: any): void {
    if (!horario.reservado) {
      this.horarioSeleccionado = horario;
      this.calcularTotal();
    }
  }

  /** Calcula el total a pagar según duración y tarifa */
  calcularTotal(): void {
    if (this.cancha) {
      this.totalPagar = this.cancha.tarifa * this.duracionSeleccionada;
    }
  }

  /** Toggle dropdown de duración */
  toggleDropdownDuracion(): void {
    this.dropdownDuracionAbierto = !this.dropdownDuracionAbierto;
  }

  /** Seleccionar duración del dropdown */
  seleccionarDuracion(opcion: { valor: number, texto: string }): void {
    this.duracionSeleccionada = opcion.valor;
    this.duracionTexto = opcion.texto;
    this.dropdownDuracionAbierto = false;
    this.calcularTotal();
  }

  /** Carga los ratings de la cancha */
  cargarRatings(idCancha: number): void {
    // Cargar comentarios
    this.ratingService.getRatingsByCancha(idCancha).subscribe({
      next: (ratings) => {
        this.comentarios = ratings.map(r => ({
          ...r,
          iniciales: this.obtenerIniciales(r.nombre_usuario || r.email_usuario || 'Usuario'),
          nombre: r.nombre_usuario || r.email_usuario || 'Usuario Anónimo',
          fecha: this.formatearFecha(r.fecha_registro)
        }));
      },
      error: (err) => {
        this.comentarios = []; // Asegurar que esté vacío si falla
      }
    });

    // Cargar estadísticas
    this.ratingService.getEstadisticasCancha(idCancha).subscribe({
      next: (stats) => {
        this.estadisticas = stats;
        this.promedioEstrellas = stats.promedio_estrellas;
        this.totalRatings = stats.total_ratings;
      },
      error: (err) => {
      }
    });
  }

  /** Obtiene las iniciales de un nombre */
  obtenerIniciales(nombre: string): string {
    const palabras = nombre.trim().split(' ');
    if (palabras.length >= 2) {
      return (palabras[0][0] + palabras[1][0]).toUpperCase();
    }
    return nombre.substring(0, 2).toUpperCase();
  }

  /** Formatea la fecha a texto legible */
  formatearFecha(fecha?: string): string {
    if (!fecha) return 'Recientemente';

    const fechaRating = new Date(fecha);
    const ahora = new Date();
    const diffMs = ahora.getTime() - fechaRating.getTime();
    const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDias === 0) return 'Hoy';
    if (diffDias === 1) return 'Ayer';
    if (diffDias < 7) return `Hace ${diffDias} días`;
    if (diffDias < 30) return `Hace ${Math.floor(diffDias / 7)} semanas`;
    if (diffDias < 365) return `Hace ${Math.floor(diffDias / 30)} meses`;
    return `Hace ${Math.floor(diffDias / 365)} años`;
  }

  /** Simula la confirmación de reserva */
  confirmarReserva(): void {
    if (!this.cancha || !this.horarioSeleccionado || !this.fechaSeleccionada) {
      alert('Por favor selecciona fecha y horario antes de confirmar.');
      return;
    }

    alert(`Reserva confirmada para la cancha "${this.cancha.nombre_cancha}"
el día ${this.fechaSeleccionada} a las ${this.horarioSeleccionado.hora}.`);
  }

  /** Genera la URL para el código QR */
  getReservaQrUrl(): string {
    const canchaId = this.route.snapshot.paramMap.get('id');
    return `${window.location.origin}/client/tienda/reservar-cancha/${canchaId}`;
  }

  /** Genera el código QR en el canvas */
  async generarQR(): Promise<void> {
    if (!this.qrCanvas) return;

    try {
      const url = this.getReservaQrUrl();
      await QRCode.toCanvas(this.qrCanvas.nativeElement, url, {
        width: 220,
        margin: 2,
        color: {
          dark: '#2ECC71',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });
    } catch (error) {
    }
  }

  /** Abre el modal para dejar un rating */
  abrirModalRating(): void {
    const user = this.authService.currentUser;
    if (!user) {
      this.notificationService.error('Debes iniciar sesión para dejar una reseña');
      return;
    }
    this.modoEdicion = false;
    this.ratingEditandoId = undefined;
    this.mostrarModalRating = true;
    this.nuevaCalificacion = 0;
    this.nuevoComentario = '';
  }

  /** Abre el modal para editar un rating existente */
  abrirModalEdicion(rating: Rating): void {
    const user = this.authService.currentUser;
    if (!user || rating.firebase_uid !== user.uid) {
      this.notificationService.error('No tienes permiso para editar esta reseña');
      return;
    }
    this.modoEdicion = true;
    this.ratingEditandoId = rating.id_rating;
    this.mostrarModalRating = true;
    this.nuevaCalificacion = rating.estrellas;
    this.nuevoComentario = rating.comentario || '';
  }

  /** Cierra el modal de rating */
  cerrarModalRating(): void {
    this.mostrarModalRating = false;
    this.nuevaCalificacion = 0;
    this.nuevoComentario = '';
  }

  /** Selecciona las estrellas en el modal */
  seleccionarEstrellas(estrellas: number): void {
    this.nuevaCalificacion = estrellas;
  }

  /** Calcula el porcentaje de ratings para cada nivel de estrellas */
  calcularPorcentaje(estrellas: number): number {
    if (!this.estadisticas || this.estadisticas.total_ratings === 0) {
      return 0;
    }
    const key = `ratings_${estrellas}_estrella${estrellas !== 1 ? 's' : ''}` as keyof RatingEstadisticas;
    const count = this.estadisticas[key] as number || 0;
    return Math.round((count / this.estadisticas.total_ratings) * 100);
  }

  /** Obtiene el texto descriptivo del rating promedio */
  obtenerTextoRating(): string {
    const promedio = this.promedioEstrellas;
    if (promedio === 0 || this.totalRatings === 0) return 'Sin reseñas';
    if (promedio >= 4.5) return 'Excelente';
    if (promedio >= 3.5) return 'Muy bueno';
    if (promedio >= 2.5) return 'Bueno';
    if (promedio >= 1.5) return 'Regular';
    return 'Malo';
  }

  /** Envía el rating al servidor */
  enviarRating(): void {
    const user = this.authService.currentUser;
    if (!user || !this.cancha?.id_cancha) {
      this.notificationService.error('Error: No se pudo obtener la información del usuario o la cancha');
      return;
    }

    if (this.nuevaCalificacion === 0) {
      this.notificationService.error('Por favor selecciona una calificación');
      return;
    }

    this.enviandoRating = true;

    if (this.modoEdicion && this.ratingEditandoId) {
      // Actualizar rating existente
      this.ratingService.updateRating(this.ratingEditandoId, {
        estrellas: this.nuevaCalificacion,
        comentario: this.nuevoComentario.trim() || undefined
      }).subscribe({
        next: (rating) => {
          this.notificationService.success('Reseña actualizada correctamente');
          this.cerrarModalRating();
          // Actualizar en tiempo real
          this.actualizarRatingEnLista(rating);
          // Recargar estadísticas
          if (this.cancha?.id_cancha) {
            this.cargarEstadisticas(this.cancha.id_cancha);
          }
          this.enviandoRating = false;
        },
        error: (err) => {
          this.notificationService.error('Error al actualizar tu reseña. Intenta de nuevo.');
          this.enviandoRating = false;
        }
      });
    } else {
      // Crear nuevo rating
      this.ratingService.createRating({
        id_cancha: this.cancha.id_cancha,
        firebase_uid: user.uid,
        estrellas: this.nuevaCalificacion,
        comentario: this.nuevoComentario.trim() || undefined
      }).subscribe({
        next: (rating) => {
          this.notificationService.success('¡Gracias por tu reseña!');
          this.cerrarModalRating();
          // Agregar en tiempo real
          this.agregarRatingEnLista(rating, user);
          // Recargar estadísticas
          if (this.cancha?.id_cancha) {
            this.cargarEstadisticas(this.cancha.id_cancha);
          }
          this.enviandoRating = false;
        },
        error: (err) => {
          if (err.status === 409) {
            this.notificationService.error('Ya has dejado una reseña para esta cancha');
          } else {
            this.notificationService.error('Error al enviar tu reseña. Intenta de nuevo.');
          }
          this.enviandoRating = false;
        }
      });
    }
  }

  /** Agregar rating a la lista en tiempo real */
  agregarRatingEnLista(rating: Rating, user: any): void {
    const nuevoComentario = {
      ...rating,
      iniciales: this.obtenerIniciales(user.name || user.email || 'Usuario'),
      nombre: user.name || user.email || 'Usuario Anónimo',
      fecha: this.formatearFecha(rating.fecha_registro)
    };
    this.comentarios = [nuevoComentario, ...this.comentarios];
    this.totalRatings++;
    // Recalcular promedio y estadísticas en tiempo real
    this.recalcularEstadisticasLocal();
  }

  /** Actualizar rating en la lista en tiempo real */
  actualizarRatingEnLista(rating: Rating): void {
    const index = this.comentarios.findIndex(c => c.id_rating === rating.id_rating);
    if (index !== -1) {
      this.comentarios[index] = {
        ...this.comentarios[index],
        estrellas: rating.estrellas,
        comentario: rating.comentario,
        fecha_actualizacion: rating.fecha_actualizacion
      };
      this.comentarios = [...this.comentarios];
      // Recalcular promedio y estadísticas en tiempo real
      this.recalcularEstadisticasLocal();
    }
  }

  /** Carga solo las estadísticas */
  cargarEstadisticas(idCancha: number): void {
    this.ratingService.getEstadisticasCancha(idCancha).subscribe({
      next: (stats) => {
        this.estadisticas = stats;
        this.promedioEstrellas = stats.promedio_estrellas;
        this.totalRatings = stats.total_ratings;
      },
      error: (err) => {
      }
    });
  }

  /** Verifica si el usuario actual puede editar este comentario */
  puedeEditarComentario(rating: Rating): boolean {
    const user = this.authService.currentUser;
    return user !== null && rating.firebase_uid === user.uid;
  }

  /** Eliminar comentario con confirmación */
  eliminarComentario(rating: Rating): void {
    const user = this.authService.currentUser;
    if (!user || rating.firebase_uid !== user.uid) {
      this.notificationService.error('No tienes permiso para eliminar esta reseña');
      return;
    }

    // @ts-ignore - SweetAlert2 está disponible globalmente
    Swal.fire({
      title: '¿Eliminar reseña?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#E74C3C',
      cancelButtonColor: '#95A5A6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    }).then((result: any) => {
      if (result.isConfirmed && rating.id_rating) {
        this.ratingService.deleteRating(rating.id_rating).subscribe({
          next: () => {
            this.notificationService.success('Reseña eliminada correctamente');
            // Eliminar de la lista en tiempo real
            this.comentarios = this.comentarios.filter(c => c.id_rating !== rating.id_rating);
            this.totalRatings--;
            // Recalcular estadísticas
            this.recalcularEstadisticasLocal();
          },
          error: (err) => {
            console.error('❌ Error al eliminar rating:', err);
            this.notificationService.error('Error al eliminar tu reseña. Intenta de nuevo.');
          }
        });
      }
    });
  }

  /** Recalcula todas las estadísticas localmente para actualización en tiempo real */
  recalcularEstadisticasLocal(): void {
    if (this.comentarios.length === 0) {
      this.promedioEstrellas = 0;
      this.totalRatings = 0;
      if (this.estadisticas) {
        this.estadisticas.total_ratings = 0;
        this.estadisticas.promedio_estrellas = 0;
        this.estadisticas.ratings_5_estrellas = 0;
        this.estadisticas.ratings_4_estrellas = 0;
        this.estadisticas.ratings_3_estrellas = 0;
        this.estadisticas.ratings_2_estrellas = 0;
        this.estadisticas.ratings_1_estrella = 0;
      }
      return;
    }

    // Calcular totales
    const total = this.comentarios.length;
    const suma = this.comentarios.reduce((acc, c) => acc + c.estrellas, 0);
    const promedio = parseFloat((suma / total).toFixed(2));

    // Contar por estrellas
    const conteo = {
      5: this.comentarios.filter(c => c.estrellas === 5).length,
      4: this.comentarios.filter(c => c.estrellas === 4).length,
      3: this.comentarios.filter(c => c.estrellas === 3).length,
      2: this.comentarios.filter(c => c.estrellas === 2).length,
      1: this.comentarios.filter(c => c.estrellas === 1).length
    };

    // Actualizar variables
    this.promedioEstrellas = promedio;
    this.totalRatings = total;

    // Actualizar estadísticas
    if (this.estadisticas) {
      this.estadisticas.total_ratings = total;
      this.estadisticas.promedio_estrellas = promedio;
      this.estadisticas.ratings_5_estrellas = conteo[5];
      this.estadisticas.ratings_4_estrellas = conteo[4];
      this.estadisticas.ratings_3_estrellas = conteo[3];
      this.estadisticas.ratings_2_estrellas = conteo[2];
      this.estadisticas.ratings_1_estrella = conteo[1];
    }
  }
}
