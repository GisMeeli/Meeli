import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_URL } from "src/environments/environment"
@Injectable({
  providedIn: 'root'
})
export class GroupsService {

  constructor(
    private http: HttpClient
  ) { }

  groups = []

  createGroup(group){
    return this.http.post(`${API_URL}/groups`, group);
  }

  getGroupByHashtag(hashtag){
    console.log(`${API_URL}/groups/`+hashtag)
    return this.http.get(`${API_URL}/groups/${hashtag}`);
  }

  createCollaborator(collaborator, hashtag){
    //console.log(`${API_URL}/groups/${hashtag}/collaborators` + " " + collaborator)
    return this.http.post(`${API_URL}/groups/${hashtag}/collaborators`, collaborator);
  }

  getCollaboratorByHashtag(hashtag){
    //console.log("Peticion a " + `${API_URL}/groups/${hashtag}/collaborators`)
    return this.http.get(`${API_URL}/groups/${hashtag}/collaborators`);
  }

  getLoginUser(role, key, hashtag){
    var config = {
      role: role,
      key: key
    }
    return this.http.post(`${API_URL}/groups/${hashtag}/login`, config);
  }

  deleteCollaborator(hashtag, id){
    console.log(`${API_URL}/groups/${hashtag}/collaborators/${id}`)
    return this.http.delete(`${API_URL}/groups/${hashtag}/collaborators/${id}`);
  }

}
