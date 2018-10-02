var width = 480
  , height = 480;
var zoom = d3.behavior.zoom().scaleExtent([1, 10]).on("zoom", zoomed);
var drag = d3.behavior.drag().origin(function(d) {
    return d;
}).on("dragstart", dragstarted).on("drag", dragged).on("dragend", dragended);
var svgContainer = d3.select("#maindiv").append('svg').attr("width", width).attr("height", height).call(zoom).append("g").attr("transform", "translate(-80,0)");
var scaleX = d3.scale.linear().domain([0, 20]).range([0, width]);
var scaleY = d3.scale.linear().domain([0, 20]).range([height, 0]);
var LscaleX = d3.scale.linear().domain([0, 40]).range([0, 400]);
var LscaleY = d3.scale.linear().domain([0, 5]).range([70, 0]);
var formatDate = d3.time.format("%b-%d");

var colourScale = d3.scale.ordinal().domain(["0", "1", "2", "3", "4", "5"]).range(['#ffffcc', '#c7e9b4', '#7fcdbb', '#41b6c4', '#2c7fb8', '#253494']);

var symbolTypes = {
        "diamond": d3.svg.symbol().type("diamond").size(30),
        "circle": d3.svg.symbol().type("circle").size(30)
    };
//draw map
var rdata = []
$.getJSON("streets.json", function(data) {
    $.each(data, function(index, d) {
        rdata.push(d)
    });
    svgContainer.selectAll("polyline").data(rdata).enter().append("polyline").attr("points", function(d) {
        return d.map(function(d) {
            return [scaleX(d.x), scaleY(d.y)].join(",");
        }).join(" ");
    }).attr("fill", "none").attr("stroke", "black").attr("stroke-width", 1);
});
var toggleColor = (function() {
    var currentColor = "black";
    return function() {
        currentColor = currentColor == "black" ? "magenta" : "black";
        d3.select(this).style("fill", currentColor);
    }
}
)();
// draw pump
pumpdata = []
d3.csv("pumps.csv", function(error, data) {
    if (error)
        throw error;
    data.forEach(function(d) {
        d.x = +d.x;
        d.y = +d.y;
        pumpdata.push(d)
    });

    // Add pumps
    svgContainer.selectAll(".point").data(data).enter().append("path").attr("class", "point").attr("d", d3.svg.symbol().type("cross")).attr("transform", function(d) {
        return "translate(" + scaleX(d.x) + "," + scaleY(d.y) + ")";
    }).on("click", toggleColor);
    svgContainer.selectAll("text.pump").data(data).enter().append("text").text(function(d) {
        return d.id;
    }).attr("transform", function(d) {
        return "translate(" + scaleX(d.x + 0.2) + "," + scaleY(d.y - 0.15) + ")";
    }).attr("font-size", "11px")
});
//label main roads
var roadname = [{name: 'O X F O R D \u00A0 \u00A0 S T .', x: 5,y: 15.6,rotate: -10.5}, {name: 'O X F O R D \u00A0 \u00A0 S T .', x: 13.5,    y: 16.8,    rotate: -10.5}, {name: 'R E G E N T \u00A0 \u00A0 S T.', x: 5.8, y: 15.4,  rotate: 75}, {name: 'K I N G \'S \u00A0 \u00A0 S T R E E T',    x: 7.2,    y: 12.2,    rotate: 52}, {    name: 'R E G E N T \u00A0 \u00A0 S T R E E T',x: 8,y: 9.5,rotate: 60}, {name: 'B r o a d \u00A0 \u00A0 S t r e et', x: 11.2,y: 11.2,rotate: -27}, {name: 'B r e w e r S t r e e t',x: 12,y: 5.8, rotate: -42}, {name: 'D E A N \u00A0 \u00A0 S T R E T T',    x: 16.3,    y: 16,    rotate: 66}, {    name: 'PICCADILLY',    x: 14.3,    y: 3.5,    rotate: -24}, {    name: 'Little Windmill',    x: 12.9,    y: 10.6,    rotate: 55}]
svgContainer.selectAll("text.road").data(roadname).enter().append("text").text(function(d) {
    return d.name;
}).attr("transform", function(d) {
    return "translate(" + scaleX(d.x) + "," + scaleY(d.y) + ") rotate(" + d.rotate + ")";
}).attr("fill", "grey").attr("font-size", "12px");

