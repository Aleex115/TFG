import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { UsuarioService } from '../usuario.service';
import { PublicacionesService } from '../publicaciones.service';
import { LikeService } from '../like.service';
import Swal from 'sweetalert2';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AlertService } from '../alert.service';
import { ComentarioService } from '../comentario.service';
import { CustomValidator } from '../CustomValidator';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css', './download.css'],
})
export class UserComponent implements AfterViewInit {
  //Es como el document.getElementById pero con algunas mejoras y elementRef es una clase de angular
  @ViewChild('scrollAnchor') scrollAnchor!: ElementRef;
  @ViewChild('editProfileDialog') editProfileDialog!: ElementRef;
  @ViewChild('editPwdDialog') editPwdDialog!: ElementRef;
  @ViewChild('download') download!: ElementRef;
  @ViewChild('dropdown-menu') dropdownMenu!: ElementRef;

  constructor(
    private uS: UsuarioService,
    private pS: PublicacionesService,
    private lS: LikeService,
    private cS: ComentarioService,
    private alert: AlertService,
    private router: Router
  ) {}

  user: any;

  publication: any;
  comments: any;
  likes: any;
  formato = 'JPG';
  calidad = 80;

  fotoUrl = '';

  previewUrl: any;

  publicaciones: any[] = [];

  total = 0;

  offset = 0;

  loading = false;

  comentario = '';

  editProfileForm: any;

  editPwdForm = new FormGroup({
    newPwd: new FormControl('', [Validators.required, Validators.minLength(3)]),
    oldPwd: new FormControl('', [Validators.required, Validators.minLength(3)]),
  });

