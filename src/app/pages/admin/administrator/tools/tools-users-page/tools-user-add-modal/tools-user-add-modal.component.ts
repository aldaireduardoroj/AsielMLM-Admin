import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '@shared/services/api.service';
import { PackModel } from '@shared/services/models/packs.interface';
import { FormValidator } from '@shared/utilities/form-validator';
import { ModalService } from '@shared/utilities/modal-services';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-tools-user-add-modal',
  templateUrl: './tools-user-add-modal.component.html',
  styleUrls: ['./tools-user-add-modal.component.scss']
})
export class ToolsUserAddModalComponent implements OnInit {

  frmRegister!: FormGroup;
  loadingSubmit: boolean = false;
  planList: Array<PackModel> = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private apiService: ApiService,
    private formValidator: FormValidator,
    private message: NzMessageService,
    private nzModalService: NzModalService,
    private modalService: ModalService
  ) {
    this.frmRegister = this.fb.group({
      userName: [null, [Validators.required]],
      email: [null, [Validators.required, Validators.email]],
      dni: [null, [Validators.required]],
      password: [null, [Validators.required, Validators.minLength(8)]],
      sponsor: [null, [Validators.required]],
      plan: [null, [Validators.required]],
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
      sponsor: this.frmRegister.get('sponsor')?.value,
      plan: this.frmRegister.get('plan')?.value,
    }
  }

  onSubmit():void{
    if( this.formValidator.validForm( this.frmRegister ) ){
      this.loadingSubmit = true;
      this.apiService.postUserCreate( this.command() ).subscribe(
        (response) => {
          console.log(response)
          this.nzModalService.closeAll();
          this.modalService.success("Se creo el usuario correctamente");
          this.loadingSubmit = false;
        }, (error) => {
          console.log(error)
          this.nzModalService.closeAll();
          this.modalService.error(error.message ?? "Ocurrio un error!!!");
          this.loadingSubmit = false;
        }
      )
    }
  }

  loadPlans(): void{
    this.apiService.getPlansSearch({}).subscribe(
      (response) => {
        this.planList = response.data;
      }
    )
  }

}
