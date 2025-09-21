import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MultimediaPageComponent } from './multimedia-page/multimedia-page.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { MultimediaVideoComponent } from './multimedia-video/multimedia-video.component';
import { MultimediaImageComponent } from './multimedia-image/multimedia-image.component';

const routes: Routes = [
  {
      path: '',
      component: MultimediaPageComponent,
      data: {
          title: 'Multimedia ',
          headerDisplay: "none"
      }
  }
];

@NgModule({
  declarations: [
    MultimediaPageComponent,
    MultimediaVideoComponent,
    MultimediaImageComponent
  ],
  imports: [
    SharedModule,
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports:[RouterModule]
})
export class MultimediaModule { }
