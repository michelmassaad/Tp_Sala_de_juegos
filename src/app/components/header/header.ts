import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  authService = inject(AuthService);
  router = inject(Router);


  // Creamos un método que devuelve TRUE si estamos en Login o Registro
  esRutaAuth(): boolean {
    return this.router.url.includes('/login') || this.router.url.includes('/registro');
  }
}
