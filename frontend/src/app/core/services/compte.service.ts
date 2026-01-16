// compte.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Compte {
  id: number;
  numeroCompte: string;
  typeCompte: 'COURANT' | 'EPARGNE';
  solde: number;
  devise: string;
  dateOuverture: string;
  dateFermeture?: string;
  statut: 'ACTIF' | 'FERME' | 'BLOQUE';
  clientId: number;
  clientNom?: string;
  clientPrenom?: string;
  tauxInteret?: number;
  decouvertAutorise?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CompteCreateRequest {
  type: 'COURANT' | 'EPARGNE';
  clientId: number;
  libelle?: string;
  dateCreation?: string;
  solde?: number;
  devise?: string;
}

export interface CompteUpdateRequest {
  statut?: 'ACTIF' | 'FERME' | 'BLOQUE';
  tauxInteret?: number;
  decouvertAutorise?: number;
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
export class CompteService {
  private readonly API_URL = `${environment.apiUrl}/v1/comptes`;

  constructor(private http: HttpClient) {}

  // Liste de tous les comptes (par type)
  getAllComptes(page = 0, size = 1000): Observable<Compte[]> {
    // Récupérer les comptes COURANT et EPARGNE et les combiner
    return forkJoin({
      courant: this.getComptesByType('COURANT').pipe(catchError(() => of([]))),
      epargne: this.getComptesByType('EPARGNE').pipe(catchError(() => of([])))
    }).pipe(
      map(({ courant, epargne }) => [...courant, ...epargne])
    );
  }

  getCompteByNumero(numeroCompte: string): Observable<Compte> {
    return this.http.get<Compte>(`${this.API_URL}/${numeroCompte}`);
  }

  getComptesByClientId(clientId: number): Observable<Compte[]> {
    return this.http.get<Compte[]>(`${this.API_URL}/client/${clientId}`);
  }

  getComptesByType(type: 'COURANT' | 'EPARGNE'): Observable<Compte[]> {
    return this.http.get<Compte[]>(`${this.API_URL}/type/${type}`);
  }

  getTransactionsByCompte(numeroCompte: string, page = 0, size = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get(`${this.API_URL}/${numeroCompte}/transactions`, { params });
  }

  getTransactionsByPeriod(numeroCompte: string, dateDebut: string, dateFin: string): Observable<any> {
    const params = new HttpParams()
      .set('dateDebut', dateDebut)
      .set('dateFin', dateFin);
    return this.http.get(`${this.API_URL}/${numeroCompte}/transactions/period`, { params });
  }

  getSolde(numeroCompte: string): Observable<number> {
    return this.http.get<number>(`${this.API_URL}/${numeroCompte}/solde`);
  }

  createCompte(compte: CompteCreateRequest): Observable<Compte> {
    return this.http.post<Compte>(this.API_URL, compte);
  }

  deleteCompte(numeroCompte: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${numeroCompte}`);
  }

  effectuerDepot(numeroCompte: string, montant: number, description?: string): Observable<any> {
    let params = new HttpParams().set('montant', montant.toString());
    if (description) {
      params = params.set('description', description);
    }
    return this.http.post(`${this.API_URL}/${numeroCompte}/depot`, {}, { params });
  }

  effectuerRetrait(numeroCompte: string, montant: number, description?: string): Observable<any> {
    let params = new HttpParams().set('montant', montant.toString());
    if (description) {
      params = params.set('description', description);
    }
    return this.http.post(`${this.API_URL}/${numeroCompte}/retrait`, {}, { params });
  }

  effectuerVirement(numeroCompteSource: string, numeroCompteDestination: string, montant: number, description?: string): Observable<any> {
    return this.http.post(`${this.API_URL}/virement`, {
      compteSource: numeroCompteSource,
      compteDestination: numeroCompteDestination,
      montant,
      description
    });
  }

  activerCompte(numeroCompte: string): Observable<Compte> {
    return this.http.patch<Compte>(`${this.API_URL}/${numeroCompte}/activate`, {});
  }

  desactiverCompte(numeroCompte: string): Observable<Compte> {
    return this.http.patch<Compte>(`${this.API_URL}/${numeroCompte}/deactivate`, {});
  }
}
