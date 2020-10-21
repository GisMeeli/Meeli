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

  addingUser = false


  constructor(private dialogRef: MatDialogRef<CreateGroupComponent>, private groupsService: GroupsService) { }

  ngOnInit(): void {
  }

  addUser(){
    this.addingUser = false
  }
  
  onNoClick(){
    this.dialogRef.close()
  }

  onYesClick(){
    console.log("holis")
  }

}
