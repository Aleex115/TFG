import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { UsuarioService } from '../usuario.service';
import { PublicacionesService } from '../publicaciones.service';
import { AlertService } from '../alert.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { GalleryComponent } from '../gallery/gallery.component';

@Component({
  selector: 'app-home',
  imports: [GalleryComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  @ViewChild('scrollAnchor') scrollAnchor!: ElementRef;

  constructor(
    private uS: UsuarioService,
    private pS: PublicacionesService,
    private ar: ActivatedRoute,
    private alert: AlertService
  ) {
    ar.paramMap.subscribe(
      (el: ParamMap) => (this.username = el.get('username'))
    );
  }

  user: any;
  username: any;
  publication: any;
  formato = 'JPG';
  calidad = 80;

  fotoUrl = '';

  previewUrl: any;

  publicaciones: any[] = [];

  total = 0;

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
    console.log(this.offset);
    if (this.offset <= this.total && !this.loading) {
      this.loading = true;

      this.pS.getAllPublic(this.offset).subscribe({
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
          this.getPublicaciones();
        }
      },
      { threshold: 0.1, rootMargin: '300px' }
    );
    observer.observe(this.scrollAnchor.nativeElement);
  }
}
