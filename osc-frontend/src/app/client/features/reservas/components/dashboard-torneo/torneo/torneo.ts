// torneo.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Match {
  home: string;
  homeScore: number | null;
  away: string;
  awayScore: number | null;
  status: string;
}

interface League {
  title: string;
  subtitle: string;
  logo: string;
  matches: Match[];
}

@Component({
  selector: 'app-torneo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './torneo.html',
  styleUrls: ['./torneo.css']
})
export class Torneo {
  activeTab: string = 'futbol';

  deportes = [
    { id: 'futbol', nombre: 'Fútbol', icono: '⚽' },
    { id: 'padel', nombre: 'Padel', icono: '🎾' },
    { id: 'basket', nombre: 'Basket', icono: '🏀' }
  ];

  leagues: League[] = [
    {
      title: 'LaLiga',
      subtitle: 'Jornada 1',
      logo: 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Crect fill=\'%23e74c3c\' width=\'100\' height=\'100\'/%3E%3Ctext x=\'50\' y=\'55\' font-size=\'40\' text-anchor=\'middle\' fill=\'white\' font-family=\'Arial\'%3ELL%3C/text%3E%3C/svg%3E',
      matches: [
        { home: 'Sevilla', homeScore: 1, away: 'Mallorca', awayScore: 3, status: 'Hoy - Fin del partido' },
        { home: 'Villarreal', homeScore: 2, away: 'Real Betis', awayScore: 2, status: 'Hoy - Fin del partido' },
        { home: 'FC Barcelona', homeScore: 2, away: 'Girona', awayScore: 1, status: 'Hoy - Fin del partido' },
        { home: 'Real Madrid', homeScore: null, away: 'Atlético', awayScore: null, status: 'Hoy - Por iniciar' }
      ]
    },
    {
      title: 'Premier League',
      subtitle: 'Jornada 2',
      logo: 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Crect fill=\'%233498db\' width=\'100\' height=\'100\'/%3E%3Ctext x=\'50\' y=\'55\' font-size=\'40\' text-anchor=\'middle\' fill=\'white\' font-family=\'Arial\'%3EPL%3C/text%3E%3C/svg%3E',
      matches: [
        { home: 'Liverpool', homeScore: 2, away: 'Chelsea', awayScore: 1, status: 'Hoy - Fin del partido' },
        { home: 'Manchester City', homeScore: 3, away: 'Arsenal', awayScore: 3, status: 'Hoy - En progreso' },
        { home: 'Manchester United', homeScore: 1, away: 'Tottenham', awayScore: null, status: 'Hoy - Por iniciar' },
        { home: 'Newcastle', homeScore: null, away: 'Brighton', awayScore: null, status: 'Mañana - Por iniciar' }
      ]
    }
  ];

  selectTab(tabId: string): void {
    this.activeTab = tabId;
  }

  getTeamInitials(teamName: string): string {
    return teamName.substring(0, 2).toUpperCase();
  }

  splitStatus(status: string): { day: string; text: string } {
    const [day, text] = status.split(' - ');
    return { day: day || '', text: text || '' };
  }
}