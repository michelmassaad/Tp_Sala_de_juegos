import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home';
import { LoginComponent } from './components/login/login';
import { RegistroComponent } from './components/registro/registro';
import { QuienSoyComponent } from './components/quien-soy/quien-soy';

export const routes: Routes = [
    { path:'home', component:HomeComponent },
    { path:'login', component:LoginComponent },
    { path:'registro', component:RegistroComponent },
    { path:'quien-soy', component:QuienSoyComponent }
];
