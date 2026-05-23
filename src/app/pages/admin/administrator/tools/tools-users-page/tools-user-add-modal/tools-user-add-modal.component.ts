import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '@env/environment';
import { CONSTANTS } from '@shared/constants/constants';
import { ApiService } from '@shared/services/api.service';
import { PackModel } from '@shared/services/models/packs.interface';
import { UserModel } from '@shared/services/models/user.interface';
import { ThemeConstantService } from '@shared/services/theme-constant.service';
import { FormValidator } from '@shared/utilities/form-validator';
import { ModalService } from '@shared/utilities/modal-services';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { IProductModel } from '@shared/services/models/product.interface';

@Component({
  selector: 'app-tools-user-add-modal',
  templateUrl: './tools-user-add-modal.component.html',
  styleUrls: ['./tools-user-add-modal.component.scss'],
})
export class ToolsUserAddModalComponent implements OnInit {
  frmRegister!: FormGroup;
  loadingSubmit: boolean = false;
  planList: Array<PackModel> = [];
  isAdmin: boolean;

  avatarUrlNewSponsor: string = CONSTANTS.IMAGE.FALLBACK;

  newSponsor: UserModel;

  isSponsorNew: boolean = false;
  loadingSearch: boolean = false;

  planSelected?: PackModel;

  cartList: Array<IProductModel> = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private apiService: ApiService,
    private formValidator: FormValidator,
    private message: NzMessageService,
    private nzModalService: NzModalService,
    private modalService: ModalService,
    private themeService: ThemeConstantService,
  ) {
    this.frmRegister = this.fb.group({
      userName: [null, [Validators.required]],
      email: [null, [Validators.required, Validators.email]],
      dni: [null, [Validators.required]],
      password: [null, [Validators.required, Validators.minLength(8)]],
      sponsor: [null, []],
      plan: [null, []],
      address: [null, []],
      phone: [null, []],
    });

    this.themeService.isAdminUserChanges.subscribe((isAdmin) => {
      this.isAdmin = isAdmin;
      if (!isAdmin) {
        this.frmRegister.get('sponsor').setValue(localStorage.getItem('uuid'));
        this.frmRegister.get('sponsor').disable();
      }
    });
  }

  ngOnInit(): void {
    this.loadPlans();
  }

  private command(): any {
    return {
      name: this.frmRegister.get('userName')?.value,
      email: this.frmRegister.get('email')?.value,
      dni: this.frmRegister.get('dni')?.value,
      password: this.frmRegister.get('password')?.value,
      address: this.frmRegister.get('address')?.value,
      phone: this.frmRegister.get('phone')?.value,
      sponsor: this.frmRegister.get('sponsor')?.value,
      plan: this.frmRegister.get('plan')?.value,
      products: this.cartList.map((p) => {
        return {
          id: p.id,
          quantity: p.quantity,
          title: p.title,
        };
      }),
    };
  }

  onSubmit(): void {
    if (this.formValidator.validForm(this.frmRegister)) {
      this.loadingSubmit = true;
      this.apiService.postUserCreate(this.command()).subscribe(
        (response) => {
          this.nzModalService.closeAll();
          this.modalService.success('Se creo el usuario correctamente');
          this.loadingSubmit = false;
        },
        (error) => {
          console.log(error);
          this.nzModalService.closeAll();
          this.modalService.error(error.message ?? 'Ocurrio un error!!!');
          this.loadingSubmit = false;
        },
      );
    }
  }

  public onSearchSponsor(): void {
    this.loadingSearch = true;
    this.isSponsorNew = false;
    this.apiService
      .getUsersSearch({ code: this.frmRegister.get('sponsor').value ?? '' })
      .subscribe(
        (response) => {
          this.loadingSearch = false;
          this.newSponsor = null;
          if (response.success) {
            if (response.data.length > 0) {
              this.isSponsorNew = true;
              this.newSponsor = response.data[0];
              this.avatarUrlNewSponsor = response.data[0]?.file?.path
                ? environment.hostUrl +
                  '/storage/' +
                  response.data[0]?.file?.path
                : CONSTANTS.IMAGE.FALLBACK;
            }
          }
        },
        (error) => {
          this.loadingSearch = false;
        },
      );
  }

  loadPlans(): void {
    this.apiService.getPlansSearch({}).subscribe((response) => {
      this.planList = response.data;
    });
  }

  onChangePlan(planId?: string): void {
    if (planId != null) {
      this.planSelected = this.planList.find((x) => x.id === planId);
    } else {
      this.planSelected = null;
    }
  }

  public onCartChange(cartList: Array<IProductModel>): void {
    this.cartList = cartList;
  }

  get totalPayment(): number {
    const cartAmount =
      this.cartList.length == 0
        ? 0
        : this.cartList
            .map((c) => c.price * (c?.quantity ?? 0))
            .reduce((a, b) => a + b);
    return cartAmount;
  }
}
