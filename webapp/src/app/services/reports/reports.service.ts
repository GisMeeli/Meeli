import { DataSource } from '@angular/cdk/table';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { API_URL } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {

  module = "meeli/reports"

  constructor(
    private http: HttpClient
  ) { }

  getReports(category: 'taxi' | 'mail', hashtag: string, collaborator: string, from: string, to: string) : Promise<any>{
    const params: any = { category }
    hashtag != undefined? params.hashtag = hashtag : null;
    collaborator != undefined? params.collaborator = collaborator : null;
    from != undefined? params.from = from : null;
    to != undefined? params.to = to : null;
    
    return this.http.get(`${API_URL}/${this.module}`, {params}).toPromise()
  }
}
