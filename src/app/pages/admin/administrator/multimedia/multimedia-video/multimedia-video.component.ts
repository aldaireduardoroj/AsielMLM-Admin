import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from '@env/environment';
import { ImageCropperUploadComponent } from '@shared/components/image-cropper-upload/image-cropper-upload.component';
import { CONSTANTS } from '@shared/constants/constants';
import { ApiService } from '@shared/services/api.service';
import { FormValidator } from '@shared/utilities/form-validator';
import { ModalService } from '@shared/utilities/modal-services';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-multimedia-video',
  templateUrl: './multimedia-video.component.html',
  styleUrls: ['./multimedia-video.component.scss']
})
export class MultimediaVideoComponent implements OnInit {

  @Input() storyShow: boolean = true;

  validateForm: FormGroup;
  private readonly MAX_SIZE_MB = 30;

  loading: boolean = false;
  constructor(
    private modalService: ModalService,
    private nzModalService: NzModalService,
    private fb: FormBuilder,
    private apiService: ApiService,
    private messageService: NzMessageService,
    private formValidator: FormValidator
  ) {
    this.validateForm = this.fb.group({
      name: [null ],
      description: [null ],
      link: [null]
    });
  }

  fileSelected: any = null;
  filePreviewSelected: any = null;
  previewUrl: string = CONSTANTS.IMAGE.FALLBACK;

  optionsPreview:  any = {
    showPreviewIcon: false,
  }

  ngOnInit(): void {
    if( this.storyShow ){
      this.validateForm.get('name').setValidators([Validators.required]);
    }else{
      // this.validateForm.get('link').setValidators([Validators.required]);
    }
  }

  fileChangeEvent(event: any): void {
  
    const file: File = event.target.files[0];
    this.filePreviewSelected = null;
    if (!file) {
      return;
    }
    // Convertimos el límite de MB a Bytes (1 MB = 1024 * 1024 Bytes)
    const maxSizeInBytes = this.MAX_SIZE_MB * 1024 * 1024;

    // Reiniciamos mensajes anteriores
    this.previewUrl = null;

    // Verificamos el tamaño del archivo
    if (file.size > maxSizeInBytes) {
      this.messageService.error(`El archivo es demasiado grande. El tamaño máximo permitido es de ${this.MAX_SIZE_MB} MB.`);
      event.target.value = ''; 
      return;
    }

    // ====================================================================================

    let modal = this.nzModalService.create({
      nzContent: ImageCropperUploadComponent,
      nzTitle: 'Imagen para cortar',
      nzMaskClosable: false,
      nzComponentParams: {
        file: event,
        square: this.storyShow
      },
      nzFooter: null
    });

    modal.afterClose.subscribe( ( result ) => {
      if( result.file != null ){
        const reader = new FileReader();
        // 2. Definir qué hacer cuando el archivo se haya leído
        reader.onload = () => {
          // El resultado de la lectura (la cadena Base64) estará en reader.result
          this.previewUrl = reader.result as string;
        };
        // 3. Iniciar la lectura del archivo. Esto convierte la imagen a Base64
        reader.readAsDataURL(result.file);
        if( this.storyShow )
          this.filePreviewSelected = result.file;
        else
          this.fileSelected = result.file;
      }
    });

    // 1. Crear una instancia de FileReader
    
    // this.previewUrl = URL.createObjectURL(file);

  }

  handleUploadVideo = (item: any) => {
    console.log(item.file)
    const file: File = item.file;
    this.fileSelected = null;
    if (!file) {
      return;
    }
    // Convertimos el límite de MB a Bytes (1 MB = 1024 * 1024 Bytes)
    const maxSizeInBytes = this.MAX_SIZE_MB * 1024 * 1024;

    // Verificamos el tamaño del archivo
    if (file.size > maxSizeInBytes) {
      this.messageService.error(`El archivo es demasiado grande. El tamaño máximo permitido es de ${this.MAX_SIZE_MB} MB.`);
      return;
    }
    this.fileSelected = file;

  }

  onClose(): void{
    this.nzModalService.closeAll();
  }

  onPublishVideo(): void{
    if( this.formValidator.validForm(this.validateForm) ){
      if( this.fileSelected == null ){
        this.messageService.error( this.storyShow ?`Debe Seleccionar un video.` : "Debe seleccionar una imagen");
        return;
      }
      const formData = new FormData();
      this.loading = true;
      formData.append("file", this.fileSelected);
      formData.append("preview", this.filePreviewSelected);
      formData.append("name", this.validateForm.get('name')?.value ?? "");
      formData.append("description", this.validateForm.get('description')?.value ?? "");
      formData.append("link", this.validateForm.get('link')?.value ?? "");
      formData.append("story", this.storyShow ? '1' : '0');

      this.apiService.postUserPublishVideoStory(formData).subscribe(
        (response) => {
          this.loading = false;
          if(response.success){
            this.previewUrl = environment.hostUrl + '/storage/' + response.data;
            this.onClose();
            this.messageService.success("Se subio tu historia correctamente");
          }

        },(error) => {
          this.loading = false;
        }
      )
    }
  }

}
