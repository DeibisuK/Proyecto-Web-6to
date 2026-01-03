import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserApiService, UltimaReserva } from '@shared/services/user-api.service';

interface StatCard {
  label: string;
  value: string | number;
  iconType: 'calendar' | 'users' | 'trending' | 'star';
  colorClass: 'green' | 'blue' | 'amber';
}

interface Sport {
  name: string;
  percent: number;
  color: string;
}

interface Reservation {
  user: string;
  initials: string;
  sport: string;
  court: string;
  time: string;
  status: 'confirmed' | 'pending';
}

interface Court {
  name: string;
  sport: string;
  rating: number;
  bookings: number;
  imagen_url?: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  monthlyData = [320, 380, 420, 390, 450, 480, 520, 490, 540, 580, 620, 600];
  currentMonth = new Date().getMonth();
  maxValue = 0;
  cargando = true;

  stats: StatCard[] = [];

  sportsData: Sport[] = [
    { name: 'Fútbol', percent: 42, color: '#25D366' },
    { name: 'Basketball', percent: 28, color: '#3B82F6' },
    { name: 'Pádel', percent: 18, color: '#F59E0B' },
    { name: 'Tenis', percent: 12, color: '#8B5CF6' }
  ];

  reservations: Reservation[] = [
    { user: 'María García', initials: 'MG', sport: 'Fútbol', court: 'Cancha A1', time: '18:00 - 19:00', status: 'confirmed' },
    { user: 'Carlos López', initials: 'CL', sport: 'Pádel', court: 'Cancha P2', time: '19:00 - 20:30', status: 'pending' },
    { user: 'Ana Martínez', initials: 'AM', sport: 'Tenis', court: 'Cancha T1', time: '10:00 - 11:00', status: 'confirmed' },
    { user: 'Pedro Ruiz', initials: 'PR', sport: 'Basketball', court: 'Cancha B1', time: '20:00 - 21:00', status: 'confirmed' }
  ];

  courts: Court[] = [];

  constructor(private userApiService: UserApiService) {}

  ngOnInit() {
    this.maxValue = Math.max(...this.monthlyData);
    this.cargarEstadisticas();
  }

  cargarEstadisticas(): void {
    this.cargando = true;
    this.userApiService.getEstadisticasDashboard().subscribe({
      next: (response) => {
        const { data } = response;

        // Actualizar stats con datos reales (incluye Reservas Hoy)
        this.stats = [
          {
            label: 'Reservas Hoy',
            value: data.reservasHoy,
            iconType: 'calendar',
            colorClass: 'green'
          },
          {
            label: 'Usuarios Activos',
            value: data.usuariosActivos,
            iconType: 'users',
            colorClass: 'blue'
          },
          {
            label: 'Ingresos Mes',
            value: `$${parseFloat(data.ingresosMes).toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            iconType: 'trending',
            colorClass: 'green'
          },
          {
            label: 'Satisfacción',
            value: parseFloat(data.satisfaccion).toFixed(1),
            iconType: 'star',
            colorClass: 'amber'
          }
        ];

        // Actualizar reservas por mes
        this.monthlyData = data.reservasPorMes;
        this.maxValue = Math.max(...this.monthlyData, 1); // Al menos 1 para evitar división por 0

        // Actualizar deportes
        const colores = ['#25D366', '#3B82F6', '#F59E0B', '#8B5CF6', '#E74C3C', '#9B59B6'];
        this.sportsData = data.porDeporte.map((deporte, index) => ({
          name: deporte.nombre,
          percent: deporte.porcentaje,
          color: colores[index % colores.length]
        }));

        // Actualizar top canchas
        this.courts = data.topCanchas.map(cancha => ({
          name: cancha.nombre,
          sport: cancha.deporte,
          rating: parseFloat(cancha.rating),
          bookings: cancha.totalRatings,
          imagen_url: cancha.imagen_url
        }));

        // Actualizar últimas reservas con datos reales
        this.reservations = data.ultimasReservas.map((reserva: UltimaReserva) => ({
          user: reserva.usuario,
          initials: this.obtenerIniciales(reserva.usuario),
          sport: reserva.deporte,
          court: reserva.cancha,
          time: `${reserva.hora} (${reserva.duracion} min)`,
          status: reserva.estado === 'pagado' || reserva.estado === 'completado' ? 'confirmed' : 'pending'
        }));

        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar estadísticas:', err);
        this.cargando = false;
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

  getBarHeight(value: number): string {
    return `${(value / this.maxValue) * 100}%`;
  }

  isCurrentMonth(index: number): boolean {
    return index === this.currentMonth;
  }

  getStatusLabel(status: string): string {
    return status === 'confirmed' ? 'Confirmada' : 'Pendiente';
  }
}