//Add legend
d3.select("#legends").append("path").attr("class", "dot").attr("transform", function(d) {return "translate(" + LscaleX(1) + "," + LscaleY(2) + ")";}).style("stroke-width", 0.5).style("stroke", "black").attr("d", d3.svg.symbol().type("cross")).style("fill","black");
d3.select("#legends").append("text").text("Water Pump").attr("transform", function(d) {return "translate(" + LscaleX(0.1) + "," + LscaleY(4.4) + ")";}).attr("fill", "black").attr("font-size", "12px");
d3.select("#legends").append("text").text("P1-P13").attr("transform", function(d) {return "translate(" + LscaleX(2) + "," + LscaleY(1.5) + ")";}).attr("fill", "black").attr("font-size", "11px");
d3.select("#legends").append("text").text("Deaths\u00A0 \u00A0Shape:Gender").attr("transform", function(d) {return "translate(" + LscaleX(8) + "," + LscaleY(4.4) + ")";}).attr("fill", "black").attr("font-size", "12px");
d3.select("#legends").append("text").text("Color:Age Group").attr("transform", function(d) {return "translate(" + LscaleX(22) + "," + LscaleY(4.4) + ")";}).attr("fill", "black").attr("font-size", "12px");

d3.select("#legends").append("path").attr("class", "dot").attr("transform", function(d) {return "translate(" + LscaleX(13) + "," + LscaleY(0.7) + ")";}).style("stroke-width", 0.5).style("stroke", "black").attr("d", symbolTypes.circle()).style("fill","white");
d3.select("#legends").append("text").text("1 : Female").attr("transform", function(d) {return "translate(" + LscaleX(14) + "," + LscaleY(0.5) + ")";}).attr("fill", "black").attr("font-size", "12px");
d3.select("#legends").append("path").attr("class", "dot").attr("transform", function(d) {return "translate(" + LscaleX(13) + "," + LscaleY(2.5) + ")";}).style("stroke-width", 0.5).style("stroke", "black").attr("d", symbolTypes.diamond()).style("fill","white");

d3.select("#legends").append("text").text("0 : Male").attr("transform", function(d) {return "translate(" + LscaleX(14) + "," + LscaleY(2.2) + ")";}).attr("fill", "black").attr("font-size", "12px");

//'#ffffcc', '#c7e9b4', '#7fcdbb', '#41b6c4', '#2c7fb8', '#253494'
d3.select("#legends").append("path").attr("class", "dot").attr("transform", function(d) {return "translate(" + LscaleX(24) + "," + LscaleY(3.4) + ")";}).attr("d", d3.svg.symbol().type("square").size(80)).style("fill","#ffffcc");
d3.select("#legends").append("path").attr("class", "dot").attr("transform", function(d) {return "translate(" + LscaleX(24) + "," + LscaleY(2.8) + ")";}).attr("d", d3.svg.symbol().type("square").size(80)).style("fill","#c7e9b4");
d3.select("#legends").append("path").attr("class", "dot").attr("transform", function(d) {return "translate(" + LscaleX(24) + "," + LscaleY(2.2) + ")";}).attr("d", d3.svg.symbol().type("square").size(80)).style("fill","#7fcdbb");
d3.select("#legends").append("path").attr("class", "dot").attr("transform", function(d) {return "translate(" + LscaleX(24) + "," + LscaleY(1.6) + ")";}).attr("d", d3.svg.symbol().type("square").size(80)).style("fill","#41b6c4");
d3.select("#legends").append("path").attr("class", "dot").attr("transform", function(d) {return "translate(" + LscaleX(24) + "," + LscaleY(0.95) + ")";}).attr("d", d3.svg.symbol().type("square").size(80)).style("fill","#2c7fb8");
d3.select("#legends").append("path").attr("class", "dot").attr("transform", function(d) {return "translate(" + LscaleX(24) + "," + LscaleY(0.3) + ")";}).attr("d", d3.svg.symbol().type("square").size(80)).style("fill","#253494");


