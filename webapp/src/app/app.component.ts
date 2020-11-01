import { Component } from '@angular/core';
import { catchError, map, tap } from 'rxjs/operators';
import { WebsocketService } from './services/websocket/websocket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'meeli';

  constructor(
    
  ){
    
  }
}
