import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../app.config';


@Injectable({ providedIn: 'root' })
export class VotanteService {


  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);

  private votanteIdInterno?: number;

  setVotanteId(id: number) {
    this.votanteIdInterno = id;
  }

  getVotanteId(): number | undefined {
    return this.votanteIdInterno;
  }

    private UbigeoIdInterno?: string;

  setUbigeoId(id: string) {
    this.UbigeoIdInterno = id;
  }

  getUbigeoId(): string | undefined {
    return this.UbigeoIdInterno;
  }

    private ProcesoIdInterno?: number;

  setProcesoId(id: number) {
    this.ProcesoIdInterno = id;
  }

  getProcesoId(): number | undefined {
    return this.ProcesoIdInterno;
  }

  registrarVotante(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/Votantes/registrar`, data);
  }

    registrarVotanteAnonimo(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/Votantes/RegistrarAnonimo`, data);
  }

  validarDni(dni: string) {
    return this.http.get(`${this.apiUrl}/api/Votantes/validar-dni/${dni}`);
  }

  validarVotante(correo: string, discado: string, numero: string) {
  return this.http.get(`${this.apiUrl}/api/Votantes/validar?correo=${correo}&discado=${discado}&numero=${numero}`);
}



}
