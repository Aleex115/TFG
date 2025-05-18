import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import { UsuarioService } from '../usuario.service';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private uS: UsuarioService) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    return new Promise((resolve) => {
      this.uS.session().subscribe({
        next: (res) => {
          resolve(true);
        },
        error: (err) => {
          console.log('Error de sesión:', err);

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
          }).then(() => {
            this.router.navigate(['/login', { returnUrl: state.url }]);
            resolve(false);
          });
        },
      });
    });
  }
}
