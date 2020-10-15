import { Injectable } from '@angular/core';
import { MatDialogConfig } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { CreateGroupComponent } from 'src/app/create-group/create-group.component';


@Injectable({
  providedIn: 'root'
})
export class DialogService {

  constructor(public dialog: MatDialog) { }

  createGroupDialog(){
    let config : MatDialogConfig = {}

    config.maxHeight = "90vh"
    config.minWidth = "50vw"

    return this.dialog.open(CreateGroupComponent, config)
  }
}
