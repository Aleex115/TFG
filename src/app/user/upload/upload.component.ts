import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { PublicacionesService } from '../../publicaciones.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { AlertService } from '../../alert.service';

@Component({
  selector: 'app-upload',
  imports: [ReactiveFormsModule],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.css',
})
export class UploadComponent {
  constructor(
    private pS: PublicacionesService,
    private router: Router,
    private alert: AlertService
  ) {}
  form = new FormGroup({
    title: new FormControl('', Validators.required),
    descp: new FormControl('', Validators.required),
  });
  previewUrl: string | ArrayBuffer | null = null;
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

  submit(event: Event) {
    event.preventDefault(); // Previene el comportamiento predeterminado del formulario

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
    fd.append('title', this.form.get('title')?.value || '');
    fd.append('descp', this.form.get('descp')?.value || '');

    // Agrega el archivo al FormData
    const fileInput = form.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    if (fileInput.files && fileInput.files[0]) {
      fd.append('img', fileInput.files[0]);
      fileInput.value = ''; // Vacía el valor del file input
    }

    this.form.setValue({
      title: '',
      descp: '',
    });

    // Envía la solicitud al backend
    this.pS.upload(fd).subscribe({
      next: (res) => {
        Swal.close();
        this.alert.showAlert(
          'success',
          'Upload Successful',
          'The image has been published successfully'
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
}
