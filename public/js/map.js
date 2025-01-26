mapboxgl.accessToken = mapToken;

const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v11', // Map style URL
    center: coordinates.length === 2 ? coordinates : [-74.5, 40], // Default to [lng, lat]
    zoom: 9, // Starting zoom
});

if (coordinates.length === 2) {
    new mapboxgl.Marker({color:"red"})
        .setLngLat(coordinates)
        .addTo(map);
} else {
    console.warn("Invalid or missing coordinates:", coordinates);
}
