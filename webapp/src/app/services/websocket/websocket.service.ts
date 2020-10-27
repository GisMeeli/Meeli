import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject, WebSocketSubjectConfig } from 'rxjs/webSocket';
import { EMPTY, Subject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { WS_URL } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  private messagesSubject
  private socket: WebSocketSubject<any>

  constructor() {
    this.messagesSubject = new Subject()
   }

  connect(): void {

    if (!this.socket || this.socket.closed) {
      this.socket = this.newWebSocket
      const messages = this.socket.pipe(
        tap({
          error: error => console.log(error),
        }), catchError(_ => EMPTY));
      this.messagesSubject.next(messages);
    }
  }

  private get newWebSocket() {
    let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXNzaW9uIjoiNGE4ZjhkNTEtMGUxNy00YTcxLWExZjYtNjI3MWEzN2QwMGYyIiwiaWF0IjoxNjAzNzY4NTUxLCJleHAiOjE2MDM4NTQ5NTF9.nUXe_mRFHv5H6gCquFl9t7exTi0OJht2g3gG-Dcv9nc"
    let wsConfig: WebSocketSubjectConfig<any> = 
    {
      protocol: "meeli", 
      url: `${WS_URL}/${token}`
    };
    return webSocket(wsConfig);
  }
  
  sendMessage(msg: Object) {
    this.socket.next(msg);
  }

  close() {
    this.socket.complete();
  }

  get messages(){
    return this.socket.asObservable()
  }
}
