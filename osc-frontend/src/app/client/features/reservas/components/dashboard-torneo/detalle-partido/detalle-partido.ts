import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

interface Player {
  name: string;
  position: { top: string; left: string };
}

interface LastMatch {
  status: string; // 'GANADO', 'PERDIDO', 'EMPATADO'
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  date: string;
}

@Component({
  selector: 'app-detalle-partido',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detalle-partido.html',
  styleUrls: ['./detalle-partido.css']
})
export class DetallePartidoComponent implements OnInit {
  // Datos del partido actual
  matchData = {
    homeTeam: 'Sevilla',
    awayTeam: 'Mallorca',
    homeScore: 1,
    awayScore: 3,
    homeLogo: '🛡️',
    awayLogo: '🔥',
    homeCards: { yellow: 1, red: 0 },
    awayCards: { yellow: 0, red: 1 },
    status: 'En vivo - partido'
  };

  // Alineación (posiciones en el campo)
  homeLineup: Player[] = [
    { name: 'Y. Bounou', position: { top: '85%', left: '50%' } },
    { name: 'G. Montiel', position: { top: '70%', left: '15%' } },
    { name: 'L. Badé', position: { top: '70%', left: '38%' } },
    { name: 'N. Gudelj', position: { top: '70%', left: '62%' } },
    { name: 'A. Acuña', position: { top: '70%', left: '85%' } },
    { name: 'Fernando', position: { top: '50%', left: '35%' } },
    { name: 'I. Rakitic', position: { top: '50%', left: '65%' } },
    { name: 'E. Lamela', position: { top: '30%', left: '20%' } },
    { name: 'Ó. Rodríguez', position: { top: '30%', left: '50%' } },
    { name: 'Suso', position: { top: '30%', left: '80%' } },
    { name: 'Y. En-Nesyri', position: { top: '10%', left: '50%' } }
  ];

  // Últimos partidos - Sevilla
  sevillaLastMatches: LastMatch[] = [
    { status: 'GANADO', homeTeam: '🛡️', awayTeam: '⚽', homeScore: 2, awayScore: 1, date: '12:35' },
    { status: 'PERDIDO', homeTeam: '🛡️', awayTeam: '⚽', homeScore: 0, awayScore: 2, date: '12:35' },
    { status: 'GANADO', homeTeam: '🛡️', awayTeam: '⚽', homeScore: 3, awayScore: 1, date: '12:35' },
    { status: 'GANADO', homeTeam: '🛡️', awayTeam: '⚽', homeScore: 2, awayScore: 0, date: '12:35' },
    { status: 'PERDIDO', homeTeam: '🛡️', awayTeam: '⚽', homeScore: 1, awayScore: 2, date: '12:35' }
  ];

  // Últimos partidos - Mallorca
  mallorcaLastMatches: LastMatch[] = [
    { status: 'PERDIDO', homeTeam: '⚽', awayTeam: '🔵', homeScore: 1, awayScore: 2, date: '14:11' },
    { status: 'GANADO', homeTeam: '⚽', awayTeam: '🔵', homeScore: 3, awayScore: 0, date: '14:11' },
    { status: 'GANADO', homeTeam: '⚽', awayTeam: '🔵', homeScore: 2, awayScore: 1, date: '14:11' },
    { status: 'GANADO', homeTeam: '⚽', awayTeam: '🔵', homeScore: 1, awayScore: 0, date: '14:11' },
    { status: 'EMPATADO', homeTeam: '⚽', awayTeam: '🔵', homeScore: 1, awayScore: 1, date: '14:11' }
  ];

  selectedTab: 'alineacion' | 'estadisticas' = 'alineacion';

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Aquí podrías cargar los datos del partido desde el servicio
    // usando el ID del partido desde los parámetros de ruta
    const matchId = this.route.snapshot.paramMap.get('id');
    // TODO: cargar datos reales desde servicio
  }

  selectTab(tab: 'alineacion' | 'estadisticas'): void {
    this.selectedTab = tab;
  }

  goBack(): void {
    this.router.navigate(['../torneos'], { relativeTo: this.route });
  }

  getStatusClass(status: string): string {
    return status.toLowerCase();
  }
}
