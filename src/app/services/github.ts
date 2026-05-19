import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GithubUser } from '../models/github.model'; // <-- 1. Importamos tu modelo

@Injectable({
  providedIn: 'root'
})
export class GithubService {
  public http = inject(HttpClient);

  loading = signal<boolean>(false);
  error = signal<boolean>(false);

  // 1. Ya no le ponemos " | null"
  // 2. Le pasamos un objeto con los valores en blanco por defecto
  profileData = signal<GithubUser>({
    login: '',
    avatar_url: '',
    name: '',
    bio: '',
    location: '' ,
    public_repos: 0,
    html_url: ''
  });


  loadProfile(username: string) {
    this.loading.set(true);
    this.error.set(false);

    // 3. Le avisamos al get<> qué tipo de dato trae
    this.http.get<GithubUser>(`https://api.github.com/users/${username}`).subscribe({
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