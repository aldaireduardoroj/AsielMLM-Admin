import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from '@env/environment';
import { ImageCropperUploadComponent } from '@shared/components/image-cropper-upload/image-cropper-upload.component';
import { PaymentReservationModalComponent } from '@shared/components/payment/payment-reservation-modal/payment-reservation-modal.component';
import { CONSTANTS } from '@shared/constants/constants';
import { ApiService } from '@shared/services/api.service';
import { AuthenticationService } from '@shared/services/authentication.service';
import { PackModel } from '@shared/services/models/packs.interface';
import { UserModel } from '@shared/services/models/user.interface';
import { saveSessionStorage, saveSessionStoraheUser } from '@shared/utilities/functions';
import { ModalService } from '@shared/utilities/modal-services';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ProfileInvitedModalComponent } from './profile-invited-modal/profile-invited-modal.component';
import { Router } from '@angular/router';
import { ToolsUserAddModalComponent } from '../../tools/tools-users-page/tools-user-add-modal/tools-user-add-modal.component';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.scss']
})
export class ProfilePageComponent implements OnInit {
  @ViewChild('templatePointPersonal', { read: TemplateRef }) templatePointPersonal:TemplateRef<any>;
  @ViewChild('templatePointAfiliado', { read: TemplateRef }) templatePointAfiliado:TemplateRef<any>;
  
  @ViewChild('renewModal', { read: TemplateRef }) renewModal:TemplateRef<any>;

  avatarUrl: string = CONSTANTS.IMAGE.FALLBACK;
  validateForm: FormGroup;
  userModel: UserModel;

  isLoading: boolean = false;

  pointPatrocinio: number = 0;
  pointResudial: number = 0;
  pointCompra: number = 0;
  userCode: string = "";
  pointGroup: number = 0;
  pointInfinity: number = 0;
  pointPersonal: number = 0;
  pointAfiliado: number = 0;
  totalPointsPersonalGlobal: number = 0;

  CONSTANTS = CONSTANTS;

  env = environment;

  isPointPersonal: boolean = false;

  currentDate: Date = new Date();
  oneMonthAgo: Date;

  videoStories: Array<any> = [];
  imageStories: Array<any> = [];

  pathServer = environment.hostUrl + '/storage/';
  effect = 'scrollx';

