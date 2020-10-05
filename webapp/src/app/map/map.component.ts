import { ArrayType } from '@angular/compiler';
import { AfterViewChecked, AfterViewInit, Component, OnInit } from '@angular/core';
import { range } from 'rxjs';
import TilesUtils from '../utils/tiles.utils';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, AfterViewInit {
  

  constructor() { }

  ngAfterViewInit(): void {
    this.refreshTile()
  }

  ngOnInit(): void {
  }

  tile = "https://a.tile.openstreetmap.org/${z}/${x}/${y}.png"

  zoom : number = 0

  map : any

  clicked = false

  currentXY = {
    x: 0,
    y: 0
  }
  
  TILE_SIZE = 256
  
  size = (this.TILE_SIZE/Math.pow(2, this.zoom))


  lastXY = {
    x: 0, y: 0
  }

  bounds = {
    min : {x: 1, y: 1},
    max : {x: 255, y: 255}
  }

  cursor = "grab"

  tileImages : {lat: number, lng : number, z: number, x: number, y: number}[][] = Array(18).fill([]).map(x => x = [])

  get imageWidth(){
    return this.TILE_SIZE/Math.pow(2, this.zoom)
  }


  refreshTile(){
    let xmin = this.currentXY.x
    xmin = Math.min(Math.max(this.bounds.min.x, xmin), this.bounds.max.x)
    let ymin = this.currentXY.y
    ymin = Math.min(Math.max(this.bounds.min.y, ymin), this.bounds.max.y)
    let xmax = this.currentXY.x + this.size
    xmax = Math.min(Math.max(this.bounds.min.x, xmax), this.bounds.max.x)
    let ymax = this.currentXY.y + this.size
    ymax = Math.min(Math.max(this.bounds.min.y, ymax), this.bounds.max.y)
    
    let unprojectedMIN = TilesUtils.unproject(ymin, xmin, this.TILE_SIZE)
    let unprojectedMAX = TilesUtils.unproject(ymax, xmax, this.TILE_SIZE)


    let {width, height} = TilesUtils.totalTiles(unprojectedMIN.lng, unprojectedMAX.lng, unprojectedMIN.lat, unprojectedMAX.lat, this.zoom)

    let x = TilesUtils.lon2tile(unprojectedMIN.lng, this.zoom)
    let y = TilesUtils.lat2tile(unprojectedMIN.lat, this.zoom)


    for(let i = x; i < width + x; i++){
      for(let j = y; j < height + y; j++){
        if(!this.tileImages[this.zoom].find((e) => e.x == i && e.y == j && e.z == this.zoom)){
          let {lat, lng} = TilesUtils.project(TilesUtils.tile2lat(j, this.zoom), TilesUtils.tile2long(i, this.zoom), this.TILE_SIZE)
          this.tileImages[this.zoom].push({lat, lng, z: this.zoom, x: i, y: j})
        }
      }
    }
  }

  tileUrl(x, y, z){
    let params = {x, y, z}
    return this.tile.replace(/[$][{].[}]/g, (s) => params[s.charAt(2)])
  }


  zoomin = () => {
    this.zoom++
    this.size = (this.TILE_SIZE/Math.pow(2, this.zoom)) 
    this.refreshTile()
    this.currentXY.x = this.currentXY.x + this.size / 2
    this.currentXY.y = this.currentXY.y + this.size / 2
    this.verifyBounds()
  }
  

  zoomout = () => {
    this.zoom--
    let preSize = this.size
    this.size = (this.TILE_SIZE/Math.pow(2, this.zoom)) 
    this.refreshTile()
    this.currentXY.x = this.currentXY.x - (this.size - preSize) / 2
    this.currentXY.y = this.currentXY.y - (this.size - preSize) / 2
    this.verifyBounds()
  }
  

  get viewBox() {
    return `${this.currentXY.x} ${this.currentXY.y} ${this.size} ${this.size}`
  }

  mouseDown(e: MouseEvent){
    this.clicked = true
    this.lastXY = {x: e.x, y: e.y}
    this.cursor = "grabbing"
  }

  mouseUp(){
    this.clicked = false
    this.cursor = "grab"
    this.refreshTile()
  }

  mouseMove(e: MouseEvent){
    if(this.clicked) {
      this.moveXY(e.x, e.y)
      this.lastXY = {x: e.x, y: e.y}
    }
  }

  moveXY(x, y){
    this.currentXY.x = this.currentXY.x + (this.lastXY.x - x) * this.size * 0.0015
    this.currentXY.y = this.currentXY.y + (this.lastXY.y - y) * this.size * 0.0015
    this.verifyBounds()
  }

  verifyBounds(){
    if(this.currentXY.x < 0){
      this.currentXY.x = 0
    }
    if(this.currentXY.x + this.size > this.TILE_SIZE){
      this.currentXY.x = this.TILE_SIZE -this.size 
    }
    if(this.currentXY.y < 0){
      this.currentXY.y = 0
    }
    if(this.currentXY.y + this.size > this.TILE_SIZE){
      this.currentXY.y = this.TILE_SIZE -this.size 
    }
  }

  

}
