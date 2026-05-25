import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home';
import { LoginComponent } from './components/login/login';
import { RegistroComponent } from './components/registro/registro';
import { QuienSoyComponent } from './components/quien-soy/quien-soy';
import { authGuard } from './guards/auth';
import { guestGuard } from './guards/guest';
import { AhorcadoComponent } from './components/ahorcado/ahorcado';
import { MayorMenor } from './components/mayor-menor/mayor-menor';
import { Preguntados } from './components/preguntados/preguntados';
import { BiciRush } from './components/bici-rush/bici-rush';
import { Resultados } from './components/resultados/resultados';

export const routes: Routes = [
    // Ruta por defecto: cuando entran a '/', van al home
    { path: '', redirectTo: 'home', pathMatch: 'full' },

    // Rutas para cada componente de la aplicación
    { path:'home', component:HomeComponent },
    { path:'login', component:LoginComponent, canActivate: [guestGuard] },
    { path:'registro', component:RegistroComponent, canActivate: [guestGuard]},
    { path:'quien-soy', component:QuienSoyComponent, canActivate: [authGuard] }, // <-- Ruta protegida},

    //Juegos:
    { path:'home/ahorcado', component: AhorcadoComponent, canActivate: [authGuard]},
    { path:'home/mayor-menor', component: MayorMenor, canActivate: [authGuard]},
    { path:'home/preguntados', component:Preguntados, canActivate: [authGuard]},
    { path:'home/bici-rush', component: BiciRush, canActivate: [authGuard]},
    { path:'resultados', component:Resultados, canActivate: [authGuard] },

    // Comodín: cualquier ruta que no existe → home
    { path: '**', redirectTo: 'home' }
];
