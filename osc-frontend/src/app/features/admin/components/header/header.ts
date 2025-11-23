import { Component, Input, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnInit {
  @Input() currentPageTitle: string = 'Dashboard';

  user: any = null;
  showUserMenu = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      this.user = user;
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-info')) {
      this.showUserMenu = false;
    }
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  verPerfil(): void {
    this.showUserMenu = false;
    this.router.navigate(['/ver-perfil']);
  }

  salirModoAdmin(): void {
    this.showUserMenu = false;
    this.router.navigate(['/inicio']);
  }

  cerrarSesion(): void {
    this.showUserMenu = false;
    this.authService.logout();
    this.router.navigate(['/inicio']);
  }

  getUserName(): string {
    if (this.user?.displayName) {
      return this.user.displayName;
    }
    if (this.user?.email) {
      return this.user.email.split('@')[0];
    }
    return 'Administrador';
  }
}
