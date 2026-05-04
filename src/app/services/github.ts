import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class GithubService {
  private http = inject(HttpClient);

  // Signals públicas para que el componente las lea
  profileData = signal<any>(null);
  loading = signal<boolean>(false);
  error = signal<boolean>(false);

  loadProfile(username: string) {
    this.loading.set(true);
    this.error.set(false);

    this.http.get(`https://api.github.com/users/${username}`).subscribe({
      next: (data) => {
        this.profileData.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al conectar con GitHub:', err);
        this.error.set(true);
        this.loading.set(false);
      }
    });
  }
}