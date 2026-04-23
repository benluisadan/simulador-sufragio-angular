import { Routes } from '@angular/router';
//import { AppComponent } from './app.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'cedula-segunda-vuelta',
    pathMatch: 'full'
  },
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
      import('./features/cedula-segunda-vuelta/cedula-segunda-vuelta')
        .then(m => m.CedulaSegundaVuelta)
  },
  {
    path: 'cedulavotacion',
    loadComponent: () =>
      import('./features/cedula-segunda-vuelta/cedula-segunda-vuelta')
        .then(m => m.CedulaSegundaVuelta)
  },
  {
    path: 'donar',
    loadComponent: () =>
      import('./features/landing-donaciones/landing-donaciones')
        .then(m => m.LandingDonaciones)
  },
  {
    path: 'EstadisticaSimulacion',
    loadComponent: () =>
      import('./features/resultado-electoral/resultado-electoral')
        .then(m => m.ResultadoElectoral)
  },
  {
    path: 'resultadosimulacion',
    loadComponent: () =>
      import('./features/resumen-simulacion/resumen-simulacion')
        .then(m => m.ResumenSimulacion)
  }
  ,
  {
    path: 'cedula-segunda-vuelta',
    loadComponent: () =>
      import('./features/cedula-segunda-vuelta/cedula-segunda-vuelta')
        .then(m => m.CedulaSegundaVuelta)
  }

];
