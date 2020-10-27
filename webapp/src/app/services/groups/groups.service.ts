import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_URL } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GroupsService {

  module = "groups"

  constructor(
    private http: HttpClient
  ) { }

  async getGroup(hashtag){
    return this.http.get(`${API_URL}/${this.module}/${hashtag}`).toPromise()
  }

  async createGroup(hastag, name, description, adminKey, category){
    
  }
}
