import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { UsuarioService } from '../usuario.service';
import { PublicacionesService } from '../publicaciones.service';
import Swal from 'sweetalert2';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AlertService } from '../alert.service';
import { CustomValidator } from '../CustomValidator';
import { Router, RouterLink } from '@angular/router';
import { GalleryComponent } from '../gallery/gallery.component';
import { PetitionService } from '../petition.service';
import { FollowService } from '../follow.service';

@Component({
  selector: 'app-user',
  imports: [FormsModule, ReactiveFormsModule, GalleryComponent, RouterLink],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css'],
})
export class UserComponent implements AfterViewInit {
  @ViewChild('scrollAnchor') scrollAnchor!: ElementRef;
  @ViewChild('editProfileDialog') editProfileDialog!: ElementRef;
  @ViewChild('editPwdDialog') editPwdDialog!: ElementRef;
  @ViewChild('showPetitions') showPetitions!: ElementRef;
  @ViewChild('showFriends') showFriend!: ElementRef;

  user: any;
  usernameFilter = '';
  publicaciones: any[] = [];
  fotoUrl = '';
  petitions: any;
  petitionsFiltered: any;
  amigos: any;
  amigosFiltered: any;

  previewUrl: any;
  total = 0;
  offset = 0;
  loading = false;

  editProfileForm: any;

  editPwdForm = new FormGroup({
    newPwd: new FormControl('', [Validators.required, Validators.minLength(3)]),
    oldPwd: new FormControl('', [Validators.required, Validators.minLength(3)]),
  });

  constructor(
    private uS: UsuarioService,
    private pS: PublicacionesService,
    private ptS: PetitionService,
    private fS: FollowService,
    private alert: AlertService,
    private router: Router
  ) {}

  ngOnInit() {
    this.uS.getOne().subscribe((res: any) => {
      this.user = res.user;
      console.log(this.user);
      this.fotoUrl = res.user.foto_perfil || 'user.png';
      this.previewUrl = this.fotoUrl;

      this.editProfileForm = new FormGroup({
        username: new FormControl(this.user.username, [
          Validators.required,
          Validators.minLength(3),
        ]),
        descp: new FormControl(this.user.descp, [
          Validators.required,
          Validators.minLength(3),
        ]),
        email: new FormControl(this.user.email, [
          Validators.required,
          CustomValidator.email,
        ]),
        visibility: new FormControl(`${this.user.id_estadou}`),
      });

      if (this.user.id_estadou) {
        this.ptS.getAll().subscribe({
          next: (res: any) => {
            console.log(res);
            this.petitions = res.total;
            this.petitionsFiltered = this.petitions;
          },
          error: (err) => {
            this.alert.showAlert(
              'error',
              err.error.title,
              err.error.message || 'An unexpected error occurred'
            );
            this.loading = false;
          },
        });
      }

      this.fS.getAll().subscribe({
        next: (res: any) => {
          this.amigos = res.result;
          this.amigosFiltered = res.result;
        },
        error: (err) => {
          this.alert.showAlert(
            'error',
            err.error.title,
            err.error.message || 'An unexpected error occurred'
          );
          this.loading = false;
        },
      });
    });
    this.getPublicaciones();

    setTimeout(() => {
      if (window.innerHeight <= document.body.offsetHeight) {
        this.getPublicaciones();
      }
    }, 300);
  }

  getPublicaciones() {
    if (this.offset <= this.total && !this.loading) {
      this.loading = true;
      this.pS.getAllUser(this.offset).subscribe({
        next: (res: any) => {
          if (res && res.publicaciones) {
            this.publicaciones.push(...res.publicaciones);
            this.total = res.total;
          }
          this.loading = false;
        },
        error: (err) => {
          this.alert.showAlert(
            'error',
            err.error.title,
            err.error.message || 'An unexpected error occurred'
          );
          this.loading = false;
        },
      });
      this.offset += 9;
    }
  }

