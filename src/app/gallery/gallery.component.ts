import { Component, Input, ElementRef, ViewChild } from '@angular/core';
import { PublicacionesService } from '../publicaciones.service';
import { LikeService } from '../like.service';
import { ComentarioService } from '../comentario.service';
import { AlertService } from '../alert.service';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-gallery',
  imports: [FormsModule],
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css'],
})
export class GalleryComponent {
  @Input() publicaciones: any[] = [];
  @Input() session = false;
  @ViewChild('download') download!: ElementRef;
  @ViewChild('dropdown-menu') dropdownMenu!: ElementRef;

  comentario = '';
  likes: number = 0;
  publication: any;
  comments: any;
  dropdownOpen = false;
  formato = 'JPG';
  calidad = 80;

  constructor(
    private pS: PublicacionesService,
    private lS: LikeService,
    private cS: ComentarioService,
    private alert: AlertService,
    private router: Router
  ) {}

  like(id: string, e: Event) {
    let checkbox = e.target as HTMLInputElement;
    if (checkbox.checked) {
      this.lS.giveLike(id).subscribe({
        next: (res: any) => {
          console.log(res);
          let p = this.publicaciones.find((el) => el.id === id);
          p.hasLiked = 1;
          console.log(this.publicaciones.find((el) => el.id === id));

          this.likes++;
        },
        error: (err) => {
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
    } else {
      this.lS.deleteLike(id).subscribe({
        next: (res: any) => {
          let p = this.publicaciones.find((el) => el.id === id);

          p.hasLiked = 0;
          console.log(this.publicaciones.find((el) => el.id === id));

          console.log(res);
          this.likes--;
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

  comment(id: string) {
    if (!this.comentario) {
      this.alert.showAlert('error', 'Error', "You can't send an empty comment");
    } else {
      this.download.nativeElement.close();

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
          if (err.status === 401) {
            this.router.navigate(['/login']);
          }
        },
      });
    }
  }

  savePublication(publi: any) {
    console.log(publi);
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

  clear() {
    this.comentario = '';
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

  downloadImage() {
    this.download.nativeElement.close();

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

  triggerAnimation(event: Event, id: number) {
    const checkbox = event.target as HTMLInputElement;
    const animationElement = document.getElementById(`heart-animation-${id}`);
    if (animationElement) {
      animationElement.classList.remove('heart-animation', 'like', 'unlike');
      void animationElement.offsetWidth; // Forzar reflujo para reiniciar la animación
      animationElement.classList.add(
        'heart-animation',
        checkbox.checked ? 'like' : 'unlike'
      );
    }
  }
}
