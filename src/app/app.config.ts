import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { PreloadAllModules, provideRouter, withComponentInputBinding, withInMemoryScrolling, withPreloading } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withFetch } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    //rutas y Fuerza a Angular a resetear el scroll a 0 en cada cambio de pantalla
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'enabled' })),
    provideHttpClient(withFetch()),

    // 🌟 LA BUENA PRÁCTICA DE REFUERZO: Habilita la carga perezosa en segundo plano
    provideRouter(
      routes, 
      withComponentInputBinding(),
      withPreloading(PreloadAllModules) // 🚀 Descarga los juegos en el "tiempo muerto" de la red
    ),
  ]
};
