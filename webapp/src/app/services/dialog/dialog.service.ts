import { Injectable } from '@angular/core';
import { MatDialogConfig } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { AdminGroupComponent } from 'src/app/admin-group/admin-group.component';
import { CreateGroupComponent } from 'src/app/create-group/create-group.component';
import { MailStatisticsComponent } from 'src/app/mail-statistics/mail-statistics.component';
import { TaxiStatisticsComponent } from 'src/app/taxi-statistics/taxi-statistics.component';

/* 
  Funciona para llamar a los dialogs de manera más fácil
*/
@Injectable({
  providedIn: 'root'
})
export class DialogService {

  constructor(public dialog: MatDialog) { }

  createGroupDialog(category: Number){
    let config : MatDialogConfig = {}

    config.maxHeight = "90vh"
    config.minWidth = "50vw"
    config.data = category

    return this.dialog.open(CreateGroupComponent, config)
  }

  adminGroupDialog(hashtag){
    let config : MatDialogConfig = {}

    config.maxHeight = "100vh"
    config.minWidth = "50vw"
    config.data = hashtag

    return this.dialog.open(AdminGroupComponent, config)
  }

  taxiStatisticsDialog(){
    let config : MatDialogConfig = {}

    config.maxHeight = "80vh"
    config.minWidth = "70vw"

    return this.dialog.open(TaxiStatisticsComponent, config)
  }

  mailStatisticsDialog(){
    let config : MatDialogConfig = {}

    config.maxHeight = "80vh"
    config.minWidth = "70vw"

    return this.dialog.open(MailStatisticsComponent, config)
  }
}
