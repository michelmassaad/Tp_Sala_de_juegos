import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home';
import { LoginComponent } from './components/login/login';
import { RegistroComponent } from './components/registro/registro';
import { QuienSoyComponent } from './components/quien-soy/quien-soy';

export const routes: Routes = [
    // Ruta por defecto: cuando entran a '/', van al home
    { path: '', redirectTo: 'home', pathMatch: 'full' },

    // Rutas para cada componente de la aplicación
    { path:'home', component:HomeComponent },
    { path:'login', component:LoginComponent },
    { path:'registro', component:RegistroComponent },
    { path:'quien-soy', component:QuienSoyComponent },

    // Comodín: cualquier ruta que no existe → home
  { path: '**', redirectTo: 'home' }
];
