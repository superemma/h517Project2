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
			var color = d3.scale.linear()
						  .range(["rgb(56, 161, 227)","rgb(80, 195, 186)","rgb(108, 200, 72)","rgb(249, 210, 106)","rgb(253, 140, 57)","rgb(252, 86, 98)"]);

			var legendText = ["35%+","30-34.9%","25-29.9%","20-24.9%","15-19.9%","10-14.9%","0-9.9%"];

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
						.attr("width", width)
						.attr("height", 100);

			
			//set the dimensions of the canvas
			var margin = {top: 30, right: 20, bottom: 30, left:50},
				chart_width = 600-margin.left - margin.right,
				chart_height = 270 - margin.top - margin.bottom;
			//parse the date/time
			//var parseDate = d3.time.format("%d-%b-%y").parse;
			//set the ranges
			var x = d3.scale.ordinal()
					.domain(year_arr)
					.rangePoints([0,chart_width]);
			var y = d3.scale.linear().range([chart_height,0]);
			//Define the axes
			var xAxis = d3.svg.axis().scale(x).orient("bottom");
			var yAxis = d3.svg.axis().scale(y).orient("left").ticks(5);
			//define the line
			var valueline = d3.svg.line()
								.y(function(d){return y(d.r_2017);});
			//add line chart
			var linechart = d3.select("#linechart")
								.append("svg")
								.attr("width", chart_width+margin.left+margin.right)
								.attr("height", chart_height+margin.top+margin.bottom)
								.append("g")
								.attr("transform","translate("+margin.left+","+margin.top+")");
			linechart.append("g")
						.attr("class","x axis")
						.call(xAxis);
			//Get the data
			d3.csv("data/obrbs.csv",function(error,data){
				console.log(data.length);
				console.log(data[0]);
				data.forEach(function(d){
					//console.log(d.state);
				});
				y.domain([0,d3.max(data,function(d){return d.r_2017;})]);
				//add the value path
				linechart.append("path")
						.attr("class","line")
						.attr("d",valueline(data));
			});
			//label the time line:
			var circle_x = [];
			for(var i=0;i<15;i++){
				circle_x.push(i*60);
			}
			var yearlabel = [{}];

			var circleSelection = time_svg.selectAll("circle")
											.data(circle_x)
											.enter()
											.append("circle")
											.attr("cx",function(d){
												return d;
											})
											.attr("cy",25)
											.attr("r",5)
											.attr("transform","translate("+50+","+0+")")
											.style("fill","steelblue")
											.on("mouseover",mouseover);
			
			var textSelection = time_svg.selectAll("text")
										.data(circle_x)
										.enter()
										.append("text")
										.attr("transform","translate("+50+","+0+")")
										.attr("x",function(d){
											return (d-15);
										})
										.attr("y",50)
										.text(function(d){
											return d;

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
				color.domain([0,1,2,3,4,5,6]);
				var ratelabel=[];
				var year_sig = "r_2017";
				for(var i = 0; i < data.length; i++){
						if(data[i][year_sig]<0.1)
							ratelabel[i]=0;
						else if(data[i][year_sig]<0.15&&data[i][year_sig]>=0.1)
							ratelabel[i]=1;
						else if(data[i][year_sig]<0.2&&data[i][year_sig]>=0.15)
							ratelabel[i]=2;
						else if(data[i][year_sig]<0.25&&data[i][year_sig]>=0.2)
							ratelabel[i]=3;
						else if(data[i][year_sig]<0.3&&data[i][year_sig]>=0.25)
							ratelabel[i]=4;
						else if(data[i][year_sig]<0.35&&data[i][year_sig]>=0.3)
							ratelabel[i]=5;
						else if(data[i][year_sig]>=0.35)
							ratelabel[i]=6;
				}
				//console.log(ratelabel);
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
							        return d.properties.name;
							    })
							    .attr("x", function(d){
							        return path.centroid(d)[0];
							    })
							    .attr("y", function(d){
							        return  path.centroid(d)[1];
							    })
							    .attr("text-anchor","middle")
							    .attr('font-size','6pt');
				})
			});

			function mouseover(d,i){
				console.log(d);
				console.log(i);
				var index=i;
				d3.csv("data/obrbs.csv",function(data){
					color.domain([0,1,2,3,4,5,6]);
					var ratelabel=[];
					var year_sig = year_arr[index];
					console.log(year_sig);
					for(var i = 0; i < data.length; i++){
						if(data[i][year_sig]<0.1)
							ratelabel[i]=0;
						else if(data[i][year_sig]<0.15&&data[i][year_sig]>=0.1)
							ratelabel[i]=1;
						else if(data[i][year_sig]<0.2&&data[i][year_sig]>=0.15)
							ratelabel[i]=2;
						else if(data[i][year_sig]<0.25&&data[i][year_sig]>=0.2)
							ratelabel[i]=3;
						else if(data[i][year_sig]<0.3&&data[i][year_sig]>=0.25)
							ratelabel[i]=4;
						else if(data[i][year_sig]<0.35&&data[i][year_sig]>=0.3)
							ratelabel[i]=5;
						else if(data[i][year_sig]>=0.35)
							ratelabel[i]=6;
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
					      	  .text(function(d) { return d; 	
					      	  });
						 

					});

				});
			}


			// // Load in my states data!
			// d3.csv("data/obrbs.csv", function(data){
			// 	color.domain([0,1,2,3,4,5,6]); 
			// 	// setting the range of the input data
			// 	var ratelabel=[];
			// 	var year_sig = year_arr[14];
			// 	console.log(data[1][year_sig]);
			// 	for(var i = 0; i < data.length; i++){
			// 		if(data[i][year_sig]<0.1)
			// 			ratelabel[i]=0;
			// 		else if(data[i][year_sig]<0.15&&data[i][year_sig]>=0.1)
			// 			ratelabel[i]=1;
			// 		else if(data[i][year_sig]<0.2&&data[i][year_sig]>=0.15)
			// 			ratelabel[i]=2;
			// 		else if(data[i][year_sig]<0.25&&data[i][year_sig]>=0.2)
			// 			ratelabel[i]=3;
			// 		else if(data[i][year_sig]<0.3&&data[i][year_sig]>=0.25)
			// 			ratelabel[i]=4;
			// 		else if(data[i][year_sig]<0.35&&data[i][year_sig]>=0.3)
			// 			ratelabel[i]=5;
			// 		else if(data[i][year_sig]>=0.35)
			// 			ratelabel[i]=6;
			// 	}
			// 	//console.log(ratelabel);
			// 	// Load GeoJSON data and merge with states data
			// 	d3.json("data/us-states.json", function(json){
			// 	// Loop through each state data value in the .csv file
			// 		//console.log(data);				
			// 		for (var i = 0; i < data.length; i++){
			// 			// Grab State Name
			// 			var dataState = data[i].state;
			// 			// Grab data value 
			// 			// console.log(ratelabel);
			// 			var dataValue = ratelabel[i];
			// 			// Find the corresponding state inside the GeoJSON
			// 			for (var j = 0; j < json.features.length; j++)  {
			// 				var jsonState = json.features[j].properties.name;
			// 				if (dataState == jsonState) {
			// 					// Copy the data value into the JSON
			// 					json.features[j].properties.visited = dataValue; 
			// 					// Stop looking through the JSON
			// 					break;
			// 				}
			// 			}
			// 		}
					
			// 		// Bind the data to the SVG and create one path per GeoJSON feature
			// 		svg.selectAll("path")
			// 			.data(json.features)
			// 			.enter()
			// 			.append("path")
			// 			.attr("d", path)
			// 			.style("stroke", "#fff")
			// 			.style("stroke-width", "1")
			// 			.style("fill", function(d) {
			// 				// Get data value
			// 				var value = d.properties.visited;

			// 				if (value) {
			// 				//If value exists…
			// 				return color(value);
			// 				} else {
			// 				//If value is undefined…
			// 				return "rgb(213,222,217)";
			// 				}
			// 			});

					 
			// // Map the cities I have lived in!
			// d3.csv("data/cities-lived.csv", function(data) {

			// 	svg.selectAll("circle")
			// 		.data(data)
			// 		.enter()
			// 		.append("circle")
			// 		.attr("cx", function(d) {
			// 			return projection([d.lon, d.lat])[0];
			// 		})
			// 		.attr("cy", function(d) {
			// 			return projection([d.lon, d.lat])[1];
			// 		})
			// 		.attr("r", function(d) {
			// 			return Math.sqrt(d.years) * 4;
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