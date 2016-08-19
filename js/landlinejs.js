var census =  {
  "40001": [ "Adair", 22.004],
  "40003": [ "Alfalfa", 5.868],
  "40005": [ "Atoka", 13.793],
  "40007": [ "Beaver", 5.427],
  "40009": [ "Beckham", 23.768],
  "40011": [ "Blaine", 9.833],
  "40013": [ "Bryan", 44.884],
  "40015": [ "Caddo", 29.343],
  "40017": [ "Canadian", 133.378],
  "40019": [ "Carter", 48.689],
  "40021": [ "Cherokee", 48.447],
  "40023": [ "Choctaw", 14.997],
  "40025": [ "Cimarron", 2.216],
  "40027": [ "Cleveland", 274.458],
  "40029": [ "Coal", 5.651],
  "40031": [ "Comanche", 124.648],
  "40033": [ "Cotton", 5.996],
  "40035": [ "Craig", 14.818],
  "40037": [ "Creek", 70.892],
  "40039": [ "Custer", 29.744],
  "40041": [ "Delaware", 41.459],
  "40043": [ "Dewey", 4.995],
  "40045": [ "Ellis", 4.231],
  "40047": [ "Garfield", 63.569],
  "40049": [ "Garvin", 27.755],
  "40051": [ "Grady", 54.648],
  "40053": [ "Grant", 4.523],
  "40055": [ "Greer", 6.070],
  "40057": [ "Harmon", 2.788],
  "40059": [ "Harper", 3.754],
  "40061": [ "Haskell", 12.845],
  "40063": [ "Hughes", 13.735],
  "40065": [ "Jackson", 25.574],
  "40067": [ "Jefferson", 6.276],
  "40069": [ "Johnston", 10.980],
  "40071": [ "Kay", 45.366],
  "40073": [ "Kingfisher", 15.584],
  "40075": [ "Kiowa", 9.144],
  "40077": [ "Latimer", 10.483],
  "40079": [ "Le Flore", 49.605],
  "40081": [ "Lincoln", 35.042],
  "40083": [ "Logan", 45.996],
  "40085": [ "Love", 9.870],
  "40087": [ "McClain", 38.066],
  "40089": [ "McCurtain", 33.048],
  "40091": [ "McIntosh", 19.990],
  "40093": [ "Major", 7.771],
  "40095": [ "Marshall", 16.232],
  "40097": [ "Mayes", 40.887],
  "40099": [ "Murray", 13.936],
  "40101": [ "Muskogee", 69.699],
  "40103": [ "Noble", 11.554],
  "40105": [ "Nowata", 10.539],
  "40107": [ "Okfuskee", 12.181],
  "40109": [ "Oklahoma", 776.864],
  "40111": [ "Okmulgee", 39.187],
  "40113": [ "Osage", 47.887],
  "40115": [ "Ottawa", 31.981],
  "40117": [ "Pawnee", 16.436],
  "40119": [ "Payne", 80.850],
  "40121": [ "Pittsburg", 44.610],
  "40123": [ "Pontotoc", 38.194],
  "40125": [ "Pottawatomie", 71.875],
  "40127": [ "Pushmataha", 11.183],
  "40129": [ "Roger Mills", 3.788],
  "40131": [ "Rogers", 90.802],
  "40133": [ "Seminole", 25.548],
  "40135": [ "Sequoyah", 41.153],
  "40137": [ "Stephens", 44.581],
  "40139": [ "Texas", 21.489],
  "40141": [ "Tillman", 7.515],
  "40143": [ "Tulsa", 639.242],
  "40145": [ "Wagoner", 76.559],
  "40147": [ "Washington", 52.021],
  "40149": [ "Washita", 11.661],
  "40151": [ "Woods", 9.304],
  "40153": [ "Woodward", 21.559]

}

