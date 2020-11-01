import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_URL } from "src/environments/environment"


/* 
  Servicio para obtener información, crear y verificar el ingreso de grupos
*/


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
    
  groups = []

  // Envia al backend los datos de un grupo para ser creado
  createGroup(group){
    return this.http.post(`${API_URL}/groups`, group);
  }

  // Obtiene del backend un grupo a partir de un hashtag
  getGroupByHashtag(hashtag){
    console.log(`${API_URL}/groups/`+hashtag)
    return this.http.get(`${API_URL}/groups/${hashtag}`);
  }

  // Envia al backend los datos de un gestor para ser creado y asignado a un grupo
  createCollaborator(collaborator, hashtag){
    //console.log(`${API_URL}/groups/${hashtag}/collaborators` + " " + collaborator)
    return this.http.post(`${API_URL}/groups/${hashtag}/collaborators`, collaborator);
  }

  // Obtiene un gestor del backend a partir de un hashtag enviado
  getCollaboratorByHashtag(hashtag){
    //console.log("Peticion a " + `${API_URL}/groups/${hashtag}/collaborators`)
    return this.http.get(`${API_URL}/groups/${hashtag}/collaborators`);
  }

  // Realiza el logueo con un hashtag y una contraseña dependiendo del rol, ya sea gestor o administrador
  getLoginUser(role, key, hashtag){
    var config = {
      role: role,
      key: key
    }
    return this.http.post(`${API_URL}/groups/${hashtag}/login`, config);
  }

  // Envia un gestor al backend para ser eliminado 
  deleteCollaborator(hashtag, id){
    console.log(`${API_URL}/groups/${hashtag}/collaborators/${id}`)
    return this.http.delete(`${API_URL}/groups/${hashtag}/collaborators/${id}`);
  }

  // Obtiene todas las rutas y gestores de un hashtag
  getTaxiStatistics(category, hashtag) {
    return this.http.get(`${API_URL}/meeli/reports?category=${category}&hashtag=${hashtag}`);
  }

  // Obtiene todas las rutas y gestores de un hashtag en una fecha seleccionada
  getTaxiStatisticsByDate(category, hashtag, date) {
    return this.http.get(`${API_URL}/meeli/reports?category=${category}&hashtag=${hashtag}&from=${date}T00:00:00&to=${date}T24:00:00`);
  }

}