  dropdownOpen = false;

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
          // Aquí puedes llamar al servicio para eliminar el elemento
          this.uS.logout().subscribe({
            next: (res: any) => {
              window.location.reload();
              console.log(res);
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
          swalWithBootstrapButtons.fire(
            'Cancelled',
            "You don't log out",
            'error'
          );
        }
      });
  }
  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  closeDropdown(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const dropdownMenu = document.querySelector('.dropdown-menu');
    if (dropdownMenu && !dropdownMenu.contains(target)) {
      this.dropdownOpen = false;
    }
  }

  ngOnInit() {
    this.uS.getOne().subscribe((res: any) => {
      this.user = res.user;
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
        visibility: new FormControl(`${this.user.id_estadoU}`),
      });
    });
    this.getPublicaciones();

    //Por si las imágenes no tienen el suficiente tamaño para generar el scroll
    setTimeout(() => {
      console.log('Body height:', document.body.offsetHeight);
      console.log('Window height:', window.innerHeight);
      if (window.innerHeight <= document.body.offsetHeight) {
        this.getPublicaciones();
      }
    }, 300);
  }

  getPublicaciones() {
    console.log(this.offset);
    if (this.offset <= this.total && !this.loading) {
      this.loading = true;
      console.log('piediendo');
      this.pS.getAll(this.offset).subscribe({
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
        console.log('prueba');
        if (entries[0].isIntersecting && !this.loading) {
          this.getPublicaciones();
        }
      },
      { threshold: 0.1, rootMargin: '300px' }
    );
    observer.observe(this.scrollAnchor.nativeElement);
    document.addEventListener('click', (event) => this.closeDropdown(event));
  }

  like(id: string, e: Event) {
    let checkbox = e.target as HTMLInputElement;
    console.log(e.target);
    if (checkbox.checked) {
      this.publication.hasLiked = 1;
      this.likes++;
      console.log('like');
      this.lS.giveLike(id).subscribe({
        next: (res: any) => {
          console.log(res);
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
    } else {
      this.publication.hasLiked = 0;
      this.likes--;

      this.lS.deleteLike(id).subscribe({
        next: (res: any) => {
          console.log(res);
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
    }
  }
  delete(id: string, public_id: string) {
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
          // Aquí puedes llamar al servicio para eliminar el elemento
          this.pS.deletePubli(id, public_id).subscribe({
            next: (res: any) => {
              console.log(res);
              if (res.status === 200) {
                this.publicaciones = this.publicaciones.filter(
                  (el) => el.id !== id
                );
                swalWithBootstrapButtons.fire(
                  'Deleted!',
                  'Your file has been deleted.',
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
          swalWithBootstrapButtons.fire(
            'Cancelled',
            'Your photo is safe',
            'error'
          );
        }
      });
  }
  clear() {
    this.comentario = '';
  }
  comment(id: string) {
    this.close();
    if (!this.comentario) {
      this.alert.showAlert('error', 'Error', "You can't send an empty comment");
    } else {
      this.cS.writeComment(id, this.comentario).subscribe({
        next: (res: any) => {
          console.log(res);
          this.alert.showAlert('success', 'OK', 'Comment posted successfully');
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

  closeOnOutsideClick(event: MouseEvent) {
    let dialogos = [this.editProfileDialog, this.editPwdDialog, this.download];
    dialogos.forEach((el) => {
      const dialogElement = el.nativeElement as HTMLDialogElement;
      if (event.target === dialogElement) {
        dialogElement.close();
      }
    });
  }

  editProfile() {
    this.editProfileDialog.nativeElement.showModal();
  }
  editPwd() {
    this.editPwdDialog.nativeElement.showModal();
  }

  close() {
    this.editProfileDialog.nativeElement.close();
    this.editPwdDialog.nativeElement.close();
    this.download.nativeElement.close();
  }

  onFileSelected(event: Event): void {
    let input = event.target as HTMLInputElement;

    if (input.files && input.files[0]) {
      let file = input.files[0];
      let reader = new FileReader();

      reader.onload = () => {
        this.previewUrl = reader.result;
      };

      reader.readAsDataURL(file);
    }
  }

  submitProfile(event: Event) {
    event.preventDefault();
    this.close();
    Swal.fire({
      title: 'Uploading...',
      text: 'Please wait while your file is being uploaded.',
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

    // Agrega los campos del formulario al FormData
    fd.append('username', this.editProfileForm.get('username')?.value || '');
    fd.append('descp', this.editProfileForm.get('descp')?.value || '');
    fd.append('email', this.editProfileForm.get('email')?.value || '');
    fd.append('id_estadoU', this.editProfileForm.get('visibility')?.value || 0);

    // Agrega el archivo al FormData
    const fileInput = form.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    if (fileInput.files && fileInput.files[0]) {
      fd.append('img', fileInput.files[0]);
      fileInput.value = ''; // Vacía el valor del file input
    }

    // Envía la solicitud al backend
    this.uS.updateProfile(fd).subscribe({
      next: (res) => {
        Swal.close();
        this.fotoUrl = this.previewUrl;
        this.user.username = this.editProfileForm.get('username')?.value;
        this.user.descp = this.editProfileForm.get('descp')?.value;
        this.user.id_estadoU = this.editProfileForm.get('id_estadoU')?.value;

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
    console.log('terminado');
  }

  submitPwd(event: Event) {
    event.preventDefault();
    this.close();
    let newPwd = this.editPwdForm.value.newPwd;
    let oldPwd = this.editPwdForm.value.oldPwd;

    this.uS.updatePwd(newPwd!, oldPwd!).subscribe({
      next: (res) => {
        Swal.close();

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
  savePublication(publi: any) {
    this.publication = publi;
    this.cS.getAllComment(publi.id).subscribe({
      next: (res: any) => {
        console.log(res);
        this.comments = res.comments;
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
    this.lS.getAll(publi.id).subscribe({
      next: (res: any) => {
        console.log(res);
        this.likes = res.total;
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
    this.download.nativeElement.showModal();
  }

  downloadImage() {
    this.close();

    Swal.fire({
      title: 'Downloading...',
      text: 'Please wait while your file is being downloaded.',
      allowOutsideClick: false,
      theme: 'dark',
      backdrop: '#000c',
      // como un domcontentload pero de s2a
      didOpen: () => {
        Swal.showLoading();
      },
    });
    try {
      this.pS
        .download(this.publication.foto, this.formato, this.calidad)
        .subscribe({
          next: (res: any) => {
            console.log(res);
            Swal.close();
            const a = document.createElement('a');
            a.href = URL.createObjectURL(res);
            a.download = `${
              this.publication.title
            }.${this.formato.toLowerCase()}`;
            a.click();

            URL.revokeObjectURL(a.href);
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
    } catch (error) {
      console.error('Error al descargar la imagen:', error);
    }
  }
}
