import { Component, OnInit } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { MultimediaVideoComponent } from '../multimedia-video/multimedia-video.component';

@Component({
  selector: 'app-multimedia-page',
  templateUrl: './multimedia-page.component.html',
  styleUrls: ['./multimedia-page.component.scss']
})
export class MultimediaPageComponent implements OnInit {

  constructor(
    private nzModalService: NzModalService
  ) { }

  ngOnInit(): void {
  }

  public onModalVideo(type: boolean = true): void{
    this.nzModalService.create({
      nzTitle: type ? "Subir Stories videos" : "Subir imágenes a carrusel",
      nzContent: MultimediaVideoComponent,
      nzFooter: null,
      nzComponentParams: {
        storyShow: type
      }
    })
  }
}
