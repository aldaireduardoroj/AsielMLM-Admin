import { Component, OnInit } from '@angular/core';

import { getProfileName, getUserId, saveLocalCompanies } from '@shared/utilities/functions';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
})

export class DashboardComponent implements OnInit {

    userModel: any = {};

    profileName: string = getProfileName();;

    constructor(
        
    ) { }

    ngOnInit(): void {
        
    }

    getUserCurrent(): void {
        

        
    }

    
}
