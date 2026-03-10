import { Routes } from '@angular/router';
//import { AppComponent } from './app.component';

export const routes: Routes = [
  {
    path: 'inicio',
    loadComponent: () =>
      import('./features/proceso-electoral/proceso-electoral')
        .then(m => m.ProcesoElectoral)
  },
  {
    path: 'proceso-electoral',
    loadComponent: () =>
      import('./features/proceso-electoral/proceso-electoral')
        .then(m => m.ProcesoElectoral)
  },
  {
    path: 'registro-votante',
    loadComponent: () =>
      import('./features/registro-votante/registro-votante')
        .then(m => m.RegistroVotante)
  }
  ,
  {
    path: 'cedula-votacion',
    loadComponent: () =>
      import('./features/cedula-votacion/cedula-votacion')
        .then(m => m.CedulaVotacion)
  },
   {
    path: 'cedulavotacion',
    loadComponent: () =>
      import('./features/cedula-sin-registro/cedula-sin-registro')
        .then(m => m.CedulaSinRegistro)
  },
  {
    path: 'donar',
    loadComponent: () =>
      import('./features/landing-donaciones/landing-donaciones')
        .then(m => m.LandingDonaciones)
  }

];
