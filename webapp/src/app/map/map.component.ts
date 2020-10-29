import { NgxMatDatetimePicker } from '@angular-material-components/datetime-picker';
import { DatePipe } from '@angular/common';
import { ArrayType } from '@angular/compiler';
import { AfterViewChecked, AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
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
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {


  constructor(
    private toastr: ToastrService,
    private webSocketService: WebsocketService,
    private datePipe: DatePipe
  ) {
  }
  ngOnDestroy(): void {
    if (this.webSocket != undefined) {
      this.webSocket.socket.complete()
    }
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

  get date(){
    return new Date();
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

  webSocket: { messagesSubject: Subject<any>, socket: WebSocketSubject<any> };

  boundingBox: any[][]

  showingFilter = false

  interval = undefined

  applyingFilter = false


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
    this.setupMapInfoWS()
  }

  showTooltip(html) {
    this.tooltip.showing = true;
    this.tooltip.html = html
  }


  focus() {
    if (this.boundingBox == undefined)
      return

    this.loading = true;

    let lat1 = this.boundingBox[0][1], lng1 = this.boundingBox[0][0]
    let lat2 = this.boundingBox[1][1], lng2 = this.boundingBox[1][0]

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

  setupMapInfoWS() {
    this.webSocket = this.webSocketService.connect("guest")
    this.webSocket.socket.asObservable().subscribe(data => {
      const { records, bounding_box } = data.rows[0].get_realtime_info
      if (records != null){
        if(this.category == 2)
          this.showTaxis(records)
        else
          this.showMails(records)
        
      }
      if (bounding_box != null)
        if (bounding_box.type == 'Polygon')
          this.boundingBox = [bounding_box.coordinates[0][0], bounding_box.coordinates[0][2]]
        else
          this.boundingBox = [bounding_box.coordinates, bounding_box.coordinates]
    })
    let visibleGroups = this.groups.filter((group, i) => group.visible && this.groups.indexOf(group) == i)
    if (visibleGroups.length > 0)
      this.webSocket.socket.next(
        {
          action: Number(4),
          data: {
            category: Number(this.category),
            groups: visibleGroups.map(group => group.hashtag)
          }
        })
    else {
      this.mails = []
      this.taxis = []
    }

    this.interval = setInterval(this.refreshMapInfo.bind(this), 1000)

  }

  refreshMapInfo() {
    let visibleGroups = this.groups.filter((group, i) => group.visible && this.groups.indexOf(group) == i)
    if (visibleGroups.length > 0)
      this.webSocket.socket.next(
        {
          action: Number(4),
          data: {
            category: Number(this.category),
            groups: visibleGroups.map(group => group.hashtag)
          }
        }
      )
    else {
      this.mails = []
      this.taxis = []
    }
  }

  search(picker1: NgxMatDatetimePicker<any>, picker2: NgxMatDatetimePicker<any>){
    let start = new Date(picker1._selected).toISOString()
    let end = new Date(picker2._selected).toISOString()
    this.showingFilter = false;
    this.stopInterval();
    this.applyingFilter = true;
  }

  stopInterval(){
    clearInterval(this.interval)
    this.taxis = []
    this.mails = []
  }

  clearSearch(){
    this.applyingFilter = false;
    this.interval = setInterval(this.refreshMapInfo.bind(this), 1000)
  }

  /* TAXIS */

  taxis = [

  ]

  showTaxis(records: any[]) {
    records = records.filter(taxi => taxi.geom != null)
    records.forEach(taxiRecord => {
      const projected = TilesUtils.project(taxiRecord.geom.coordinates[1], taxiRecord.geom.coordinates[0], this.TILE_SIZE)
      taxiRecord.x = projected.lng
      taxiRecord.y = projected.lat
    })
    this.taxis = records
  }

  showTaxiTooltip(taxi) {
    /*
      collaborator: "6ef38bb0-8388-4fdc-9f46-cd6cd22273c5"
      driver_name: "x"
      geom: {type: "Point", coordinates: Array(2)}
      group: "beaa4cd0-e2c4-4b84-93e4-da481014bec2"
      hashtag: "pruebataxi"
      is_available: true
      last_seen: "2020-10-28T16:16:35.100587"
      ride_count: 0
      session: "efd8a635-4368-417e-8498-0ebb0095ed4a"
      vehicle_brand: "x"
      vehicle_model: "x"
      vehicle_plate: "x"
      x: 68.07103146666668
      y: 120.5172813918194
    */
    this.showTooltip(
      `<div style="text-align: center; line-height: 1.7">
        <b>${taxi.driver_name}</b> <br>
        <span>#${taxi.hashtag}</span> <br>
        <b>${taxi.is_available ? "Libre" : "En viaje"}</b> <br>
        <b>Placa: ${taxi.vehicle_plate}</b> <br><br>

        <span>Última actualización: ${this.datePipe.transform(taxi.last_seen + "+00:00", 'h:mm:ss a')}
      </div>`)
  }



  /* MAIL */

  mails = [

  ]

  showMails(records){
    records = records.filter(mail => mail.geom != null)
    records.forEach(mailRecord => {
      const projected = TilesUtils.project(mailRecord.geom.coordinates[1], mailRecord.geom.coordinates[0], this.TILE_SIZE)
      mailRecord.x = projected.lng
      mailRecord.y = projected.lat
    })
    this.mails = records
  }

  showMailTooltip(mail) {
    console.log(mail)
    this.showTooltip("Mail x")
  }



}
