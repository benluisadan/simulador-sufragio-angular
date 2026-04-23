import { Component, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CedulaService } from '../../core/services/cedula.service';
import { VotanteService } from '../../core/services/votante.service';
import { UbigeoService } from '../../core/services/ubigeo.service';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';


interface OpcionSegundaVuelta {
  organizacionId: number;
  organizacionNombre: string;
  logoUrl: string;
  presidenteFotoUrl: string;
  marcado: boolean;
  nulo: boolean;
  listaElectoralId: number;
}

@Component({
  selector: 'app-cedula-segunda-vuelta',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cedula-segunda-vuelta.html',
  styleUrls: ['./cedula-segunda-vuelta.scss']
})
export class CedulaSegundaVuelta {
  procesoElectoralId: number = 2;
  tipoEleccionId: number = 1;
  votanteId: number = 0;
  ubigeoId: string = '000000';
  ipUsuario: string = '0.0.0.1';
  departamentos: any[] = [];

  departamentoSeleccionado = '14';
  //opciones = signal<OpcionSegundaVuelta[]>([]);
  opciones = signal<OpcionSegundaVuelta[]>([]);
  opcionBlancoNulo = signal<OpcionSegundaVuelta | null>(null);
  opcionesNormales = signal<OpcionSegundaVuelta[]>([]);

  nuloGlobal = signal(false);
  constructor(
    private cedulaService: CedulaService,
    private ubigeoService: UbigeoService,
    private votanteService: VotanteService,
    private http: HttpClient,
    private router: Router
  ) { }

  ngOnInit() {
    this.cedulaService.getPresidencial(1, this.procesoElectoralId).subscribe({
      next: (resp: any) => {
        console.log('[Cedula] respuesta raw', resp);

        const dataArray: any[] = Array.isArray(resp)
          ? resp
          : Array.isArray(resp?.opciones)
            ? resp.opciones
            : Array.isArray(resp?.data)
              ? resp.data
              : [];

        console.log('[Cedula] dataArray normalizado', dataArray);

        const lista = dataArray.map((o: any) => ({
          organizacionId: o.organizacionId,
          organizacionNombre: o.organizacionNombre,
          logoUrl: o.logoUrl ?? '',
          presidenteFotoUrl: o.presidenteFotoUrl ?? '',
          listaElectoralId: o.listaId,
          marcado: false,
          nulo: false
        }));

        const blancoNulo = lista.find(x =>
          x.organizacionNombre?.toUpperCase().includes('BLANCO') ||
          x.organizacionNombre?.toUpperCase().includes('NULO')
        ) ?? null;

        const normales = lista.filter(x => x !== blancoNulo);

        this.opcionBlancoNulo.set(blancoNulo);
        this.opcionesNormales.set(normales);
        this.opciones.set(lista);

        console.log('[Cedula] opcionesNormales', this.opcionesNormales());
      },
      error: err => console.error('[Cedula] error', err)
    });
    this.cargarDepartamentos();
    this.inicializarVotanteAnonimo();
  }

  cargarDepartamentos() {
    this.ubigeoService.getDepartamentos().subscribe({
      next: (data) => {
        this.departamentos = data;

        // Seleccionar Lima por defecto (14)
        const lima = this.departamentos.find(d => d.id === '1401');
        if (lima) {
          this.departamentoSeleccionado = lima.id;
          this.ubigeoId = lima.id;
        }
      }
    });
  }

  onDepartamentoChange(id: string) {
    this.departamentoSeleccionado = id;
    this.ubigeoId = id; // ← aquí actualizas la variable global
    //alert(this.ubigeoId);
  }

  seleccionar(op: OpcionSegundaVuelta) {
    this.nuloGlobal.set(false);

    this.opcionesNormales.update(lista =>
      lista.map(o => ({
        ...o,
        marcado: o.organizacionId === op.organizacionId,
        nulo: false
      }))
    );

    this.cedulaService.votarPresidencial({
      votanteId: this.votanteId,
      eleccionId: 20,
      listaId: op.listaElectoralId,
      organizacionId: op.organizacionId,
      ubigeo: this.ubigeoId.toString().padEnd(6, '0'),
    }).subscribe();

  }

  votarBlanco() {
    this.nuloGlobal.set(false);

    this.opcionesNormales.update(lista =>
      lista.map(o => ({
        ...o,
        marcado: false,
        nulo: false
      }))
    );

    this.cedulaService.votarPresidencialbnv({
      votanteId: this.votanteId,
      eleccionId: 20,
      listaId: this.opcionBlancoNulo()?.listaElectoralId,
      organizacionId: this.opcionBlancoNulo()?.organizacionId,
      ubigeo: this.ubigeoId.toString().padEnd(6, '0'),
      preferencia1: 1,
      preferencia2: 0
    }).subscribe();

  }

  enviarSimulacion() {

    //this.popupCorreoVisible = true;
    this.cedulaService.setVotanteId(this.votanteId);
    this.cedulaService.setUbigeoId(this.ubigeoId);
    this.cedulaService.setProcesoId(this.procesoElectoralId);
    this.router.navigate(['/resultadosimulacion'], {
      state: { from: '/cedula-segunda-vuelta' }
    });
    //this.router.navigate(['/resultadosimulacion']);

  }

  irAProcesoElectoral() {
    window.location.href = '/donar';
  }


  votarNulo() {
    this.nuloGlobal.set(true);

    this.opcionesNormales.update(lista =>
      lista.map(o => ({
        ...o,
        marcado: false,
        nulo: true
      }))
    );

    this.cedulaService.votarPresidencialbnv({
      votanteId: this.votanteId,
      eleccionId: 20,
      listaId: this.opcionBlancoNulo()?.listaElectoralId,
      organizacionId: this.opcionBlancoNulo()?.organizacionId,
      ubigeo: this.ubigeoId.toString().padEnd(6, '0'),
      preferencia1: 2,
      preferencia2: 0
    }).subscribe();

  }

  async inicializarVotanteAnonimo() {
    const votanteGuardado = sessionStorage.getItem("votanteAnonimo");
    if (votanteGuardado) {
      this.votanteId = Number(votanteGuardado);
      return; // ← ya está listo
    }

    // 1. Obtener IP
    await this.obtenerIpPublica();

    // 2. Registrar votante
    await this.registrarVotanteAnonimo();
  }


  registrarVotanteAnonimo(): Promise<void> {
    return new Promise((resolve, reject) => {

      const data = {
        ubigeo: this.ubigeoId.toString().padEnd(6, '0'),
        ipPublica: this.ipUsuario,
        aceptaTratamientoDatos: true
      };

      this.votanteService.registrarVotanteAnonimo(data).subscribe({
        next: (resp) => {
          this.votanteId = resp.votanteId;
          sessionStorage.setItem("votanteAnonimo", this.votanteId.toString());
          resolve();
        },
        error: (err) => {
          console.error("Error registrando votante anónimo", err);
          reject(err);
        }
      });

    });
  }


  obtenerIpPublica(): Promise<void> {
    return new Promise((resolve) => {
      this.http.get<any>('https://api.ipify.org?format=json').subscribe({
        next: (resp) => {
          this.ipUsuario = resp.ip;
          resolve();
        },
        error: () => {
          this.ipUsuario = "0.0.0.0";
          resolve();
        }
      });
    });
  }

}