import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  showAlert(
    icon: 'success' | 'error' | 'warning' | 'info',
    title: string,
    text: string
  ): void {
    Swal.fire({
      icon,
      title,
      text,
      confirmButtonText: 'Accept',
      customClass: {
        confirmButton: 'swal-custom-button',
      },
      theme: 'dark',
      backdrop: '#000c',
    });
  }
  showMessageExpired() {
    Swal.fire({
      title: 'Expired session',
      text: 'Please log in again.',
      icon: 'warning',
      confirmButtonText: 'Accept',
      customClass: {
        confirmButton: 'swal-custom-button',
      },
      theme: 'dark',
      backdrop: '#000c',
    });
  }
}
