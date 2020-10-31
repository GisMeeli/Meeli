import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, map, tap } from 'rxjs/operators';
import { WebSocketSubject } from 'rxjs/webSocket';
import { DialogService } from '../services/dialog/dialog.service';
import { WebsocketService } from '../services/websocket/websocket.service';

import { GroupsService } from '../services/groups/groups.service';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import GeolocationUtils from '../utils/geolocation.utils';
import { LocationService } from '../services/location/location.service';

@Component({
  selector: 'app-mail',
  templateUrl: './mail.component.html',
  styleUrls: ['./mail.component.scss']
})
export class MailComponent implements OnInit, OnDestroy {

  // Variable que ayuda a que sea responsive, si está activa muestra la ventana de grupos
  mobileShowGroups = false

  // Rol seleccionado (0 Observador, 1 Admin, 2 Gestor)
  selectedRol = 0

  // Grupo que se está añadiendo para verlo (input)
  groupHash = ""

  // Código o contraseña del grupo que se está añadiendo (input)
  groupCode = ""

  // Si está o no abierta la ventana de ver un nuevo grupo
  addingNew = false

  // Si es true muestra el progress spinner
  loading = false

  // Conexiones a sockets por cada uno de los grupos que se están gestionando
  collabSockets: { messagesSubject: Subject<any>, socket: WebSocketSubject<any>, hashtag: string }[] = []

  // Variable que guarda el número de interval que envía la info al gestor cada 1s
  interval = undefined

  // Guarda la provincia, cantón y distrito donde se ubica el usuario
  whereAmI = undefined

  constructor(
    private dialogService: DialogService,
    private webSocketService: WebsocketService,
    public groupsService: GroupsService,
    private toastr: ToastrService,
    private locationService: LocationService
  ) {
  }

  ngOnInit(): void {
    this.refreshWhereAmI()
  }

  ngOnDestroy(): void {
    //Cierra todas las conexiones de los ws
    this.collabSockets.forEach(
      (e: { messagesSubject: Subject<any>, socket: WebSocketSubject<any>, hashtag: string }) => e.socket.complete()
    )
  }

  //Cambia el rol seleccionado
  changeSelectedRol(value) {
    this.selectedRol = value
  }

  //Obtiene si el botón de ver grupo debería estar deshabilitado
  get disabledSeeGroup() {
    return this.groupHash == ""
  }

  // Añade un grupo a los grupos visibles
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
          if (error.status == 404) {
            this.toastr.error(`El grupo con hashtag #${this.groupHash} no existe`)
          }
          else {
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
          if (this.selectedRol == 2) {
            this.collabSockets.push({ ...this.webSocketService.connect(data['token']), hashtag: this.groupHash })
            this.refreshInverval()
          }
          this.loading = false;
        },
        error => {
          console.log(error);
          if (error.status == 404) {
            this.toastr.error(`El grupo con hashtag #${this.groupHash} no existe`)
          }
          else if (error.status == 401) {
            this.toastr.error(`El código para ingresar al grupo #${this.groupHash} es inválido`)
          }
          else {
            this.toastr.error(`Ha ocurrido un error inesperado al cargar el grupo`)
          }
          this.loading = false;
        }
      );
    }
    console.log(this.groupsService.groups)
    this.addingNew = false
  }

  //Abre un dialog para administrar el grupo
  administrarGrupo(hashtag) {
    let dialog = this.dialogService.adminGroupDialog(hashtag)
  }

  // Cambia la visibilidad del grupo en el mapa
  toogleVisibility(group) {
    group.visible = !group.visible
  }

  // Abre un dialog para crear un grupo
  createGroup() {
    let dialog = this.dialogService.createGroupDialog(1)
  }

  // Envía información sobre el gestor, para que se actualice su posición en el mapa
  async sendCollaboratorInfo() {
    let currentLocation: any = await GeolocationUtils.getCurrentLocation()
    this.collabSockets.forEach((e: { messagesSubject: Subject<any>, socket: WebSocketSubject<any>, hashtag: string }) => {
      e.socket.next({ action: 1, data: { lat: currentLocation.lat, lon: currentLocation.lng } })
      e.socket.asObservable().subscribe(response => {
        console.debug(response)
      })
    })
  }

  // Crea un nuevo interval si no existe o renueva el existente
  refreshInverval() {
    if (this.interval != undefined) {
      clearInterval(this.interval)
    }
    this.interval = setInterval(this.sendCollaboratorInfo.bind(this), 1000)
  }

  // Hace que un grupo se elimine de la lista de grupos que estoy viendo, si tuviese conexiones de gestor, las cierra
  closeGroup(group) {
    this.groupsService.groups = this.groupsService.groups.filter(e => !(e == group))
    this.collabSockets = this.collabSockets.filter((e: { messagesSubject: Subject<any>, socket: WebSocketSubject<any>, hashtag: string }) => {
      if (e.hashtag == group.hashtag) {
        e.socket.complete()
        return false
      }
      return true
    })
  }

  // Determina que el siguiente punto marcará una entrega
  delivery(group) {
    this.collabSockets.find(g => g.hashtag == group.hashtag).socket.next({
      action: 2,
      data: {
        newDelivery: true
      }
    })
  }

  // Refresca la variable whereAmI, trayendo la info de la db
  refreshWhereAmI() {
    GeolocationUtils.getCurrentLocation().then(
      (myLocation: any) => {
        this.locationService.whereAmI(myLocation.lat, myLocation.lng).then((value) => {
          console.log(value)
          this.whereAmI = value;
        })
      }
    )
  }

  verEstadisticas(){
    let dialog = this.dialogService.mailStatisticsDialog();
  }
}
