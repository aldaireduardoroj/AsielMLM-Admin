import { Component, Input, OnInit } from '@angular/core';
import { IProductPaymentOrder } from '@shared/services/models/product-payment-order.interface';

@Component({
  selector: 'app-payment-view-voucher-modal',
  templateUrl: './payment-view-voucher-modal.component.html',
  styleUrls: ['./payment-view-voucher-modal.component.scss']
})
export class PaymentViewVoucherModalComponent implements OnInit {

  @Input() iProductPaymentOrder?: IProductPaymentOrder;


  constructor() {

  }

  ngOnInit(): void {


  }

}
