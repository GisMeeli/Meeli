import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_URL } from 'src/environments/environment';

/* 
  Otiene la provincia, cantón y distrito donde se ubica cierta lat y lng
*/


@Injectable({
  providedIn: 'root'
})
export class LocationService {

  module = "meeli/where-am-i"

  constructor(
    private http: HttpClient
  ) { }

  whereAmI(lat, lng){
    const params = {lat, lon: lng}
    return this.http.get(`${API_URL}/${this.module}`, {params}).toPromise()
  }
}
