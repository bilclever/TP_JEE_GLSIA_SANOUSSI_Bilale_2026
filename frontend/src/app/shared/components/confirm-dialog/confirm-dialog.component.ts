// confirm-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  title: string;
  message?: string;
  details?: { label: string; value: string }[];
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info';
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon [class]="'icon-' + data.type">
        {{ getIcon() }}
      </mat-icon>
      {{ data.title }}
    </h2>
    <mat-dialog-content>
      <p *ngIf="data.message">{{ data.message }}</p>

      <div class="details" *ngIf="data.details?.length">
        <div class="detail-row" *ngFor="let detail of data.details">
          <span class="label">{{ detail.label }}:</span>
          <span class="value">{{ detail.value }}</span>
        </div>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()" class="action-btn">
        {{ data.cancelText || 'Annuler' }}
      </button>
      <button 
        mat-raised-button 
        [color]="data.type === 'danger' ? 'warn' : 'primary'"
        (click)="onConfirm()"
        class="action-btn">
        {{ data.confirmText || 'Confirmer' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      width: 100%;
      color: #000 !important;
    }
    h2, mat-dialog-content, .details, .detail-row, .label, .value, p, mat-dialog-actions, .action-btn {
      color: #000 !important;
    }
    .detail-row {
      background-color: #f5f5f5 !important;
    }
    .label {
      font-weight: 600;
      color: #2196f3 !important;
      font-size: 12px;
    }
    mat-icon.icon-warning {
      color: #ff9800;
    }
    mat-icon.icon-danger {
      color: #f44336;
    }
    mat-icon.icon-info {
      color: #2196f3;
    }
    mat-dialog-content {
      overflow-y: auto;
      max-height: 60vh;
      padding: 8px 0;
      margin: 0;
    }
    .action-btn {
      min-width: 80px;
      font-size: 12px;
    }
    @media (max-width: 600px) {
      h2 {
        font-size: 16px;
      }
      mat-dialog-content {
        max-height: 50vh;
        padding: 6px 0;
      }
      .detail-row {
        font-size: 12px;
        gap: 3px;
        padding: 5px;
      }
      .label {
        font-size: 11px;
      }
      .value {
        font-size: 12px;
      }
      mat-dialog-actions {
        flex-direction: row;
        justify-content: flex-end;
      }
      .action-btn {
        min-width: 70px;
        font-size: 11px;
        padding: 4px 8px !important;
      }
    }
  `]
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {
    // Set default type if not provided
    this.data.type = this.data.type || 'info';
  }

  getIcon(): string {
    switch (this.data.type) {
      case 'warning':
        return 'warning';
      case 'danger':
        return 'error';
      case 'info':
      default:
        return 'info';
    }
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
