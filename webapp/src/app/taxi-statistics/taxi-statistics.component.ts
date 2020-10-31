import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { GroupsService } from '../services/groups/groups.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-taxi-statistics',
  templateUrl: './taxi-statistics.component.html',
  styleUrls: ['./taxi-statistics.component.scss']
})
export class TaxiStatisticsComponent implements OnInit {

  gestores = [

    /*{driver_name: "Brandon Cruz", ride_count: 34, metters: 38330, vehicle_brand: "Toyota Corolla", vehicle_model: "2007", vehicle_plate: "908-FAW"},
    {driver_name: "Brandon Cruz", ride_count: 34, metters: 38330, vehicle_brand: "Toyota Corolla", vehicle_model: "2007", vehicle_plate: "908-FAW"},
    {driver_name: "Brandon Cruz", ride_count: 34, metters: 38330, vehicle_brand: "Toyota Corolla", vehicle_model: "2007", vehicle_plate: "908-FAW"},
    {driver_name: "Brandon Cruz", ride_count: 34, metters: 38330, vehicle_brand: "Toyota Corolla", vehicle_model: "2007", vehicle_plate: "908-FAW"},
    {driver_name: "Brandon Cruz", ride_count: 34, metters: 38330, vehicle_brand: "Toyota Corolla", vehicle_model: "2007", vehicle_plate: "908-FAW"},
    {driver_name: "Brandon Cruz", ride_count: 34, metters: 38330, vehicle_brand: "Toyota Corolla", vehicle_model: "2007", vehicle_plate: "908-FAW"},
    {driver_name: "Brandon Cruz", ride_count: 34, metters: 38330, vehicle_brand: "Toyota Corolla", vehicle_model: "2007", vehicle_plate: "908-FAW"},
    {driver_name: "Brandon Cruz", ride_count: 34, metters: 38330, vehicle_brand: "Toyota Corolla", vehicle_model: "2007", vehicle_plate: "908-FAW"},
    {driver_name: "Brandon Cruz", ride_count: 34, metters: 38330, vehicle_brand: "Toyota Corolla", vehicle_model: "2007", vehicle_plate: "908-FAW"},
    {driver_name: "Brandon Cruz", ride_count: 34, metters: 38330, vehicle_brand: "Toyota Corolla", vehicle_model: "2007", vehicle_plate: "908-FAW"},
    {driver_name: "Brandon Cruz", ride_count: 34, metters: 38330, vehicle_brand: "Toyota Corolla", vehicle_model: "2007", vehicle_plate: "908-FAW"},
    {driver_name: "Brandon Cruz", ride_count: 34, metters: 38330, vehicle_brand: "Toyota Corolla", vehicle_model: "2007", vehicle_plate: "908-FAW"},
    {driver_name: "Brandon Cruz", ride_count: 34, metters: 38330, vehicle_brand: "Toyota Corolla", vehicle_model: "2007", vehicle_plate: "908-FAW"},
    {driver_name: "Brandon Cruz", ride_count: 34, metters: 38330, vehicle_brand: "Toyota Corolla", vehicle_model: "2007", vehicle_plate: "908-FAW"},
    {driver_name: "Brandon Cruz", ride_count: 34, metters: 38330, vehicle_brand: "Toyota Corolla", vehicle_model: "2007", vehicle_plate: "908-FAW"},
    {driver_name: "Brandon Cruz", ride_count: 34, metters: 38330, vehicle_brand: "Toyota Corolla", vehicle_model: "2007", vehicle_plate: "908-FAW"},
    {driver_name: "Brandon Cruz", ride_count: 34, metters: 38330, vehicle_brand: "Toyota Corolla", vehicle_model: "2007", vehicle_plate: "908-FAW"},*/
  ]  

  tipoEstadistica = 0;
  hashtag;
  date = new Date();

  //displayedColumns: string[] = ['nombre']//, 'name', 'weight', 'symbol'];
  displayedColumns: string[] = ['nombre', 'cantidadV', 'metrosR', 'marcaV', 'modeloV', 'placaV'];
  //dataSource = ELEMENT_DATA;
  //dataSource = this.gestores;
  dataSource = new MatTableDataSource<any>(this.gestores)

  constructor(private groupsService: GroupsService, private toastr: ToastrService) { }

  ngOnInit(): void {
    
  }

  changeSelectedRol(value){
    this.tipoEstadistica = value
  }

  cargarLista(){
    this.dataSource = new MatTableDataSource<any>([])
    this.gestores = []
    this.dataSource = new MatTableDataSource<any>(this.gestores)
  }

  verEstadisticas(){
    this.cargarLista()

    if(this.tipoEstadistica == 0){
      this.groupsService.getTaxiStatistics("taxi", this.hashtag).subscribe(
        data => {     
          let length = Object.keys(data["rows"][0]["get_rides"]["records"]).length
          
          for (var i=0; i < length; i++){
            var json = data["rows"][0]["get_rides"]["records"][i]
            let metters = parseFloat(json["metters"])
  
            this.gestores.push({driver_name: json["driver_name"], ride_count: json["ride_count"], 
            metters: metters.toFixed(2), vehicle_brand: json["vehicle_brand"], vehicle_model: json["vehicle_model"], 
            vehicle_plate: json["vehicle_plate"]})
          }   
          this.dataSource._updateChangeSubscription();
        },
        error => {
          console.log(error);
        }
      );
    }
    if(this.tipoEstadistica == 1){
      let _date = this.date.getFullYear() + "-" + (this.date.getMonth() + 1) + "-" + this.date.getDate()
      this.groupsService.getTaxiStatisticsByDate("taxi", this.hashtag, _date).subscribe(
        data => {      
          let length = Object.keys(data["rows"][0]["get_rides"]["records"]).length
          
          for (var i=0; i < length; i++){
            var json = data["rows"][0]["get_rides"]["records"][i]
            let metters = parseFloat(json["metters"])
  
            this.gestores.push({driver_name: json["driver_name"], ride_count: json["ride_count"], 
            metters: metters.toFixed(2), vehicle_brand: json["vehicle_brand"], vehicle_model: json["vehicle_model"], 
            vehicle_plate: json["vehicle_plate"]})
          }   
          this.dataSource._updateChangeSubscription();
        },
        error => {
          console.log(error);
        }
      );
    }
    
  }
}
