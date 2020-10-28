import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject, WebSocketSubjectConfig } from 'rxjs/webSocket';
import { EMPTY, Subject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { WS_URL } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  constructor() {
  }

  connect(token): {messagesSubject: Subject<any>, socket: WebSocketSubject<any>} {
    let messagesSubject = new Subject()
    let socket = this.newWebSocket(token)
    const messages = socket.pipe(
      tap({
        error: error => console.log(error),
      }), catchError(_ => EMPTY));
    messagesSubject.next(messages);
    let returned = {messagesSubject, socket}
    return returned
  }

  private newWebSocket(token) {
    let wsConfig: WebSocketSubjectConfig<any> =
    {
      protocol: "meeli",
      url: `${WS_URL}/${token}`
    };
    return webSocket(wsConfig);
  }

  // sendMessage(msg: Object) {
  //   //this.socket.next(msg);
  // }

  // close() {
  //   //this.socket.complete();
  // }
}
