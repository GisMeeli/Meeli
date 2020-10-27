import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, map, tap } from 'rxjs/operators';
import { WebSocketSubject } from 'rxjs/webSocket';
import { DialogService } from '../services/dialog/dialog.service';
import { WebsocketService } from '../services/websocket/websocket.service';

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

  groups = []

  addingNew = false

  constructor(
    private dialogService: DialogService,
      private webSocket: WebsocketService,
      private router: Router,
      private route: ActivatedRoute
      
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

  addGroup(hashtag){
    this.groups.push({hashtag, role: this.selectedRol, visible: true})
    this.addingNew = false
  }

  toogleVisibility(group){
    group.visible = !group.visible
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

  

}
