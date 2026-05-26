import { Routes } from '@angular/router';
import { authGuard } from './guards/auth';
import { guestGuard } from './guards/guest';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  
  // Las páginas principales livianas podés dejarlas estáticas o perezosas
  { 
    path: 'home', 
    loadComponent: () => import('./components/home/home').then(m => m.HomeComponent) 
  },
  { 
    path: 'login', 
    loadComponent: () => import('./components/login/login').then(m => m.LoginComponent), // Tu clase se llama Login
    canActivate: [guestGuard] 
  },
  { 
    path: 'registro', 
    loadComponent: () => import('./components/registro/registro').then(m => m.RegistroComponent), 
    canActivate: [guestGuard]
  },
  { 
    path: 'quien-soy', 
    loadComponent: () => import('./components/quien-soy/quien-soy').then(m => m.QuienSoyComponent), 
    canActivate: [authGuard] 
  },

  // 🚀 LA MAGIA: Los juegos pesados del Sprint 3 y 4 se cargan ÚNICAMENTE si el usuario hace clic en ellos
  { 
    path: 'home/ahorcado', 
    loadComponent: () => import('./components/ahorcado/ahorcado').then(m => m.AhorcadoComponent), 
    canActivate: [authGuard]
  },
  { 
    path: 'home/mayor-menor', 
    loadComponent: () => import('./components/mayor-menor/mayor-menor').then(m => m.MayorMenor), 
    canActivate: [authGuard]
  },
  { 
    path: 'home/preguntados', 
    loadComponent: () => import('./components/preguntados/preguntados').then(m => m.Preguntados), 
    canActivate: [authGuard]
  },
  { 
    path: 'home/bici-rush', 
    loadComponent: () => import('./components/bici-rush/bici-rush').then(m => m.BiciRush), 
    canActivate: [authGuard]
  },
  { 
    path: 'resultados', 
    loadComponent: () => import('./components/resultados/resultados').then(m => m.Resultados), 
    canActivate: [authGuard]
  },

  { path: '**', redirectTo: 'home' }
];