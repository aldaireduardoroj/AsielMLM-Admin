import { Routes } from '@angular/router';
import { ContactComponent } from 'src/app/pages/web/contact/contact.component';
import { GuestComponent } from 'src/app/pages/web/guest/guest.component';
import { HomeComponent } from 'src/app/pages/web/home/home.component';
import { MyReservationsComponent } from 'src/app/pages/web/my-reservations/my-reservations.component';
import { ServicesComponent } from 'src/app/pages/web/services/services.component';
import { StylistsComponent } from 'src/app/pages/web/stylists/stylists.component';

export const WebLayout_ROUTES: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    {
        path: 'home',
        component: HomeComponent
    }
];
