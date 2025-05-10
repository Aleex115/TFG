import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../usuario.service';
import { AlertService } from '../alert.service';
import { FollowService } from '../follow.service';
import Swal from 'sweetalert2';
import { PetitionService } from '../petition.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-search',
  imports: [FormsModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css',
})
// publico: 0,
//   privado: 1,
export class SearchComponent {
  username = '';
  user: any;
  usersArray: any;
  constructor(
    private uS: UsuarioService,
    private alert: AlertService,
    private fS: FollowService,
    private pS: PetitionService,
    private router: Router
  ) {
    uS.getOne().subscribe();
  }
  search() {
    this.uS.getAll(this.username).subscribe({
      next: (res: any) => {
        this.usersArray = res.users;
        console.log(res);
      },
      error: (err) => {
        console.log(err);
        this.alert.showAlert(
          'error',
          err.error.title,
          err.error.message || 'An unexpected error occurred'
        );
      },
    });
  }
  follow(u: any) {
    console.log(u.es_amigo);
    if (u.es_amigo == 1) {
      return;
    }
    if (u.id_estadou == 0) {
      console.log('Perfil publico');
      this.fS.follow(u.dni).subscribe({
        next: (res: any) => {
          console.log(res);
          this.reload();

          this.alert.showAlert('success', 'OK', 'Followed successfully');
        },
        error: (err) => {
          console.log(err);
          this.alert.showAlert(
            'error',
            err.error.title,
            err.error.message || 'An unexpected error occurred'
          );
        },
      });
    }
    if (u.id_estadou == 1) {
      console.log('Perfil publico');
      this.pS.request(u.dni).subscribe({
        next: (res: any) => {
          console.log(res);
          this.reload();

          this.alert.showAlert('success', 'OK', 'Requested successfully');
        },
        error: (err) => {
          console.log(err);
          this.alert.showAlert(
            'error',
            err.error.title,
            err.error.message || 'An unexpected error occurred'
          );
        },
      });
    }
  }
  unfollow(u: any) {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn-accept',
        cancelButton: 'btn-delete',
      },
      buttonsStyling: false,
      theme: 'dark',
      backdrop: '#000c',
    });

    swalWithBootstrapButtons
      .fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, unfollow it!',
        cancelButtonText: 'No, cancel!',
        reverseButtons: true,
      })
      .then((result) => {
        if (result.isConfirmed) {
          this.reload();

          // Aquí puedes llamar al servicio para eliminar el elemento
          if (u.peticion == 1) {
            this.pS.cancelRequest(u.dni).subscribe({
              next: (res: any) => {
                console.log(res);
                this.reload();
                if (res.status === 200) {
                  swalWithBootstrapButtons.fire(
                    'Canceled!',
                    'You canceled the request',
                    'success'
                  );
                }
              },
              error: (err) => {
                swalWithBootstrapButtons.fire(
                  err.error.title,
                  err.error.message || 'An unexpected error occurred',
                  'error'
                );
              },
            });
          } else {
            this.fS.unfollow(u.dni).subscribe({
              next: (res: any) => {
                console.log(res);
                if (res.status === 200) {
                  swalWithBootstrapButtons.fire(
                    'Unfollowed!',
                    'You finish the following',
                    'success'
                  );
                }
              },
              error: (err) => {
                swalWithBootstrapButtons.fire(
                  err.error.title,
                  err.error.message || 'An unexpected error occurred',
                  'error'
                );
              },
            });
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithBootstrapButtons.fire('Cancelled', '', 'error');
        }
      });
  }
  link(u: any) {
    if (u.es_amigo == 1 || u.id_estadou == 0) {
      this.router.navigate(['/user', u.username]);
    } else {
      this.alert.showAlert(
        'error',
        'The profile is private ',
        'You need to follow him'
      );
    }
  }
  reload() {
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  }
}
