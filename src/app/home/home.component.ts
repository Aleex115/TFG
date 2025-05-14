import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { PublicacionesService } from '../publicaciones.service';
import { AlertService } from '../alert.service';
import { GalleryComponent } from '../gallery/gallery.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  imports: [GalleryComponent, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  @ViewChild('scrollAnchor') scrollAnchor!: ElementRef;

  constructor(private pS: PublicacionesService, private alert: AlertService) {}

  publicaciones: any[] = [];

  total = 0;
  filterPublicaciones = '';

  offset = 0;

  loading = false;

  ngOnInit() {
    this.getPublicaciones();

    //Por si las imágenes no tienen el suficiente tamaño para generar el scroll
    setTimeout(() => {
      if (window.innerHeight <= document.body.offsetHeight) {
        this.getPublicaciones();
      }
    }, 300);
  }

  getPublicaciones() {
    if (this.offset <= this.total && !this.loading) {
      this.loading = true;

      this.pS.getAllPublic(this.offset, this.filterPublicaciones).subscribe({
        next: (res: any) => {
          console.log(res);
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
  filter() {
    console.log(this.filterPublicaciones);
    this.publicaciones = [];
    this.offset = 0;
    console.log(this.publicaciones);
    this.getPublicaciones();
    setTimeout(() => {
      if (window.innerHeight <= document.body.offsetHeight) {
        this.getPublicaciones();
      }
    }, 300);
  }

  // Es como el DOMContentLoad
  ngAfterViewInit() {
    //El observer se ejecuta cada vez que hay un cambio en isIntersecting que es un boolean de si el elemento se ve o no
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
}
