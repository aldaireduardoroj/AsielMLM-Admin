import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientJsonpModule, HttpClientModule } from '@angular/common/http';
import { RouterModule } from "@angular/router";
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { SearchPipe } from './pipes/search.pipe';
import { LoadingSpinerComponent } from './components/loading-spiner/loading-spiner.component';
import { BrowserModule } from '@angular/platform-browser'
import { NgxIntlTelephoneInputModule } from "ngx-intl-telephone-input";
import { ImageCropperModule } from 'ngx-image-cropper';
import { CarouselImagesComponent } from './components/carousel-images/carousel-images.component';
import { NgZorroAntdModule } from './ng-zorro-antd.module';
import { NzImageModule } from 'ng-zorro-antd/image';
import { GooglePlaceModule } from "ngx-google-places-autocomplete";
import { CarouselModule } from 'ngx-owl-carousel-o';
import { CardServiceComponent } from './components/card-service/card-service.component';
import { PaymentReservationModalComponent } from './components/payment/payment-reservation-modal/payment-reservation-modal.component';
import { TreeViewComponent } from './components/tree-view/tree-view.component';
import { ImageCropperUploadComponent } from './components/image-cropper-upload/image-cropper-upload.component';
import { UserTreeDetailComponent } from './components/user-tree-detail/user-tree-detail.component';
import { DelayedInputDirective } from './directives/delayed-input.directive';
import { PaymentProductsModalComponent } from './components/payment/payment-products-modal/payment-products-modal.component';
import { TablePaymentProductOrderComponent } from './components/table/table-payment-product-order/table-payment-product-order.component';
import { PaymentViewVoucherModalComponent } from './components/payment/payment-view-voucher-modal/payment-view-voucher-modal.component';
import { CardImageComponent } from './components/card-image/card-image.component';
import { CardTestimonialsComponent } from './components/card-testimonials/card-testimonials.component';
import { PaymentOfflineEfectivoComponent } from './components/payment/payment-offline-efectivo/payment-offline-efectivo.component';

const MODULES = [
    ReactiveFormsModule,
    CarouselModule,
    NgZorroAntdModule,
    NgxIntlTelephoneInputModule,
    NzImageModule,
    ImageCropperModule
]

const COMPONENTS = [
    LoadingSpinerComponent,
    CarouselImagesComponent,
    CardServiceComponent,
    PaymentReservationModalComponent,
    TreeViewComponent,
    ImageCropperUploadComponent,
    UserTreeDetailComponent,
    PaymentProductsModalComponent,
    DelayedInputDirective,
    TablePaymentProductOrderComponent,
    PaymentViewVoucherModalComponent,
    CardImageComponent,
    CardTestimonialsComponent,
    PaymentOfflineEfectivoComponent
]

@NgModule({
    exports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        HttpClientJsonpModule,
        ...MODULES,
        SearchPipe,
        ...COMPONENTS,

    ],
    imports: [
        GooglePlaceModule,
        CommonModule,
        RouterModule,
        FormsModule,
        ...MODULES,
        PerfectScrollbarModule,

    ],
    declarations: [
        SearchPipe,
        ...COMPONENTS
    ],
    providers: [

    ]
})

export class SharedModule { }
