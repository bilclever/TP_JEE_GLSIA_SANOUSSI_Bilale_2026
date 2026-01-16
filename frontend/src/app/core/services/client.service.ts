// client.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Client {
  id: number;
  clientCode: string;
  nom: string;
  prenom: string;
  dateNaissance: string;
  sexe: string;
  adresse: string;
  telephone: string;
  email: string;
  nationalite: string;
  pieceIdentite?: string;
  numPieceIdentite?: string;
  dateEmissionPiece?: string;
  dateExpirationPiece?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  age?: number;
  fullName?: string;
  totalSolde?: number;
  nombreComptes?: number;
  dateDerniereTransaction?: string;
}

export interface ClientCreateRequest {
  nom: string;
  prenom: string;
  dateNaissance: string;
  sexe: string;
  adresse: string;
  telephone: string;
  email: string;
  nationalite: string;
  pieceIdentite?: string;
  numPieceIdentite?: string;
  dateEmissionPiece?: string;
  dateExpirationPiece?: string;
}

export interface ClientUpdateRequest extends Partial<ClientCreateRequest> {
  active?: boolean;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private readonly API_URL = `${environment.apiUrl}/v1/clients`;

  constructor(private http: HttpClient) {}

  // L'API disponible renvoie la liste complète des clients sans pagination
  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(this.API_URL);
  }

  getClient(id: number): Observable<Client> {
    return this.http.get<Client>(`${this.API_URL}/${id}`);
  }

  getClientByCode(code: string): Observable<Client> {
    return this.http.get<Client>(`${this.API_URL}/code/${code}`);
  }

  createClient(client: ClientCreateRequest): Observable<Client> {
    // Nettoie les champs undefined pour éviter les erreurs de validation backend
    const cleanedClient = Object.fromEntries(
      Object.entries(client).filter(([_, value]) => value !== undefined && value !== null && value !== '')
    );
    console.log('Client service - payload avant nettoyage:', JSON.stringify(client, null, 2));
    console.log('Client service - payload après nettoyage:', JSON.stringify(cleanedClient, null, 2));
    return this.http.post<Client>(this.API_URL, cleanedClient);
  }

  updateClient(id: number, client: ClientUpdateRequest): Observable<Client> {
    return this.http.put<Client>(`${this.API_URL}/${id}`, client);
  }

  deleteClient(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  activateClient(id: number): Observable<void> {
    return this.http.patch<void>(`${this.API_URL}/${id}/activate`, {});
  }

  deactivateClient(id: number): Observable<void> {
    return this.http.patch<void>(`${this.API_URL}/${id}/deactivate`, {});
  }

  getClientComptes(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/${id}/comptes`);
  }

  getClientWithComptes(id: number): Observable<Client> {
    return this.http.get<Client>(`${this.API_URL}/${id}/with-comptes`);
  }

  searchClients(query: string): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.API_URL}/search`, {
      params: { query }
    });
  }

}