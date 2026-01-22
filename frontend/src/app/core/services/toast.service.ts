import { Injectable } from '@angular/core';
import { ToastrService, IndividualConfig } from 'ngx-toastr';
import { Subject } from 'rxjs';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private lastShownAt = new Map<string, number>();
  private throttleMs = 1500; // evita les doublons rapprochés
  private _events = new Subject<{ type: ToastType; title: string; message: string; timestamp: Date }>();
  readonly events$ = this._events.asObservable();

  constructor(private toastr: ToastrService) {}

  success(message: string, title: string = 'Succès', config?: Partial<IndividualConfig>): void {
    this.show('success', message, title, config);
  }

  error(message: string, title: string = 'Erreur', config?: Partial<IndividualConfig>): void {
    this.show('error', message, title, config);
  }

  info(message: string, title: string = 'Information', config?: Partial<IndividualConfig>): void {
    this.show('info', message, title, config);
  }

  warning(message: string, title: string = 'Attention', config?: Partial<IndividualConfig>): void {
    this.show('warning', message, title, config);
  }

  private show(type: ToastType, message: string, title: string, config?: Partial<IndividualConfig>): void {
    const key = `${type}::${title}::${message}`;
    const now = Date.now();
    const last = this.lastShownAt.get(key) || 0;
    if (now - last < this.throttleMs) {
      return; // ignore duplicate shown too quickly
    }
    this.lastShownAt.set(key, now);

    switch (type) {
      case 'success':
        this.toastr.success(message, title, config);
        break;
      case 'error':
        this.toastr.error(message, title, config);
        break;
      case 'info':
        this.toastr.info(message, title, config);
        break;
      case 'warning':
        this.toastr.warning(message, title, config);
        break;
    }

    // Diffuse l'événement pour création de notification
    this._events.next({ type, title, message, timestamp: new Date() });
  }
}
