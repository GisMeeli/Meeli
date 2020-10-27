import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupsService } from '../services/groups/groups.service';

@Component({
  selector: 'app-mail-collaborator',
  templateUrl: './mail-collaborator.component.html',
  styleUrls: ['./mail-collaborator.component.scss']
})
export class MailCollaboratorComponent implements OnInit {


  @Output()
  sendMessage = new EventEmitter();
  
  group = undefined

  hashtag = undefined

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private groupsService: GroupsService
  ) { 
    this.route.queryParams
      .subscribe(params => {
        if(params.manage){
          this.hashtag = params.manage
          this.refreshGroup();
        }
        else{
          this.group = undefined;
        }
      }
    );
  }

  ngOnInit(): void {

  }

  back(){
    this.router.navigate(["mail"])
    this.group = undefined
  }

  async refreshGroup(){
    const response = await this.groupsService.getGroup(this.hashtag)
    this.group = response
  }

  async sendMessageEvent(){
    this.sendMessage.emit({message: "Mensaje"})
  }

}
