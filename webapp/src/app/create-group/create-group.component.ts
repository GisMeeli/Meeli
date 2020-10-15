import { Component, OnInit } from '@angular/core';

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


  constructor() { }

  ngOnInit(): void {
  }

  addUser(){
    this.addingUser = false
  }

}
