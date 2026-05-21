import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  Renderer2,
} from '@angular/core';
import { ApiService } from '@shared/services/api.service';
import { PackModel } from '@shared/services/models/packs.interface';
import { ModalService } from '@shared/utilities/modal-services';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

import KRGlue from '@lyracom/embedded-form-glue';
import { ScriptService } from '@shared/services/script.service';
import { CONSTANTS } from '@shared/constants/constants';
import { Router } from '@angular/router';
import { environment } from '@env/environment';
import { UserModel } from '@shared/services/models/user.interface';
import { forkJoin } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';
import { PaymentOfflineEfectivoComponent } from '../payment-offline-efectivo/payment-offline-efectivo.component';
import { IProductModel } from '@shared/services/models/product.interface';
import { parse } from 'date-fns';

@Component({
  selector: 'app-payment-reservation-modal',
  templateUrl: './payment-reservation-modal.component.html',
  styleUrls: ['./payment-reservation-modal.component.scss'],
})
export class PaymentReservationModalComponent implements OnInit {
  @Input() planSelected!: PackModel;
  @Input() userModel!: UserModel;

  codeUser: string = '';
  codeUserStatus: string = '';

  isLoadingFlow: boolean = false;
  isLoadingIzipay: boolean = false;
  paymentSection: number = 5;

  linkPayment: string = '#';

  isSpinning: boolean = true;

  comitionTotal: number = 0;
  //totalPayment: number = 0;

  message: string = '';

  isPaymentError: boolean = true;
  messageError: string = '';

  isLoadingOffline: boolean = false;

  isProd: boolean = environment.production;
  codeDisabled: boolean = false;

  sponsorInvited: string = '';

  isReactivePlan: boolean = false;

  env = environment;

  _cartList: Array<IProductModel> = [];

  constructor(
    private apiService: ApiService,
    private modalRef: NzModalRef,
    private modalService: ModalService,
    private scriptService: ScriptService,
    private rendered: Renderer2,
    private router: Router,
    private nzModalService: NzModalService,
    private nzMessage: NzMessageService,
  ) {}

  ngOnInit(): void {
    this.loadOptions();
    this.isReactivePlan =
      this.userModel?.payment?.state == CONSTANTS.PAYMENT_ORDER.TERMINADO;
  }

  public loadOptions(): void {
    this.isSpinning = true;
    forkJoin(
      this.apiService.getOptionsSearch(),
      this.apiService.getInvitedUsers({}),
    ).subscribe(
      ([options, sponsor]) => {
        this.isSpinning = false;
        let comision = options.data.find(
          (o) => o.option_key == 'comision',
        )?.option_value;
        this.comitionTotal = comision == null ? 0 : Number.parseFloat(comision);
        // if( this.comitionTotal == 0 ) this.totalPayment = Number.parseFloat(this.planSelected.price);
        // else this.totalPayment = parseFloat(this.planSelected.price) +  ( parseFloat(this.planSelected.price) * this.comitionTotal / 100) ;
        // this.totalPayment = this.comitionTotal == 0 ? this.planSelected.price : (this.planSelected.price + (this.planSelected.price * this.comitionTotal / 100) )

        this.sponsorInvited = sponsor.data;

        if (
          this.userModel?.payment?.state == CONSTANTS.PAYMENT_ORDER.PAGADO ||
          this.userModel?.payment?.state == CONSTANTS.PAYMENT_ORDER.TERMINADO
        ) {
          this.codeDisabled = true;
          this.codeUser = this.userModel?.payment?.payment_order.sponsor_code;
        } else {
          this.codeDisabled = false;
          if (this.sponsorInvited != '') {
            this.codeUser = this.sponsorInvited;
            // this.codeDisabled = true;
          }
        }
      },
      (error) => {
        this.isSpinning = false;
      },
    );
  }

  public onPaymentFlow(): void {
    if (this.codeUser.trim() == '') {
      this.codeUserStatus = 'error';
      return;
    }
    this.isLoadingFlow = true;
    this.apiService
      .postPaymentCreate({
        packId: this.planSelected.id,
        sponsorId: this.codeUser.trim(),
      })
      .subscribe(
        (response) => {
          console.log(response);
          this.isLoadingFlow = false;
          this.paymentSection = 1;
          this.linkPayment = response.data;
          // this.modalRef.close();
        },
        (error) => {
          console.log(error);
          this.isLoadingFlow = false;
          this.modalService.error(error?.message ?? 'Error');
          this.modalRef.close();
        },
      );
  }

  public onChangeCode(ev: any): void {
    if (this.codeUser.trim() == '') {
      this.codeUserStatus = 'error';
    } else {
      this.codeUserStatus = '';
    }
  }

