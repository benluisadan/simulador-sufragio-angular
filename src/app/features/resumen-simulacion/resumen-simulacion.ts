import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { CedulaService } from '../../core/services/cedula.service';
import { ActivatedRoute } from '@angular/router';
import { ResumenItem } from '../../core/models/resumen.simulacion.model';
import { ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-resumen-simulacion',
  imports: [NgIf],
  templateUrl: './resumen-simulacion.html',
  styleUrl: './resumen-simulacion.scss',
})

export class ResumenSimulacion {

  constructor(
    private route: ActivatedRoute,
    private cedulaService: CedulaService,
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
            votanteId:  this.votanteId,
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
    this.router.navigate(['/proceso-electoral']);

  }

}
