// transaction.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Transaction {
  id: number;
  reference: string;
  typeTransaction: 'DEPOT' | 'RETRAIT' | 'VIREMENT' | 'FRAIS';
  montant: number;
  devise: string;
  dateTransaction: string;
  description?: string;
  compteSourceId?: number;
  compteDestinationId?: number;
  numeroCompteSource?: string;
  numeroCompteDestination?: string;
  statut: 'EN_ATTENTE' | 'VALIDE' | 'ANNULE' | 'REJETE';
  userId?: number;
  userName?: string;
  frais?: number;
  soldeAvant?: number;
  soldeApres?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionCreateRequest {
  typeTransaction: 'DEPOT' | 'RETRAIT' | 'VIREMENT';
  montant: number;
  compteSourceId?: number;
  compteDestinationId?: number;
  numeroCompteSource?: string;
  numeroCompteDestination?: string;
  description?: string;
  devise?: string;
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

export interface TransactionStatistics {
  totalTransactions: number;
  totalDepots: number;
  totalRetraits: number;
  totalVirements: number;
  montantTotalDepots: number;
  montantTotalRetraits: number;
  montantTotalVirements: number;
  transactionsParMois: any[];
}

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private readonly API_URL = `${environment.apiUrl}/v1`;

  constructor(private http: HttpClient) {}

  // Obtenir toutes les transactions de tous les comptes (pour le dashboard)
  getAllTransactions(): Observable<any[]> {
    // Comme l'API ne fournit pas d'endpoint global, on retourne un tableau vide
    // ou on peut charger les transactions de tous les comptes si nécessaire
    return new Observable(observer => {
      observer.next([]);
      observer.complete();
    });
  }

  getTransactionsByNumeroCompte(numeroCompte: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/comptes/${numeroCompte}/transactions`);
  }

  getTransactionsByNumeroComptePeriod(numeroCompte: string, startDate: string, endDate: string): Observable<any[]> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    
    return this.http.get<any[]>(`${this.API_URL}/comptes/${numeroCompte}/transactions/period`, { params });
  }

  getTransactionById(id: number): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.API_URL}/${id}`);
  }

  getTransactionsByCompteId(compteId: number, page = 0, size = 10): Observable<PaginatedResponse<Transaction>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', 'dateTransaction,desc');
    
    return this.http.get<PaginatedResponse<Transaction>>(`${this.API_URL}/compte/${compteId}`, { params });
  }

  getTransactionsByClientId(clientId: number, page = 0, size = 10): Observable<PaginatedResponse<Transaction>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', 'dateTransaction,desc');
    
    return this.http.get<PaginatedResponse<Transaction>>(`${this.API_URL}/client/${clientId}`, { params });
  }

  getRecentTransactions(limit: number = 10): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.API_URL}/recent`, {
      params: new HttpParams().set('limit', limit.toString())
    });
  }

  createTransaction(transaction: TransactionCreateRequest): Observable<Transaction> {
    return this.http.post<Transaction>(this.API_URL, transaction);
  }

  effectuerDepot(compteId: number, montant: number, description?: string): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.API_URL}/depot`, {
      compteDestinationId: compteId,
      montant,
      description,
      typeTransaction: 'DEPOT'
    });
  }

  effectuerRetrait(compteId: number, montant: number, description?: string): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.API_URL}/retrait`, {
      compteSourceId: compteId,
      montant,
      description,
      typeTransaction: 'RETRAIT'
    });
  }

  effectuerVirement(compteSourceId: number, compteDestinationId: number, montant: number, description?: string): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.API_URL}/virement`, {
      compteSourceId,
      compteDestinationId,
      montant,
      description,
      typeTransaction: 'VIREMENT'
    });
  }

  annulerTransaction(id: number): Observable<Transaction> {
    return this.http.patch<Transaction>(`${this.API_URL}/${id}/annuler`, {});
  }

  validerTransaction(id: number): Observable<Transaction> {
    return this.http.patch<Transaction>(`${this.API_URL}/${id}/valider`, {});
  }

  rejeterTransaction(id: number, motif?: string): Observable<Transaction> {
    return this.http.patch<Transaction>(`${this.API_URL}/${id}/rejeter`, { motif });
  }

  getTransactionStatistics(dateDebut?: string, dateFin?: string): Observable<TransactionStatistics> {
    let params = new HttpParams();
    if (dateDebut) params = params.set('dateDebut', dateDebut);
    if (dateFin) params = params.set('dateFin', dateFin);
    
    return this.http.get<TransactionStatistics>(`${this.API_URL}/statistics`, { params });
  }

  searchTransactions(searchTerm: string, page = 0, size = 10): Observable<PaginatedResponse<Transaction>> {
    const params = new HttpParams()
      .set('search', searchTerm)
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<PaginatedResponse<Transaction>>(`${this.API_URL}/search`, { params });
  }

  getTransactionsByDateRange(dateDebut: string, dateFin: string, page = 0, size = 10): Observable<PaginatedResponse<Transaction>> {
    const params = new HttpParams()
      .set('dateDebut', dateDebut)
      .set('dateFin', dateFin)
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<PaginatedResponse<Transaction>>(`${this.API_URL}/date-range`, { params });
  }

  exportTransactions(format: 'pdf' | 'excel' = 'pdf'): Observable<Blob> {
    return this.http.get(`${this.API_URL}/export/${format}`, {
      responseType: 'blob'
    });
  }
}
