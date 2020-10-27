import { Injectable } from '@angular/core';
import { MatDialogConfig } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { AdminGroupComponent } from 'src/app/admin-group/admin-group.component';

@Injectable({
  providedIn: 'root'
})
export class AdmiGroupService {

  constructor(public dialog: MatDialog) { }

  public hashtagAdmi;

  adminGroupDialog(){
    let config : MatDialogConfig = {}

    config.maxHeight = "100vh"
    config.minWidth = "50vw"

    return this.dialog.open(AdminGroupComponent, config)
  }

}