$(function() {

        //waypoint
        var waypoint = new Waypoint({
          element: document.getElementById('intro_guff'),
          handler: function() {
            $("#state_map").hide();
        }
      })


        drawStateMap();

        // Initialize the map
        var map = new Landline.Stateline("#landline_container", "counties", options);
        
        // Set up the tooltip template
        var tmpl = _.template($("#landline_tooltip_tmpl").html());

        // Add tooltips, and cache the existing style
        // to put it back in place on mouseout
        map.on('mouseover', function(e, path, data) {
          data.existingStyle = (data.existingStyle || {});
          data.existingStyle["fill"]        = path.attr("fill");
          data.existingStyle["strokeWidth"] = path.attr("stroke-width");
          path.attr("fill", "#999").attr("stroke-width", 1);
        });

        map.on('mousemove', function(e, path, data) {
          $("#landline_tooltip").html(tmpl({
              n          : data.get('NAME'), 
              med_income : commaDelimit(census[data.fips][1]), 
            })).css("left", e.pageX + 20).css("top", e.pageY + 20).show();
        });

        map.on('mouseout', function(e, path, data) {
          $("#landline_tooltip").hide();
          _(data.existingStyle).each(function(v, k) {
            path.attr(k, v);
          });
        });

        // Census data convenience functions
        var incomeColor = function(income) {
          if (income < 9.176) return "white";
          if (income < 14.890) return "rgba(254, 227, 215, 0.5)";
          if (income < 32.621) return "rgba(252, 187, 161, 0.5)";
          if (income < 48.641) return "rgba(251, 106, 74, 0.5)";
          return "rgba(222, 45, 38, 0.5)";
        };

        var commaDelimit = function(a){
          return _.isNumber(a) ? a.toString().replace(/(d)(?=(ddd)+(?!d))/g,"$1,") : "";
        };

        // Color states by income level
        _(census).each(function(ary, fips) {
          map.style(fips, "fill", incomeColor(ary[1]));
        })

        // Draw the map
        map.createMap();


        //draw dots
        var width = 2400;
        var height = 2000;
        // D3 Projection
        var projection = d3.geo.albers()
                   .translate([width/2, height/2])    // translate to center of screen
                   .scale(10000);          // scale things down so see entire US
                
        // Define path generator
        var path = d3.geo.path()               // path generator that will convert GeoJSON to SVG paths
                 .projection(projection);  // tell path generator to use albersUsa projection
            
        // Define linear scale for output
        var color = d3.scale.linear()
                .range(['rgba(0,0,34,0)','rgba(0,0,34,0)']);
        // var legendText = ["Cities Lived", "States Lived", "States Visited", "Nada"];
        //Create SVG element and append map to the SVG
        var svg = d3.select("#trauma_dot")
              .append("svg")
              .attr("width", width)
              .attr("height", height);
                
        // Append Div for tooltip to SVG
        var div = d3.select("#trauma_dot")
                .append("div")   
                .attr("class", "tooltip")               
                .style("opacity", 0);
      // Load in my states data!
      d3.csv("data/2014state_fatalinjury.csv", function(data) {
      color.domain([40,60,80,110]); // setting the range of the input data
      // Load GeoJSON data and merge with states data
      d3.json("data/us-states.json", function(json) {
      // Loop through each state data value in the .csv file
      for (var i = 0; i < data.length; i++) {
        // Grab State Name
        var dataState = data[i].state;
        // Grab data value 
        var dataValue = data[i].age_adjusted_rate;
        // Find the corresponding state inside the GeoJSON
        for (var j = 0; j < json.features.length; j++)  {
          var jsonState = json.features[j].properties.name;
          if (dataState == jsonState) {
          // Copy the data value into the JSON
          json.features[j].properties.age_adjusted_rate = dataValue; 
          // Stop looking through the JSON
          break;
          }
        }
      }
    
    // Bind the data to the SVG and create one path per GeoJSON feature
    svg.selectAll("path")
      .data(json.features)
      .enter()
      .append("path")
      .attr("d", path)
      .style("stroke", "#fff")
      .style("stroke-width", "1")
      .style("fill", function(d) {
      // Get data value
      var value = d.properties.age_adjusted_rate;
      if (value) {
      //If value exists…
      return color(value);
      } else {
      //If value is undefined…
      return "rgb(213,222,217)";
      }
    });


    d3.csv("data/example.csv", function(data) {
    svg.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", function(d) {
        return projection([d.lon, d.lat])[0];
      })
      .attr("cy", function(d) {
        return projection([d.lon, d.lat])[1];
      })
      .attr("r", function(d) {
        return 10;
      })
        .style("fill", "rgb(217,91,67)")  
        .style("opacity", 0.85) 
      // Modification of custom tooltip code provided by Malcolm Maclean, "D3 Tips and Tricks" 
      // http://www.d3noob.org/2013/01/adding-tooltips-to-d3js-graph.html
      .on("mouseover", function(d) {      
          div.transition()        
               .duration(200)      
               .style("opacity", .9);      
               div.text(d.place)
               .style("left", (d3.event.pageX) + "px")     
               .style("top", (d3.event.pageY - 28) + "px");    
      })   
        // fade out tooltip on mouse out               
        .on("mouseout", function(d) {       
            div.transition()        
               .duration(500)      
               .style("opacity", 0);   
        });
    });  
     
     
    d3.csv("data/traumacenterlist_ok.csv", function(data) {
    svg.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .filter(function(d) { return d.level == 1 || d.level == 2;})
      .attr("cx", function(d) {
        return projection([d.lon, d.lat])[0];
      })
      .attr("cy", function(d) {
        return projection([d.lon, d.lat])[1];
      })
      .attr("r", function(d) {
        return 5;
      })
        .style("fill", "rgb(217,91,67)")  
        .style("opacity", 0.85) 
      // Modification of custom tooltip code provided by Malcolm Maclean, "D3 Tips and Tricks" 
      // http://www.d3noob.org/2013/01/adding-tooltips-to-d3js-graph.html
      .on("mouseover", function(d) {      
          div.transition()        
               .duration(200)      
               .style("opacity", .9);      
               div.text(d.place)
               .style("left", (d3.event.pageX) + "px")     
               .style("top", (d3.event.pageY - 28) + "px");    
      })   
        // fade out tooltip on mouse out               
        .on("mouseout", function(d) {       
            div.transition()        
               .duration(500)      
               .style("opacity", 0);   
        });
    });  


        
// Modified Legend Code from Mike Bostock: http://bl.ocks.org/mbostock/3888852
var legend = d3.select("body").append("svg")
            .attr("class", "legend")
          .attr("width", 140)
          .attr("height", 200)
          .selectAll("g")
          .data(color.domain().slice().reverse())
          .enter()
          .append("g")
          .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
    legend.append("rect")
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color);
    legend.append("text")
        .data(legendText)
          .attr("x", 24)
          .attr("y", 9)
          .attr("dy", ".35em")
          .text(function(d) { return d; });
  });
});
      });

