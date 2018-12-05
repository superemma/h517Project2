			//Width and height of map
			var width = 960;
			var height = 500;
			// D3 Projection
			var projection = d3.geo.albersUsa()
							   .translate([width/2, height/2]) // translate to center of screen
							   .scale([1000]);          
							   // scale things down so see entire US
			        
			// Define path generator
			var path = d3.geo.path()               
			// path generator that will convert GeoJSON to SVG paths
					  	 .projection(projection);  
					  	 // tell path generator to use albersUsa projection
					
			// Define linear scale for output
			// var color = d3.scale.linear()
			// 			  .range(["#2c7bb6","#abd9e9","#ffffbf","#fdae61","#d7191c"]);
			var color = d3.scale.linear()
			 			  .range(["#fef0d9","#fdcc8a","#fc8d59","#e34a33","#b30000"]);
			var legendText = ["35%+","30-34.9%","25-29.9%","20-24.9%","15-19.9%"];

			// mouse over the time line, you will see the change on the map
			var year_arr = ["r_2003","r_2004","r_2005","r_2006","r_2007","r_2008","r_2009","r_2010","r_2011","r_2012","r_2013","r_2014","r_2015","r_2016","r_2017"];
			//adding the legends
			for(var i=0;i<6;i++){

			}
            var year = "2017"
			//Create SVG element and append map to the SVG
			var svg = d3.select("#usmap")
						.append("svg")
						.attr("width", width*2)
						.attr("height", height);
			
			var time_svg = d3.select("#timeline")
						.append("svg")
						.attr("width", width*2)
						.attr("height", 100);
			// });
			//label the time line:
			var circle_x = [];
			for(var i=0;i<15;i++){
				circle_x.push(i*60);
			}
			//label the time on the line:
			var timelabels = [{x:0,y:50,time:2003},
			{x:60,y:50,time:2004},{x:120,y:50,time:2005},
			{x:180,y:50,time:2006},{x:240,y:50,time:2007},
			{x:300,y:50,time:2008},{x:360,y:50,time:2009},
			{x:420,y:50,time:2010},{x:480,y:50,time:2011},
			{x:540,y:50,time:2012},{x:600,y:50,time:2013},
			{x:660,y:50,time:2014},{x:720,y:50,time:2015},
			{x:780,y:50,time:2016},{x:840,y:50,time:2017}];
			
			var horizon = [{ "x": 40,"y": 25},{ "x": 900,"y": 25}];
			//This is the accessor function we talked about above
			var lineFunction = d3.svg.line()
                         .x(function(d) { return d.x; })
                         .y(function(d) { return d.y; })
                         .interpolate("basis");
            //The line SVG Path we draw
			var lineGraph = time_svg.append("path")
                            .attr("d", lineFunction(horizon))
                            .attr("stroke", "steelblue")
                            .attr("stroke-width", 2)
                            .attr("fill", "none");             
			var circleSelection = time_svg.selectAll("circle")
											.data(timelabels)
											.enter()
											.append("circle")
											.attr("cx",function(d){
												return d.x;
											})
											.attr("cy",25)
											.attr("r",5)
											.attr("transform","translate("+50+","+0+")")
											.style("fill","steelblue")
											.on("mouseover",mouseover)
											.on("mouseout",mouseout);
			
			var textSelection = time_svg.selectAll("text")
										.data(timelabels)
										.enter()
										.append("text")
										.attr("transform","translate("+50+","+0+")")
										.attr("x",function(d){
											return (d.x-15);
										})
										.attr("y",50)
										.text(function(d){
											return d.time;
										})
										.attr("font-family","sans-serif")
										.attr("font-size","20px")
										.attr("fill","steelblue");


			// Append Div for tooltip to SVG
			var div = d3.select("body")
					    .append("div")   
			    		.attr("class", "tooltip")               
			    		.style("opacity", 0);
			
			
			//display the default page in 2017:
			d3.csv("data/obrbs.csv",function(data){
				color.domain([1,2,3,4,5]);
				var ratelabel=[];
				var year_sig = "r_2017";
				for(var i = 0; i < data.length; i++){
						if(data[i][year_sig]>=0.15&&data[i][year_sig]<0.2)
							ratelabel[i]=1;
						else if(data[i][year_sig]<0.25&&data[i][year_sig]>=0.2)
							ratelabel[i]=2;
						else if(data[i][year_sig]<0.3&&data[i][year_sig]>=0.25)
							ratelabel[i]=3;
						else if(data[i][year_sig]<0.35&&data[i][year_sig]>=0.3)
							ratelabel[i]=4;
						else if(data[i][year_sig]>=0.35)
							ratelabel[i]=5;
				}

				d3.json("data/us-states.json", function(json){
					for (var i = 0; i < data.length; i++){
							// Grab State Name
							var dataState = data[i].state;
							// Grab data value 
							// console.log(ratelabel);
							var dataValue = ratelabel[i];
							// Find the corresponding state inside the GeoJSON
							for (var j = 0; j < json.features.length; j++)  {
								var jsonState = json.features[j].properties.name;
								if (dataState == jsonState) {
									// Copy the data value into the JSON
									json.features[j].properties.visited = dataValue; 
									// Stop looking through the JSON
									break;
								}
							}
					}
					svg.selectAll("path")
							.data(json.features)
							.enter()
							.append("path")
							.attr("d", path)
							.style("stroke", "#fff")
							.style("stroke-width", "1")
							.style("fill", function(d) {
								// Get data value
								var value = d.properties.visited;
								console.log(value);
								if (value) {
								//If value exists…
									console.log(color(value));
									return color(value);

								} else {
								//If value is undefined…
									return "rgb(213,222,217)";
								}
							});
					svg.selectAll("text")
								.data(json.features)
							    .enter()
							    .append("svg:text")
							    .text(function(d){
							        return d.properties.abbr;
							    })
							    .attr("x", function(d){
							        return path.centroid(d)[0];
							    })
							    .attr("y", function(d){
							        return  path.centroid(d)[1];
							    })
							    .attr("text-anchor","middle")
							    .attr("fill","white")
							    .attr('font-size','6pt');
					d3.csv("data/us-state-capitals.csv", function(data) {
						svg.selectAll("circle")
								.data(data)
								.enter()
								.append("circle")
								.attr("cx", function(d) {
									//console.log(projection([d.lon, d.lat]));
									return projection([d.lon, d.lat])[0];
								})
								.attr("cy", function(d) {
									return projection([d.lon, d.lat])[1];
								})
								.attr("r", function(d) {
									return Math.sqrt(d.r_2017) * 4;
								})
								.style("fill", "steelblue")	
								.style("opacity", 0.5)	

								.on("mouseover", function(d) {
									//console.log(d);      
							    	div.transition()        
							      	   .duration(200)      
							           .style("opacity", .9);      
							           div.text(d.r_2017)
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
					var legend = d3.select("body").append("svg")
			      			.attr("class", "legend")
			     			.attr("width", 140)
			    			.attr("height", 200)
			   				.selectAll("g")
			   				.data(color.domain().slice().reverse())
			   				.enter()
			   				.append("g")
			     			.attr("transform", function(d, i) { 
			     				//console.log(d);
			     				return "translate(0," + i * 20 + ")"; 
			     			});

					  	legend.append("rect")
					   		  .attr("width", 18)
					   		  .attr("height", 18)
					   		  .style("fill", color);

					  	legend.append("text")
					  		  .data(legendText)
					      	  .attr("x", 24)
					      	  .attr("y", 9)
					      	  .attr("dy", ".35em")
					      	  .text(function(d) { return d; 	
					      	  });
				})
			});
var margin = {
    top: 5,
    right: 15,
    bottom: 5,
    left: 120
};
var width2 = 500 - margin.left - margin.right
  , height2 = 400 - margin.top - margin.bottom;

var svgintervention = d3.select("#intervention").append("svg").attr("width", width2+ margin.left + margin.right).attr("height", height2 + margin.top + margin.bottom).append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("trialsbyIntervention2003-2017.csv", function(data) {
    var x = d3.scale.linear().range([0, width2])            
        .domain([0, d3.max(data, function (d) {
                return +d.r_2017;
            })]);
    var y = d3.scale.ordinal().rangeRoundBands([
        350, 0], 0.1).domain(data.map(function(d) {
        return d.Intervention;
    }));
    //make y axis to show bar names
    var yAxis = d3.svg.axis().scale(y).tickSize(0).orient("left");
    var gy = svgintervention.append("g").attr("class", "y axis").call(yAxis)
    var bars = svgintervention.selectAll(".bar").data(data).enter().append("g").style("fill", "#5f89ad")
    //append rects
    bars.append("rect").attr("class", "bar").attr("y", function(d) {
        return y(d.Intervention);
    }).attr("height", y.rangeBand()-10).attr("x", 0).attr("width", function(d) {
        return x(d.r_2017);
    });
    //add a value label to the right of each bar
    bars.append("text").attr("class", "label")//y position of the label is halfway down the bar
    .attr("y", function(d) {
        return y(d.Intervention) + y.rangeBand() / 2 -4;
    })//x position is 3 pixels to the right of the bar
    .attr("x", function(d) {
        return x(d.r_2017) + 1;
    }).text(function(d) {
        return d.r_2017;
    });
});

var svgphase = d3.select("#phase").append("svg").attr("width", width2+ margin.left + margin.right).attr("height", height2 + margin.top + margin.bottom).append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("trialsbyPhase2003-2017.csv", function(data) {
    var x = d3.scale.linear().range([0, width2])            
        .domain([0, d3.max(data, function (d) {
                return +d.r_2017;
            })]);
    var y = d3.scale.ordinal().rangeRoundBands([
        350, 0], 0.1).domain(data.map(function(d) {
        return d.phase ;
    }));
    //make y axis to show bar names
    var yAxis = d3.svg.axis().scale(y).tickSize(0).orient("left");
    var gy = svgphase.append("g").attr("class", "y axis").call(yAxis)
    var bars = svgphase.selectAll(".bar").data(data).enter().append("g").style("fill", "#5f89ad")
    //append rects
    bars.append("rect").attr("class", "bar").attr("y", function(d) {
        return y(d.phase);
    }).attr("height", y.rangeBand()-10).attr("x", 0).attr("width", function(d) {
        return x(d.r_2017);
    });
    //add a value label to the right of each bar
    bars.append("text").attr("class", "label")//y position of the label is halfway down the bar
    .attr("y", function(d) {
        return y(d.phase) + y.rangeBand() / 2 -4;
    })//x position is 3 pixels to the right of the bar
    .attr("x", function(d) {
        return x(d.r_2017) + 1;
    }).text(function(d) {
        return d.r_2017;
    });
});
			function mouseout(d,i){
				d3.select(this).attr({
					r:5
				});
			}
			function mouseover(d,i){
				//console.log(d);
				//console.log(i);
				var index=i;
                var year = year_arr[index];
                var year_sig = year_arr[index];
				d3.select(this).attr({
					fill:"orange",
					r:5*2
				});
				d3.csv("data/obrbs.csv",function(data){
					color.domain([1,2,3,4,5]);
					var ratelabel=[];
					
					//console.log(year_sig);
					for(var i = 0; i < data.length; i++){
						if(data[i][year_sig]<0.2&&data[i][year_sig]>=0.15)
							ratelabel[i]=1;
						else if(data[i][year_sig]<0.25&&data[i][year_sig]>=0.2)
							ratelabel[i]=2;
						else if(data[i][year_sig]<0.3&&data[i][year_sig]>=0.25)
							ratelabel[i]=3;
						else if(data[i][year_sig]<0.35&&data[i][year_sig]>=0.3)
							ratelabel[i]=4;
						else if(data[i][year_sig]>=0.35)
							ratelabel[i]=5;
					}
					d3.json("data/us-states.json", function(json){
						//console.log(json);
						for (var i = 0; i < data.length; i++){
							// Grab State Name
							var dataState = data[i].state;
							// Grab data value 
							// console.log(ratelabel);
							var dataValue = ratelabel[i];
							// Find the corresponding state inside the GeoJSON
							for (var j = 0; j < json.features.length; j++)  {
								var jsonState = json.features[j].properties.name;
								if (dataState == jsonState) {
									// Copy the data value into the JSON
									json.features[j].properties.visited = dataValue; 
									// Stop looking through the JSON
									break;
								}
							}
						}
						svg.selectAll("path").remove();
						svg.selectAll("text").remove();
						svg.selectAll("circle").remove();
						svg.selectAll("path")
							.data(json.features)
							.enter()
							.append("path")
							.attr("d", path)
							.style("stroke", "#fff")
							.style("stroke-width", "1")
							.style("fill", function(d) {
								// Get data value
								var value = d.properties.visited;

								if (value) {
								//If value exists…
								return color(value);
								} else {
								//If value is undefined…
								return "rgb(213,222,217)";
								}
							});
							svg.selectAll("text")
								.data(json.features)
							    .enter()
							    .append("svg:text")
							    .text(function(d){
							        return d.properties.abbr;
							    })
							    .attr("x", function(d){
							        return path.centroid(d)[0];
							    })
							    .attr("y", function(d){
							        return  path.centroid(d)[1];
							    })
							    .attr("text-anchor","middle")
							    .attr("fill","white")
							    .attr('font-size','6pt');
                        
							d3.csv("data/us-state-capitals.csv", function(data) {
								svg.selectAll("circle")
									.data(data)
									.enter()
									.append("circle")
									.attr("cx", function(d) {
										//console.log(projection([d.lon, d.lat]));
										return projection([d.lon, d.lat])[0];
									})
									.attr("cy", function(d) {
										return projection([d.lon, d.lat])[1];
									})
									.attr("r", function(d) {
										return Math.sqrt(d[year_sig]) * 3;
									})
									.style("fill", "steelblue")	
									.style("opacity", 0.60)	

									.on("mouseover", function(d) {      
								    	div.transition()        
								      	   .duration(200)      
								           .style("opacity", .9);      
								           div.text(d[year_sig])
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

					});

				});
               
    d3.csv("trialsbyIntervention2003-2017.csv", function(data) {
    svgintervention.selectAll(".bar").remove();
    svgintervention.selectAll("text").remove(); 
    var x = d3.scale.linear().range([0, width2])            
        .domain([0, d3.max(data, function (d) {
                return +d[year_sig];
            })]);
    var y = d3.scale.ordinal().rangeRoundBands([
        350, 0], 0.1).domain(data.map(function(d) {
        return d.Intervention;
    }));
    //make y axis to show bar names
    var yAxis = d3.svg.axis().scale(y).tickSize(0).orient("left");
    var gy = svgintervention.append("g").attr("class", "y axis").call(yAxis)

    var bars = svgintervention.selectAll(".bar").data(data).enter().append("g").style("fill", "#5f89ad")
    //append rects
    bars.append("rect").attr("class", "bar").attr("y", function(d) {
        return y(d.Intervention);
    }).attr("height", y.rangeBand()-10).attr("x", 0).attr("width", function(d) {
        return x(d[year_sig]);
    });
    //add a value label to the right of each bar
    bars.append("text").attr("class", "label").attr("id", "yvalue")//y position of the label is halfway down the bar
    .attr("y", function(d) {
        return y(d.Intervention) + y.rangeBand() / 2 -4;
    })//x position is 3 pixels to the right of the bar
    .attr("x", function(d) {
        return x(d[year_sig]) + 1;
    }).text(function(d) {
        return d[year_sig];
    });
});
d3.csv("trialsbyPhase2003-2017.csv", function(data) {
    svgphase.selectAll(".bar").remove();
    svgphase.selectAll("text").remove(); 
    var x = d3.scale.linear().range([0, width2])            
        .domain([0, d3.max(data, function (d) {
                return +d[year_sig];
            })]);
    var y = d3.scale.ordinal().rangeRoundBands([
        350, 0], 0.1).domain(data.map(function(d) {
        return d.phase ;
    }));
    //make y axis to show bar names
    var yAxis = d3.svg.axis().scale(y).tickSize(0).orient("left");
    var gy = svgphase.append("g").attr("class", "y axis").call(yAxis)
    var bars = svgphase.selectAll(".bar").data(data).enter().append("g").style("fill", "#5f89ad")
    //append rects
    bars.append("rect").attr("class", "bar").attr("y", function(d) {
        return y(d.phase);
    }).attr("height", y.rangeBand()-10).attr("x", 0).attr("width", function(d) {
        return x(d[year_sig]);
    });
    //add a value label to the right of each bar
    bars.append("text").attr("class", "label")//y position of the label is halfway down the bar
    .attr("y", function(d) {
        return y(d.phase) + y.rangeBand() / 2 -4;
    })//x position is 3 pixels to the right of the bar
    .attr("x", function(d) {
        return x(d[year_sig]) + 1;
    }).text(function(d) {
        return d[year_sig];
    });
});
d3.csv("trialsbycondition2003-2017.csv", function(error, data){
    svgcondition.selectAll("circle").remove();
    svgcondition.selectAll("text").remove(); 
        //convert numerical values from strings to numbers
    data = data.map(function(d){ d.value = +d[year_sig]; return d; });
    //bubbles needs very specific format, convert data to this.
    var nodes = bubble.nodes({children:data}).filter(function(d) { return !d.children; });

    //setup the chart
    var bubbles = svgcondition.append("g")
        .attr("transform", "translate(0,0)")
        .selectAll(".bubble")
        .data(nodes)
        .enter();

    //create the bubbles
    bubbles.append("circle")
        .attr("r", function(d){ return d.r*0.75; })
        .attr("cx", function(d){ return d.x; })
        .attr("cy", function(d){ return d.y; })
        .style("fill", function(d) { return Ccolor(d.value); })
    .on("mouseover", function(d) {      
								    	div.transition()        
								      	   .duration(200)      
								           .style("opacity", .9);      
								           div.text(d["Condition"])
								           .style("left", (d3.event.pageX) + "px")     
								           .style("top", (d3.event.pageY - 28) + "px");    
									})   

							    	// fade out tooltip on mouse out               
								    .on("mouseout", function(d) {       
								        div.transition()        
								           .duration(500)      
								           .style("opacity", 0);   
								    })
    ;
    //format the text for each bubble
    bubbles.append("text")
    .filter(function(d) { return d[year_sig]>1 })
        .attr("x", function(d){ return d.x; })
        .attr("y", function(d){ return d.y; })
        .attr("text-anchor", "middle")
        .text(function(d){ return d["Condition"]; })
        .style({
            "fill":"Black", 
            "font-family":"Helvetica Neue, Helvetica, Arial, san-serif",
            "font-size": "8px"
        });
        bubbles.append("text")
    .filter(function(d) { return d[year_sig]>1 })
        .attr("x", function(d){ return d.x; })
        .attr("y", function(d){ return d.y+10; })
        .attr("text-anchor", "middle")
        .text(function(d){ return d[year_sig]; })
        .style({
            "fill":"white", 
            "font-family":"Helvetica Neue, Helvetica, Arial, san-serif",
            "font-size": "8px"
        });
})                
d3.csv("trialsbyStudyType2003-2017.csv", function(error, data){
svgStudyType.selectAll("g.slice").remove();
    var pie = d3.layout.pie().value(function(d){return d[year_sig];});
// Declare an arc generator function
var arc = d3.svg.arc().outerRadius(r);
// Select paths, use arc generator to draw
var arcs = svgStudyType.selectAll("g.slice").data(pie).enter().append("svg:g").attr("class", "slice");
arcs.append("svg:path")
    .attr("fill", function(d, i){return aColor[i];})
    .attr("d", function (d) {return arc(d);})
;
// Add the text
arcs.append("svg:text")
    .attr("transform", function(d){
        d.innerRadius = 80; /* Distance of label to the center*/
        d.outerRadius = r;
        return "translate(" + arc.centroid(d) + ")";}    )
    .attr("text-anchor", "middle")
    .text( function(d, i) {return data[i].StudyType +" "+ data[i][year_sig];})
;
    });
d3.csv("trialsbyFunder2003-2017.csv", function(error, data){
    svgfunder.selectAll("g.slice").remove();
    var pie = d3.layout.pie().value(function(d){return d[year_sig];});
// Declare an arc generator function
var arc = d3.svg.arc().outerRadius(r);
// Select paths, use arc generator to draw
var arcs = svgfunder.selectAll("g.slice").data(pie).enter().append("svg:g").attr("class", "slice");
arcs.append("svg:path")
    .attr("fill", function(d, i){return aColor[i];})
    .attr("d", function (d) {return arc(d);})
;
// Add the text
arcs.append("svg:text")
    .attr("transform", function(d){
        d.innerRadius = 80; /* Distance of label to the center*/
        d.outerRadius = r;
        return "translate(" + arc.centroid(d) + ")";}    )
    .attr("text-anchor", "middle")
    .text( function(d, i) {return data[i].funder +" "+ data[i][year_sig];});
    });                  
                
d3.csv("trialsbyGender2003-2017.csv", function(error, data){
    svggender.selectAll("g.slice").remove();
    var pie = d3.layout.pie().value(function(d){return d[year_sig];});
// Declare an arc generator function
var arc = d3.svg.arc().outerRadius(r);
// Select paths, use arc generator to draw
var arcs = svggender.selectAll("g.slice").data(pie).enter().append("svg:g").attr("class", "slice");
arcs.append("svg:path")
    .attr("fill", function(d, i){return aColor[i];})
    .attr("d", function (d) {return arc(d);})
;
// Add the text
arcs.append("svg:text")
    .attr("transform", function(d){
        d.innerRadius = 80; /* Distance of label to the center*/
        d.outerRadius = r;
        return "translate(" + arc.centroid(d) + ")";}    )
    .attr("text-anchor", "middle")
    .text( function(d, i) {return data[i].Gender +" "+ data[i][year_sig];});
    });
                
d3.csv("trialsbyAgeGroup2003-2017.csv", function(error, data){
    svgage.selectAll("g.slice").remove();
    var pie = d3.layout.pie().value(function(d){return d[year_sig];});
// Declare an arc generator function
var arc = d3.svg.arc().outerRadius(r);
// Select paths, use arc generator to draw
var arcs = svgage.selectAll("g.slice").data(pie).enter().append("svg:g").attr("class", "slice");
arcs.append("svg:path")
    .attr("fill", function(d, i){return aColor[i];})
    .attr("d", function (d) {return arc(d);})
;
// Add the text
arcs.append("svg:text")
    .attr("transform", function(d){
        d.innerRadius = 80; /* Distance of label to the center*/
        d.outerRadius = r;
        return "translate(" + arc.centroid(d) + ")";}    )
    .attr("text-anchor", "middle")
    .text( function(d, i) {return data[i].age +" "+ data[i][year_sig];});
    });                
                
};

var diameter = 500, //max size of the bubbles
    Ccolor    = d3.scale.category20(); //color category

var bubble = d3.layout.pack()
    .sort(null)
    .size([diameter, diameter])
    .padding(1.5);

var svgcondition = d3.select("#condition")
    .append("svg")
    .attr("width", diameter)
    .attr("height", diameter)
    .attr("class", "bubble");

d3.csv("trialsbycondition2003-2017.csv", function(error, data){
        //convert numerical values from strings to numbers
    data = data.map(function(d){ d.value = +d["r_2017"]; return d; });
    //bubbles needs very specific format, convert data to this.
    var nodes = bubble.nodes({children:data}).filter(function(d) { return !d.children; });

    //setup the chart
    var bubbles = svgcondition.append("g")
        .attr("transform", "translate(0,0)")
        .selectAll(".bubble")
        .data(nodes)
        .enter();

    //create the bubbles
    bubbles.append("circle")
        .attr("r", function(d){ return d.r*0.75; })
        .attr("cx", function(d){ return d.x; })
        .attr("cy", function(d){ return d.y; })
        .style("fill", function(d) { return Ccolor(d.value); })
    .on("mouseover", function(d) {      
								    	div.transition()        
								      	   .duration(200)      
								           .style("opacity", .9);      
								           div.text(d["Condition"])
								           .style("left", (d3.event.pageX) + "px")     
								           .style("top", (d3.event.pageY - 28) + "px");    
									})   

							    	// fade out tooltip on mouse out               
								    .on("mouseout", function(d) {       
								        div.transition()        
								           .duration(500)      
								           .style("opacity", 0);   
								    })
    ;

    //format the text for each bubble
    bubbles.append("text")
    .filter(function(d) { return d["r_2017"]>0 })
        .attr("x", function(d){ return d.x; })
        .attr("y", function(d){ return d.y; })
        .attr("text-anchor", "middle")
        .text(function(d){ return d["Condition"]; })
        .style({
            "fill":"Black", 
            "font-family":"Helvetica Neue, Helvetica, Arial, san-serif",
            "font-size": "8px"
        });
        bubbles.append("text")
    .filter(function(d) { return d["r_2017"]>1 })
        .attr("x", function(d){ return d.x; })
        .attr("y", function(d){ return d.y+10; })
        .attr("text-anchor", "middle")
        .text(function(d){ return d["r_2017"]; })
        .style({
            "fill":"white", 
            "font-family":"Helvetica Neue, Helvetica, Arial, san-serif",
            "font-size": "8px"
        });
});

    var w = 500,                        //width
    h = 400,                            //height
    r = 150,                            //radius
    aColor = [
    'rgb(178, 55, 56)',
    'rgb(213, 69, 70)',
    'rgb(230, 125, 126)',
    'rgb(239, 183, 182)'
];     //builtin range of colors
    var svgStudyType = d3.select("#type")
        .append("svg:svg").attr("width", w).attr("height", h).append("svg:g").attr("transform", "translate(" + r + "," + r + ")");
d3.csv("trialsbyStudyType2003-2017.csv", function(error, data){
    svgStudyType.data([data])
    var pie = d3.layout.pie().value(function(d){return d.r_2017;});
// Declare an arc generator function
var arc = d3.svg.arc().outerRadius(r);
// Select paths, use arc generator to draw
var arcs = svgStudyType.selectAll("g.slice").data(pie).enter().append("svg:g").attr("class", "slice");
arcs.append("svg:path")
    .attr("fill", function(d, i){return aColor[i];})
    .attr("d", function (d) {return arc(d);})
;
// Add the text
arcs.append("svg:text")
    .attr("transform", function(d){
        d.innerRadius = 80; /* Distance of label to the center*/
        d.outerRadius = r;
        return "translate(" + arc.centroid(d) + ")";}    )
    .attr("text-anchor", "middle")
    .text( function(d, i) {return data[i].StudyType +" "+ data[i].r_2017;})
;
    });
    var svggender = d3.select("#gender")
        .append("svg:svg").attr("width", w).attr("height", h).append("svg:g").attr("transform", "translate(" + r + "," + r + ")");
d3.csv("trialsbyGender2003-2017.csv", function(error, data){
    svggender.data([data]);
    var pie = d3.layout.pie().value(function(d){return d.r_2017;});
// Declare an arc generator function
var arc = d3.svg.arc().outerRadius(r);
// Select paths, use arc generator to draw
var arcs = svggender.selectAll("g.slice").data(pie).enter().append("svg:g").attr("class", "slice");
arcs.append("svg:path")
    .attr("fill", function(d, i){return aColor[i];})
    .attr("d", function (d) {return arc(d);})
;
// Add the text
arcs.append("svg:text")
    .attr("transform", function(d){
        d.innerRadius = 80; /* Distance of label to the center*/
        d.outerRadius = r;
        return "translate(" + arc.centroid(d) + ")";}    )
    .attr("text-anchor", "middle")
    .text( function(d, i) {return data[i].Gender +" "+ data[i].r_2017;})
;
    });
    var svgfunder = d3.select("#funder")
        .append("svg:svg").attr("width", w).attr("height", h).append("svg:g").attr("transform", "translate(" + r + "," + r + ")");
d3.csv("trialsbyFunder2003-2017.csv", function(error, data){
    svgfunder.data([data]);
    var pie = d3.layout.pie().value(function(d){return d.r_2017;});
// Declare an arc generator function
var arc = d3.svg.arc().outerRadius(r);

// Select paths, use arc generator to draw
var arcs = svgfunder.selectAll("g.slice").data(pie).enter().append("svg:g").attr("class", "slice");
arcs.append("svg:path")
    .attr("fill", function(d, i){return aColor[i];})
    .attr("d", function (d) {return arc(d);})
;
// Add the text
arcs.append("svg:text")
    .attr("transform", function(d){
        d.innerRadius = 80; /* Distance of label to the center*/
        d.outerRadius = r;
        return "translate(" + arc.centroid(d) + ")";}    )
    .attr("text-anchor", "middle")
    .text( function(d, i) {return data[i].funder +" "+ data[i].r_2017;})
;
 
    });
    var svgage = d3.select("#age")
        .append("svg:svg").attr("width", w).attr("height", h).append("svg:g").attr("transform", "translate(" + r + "," + r + ")");
d3.csv("trialsbyAgeGroup2003-2017.csv", function(error, data){
    svgage.data([data]);
    var pie = d3.layout.pie().value(function(d){return d.r_2017;});
// Declare an arc generator function
var arc = d3.svg.arc().outerRadius(r);
// Select paths, use arc generator to draw
var arcs = svgage.selectAll("g.slice").data(pie).enter().append("svg:g").attr("class", "slice");
arcs.append("svg:path")
    .attr("fill", function(d, i){return aColor[i];})
    .attr("d", function (d) {return arc(d);})
;
// Add the text
arcs.append("svg:text")
    .attr("transform", function(d){
        d.innerRadius = 80; /* Distance of label to the center*/
        d.outerRadius = r;
        return "translate(" + arc.centroid(d) + ")";}    )
    .attr("text-anchor", "middle")
    .text( function(d, i) {return data[i].age +" "+ data[i].r_2017;});
    });

	function findMaxY(data){  // Define function "findMaxY"
	    var maxYValues = data.map(function(d) { 
	      if (d.visible){
	        return d3.max(d.values, function(value) { // Return max rating value
	          return value.rating; })
	      }
	    });
	    return d3.max(maxYValues);
	  }



