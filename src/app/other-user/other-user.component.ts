import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { UsuarioService } from '../usuario.service';
import { PublicacionesService } from '../publicaciones.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AlertService } from '../alert.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { GalleryComponent } from '../gallery/gallery.component';
import { FollowService } from '../follow.service';
import { PetitionService } from '../petition.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-other-user',
  imports: [FormsModule, ReactiveFormsModule, GalleryComponent],
  templateUrl: './other-user.component.html',
  styleUrl: './other-user.component.css',
})
export class OtherUserComponent implements AfterViewInit {
  //Es como el document.getElementById pero con algunas mejoras y elementRef es una clase de angular
  @ViewChild('scrollAnchor') scrollAnchor!: ElementRef;

  constructor(
    private uS: UsuarioService,
    private pS: PublicacionesService,
    private ar: ActivatedRoute,
    private fS: FollowService,
    private ptS: PetitionService,
    private alert: AlertService,
    private router: Router
  ) {
    ar.paramMap.subscribe(
      (el: ParamMap) => (this.username = el.get('username'))
    );
  }

  user: any;
  username: any;

  fotoUrl = '';

  previewUrl: any;

  publicaciones: any[] = [];

  total = 0;

  offset = 0;

  loading = false;

  ngOnInit() {
    this.uS.getOne(this.username).subscribe({
      next: (res: any) => {
        this.user = res.user;
        console.log(this.user);
        this.fotoUrl = res.user.foto_perfil || 'user.png';
        if (this.user.es_amigo == 1 || this.user.id_estadou == 0) {
          console.log('prueba');
          this.getPublicaciones();
          //Por si las imágenes no tienen el suficiente tamaño para generar el scroll
          setTimeout(() => {
            if (window.innerHeight <= document.body.offsetHeight) {
              this.getPublicaciones();
            }
          }, 300);
        }
      },
      error: (err) => {
        this.alert.showAlert(
          'error',
          err.error.title,
          'That user does not exists'
        );
        this.router.navigate(['/search']);
      },
    });
    console.log(this.user);
  }

  getPublicaciones() {
    console.log(this.offset);
    if (this.offset <= this.total && !this.loading) {
      this.loading = true;

      this.pS.getAllUser(this.offset, this.username).subscribe({
        next: (res: any) => {
          if (res && res.publicaciones) {
            this.publicaciones.push(...res.publicaciones);
            this.total = res.total;
          }
          this.loading = false;
        },
        error: (err) => {
          console.log(err);
          this.alert.showAlert(
            'error',
            err.error.title,
            err.error.message || 'An unexpected error occurred'
          );
          this.loading = false;
        },
      });
      this.offset += 9;
      this.loading = false;
    }
  }

  // Es como el DOMContentLoad
  ngAfterViewInit() {
    //El observer se ejecuta cada vez que hay un cambio en isIntersecting que es un boolean de si el elemento se ve o no
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !this.loading) {
          if (this.user) {
            if (this.user.es_amigo == 1 || this.user.id_estadou == 0) {
              this.getPublicaciones();
            }
          }
        }
      },
      { threshold: 0.1, rootMargin: '300px' }
    );
    observer.observe(this.scrollAnchor.nativeElement);
  }

  follow(u: any) {
    if (u.es_amigo === 1) {
      return;
    }
    if (u.id_estadou === 0) {
      console.log('Perfil publico');
      this.fS.follow(u.dni).subscribe({
        next: (res: any) => {
          console.log(res);
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
    if (u.id_estadou === 1) {
      console.log('Perfil publico');
      this.ptS.request(u.dni).subscribe({
        next: (res: any) => {
          setTimeout(() => {
            window.location.reload();
          }, 1000);
          console.log(res);
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
      .then((result: any) => {
        if (result.isConfirmed) {
          setTimeout(() => {
            window.location.reload();
          }, 1000);
          if (u.peticion == 1) {
            this.ptS.cancelRequest(u.dni).subscribe({
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
}
