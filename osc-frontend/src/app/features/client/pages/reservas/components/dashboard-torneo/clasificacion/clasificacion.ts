import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

interface TeamStanding {
  position: number;
  team: string;
  logo: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

interface LeagueData {
  name: string;
  logo: string;
  standings: TeamStanding[];
}

@Component({
  selector: 'app-clasificacion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './clasificacion.html',
  styleUrls: ['./clasificacion.css']
})
export class ClasificacionComponent implements OnInit {
  leagueData: LeagueData = {
    name: 'PREMIER LEAGUE',
    logo: '⚽',
    standings: []
  };

  // Datos mock de clasificación
  private leaguesData: { [key: string]: LeagueData } = {
    'laliga': {
      name: 'LALIGA',
      logo: '🏆',
      standings: [
        { position: 1, team: 'FC Barcelona', logo: '🔵', played: 7, won: 6, drawn: 1, lost: 0, goalsFor: 22, goalsAgainst: 9, goalDifference: 13, points: 19 },
        { position: 2, team: 'Real Madrid', logo: '⚪', played: 7, won: 5, drawn: 2, lost: 0, goalsFor: 18, goalsAgainst: 7, goalDifference: 11, points: 17 },
        { position: 3, team: 'Atlético Madrid', logo: '🔴', played: 7, won: 5, drawn: 1, lost: 1, goalsFor: 15, goalsAgainst: 8, goalDifference: 7, points: 16 },
        { position: 4, team: 'Sevilla', logo: '⚪', played: 7, won: 4, drawn: 2, lost: 1, goalsFor: 12, goalsAgainst: 9, goalDifference: 3, points: 14 },
        { position: 5, team: 'Real Betis', logo: '🟢', played: 7, won: 4, drawn: 1, lost: 2, goalsFor: 13, goalsAgainst: 10, goalDifference: 3, points: 13 },
        { position: 6, team: 'Villarreal', logo: '🟡', played: 7, won: 3, drawn: 3, lost: 1, goalsFor: 11, goalsAgainst: 9, goalDifference: 2, points: 12 },
        { position: 7, team: 'Athletic Bilbao', logo: '🔴', played: 7, won: 3, drawn: 2, lost: 2, goalsFor: 10, goalsAgainst: 9, goalDifference: 1, points: 11 },
        { position: 8, team: 'Valencia', logo: '🦇', played: 7, won: 2, drawn: 4, lost: 1, goalsFor: 9, goalsAgainst: 8, goalDifference: 1, points: 10 },
        { position: 9, team: 'Mallorca', logo: '🔥', played: 7, won: 3, drawn: 1, lost: 3, goalsFor: 10, goalsAgainst: 11, goalDifference: -1, points: 10 },
        { position: 10, team: 'Getafe', logo: '🔵', played: 7, won: 2, drawn: 3, lost: 2, goalsFor: 8, goalsAgainst: 10, goalDifference: -2, points: 9 }
      ]
    },
    'premier-league': {
      name: 'PREMIER LEAGUE',
      logo: '👑',
      standings: [
        { position: 1, team: 'FC Arsenal', logo: '🔴', played: 7, won: 6, drawn: 1, lost: 0, goalsFor: 20, goalsAgainst: 8, goalDifference: 12, points: 19 },
        { position: 2, team: 'Manchester City', logo: '🔵', played: 7, won: 5, drawn: 2, lost: 0, goalsFor: 18, goalsAgainst: 6, goalDifference: 12, points: 17 },
        { position: 3, team: 'Liverpool FC', logo: '🔴', played: 7, won: 5, drawn: 1, lost: 1, goalsFor: 17, goalsAgainst: 8, goalDifference: 9, points: 16 },
        { position: 4, team: 'AFC Bournemouth', logo: '🍒', played: 7, won: 4, drawn: 2, lost: 1, goalsFor: 14, goalsAgainst: 9, goalDifference: 5, points: 14 },
        { position: 5, team: 'Tottenham Hotspur', logo: '⚪', played: 7, won: 4, drawn: 1, lost: 2, goalsFor: 15, goalsAgainst: 11, goalDifference: 4, points: 13 },
        { position: 6, team: 'Chelsea', logo: '🔵', played: 7, won: 4, drawn: 1, lost: 2, goalsFor: 13, goalsAgainst: 10, goalDifference: 3, points: 13 },
        { position: 7, team: 'Sunderland', logo: '🔴', played: 7, won: 3, drawn: 3, lost: 1, goalsFor: 12, goalsAgainst: 9, goalDifference: 3, points: 12 },
        { position: 8, team: 'Crystal Palace', logo: '🦅', played: 7, won: 3, drawn: 2, lost: 2, goalsFor: 11, goalsAgainst: 10, goalDifference: 1, points: 11 },
        { position: 9, team: 'Brighton & Hove Albion FC', logo: '⚪', played: 7, won: 2, drawn: 4, lost: 1, goalsFor: 10, goalsAgainst: 9, goalDifference: 1, points: 10 },
        { position: 10, team: 'Everton', logo: '🔵', played: 7, won: 2, drawn: 3, lost: 2, goalsFor: 9, goalsAgainst: 10, goalDifference: -1, points: 9 },
        { position: 11, team: 'Manchester United', logo: '🔴', played: 7, won: 2, drawn: 3, lost: 2, goalsFor: 8, goalsAgainst: 9, goalDifference: -1, points: 9 }
      ]
    }
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const leagueId = this.route.snapshot.paramMap.get('id');
    if (leagueId && this.leaguesData[leagueId]) {
      this.leagueData = this.leaguesData[leagueId];
    } else {
      // Default a Premier League si no hay ID
      this.leagueData = this.leaguesData['premier-league'];
    }
  }

  goBack(): void {
    this.router.navigate(['../torneos'], { relativeTo: this.route });
  }

  getPositionClass(position: number): string {
    if (position <= 4) return 'champions-league';
    if (position === 5) return 'europa-league';
    if (position === 6) return 'conference-league';
    if (position >= this.leagueData.standings.length - 2) return 'relegation';
    return '';
  }
}
