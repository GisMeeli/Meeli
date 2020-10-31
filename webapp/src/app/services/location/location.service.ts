import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_URL } from 'src/environments/environment';

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
