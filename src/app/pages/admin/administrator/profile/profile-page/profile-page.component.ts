import { Component, OnInit, TemplateRef, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from '@env/environment';
import { ImageCropperUploadComponent } from '@shared/components/image-cropper-upload/image-cropper-upload.component';
import { PaymentReservationModalComponent } from '@shared/components/payment/payment-reservation-modal/payment-reservation-modal.component';
import { CONSTANTS } from '@shared/constants/constants';
import { ApiService } from '@shared/services/api.service';
import { AuthenticationService } from '@shared/services/authentication.service';
import { PackModel } from '@shared/services/models/packs.interface';
import { UserModel } from '@shared/services/models/user.interface';
import {
  saveSessionStorage,
  saveSessionStoraheUser,
} from '@shared/utilities/functions';
import { ModalService } from '@shared/utilities/modal-services';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ProfileInvitedModalComponent } from './profile-invited-modal/profile-invited-modal.component';
import { Router } from '@angular/router';
import { ToolsUserAddModalComponent } from '../../tools/tools-users-page/tools-user-add-modal/tools-user-add-modal.component';
import { forkJoin } from 'rxjs';
import { formatDate } from '@angular/common';

import { ChartConfiguration, ChartType } from 'chart.js';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.scss'],
})
export class ProfilePageComponent implements OnInit {
  @ViewChild('templatePointPersonal', { read: TemplateRef })
  templatePointPersonal: TemplateRef<any>;
  @ViewChild('templatePointAfiliado', { read: TemplateRef })
  templatePointAfiliado: TemplateRef<any>;

  @ViewChild('renewModal', { read: TemplateRef }) renewModal: TemplateRef<any>;

  avatarUrl: string = CONSTANTS.IMAGE.FALLBACK;
  validateForm: FormGroup;
  userModel: UserModel;

  isLoading: boolean = false;

  pointPatrocinio: number = 0;
  pointResudial: number = 0;
  pointCompra: number = 0;
  userCode: string = '';
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

  rdTab: number = 2;
  sldPoints: number = 80;

