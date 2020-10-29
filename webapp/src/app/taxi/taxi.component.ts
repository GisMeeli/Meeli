import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogService } from '../services/dialog/dialog.service';
import { WebsocketService } from '../services/websocket/websocket.service';
import { GroupsService } from '../services/groups/groups.service';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { WebSocketSubject } from 'rxjs/webSocket';
import GeolocationUtils from '../utils/geolocation.utils';

@Component({
  selector: 'app-taxi',
  templateUrl: './taxi.component.html',
  styleUrls: ['./taxi.component.scss']
})
export class TaxiComponent implements OnInit, OnDestroy {
  mobileShowGroups = false

  selectedRol = 0

  groupHash = ""

  groupCode = ""

  groupCodeModify = ""

  addingNew = false

  loading = false

  collabSockets : {messagesSubject: Subject<any>, socket: WebSocketSubject<any>, hashtag: string}[] = []

  interval = undefined

  constructor(
    private dialogService: DialogService,
      private webSocketService: WebsocketService,
      public groupsService: GroupsService,
      private toastr: ToastrService,
    ){
    }


  ngOnDestroy(): void {
    this.collabSockets.forEach(
      (e: {messagesSubject: Subject<any>, socket: WebSocketSubject<any>, hashtag: string}) => e.socket.complete()
    )
  }
    



  ngOnInit(): void {
    // document.addEventListener("visibilitychange", (() => {
    //   if (document.visibilityState === 'visible') {
    //     this.refreshInverval()
    //   } else {
    //     this.stopInterval();
    //   }
    // }).bind(this));
  }

  changeSelectedRol(value){
    this.selectedRol = value
  }

  get disabledSeeGroup(){
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
          this.groupsService.groups.push({ name: data['name'], token: data['token'], hashtag: this.groupHash, role: this.selectedRol, visible: true, is_available: true })
          if(this.selectedRol == 2){
            console.log("Se agrega")
            this.collabSockets.push({...this.webSocketService.connect(data['token']), hashtag: this.groupHash})
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

  administrarGrupo(hashtag) {
    let dialog = this.dialogService.adminGroupDialog(hashtag)
  }

  toogleVisibility(group){
    group.visible = !group.visible
  }

  createGroup(){
    let dialog = this.dialogService.createGroupDialog(2)
  }

  async sendCollaboratorInfo(){
    let currentLocation : any = await GeolocationUtils.getCurrentLocation()
    this.collabSockets.forEach((e: {messagesSubject: Subject<any>, socket: WebSocketSubject<any>, hashtag: string}) => {
      e.socket.next({action: 1, data: {lat: currentLocation.lat, lon: currentLocation.lng}})
      e.socket.asObservable().subscribe(response => {
        
      })
    })
  }

  toggleTrip(group){
    group.is_available = !group.is_available
    this.collabSockets.find(g => g.hashtag == group.hashtag).socket.next({
      action: 2,
      data: {
        isAvailable: group.is_available
      }
    })
  }

  refreshInverval(){
    if(this.interval != undefined){
      clearInterval(this.interval)
    }
    this.sendCollaboratorInfo()
    this.interval = setInterval(this.sendCollaboratorInfo.bind(this), 1000)
  }

  stopInterval(){
    if(this.interval)
      clearInterval(this.interval)
    this.interval = undefined;
  }

  closeGroup(group){
    this.groupsService.groups = this.groupsService.groups.filter(e => !(e == group))
    this.collabSockets = this.collabSockets.filter((e: {messagesSubject: Subject<any>, socket: WebSocketSubject<any>, hashtag: string}) => {
      if(e.hashtag == group.hashtag){
        e.socket.complete()
        return false
      }
      return true
    })
  }


}
