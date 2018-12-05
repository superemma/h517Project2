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
					d3.csv("data/us_state_capitals.csv", function(data) {
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

							// Modification of custom tooltip code provided by Malcolm Maclean, "D3 Tips and Tricks" 
							// http://www.d3noob.org/2013/01/adding-tooltips-to-d3js-graph.html
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

			function mouseout(d,i){
				d3.select(this).attr({
					r:5
				});

			}
			function mouseover(d,i){
				//console.log(d);
				//console.log(i);
				var index=i;
				d3.select(this).attr({
					fill:"orange",
					r:5*2
				});
				d3.csv("data/obrbs.csv",function(data){
					color.domain([1,2,3,4,5]);
					var ratelabel=[];
					var year_sig = year_arr[index];
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
							d3.csv("data/us_state_capitals.csv", function(data) {
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

								// Modification of custom tooltip code provided by Malcolm Maclean, "D3 Tips and Tricks" 
								// http://www.d3noob.org/2013/01/adding-tooltips-to-d3js-graph.html
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
			}
	 
			// // Map the cities I have lived in!
			// d3.csv("data/us_state_capitals.csv", function(data) {

			// 	svg.selectAll("circle")
			// 		.data(data)
			// 		.enter()
			// 		.append("circle")
			// 		.attr("cx", function(d) {
			// 			console.log(projection([d.lon, d.lat]));
			// 			return projection([d.lon, d.lat])[0];
			// 		})
			// 		.attr("cy", function(d) {
			// 			return projection([d.lon, d.lat])[1];
			// 		})
			// 		.attr("r", function(d) {
			// 			return Math.sqrt(d.default) * 4;
			// 		})
			// 		.style("fill", "rgb(217,91,67)")	
			// 		.style("opacity", 0.85)	

			// 	// Modification of custom tooltip code provided by Malcolm Maclean, "D3 Tips and Tricks" 
			// 	// http://www.d3noob.org/2013/01/adding-tooltips-to-d3js-graph.html
			// 		.on("mouseover", function(d) {      
			// 	    	div.transition()        
			// 	      	   .duration(200)      
			// 	           .style("opacity", .9);      
			// 	           div.text(d.place)
			// 	           .style("left", (d3.event.pageX) + "px")     
			// 	           .style("top", (d3.event.pageY - 28) + "px");    
			// 		})   

			//     	// fade out tooltip on mouse out               
			// 	    .on("mouseout", function(d) {       
			// 	        div.transition()        
			// 	           .duration(500)      
			// 	           .style("opacity", 0);   
			// 	    });
			// });  
			        
			// // Modified Legend Code from Mike Bostock: http://bl.ocks.org/mbostock/3888852
			// var legend = d3.select("body").append("svg")
			//       			.attr("class", "legend")
			//      			.attr("width", 140)
			//     			.attr("height", 200)
			//    				.selectAll("g")
			//    				.data(color.domain().slice().reverse())
			//    				.enter()
			//    				.append("g")
			//      			.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

			//   	legend.append("rect")
			//    		  .attr("width", 18)
			//    		  .attr("height", 18)
			//    		  .style("fill", color);

			//   	legend.append("text")
			//   		  .data(legendText)
			//       	  .attr("x", 24)
			//       	  .attr("y", 9)
			//       	  .attr("dy", ".35em")
			//       	  .text(function(d) { return d; 	
			//       	  });
			// 	});
			// });
	function findMaxY(data){  // Define function "findMaxY"
	    var maxYValues = data.map(function(d) { 
	      if (d.visible){
	        return d3.max(d.values, function(value) { // Return max rating value
	          return value.rating; })
	      }
	    });
	    return d3.max(maxYValues);
	  }



