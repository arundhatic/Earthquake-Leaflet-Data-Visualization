const earthquakeURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
const tectonicPlatesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

d3.json(earthquakeURL,(data) => {
   console.log(data);
   createFeatures(data.features);
});

const createFeatures = (earthquakeData) => {

    // Define a function we want to run once for each feature in the features array
    const onEachFeature = (feature,layer) =>{
        layer.bindPopup(`<h3>Magnitude:${feature.properties.mag}</h3>\
            <h3>Location:${feature.properties.place}</h3>\
            <hr><p>${new Date(feature.properties.time)}</p>`);
    }

   const poinToLayer = (feature,latlng) =>{
        return new L.circle(latlng,{
            radius: getRadius(feature.properties.mag),
            fillColor: chooseColor(feature.properties.mag),
            fillOpacity:.8,
            stroke:false,
        });
    }
  
    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    var earthquakes = L.geoJSON(earthquakeData, {
      onEachFeature: onEachFeature,
      pointToLayer: poinToLayer
    });
  
    // Sending our earthquakes layer to the createMap function
    createMap(earthquakes);
  }
  
const createMap = (earthquakes)=> {
    var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?access_token={accessToken}",{
        maxZoom: 18,
        id: "mapbox.outdoors",    
        accessToken:API_KEY
      });
  
    var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}",{
        maxZoom: 18,
        id: "mapbox.satellite",    
        accessToken:API_KEY
      });

    var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}",{
        maxZoom: 18,
        id: "mapbox.dark",
        accessToken: API_KEY
    });

    var baseMaps = {
    	"Outdoors": outdoors,
    	"Satellite": satellite,
    	"Dark Map": darkmap
    };

    var tectonicplates = new L.LayerGroup();

    var overlayMaps ={
    	"Earthquakes": earthquakes,
    	"Tectonic Plates": tectonicplates
    };

  	var myMap = L.map("map", {
  		center: [37.09, -95.71],
  		zoom: 2.5,
  		layers: [outdoors, earthquakes, tectonicplates]
  	}); 

  	d3.json(tectonicPlatesURL, function(plateData) {
  		L.geoJSON(plateData,{
  			color:"gold",
  			weight:2
  		})
  		.addTo(tectonicplates);
  	});

  	L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
      }).addTo(myMap);

var legend = L.control({position: 'bottomright'});
legend.onAdd = function(){
    var div = L.DomUtil.create('div', 'info legend')
    var limits = [0, 1, 2, 3, 4, 5];
    var labels = [];


    var legendInfo = `<div class="labels"><div class="min">${limits[0]}</div>\
      <div class="max">${limits[limits.length - 1]}+</div></div>`;
    
    div.innerHTML = legendInfo;

    limits.forEach(function (limit, index) {
      labels.push(`<li style="background-color: ${chooseColor(index+1)}"></li>`)
    })

    div.innerHTML += '<ul>' + labels.join('') + '</ul>'
    return div;
  }

  legend.addTo(myMap);
}



const chooseColor = (a) =>{
    return (a > 5)? "#BF2424" :
    (a > 4)? "#F29F05" : 
    (a > 3)? "#F2BD1D" : 
    (a > 2)? "#25B8D9" : 
    (a > 1)? "#0367A6" : "#9DBF54"; 
}
  
const getRadius=(value) =>{
      return value*25000
  }