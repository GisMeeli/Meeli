import { Component, Inject, OnInit } from '@angular/core';
import { GroupsService } from '../services/groups/groups.service';
import {FormControl} from '@angular/forms';
import { MatListOption } from '@angular/material/list'
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-admin-group',
  templateUrl: './admin-group.component.html',
  styleUrls: ['./admin-group.component.scss']
})
export class AdminGroupComponent implements OnInit {
  
  addingUser = false

  public users;

  public collaborator;
  public listaGestores;
  gestoresEliminar = []
  disableSelect = new FormControl(true);

  constructor(
    private groupsService: GroupsService,
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public hashtag: String) { 
    this.collaborator = {
      name: '',
      key: '',
	    customAttributes: {
		    driverName: '',
		    vehiclePlate: '',
		    vehicleBrand: '',
		    vehicleModel: ''
	    }
    },
    this.users = {
      id: '',
      group: '',
      name: '',
      key: '',
      creation: ''
    }
    this.cargarListaGestores()
    
  }

  ngOnInit(): void {
  }

  addUser(){
    
    this.addingUser = false
    this.groupsService.createCollaborator(this.collaborator, this.hashtag).subscribe(
      data => {
        //this.users.push({name: data.valueOf()['name'], accessCode: data.valueOf()['key']})
        this.toastr.success("Se ha agregado el usuario")
        this.cargarListaGestores()
      },
      error => {
        console.log(error);
        this.toastr.error("Ha ocurrido un error al agregar el gestor")
        
      }
    );
  }

  cargarListaGestores() {
    this.users = []
    this.groupsService.getCollaboratorByHashtag(this.hashtag).subscribe(result => {
      this.users = result;
    })
  }

  onGroupsChange(options: MatListOption[]) {
    // map these MatListOptions to their values
    this.gestoresEliminar = options.map(o => o.value)
    if (this.gestoresEliminar.length > 0) {
      this.disableSelect.setValue(false);
    }
    else {
      this.disableSelect.setValue(true);
    }
    console.log(this.gestoresEliminar)
  }

  eliminarGestor(){
    this.gestoresEliminar.map(gestor => {
      this.groupsService.deleteCollaborator(this.hashtag, gestor.id).subscribe(
        result => {
          console.log(result)
          this.toastr.success(`Se ha eliminado el gestor ${gestor.name}`)
          this.cargarListaGestores()
          this.disableSelect.setValue(true);
        },
        error => {
          console.log(error);
          this.toastr.error(`Error al eliminar el gestor ${gestor.name}`)
        }
      );
    })
  }

}
