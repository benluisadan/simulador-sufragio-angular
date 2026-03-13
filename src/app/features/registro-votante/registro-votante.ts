import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UbigeoService } from '../../core/services/ubigeo.service';
import { VotanteService } from '../../core/services/votante.service';
import { error } from 'console';
import { Router } from '@angular/router';


@Component({
  selector: 'app-registro-votante',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule, ReactiveFormsModule],
  templateUrl: './registro-votante.html',
  styleUrls: ['./registro-votante.scss']
})

export class RegistroVotante implements OnInit {

  // 🔵 Navegación entre formularios
  activeForm: 'simular' | 'modificar' | 'suplantacion' = 'simular';

  setForm(form: 'simular' | 'modificar' | 'suplantacion') {
    this.activeForm = form;
  }

  // 🔵 Parámetro recibido desde proceso-electoral
  procesoId!: number;

  // 🔵 Datos de ubigeo
  departamentos: any[] = [];
  provincias: any[] = [];
  distritos: any[] = [];
  telefonia: any[] = [];
  discadoBloqueado = true;
  longitudCelular = 9; // por defecto Perú

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private ubigeoService: UbigeoService,
    private votanteService: VotanteService,
    private router: Router
  ) { }

  form: any;

  ngOnInit(): void {

    this.form = this.fb.group({
      //dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      departamento: ['', Validators.required],
      provincia: ['', Validators.required],
      distrito: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      //celular: ['', [Validators.required, this.validarCelular.bind(this)]]
      discado: [{ value: '+51', disabled: true }, Validators.required],
      numeroCelular: ['', [Validators.required, this.validarNumeroCelular.bind(this)]],
      aceptaTratamientoDatos: [false, Validators.requiredTrue]


    });


    // 1. Recibir procesoId
    this.route.queryParams.subscribe(params => {
      this.procesoId = Number(params['procesoId']);
      console.log('Proceso recibido:', this.procesoId);
    });


    this.ubigeoService.getDepartamentos().subscribe({
      next: (data) => {
        this.departamentos = data;

        // Seleccionar AMAZONAS por defecto
        const amazonas = this.departamentos.find(d => d.nombre.toUpperCase() === 'AMAZONAS');

        if (amazonas) {
          this.form.patchValue({ departamento: amazonas.id }, { emitEvent: false });
          this.onDepartamentoChange();
        }
      },
      error: (err) => console.error('Error cargando departamentos', err)
    });


    this.ubigeoService.getTelefonia().subscribe({
      next: (data) => this.telefonia = data,
      error: (err) => console.error('Error cargando telefonía', err)
    });

  }



  onDepartamentoChange() {
    const dep = this.form.value.departamento;

    //  Si el usuario selecciona "Seleccionar"
    if (!dep) {
      this.provincias = [];
      this.distritos = [];

      this.form.patchValue({
        provincia: '',
        distrito: ''
      }, { emitEvent: false });

      // Bloquear discado y resetear
      this.form.controls['discado'].disable();
      this.form.patchValue({ discado: '+51' });

      this.longitudCelular = 9;
      return; //  Salimos, no llamamos al backend
    }

    //  Si NO es extranjero → Perú
    if (dep !== '140199') {
      this.form.controls['discado'].disable();
      this.form.patchValue({ discado: '+51' });
      this.longitudCelular = 9;
    } else {
      this.form.controls['discado'].enable();
      this.form.patchValue({ discado: '' });
      this.longitudCelular = 0;
    }

    //  Resetear provincia y distrito
    this.form.patchValue({ provincia: '', distrito: '' });
    this.distritos = [];

    // Cargar provincias del departamento seleccionado
    this.ubigeoService.getProvincias(dep).subscribe({
      next: (data) => this.provincias = data,
      error: (err) => console.error('Error cargando provincias', err)
    });
  }

  onDiscadoChange() {
    const discado = this.form.value.discado;

    const pais = this.telefonia.find(p => p.codigoTelefonico === discado);

    if (pais) {
      this.longitudCelular = pais.longitudCelular;

      this.form.controls['numeroCelular'].setValidators([
        Validators.required,
        this.validarNumeroCelular.bind(this)
      ]);

      this.form.controls['numeroCelular'].updateValueAndValidity();
    }
  }



  // 4. Cuando cambia la provincia
  onProvinciaChange() {
    const dep = this.form.value.departamento!;
    const prov = this.form.value.provincia!;

    this.ubigeoService.getDistritos(dep, prov).subscribe({
      next: (data) => this.distritos = data,
      error: (err) => console.error('Error cargando distritos', err)
    });
  }

  validarNumeroCelular(control: any) {
    const value = control.value;

    if (!value) return null;

    // Solo números
    if (!/^\d+$/.test(value)) {
      return { soloNumeros: true };
    }

    // Validación dinámica
    if (value.length !== this.longitudCelular) {
      return { longitudInvalida: true };
    }

    return null;
  }

 

  enviar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (!this.form.value.aceptaTratamientoDatos) {
      this.form.controls['aceptaTratamientoDatos'].markAsTouched();
      alert("Debes aceptar el tratamiento de datos personales para continuar.");
      return;
    }

    let depx = this.form.value.departamento;
    if (depx.substring(0, 2) === '14') depx = '14';
    const ubigeo = depx + this.form.value.provincia + this.form.value.distrito;

    const correo = this.form.value.correo;
    //const discado = this.form.value.discado.replace('+', '');
    const discado = this.form.get('discado')?.value.replace('+', '');

    const numero = this.form.value.numeroCelular;

    this.votanteService.validarVotante(correo, discado, numero).subscribe({
      next: (resp: any) => {

        if (resp.existe == false && resp.permitido == false) {
          this.registrarNuevoVotante();
          return;
        }
        // Si existe → modificar voto
        if (resp.existe == true && resp.permitido == true) {

          this.router.navigate(['/cedula-votacion'], {
            queryParams: {
              procesoId: this.procesoId,
              votanteId: resp.votanteId,
              ubigeo: ubigeo
            }
          });
        } else {
          alert(resp.motivo);
        }


      },
      error: () => alert("Error validando votante")
    });
  }


  cancelar() {
    this.router.navigate(['/proceso-electoral']);
  }

  registrarNuevoVotante() {

    //const discado = this.form.value.discado.replace('+', '');
    const discado = this.form.get('discado')?.value.replace('+', '');

    const numero = this.form.value.numeroCelular;

    let depx = this.form.value.departamento;
    if (depx.substring(0, 2) === '14') depx = '14';

    const ubigeo = depx + this.form.value.provincia + this.form.value.distrito;

    const payload = {
      ubigeo: ubigeo,
      correo: this.form.value.correo,
      numeroCelular: numero,
      discadoInternacionalCelular: discado,
      aceptaTratamientoDatos: this.form.value.aceptaTratamientoDatos

    };

    this.votanteService.registrarVotante(payload).subscribe({
      next: (resp) => {
        this.router.navigate(['/cedula-votacion'], {
          queryParams: {
            procesoId: this.procesoId,
            votanteId: resp.votanteId,
            ubigeo: ubigeo
          }
        });
      },
      error: (err) => {
        console.error("Error completo:", err);
        alert("Error registrando votante");
      }
    });
  }

  mostrarPopupPrivacidad = false;

  abrirPopupPrivacidad() {
    this.mostrarPopupPrivacidad = true;
  }

  cerrarPopupPrivacidad() {
    this.mostrarPopupPrivacidad = false;
  }


}