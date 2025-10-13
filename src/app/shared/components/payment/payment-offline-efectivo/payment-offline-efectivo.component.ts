import { Component, Input, OnInit } from '@angular/core';
import { ApiService } from '@shared/services/api.service';
import { ModalService } from '@shared/utilities/modal-services';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-payment-offline-efectivo',
  templateUrl: './payment-offline-efectivo.component.html',
  styleUrls: ['./payment-offline-efectivo.component.scss']
})
export class PaymentOfflineEfectivoComponent implements OnInit {

  @Input() packId: string;
  @Input() codeUser: string;

  private readonly MAX_SIZE_MB = 5;
  fileSelected: any = null;

  loading: boolean = false;

  constructor(
    private apiService: ApiService,
    private messageService: NzMessageService,
    private modalRef: NzModalRef,
    private modalService: ModalService,
  ) { }

  ngOnInit(): void {
  }


  handleUpload = (item: any) => {
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

  onSend(): void{
    if( this.fileSelected == null ){
      this.messageService.info(`Debe subir un comprobante.`);
      return;
    }

    this.loading = true;
    const formData = new FormData();
    formData.append("packId" , this.packId );
    formData.append("sponsorId" , this.codeUser.trim());
    formData.append("file" , this.fileSelected);

    this.apiService.postPaymentCreateOffline(formData).subscribe(
      (response) => {
        this.loading = false;
        this.modalRef.close();
        this.modalService.success("Pago recibido. Su plan se activará cuando el administrador de Chayim confirme la compra.");
      },
      (error) => {
        this.loading = false;
        this.modalService.error( error?.message ?? "Error");
        this.modalRef.close();
      }
    )
  }

}
