import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { CedulaService } from '../../core/services/cedula.service';
import { ActivatedRoute } from '@angular/router';
import { ResumenItem } from '../../core/models/resumen.simulacion.model';
import { ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { ResultadoService } from '../../core/services/resultado.service';
import { EstadisticaPresidencial } from '../../core/models/resultado-electoral.models';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-resumen-simulacion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resumen-simulacion.html',
  styleUrl: './resumen-simulacion.scss',
})

export class ResumenSimulacion {

  constructor(
    private route: ActivatedRoute,
    private cedulaService: CedulaService,
    private estadisticasService: ResultadoService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

  votanteId?: number;
  ubigeoIdInterno?: string;
  procesoIdInterno?: number;
  resumen: ResumenItem[] = [];
  presidencial?: ResumenItem;
  senadoUnico?: ResumenItem;
  senadoMultiple?: ResumenItem;
  diputado?: ResumenItem;
  andino?: ResumenItem;

  //FLASH
  flashActivo: boolean = true;          // Muestra el bloque Flash Electoral
  mostrarFlashResultado: boolean = false; // Muestra el resultado del Flash
  contadorFlash: number = 10;


  // presidencial
  partidos: EstadisticaPresidencial[] = [];
  topPartidos: EstadisticaPresidencial[] = [];
  otrosPartidos: EstadisticaPresidencial[] = [];


  ngOnInit() {

    const id = this.cedulaService.getVotanteId();
    if (!id) {
      return;
    }
    const uid = this.cedulaService.getUbigeoId();
    this.ubigeoIdInterno = uid;

    const pid = this.cedulaService.getProcesoId();
    this.procesoIdInterno = pid;

    //alert(id + '-' + uid + '-' + pid);
    this.votanteId = id;
    this.cedulaService.ResumenSimulacion(this.votanteId).subscribe(resp => {
      if (resp.codigoerror === "0000") {
        this.resumen = resp.data;

        this.presidencial = this.resumen.find(x => x.tipoCamara === 'Presidencial');
        this.senadoUnico = this.resumen.find(x => x.tipoCamara === 'Senado Unico');
        this.senadoMultiple = this.resumen.find(x => x.tipoCamara === 'Senado Multiple');
        this.diputado = this.resumen.find(x => x.tipoCamara === 'Diputado');
        this.andino = this.resumen.find(x => x.tipoCamara === 'Parlamento Andino');

        this.cdr.detectChanges(); // ← ESTA LÍNEA ES LA CLAVE
      }
    });

    this.iniciarCicloFlash();

  }

  /*
    iniciarCicloFlash() {
      this.flashActivo = true;
      this.mostrarFlashResultado = false;
      this.contadorFlash = 10;
      this.cdr.detectChanges(); // ← ESTA LÍNEA ES LA CLAVE
      const intervalo = setInterval(() => {
        this.contadorFlash--;
        if (this.contadorFlash === 0) {
          clearInterval(intervalo);
  
          setTimeout(() => {
            this.flashActivo = false;
            this.mostrarFlashResultado = true;
            this.cdr.detectChanges(); // ← NECESARIO
  
            // cargar resultados
            this.estadisticasService.getEstadisticasPresidencial()
              .subscribe(data => {
                this.partidos = data.sort((a, b) => b.porcentajeVotos - a.porcentajeVotos);
                this.topPartidos = this.partidos.slice(0, 2);
                this.otrosPartidos = this.partidos.slice(2);
                this.cdr.detectChanges(); // ← NECESARIO
              });
  
            // mantener resultado 30s
            setTimeout(() => {
              this.mostrarFlashResultado = false;
              this.cdr.detectChanges(); // ← NECESARIO
              this.iniciarCicloFlash();
            }, 30000);
  
          }, 2000);
        }
      }, 1000);
    }
  
  */

  iniciarCicloFlash() {
    this.flashActivo = true;
    this.mostrarFlashResultado = false;

    this.contadorFlash = 10;
    this.cdr.detectChanges(); // ← pinta el 10 inmediatamente

    setTimeout(() => {
      this.iniciarIntervaloFlash();
    });
  }


  iniciarIntervaloFlash() {
    const intervalo = setInterval(() => {
      this.contadorFlash--;
      this.cdr.detectChanges();

      if (this.contadorFlash === 0) {
        clearInterval(intervalo);
        this.mostrarResultadoFlash();
      }
    }, 1000);
  }


  mostrarResultadoFlash() {
    this.flashActivo = false;
    this.mostrarFlashResultado = true;
    this.cdr.detectChanges();

    this.estadisticasService.getEstadisticasPresidencial()
      .subscribe(data => {
        this.partidos = data.sort((a, b) => b.porcentajeVotos - a.porcentajeVotos);
        this.topPartidos = this.partidos.slice(0, 2);
        this.otrosPartidos = this.partidos.slice(2);
        this.cdr.detectChanges();
      });

    setTimeout(() => {
      this.mostrarFlashResultado = false;
      this.iniciarCicloFlash();
    }, 30000);
  }

  irSimulacion() {
    //alert(this.ubigeoIdInterno);
    if ((this.ubigeoIdInterno?.length ?? 0) > 0) {
      //this.router.navigate(['/cedula-votacion?procesoId=' + this.procesoIdInterno + '&votanteId=' + this.votanteId + '&ubigeo=' + this.ubigeoIdInterno]);
      //http://localhost:4200/cedula-votacion?procesoId=1&votanteId=1&ubigeo=140101
      this.router.navigate(
        ['/cedula-votacion'],
        {
          queryParams: {
            procesoId: this.procesoIdInterno,
            votanteId: this.votanteId,
            ubigeo: this.ubigeoIdInterno
          }
        }
      );

    }
    else {
      this.cedulaService.setUbigeoId(this.ubigeoIdInterno ?? '');
      this.cedulaService.setProcesoId(this.procesoIdInterno ?? 0);
      this.router.navigate(['/cedulavotacion']);

    }

  }

  IrDonar() {
    this.cedulaService.setVotanteId(0);
    this.router.navigate(['/donar']);

  }
  salir() {
    this.cedulaService.setVotanteId(0);
    this.router.navigate(['/donar']);

  }

  Estadistica() {
    this.cedulaService.setVotanteId(0);
    this.router.navigate(['/EstadisticaSimulacion']);
  }

}
