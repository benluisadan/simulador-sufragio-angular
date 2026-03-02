import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UbigeoService {

  constructor(private http: HttpClient) {}

  getDepartamentos(): Observable<any[]> {
    return this.http.get<any[]>('/api/Ubigeo/departamentos');
  }

  getProvincias(departamentoId: string): Observable<any[]> {
    return this.http.get<any[]>(`/api/Ubigeo/provincias/${departamentoId}`);
  }

  getDistritos(departamentoId: string, provinciaId: string): Observable<any[]> {
    return this.http.get<any[]>(`/api/Ubigeo/distritos/${departamentoId}/${provinciaId}`);
  }
}