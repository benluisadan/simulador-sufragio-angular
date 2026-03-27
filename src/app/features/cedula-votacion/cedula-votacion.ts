import { Component } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { CedulaService } from '../../core/services/cedula.service';
import { OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { NgZone } from '@angular/core';



type TipoEleccion =
  | 'presidencial'
  | 'senado-unico'
  | 'senado-multiple'
  | 'diputado'
  | 'andino';

interface Partido {
  id: number;
  nombre: string;
  logopartido: string;
  antiguedad: string;
  idiologia: string;
  nombrecandidatopresidencial: string;
  urlfotocandidatopresidencial: string;
  experienciaPublicaPresidencial: string;
  dniPresidencial: string;
  sentenciaPresidencial: string;

  nombrePrimerVice: string;
  fotoPrimerVice: string;
  experienciaPublicaPrimerVice: string;
  dniPrimerVice: string;
  sentenciaPrimerVice: string;

  nombreSegundoVice: string;
  fotoSegundoVice: string;
  experienciaPublicaSegundoVice: string;
  dniSegundoVice: string;
  sentenciaSegundoVice: string;

  marcado: boolean;

  // candidatos para senado unico
  candidatos?: Candidato[];

  // Para secciones con 1 casilla
  numero?: number | string;
  // Para secciones con 2 casillas (senador único y diputados)
  numero1?: number;
  numero2?: number;
  listaElectoralPresidenteId: number;
  votanteCedulaId: number;

}

interface Candidato {
  id: number;
  dni: string;
  nombre: string;
  numero: number;
  foto: string;
  profesion: string;
  estudioSuperior: string;
  experienciaPublica: string;
  sentencia: string;
  listaElectoralCandidatoId?: number;
  organizacionjneid: number;

}

@Component({
  selector: 'app-cedula-votacion',
  standalone: true,
  imports: [NgIf, NgFor, CommonModule],
  templateUrl: './cedula-votacion.html',
  styleUrls: ['./cedula-votacion.scss']
})

export class CedulaVotacion implements OnInit {

  tab = 'presidencial';

  setTab(t: string) {
    this.tab = t;
  }


  // BINOMIO PRESIDENCIAL
  partidosPresidenciales: Partido[] = [];

  // SENADOR ÚNICO
  partidosSenadoUnico: Partido[] = [];


  // SENADOR MÚLTIPLE
  partidosSenadoMultiple: Partido[] = [];


  // DIPUTADOS
  partidosDiputados: Partido[] = [];

  // PARLAMENTO ANDINO
  partidosAndinos: Partido[] = [];


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cedulaService: CedulaService,
    private cd: ChangeDetectorRef,
    private ngZone: NgZone

  ) { }

  timeLeft = 300; // 5 minutos
  warningShown = false;
  extendTimeSeconds = 180; // 3 minutos extra
  private intervalId: any;
  private inactivityTimeout: any;


  procesoId!: number;
  votanteId!: number;
  ubigeoId = '';
  ubigeo = '';

  // POPUP
  popupVisible = false;
  popupTitulo = '';
  popupTituloPartido = '';
  logoOrganizacion = '';
  AntiguedadOrganizacion = '';
  IdiologiaOrganizaion = '';
  popupComoElegir = '';

  tipoActual: TipoEleccion | null = null;
  partidoActual: Partido | null = null;

  candidatosPopup: Candidato[] = [];
  candidatosSeleccionados: Candidato[] = []; // para múltiple
  candidatoUnico: Candidato | null = null;   // para único


  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {
      this.procesoId = Number(params['procesoId']);
      this.votanteId = Number(params['votanteId']);
      this.ubigeoId = params['ubigeo'];
      const dpto = this.ubigeoId.slice(0, 2); // "14"
      const prov = this.ubigeoId.slice(2, 4); // "01"
      const dist = this.ubigeoId.slice(4, 6); // "05"
      if (dpto == "14") {
        if (prov == "01" && dist == "99") {
          this.ubigeo = this.ubigeoId;
        } else {
          if (prov != "01") {
            this.ubigeo = dpto + '0000';
          } else {
            this.ubigeo = dpto + prov + '00';
          }
        }
      } else {
        this.ubigeo = dpto + '0000';
      }


      this.cargarPresidencial();
      this.cargarSenadoUnico();
      this.cargarSenadoMultiple();
      this.cargarDiputados();
      this.cargarParlamentoAndino();


    });

    this.iniciarTimer();
    this.detectarActividadUsuario();


  }

  advertenciaVisible = false;


  iniciarTimer() {
    this.ngZone.runOutsideAngular(() => {
      this.intervalId = setInterval(() => {
        this.ngZone.run(() => {
          this.timeLeft--;

          this.cd.detectChanges();

          if (this.timeLeft === 30 && !this.warningShown) {
            this.mostrarAdvertencia();
          }

          if (this.timeLeft <= 0) {
            clearInterval(this.intervalId);
            this.salir();
          }
        });
      }, 1000);
    });
  }


  mostrarAdvertencia() {
    this.warningShown = true;
    this.advertenciaVisible = true;
  }

  continuarTiempo() {
    this.timeLeft += this.extendTimeSeconds;
    this.advertenciaVisible = false;
    this.warningShown = false;
  }


  detectarActividadUsuario() {
    const resetInactividad = () => {
      clearTimeout(this.inactivityTimeout);
      this.inactivityTimeout = setTimeout(() => {
        this.mostrarAdvertencia();
      }, 240000); // 4 minutos sin actividad → mostrar advertencia
    };

    window.addEventListener('mousemove', resetInactividad);
    window.addEventListener('keydown', resetInactividad);
    window.addEventListener('click', resetInactividad);
    window.addEventListener('scroll', resetInactividad);

    resetInactividad();
  }

  cargarPresidencial() {

    this.cedulaService.getPresidencial(1).subscribe({
      next: (resp) => {

        this.partidosPresidenciales = resp.opciones.map((o: any) => ({
          id: o.organizacionId,
          nombre: o.organizacionNombre,
          logopartido: o.logoUrl,
          nombrecandidatopresidencial: o.presidenteNombre,
          urlfotocandidatopresidencial: o.presidenteFotoUrl,
          experienciaPublicaPresidencial: o.presidenteExperienciaPublica,
          dniPresidencial: o.presidenteDNI,
          sentenciaPresidencial: o.presidenteSentencias,

          nombrePrimerVice: o.primerViceNombre,
          fotoPrimerVice: o.primerViceFotoUrl,
          experienciaPublicaPrimerVice: o.primerViceExperienciaPublica,
          dniPrimerVice: o.primerViceDNI,
          sentenciaPrimerVice: o.primerViceSentencias,

          nombreSegundoVice: o.segundoViceNombre,
          fotoSegundoVice: o.segundoViceFotoUrl,
          experienciaPublicaSegundoVice: o.segundoViceExperienciaPublica,
          dniSegundoVice: o.segundoViceDNI,
          sentenciaSegundoVice: o.segundoViceSentencias,

          listaElectoralPresidenteId: o.listaId,
          votanteCedulaId: this.votanteId,
          antiguedad: o.antiguedad,
          idiologia: o.idiologia,

          marcado: false

        }));

        this.cd.detectChanges();

      },
      error: (err) => {
        console.error("Error cargando cédula presidencial", err);
        alert("No se pudo cargar la cédula presidencial.");
      }
    });


  }

  cargarSenadoUnico() {
    this.cedulaService.getSenadoUnico(2).subscribe({
      next: (resp) => {

        this.partidosSenadoUnico = resp.opciones.map((o: any) => ({
          id: o.organizacionId,
          nombre: o.organizacionNombre,
          logopartido: o.logoUrl,
          antiguedad: o.antiguedad,
          idiologia: o.idiologia,

          marcado: false,
          numero1: undefined,
          numero2: undefined,
          votanteCedulaId: this.votanteId,
          listaElectoralPresidenteId: o.listaId,
          candidatos: o.candidatos.map((c: any) => ({
            id: c.candidatoId,
            nombre: c.nombreCompleto,
            numero: c.numeroSufragio,
            foto: c.fotoUrl,
            profesion: c.profesion,
            estudioSuperior: c.educacionUniversitaria,
            experienciaPublica: c.experienciaPublico,
            listaElectoralCandidatoId: c.ListaId,
            dni: c.dni,
            sentencia: c.sentencias,
            organizacionjneid: c.organizacionPoliticaId
          }))
        }));

        this.cd.detectChanges();
      },
      error: (err) => {
        console.error("Error cargando Senado Único", err);
        alert("No se pudo cargar Senado Único.");
      }
    });
  }

  cargarSenadoMultiple() {
    this.cedulaService.getSenadoMultiple(3, this.ubigeo).subscribe({
      next: (resp) => {
        this.partidosSenadoMultiple = resp.opciones.map((o: any) => ({
          id: o.organizacionId,
          nombre: o.organizacionNombre,
          logopartido: o.logoUrl,
          antiguedad: o.antiguedad,
          marcado: false,
          numero: undefined,
          votanteCedulaId: this.votanteId,
          listaElectoralPresidenteId: o.listaId,
          candidatos: o.candidatos.map((c: any) => ({
            id: c.candidatoId,
            nombre: c.nombreCompleto,
            numero: c.numeroSufragio,
            foto: c.fotoUrl,
            profesion: c.profesion,
            estudioSuperior: c.educacionUniversitaria,
            experienciaPublica: c.experienciaPublico,
            listaElectoralCandidatoId: c.ListaId,
            dni: c.dni,
            sentencia: c.sentencias,
            organizacionjneid: c.organizacionPoliticaId
          }))
        }));
        this.cd.detectChanges();

      },
      error: (err) => {
        console.error("Error cargando Senado Múltiple", err);
        alert("No se pudo cargar Senado Múltiple.");
      }
    });
  }

  cargarDiputados() {
    this.cedulaService.getDiputados(4, this.ubigeo).subscribe({
      next: (resp) => {
        this.partidosDiputados = resp.opciones.map((o: any) => ({
          id: o.organizacionId,
          nombre: o.organizacionNombre,
          antiguedad: o.antiguedad,
          logopartido: o.logoUrl,
          marcado: false,
          numero1: undefined,
          numero2: undefined,
          votanteCedulaId: this.votanteId,
          listaElectoralPresidenteId: o.listaId,
          candidatos: o.candidatos.map((c: any) => ({
            id: c.candidatoId,
            nombre: c.nombreCompleto,
            numero: c.numeroSufragio,
            foto: c.fotoUrl,
            profesion: c.profesion,
            experienciaPublica: c.experienciaPublico,
            estudioSuperior: c.educacionUniversitaria,
            listaElectoralCandidatoId: c.ListaId,
            dni: c.dni,
            sentencia: c.sentencias,
            organizacionjneid: c.organizacionPoliticaId
          }))
        }));

        this.cd.detectChanges();

      },
      error: (err) => {
        console.error("Error cargando Diputados", err);
        alert("No se pudo cargar Diputados.");
      }
    });
  }

  cargarParlamentoAndino() {
    this.cedulaService.getParlamentoAndino(5).subscribe({
      next: (resp) => {
        this.partidosAndinos = resp.opciones.map((o: any) => ({
          id: o.organizacionId,
          nombre: o.organizacionNombre,
          logopartido: o.logoUrl, 
          antiguedad: o.antiguedad,
          marcado: false,
          numero1: undefined,
          numero2: undefined,
          votanteCedulaId: this.votanteId,
          listaElectoralPresidenteId: o.listaId,
          candidatos: o.candidatos.map((c: any) => ({
            id: c.candidatoId,
            nombre: c.nombreCompleto,
            numero: c.numeroSufragio,
            foto: c.fotoUrl,
            profesion: c.profesion,
            estudioSuperior: c.educacionUniversitaria,
            experienciaPublica: c.experienciaPublico,
            listaElectoralCandidatoId: c.ListaId,
            dni: c.dni,
            sentencia: c.sentencias,
            organizacionjneid: c.organizacionPoliticaId
          }))
        }));

        this.cd.detectChanges();

      },
      error: (err) => {
        console.error("Error cargando Parlamento Andino", err);
        alert("No se pudo cargar Parlamento Andino.");
      }
    });
  }

  // Abrir popup según tipo y partido
  abrirPopup(tipo: TipoEleccion, partido: Partido) {
    this.tipoActual = tipo;
    this.partidoActual = partido;
    this.candidatosSeleccionados = [];
    this.candidatoUnico = null;


    switch (tipo) {
      case 'presidencial':
        // Si ya está marcado → popup de deshacer
        if (partido.marcado) {
          this.popupTitulo = `Voto Presidencial - ${partido.nombre}`;
          this.candidatosPopup = []; // no mostramos candidatos
          this.tipoActual = 'presidencial';
          this.partidoActual = partido;
          //alert(partido.listaElectoralPresidenteId);
          this.popupVisible = true;
          return;
        }

        // Si NO está marcado → popup simple sin candidatos
        this.popupTitulo = `LISTA PRESIDENCIAL`;
        this.popupComoElegir = '';
        this.popupTituloPartido = `${partido.nombre}`;
        this.logoOrganizacion = `${partido.logopartido}`
        this.AntiguedadOrganizacion = `${partido.antiguedad}`
        this.IdiologiaOrganizaion = `${partido.idiologia}`
        this.candidatosPopup = []; // no hay candidatos
        this.tipoActual = 'presidencial';
        this.partidoActual = partido;
        this.popupVisible = true;
        return;



      case 'senado-unico':
        if (partido.marcado) {
          this.popupTitulo = `SENADOR ÚNICO`;
          this.popupTituloPartido = `${partido.nombre}`;
          this.candidatosPopup = [];
          this.popupVisible = true;
          return;
        }

        this.popupTitulo = `CANDIDATOS SENADOR ÚNICO`;
        this.popupTituloPartido = `${partido.nombre}`;
        this.logoOrganizacion = `${partido.logopartido}`
        this.AntiguedadOrganizacion = `${partido.antiguedad}`
        // Cargar candidatos reales del backend
        this.candidatosPopup = partido.candidatos ?? [];
        this.popupComoElegir = 'Para aplicar tu voto preferencial, selecciona 1 o 2 candidatos de tu preferencia.';

        this.candidatosSeleccionados = [];
        this.tipoActual = 'senado-unico';
        this.partidoActual = partido;
        this.popupVisible = true;
        return;

      case 'senado-multiple':

        if (partido.marcado) {
          this.popupTitulo = `SENADOR MULTIPLE`;
          this.popupTituloPartido = `${partido.nombre}`;
          this.logoOrganizacion = `${partido.logopartido}`
          this.candidatosPopup = [];
          this.tipoActual = 'senado-multiple';
          this.partidoActual = partido;
          this.popupVisible = true;
          return;
        }

        this.popupTitulo = `CANDIDATOS SENADOR MULTIPLE`;
        this.popupTituloPartido = `${partido.nombre}`;
        this.logoOrganizacion = `${partido.logopartido}`
        this.AntiguedadOrganizacion = `${partido.antiguedad}`
        this.popupComoElegir = 'Para aplicar tu voto preferencial, selecciona al candidato de tu preferencia.';
        // limpiar selección previa
        this.candidatosSeleccionados = [];

        // ← USAR CANDIDATOS REALES DEL BACKEND
        this.candidatosPopup = partido.candidatos ?? [];

        this.tipoActual = 'senado-multiple';
        this.partidoActual = partido;
        this.popupVisible = true;
        return;


      case 'diputado':

        if (partido.marcado) {
          this.popupTitulo = `DIPUTADOS`;
          this.candidatosPopup = [];
          this.tipoActual = 'diputado';
          this.partidoActual = partido;
          this.popupVisible = true;
          return;
        }

        this.popupTitulo = `CANDIDATOS DIPUTADOS`;
        this.popupTituloPartido = `${partido.nombre}`;
        this.logoOrganizacion = `${partido.logopartido}`
        this.AntiguedadOrganizacion = `${partido.antiguedad}`
        this.candidatosSeleccionados = [];


        // ← CANDIDATOS REALES DEL BACKEND
        this.candidatosPopup = partido.candidatos ?? [];
        this.popupComoElegir = 'Para aplicar tu voto preferencial, selecciona 1 o 2 candidatos de tu preferencia.';
        this.tipoActual = 'diputado';
        this.partidoActual = partido;
        this.popupVisible = true;
        return;

      case 'andino':

        if (partido.marcado) {
          this.popupTitulo = `CANDIDATOS PARLAMENTO ANDINO`;
          this.popupTituloPartido = `${partido.nombre}`;
          this.candidatosPopup = [];
          this.tipoActual = 'andino';
          this.partidoActual = partido;
          this.popupVisible = true;
          return;
        }
        this.popupComoElegir = 'Para aplicar tu voto preferencial, selecciona 1 o 2 candidatos de tu preferencia.';
        this.popupTitulo = `CANDIDATOS PARLAMENTO ANDINO`;
        this.logoOrganizacion = `${partido.logopartido}`
        this.AntiguedadOrganizacion = `${partido.antiguedad}`
        this.popupTituloPartido = `${partido.nombre}`;
        this.logoOrganizacion = `${partido.logopartido}`
        this.candidatosSeleccionados = [];

        // ← CANDIDATOS REALES DEL BACKEND
        this.candidatosPopup = partido.candidatos ?? [];

        this.tipoActual = 'andino';
        this.partidoActual = partido;
        this.popupVisible = true;
        return;

    }

    this.popupVisible = true;
  }

  // Seleccionar candidato dentro del popup
  seleccionarCandidato(c: Candidato) {
    if (!this.tipoActual) return;

    this.cedulaService.getCandidatoBackground(c.organizacionjneid, c.dni);


    if (this.tipoActual === 'senado-unico') {

      const existe = this.candidatosSeleccionados.find(x => x.id === c.id);

      if (existe) {
        // Si ya estaba seleccionado → quitarlo SIEMPRE
        this.candidatosSeleccionados =
          this.candidatosSeleccionados.filter(x => x.id !== c.id);
        return;
      }

      // Si NO estaba seleccionado → solo agregar si hay menos de 2
      if (this.candidatosSeleccionados.length < 2) {

        this.candidatosSeleccionados.push(c);
      }

      return;
    }


    if (this.tipoActual === 'senado-multiple') {

      const existe = this.candidatosSeleccionados.find(x => x.id === c.id);

      if (existe) {
        // Si ya estaba seleccionado → deseleccionar
        this.candidatosSeleccionados = [];
        return;
      }

      // Si no estaba seleccionado → reemplazar
      this.candidatosSeleccionados = [c];
      return;
    }

    if (this.tipoActual === 'diputado') {

      const existe = this.candidatosSeleccionados.some(x => x.id === c.id);

      // Si ya estaba seleccionado → quitarlo
      if (existe) {
        this.candidatosSeleccionados =
          this.candidatosSeleccionados.filter(x => x.id !== c.id);
        return;
      }

      // Si ya hay 2 seleccionados → no permitir más
      if (this.candidatosSeleccionados.length === 2) {
        return;
      }

      // Agregar candidato
      this.candidatosSeleccionados.push(c);
      return;
    }


    if (this.tipoActual === 'andino') {

      // Solo un candidato permitido
      //this.candidatosSeleccionados = [c];

      //return;

      const existe = this.candidatosSeleccionados.some(x => x.id === c.id);

      // Si ya estaba seleccionado → quitarlo
      if (existe) {
        this.candidatosSeleccionados =
          this.candidatosSeleccionados.filter(x => x.id !== c.id);
        return;
      }

      // Si ya hay 2 seleccionados → no permitir más
      if (this.candidatosSeleccionados.length === 2) {
        return;
      }

      // Agregar candidato
      this.candidatosSeleccionados.push(c);
      return;
    }



  }

  // Confirmar selección (Elegir)
  confirmarSeleccion() {
    if (!this.partidoActual || !this.tipoActual) return;

    switch (this.tipoActual) {

      case 'presidencial':
        this.partidosPresidenciales.forEach(p => p.marcado = false);
        this.partidoActual.marcado = true;

        this.cedulaService.votarPresidencial({
          votanteId: this.votanteId,
          eleccionId: 6,
          listaId: this.partidoActual.listaElectoralPresidenteId,
          organizacionId: this.partidoActual.id,
          ubigeo: this.ubigeoId
        }).subscribe();

        break;

      case 'senado-unico':
        // Limpiar todos los partidos primero
        this.partidosSenadoUnico.forEach(p => {
          p.marcado = false;
          p.numero1 = undefined;
          p.numero2 = undefined;
        });

        this.partidoActual.marcado = true;

        if (this.candidatosSeleccionados.length === 0) {
          // Solo marcó el partido
          this.partidoActual.numero1 = 0;
          this.partidoActual.numero2 = 0;
        }

        if (this.candidatosSeleccionados.length >= 1) {
          this.partidoActual.numero1 = this.candidatosSeleccionados[0].numero;
        }

        if (this.candidatosSeleccionados.length === 2) {
          this.partidoActual.numero2 = this.candidatosSeleccionados[1].numero;
        }

        this.cedulaService.votarSenado({
          votanteId: this.votanteId,
          eleccionId: 6,
          listaId: this.partidoActual.listaElectoralPresidenteId,
          organizacionId: this.partidoActual.id,
          preferencia1: this.partidoActual.numero1,
          preferencia2: this.partidoActual.numero2,
          ubigeo: this.ubigeoId
        }).subscribe();


        break;
      case 'senado-multiple':

        this.partidosSenadoMultiple.forEach(p => {
          p.marcado = false;
          p.numero = undefined;
        });

        this.partidoActual.marcado = true;

        if (this.candidatosSeleccionados.length === 1) {
          this.partidoActual.numero = this.candidatosSeleccionados[0].numero;
        }


        this.cedulaService.votarSenado({
          votanteId: this.votanteId,
          eleccionId: 6,
          listaId: this.partidoActual.listaElectoralPresidenteId,
          organizacionId: this.partidoActual.id,
          preferencia1: this.partidoActual.numero,
          ubigeo: this.ubigeoId
        }).subscribe();


        break;
      case 'diputado':

        // limpiar todos los partidos
        this.partidosDiputados.forEach(p => {
          p.marcado = false;
          p.numero1 = undefined;
          p.numero2 = undefined;
        });

        this.partidoActual.marcado = true;

        // ordenar candidatos seleccionados por número
        const seleccion = [...this.candidatosSeleccionados].sort((a, b) => a.numero - b.numero);

        if (seleccion.length >= 1) {
          this.partidoActual.numero1 = seleccion[0].numero;
        }

        if (seleccion.length === 2) {
          this.partidoActual.numero2 = seleccion[1].numero;
        }

        this.cedulaService.votarDiputado({
          votanteId: this.votanteId,
          eleccionId: 6,
          listaId: this.partidoActual.listaElectoralPresidenteId,
          organizacionId: this.partidoActual.id,
          preferencia1: this.partidoActual.numero1,
          preferencia2: this.partidoActual.numero2,
          ubigeo: this.ubigeoId
        }).subscribe();

        break;

      case 'andino':

        // limpiar todos los partidos
        this.partidosAndinos.forEach(p => {
          p.marcado = false;
          p.numero1 = undefined;
          p.numero2 = undefined;
        });

        this.partidoActual.marcado = true;

        // ordenar candidatos seleccionados por número
        const seleccionpa = [...this.candidatosSeleccionados].sort((a, b) => a.numero - b.numero);

        if (seleccionpa.length >= 1) {
          this.partidoActual.numero1 = seleccionpa[0].numero;
        }

        if (seleccionpa.length === 2) {
          this.partidoActual.numero2 = seleccionpa[1].numero;
        }

        this.cedulaService.votarParlamentoAndino({
          votanteId: this.votanteId,
          eleccionId: 6,
          listaId: this.partidoActual.listaElectoralPresidenteId,
          organizacionId: this.partidoActual.id,
          preferencia1: this.partidoActual.numero1,
          preferencia2: this.partidoActual.numero2,
          ubigeo: this.ubigeoId
        }).subscribe();

        break;
    }

    this.cerrarPopup();
  }

  cerrarPopup() {
    this.popupVisible = false;
    this.candidatosPopup = [];
    this.candidatosSeleccionados = [];
    this.candidatoUnico = null;
    this.partidoActual = null;
    this.tipoActual = null;
  }

  desmarcarPresidencial() {
    if (!this.partidoActual) return;

    this.partidoActual.marcado = false;
    this.partidoActual.numero = undefined;

    this.cerrarPopup();
  }

  desmarcarSenadoUnico() {
    if (!this.partidoActual) return;

    this.partidoActual.marcado = false;
    this.partidoActual.numero1 = undefined;
    this.partidoActual.numero2 = undefined;

    this.cerrarPopup();
  }

  esSeleccionado(c: Candidato): boolean {
    return this.candidatosSeleccionados.some(x => x.id === c.id);
  }

  desmarcarSenadoMultiple() {
    if (!this.partidoActual) return;

    this.partidoActual.marcado = false;
    this.partidoActual.numero = undefined;

    this.cerrarPopup();
  }

  desmarcarDiputado() {
    if (!this.partidoActual) return;

    this.partidoActual.marcado = false;
    this.partidoActual.numero1 = undefined;
    this.partidoActual.numero2 = undefined;

    this.cerrarPopup();
  }

  desmarcarAndino() {
    if (!this.partidoActual) return;

    this.partidoActual.marcado = false;
    this.partidoActual.numero1 = undefined;
    this.partidoActual.numero2 = undefined;

    this.cerrarPopup();
  }

  salir() {
    window.location.href = '/donar';
  }

  formatearTiempo(segundos: number): string {
    const h = Math.floor(segundos / 3600);
    const m = Math.floor((segundos % 3600) / 60);
    const s = segundos % 60;

    const hh = h.toString().padStart(2, '0');
    const mm = m.toString().padStart(2, '0');
    const ss = s.toString().padStart(2, '0');

    return `${hh}:${mm}:${ss}`;
  }

  irAProcesoElectoral() {
    window.location.href = '/donar';
  }

  isVisible(tipo: string) {
    if (window.innerWidth > 768) return true; // PC: mostrar todo
    return this.tab === tipo;                 // Móvil: solo la seleccionada
  }

  hayVotoRealizado(): boolean {
    return (
      this.partidosPresidenciales.some(p => p.marcado) ||
      this.partidosSenadoUnico.some(p => p.marcado) ||
      this.partidosSenadoMultiple.some(p => p.marcado) ||
      this.partidosDiputados.some(p => p.marcado) ||
      this.partidosAndinos.some(p => p.marcado)
    );
  }

  enviarSimulacion() {
    //this.cedulaService.enviarResumenVoto(this.votanteId).subscribe(); // sin callbacks
    //window.location.href = '/donar';
    //alert(this.ubigeoId);
    this.cedulaService.setVotanteId(this.votanteId);
    this.cedulaService.setUbigeoId(this.ubigeoId);
    this.cedulaService.setProcesoId(this.procesoId);
    this.router.navigate(['/resultadosimulacion']);
  }


}