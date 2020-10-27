import { Component, OnInit } from '@angular/core';
import { AdmiGroupService } from '../services/admiGroup/admi-group.service';
import { DialogService } from '../services/dialog/dialog.service';
import { GroupsService } from '../services/groups/groups.service';

@Component({
  selector: 'app-taxi',
  templateUrl: './taxi.component.html',
  styleUrls: ['./taxi.component.scss']
})
export class TaxiComponent implements OnInit {

  selectedRol = 0

  groupHash = ""

  groupCode = ""

  groupCodeModify = ""

  addingNew = false

  constructor(
    private dialogService: DialogService,
    public groupsService: GroupsService,
    private admiService: AdmiGroupService
  ) { }


  ngOnInit(): void {
    /*this.addGroup("observ")
    this.selectedRol = 1
    this.addGroup("gestor")
    this.selectedRol = 2
    this.addGroup("admin")
    this.selectedRol = 0*/
    console.log(this.groupsService.groups)
  }

  changeSelectedRol(value){
    this.selectedRol = value
  }

  get disabledSeeGroup(){
    return this.groupHash == ""
  }

  addGroup(hash){
    //this.groups.push({hash, role: this.selectedRol, visible: true})
    console.log(this.groupHash)

    if (this.selectedRol == 0) {
      this.groupsService.getGroupByHashtag(this.groupHash).subscribe(
        data => {
          console.log("OBSERVADOR")
          this.groupsService.groups.push({hashtag: data['hashtag'], role: this.selectedRol, visible: true})
        },
        error => {
          console.log('Error en la consulta');
        }
      );
    }
    if (this.selectedRol == 1) {
      this.groupsService.getLoginUser(this.selectedRol, this.groupCode, this.groupHash).subscribe(
        data => {
          console.log("ADMIN")
          this.groupsService.groups.push({name: data['name'], token: data['token'], hashtag: this.groupHash, role: this.selectedRol, visible: true})
        },
        error => {
          console.log('Error en la consulta');
        }
      );
    }
    if (this.selectedRol == 2) {
      this.groupsService.getLoginUser(this.selectedRol, this.groupCode, this.groupHash).subscribe(
        data => {
          console.log("GESTOR")
          this.groupsService.groups.push({name: data['name'], token: data['token'], hashtag: this.groupHash, role: this.selectedRol, visible: true})
        },
        error => {
          console.log('Error en la consulta');
        }
      );  
    }
    console.log(this.groupsService.groups)
    this.addingNew = false
  }

  administrarGrupo(hashtag) {
    this.admiService.hashtagAdmi = hashtag
    let dialog = this.admiService.adminGroupDialog()
  }

  toogleVisibility(group){
    group.visible = !group.visible
  }

  createGroup(){
    let dialog = this.dialogService.createGroupDialog()
  }

}
