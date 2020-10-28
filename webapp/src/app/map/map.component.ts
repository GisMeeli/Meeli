import { ArrayType } from '@angular/compiler';
import { AfterViewChecked, AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { range, Subject } from 'rxjs';
import { WebSocketSubject } from 'rxjs/webSocket';
import { GroupsService } from '../services/groups/groups.service';
import { WebsocketService } from '../services/websocket/websocket.service';
import TilesUtils from '../utils/tiles.utils';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, AfterViewInit {


  constructor(
    private toastr: ToastrService,
    private webSocketService: WebsocketService
  ) { 
    
  }

  @Input() groups: any[];
  @Input() category: Number;


  ngAfterViewInit(): void {
    this.refreshTile()
    this.setOnCurrentPosition()
    this.svg.element = document.getElementById("map")
    // console.log(this.svg.element.clientHeight)
    // console.log(this.svg.element.clientWidth)

    let max = Math.min(this.svg.element.parentElement.clientHeight, this.svg.element.parentElement.clientWidth)

    this.svg.element.parentElement.style.maxHeight = `${max}px`
    this.svg.element.parentElement.style.maxWidth = `${max}px`

  }

  ngOnInit(): void {
    this.setIntervals()
  }

  circleClick() {
    console.log("Holis")

  }

  tile = "https://cartodb-basemaps-a.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png"

  zoom: number = 13

  map: any

  clicked = false

  currentXY = {
    x: 0,
    y: 0,

  }

  TILE_SIZE = 256

  get size() {
    return (this.TILE_SIZE / Math.pow(2, this.zoom))
  }


  get markerSize() {
    return this.size * 0.1
  }


  lastXY = {
    x: 0, y: 0
  }

  bounds = {
    min: { x: 0.0000000001, y: 0.0000000001 },
    max: { x: 255.999999999, y: 255.9999999999 }
  }

  cursor = "grab"

  tileImages: { lat: number, lng: number, z: number, x: number, y: number }[][] = Array(18).fill([]).map(x => x = [])

  svg = {
    width: 0,
    height: 0,
    element: undefined
  }

  currentPosition: { lng, lat, x, y } = undefined

  get imageWidth() {
    return this.TILE_SIZE / Math.pow(2, this.zoom + 1)
  }

  tooltip = {
    showing: false,
    html: ''
  }

  loading = false;

  webSocket : {messagesSubject: Subject<any>, socket: WebSocketSubject<any>};


  refreshTile() {
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


    let { width, height } = TilesUtils.totalTiles(unprojectedMIN.lng, unprojectedMAX.lng, unprojectedMIN.lat, unprojectedMAX.lat, zoom)

    let x = TilesUtils.lon2tile(unprojectedMIN.lng, zoom)
    let y = TilesUtils.lat2tile(unprojectedMIN.lat, zoom)

    for (let i = x; i < width + x; i++) {
      for (let j = y; j < height + y; j++) {
        if (!this.tileImages[this.zoom].find((e) => e.x == i && e.y == j && e.z == zoom)) {
          let { lat, lng } = TilesUtils.project(TilesUtils.tile2lat(j, zoom), TilesUtils.tile2long(i, zoom), this.TILE_SIZE)
          this.tileImages[this.zoom].push({ lat, lng, z: zoom, x: i, y: j })
        }
      }
    }
  }

  tileUrl(x, y, z) {
    let params = { x, y, z }
    return this.tile.replace(/[{].[}]/g, (s) => params[s.charAt(1)])
  }


  zoomin = (refreshTile = true) => {
    this.setZoom(this.zoom + 1, refreshTile)
  }


  zoomout = (refreshTile = true) => {
    this.setZoom(this.zoom - 1, refreshTile)
  }

  setZoom = (z, refreshTile = true) => {
    if (z < 0) {
      z = 0
    }
    else if (z > 17) {
      z = 17
    }
    const { x, y } = this.getCenter()
    this.zoom = z
    this.setCenter(x, y, refreshTile)
    this.verifyBounds()
  }

  getCenter = () => {
    return {
      x: this.currentXY.x + this.size / 2,
      y: this.currentXY.y + this.size / 2
    }
  }

  wheel(event) {
    if (event.deltaY > 0) {
      this.zoomout()
    }
    else {
      this.zoomin()
    }
  }


  get viewBox() {
    return `${this.currentXY.x} ${this.currentXY.y} ${this.size} ${this.size}`
  }

  mouseDown(e: MouseEvent) {
    this.clicked = true
    this.lastXY = { x: e.x, y: e.y }
    this.cursor = "grabbing"
  }

  mouseUp() {
    this.clicked = false
    this.cursor = "grab"
    this.refreshTile()
  }

  mouseMove(e: MouseEvent) {
    if (this.clicked) {
      this.moveXY(e.x, e.y)
      this.lastXY = { x: e.x, y: e.y }
    }
  }

  moveXY(x, y) {
    this.currentXY.x = this.currentXY.x + (this.lastXY.x - x) * this.size * 0.0015
    this.currentXY.y = this.currentXY.y + (this.lastXY.y - y) * this.size * 0.0015
    this.verifyBounds()
  }

  dbClick(e) {
    this.zoomin()
  }

  verifyBounds() {
    if (this.currentXY.x < 0) {
      this.currentXY.x = 0
    }
    if (this.currentXY.x + this.size > this.TILE_SIZE) {
      this.currentXY.x = this.TILE_SIZE - this.size
    }
    if (this.currentXY.y < 0) {
      this.currentXY.y = 0
    }
    if (this.currentXY.y + this.size > this.TILE_SIZE) {
      this.currentXY.y = this.TILE_SIZE - this.size
    }
  }

  setCenter(x, y, refreshTile = true) {
    this.currentXY.x = x - (this.size / 2)
    this.currentXY.y = y - (this.size / 2)
    if (refreshTile)
      this.refreshTile()
  }

  setCenterLatLng(lat, lng) {
    let projected = TilesUtils.project(lat, lng, this.TILE_SIZE)
    this.setCenter(projected.lng, projected.lat)
  }

  setOnCurrentPosition() {
    let setOnCurrentPosition = (p) => {
      console.log(p)
      //this.setLocationLatLng(p.coords.latitude, p.coords.longitude)
      let projected = TilesUtils.project(p.coords.latitude, p.coords.longitude, this.TILE_SIZE)
      this.currentPosition = { lng: p.coords.longitude, lat: p.coords.latitude, x: projected.lng, y: projected.lat }
      this.setCenter(projected.lng, projected.lat)
    }
    setOnCurrentPosition.bind(this)

    let errorGettingPosition = (e) => {
      console.log(e)
      this.setZoom(2)
    }
    errorGettingPosition.bind(this)

    window.navigator.geolocation.getCurrentPosition(setOnCurrentPosition, errorGettingPosition)
  }

  getCurrentPosition() {
    let setCurrentPosition = (p) => {
      let projected = TilesUtils.project(p.coords.latitude, p.coords.longitude, this.TILE_SIZE)
      this.currentPosition = { lng: p.coords.longitude, lat: p.coords.latitude, x: projected.lng, y: projected.lat }
    }
    setCurrentPosition.bind(this)

    let errorGettingPosition = (e) => {
      console.log(e)
      this.toastr.error("Se necesitan permisos de ubicación para utilizar la aplicación")
    }
    errorGettingPosition.bind(this)

    window.navigator.geolocation.getCurrentPosition(setCurrentPosition, errorGettingPosition)
  }

  setIntervals() {
    setInterval(this.getCurrentPosition.bind(this), 1000)
    //this.setupMapInfoWS()
  }

  showTooltip(e) {
    console.log(e)
    this.tooltip.showing = true;
    this.tooltip.html = "Mi ubicación"
  }


  focus() {
    this.loading = true;
    let lat1 = 2.15, lng1 = -90.45
    let lat2 = 11.77, lng2 = -81.43

    const center = TilesUtils.project((lat1 + lat2) / 2, (lng1 + lng2) / 2, this.TILE_SIZE)
    this.setCenter(center.lng, center.lat)
    this.setZoom(17, false)


    let bounds = [
      { x: lng1, y: lat1 },
      { x: lng2, y: lat2 },
    ]
    setTimeout(this.focusAux.bind(this, bounds), 0);
  }

  focusAux(bounds) {
    if (!this.fitBounds(bounds)) {
      this.zoomout(false);
      setTimeout(this.focusAux.bind(this, bounds), 0)
    }
    else {
      this.refreshTile()
      this.loading = false
    }
  }

  pointOnMap(latitude, longitude, projecting = true) {

    let projected = { lat: latitude, lng: longitude }
    if (projecting)
      projected = TilesUtils.project(latitude, longitude, this.TILE_SIZE)

    const bounds = this.mapBounds

    return projected.lat >= bounds[0].y && projected.lat <= bounds[1].y && projected.lng >= bounds[0].x && projected.lng <= bounds[1].x
  }

  fitBounds(bounds: { x, y }[]) {
    let fit = true;

    bounds.forEach((e) => {
      fit = fit && this.pointOnMap(e.y, e.x)
    })

    return fit;
  }

  get mapBounds() {
    return [
      { x: this.currentXY.x, y: this.currentXY.y },
      { x: this.currentXY.x + this.size, y: this.currentXY.y + this.size }
    ]
  }

  setupMapInfoWS(){
    this.webSocket = this.webSocketService.connect("guest")
    console.log(this.webSocket)
    this.webSocket.socket.asObservable().subscribe(data => {
      console.log(data)
    })
    this.webSocket.socket.next("Prueba")
    
  }

  refreshMapInfo(){
    this.webSocket.socket.next("Prueba")
  }


}
