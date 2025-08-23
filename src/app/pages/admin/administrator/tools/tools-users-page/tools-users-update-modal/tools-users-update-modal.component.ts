import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from '@env/environment';
import { ImageCropperUploadComponent } from '@shared/components/image-cropper-upload/image-cropper-upload.component';
import { CONSTANTS } from '@shared/constants/constants';
import { ApiService } from '@shared/services/api.service';
import { PackModel } from '@shared/services/models/packs.interface';
import { UserModel } from '@shared/services/models/user.interface';
import { saveSessionStoraheUser } from '@shared/utilities/functions';
import { ModalService } from '@shared/utilities/modal-services';
import { NzModalService } from 'ng-zorro-antd/modal';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-tools-users-update-modal',
  templateUrl: './tools-users-update-modal.component.html',
  styleUrls: ['./tools-users-update-modal.component.scss']
})
export class ToolsUsersUpdateModalComponent implements OnInit {

  @Input() userModel: UserModel;
  @Output() back: EventEmitter<number> = new EventEmitter<number>();

  validateForm: FormGroup;
  avatarUrl: string = CONSTANTS.IMAGE.FALLBACK;

  planList: Array<PackModel> = [];
  loadingSave: boolean = false;

  isSponsorNew: boolean = false;
  loadingSearch: boolean = false;
  avatarUrlNewSponsor: string = CONSTANTS.IMAGE.FALLBACK;

  isSponsordata: boolean = false;

  constructor(
    private apiService: ApiService,
    private modalService: ModalService,
    private nzModalService: NzModalService,
    private fb : FormBuilder
  ) {
    this.validateForm = this.fb.group({
      fullname: [null, [Validators.required]],
      packActive: [null],
      sponsorNew: [""]
    })
  }

  ngOnInit(): void {
    this.loadData();
    console.log( this.userModel )
    if( this.userModel.payment == null ) this.isSponsordata = true;
  }

  public loadData(): void{

    forkJoin(
      this.apiService.getPlansSearch({}),
    ).subscribe(
      ([planList])=>{

        this.planList = planList.data;
        this.avatarUrl = this.userModel.file?.path ? environment.hostUrl + '/storage/' + this.userModel.file?.path : CONSTANTS.IMAGE.FALLBACK;
        this.validateForm.patchValue({
          fullname: this.userModel.name,
          packActive: this.userModel?.payment?.payment_order?.pack?.id ?? "0"
        });

      }
    )
  }

  public onSearchSponsor(): void{
    this.loadingSearch = true;
    this.isSponsorNew = false;
    this.apiService.getUsersSearch({code: this.validateForm.get('sponsorNew').value ?? ""}).subscribe(
      (response) => {
        this.loadingSearch = false;
        if( response.success ){
          if( response.data.length > 0 ){
            if( this.validateForm.get('sponsorNew').value != "" ){
              this.isSponsorNew = true;
              this.avatarUrlNewSponsor = response.data[0]?.file?.path ? environment.hostUrl + '/storage/' + response.data[0]?.file?.path : CONSTANTS.IMAGE.FALLBACK;
            }
          }
        }

      },
      (error) => {
        this.loadingSearch = false;
      }
    )
  }

  fileChangeEvent(event: any): void {

    let modal = this.nzModalService.create({
      nzContent: ImageCropperUploadComponent,
      nzTitle: 'Imagen para cortar',
      nzMaskClosable: false,
      nzComponentParams: {
        file: event
      },
      nzFooter: null
    });


    modal.afterClose.subscribe( ( result ) => {
      if( result.file != null ){
        let formData = new FormData();
        formData.set('file' , result.file as any);
        this.apiService.postAuthenticationAvatar(formData).subscribe(
          (response) => {

            saveSessionStoraheUser( { name: response.data.name, photo: response.data?.file?.path ?? "" } );
            // this.authenticationService.setCurrentUser( response.data );

            if( response.data.photo != null )
            {
              this.avatarUrl = environment.hostUrl + '/storage/'  + response.data.file.path;
            }else{
              this.avatarUrl = CONSTANTS.IMAGE.FALLBACK;
            }
          }, ( error) => {
            this.modalService.error( error?.message ?? 'Error al subir imagen')
          }
        )
      }
    });


    // this.avatarUrl = CONSTANTS.IMAGE.FALLBACK;
  }

  public onBack(): void{
    this.back.emit( (new Date()).getTime() )
  }

  public onSave(): void{
    console.log( this.validateForm.get('packActive')?.value )
    if( this.userModel.payment == null ){
      if( this.validateForm.get('packActive')?.value == 1 ){
        this.modalService.warning("Para activarle 1er Plan, se debe seleccionar un plan existente.");
        return;
      }
      if( this.validateForm.get('sponsorNew')?.value == "" &&
        ( this.validateForm.get('packActive')?.value == null || this.validateForm.get('packActive')?.value == 1 )
      ){
        this.modalService.warning("El codigó de usuario es requerido");
        return;
      }
      if( this.isSponsorNew == false && this.validateForm.get('sponsorNew')?.value != "" ){
        this.modalService.warning("Se debe seleccionar un codigó de usuario correcto");
        return;
      }
    }

    this.loadingSave = true;
    this.apiService.postUserModify({
      userCode: this.userModel.uuid,
      userFullName: this.validateForm.get('fullname')?.value,
      packId: this.validateForm.get('packActive')?.value,
      sponsorNew: this.validateForm.get('sponsorNew')?.value ?? ""

    }).subscribe(
      (response) => {
        this.nzModalService.closeAll();
        this.modalService.success("¡Listo, tu cambio se realizó con éxito! ")
        this.loadingSave = false;
      },
      (error) => {
        this.nzModalService.closeAll();
        this.modalService.error("¡Error, no se pudo hacer el cambio!")
        this.loadingSave = false;
      }
    )
  }

}
