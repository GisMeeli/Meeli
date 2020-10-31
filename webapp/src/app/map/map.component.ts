import { NgxMatDatetimePicker } from '@angular-material-components/datetime-picker';
import { DatePipe } from '@angular/common';
import { ArrayType } from '@angular/compiler';
import { AfterViewChecked, AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { range, Subject } from 'rxjs';
import { WebSocketSubject } from 'rxjs/webSocket';
import { GroupsService } from '../services/groups/groups.service';
import { ReportsService } from '../services/reports/reports.service';
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
    private reportsService: ReportsService
  ) {
  }


  ngOnDestroy(): void {

    //Termina la conexión del ws
    if (this.webSocket != undefined) {
      this.webSocket.socket.complete()
    }
  }

  // Grupos que se están mostrando
  @Input() groups: any[];

  // Categoría para saber qué se muestra en el mapa (1 mail, 2 taxi)
  @Input() category: Number;


  ngAfterViewInit(): void {
    this.refreshTile()
    this.setOnCurrentPosition()
    this.svg.element = document.getElementById("map")


    // Para que el mapa siempre quede cuadrado, se determina el minimo entre las dimensiones y se colocan las en ese mínimo
    let max = Math.min(this.svg.element.parentElement.clientHeight, this.svg.element.parentElement.clientWidth)

    this.svg.element.parentElement.style.maxHeight = `${max}px`
    this.svg.element.parentElement.style.maxWidth = `${max}px`

  }

  ngOnInit(): void {
    this.setIntervals()
  }

  //Obtiene la fecha actual
  get date() {
    return new Date();
  }

  //URL de capa que se muestra en el mapa
  TILE = "https://cartodb-basemaps-a.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png"

  //Zoom del mapa, va de 1-18. Es el estándar para poder mostrar bien las capas
  zoom: number = 13

  //Bandera para saber si el mapa está clickeado o no, se usa para el movimiento
  clicked = false

  // X & Y en las que se encuentra la esquina superior izquierda del viewBox del svg del mapa
  currentXY = {
    x: 0,
    y: 0,
  }

  // Tamaño del tile
  TILE_SIZE = 256

  // Tamaño que debería tener el viewbox del svg, calculado con el TILE_SIZE y el zoom actual
  get size() {
    return (this.TILE_SIZE / Math.pow(2, this.zoom))
  }

  // Tamaño de los marcadores en el mapa
  get markerSize() {
    return this.size * 0.1
  }

  // Última X & Y en las que estuvo el mouse, cuando va siendo arrastrando. También se usa para el movimiento
  lastXY = {
    x: 0, y: 0
  }

  // Bordes del mapa
  bounds = {
    min: { x: 0.0000000001, y: 0.0000000001 },
    max: { x: 255.999999999, y: 255.9999999999 }
  }

  // Determina el actual estilo del cursor 
  cursor = "grab"

  // Lista que contiene cada una de las url de las imágenes, por cada zoom, con su debida posición en el mapa. 
  // Se usa para mostrar el TILE en el mapa
  tileImages: { lat: number, lng: number, z: number, x: number, y: number }[][] = Array(18).fill([]).map(x => x = [])

  //Tiene el tamaño del svg del mapa y el NodeElement de html del mismo
  svg = {
    width: 0,
    height: 0,
    element: undefined
  }

  // Posición actual del usuario, las x&y representan la posición proyectada
  currentPosition: { lng, lat, x, y } = undefined

  // Tamaño que deberían tener las imágenes del TILE para mostrarlas en el svg
  get imageWidth() {
    return this.TILE_SIZE / Math.pow(2, this.zoom + 1)
  }

  // Sirve para saber qué información se muestra en el tooltip y si se debería mostrar en ese momento
  tooltip = {
    showing: false,
    taxi: undefined,
    mail: undefined,
    my_ubication: undefined,
    taxi_ride: undefined,
    delivery: undefined
  }

  // Si está cargando alguna capa, se coloca en true y muestra un spinner
  loading = false;

  // Tiene la conexión de ws que traerá los datos en tiempo real que se muestran en el mapa
  webSocket: { messagesSubject: Subject<any>, socket: WebSocketSubject<any> };

  // Bounding box actual para los elementos que se encuentren en el mapa
  boundingBox: any[][]

  // Detemrina si se está o no mostrando el panel inferior que tiene el filtro por fecha
  showingFilter = false

  // Determina el número de interval del interval que actualiza la información cada 1s
  interval = undefined

  // Determina si en ese momento se está aplicando un filtro, se usa para mostrar el botón de quitar filtro
  applyingFilter = false


  // Determina cada una de las imágenes del TILE que necesita ser cargada y las inserta en la lista con sus respectivos valores de x & y
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

  //Obtiene la url para obtener una images del tile con los parámetros dados
  tileUrl(x, y, z) {
    let params = { x, y, z }
    return this.TILE.replace(/[{].[}]/g, (s) => params[s.charAt(1)])
  }


  // Hace zoomin al mapa
  zoomin = (refreshTile = true) => {
    this.setZoom(this.zoom + 1, refreshTile)
  }


  // Hace zoomout al mapa
  zoomout = (refreshTile = true) => {
    this.setZoom(this.zoom - 1, refreshTile)
  }

  // Setea el zoom del mapa, validando que no se pase del max/min, puede o no refrescar el tile
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

  // Obtiene las coordenadas en base 256 del centro del mapa
  getCenter = () => {
    return {
      x: this.currentXY.x + this.size / 2,
      y: this.currentXY.y + this.size / 2
    }
  }

  // Evento para el scroll, para hacer zoomin o zoomout
  wheel(event) {
    if (event.deltaY > 0) {
      this.zoomout()
    }
    else {
      this.zoomin()
    }
  }

  // Obtiene la viewBox del svg
  get viewBox() {
    return `${this.currentXY.x} ${this.currentXY.y} ${this.size} ${this.size}`
  }

  // Cuando el mouse es apretado, se guarda el click, se coloca el cursor como agarrando
  mouseDown(e: MouseEvent) {
    this.clicked = true
    this.lastXY = { x: e.x, y: e.y }
    this.cursor = "grabbing"
  }

  // Cuando el mouse deja de ser apretado, se refresca la capa
  mouseUp() {
    this.clicked = false
    this.cursor = "grab"
    this.refreshTile()
  }

  // Cuando el mouse se mueve, mueve el mapa, según su última x y y
  mouseMove(e: MouseEvent) {
    if (this.clicked) {
      this.moveXY(e.x, e.y)
      this.lastXY = { x: e.x, y: e.y }
    }
  }

  // Mueve el mapa a cierto x o y, se utiliza para el evento de mouseMove dentro del mapa
  moveXY(x, y) {
    this.currentXY.x = this.currentXY.x + (this.lastXY.x - x) * this.size * 0.0015
    this.currentXY.y = this.currentXY.y + (this.lastXY.y - y) * this.size * 0.0015
    this.verifyBounds()
  }

  // Evento que hace que cuando da doble click se haga zoomin
  dbClick(e) {
    this.zoomin()
  }

  // Verifica que el viewBox no se salga de las coordenadas
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

  // Coloca el centro en x y y dadas, en base 256
  setCenter(x, y, refreshTile = true) {
    this.currentXY.x = x - (this.size / 2)
    this.currentXY.y = y - (this.size / 2)
    if (refreshTile)
      this.refreshTile()
  }

  // Coloca el centro en lat y lng dada
  setCenterLatLng(lat, lng) {
    let projected = TilesUtils.project(lat, lng, this.TILE_SIZE)
    this.setCenter(projected.lng, projected.lat)
  }

  // Coloca el mapa en la posición actual del usuario
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

  // Actualiza la posición actual del usuario
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

  // Setea el intérvalo para que cada 1 segundo actualice la posición actual
  setIntervals() {
    setInterval(this.getCurrentPosition.bind(this), 1000)
    this.setupMapInfoWS()
  }

  // Limpia lo que había en el tooltip y luego lo muestra
  showTooltip() {
    this.clearTooltip()
    this.tooltip.showing = true;
  }

  // Hace que el bounding_box sea visible al menor zoom posible
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

  //Función auxiliar para focus que hace zoomout hasta el sea visible el boundingBox
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

  // Determina si un punto dado, proyectado o no, se encuentra dentro del viewBox
  pointOnMap(latitude, longitude, projecting = true) {

    let projected = { lat: latitude, lng: longitude }
    if (projecting)
      projected = TilesUtils.project(latitude, longitude, this.TILE_SIZE)

    const bounds = this.mapBounds

    return projected.lat >= bounds[0].y && projected.lat <= bounds[1].y && projected.lng >= bounds[0].x && projected.lng <= bounds[1].x
  }

  // Retorna un boolean que determina si el mapa contiene a los puntos dados
  fitBounds(bounds: { x, y }[]) {
    let fit = true;

    bounds.forEach((e) => {
      fit = fit && this.pointOnMap(e.y, e.x)
    })

    return fit;
  }

  // Obtiene los bordes del viewBox
  get mapBounds() {
    return [
      { x: this.currentXY.x, y: this.currentXY.y },
      { x: this.currentXY.x + this.size, y: this.currentXY.y + this.size }
    ]
  }

  // Setea el socket para obtener la información de todos los grupos y mostrarla
  setupMapInfoWS() {
    let focused = false;
    this.webSocket = this.webSocketService.connect("guest")
    this.webSocket.socket.asObservable().subscribe(data => {
      const { records, bounding_box } = data.rows[0].get_realtime_info
      if (records != null) {
        if (this.category == 2)
          this.showTaxis(records)
        else
          this.showMails(records)

      }
      if (bounding_box != null){
        if (bounding_box.type == 'Polygon')
          this.boundingBox = [bounding_box.coordinates[0][0], bounding_box.coordinates[0][2]]
        else
          this.boundingBox = [bounding_box.coordinates, bounding_box.coordinates]
      }
      if(!focused){
        focused = true;
        this.focus()   
      }
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

  // Función que va a ser llamda por el interval que envía un mensaje al ws para obtener nuevamente la información y mostrarla
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
  // Funciona para filtar la información por fechas y mostrar las entregas o los viajes, según lo indique la categoría
  async search(picker1: NgxMatDatetimePicker<any>, picker2: NgxMatDatetimePicker<any>) {
    if(this.groups.length == 0){
      this.loading = false
      return
    }
    this.loading = true
    this.mailReports = []
    this.taxiRides = []
    let start = undefined;
    let end = undefined;
    if (picker1._selected != null)
      start = new Date(picker1._selected).toISOString()
    if (picker2._selected != null)
      start = new Date(picker1._selected).toISOString()
    this.showingFilter = false;
    this.applyingFilter = true;
    this.stopInterval();
    
    this.groups.forEach(group => {
      this.reportsService.getReports(this.category == 2 ? 'taxi' : 'mail', group.hashtag, undefined, start, end).then(
        response => {
          let bounding_box

          if (this.category == 2) {
            bounding_box = response.rows[0].get_rides.bounding_box
            this.showTaxiRides(response.rows[0].get_rides.records)
          }
          else {
            bounding_box = response.rows[0].get_deliveries.bounding_box
            this.showMailReports(response.rows[0].get_deliveries.records)
          }
          if (bounding_box != null) {
            if (bounding_box.type == 'Polygon')
              this.boundingBox = [bounding_box.coordinates[0][0], bounding_box.coordinates[0][2]]
            else
              this.boundingBox = [bounding_box.coordinates, bounding_box.coordinates]
            this.focus()
          }
          else{
            this.toastr.info("No hay ningún elemento para mostrar")
          }
          this.loading = false;
        }
      )
    }
    )
  }

  // Detiene el interval que muestra las
  stopInterval() {
    clearInterval(this.interval)
    this.taxis = []
    this.mails = []
  }

  // Limpia el filtro de búsqueda y deja de mostrar lo buscado, vuelve a mostrar la información en realtime
  clearSearch() {
    this.applyingFilter = false;
    this.mailReports = []
    this.taxiRides = []
    this.interval = setInterval(this.refreshMapInfo.bind(this), 1000)
  }

  /* TAXIS */

  // Lista de taxis en realtime
  taxis = [

  ]

  // Lista de viajes de taxis a mostrar
  taxiRides = [

  ]

  // Recibe una lista de taxis y prepara su información para ser mostrada
  showTaxis(records: any[]) {
    records = records.filter(taxi => taxi.geom != null)
    records.forEach(taxiRecord => {
      const projected = TilesUtils.project(taxiRecord.geom.coordinates[1], taxiRecord.geom.coordinates[0], this.TILE_SIZE)
      taxiRecord.x = projected.lng
      taxiRecord.y = projected.lat

      taxiRecord.last_seen = new Date(taxiRecord.last_seen + "+00:00")
    })
    this.taxis = records
  }

  // Recibe una lista de viajes de taxis, prepara la información para lograr mostrarla en el mapa
  showTaxiRides(records: any[]) {
    records.forEach((value) => {
      value.projectedTrack = value.track.coordinates.map(point => {
        let projected = TilesUtils.project(point[1], point[0], this.TILE_SIZE)
        return [projected.lng, projected.lat]
      });

      value.svgTrack = value.projectedTrack.map(point => point.join(" ")).join(" L ")
      value.svgTrack = `M ${value.svgTrack}`
      console.log(value.svgTrack)

      value.start = new Date(value.start + "+00:00")
      value.end = new Date(value.end + "+00:00")
    })
    this.taxiRides = [...this.taxiRides, ...records]
    /*
      end: "2020-10-29T03:52:55.680806", start: "2020-10-29T03:52:24.741044",…}
      collaborator: "6ef38bb0-8388-4fdc-9f46-cd6cd22273c5"
      driver_name: "x"
      end: "2020-10-29T03:52:55.680806"
      hashtag: "pruebataxi"
      metters: 3.318016390719465
      ride_count: 1
      start: "2020-10-29T03:52:24.741044"
      track: {type: "LineString", coordinates: [[-84.29428, 10.35964], [-84.29428, 10.35967]]}
      vehicle_brand: "x"
      vehicle_model: "x"
      vehicle_plate: "x"
    */
  }

  // Muestra el tooltip y le setea la información del taxi
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
    this.showTooltip()
    this.tooltip.taxi = taxi
  }

  // Busca mostrar todos los viejes de un colaborador
  showCollaboratorRides(taxi) {
    this.reportsService.getReports(this.category == 2 ? 'taxi' : 'mail', undefined, taxi.collaborator, undefined, undefined).then(
      response => {
        let bounding_box = response.rows[0].get_rides.bounding_box
        this.showTaxiRides(response.rows[0].get_rides.records)

        this.showingFilter = false;
        this.applyingFilter = true;
        this.stopInterval()
        if (bounding_box != null){
          if (bounding_box.type == 'Polygon')
          this.boundingBox = [bounding_box.coordinates[0][0], bounding_box.coordinates[0][2]]
          else
          this.boundingBox = [bounding_box.coordinates, bounding_box.coordinates]
          this.focus()
          this.clearTooltip()
        }
        else{
          this.toastr.info("No hay ningún elemento para mostrar")
        }
      }
    )
  }

  // Muestra el tooltip y luego le setea la información del viaje
  showRideTooltip(taxi_ride){
    this.showTooltip()
    this.tooltip.taxi_ride = taxi_ride;
  }



  /* MAIL */

  // Lista de colaboradores en realtime
  mails = [

  ]

  // Lista de entregas a mostrar en el mapa
  mailReports = [

  ]

  // Recibe una lista de colaboradores en realtime y prepara la ifnromación para mostrarla en el mapa
  showMails(records) {
    records = records.filter(mail => mail.geom != null)
    records.forEach(mailRecord => {
      const projected = TilesUtils.project(mailRecord.geom.coordinates[1], mailRecord.geom.coordinates[0], this.TILE_SIZE)
      mailRecord.x = projected.lng
      mailRecord.y = projected.lat

      mailRecord.last_seen = new Date(mailRecord.last_seen + "+00:00")
    })
    this.mails = records
  }

  // Recibe una lista de entrega y prepara la información para luego mostrarla en el mapa
  showMailReports(records) {
    /*
        collaborator: "2a50ddce-7eed-439b-bac5-74c425d87286"
        delivery_count: 1
        driver_name: "Walter"
        first: "KOIN23"
        geom:
        coordinates: (2) [-84.430677, 10.3271511]
        type: "Point"
        __proto__: Object
        hashtag: "correosW"
        last_seen: "2020-10-29T04:59:36.03125"
        vehicle_brand: "KKKL"
        vehicle_plate: "KKK"
    */
    records.forEach(record => {
      let projected = TilesUtils.project(record.geom.coordinates[1], record.geom.coordinates[0], this.TILE_SIZE)
      record.projectedPoint = [projected.lng, projected.lat]

      record.last_seen = new Date(record.last_seen + "+00:00")
    });
    this.mailReports.push(...records)
  }

  // Muestra el tooltip y le setea la información el colaborador
  showMailTooltip(mail) {
    this.showTooltip()
    this.tooltip.mail = mail;
  }

  // Busca la ifnromación de las entregas de un colaborador y la muestra
  showCollaboratorDeliveries(mail) {
    this.reportsService.getReports(this.category == 2 ? 'taxi' : 'mail', undefined, mail.collaborator, undefined, undefined).then(
      response => {
        let bounding_box = response.rows[0].get_deliveries.bounding_box
        this.showMailReports(response.rows[0].get_deliveries.records)

        this.showingFilter = true;
        this.applyingFilter = true;
        this.stopInterval()
        if (bounding_box != null){

          if (bounding_box.type == 'Polygon')
          this.boundingBox = [bounding_box.coordinates[0][0], bounding_box.coordinates[0][2]]
          else
          this.boundingBox = [bounding_box.coordinates, bounding_box.coordinates]
          this.clearTooltip()
          this.focus()
        }
        else{
          this.toastr.info("No hay ningún elemento para mostrar")
        }
      }
    )
  }

  // Muestra el tooltip y le setea la información de la entrega
  showDeliveryTooltip(delivary){
    this.showTooltip();
    this.tooltip.delivery = delivary;
  }


  // Oculta y limpia la información del tooltip
  clearTooltip() {
    this.tooltip = {
      showing: false,
      taxi: undefined,
      mail: undefined,
      my_ubication: undefined,
      taxi_ride: undefined,
      delivery: undefined
    }
  }

}
