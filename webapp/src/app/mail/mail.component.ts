import { Component, OnInit } from '@angular/core';
import { DialogService } from '../services/dialog/dialog.service';

@Component({
  selector: 'app-mail',
  templateUrl: './mail.component.html',
  styleUrls: ['./mail.component.scss']
})
export class MailComponent implements OnInit {

  selectedRol = 0

  groupHash = ""

  groupCode = ""

  groups = []

  addingNew = false

  constructor(
    private dialogService: DialogService
  ) { }


  ngOnInit(): void {
    this.addGroup("observ")
    this.selectedRol = 1
    this.addGroup("gestor")
    this.selectedRol = 2
    this.addGroup("admin")
    this.selectedRol = 0
    console.log(this.groups)
  }

  changeSelectedRol(value){
    this.selectedRol = value
  }

  get disabledSeeGroup(){
    return this.groupHash == ""
  }

  addGroup(hash){
    this.groups.push({hash, role: this.selectedRol, visible: true})
    this.addingNew = false
  }

  toogleVisibility(group){
    group.visible = !group.visible
  }

  createGroup(){
    let dialog = this.dialogService.createGroupDialog()
  }

}
