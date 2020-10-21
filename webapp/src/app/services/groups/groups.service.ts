import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GroupsService {

  constructor(
    private http: HttpClient
  ) { }

  async createGroup(hastag, name, description, adminKey, category){
    
  }
}