  public onCloseModal(): void {
    this.modalRef.close();
    this.router.navigate(['/admin/profile']);
  }

  public onPaymentIzipay(): void {
    if (this.codeUser.trim() == '') {
      this.codeUserStatus = 'error';
      return;
    }

    this.isLoadingIzipay = true;
    this.apiService
      .postPaymentCreateIzipay({
        packId: this.planSelected.id,
        sponsorId: this.codeUser.trim(),
      })
      .subscribe(
        (response) => {
          const modalElement = this.scriptService.loadJsScript(
            this.rendered,
            CONSTANTS.IZIPAY.JS_URL,
          );
          modalElement.onload = () => {
            this.paymentSection = 2;
            this.isLoadingIzipay = false;
            KRGlue.loadLibrary(
              response.data.endpoint,
              response.data.publicKey,
            ) /* Load the remote library */
              .then(({ KR }) =>
                KR.setFormConfig({
                  /* set the minimal configuration */
                  formToken: response.data.formToken,
                  'kr-language':
                    'es-ES' /* to update initialization parameter */,
                }),
              )
              .then(({ KR }) =>
                KR.addForm('#myPaymentForm'),
              ) /* add a payment form  to myPaymentForm div*/
              .then(({ KR, result }) => KR.showForm(result.formId))
              .then(({ KR }) => {
                this.isSpinning = true;
                return KR.onSubmit(this.onSubmit);
              })
              .then(({ KR }) => {
                this.isSpinning = true;
                return KR.onError(this.onError);
              })
              .catch((error) => {
                this.modalRef.close();
                this.modalService.error(error?.message ?? 'Error');
              }); /* show the payment form */
          };
        },
        (error) => {
          console.log(error);
          this.isLoadingIzipay = false;
          this.modalService.error(error?.message ?? 'Error');
          this.modalRef.close();
        },
      );
  }

  public onPaymentOffline(): void {
    if (this.codeUser.trim() == '') {
      this.codeUserStatus = 'error';
      this.nzMessage.error('Debe Seleccionar un patrocinador');
      return;
    }
    this.modalRef.close();
    this.nzModalService.create({
      nzTitle: null,
      nzContent: PaymentOfflineEfectivoComponent,
      nzFooter: null,
      nzComponentParams: {
        packId: this.planSelected.id,
        codeUser: this.codeUser,
        cartList: this._cartList,
      },
    });
  }

  private onError = (error: KRError) => {
    this.isSpinning = true;
    this.paymentSection = 3;
    this.isPaymentError = true;
    this.messageError = error.detailedErrorMessage ?? 'Pago rechazado';
    this.isSpinning = false;
  };

  private onSubmit = (paymentData: KRPaymentResponse) => {
    this.isSpinning = true;
    this.apiService.postPaymentConfirmIzipay(paymentData).subscribe(
      (response) => {
        this.paymentSection = 3;
        this.isPaymentError = false;
        this.isSpinning = false;
      },
      (error) => {
        this.isSpinning = false;
        this.modalService.error(error?.message ?? 'Error');
        this.modalRef.close();
      },
    );
  };

  public onPaymentMakerplace(): void {
    this.modalService.confirm(
      'Para reactivarse, compra productos por valor de 200 puntos.',
      () => {
        this.nzModalService.closeAll();
        this.router.navigate(['/admin/marketplace']);
      },
    );
  }

  public onRemoveReferido(): void {
    this.modalService.confirm(
      '¿Desea eliminar el usuario referido que acepto?',
      () => {
        this.apiService.postInvitedRemoved({}).subscribe((response) => {
          this.sponsorInvited = '';
          this.codeUser = '';
          this.codeDisabled = false;
        });
      },
    );
  }

  public onNextPayment(): void {
    this.paymentSection = 0;
  }

  get isValidCart(): boolean {
    return (
      (this._cartList
        ?.map((p) => p.price * (p?.quantity ?? 0))
        .reduce((acc, curr) => acc + curr, 0) ?? 0) >=
      parseFloat(this.planSelected.price)
    );
  }

  get totalPayment(): number {
    const cartAmount =
      this._cartList.length == 0
        ? 0
        : this._cartList
            .map((c) => c.price * (c?.quantity ?? 0))
            .reduce((a, b) => a + b);
    const planAmount =
      parseFloat(this.planSelected?.price) *
      (this.comitionTotal == 0 ? 1 : this.comitionTotal / 100);
    return cartAmount;
  }

  public onCartChange(cartList: Array<IProductModel>): void {
    this._cartList = cartList;
  }
}