  ngAfterViewInit() {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !this.loading) {
          this.getPublicaciones();
        }
      },
      { threshold: 0.1, rootMargin: '300px' }
    );
    observer.observe(this.scrollAnchor.nativeElement);
  }

  logout() {
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
        confirmButtonText: 'Yes, log out!',
        cancelButtonText: 'No, cancel!',
        reverseButtons: true,
      })
      .then((result) => {
        if (result.isConfirmed) {
          this.uS.logout().subscribe({
            next: () => {
              window.location.reload();
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
      });
  }

  editProfile() {
    const dialog = this.editProfileDialog.nativeElement as HTMLDialogElement;
    dialog.showModal();
    setTimeout(() => dialog.setAttribute('open', ''), 0); // For animation
  }

  editPwd() {
    const dialog = this.editPwdDialog.nativeElement as HTMLDialogElement;
    dialog.showModal();
    setTimeout(() => dialog.setAttribute('open', ''), 0); // For animation
  }

  close() {
    this.editProfileDialog.nativeElement.close();
    this.editPwdDialog.nativeElement.close();
    if (this.user.id_estadou === 1) {
      this.showPetitions.nativeElement.close();
    }
    this.showFriend.nativeElement.close();
    this.usernameFilter = '';
  }

  closeOnOutsideClick(event: MouseEvent) {
    let dialogos = [
      this.editProfileDialog,
      this.editPwdDialog,
      this.showFriend,
    ];
    if (this.user.id_estadou === 1) {
      dialogos.push(this.showPetitions);
    }
    dialogos.forEach((el) => {
      const dialogElement = el.nativeElement as HTMLDialogElement;
      if (event.target === dialogElement) {
        dialogElement.close();
      }
    });
    this.usernameFilter = '';
  }

  onFileSelected(event: Event) {
    let input = event.target as HTMLInputElement;

    if (input.files && input.files[0]) {
      let file = input.files[0];
      // Crea una nueva instancia de FileReader para leer el archivo
      let reader = new FileReader();

      // Inicia la lectura del archivo como una URL de datos (base64)
      reader.readAsDataURL(file);

      // Define una función que se ejecutará cuando la lectura del archivo se complete
      reader.onload = () => {
        // Asigna el resultado de la lectura (en formato base64) a la variable previewUrl
        this.previewUrl = reader.result;
      };
    }
  }
  submitProfile(event: Event) {
    event.preventDefault();
    this.close();

    Swal.fire({
      title: 'Updating...',
      text: 'Please wait while your profile is being updating.',
      allowOutsideClick: false,
      theme: 'dark',
      backdrop: '#000c',
      // como un domcontentload pero de s2a
      didOpen: () => {
        Swal.showLoading();
      },
    });

    const form = event.target as HTMLFormElement;
    const fd = new FormData();
    fd.append('username', this.editProfileForm.get('username')?.value || '');
    fd.append('descp', this.editProfileForm.get('descp')?.value || '');
    fd.append('email', this.editProfileForm.get('email')?.value || '');
    fd.append('id_estadou', this.editProfileForm.get('visibility')?.value || 0);

    // Agrega el archivo al FormData
    const fileInput = form.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    if (fileInput.files && fileInput.files[0]) {
      fd.append('img', fileInput.files[0]);
      fileInput.value = ''; // Vacía el valor del file input
    }

    this.uS.updateProfile(fd).subscribe({
      next: (res) => {
        Swal.close();
        this.fotoUrl = this.previewUrl;
        this.user.username = this.editProfileForm.get('username')?.value;
        this.user.descp = this.editProfileForm.get('descp')?.value;
        this.user.id_estadou = this.editProfileForm.get('id_estadou')?.value;

        this.alert.showAlert(
          'success',
          'Update Successful',
          'The update has been done successfully'
        );
      },
      error: (err) => {
        Swal.close();
        console.log(err);
        this.alert.showAlert(
          'error',
          err.error.title,
          err.error.message || 'An unexpected error occurred'
        );
        if (err.status === 401) {
          this.router.navigate(['/login']);
        }
      },
    });
  }

  submitPwd(event: Event) {
    event.preventDefault();
    const newPwd = this.editPwdForm.value.newPwd;
    const oldPwd = this.editPwdForm.value.oldPwd;

    this.uS.updatePwd(newPwd!, oldPwd!).subscribe({
      next: () => {
        this.alert.showAlert(
          'success',
          'Update Successful',
          'The update has been done successfully'
        );
      },
      error: (err) => {
        this.alert.showAlert(
          'error',
          err.error.title,
          err.error.message || 'An unexpected error occurred'
        );
      },
    });
  }

  link(u: any) {
    this.close();
    if (u.es_amigo === 1 || u.id_estadou === 0) {
      this.router.navigate(['/user', u.username]);
    } else {
      this.alert.showAlert(
        'error',
        'The profile is private ',
        'You need to follow him'
      );
    }
  }
  allow(u: any) {
    this.close();

    this.ptS.accept(u.dni).subscribe({
      next: (res: any) => {
        this.reload();

        this.alert.showAlert('success', 'OK', 'Followed successfully');
      },
      error: (err) => {
        this.alert.showAlert(
          'error',
          err.error.title,
          err.error.message || 'An unexpected error occurred'
        );
      },
    });
  }

  showPet() {
    this.showPetitions.nativeElement.showModal();
  }
  reject(u: any) {
    this.close();
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
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, cancel!',
        reverseButtons: true,
      })
      .then((result) => {
        if (result.isConfirmed) {
          this.ptS.cancelRequest(u.dni).subscribe({
            next: (res: any) => {
              if (res.status === 200) {
                swalWithBootstrapButtons.fire(
                  'Canceled!',
                  'You canceled the request',
                  'success'
                );
              }
              this.reload();
            },
            error: (err) => {
              swalWithBootstrapButtons.fire(
                err.error.title,
                err.error.message || 'An unexpected error occurred',
                'error'
              );
            },
          });
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithBootstrapButtons.fire('Cancelled', '', 'error');
        }
      });
  }
  filter() {
    this.petitionsFiltered = this.petitions.filter((el: any) =>
      el.username.includes(this.usernameFilter)
    );
    this.amigosFiltered = this.amigos.filter((el: any) =>
      el.username.includes(this.usernameFilter)
    );
  }
  reload() {
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  }

  showFriends() {
    this.showFriend.nativeElement.showModal();
  }
  unfollow(u: any) {
    this.close();

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
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithBootstrapButtons.fire('Cancelled', '', 'error');
        }
      });
  }

  deleteUser() {
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
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, cancel!',
        reverseButtons: true,
      })
      .then((result) => {
        if (result.isConfirmed) {
          this.uS.delete().subscribe({
            next: (res: any) => {
              if (res.status === 200) {
                window.location.href = '/';

                swalWithBootstrapButtons.fire(
                  'Deleted!',
                  'You deleted your profile',
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
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithBootstrapButtons.fire('Cancelled', '', 'error');
        }
      });
  }
}