  public lineChartData: ChartConfiguration['data'] = {
    labels: ['Jan', 'Feb', 'Mar', 'Jun', 'Jul', 'Aug', 'Sep'], // Fechas del eje X
    datasets: [
      {
        data: [10, 25, 15, 23, 20, 45, 35],
        label: 'Average item persale',
        borderColor: '#BCF328',
        backgroundColor: '#BCF328',
        tension: 0.4, // <-- Esto crea el efecto de curva (suavizado de Bezier)
        pointBackgroundColor: '#BCF328',
        fill: false,
      },
      {
        data: [5, 15, 4, 20, 12, 27, 25],
        label: 'Average year value',
        borderColor: '#1A71F6',
        backgroundColor: '#1A71F6',
        tension: 0.4, // <-- 0 hace que las líneas sean completamente rectas y generen ángulos
        borderDash: [5, 5],
        pointBackgroundColor: '#1A71F6',
        fill: false,
      },
    ],
  };

  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      x: {
        display: true, // Mantiene visible el eje X (fechas)
      },
      y: {
        display: false, // <-- Esto oculta completamente el eje Y (valores, líneas y etiquetas)
        beginAtZero: true,
      },
    },
    plugins: {
      legend: {
        display: true, // Muestra la leyenda arriba
      },
    },
  };

  public lineChartType: ChartType = 'line';

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private modalService: ModalService,
    private nzModalService: NzModalService,
    private authenticationService: AuthenticationService,
    private router: Router,
  ) {
    this.validateForm = this.fb.group({
      address: [null],
      email: [{ value: null, disabled: true }, [Validators.required]],
      dni: [{ value: null, disabled: true }, [Validators.required]],
      phoneNumber: [null],
      city: [null],
      country: [null],
      gender: [null],
      fullName: [null],
      password: [{ value: '12345678', disabled: true }, []],
      dateCreation: [{ value: null, disabled: true }, []],
    });

    this.oneMonthAgo = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() - 1,
      this.currentDate.getDate(),
    );
  }

  divisaActiva: boolean = false;

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadStories();
    this.cargarEstadoDivisa();
  
    // Escuchar el evento personalizado
    window.addEventListener('divisaCambiada', (event: any) => {
      this.divisaActiva = event.detail.activa;
    });
  }

  cargarEstadoDivisa() {
    const guardado = localStorage.getItem('divisaActiva');
    this.divisaActiva = guardado ? JSON.parse(guardado) : false;
  }

  private readonly STORAGE_KEY = 'bank_data';

  ngAfterViewInit() {
  // Cargar datos guardados
  const saved = localStorage.getItem('bank_data');
  if (saved) {
    const data = JSON.parse(saved);
    const bankName = document.getElementById('bankName') as HTMLInputElement;
    const accountNumber = document.getElementById('accountNumber') as HTMLInputElement;
    const interbankNumber = document.getElementById('interbankNumber') as HTMLInputElement;
    const ruc = document.getElementById('ruc') as HTMLInputElement;
    const businessName = document.getElementById('businessName') as HTMLInputElement;
    const paypal = document.getElementById('paypal') as HTMLInputElement;
    
    if (bankName) bankName.value = data.bankName || '';
    if (accountNumber) accountNumber.value = data.accountNumber || '';
    if (interbankNumber) interbankNumber.value = data.interbankNumber || '';
    if (ruc) ruc.value = data.ruc || '';
    if (businessName) businessName.value = data.businessName || '';
    if (paypal) paypal.value = data.paypal || '';
  }

  // Guardar al hacer submit
  const form = document.getElementById('bankForm');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = {
        bankName: (document.getElementById('bankName') as any).value,
        accountNumber: (document.getElementById('accountNumber') as any).value,
        interbankNumber: (document.getElementById('interbankNumber') as any).value,
        ruc: (document.getElementById('ruc') as any).value,
        businessName: (document.getElementById('businessName') as any).value,
        paypal: (document.getElementById('paypal') as any).value,
      };
      localStorage.setItem('bank_data', JSON.stringify(data));
      alert('Datos guardados');
    });
  }

  public loadOptions(): void {
    this.apiService.getOptionsSearch({ key: 'bono_global' }).subscribe(
      (res) => {
        if (res.success) {
          this.isPointPersonal =
            this.userModel?.payment?.payment_order.pack.id ==
            res.data[0].option_value;
        }
      },
      (error) => {},
    );
  }

  public loadStories(): void {
    forkJoin(
      this.apiService.getUserPublishVideoStory({ story: 1 }),
      this.apiService.getUserPublishVideoStory({ story: 0 }),
    ).subscribe(([stories, images]) => {
      this.videoStories = stories.data;
      this.imageStories = images.data;
    });
  }

  get isStories(): boolean {
    return this.videoStories.length > 0;
  }
  get isImages(): boolean {
    return this.imageStories.length > 0;
  }

  public loadCurrentUser(): void {
    this.apiService.getAuthenticationUser().subscribe(
      (response) => {
        this.userModel = response.data;
        this.avatarUrl = response.data.file?.path
          ? environment.hostUrl + '/storage/' + response.data.file?.path
          : CONSTANTS.IMAGE.FALLBACK;

        this.validateForm.patchValue({
          address: response.data.address,
          email: response.data.email,
          phoneNumber: response.data.phone,
          city: response.data.city,
          gender: response.data.genger,
          country: response.data.country,
          dni: response.data.dni,
          fullName: response.data.name,
          dateCreation: formatDate(
            new Date(response.data.created_at),
            'dd/MM/yyyy',
            'en-US',
          ),
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
      },
      (error) => {
        this.modalService.error(error?.message ?? 'Hubo un error');
      },
    );
  }

  private command(): any {
    return {
      address: this.validateForm.get('address').value,
      phone: this.validateForm.get('phoneNumber').value,
      city: this.validateForm.get('city').value,
      country: this.validateForm.get('country').value,
      gender: this.validateForm.get('gender').value,
      name: this.validateForm.get('fullName').value,
    };
  }

  // get totalPointsPersonalGlobal(): number{
  //   return this.isPointPersonal == true? (this.pointPersonal == 0 ? 0 : (this.pointPersonal * 2/100)) : 0;
  // }

  public onSubmit(): void {
    this.isLoading = true;
    this.apiService
      .putAuthenticationUpdate(this.command())
      .subscribe((response) => {
        this.isLoading = false;
        this.modalService.success('Se guardo correctamente');
        this.userModel.name = this.validateForm.get('fullName').value;

        let currentUser = JSON.parse(
          localStorage.getItem('currentUser') ?? '{}',
        );
        currentUser.name = this.userModel.name;
        this.authenticationService.updateCurrentUserData(currentUser);
      });
  }

  public listPoints(): void {
    this.apiService.getPointList({}).subscribe(
      (response) => {
        // && p?.state == 1
        // ====== PATROCINIO
        let patrocinio = response.data.filter(
          (p) =>
            p.sponsor_code?.toLowerCase() == this.userCode.toLowerCase() &&
            p.type == 'P',
        );

        if (patrocinio.length > 0) {
          this.pointPatrocinio = patrocinio
            .map((m) => m.point)
            .reduce((a, c) => a + c);
        } else {
          this.pointPatrocinio = 0;
        }

        // ====== RESIDUAL
        let residual = response.data.filter(
          (p) =>
            p.sponsor_code?.toLowerCase() == this.userCode.toLowerCase() &&
            p.type == 'R',
        );

        if (residual.length > 0) {
          this.pointResudial = residual
            .map((m) => m.point)
            .reduce((a, c) => a + c);
        } else {
          this.pointResudial = 0;
        }

        // ====== PERSONALES

        let buy = response.data.filter(
          (p) =>
            p.user_code?.toLowerCase() == this.userCode.toLowerCase() &&
            p.type == 'B',
        );

        if (buy.length > 0) {
          this.pointCompra = buy.map((m) => m.point).reduce((a, c) => a + c);
        } else {
          this.pointCompra = 0;
        }

        // ====== GRUPALES

        let grupales = response.data.filter(
          (p) =>
            p.sponsor_code?.toLowerCase() == this.userCode.toLowerCase() &&
            p.type == 'G',
        );

        if (grupales.length > 0) {
          this.pointGroup = grupales
            .map((m) => m.point)
            .reduce((a, c) => a + c);
        } else {
          this.pointGroup = 0;
        }
      },
      (error) => {
        this.modalService.error(error?.message ?? 'Hubo un error');
      },
    );
  }

  public listPointsPersonal(): void {
    this.apiService.getProductPaymnetPoints().subscribe(
      (response) => {
        if (response.success) {
          this.pointPersonal = response.data
            .map((p) => p.points)
            .reduce((a, b) => a + b);
        }
      },
      (error) => {},
    );
  }

  fileChangeEvent(event: any): void {
    let modal = this.nzModalService.create({
      nzContent: ImageCropperUploadComponent,
      nzTitle: 'Imagen para cortar',
      nzMaskClosable: false,
      nzComponentParams: {
        file: event,
      },
      nzFooter: null,
    });

    modal.afterClose.subscribe((result) => {
      if (result.file != null) {
        let formData = new FormData();
        formData.set('file', result.file as any);
        this.apiService.postAuthenticationAvatar(formData).subscribe(
          (response) => {
            saveSessionStoraheUser({
              name: response.data.name,
              photo: response.data?.file?.path ?? '',
            });
            // this.authenticationService.setCurrentUser( response.data );

            if (response.data.photo != null) {
              this.avatarUrl =
                environment.hostUrl + '/storage/' + response.data.file.path;
            } else {
              this.avatarUrl = CONSTANTS.IMAGE.FALLBACK;
            }
          },
          (error) => {
            this.modalService.error(error?.message ?? 'Error al subir imagen');
          },
        );
      }
    });

    // this.avatarUrl = CONSTANTS.IMAGE.FALLBACK;
  }

  copyMessage(val: string) {
    this.apiService.postGenerateLinkInvited({}).subscribe((res) => {
      this.nzModalService.create({
        nzContent: ProfileInvitedModalComponent,
        nzTitle: 'Invitación',
        nzFooter: null,
        nzComponentParams: {
          userModel: this.userModel,
          codeInvited: res.data.code,
        },
      });
    });

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

  public onInfoPointPresonal(): void {
    this.nzModalService.create({
      nzTitle: '',
      nzFooter: null,
      nzContent: this.templatePointPersonal,
    });
  }

  public onInfoPointAfiliado(): void {
    this.nzModalService.create({
      nzTitle: '',
      nzFooter: null,
      nzContent: this.templatePointAfiliado,
    });
  }

  public onRenewModal(): void {
    this.nzModalService.create({
      nzTitle: '',
      nzFooter: null,
      nzContent: this.renewModal,
    });
  }

  public onPaymentPlan(): void {
    let pack: PackModel = {
      id: this.userModel?.payment?.payment_order.pack.id,
      title: this.userModel?.payment?.payment_order.pack.title,
      price: this.userModel?.payment?.payment_order.pack.price,
      points: this.userModel?.payment?.payment_order.pack.points,
      state: true,
      image: 0,
      file: null,
    };
    let modal = this.nzModalService.create({
      nzTitle: 'Pagar',
      nzContent: PaymentReservationModalComponent,
      nzFooter: null,
      nzComponentParams: {
        planSelected: pack,
        userModel: this.userModel,
      },
      nzMaskClosable: false,
    });

    modal.afterClose.subscribe((r) => {
      console.log(r);
    });
  }

  public onInfo(): void {
    this.modalService.info(
      'Para evitar saturación del sistema, el monto del bono infinito se actualiza a mediodía y medianoche de cada día',
    );
  }

  public onDownloadPdfProfile(): void {
    this.apiService.postUserPdfProfile({}).subscribe((response) => {
      console.log(response);

      const base64 = response.data.base64;
      const byteCharacters = atob(base64);
      const byteNumbers = Array.from(byteCharacters, (char) =>
        char.charCodeAt(0),
      );
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = response.data.filename || 'archivo.pdf';
      link.click();
    });
  }

  public onPaymentMakerplace(): void {
    this.modalService.confirm(
      'Usted ya tiene un paquete activo. Para cambiar de paquete de afiliación, por favor, póngase en contacto con soporte de Aziel Network.',
      () => {
        this.nzModalService.closeAll();
        this.router.navigate(['/admin/marketplace']);
      },
    );
  }

  onAddUser(): void {
    const modal = this.nzModalService.create({
      nzTitle: 'Agregar Usuario',
      nzContent: ToolsUserAddModalComponent,
      nzFooter: null,
      nzWidth: '550px',
      nzComponentParams: {},
    });

    modal.afterClose.subscribe(() => {});
  }

  public onCloseStory(): void {
    this.storySelected = null;
  }

  public onSelectedStory(item: any): void {
    this.storySelected = item;
  }

  public onDeleteVideo(id: number): void {
    this.apiService
      .deleteUserPublishVideoStory({ id })
      .subscribe((response) => {
        this.storySelected = null;
        this.loadStories();
      });
  }

  public onDownloadFinanceExcel(): void {
    this.apiService.postUserExcelFinance({}).subscribe((response) => {
      console.log(response);

      const base64 = response.data.base64;
      const byteCharacters = atob(base64);
      const byteNumbers = Array.from(byteCharacters, (char) =>
        char.charCodeAt(0),
      );
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], {
        type: response.data.mime,
      });

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = response.data.filename;
      link.click();
    });
  }
}