d3.select("#legends").append("text").text("0 : 0 -10").attr("transform", function(d) {return "translate(" + LscaleX(25) + "," + LscaleY(3.3) + ")";}).attr("fill", "black").attr("font-size", "11px");
d3.select("#legends").append("text").text("1 : 11-20").attr("transform", function(d) {return "translate(" + LscaleX(25) + "," + LscaleY(2.7) + ")";}).attr("fill", "black").attr("font-size", "11px");
d3.select("#legends").append("text").text("2 : 21-40").attr("transform", function(d) {return "translate(" + LscaleX(25) + "," + LscaleY(2.05) + ")";}).attr("fill", "black").attr("font-size", "11px");
d3.select("#legends").append("text").text("3 : 41-60").attr("transform", function(d) {return "translate(" + LscaleX(25) + "," + LscaleY(1.45) + ")";}).attr("fill", "black").attr("font-size", "11px");
d3.select("#legends").append("text").text("4 : 61-80").attr("transform", function(d) {return "translate(" + LscaleX(25) + "," + LscaleY(0.75) + ")";}).attr("fill", "black").attr("font-size", "11px");
d3.select("#legends").append("text").text("5 :   >80").attr("transform", function(d) {return "translate(" + LscaleX(25) + "," + LscaleY(0.15) + ")";}).attr("fill", "black").attr("font-size", "11px");
//draw death
d3.csv("deaths_age_sex.csv", function(error, death) {
    if (error) throw error;
    death.forEach(function(d) {
        d.date = parseDate(d.date);
        d.num_deaths = +d.num_deaths
        d.x = +d.x
        d.y = +d.y
    });
    
    var nestByDate = d3.nest()
      .key(function(d) { return d3.time.day(d.date); });

    // Create the crossfilter
    var deathcrossfilter = crossfilter(death);

    // Group by date
    var date = deathcrossfilter.dimension(function(d) {
        return d.date;
    });
    var dates = date.group(d3.time.day);

    // Group by age
    var ageGroup = deathcrossfilter.dimension(function(d) {
        return d.age;
    });
    var ageGroups = ageGroup.group();

    // Group by gender
    var gender = deathcrossfilter.dimension(function(d) {
        return d.gender;
    });
    var genders = gender.group();
    var list = d3.selectAll(".list")
      .data([DeathList]);
    // Chart elements
    var charts = [
              barChart()
        .dimension(date)
        .group(dates)
        .round(d3.time.day.round)
        .x(d3.time.scale()
        .domain([new Date(1854,7,18), new Date(1854,8,29)])
           .rangeRound([0, 10 * 42]))
        .filter([new Date(1854,7,18), new Date(1854,8,29)]),
        
        barChart()
        .dimension(ageGroup)
        .group(ageGroups)
        .x(d3.scale.ordinal()
           .domain(["0", "1", "2", "3", "4", "5"])
           .rangeRoundBands([0, 120], 0.5)),
        
        barChart()
        .dimension(gender)
        .group(genders)
        .x(d3.scale.ordinal()
           .domain(["male", "female"])
           .rangeRoundBands([0, 10 * 5], 0.5))     
        

    ];
    
    var chart = d3.selectAll('.chart').data(charts).each(function(chart) { chart.on("brush", renderAll).on("brushend", renderAll); });

    renderAll();

    // Renders the specified chart or list.
    function render(method) {
        d3.select(this).call(method);
    }

    // Whenever the brush moves, re-rendering everything.
    function renderAll() {
        chart.each(render);
        list.each(render);
        updatedeath();
    }

    function parseDate(d) {
        return new Date(1854,d.substring(0, 1)-1,d.substring(2, 4));
    }

  window.filter = function(filters) {
    filters.forEach(function(d, i) { charts[i].filter(d); });
    renderAll();
  };

  window.reset = function(i) {
    charts[i].filter(null);
    renderAll();
  };

// update death

function updatedeath(){  
    const deathsByDate = nestByDate.entries(date.top(600));
    var deathd = [];
    
    deathsByDate.forEach(function(d,i) {
        vals = d.values;
        vals.forEach(function(v,j){
        deathd.push(v);
      });
    });
    console.log(deathd)
    d3.selectAll('path[isDeath = true]').remove()
    svgContainer.selectAll("path").data(deathd).enter().append("path").attr("class", "dot").attr("deathdate", "dot").attr("transform", function(d) {
        return "translate(" + scaleX(d.x) + "," + scaleY(d.y) + ")";
    })
    .attr("isDeath", true)
    .style("stroke-width", 0.5)
    .style("stroke", "black")
    .attr("d", function(d, i) {
        if (d.gender === "1")   // female
            return symbolTypes.circle();
        else
            return symbolTypes.diamond();
    })// fill color
    .style("fill", function(d, i) {
        return colourScale(d.age);
    });}
                         
                         
  //update list  
 function DeathList(div) {
    var deathsByDate = nestByDate.entries(date.top(40));

    div.each(function() {
      var date = d3.select(this).selectAll(".date")
          .data(deathsByDate, function(d) { return d.key; });

      date.enter().append("div")
          .attr("class", "date")
        .append("div")
          .attr("class", "day")
        .text(function(d) { return "Total number of death on "+ formatDate(d.values[0].date)+"-1854 :"; });

      date.exit().remove();

      var deaths = date.selectAll(".death")
          .data(function(d) { return d.values; }, function(d) { return d.index; });

      var DeathEnter = deaths.enter().append("div")
          .attr("class", "death");

      DeathEnter.append("div")
          .attr("class", "no-deaths")
          .text(function(d) { return d.num_deaths; });
      deaths.exit().remove();

    });
  }  
 function barChart() {
    if (!barChart.id) barChart.id = 0;

    var margin = {top: 10, right: 10, bottom: 20, left: 10},
        x,
        y = d3.scale.linear().range([150, 0]),
        id = barChart.id++,
        axis = d3.svg.axis().orient("bottom"),
        brush = d3.svg.brush(),
        brushDirty,
        dimension,
        group,
        round;
    
    function chart(div) {
      var cwidth = x.range()[1]+200,
          cheight = y.range()[0];

      y.domain([0, group.top(1)[0].value]);

      div.each(function() {
        var div = d3.select(this),
            g = div.select("g");

        // Create the skeletal chart.
        if (g.empty()) {
          div.select(".title").append("a")
              .attr("href", "javascript:reset(" + id + ")")
              .attr("class", "reset")
              .text("reset")
              .style("display", "none");

          g = div.append("svg")
              .attr("width", cwidth + margin.left + margin.right)
              .attr("height", cheight + margin.top + margin.bottom)
            .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

          g.append("clipPath")
              .attr("id", "clip-" + id)
            .append("rect")
              .attr("width", cwidth)
              .attr("height", cheight);

          g.selectAll(".bar")
              .data(["background", "foreground"])
            .enter().append("path")
              .attr("class", function(d) { return d + " bar"; })
              .datum(group.all());

          g.selectAll(".foreground.bar")
              .attr("clip-path", "url(#clip-" + id + ")");

          g.append("g")
              .attr("class", "axis")
              .attr("transform", "translate(0," + cheight + ")")
              .call(axis);
          
         

          // Initialize the brush component with pretty resize handles.
          var gBrush = g.append("g").attr("class", "brush").call(brush);
          gBrush.selectAll("rect").attr("height", cheight);
          gBrush.selectAll(".resize").append("path").attr("d", resizePath);
        }

        // Only redraw the brush if set externally.
        if (brushDirty) {
          brushDirty = false;
          g.selectAll(".brush").call(brush);
          div.select(".title a").style("display", brush.empty() ? "none" : null);
          if (brush.empty()) {
            g.selectAll("#clip-" + id + " rect")
                .attr("x", 0)
                .attr("width", width);
          } else {
            var extent = brush.extent();
            g.selectAll("#clip-" + id + " rect")
                .attr("x", x(extent[0]))
                .attr("width", x(extent[1]) - x(extent[0]));
          }
        }

        g.selectAll(".bar").attr("d", barPath);
      });

      function barPath(groups) {
        var path = [],
            i = -1,
            n = groups.length,
            d;
        while (++i < n) {
          d = groups[i];
          path.push("M", x(d.key), ",", cheight, "V", y(d.value), "h9V", cheight);
        }
        return path.join("");
      }

      function resizePath(d) {
        var e = +(d.type ==='e'),
            x = e ? 1 : -1,
            y = cheight / 3;
        return "M" + (.5 * x) + "," + y
            + "A6,6 0 0 " + e + " " + (6.5 * x) + "," + (y + 6)
            + "V" + (2 * y - 6)
            + "A6,6 0 0 " + e + " " + (.5 * x) + "," + (2 * y)
            + "Z"
            + "M" + (2.5 * x) + "," + (y + 8)
            + "V" + (2 * y - 8)
            + "M" + (4.5 * x) + "," + (y + 8)
            + "V" + (2 * y - 8);
      }
    }

    brush.on("brushstart.chart", function() {
      var div = d3.select(this.parentNode.parentNode.parentNode);
      div.select(".title a").style("display", null);
    });

    brush.on("brush.chart", function() {
      var g = d3.select(this.parentNode),
          extent = brush.extent();
      if (round) g.select(".brush")
          .call(brush.extent(extent = extent.map(round)))
        .selectAll(".resize")
          .style("display", null);
      g.select("#clip-" + id + " rect")
          .attr("x", x(extent[0]))
          .attr("width", x(extent[1]) - x(extent[0]));
      dimension.filterRange(extent);
    });

    brush.on("brushend.chart", function() {
      if (brush.empty()) {
        var div = d3.select(this.parentNode.parentNode.parentNode);
        div.select(".title a").style("display", "none");
        div.select("#clip-" + id + " rect").attr("x", null).attr("width", "100%");
        dimension.filterAll();
      }
    });

    chart.margin = function(_) {
      if (!arguments.length) return margin;
      margin = _;
      return chart;
    };

    chart.x = function(_) {
      if (!arguments.length) return x;
      x = _;
      axis.scale(x);
      brush.x(x);
      return chart;
    };

    chart.y = function(_) {
      if (!arguments.length) return y;
      y = _;
      return chart;
    };

    chart.dimension = function(_) {
      if (!arguments.length) return dimension;
      dimension = _;
      return chart;
    };

    chart.filter = function(_) {
      if (_) {
        brush.extent(_);
        dimension.filterRange(_);
      } else {
        brush.clear();
        dimension.filterAll();
      }
      brushDirty = true;
      return chart;
    };

    chart.group = function(_) {
      if (!arguments.length) return group;
      group = _;
      return chart;
    };

    chart.round = function(_) {
      if (!arguments.length) return round;
      round = _;
      return chart;
    };

    return d3.rebind(chart, brush, "on");
  }
});

/////////////////////////////



//pan and zoom function
function zoomed() {
    svgContainer.attr("transform", "translate(" + zoom.translate() + ")" + "scale(" + zoom.scale() + ")");
}

function dragstarted(d) {
    d3.event.sourceEvent.stopPropagation();
    d3.select(this).classed("dragging", true);
}

function dragged(d) {
    d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
}

function dragended(d) {
    d3.select(this).classed("dragging", false);
}
