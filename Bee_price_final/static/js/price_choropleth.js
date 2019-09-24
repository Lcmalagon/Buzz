//map object
var myMap = L.map('map', {
    'center': [37.0902, -95.7129],
    'zoom': 4.25
})


//tile layer
L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors, <a href='https://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>, Imagery © <a href='https://www.mapbox.com/'>Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.streets",
  accessToken: API_KEY
}).addTo(myMap);

d3.csv("/resources/Honey_price_population.csv", function(err, beeData) {
  if (err) throw err;
  console.log(beeData);
    var years = [];
    beeData.forEach(function(year){
      years.push(+year.Year);
    })
    var uniqueYears = Array.from(new Set(years));
    console.log(uniqueYears);
    var latestYear = uniqueYears[0];


    var url = "https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json";
    d3.json(url, function(response){
      console.log(response);

      var geojson=null;

      function drawChoropleth(yearToShow) {
        for (var x=0; x < response.features.length; x++) {
          var feature = response.features[x];
          var state = feature.properties.name;
          beeData.forEach(function(data) {
            if (data.State.toLowerCase() === state.toLowerCase() && +data.Year ===yearToShow)
            {
              var price = data.Value;

              // function abbreviateNumber(price) {

              //   if (price <= 1000) {
              //       return price.toString();
              //   }

              //   const numDigits = (""+price).length;
              //   const suffixIndex = Math.floor(numDigits / 3);

              //   const normalisedPrice = price / Math.pow(1000, suffixIndex);

              //   let precision = 2;
              //   if (normalisedPrice < 1) {
              //       precision = 1;
              //   }

              //   const suffixes = ["", "k", "m", "b","t"];
              //   return normalised.toPrecision(precision) + suffixes[suffixIndex];

              
              var year = data.Year;
              feature.properties.honey = +(price.replace(/,/g, ""));
              feature.properties.year = +year
            }
          })
        };

      if (geojson !=null) {
        myMap.removeLayer(geojson);
      }


      // Create a new choropleth layer
      geojson = L.choropleth(response, {
        // Define what  property in the features to use
        valueProperty: "honey",

        // Set color scale
        scale: ["#e80a02", "#f0e40a", "#057d0d"],

       
        // Number of breaks in step range
        steps: 10,

        // q for quartile, e for equidistant, k for k-means
        mode: "q",
        style: {
          // Border color
          color: "#fff",
          weight: 1,
          fillOpacity: 0.8
        },

        // Binding a pop-up to each layer
        onEachFeature: function(feature, layer) {
          layer.bindPopup("<h1>" + feature.properties.year + "</h1><hr>" + "<h2>" + feature.properties.name +"</h2><hr>" +"<h2>Honey Production in $:</h2> " + "<h3>" + feature.properties.honey + "</h3>");
        }
      }).addTo(myMap);
      var limits = geojson.options.limits;
      var colors = geojson.options.colors;
      d3.select("#legendMin").text(limits[0]);
      d3.select("#legendMax").text(limits[limits.length-1]);
      var labels = [];
      limits.forEach(function(limit, index) {
        labels.push("<li style=\"background-color: " + colors[index] + "\"></li>");
      });

      d3.select("#legendColors").html(labels.join(""));

    }
      // Set up the legend
      var legend = L.control({ position: "bottomright" });
      legend.onAdd = function() {
        var div = L.DomUtil.create("div", "info legend");

        // Add min & max
        var legendInfo = "<h1>Honey Production in $</h1>" +
          "<div class=\"labels\">" +
            "<div id=\"legendMin\" class=\"min\">" + 0 + "</div>" +
            "<div id=\"legendMax\" class=\"max\">" + 1 + "</div>" +
          "</div>" + "<ul id=\"legendColors\"> </ul>"
        div.innerHTML = legendInfo;

        div.innerHTML += "<input id=\"slider\" data-slider-id=\"slider\" type=\"text\" data-slider-min=\"0\" data-slider-max=\"20\" data-slider-step=\"1\" data-slider-value=\"20\" data-slider-handle=\"custom\" />";
        div.innerHTML += "<span id=\"currentSliderValLabel\">Year: <span id=\"sliderVal\">2018</span></span>"
        return div;
      };

      // Adding legend to the map
      legend.addTo(myMap);

      // Disable dragging when user's cursor enters the element
     legend.getContainer().addEventListener('mouseover', function () {
         myMap.dragging.disable();
     });
     // Re-enable dragging when user's cursor leaves the element
     legend.getContainer().addEventListener('mouseout', function () {
         myMap.dragging.enable();
     });

   drawChoropleth (latestYear)

      // Adding the slider to the legend
      var slider = new Slider('#slider', {
        formatter: function (value) {
          return 'Current value: ' + value;
        },
        min: Math.min(...years),
        max: Math.max(...years),
      });

      var currentSliderValue=0

      slider.on("slide", function (sliderValue) {
        if (sliderValue != currentSliderValue) {
        console.log(sliderValue);
        drawChoropleth(sliderValue);
        currentSliderValue=sliderValue;
        document.getElementById("sliderVal").textContent = sliderValue;
        }
      });

      slider.setValue(2000);

    });
  });

  // function abbreviateNumber(value) {

  //   if (value <= 1000) {
  //       return value.toString();
  //   }

  //   const numDigits = (""+value).length;
  //   const suffixIndex = Math.floor(numDigits / 3);

  //   const normalisedValue = value / Math.pow(1000, suffixIndex);

  //   let precision = 2;
  //   if (normalisedValue < 1) {
  //       precision = 1;
  //   }

  //   const suffixes = ["", "k", "m", "b","t"];
  //   return normalisedValue.toPrecision(precision) + suffixes[suffixIndex];