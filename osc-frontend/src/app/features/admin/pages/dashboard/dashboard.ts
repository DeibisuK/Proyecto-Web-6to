import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface StatCard {
  label: string;
  value: string | number;
  change: string;
  isPositive: boolean;
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

  stats: StatCard[] = [
    {
      label: 'Reservas Hoy',
      value: 47,
      change: '+12% vs ayer',
      isPositive: true,
      iconType: 'calendar',
      colorClass: 'green'
    },
    {
      label: 'Usuarios Activos',
      value: 1284,
      change: '+8% este mes',
      isPositive: true,
      iconType: 'users',
      colorClass: 'blue'
    },
    {
      label: 'Ingresos Mes',
      value: '$12,450',
      change: '+23% vs anterior',
      isPositive: true,
      iconType: 'trending',
      colorClass: 'green'
    },
    {
      label: 'Satisfacción',
      value: 4.8,
      change: '+0.2 puntos',
      isPositive: true,
      iconType: 'star',
      colorClass: 'amber'
    }
  ];

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

  courts: Court[] = [
    { name: 'Cancha A1', sport: 'Fútbol', rating: 4.9, bookings: 156 },
    { name: 'Cancha P2', sport: 'Pádel', rating: 4.8, bookings: 134 },
    { name: 'Cancha T1', sport: 'Tenis', rating: 4.7, bookings: 98 }
  ];

  ngOnInit() {
    this.maxValue = Math.max(...this.monthlyData);
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
