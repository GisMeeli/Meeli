import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, map, tap } from 'rxjs/operators';
import { WebSocketSubject } from 'rxjs/webSocket';
import { DialogService } from '../services/dialog/dialog.service';
import { WebsocketService } from '../services/websocket/websocket.service';

import { GroupsService } from '../services/groups/groups.service';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import GeolocationUtils from '../utils/geolocation.utils';

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

  loading = false

  collabSockets = []

  interval = undefined

  mobileShowGroups = false

  constructor(
    private dialogService: DialogService,
    private webSocketService: WebsocketService,
    private router: Router,
    private route: ActivatedRoute,
    public groupsService: GroupsService,
    private toastr: ToastrService

  ) {
    this.route.queryParams
      .subscribe(params => {
        if (params.manage)
          this.collabOnGroup = params.manage
        else
          this.collabOnGroup = undefined
      }
      );
  }

  ngOnInit(): void {
    console.log(this.groupsService.groups)
  }

  changeSelectedRol(value) {
    this.selectedRol = value
  }

  get disabledSeeGroup() {
    return this.groupHash == ""
  }

  addGroup() {
    this.loading = true
    //this.groups.push({hash, role: this.selectedRol, visible: true})
    console.log(this.groupHash)

    if (this.selectedRol == 0) {
      this.groupsService.getGroupByHashtag(this.groupHash).subscribe(
        data => {
          this.toastr.success(`El grupo #${this.groupHash} se puede ver en este momento`)
          this.groupsService.groups.push({ hashtag: data['hashtag'], role: this.selectedRol, visible: true })
          this.loading = false;
        },
        error => {
          console.log(error);
          if(error.status == 404){
            this.toastr.error(`El grupo con hashtag #${this.groupHash} no existe`)
          }
          else{
            this.toastr.error(`Ha ocurrido un error inesperado al cargar el grupo`)
          }
          this.loading = false;
        }
      );
    }
    else {
      this.groupsService.getLoginUser(this.selectedRol, this.groupCode, this.groupHash).subscribe(
        data => {
          this.toastr.success(`El grupo #${this.groupHash} se puede ver en este momento`)
          this.groupsService.groups.push({ name: data['name'], token: data['token'], hashtag: this.groupHash, role: this.selectedRol, visible: true })
          if(this.selectedRol == 2){
            this.collabSockets.push({...this.webSocketService.connect(data['token']), group: this.groupHash})
            this.refreshInverval()
          }
          this.loading = false;
        },
        error => {
          console.log(error);
          if(error.status == 404){
            this.toastr.error(`El grupo con hashtag #${this.groupHash} no existe`)
          }
          else if(error.status == 401){
            this.toastr.error(`El código para ingresar al grupo #${this.groupHash} es inválido`)
          }
          else{
            this.toastr.error(`Ha ocurrido un error inesperado al cargar el grupo`)
          }
          this.loading = false;
        }
      );
    }
    console.log(this.groupsService.groups)
    this.addingNew = false
  }

  toogleVisibility(group) {
    group.visible = !group.visible
  }

  administrarGrupo(hashtag) {
    let dialog = this.dialogService.adminGroupDialog(hashtag)
  }

  createGroup() {
    let dialog = this.dialogService.createGroupDialog(1)
  }

  manageGroup(group) {
    this.router.navigate(["mail"], { queryParams: { manage: group.hashtag } })
  }

  sendMessage(message) {
    console.log(message)
  }

  async sendCollaboratorInfo(){
    let currentLocation : any = await GeolocationUtils.getCurrentLocation()
    this.collabSockets.forEach((e: {messagesSubject: Subject<any>, socket: WebSocketSubject<any>, hashtag: string}) => {
      e.socket.next({action: 1, data: {lat: currentLocation.lat, lon: currentLocation.lng}})
      e.socket.asObservable().subscribe(response => {
        console.log(response)
      })
    })
  }

  refreshInverval(){
    if(this.interval != undefined){
      clearInterval(this.interval)
    }
    this.interval = setInterval(this.sendCollaboratorInfo.bind(this), 5000)
  }

}
