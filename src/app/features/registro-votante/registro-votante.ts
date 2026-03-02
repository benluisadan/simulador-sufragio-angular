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
      dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      departamento: ['', Validators.required],
      provincia: ['', Validators.required],
      distrito: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      celular: ['', [Validators.required, this.validarCelular.bind(this)]]
    });


    // 1. Recibir procesoId
    this.route.queryParams.subscribe(params => {
      this.procesoId = Number(params['procesoId']);
      console.log('Proceso recibido:', this.procesoId);
    });

    // 2. Cargar departamentos al iniciar
    this.ubigeoService.getDepartamentos().subscribe({
      next: (data) => this.departamentos = data,
      error: (err) => console.error('Error cargando departamentos', err)
    });
  }

  // 3. Cuando cambia el departamento
  onDepartamentoChange() {
    const dep = this.form.value.departamento!;

    this.form.patchValue({ provincia: '', distrito: '' });
    this.distritos = [];

    this.ubigeoService.getProvincias(dep).subscribe({
      next: (data) => this.provincias = data,
      error: (err) => console.error('Error cargando provincias', err)
    });
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

  // 🔵 VALIDACIÓN DEL CELULAR
  validarCelular(control: any) {
    const value = control.value;

    if (!value) return null;

    // Peruano: +51 9XXXXXXXX
    const peruano = /^\+51[9]\d{8}$/;

    // Extranjero: + seguido de código y número
    const extranjero = /^\+\d{6,15}$/;

    if (peruano.test(value) || extranjero.test(value)) {
      return null;
    }

    return { celularInvalido: true };
  }

  enviar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const dni = this.form.value.dni!;
    const celularIngresado = this.form.value.celular!;

    // 1. Validar si el DNI existe en el backend
    this.votanteService.validarDni(dni).subscribe({
      next: (resp: any) => {

        // 2. Si NO existe → registrar y continuar
        if (!resp.existe) {
          this.registrarNuevoVotante();
          return;
        }

        // 3. Si existe → comparar celular
        const celularBD = `+${resp.discadoInternacionalCelular}${resp.numeroCelular}`;

        if (celularBD === celularIngresado) {
          // Celular coincide → modificar voto
          //alert("Este DNI ya está registrado. Puedes modificar tu voto.");
          //this.setForm('modificar');
          this.router.navigate(['/cedula-votacion'], {
          queryParams: {
            procesoId: this.procesoId,
            votanteId: resp.votantenId,
            ubigeo: resp.ubigeoId
          }
        });
        } else {
          // Celular NO coincide → suplantación
          alert(
            "Este DNI ya está registrado pero con otro número de celular.\n" +
            "Esto indica un posible caso de suplantación."
          );
          this.setForm('suplantacion');
        }
      },
      error: (err) => {
        console.error("Error validando DNI", err);
        alert("Error validando DNI. Intenta nuevamente.");
      }
    });
  }

  registrarNuevoVotante() {

    const celular = this.form.value.celular!;
    const discado = celular.startsWith('+51')
      ? '51'
      : celular.replace('+', '').substring(0, celular.indexOf('9'));

    const numero = celular.replace(`+${discado}`, '');

    var depx = this.form.value.departamento;

    if (depx.substring(0, 2) == '14') {
      depx = '14';
    }

    const ubigeo =
      depx +
      this.form.value.provincia +
      this.form.value.distrito;

    ///alert(ubigeo);
    const payload = {
      dni: this.form.value.dni,
      ubigeo: ubigeo,
      correo: this.form.value.correo,
      numeroCelular: numero,
      discadoInternacionalCelular: discado
    };

    this.votanteService.registrarVotante(payload).subscribe({
      next: (resp) => {
        console.log("Respuesta OK:", resp);

        const votanteId = resp.votanteId;
        const UbigeoId = payload.ubigeo;

        //alert("Registro exitoso. Ahora podrás emitir tu voto.");
        // Aquí puedes redirigir a la cédula
        this.router.navigate(['/cedula-votacion'], {
          queryParams: {
            procesoId: this.procesoId,
            votanteId: votanteId,
            ubigeo: UbigeoId
          }
        });

      },
      error: (err) => {
        console.error("Error completo:", err);

        let mensaje = `Ocurrió un error al registrar.\n\n`;

        // Código HTTP
        mensaje += `Código: ${err.status}\n`;

        // Texto del estado (Bad Request, Conflict, Internal Server Error)
        if (err.statusText) {
          mensaje += `Estado: ${err.statusText}\n`;
        }

        // Mensaje enviado por el backend
        if (err.error) {
          if (typeof err.error === 'string') {
            mensaje += `Detalle: ${err.error}\n`;
          } else if (err.error.message) {
            mensaje += `Detalle: ${err.error.message}\n`;
          } else {
            mensaje += `Detalle: ${JSON.stringify(err.error)}\n`;
          }
        }

        // URL que falló
        if (err.url) {
          mensaje += `URL: ${err.url}\n`;
        }

        alert(mensaje);
      }
    });
  }
}