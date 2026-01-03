import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { CanchaService } from '@shared/services/index';
import { SedeService } from '@shared/services/index';
import { ReservaService } from '@shared/services/reserva.service';
import { RatingService } from '@shared/services/rating.service';
import { MetodoPagoService } from '@shared/services/metodo-pago.service';
import { AuthService } from '@core/services/auth.service';
import { NotificationService } from '@core/services/notification.service';
import { Sedes } from '@shared/models/index';
import { Cancha } from '@shared/models/index';
import { Rating, RatingEstadisticas } from '@shared/models/rating.model';
import { MetodoPago } from '@shared/models/metodo-pago.model';
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

  cancha?: Cancha;
  sede?: Sedes;

  fechaSeleccionada: string = '';
  minDate: string = '';

  // Días y horarios
  diasDisponibles: { valor: number, texto: string }[] = [];
  diaSeleccionado: number | null = null;
  dropdownDiasAbierto: boolean = false;
  diaTexto: string = 'Selecciona un día';

  todosLosHorarios: { dia_semana: number, hora_inicio: string, hora_fin: string }[] = [];
  horariosDelDia: { hora_inicio: string, hora_fin: string, reservado: boolean }[] = [];
  horarioSeleccionado: any = null;
  totalPagar: number = 0;

  // Métodos de pago
  tipoPagoSeleccionado: 'efectivo' | 'virtual' = 'efectivo';
  metodosPago: MetodoPago[] = [];
  metodoPagoSeleccionado: number | null = null;
  cargandoMetodosPago: boolean = false;

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

  // ID de la última reserva creada (para QR permanente)
  ultimaReservaId: number | null = null;

  // Exponer Math para el template
  Math = Math;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private canchaService: CanchaService,
    private sedeService: SedeService,
    private reservaService: ReservaService,
    private ratingService: RatingService,
    private metodoPagoService: MetodoPagoService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    // ✅ Establecer la fecha mínima (hoy)
    const hoy = new Date();
    this.minDate = hoy.toISOString().split('T')[0];

    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.cargarCancha(id);
      this.cargarHorariosDisponibles(id);
      this.cargarRatings(id);
    }
  }

  ngAfterViewInit(): void {
    // El QR se generará después de crear una reserva exitosamente
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

  /** Calcula el total a pagar (tarifa fija de 1 hora por horario) */
  calcularTotal(): void {
    if (this.cancha && this.horarioSeleccionado) {
      this.totalPagar = this.cancha.tarifa;
    } else {
      this.totalPagar = 0;
    }
  }

  /** Carga los horarios disponibles reales de la cancha */
  cargarHorariosDisponibles(idCancha: number): void {
    this.canchaService.getHorariosDisponibles(idCancha).subscribe({
      next: (horarios) => {
        this.todosLosHorarios = horarios;

        // Obtener días únicos
        const diasUnicos = [...new Set(horarios.map(h => h.dia_semana))];
        const nombresDias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

        this.diasDisponibles = diasUnicos.map(dia => ({
          valor: dia,
          texto: nombresDias[dia]
        })).sort((a, b) => a.valor - b.valor);

        // Si hay días disponibles, seleccionar el primero
        if (this.diasDisponibles.length > 0) {
          // Calcular la fecha del primer día disponible
          const primerDia = this.diasDisponibles[0];
          this.diaSeleccionado = primerDia.valor;
          this.diaTexto = primerDia.texto;
          this.fechaSeleccionada = this.calcularProximaFechaPorDia(primerDia.valor);

          // Cargar horarios con estado de reserva
          this.cargarHorariosConReservas(idCancha, this.fechaSeleccionada);
        }
      },
      error: (err) => {
        console.error('Error al cargar horarios disponibles:', err);
        this.todosLosHorarios = [];
        this.diasDisponibles = [];
      }
    });
  }

  /** Toggle dropdown de días */
  toggleDropdownDias(): void {
    this.dropdownDiasAbierto = !this.dropdownDiasAbierto;
  }

  /** Seleccionar día del dropdown */
  seleccionarDia(opcion: { valor: number, texto: string }): void {
    this.diaSeleccionado = opcion.valor;
    this.diaTexto = opcion.texto;
    this.dropdownDiasAbierto = false;
    this.horarioSeleccionado = null;

    // Calcular la fecha automáticamente basada en el día seleccionado
    this.fechaSeleccionada = this.calcularProximaFechaPorDia(opcion.valor);

    // Cargar horarios con estado de reserva para la fecha específica
    if (this.cancha?.id_cancha) {
      this.cargarHorariosConReservas(this.cancha.id_cancha, this.fechaSeleccionada);
    }

    this.calcularTotal();
  }

  /** Cargar horarios con estado de reserva para una fecha específica */
  cargarHorariosConReservas(idCancha: number, fecha: string): void {
    console.log('🔍 Frontend: Solicitando horarios para', { idCancha, fecha });

    this.canchaService.getHorariosConReservas(idCancha, fecha).subscribe({
      next: (horarios) => {
        console.log('📊 Frontend: Horarios recibidos:', horarios.length);
        console.log('🔴 Frontend: Horarios reservados:', horarios.filter(h => h.reservado).length);
        console.log('📋 Frontend: Detalle horarios:', horarios);

        this.horariosDelDia = horarios.map(h => ({
          hora_inicio: h.hora_inicio.substring(0, 5),
          hora_fin: h.hora_fin.substring(0, 5),
          reservado: h.reservado
        }));
      },
      error: (err) => {
        console.error('Error al cargar horarios con reservas:', err);
        // Fallback: usar horarios sin verificar reservas
        this.horariosDelDia = this.todosLosHorarios
          .filter(h => h.dia_semana === this.diaSeleccionado)
          .map(h => ({
            hora_inicio: h.hora_inicio.substring(0, 5),
            hora_fin: h.hora_fin.substring(0, 5),
            reservado: false
          }));
      }
    });
  }

  /** Calcula la próxima fecha que corresponde al día de la semana seleccionado */
  calcularProximaFechaPorDia(diaSemana: number): string {
    const hoy = new Date();
    const diaActual = hoy.getDay(); // 0 = Domingo, 1 = Lunes, etc.

    let diasHastaProximo = diaSemana - diaActual;

    // Si el día ya pasó esta semana, calcular para la próxima semana
    if (diasHastaProximo <= 0) {
      diasHastaProximo += 7;
    }

    const proximaFecha = new Date(hoy);
    proximaFecha.setDate(hoy.getDate() + diasHastaProximo);

    return proximaFecha.toISOString().split('T')[0];
  }

  /** Obtiene texto legible de la fecha seleccionada */
  obtenerTextoFecha(): string {
    if (!this.fechaSeleccionada) return '';

    const fecha = new Date(this.fechaSeleccionada + 'T00:00:00');
    const opciones: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };

    return fecha.toLocaleDateString('es-ES', opciones);
  }

  /** Cambia el tipo de pago seleccionado */
  cambiarTipoPago(tipo: 'efectivo' | 'virtual'): void {
    this.tipoPagoSeleccionado = tipo;
    this.metodoPagoSeleccionado = null;

    // Si se selecciona virtual, cargar métodos de pago del usuario
    if (tipo === 'virtual') {
      this.cargarMetodosPago();
    }
  }

  /** Carga los métodos de pago del usuario */
  cargarMetodosPago(): void {
    const usuario = this.authService.currentUser;
    if (!usuario || !usuario.uid) {
      this.notificationService.error('Debes iniciar sesión');
      return;
    }

    this.cargandoMetodosPago = true;
    this.metodoPagoService.getMetodosPagoByUser(usuario.uid).subscribe({
      next: (metodos) => {
        this.metodosPago = metodos;
        this.cargandoMetodosPago = false;

        // Si no hay métodos de pago, notificar al usuario
        if (metodos.length === 0) {
          this.notificationService.error('No tienes métodos de pago registrados. Agrega uno en tu perfil.');
        }
      },
      error: (err) => {
        console.error('Error al cargar métodos de pago:', err);
        this.cargandoMetodosPago = false;
        this.metodosPago = [];
        this.notificationService.error('Error al cargar métodos de pago');
      }
    });
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

  /** Confirma y crea la reserva */
  confirmarReserva(): void {
    if (!this.cancha || !this.horarioSeleccionado || !this.fechaSeleccionada) {
      this.notificationService.error('Por favor selecciona fecha y horario antes de confirmar.');
      return;
    }

    // Validar que si es pago virtual, se haya seleccionado un método de pago
    if (this.tipoPagoSeleccionado === 'virtual') {
      if (!this.metodoPagoSeleccionado) {
        this.notificationService.error('Por favor selecciona un método de pago.');
        return;
      }
      if (this.metodosPago.length === 0) {
        this.notificationService.error('No tienes métodos de pago registrados. Agrega uno en tu perfil.');
        return;
      }
    }

    const usuario = this.authService.currentUser;
    if (!usuario || !usuario.uid) {
      this.notificationService.error('Debes iniciar sesión para reservar');
      this.router.navigate(['/auth/login']);
      return;
    }

    const reserva: any = {
      id_cancha: this.cancha.id_cancha!,
      id_usuario: usuario.uid,
      fecha_reserva: this.fechaSeleccionada,
      hora_inicio: this.horarioSeleccionado.hora_inicio,
      duracion_minutos: 60,
      monto_total: this.totalPagar,
      tipo_pago: this.tipoPagoSeleccionado,
      estado_pago: this.tipoPagoSeleccionado === 'virtual' ? 'pagado' : 'pendiente',
      notas: ''
    };

    // Si es pago virtual, agregar el id del método de pago
    if (this.tipoPagoSeleccionado === 'virtual' && this.metodoPagoSeleccionado) {
      reserva.id_metodo_pago = this.metodoPagoSeleccionado;
    }

    this.reservaService.createReservaCliente(reserva).subscribe({
      next: (response) => {
        // Guardar ID de la reserva creada
        this.ultimaReservaId = response.id_reserva || null;

        // Regenerar QR con URL permanente
        if (this.ultimaReservaId) {
          setTimeout(() => this.generarQR(), 100);
        }

        this.notificationService.success(`Reserva creada exitosamente para ${this.cancha!.nombre_cancha}`);

        // Navegar después de un pequeño delay para que se vea el QR
        setTimeout(() => {
          this.router.navigate(['/mis-reservas']);
        }, 2000);
      },
      error: (error) => {
        console.error('Error al crear reserva:', error);
        this.notificationService.error(error.error?.message || 'Error al crear la reserva');
      }
    });
  }

  /** Genera la URL para el código QR */
  getReservaQrUrl(): string {
    if (this.ultimaReservaId) {
      // URL permanente a la reserva específica
      return `${window.location.origin}/mis-reservas/${this.ultimaReservaId}`;
    }
    // Fallback: URL de la cancha
    const canchaId = this.route.snapshot.paramMap.get('id');
    return `${window.location.origin}/reservar-cancha/${canchaId}`;
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
