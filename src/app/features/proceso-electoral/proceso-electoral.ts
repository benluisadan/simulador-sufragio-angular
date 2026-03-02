import { CommonModule } from '@angular/common';
import { ProcesoService } from '../../core/services/proceso.service';
import { Proceso } from '../../core/models/proceso.model';
import { Router } from '@angular/router';
import { OnInit } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';



@Component({
  selector: 'app-proceso-electoral',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './proceso-electoral.html',
  styleUrls: ['./proceso-electoral.scss'],
  changeDetection: ChangeDetectionStrategy.Default

})

export class ProcesoElectoral implements OnInit {
  procesos: Proceso[] = [];
  cargando = true;

  constructor(
    private procesoService: ProcesoService,
    private router: Router,
    private cdr: ChangeDetectorRef

  ) { }



  ngOnInit(): void {
    console.log('ngOnInit ejecutado'); // ← AGREGA ESTO PARA VERIFICAR

    this.procesoService.obtenerProcesos().subscribe({
      next: (data) => {
        // Filtrar solo procesos activos
        this.procesos = data.filter(p => p.esActivo);
        this.cargando = false;
        this.cdr.detectChanges(); // ← ESTA LÍNEA ES LA CLAVE

        console.log('ngOnInit ejecutado obtenerProcesos'); // ← AGREGA ESTO PARA VERIFICAR
      },
      error: (err) => {
        console.error('Error cargando procesos', err);
        this.cargando = false;
      }

    });

  }

  abrirProceso(p: Proceso) {
    if (p.procesoId == 1) {
      this.router.navigate(['/registro-votante'], {
        queryParams: { procesoId: p.procesoId }
      });
    }else{
      alert('El proceso electoral no se encuentra disponible');

    }

  }
}
