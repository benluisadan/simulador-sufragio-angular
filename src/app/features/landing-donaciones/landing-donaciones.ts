import { Component } from '@angular/core';

@Component({
  selector: 'app-landing-donaciones',
  imports: [],
  templateUrl: './landing-donaciones.html',
  styleUrl: './landing-donaciones.scss',
})
export class LandingDonaciones {

  volverAProcesoElectoral() {
    window.location.href = '/cedulavotacion';
  }


}
