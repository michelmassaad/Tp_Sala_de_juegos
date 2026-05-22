import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../services/auth';
import { TitleCasePipe } from '@angular/common';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, TitleCasePipe],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  authService = inject(AuthService);
  router = inject(Router);

  // 🚀 DIRECTO: Escucha los cambios de ruta y se desactiva solo al destruir el componente
  private routerTracer = this.router.events.pipe(
    filter(event => event instanceof NavigationEnd),
    takeUntilDestroyed() // Hook nativo de Angular para autolimpiar la suscripción
  ).subscribe(() => {
    const navbar = document.getElementById('navbarNav');
    
    // Si el menú responsive está desplegado, simulamos el click para cerrarlo limpiamente
    if (navbar?.classList.contains('show')) {
      (document.querySelector('.navbar-toggler') as HTMLElement)?.click();
    }
  });
}