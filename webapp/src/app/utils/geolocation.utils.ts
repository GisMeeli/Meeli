export default class GeolocationUtils {
    static getCurrentLocation(){
        return new Promise((resolve, reject) => {

            let setCurrentPosition = (p) => {
                resolve({lng: p.coords.longitude, lat: p.coords.latitude})
            }
            setCurrentPosition.bind(this)
            
            let errorGettingPosition = (e) => {
                reject("Se necesitan permisos de ubicación para utilizar la aplicación")
            }
            errorGettingPosition.bind(this)
            
            window.navigator.geolocation.getCurrentPosition(setCurrentPosition, errorGettingPosition)
        })
    }
}