import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { GroupsService } from '../services/groups/groups.service';

@Component({
  selector: 'app-create-group',
  templateUrl: './create-group.component.html',
  styleUrls: ['./create-group.component.scss']
})
export class CreateGroupComponent implements OnInit {

  columns = ["name", "accessCode", "actions"]

  users = [
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
  ]

  public group;
  public collaborator;
  addingUser = false


  constructor(private dialogRef: MatDialogRef<CreateGroupComponent>, private groupsService: GroupsService) { 
    this.group = {
      hashtag: '',
      name: '',
      description: '',
      adminKey: '',
      category: 1
    }
    this.collaborator = {
      name: '',
      key: '',
	    customAttributes: {
		    driverName: '',
		    vehiclePlate: '',
		    vehicleBrand: '',
		    vehicleModel: ''
	    }
    }
  }

  ngOnInit(): void {
  }

  addUser(){
    this.addingUser = false
    console.log(JSON.stringify(this.collaborator))
    this.groupsService.createCollaborator(this.collaborator, this.group.hashtag).subscribe(
      data => {
        this.users.push({name: data.valueOf()['name'], key: data.valueOf()['key']})
        console.log(JSON.stringify(data))
      },
      error => {
        console.log('Error en la consulta');
      }
    );
  }
  
  onNoClick(){
    this.dialogRef.close()
  }

  onYesClick(){
    console.log(JSON.stringify(this.group))
    this.groupsService.createGroup(this.group).subscribe(
      data => {
        console.log(JSON.stringify(data))
      },
      error => {
        console.log('Error en la consulta');
      }
    );
  }

}
