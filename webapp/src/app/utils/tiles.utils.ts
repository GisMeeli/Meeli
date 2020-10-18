
export default class TilesUtils {

    static lon2tile(lon, zoom) {
        return (Math.floor((lon + 180) / 360 * Math.pow(2, zoom)));
    }
    static lat2tile(lat, zoom) {
        return (Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom)));
    }   
    static  tile2long(x,z) {
        return (x/Math.pow(2,z)*360-180);
    }
    static tile2lat(y,z) {
        var n=Math.PI-2*Math.PI*y/Math.pow(2,z);
        return (180/Math.PI*Math.atan(0.5*(Math.exp(n)-Math.exp(-n))));
    }

    static totalTiles(xmin, xmax, ymin, ymax, zoom) {
        const top_tile = TilesUtils.lat2tile(ymax, zoom); 
        const left_tile = TilesUtils.lon2tile(xmin, zoom);
        const bottom_tile = TilesUtils.lat2tile(ymin, zoom);
        const right_tile = TilesUtils.lon2tile(xmax, zoom);
        const width = Math.abs(left_tile - right_tile) + 1;
        const height = Math.abs(top_tile - bottom_tile) + 1;

        return {width, height}; 
    }

    static project(lat, lng, size) {
        let siny = Math.sin((lat * Math.PI) / 180);
        siny = Math.min(Math.max(siny, -0.9999), 0.9999);
        return {
            lng: size * (0.5 + lng / 360),
            lat: size * (0.5 - Math.log((1 + siny) / (1 - siny)) / (4 * Math.PI))
        }
    }

    static unproject(lat, lng, size) {

        let v = 1/ (4*Math.PI)

        let b = 1/size

        let siny = (Math.pow(Math.E, -(b * lat - 0.5)/v) - 1) / (Math.pow(Math.E, -((-0.5 + b * lat)/v)) + 1)
        let latR = (180 * Math.asin(siny)) / Math.PI
        let lngR = 360 * ((lng/256) - 0.5)

        return {lng: lngR, lat: latR}
    }
}