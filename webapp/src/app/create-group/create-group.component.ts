import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { GroupsService } from '../services/groups/groups.service';

@Component({
  selector: 'app-create-group',
  templateUrl: './create-group.component.html',
  styleUrls: ['./create-group.component.scss']
})
export class CreateGroupComponent implements OnInit {

  public group;


  constructor(
    private dialogRef: MatDialogRef<CreateGroupComponent>, 
    private groupsService: GroupsService,
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public category: Number) { 
    this.group = {
      hashtag: '',
      name: '',
      description: '',
      adminKey: '',
      category: this.category
    }
  }

  ngOnInit(): void {
  }
  
  onNoClick(){
    this.dialogRef.close()
  }

  onYesClick(){
    console.log(this.group)
    this.groupsService.createGroup(this.group).subscribe(
      data => {
        console.log(data)
        this.dialogRef.close(data)
        this.toastr.success(`Se ha creado el grupo ${this.group.hashtag}`)
      },
      error => {
        console.log(error);
        this.toastr.error(`Ha ocurrido un error al crear el grupo ${this.group.hashtag}`)
      }
    );
  }

}
