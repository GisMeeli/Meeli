import { Component, OnInit } from '@angular/core';
import { AdmiGroupService } from '../services/admiGroup/admi-group.service';
import { GroupsService } from '../services/groups/groups.service';
import {FormControl} from '@angular/forms';
import { MatListOption } from '@angular/material/list'

@Component({
  selector: 'app-admin-group',
  templateUrl: './admin-group.component.html',
  styleUrls: ['./admin-group.component.scss']
})
export class AdminGroupComponent implements OnInit {
  
  columns = ["name", "accessCode", "actions"]
  addingUser = false

  public users; //[
    // {name: "Nombre 1", accessCode: "estecode"},
    // {name: "Nombre 2", accessCode: "estecode"},
    // {name: "Nombre 3", accessCode: "estecode"},
    // {name: "Nombre 4", accessCode: "estecode"},
    // {name: "Nombre 5", accessCode: "estecode"},
    // {name: "Nombre 6", accessCode: "estecode"},
    // {name: "Nombre 6", accessCode: "estecode"},
    // {name: "Nombre 6", accessCode: "estecode"},
    // {name: "Nombre 6", accessCode: "estecode"},
    // {name: "Nombre 6", accessCode: "estecode"},
    // {name: "Nombre 6", accessCode: "estecode"},
    // {name: "Nombre 6", accessCode: "estecode"},
    // {name: "Nombre 6", accessCode: "estecode"},
    // {name: "Nombre 6", accessCode: "estecode"},
    // {name: "Nombre 6", accessCode: "estecode"},
    // {name: "Nombre 6", accessCode: "estecode"},
    // {name: "Nombre 6", accessCode: "estecode"},
    // {name: "Nombre 6", accessCode: "estecode"},
  //]

  public collaborator;
  public hashtag;
  public listaGestores;
  gestoresEliminar = []
  disableSelect = new FormControl(true);

  constructor(private admiService: AdmiGroupService, private groupsService: GroupsService) { 
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
    this.hashtag = admiService.hashtagAdmi
    this.cargarListaGestores()
    
  }

  ngOnInit(): void {
  }

  addUser(){
    
    this.addingUser = false
    this.groupsService.createCollaborator(this.collaborator, this.hashtag).subscribe(
      data => {
        //this.users.push({name: data.valueOf()['name'], accessCode: data.valueOf()['key']})
        console.log(JSON.stringify(data))
        this.cargarListaGestores()
      },
      error => {
        console.log('Error en la consulta');
      }
    );
    console.log("USUARIOS" ,this.users)
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
    //console.log("Lista completa>" + this.users)
    //console.log("Lista elemntos a eliminar>" + this.gestoresEliminar)
    this.gestoresEliminar.map(gestor => {
      this.groupsService.deleteCollaborator(this.admiService.hashtagAdmi, gestor.id).subscribe(
        result => {
          console.log(result)
          this.cargarListaGestores()
          this.disableSelect.setValue(true);
        },
        error => {
          console.log('Error en la consulta');
        }
      );
    })
  }

}
