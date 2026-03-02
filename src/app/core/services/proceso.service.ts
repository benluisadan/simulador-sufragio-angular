import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Proceso } from '../models/proceso.model';

@Injectable({ providedIn: 'root' })
export class ProcesoService {
  private apiUrl = '/api/Procesos';

  constructor(private http: HttpClient) {}

  obtenerProcesos(): Observable<Proceso[]> {
    return this.http.get<Proceso[]>(this.apiUrl);
  }
}