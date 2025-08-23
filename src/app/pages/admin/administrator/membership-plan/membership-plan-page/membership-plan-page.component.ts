import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '@env/environment';
import { PaymentReservationModalComponent } from '@shared/components/payment/payment-reservation-modal/payment-reservation-modal.component';
import { CONSTANTS } from '@shared/constants/constants';
import { ApiService } from '@shared/services/api.service';
import { PackModel } from '@shared/services/models/packs.interface';
import { UserModel } from '@shared/services/models/user.interface';
import { ModalService } from '@shared/utilities/modal-services';
import { NzModalService } from 'ng-zorro-antd/modal';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-membership-plan-page',
  templateUrl: './membership-plan-page.component.html',
  styleUrls: ['./membership-plan-page.component.scss']
})
export class MembershipPlanPageComponent implements OnInit {


  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: false,
    dots: false,
    navSpeed: 700,
    autoplay: false,
    autoplayTimeout:5000,
    navText: ['', ''],
    responsive: {
      0: {
        items: 1
      },
      400: {
        items: 2
      },
      900: {
        items: 3
      }
    },
    nav: true
  }

  planList: Array<PackModel> = [];
  env = environment;

  userModel : UserModel;
  constructor(
    private apiService: ApiService,
    private modalService: ModalService,
    private nZmodal: NzModalService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadPlans();
  }

  public loadPlans(): void{
    forkJoin(
      this.apiService.getAuthenticationUser(),
      this.apiService.getPlansSearch({})
    ).subscribe(
      ([userModel, plans]) => {
        this.userModel = userModel.data
        this.planList = plans.data;
      }
    )
    // this.apiService.getPlansSearch({}).subscribe(
    //   (response) =>{
    //     this.planList = response.data;
    //   },
    //   (error) =>{

    //   }
    // )
  }

  public onPaymentPlan( plan: PackModel ): void{

    if( this.userModel?.payment?.state == CONSTANTS.PAYMENT_ORDER.TERMINADO ){
      this.modalService.confirm(
        "Usted ya tiene un paquete activo. Para cambiar de paquete de afiliación, por favor, póngase en contacto con soporte de Imperio Global.",
        () => {
          this.nZmodal.closeAll();
          this.router.navigate(['/admin/marketplace']);

        }
      )
    }else{
      let modal = this.nZmodal.create({
        nzTitle: "Pagar",
        nzContent: PaymentReservationModalComponent,
        nzFooter: null,
        nzComponentParams:{
          planSelected: plan,
          userModel: this.userModel
        },
        nzMaskClosable: false
      });

      modal.afterClose.subscribe( (r)=> {
      })
    }
    
  }
}