  storySelected: any;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private modalService: ModalService,
    private nzModalService: NzModalService,
    private authenticationService: AuthenticationService,
    private router: Router
  ) {
    this.validateForm = this.fb.group({
      address: [null],
      email: [{value: null , disabled: true}, [Validators.required]],
      dni: [{value: null , disabled: true}, [Validators.required]],
      phoneNumber: [null],
      city: [null],
      country: [null],
      gender: [null],
    });

    this.oneMonthAgo = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() - 1,
      this.currentDate.getDate()
    );
  }

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadStories();
  }

  public loadOptions(): void{
    this.apiService.getOptionsSearch({key: 'bono_global'}).subscribe(
      (res) => {
        if( res.success ){
          this.isPointPersonal = this.userModel?.payment?.payment_order.pack.id == res.data[0].option_value;
        }
      },(error) => {
        
      }
    )
  }

  public loadStories(): void{
    forkJoin(
      this.apiService.getUserPublishVideoStory({story: 1}),
      this.apiService.getUserPublishVideoStory({story: 0})
    ).subscribe(
      ([stories, images]) => {
        this.videoStories = stories.data;
        this.imageStories = images.data;
      }
    )
  }

  get isStories(): boolean{
    return this.videoStories.length > 0;
  }
  get isImages(): boolean{
    return this.imageStories.length > 0;
  }

  public loadCurrentUser(): void{
    this.apiService.getAuthenticationUser().subscribe(
      (response) => {
        this.userModel = response.data;
        this.avatarUrl = response.data.file?.path ? environment.hostUrl + '/storage/' + response.data.file?.path : CONSTANTS.IMAGE.FALLBACK;

        this.validateForm.patchValue({
          address: response.data.address,
          email: response.data.email,
          phoneNumber: response.data.phone,
          city: response.data.city,
          gender: response.data.genger,
          country: response.data.country,
          dni: response.data.dni
        });
        this.userCode = response.data.uuid;

        this.pointPatrocinio = response.data.podints.patrocinio;
        this.pointResudial = response.data.podints.residual;
        this.pointCompra = response.data.podints.compra;
        this.pointGroup = response.data.podints.pointGroup;
        this.pointPersonal = response.data.podints.personal;
        this.pointInfinity = response.data.podints.infinito;
        this.pointAfiliado = response.data.podints.pointAfiliado;
        this.totalPointsPersonalGlobal = response.data.podints.personalGlobal;
        // this.listPoints();
        // this.listPointsPersonal();

        this.loadOptions();

      }, ( error) => {
        this.modalService.error( error?.message ?? "Hubo un error" )
      }
    )
  }

  private command(): any {
    return {
      address: this.validateForm.get('address').value,
      phone: this.validateForm.get('phoneNumber').value,
      city: this.validateForm.get('city').value,
      country: this.validateForm.get('country').value,
      gender: this.validateForm.get('gender').value
    }
  }

  // get totalPointsPersonalGlobal(): number{
  //   return this.isPointPersonal == true? (this.pointPersonal == 0 ? 0 : (this.pointPersonal * 2/100)) : 0;
  // }

  public onSubmit(): void{
    this.isLoading = true;
    this.apiService.putAuthenticationUpdate( this.command() ).subscribe(
      (response) => {
        this.isLoading = false;
        this.modalService.success("Se guardo correctamente");
      }
    )
  }

  public listPoints(): void{
    this.apiService.getPointList({}).subscribe(
      (response) =>{

        // && p?.state == 1
        // ====== PATROCINIO
        let patrocinio = response.data.filter( p => p.sponsor_code?.toLowerCase() == this.userCode.toLowerCase()  && p.type == 'P')

        if( patrocinio.length > 0 ){
          this.pointPatrocinio = patrocinio.map( m => m.point ).reduce( (a, c) => a + c );
        }else{
          this.pointPatrocinio = 0;
        }

        // ====== RESIDUAL
        let residual = response.data.filter( p => p.sponsor_code?.toLowerCase() == this.userCode.toLowerCase()  && p.type == 'R')

        if( residual.length > 0 ){

          this.pointResudial = residual.map( m => m.point ).reduce( (a, c) => a + c );
        }else{
          this.pointResudial = 0;
        }

         // ====== PERSONALES

        let buy = response.data.filter( p => p.user_code?.toLowerCase() == this.userCode.toLowerCase()  && p.type == 'B')


        if( buy.length > 0 ){

          this.pointCompra = buy.map( m => m.point ).reduce( (a, c) => a + c );
        }else{
          this.pointCompra = 0;
        }

        // ====== GRUPALES

        let grupales = response.data.filter( p => p.sponsor_code?.toLowerCase() == this.userCode.toLowerCase()  && p.type == 'G');

        if( grupales.length > 0 ){

          this.pointGroup = grupales.map( m => m.point ).reduce( (a, c) => a + c );
        }else{
          this.pointGroup = 0;
        }

      },(error) =>{

        this.modalService.error( error?.message ?? "Hubo un error" )
      }
    )
  }

  public listPointsPersonal():void{
    this.apiService.getProductPaymnetPoints().subscribe(
      (response) => {
        if( response.success ){
          this.pointPersonal = response.data.map( p => p.points ).reduce( (a,b) => a+b );
        }
      }, (error) => {

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

  copyMessage(val: string){
    this.apiService.postGenerateLinkInvited({}).subscribe(
      (res) => {
        this.nzModalService.create({
          nzContent: ProfileInvitedModalComponent,
          nzTitle: "Inivitación",
          nzFooter: null,
          nzComponentParams: {
            userModel: this.userModel,
            codeInvited: res.data.code
          }
        })
      }
    )
    
    // const selBox = document.createElement('textarea');
    // selBox.style.position = 'fixed';
    // selBox.style.left = '0';
    // selBox.style.top = '0';
    // selBox.style.opacity = '0';
    // selBox.value = val;
    // document.body.appendChild(selBox);
    // selBox.focus();
    // selBox.select();
    // document.execCommand('copy');
    // document.body.removeChild(selBox);
  }

  public onInfoPointPresonal(): void{
    this.nzModalService.create({
      nzTitle: "",
      nzFooter: null,
      nzContent: this.templatePointPersonal
    })
  }

  public onInfoPointAfiliado(): void{
    this.nzModalService.create({
      nzTitle: "",
      nzFooter: null,
      nzContent: this.templatePointAfiliado
    })
  }
  

  public onRenewModal(): void{
    this.nzModalService.create({
      nzTitle: "",
      nzFooter: null,
      nzContent: this.renewModal
    })
  }

  public onPaymentPlan(): void{
    let pack: PackModel = {
      id: this.userModel?.payment?.payment_order.pack.id,
      title: this.userModel?.payment?.payment_order.pack.title,
      price: this.userModel?.payment?.payment_order.pack.price,
      points: this.userModel?.payment?.payment_order.pack.points,
      state: true,
      image: 0,
      file: null
    }
    let modal = this.nzModalService.create({
      nzTitle: "Pagar",
      nzContent: PaymentReservationModalComponent,
      nzFooter: null,
      nzComponentParams:{
        planSelected: pack,
        userModel: this.userModel
      },
      nzMaskClosable: false
    });

    modal.afterClose.subscribe( (r)=> {
      console.log(r)
    })
  }

  public onInfo(): void{
    this.modalService.info("Para evitar saturación del sistema, el monto del bono infinito se actualiza a mediodía y medianoche de cada día");
  }

  public onDownloadPdfProfile(): void{
    this.apiService.postUserPdfProfile({}).subscribe(
      (response) => {
        console.log(response)

        const base64 = response.data.base64;
        const byteCharacters = atob(base64);
        const byteNumbers = Array.from(byteCharacters, char => char.charCodeAt(0));
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = response.data.filename || 'archivo.pdf';
        link.click();
      }
    )
  }

  public onPaymentMakerplace(): void{
    this.modalService.confirm(
      "Usted ya tiene un paquete activo. Para cambiar de paquete de afiliación, por favor, póngase en contacto con soporte de Imperio Global.",
      () => {
        this.nzModalService.closeAll();
        this.router.navigate(['/admin/marketplace']);

      }
    )
  }

  onAddUser(): void{
    const modal = this.nzModalService.create({
      nzTitle: "Agregar Usuario",
      nzContent: ToolsUserAddModalComponent,
      nzFooter: null,
      nzWidth: "550px",
      nzComponentParams: {

      },
    });

    modal.afterClose.subscribe( () => {
      
    })
  }

  public onCloseStory(): void{
    this.storySelected = null;
  }

  public onSelectedStory(item: any): void{
    this.storySelected = item;
  }

  public onDeleteVideo(id: number): void{
    this.apiService.deleteUserPublishVideoStory({id}).subscribe(
      (response) => {
        this.loadStories()
      }
    )
  }
}
