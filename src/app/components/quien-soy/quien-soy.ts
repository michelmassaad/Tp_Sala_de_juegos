import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';

@Component({
  selector: 'app-quien-soy',
  imports: [],
  templateUrl: './quien-soy.html',
  styleUrl: './quien-soy.css',
})
export class QuienSoyComponent implements OnInit {
  // Inyectamos el cliente HTTP (asegurate de tener provideHttpClient() en app.config.ts)
  private http = inject(HttpClient);
  
  // Usamos una Signal para guardar la respuesta. Empezamos en null mientras carga.
  githubData = signal<any>(null);

  ngOnInit(): void {
    // IMPORTANTE: Cambiá 'michelmassaad' por tu nombre de usuario real en GitHub
    this.http.get('https://api.github.com/users/michelmassaad')
      .subscribe({
        next: (data) => {
          this.githubData.set(data);
        },
        error: (err) => {
          console.error('Hubo un error cargando el perfil de GitHub', err);
        }
      });
  }

}
