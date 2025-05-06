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
import { ActivatedRoute, ParamMap, Router } from '@angular/router';

@Component({
  selector: 'app-other-user',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './other-user.component.html',
  styleUrl: './other-user.component.css',
})
export class OtherUserComponent implements AfterViewInit {
  //Es como el document.getElementById pero con algunas mejoras y elementRef es una clase de angular
  @ViewChild('scrollAnchor') scrollAnchor!: ElementRef;
  @ViewChild('download') download!: ElementRef;
  @ViewChild('dropdown-menu') dropdownMenu!: ElementRef;

  constructor(
    private uS: UsuarioService,
    private pS: PublicacionesService,
    private lS: LikeService,
    private cS: ComentarioService,
    private alert: AlertService,
    private router: Router,
    private ar: ActivatedRoute
  ) {
    ar.paramMap.subscribe(
      (el: ParamMap) => (this.username = el.get('username'))
    );
  }

  user: any;
  username: any;
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

  dropdownOpen = false;

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
    this.uS.getOne(this.username).subscribe((res: any) => {
      this.user = res.user;
      this.fotoUrl = res.user.foto_perfil || 'user.png';
      this.previewUrl = this.fotoUrl;
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
      this.pS.getAll(this.offset, this.username).subscribe({
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
    let dialogos = [this.download];
    dialogos.forEach((el) => {
      const dialogElement = el.nativeElement as HTMLDialogElement;
      if (event.target === dialogElement) {
        dialogElement.close();
      }
    });
  }

  close() {
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
