import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../app.config';
import { ResumenItem } from '../models/resumen.simulacion.model';


@Injectable({
  providedIn: 'root'
})
export class CedulaService {

  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);

  private baseUrl = `${this.apiUrl}/api/Cedula`;
  private baseUrlv = `${this.apiUrl}/api/voto`;
  private baseUrlc = `${this.apiUrl}/api/candidatos`;
  private baseUrlrv = `${this.apiUrl}/api/ResumenVoto`;


  //private baseUrl = '/api/Cedula';
  //private baseUrlv = '/api/voto';

  //constructor(private http: HttpClient) { }

  getPresidencial(procesoId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/presidencial/${procesoId}`);
  }

  getSenadoUnico(TipoEleccionId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/senado-unico/${TipoEleccionId}`);
  }

  getSenadoMultiple(TipoEleccionId: number, UbigeoId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/senado-multiple/${TipoEleccionId}/${UbigeoId}`);
  }

  getDiputados(tipoEleccionId: number, UbigeoId: string) {
    return this.http.get<any>(`${this.baseUrl}/diputado/${tipoEleccionId}/${UbigeoId}`);
  }

  getParlamentoAndino(tipoEleccionId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/parlamento-andino/${tipoEleccionId}`);
  }

  votarPresidencial(data: any) {
    return this.http.post(`${this.baseUrlv}/presidencial`, data);
  }

  votarSenado(data: any) {
    return this.http.post(`${this.baseUrlv}/senado`, data);
  }

  votarDiputado(data: any) {
    return this.http.post(`${this.baseUrlv}/diputado`, data);
  }

  votarParlamentoAndino(data: any) {
    return this.http.post(`${this.baseUrlv}/parlamento-andino`, data);
  }

  getCandidatoBackground(organizacionId: number, dni: string): void {
    this.http.get(`${this.baseUrlc}/${organizacionId}/${dni}`)
      .subscribe({
        next: () => console.log('Candidato precargado en segundo plano'),
        error: (err) => console.warn('Error precargando candidato', err)
      });
  }

  enviarResumenVoto(votanteId: number) {
    return this.http.get(`${this.baseUrlrv}/${votanteId}`);
  }

  enviarResumenVotoSinRegistro(votanteId: number, correoUsuario: string) {
    const params = { correo: correoUsuario };
    return this.http.get(`${this.baseUrlrv}/anonimo/${votanteId}`, { params });
  }
  private votanteIdInterno?: number;

  setVotanteId(id: number) {
    this.votanteIdInterno = id;
  }

  getVotanteId(): number | undefined {
    return this.votanteIdInterno;
  }

  ResumenSimulacion(votanteId: number) {
    return this.http.get<{
      codigoerror: string;
      mensaje: string;
      data: ResumenItem[];
    }>(`${this.baseUrlrv}/Simulacion/${votanteId}`);

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



}