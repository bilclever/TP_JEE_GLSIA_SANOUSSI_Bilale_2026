// phone.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

/**
 * Format un numéro de téléphone
 * Exemples:
 *   21612345678 => +216 21 612 345 678
 *   0612345678 => +216 21 612 345 678
 */
@Pipe({
  name: 'phone',
  standalone: true
})
export class PhonePipe implements PipeTransform {
  transform(value: string | number | null | undefined, format: string = 'international'): string {
    if (!value) {
      return '';
    }

    let phone = String(value).replace(/\D/g, '');

    switch (format) {
      case 'international':
        return this.formatInternational(phone);
      case 'national':
        return this.formatNational(phone);
      case 'default':
      default:
        return this.formatDefault(phone);
    }
  }

  private formatInternational(phone: string): string {
    // Remove leading 0 if present
    if (phone.startsWith('0')) {
      phone = phone.substring(1);
    }

    // Add country code if not present (Tunisia: +216)
    if (!phone.startsWith('216')) {
      phone = '216' + phone;
    }

    // Format as +216 XX XXX XXX XXX
    if (phone.length >= 12) {
      return `+${phone.substring(0, 3)} ${phone.substring(3, 5)} ${phone.substring(5, 8)} ${phone.substring(8, 11)} ${phone.substring(11)}`;
    }

    return phone;
  }

  private formatNational(phone: string): string {
    // Remove leading 0 or country code
    if (phone.startsWith('0')) {
      phone = phone.substring(1);
    } else if (phone.startsWith('216')) {
      phone = phone.substring(3);
    }

    // Format as XX XXX XXX XXX or XX XXX XXX XX
    if (phone.length === 8) {
      return `${phone.substring(0, 2)} ${phone.substring(2, 5)} ${phone.substring(5, 8)}`;
    } else if (phone.length === 9) {
      return `${phone.substring(0, 2)} ${phone.substring(2, 5)} ${phone.substring(5, 8)} ${phone.substring(8)}`;
    }

    return phone;
  }

  private formatDefault(phone: string): string {
    // Format as XXXX XXXX XXXX or similar depending on length
    if (phone.length <= 4) {
      return phone;
    } else if (phone.length <= 8) {
      return `${phone.substring(0, phone.length - 4)} ${phone.substring(phone.length - 4)}`;
    } else if (phone.length <= 12) {
      return `${phone.substring(0, phone.length - 8)} ${phone.substring(phone.length - 8, phone.length - 4)} ${phone.substring(phone.length - 4)}`;
    } else {
      return `${phone.substring(0, phone.length - 12)} ${phone.substring(phone.length - 12, phone.length - 8)} ${phone.substring(phone.length - 8, phone.length - 4)} ${phone.substring(phone.length - 4)}`;
    }
  }
}
