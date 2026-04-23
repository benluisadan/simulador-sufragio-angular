import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResultadoService } from '../../core/services/resultado.service';
import { EstadisticaPresidencial } from '../../core/models/resultado-electoral.models';
import { ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-resultado-electoral',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resultado-electoral.html',
  styleUrl: './resultado-electoral.scss',
})

export class ResultadoElectoral implements OnInit {

  // presidencial
  partidos: EstadisticaPresidencial[] = [];
  topPartidos: EstadisticaPresidencial[] = [];
  otrosPartidos: EstadisticaPresidencial[] = [];

  //Senado
  senado: EstadisticaPresidencial[] = [];
  senadoTop: EstadisticaPresidencial[] = [];
  senadoResto: EstadisticaPresidencial[] = [];

  //SenadoMultiple
  senadoMultiple: EstadisticaPresidencial[] = [];
  senadoMultipleTop: EstadisticaPresidencial[] = [];
  senadoMultipleResto: EstadisticaPresidencial[] = [];

  //Diputado
  diputado: EstadisticaPresidencial[] = [];
  diputadoTop: EstadisticaPresidencial[] = [];
  diputadoResto: EstadisticaPresidencial[] = [];

  //PArlamento Andino
  parlamentoAndino: EstadisticaPresidencial[] = [];
  parlamentoAndinoTop: EstadisticaPresidencial[] = [];
  parlamentoAndinoResto: EstadisticaPresidencial[] = [];



  constructor(
    private cdr: ChangeDetectorRef,
    private router: Router,
    private estadisticasService: ResultadoService
  ) { }

  procesoElectoralId: number = 0;

  mostrarBloquePresidente = signal(true);
  mostrarBloqueSenadoUnico = signal(true);
  mostrarBloqueSenadoMultiple = signal(true);
  mostrarBloqueDiputado = signal(true);
  mostrarBloqueParlamentoAndino = signal(true);



  ngOnInit(): void {

    const nav = this.router.currentNavigation();
    const valor = nav?.extras.state?.['valor'];

    this.procesoElectoralId = Number(sessionStorage.getItem('procesoElectoralId')) ?? 0;
    //alert(this.procesoElectoralId);
    //alert(this.procesoElectoralId);
    //this.procesoElectoralId = 1;
    this.estadisticasService.getEstadisticasPresidencial(this.procesoElectoralId)
      .subscribe(data => {

        this.mostrarBloquePresidente.set(true);
        if (!data || data.length === 0) {
          this.mostrarBloquePresidente.set(false);
          return;
        }

        // Ordenar de mayor a menor
        this.partidos = data.sort((a, b) => b.porcentajeVotos - a.porcentajeVotos);

        const primero = this.partidos[0];
        const segundo = this.partidos[1];

        // Empates con el segundo, EXCLUYENDO al primero
        const empatesSegundo = this.partidos.filter(
          p => p.porcentajeVotos === segundo.porcentajeVotos && p !== primero
        );

        if (empatesSegundo.length > 1) {
          this.topPartidos = [primero, ...empatesSegundo];
          this.otrosPartidos = this.partidos.slice(this.topPartidos.length);
        } else {
          this.topPartidos = [primero, segundo];
          this.otrosPartidos = this.partidos.slice(2);
        }

        this.cdr.detectChanges(); // ← ESTA LÍNEA ES LA CLAVE
      });

    // =========================
    // BLOQUE SENADO ÚNICO
    // =========================
    this.estadisticasService.getEstadisticasSenadoUnico(this.procesoElectoralId)
      .subscribe(data => {

        this.mostrarBloqueSenadoUnico.set(true);
        if (!data || data.length === 0) {
          this.mostrarBloqueSenadoUnico.set(false);
          return;
        }


        // Ordenar de mayor a menor
        this.senado = data.sort((a, b) => b.porcentajeVotos - a.porcentajeVotos);

        // TOP = todos los que superan 5%
        this.senadoTop = this.senado.filter(p => p.porcentajeVotos > 5);

        // RESTO = todos los demás
        this.senadoResto = this.senado.filter(p => p.porcentajeVotos <= 5);

        this.cdr.detectChanges(); // ← ESTA LÍNEA ES LA CLAVE
      });

    // =========================
    // BLOQUE SENADO MULTIPLE
    // =========================
    this.estadisticasService.getEstadisticasSenadoMultiple(this.procesoElectoralId)
      .subscribe(data => {


        this.mostrarBloqueSenadoMultiple.set(true);
        if (!data || data.length === 0) {
          this.mostrarBloqueSenadoMultiple.set(false);
          return;
        }
        // Ordenar de mayor a menor
        this.senadoMultiple = data.sort((a, b) => b.porcentajeVotos - a.porcentajeVotos);

        // TOP = todos los que superan 5%
        this.senadoMultipleTop = this.senadoMultiple.filter(p => p.porcentajeVotos > 5);

        // RESTO = todos los demás
        this.senadoMultipleResto = this.senadoMultiple.filter(p => p.porcentajeVotos <= 5);

        this.cdr.detectChanges(); // ← ESTA LÍNEA ES LA CLAVE
      });

    // =========================
    // BLOQUE Diputado
    // =========================
    this.estadisticasService.getEstadisticasDiputado(this.procesoElectoralId)
      .subscribe(data => {

        this.mostrarBloqueDiputado.set(true);
        if (!data || data.length === 0) {
          this.mostrarBloqueDiputado.set(false);
          return;
        }

        // Ordenar de mayor a menor
        this.diputado = data.sort((a, b) => b.porcentajeVotos - a.porcentajeVotos);

        // TOP = todos los que superan 5%
        this.diputadoTop = this.diputado.filter(p => p.porcentajeVotos > 5);

        // RESTO = todos los demás
        this.diputadoResto = this.diputado.filter(p => p.porcentajeVotos <= 5);

        this.cdr.detectChanges(); // ← ESTA LÍNEA ES LA CLAVE
      });

    // =========================
    // BLOQUE Parlamento Andino
    // =========================
    this.estadisticasService.getEstadisticasParlamentoAndino(this.procesoElectoralId)
      .subscribe(data => {

        this.mostrarBloqueParlamentoAndino.set(true);
        if (!data || data.length === 0) {
          this.mostrarBloqueParlamentoAndino.set(false);
          return;
        }

        // Ordenar de mayor a menor
        this.parlamentoAndino = data.sort((a, b) => b.porcentajeVotos - a.porcentajeVotos);

        // TOP = todos los que superan 5%
        this.parlamentoAndinoTop = this.parlamentoAndino.filter(p => p.porcentajeVotos > 5);

        // RESTO = todos los demás
        this.parlamentoAndinoResto = this.parlamentoAndino.filter(p => p.porcentajeVotos <= 5);

        this.cdr.detectChanges(); // ← ESTA LÍNEA ES LA CLAVE
      });

  }

  irSimulacion() {
    //alert(this.ubigeoIdInterno);
    this.router.navigate(['/cedulavotacion']);
  }

  IrDonar() {
    this.router.navigate(['/donar']);

  }
  salir() {
    this.router.navigate(['/donar']);

  }


}
