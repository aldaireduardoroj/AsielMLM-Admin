import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '@shared/services/api.service';
import { PackModel } from '@shared/services/models/packs.interface';
import { FormValidator } from '@shared/utilities/form-validator';

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


  onSubmit():void{

  }

  loadPlans(): void{
    this.apiService.getPlansSearch({}).subscribe(
      (response) => {
        this.planList = response.data;
      }
    )
  }

}
