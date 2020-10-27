import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, map, tap } from 'rxjs/operators';
import { WebSocketSubject } from 'rxjs/webSocket';
import { DialogService } from '../services/dialog/dialog.service';
import { WebsocketService } from '../services/websocket/websocket.service';

import { GroupsService } from '../services/groups/groups.service';
import { AdmiGroupService } from '../services/admiGroup/admi-group.service'
@Component({
  selector: 'app-mail',
  templateUrl: './mail.component.html',
  styleUrls: ['./mail.component.scss']
})
export class MailComponent implements OnInit {

  collabOnGroup = undefined

  selectedRol = 0

  groupHash = ""

  groupCode = ""

  groupCodeModify = ""


  addingNew = false

  constructor(
    private dialogService: DialogService,
      private webSocket: WebsocketService,
      private router: Router,
      private route: ActivatedRoute,
      public groupsService: GroupsService,
      private admiService: AdmiGroupService
      
    ){
      this.route.queryParams
      .subscribe(params => {
        if(params.manage)
          this.collabOnGroup = params.manage
        else 
          this.collabOnGroup = undefined
      }
    );
      this.webSocket.connect();
      this.webSocket.sendMessage({action:1, data:{lat:5.3,lon:4.6}})
      this.webSocket.messages.subscribe((m) => console.log(m))
    }
  
    



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

  toogleVisibility(group){
    //group.visible = !group.visible
  }

  administrarGrupo(hashtag) {
    this.admiService.hashtagAdmi = hashtag
    let dialog = this.admiService.adminGroupDialog()
  }

  createGroup(){
    let dialog = this.dialogService.createGroupDialog()
  }

  manageGroup(group){
    this.router.navigate(["mail"], {queryParams: {manage: group.hashtag}})
  }

  sendMessage(message){
    console.log(message)
  }

  

  getGroup(){
    console.log(JSON.stringify(this.groupHash))
    /*this.groupsService.createGroup(this.groupHash).subscribe(
      data => {
        console.log(JSON.stringify(data))
      },
      error => {
        console.log('Error en la consulta');
      }
    );*/
  }

}
