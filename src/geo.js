
function distanceInKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const rad = Math.PI / 180;
    const dLat = (lat1-lat2)*rad;
    const dLon = (lon1-lon2)*rad;
    const a = (Math.sin((dLat)/2)** 2)+Math.cos(lat1*rad)*Math.cos(lat2*rad)*(Math.sin((dLon)/2)** 2);
    const c = 2*Math.asin(Math.sqrt(a));
    return R*c
}

module.exports = { distanceInKm };