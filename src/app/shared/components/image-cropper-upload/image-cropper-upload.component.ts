import { Component, Input, OnInit } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { ImageCroppedEvent, LoadedImage } from 'ngx-image-cropper';

@Component({
  selector: 'app-image-cropper-upload',
  templateUrl: './image-cropper-upload.component.html',
  styleUrls: ['./image-cropper-upload.component.scss']
})
export class ImageCropperUploadComponent implements OnInit {

  @Input() file: any = '';

  imageChangedEvent: any = '';
  croppedImage: any = '';
  imageCroppedBlob: any = null;

  constructor(
    private modalRef: NzModalRef,
  ) { }

  ngOnInit(): void {
    this.imageChangedEvent = this.file;
  }


  fileChangeEvent(event: any): void {

    this.imageChangedEvent = event;
  }

  imageCropped(event: ImageCroppedEvent) {

    this.imageCroppedBlob = event.blob;

  }

  imageLoaded(image: LoadedImage) {
      // show cropper
  }
  cropperReady() {
      // cropper ready
      console.log("success")
  }

  loadImageFailed() {
      // show message
      console.log("failed")
  }

  public handleCancel(): void{
    this.modalRef.close({file: null});
  }

  public handleOk(): void{
    this.modalRef.close({file: this.imageCroppedBlob});
  }

}
