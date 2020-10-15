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
    this.setOnCurrentPosition()
    this.svg.element = document.getElementById("map")
    console.log(this.svg.element.clientHeight)
    console.log(this.svg.element.clientWidth)

    let max = Math.min(this.svg.element.parentElement.clientHeight, this.svg.element.parentElement.clientWidth)

    this.svg.element.parentElement.style.maxHeight = `${max}px`
    this.svg.element.parentElement.style.maxWidth = `${max}px`
    
  }

  ngOnInit(): void {
    console.log(TilesUtils.project(9.7489, -83.753428, this.TILE_SIZE))
  }

  circleClick(){
    console.log("Holis")
    
  }

  tile = "https://tile.openstreetmap.org/{z}/{x}/{y}.png"

  zoom : number = 13

  map : any

  clicked = false

  currentXY = {
    x: 0,
    y: 0,
    
  }
  
  TILE_SIZE = 256
  
  size = (this.TILE_SIZE/Math.pow(2, this.zoom))


  lastXY = {
    x: 0, y: 0
  }

  bounds = {
    min : {x: 0.0000000001, y: 0.0000000001},
    max : {x: 255.999999999, y: 255.9999999999}
  }

  cursor = "grab"

  tileImages : {lat: number, lng : number, z: number, x: number, y: number}[][] = Array(18).fill([]).map(x => x = [])

  svg = {
    width: 0,
    height: 0,
    element: undefined
  }

  get imageWidth(){
    return this.TILE_SIZE/Math.pow(2, this.zoom + 1)
  }


  refreshTile(){
    let zoom = this.zoom + 1
    
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


    let {width, height} = TilesUtils.totalTiles(unprojectedMIN.lng, unprojectedMAX.lng, unprojectedMIN.lat, unprojectedMAX.lat, zoom)

    let x = TilesUtils.lon2tile(unprojectedMIN.lng, zoom)
    let y = TilesUtils.lat2tile(unprojectedMIN.lat, zoom)

    for(let i = x; i < width + x; i++){
      for(let j = y; j < height + y; j++){
        if(!this.tileImages[this.zoom].find((e) => e.x == i && e.y == j && e.z == zoom)){
          let {lat, lng} = TilesUtils.project(TilesUtils.tile2lat(j, zoom), TilesUtils.tile2long(i, zoom), this.TILE_SIZE)
          this.tileImages[this.zoom].push({lat, lng, z: zoom, x: i, y: j})
        }
      }
    }
  }

  tileUrl(x, y, z){
    let params = {x, y, z}
    return this.tile.replace(/[{].[}]/g, (s) => params[s.charAt(1)])
  }


  zoomin = () => {
    this.zoom++
    this.size = (this.TILE_SIZE/Math.pow(2, this.zoom)) 
    this.currentXY.x = this.currentXY.x + this.size / 2
    this.currentXY.y = this.currentXY.y + this.size / 2
    this.verifyBounds()
    this.refreshTile()
  }
  

  zoomout = () => {
    this.zoom--
    let preSize = this.size
    this.size = (this.TILE_SIZE/Math.pow(2, this.zoom)) 
    this.currentXY.x = this.currentXY.x - (this.size - preSize) / 2
    this.currentXY.y = this.currentXY.y - (this.size - preSize) / 2
    this.verifyBounds()
    this.refreshTile()
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

  dbClick(e){
    console.log(e)
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

  setCenter(x, y){
    this.currentXY.x = x - (this.size / 2)
    this.currentXY.y = y - (this.size / 2)
    this.refreshTile()
  }

  setCenterLatLng(lat, lng){
    console.log(lat, lng)
    let projected = TilesUtils.project(lat, lng, this.TILE_SIZE)
    console.log(projected)
    this.setCenter(projected.lng, projected.lat)
  }

  setOnCurrentPosition(){
    let setOnCurrentPosition = (p) => {
      console.log(p)
      this.setCenterLatLng(p.coords.latitude, p.coords.longitude)
    }
    setOnCurrentPosition.bind(this)

    let errorGettingPosition = (e) => {
      console.log(e)
    }
    errorGettingPosition.bind(this)
    
    window.navigator.geolocation.getCurrentPosition(setOnCurrentPosition, errorGettingPosition)
  }

  

}
