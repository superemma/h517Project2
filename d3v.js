var width = 500,
    height = 550;
var margin = {top: 20, right: 20, bottom: 30, left: 40};
var div = d3.select("body").append("div") 
    .attr("class", "tooltip")       
    .style("opacity", 0);
     
var zoom = d3.behavior.zoom().scaleExtent([1, 10]).on("zoom", zoomed);

var svgContainer = d3.select("#main")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .call(zoom)    
    .append("g")
    .attr("transform", "translate(-80,0)");
;

var scaleX = d3.scale.linear()
        .domain([0,20]) 
        .range([0,width]);

var scaleY = d3.scale.linear()
        .domain([0,20]) 
        .range([height,0]);
d3.select("#mainpanel")
            .style("width", width + margin.left + margin.right + 'px')
            .style("height", height + margin.top + margin.bottom + "px");
var rdata=[]
function zoomed() {
    svgContainer.attr("transform",
        "translate(" + zoom.translate() + ")" +
        "scale(" + zoom.scale() + ")"
    );
}
    
function interpolateZoom (translate, scale) {
    var self = this;
    return d3.transition().duration(350).tween("zoom", function () {
        var iTranslate = d3.interpolate(zoom.translate(), translate),
            iScale = d3.interpolate(zoom.scale(), scale);
        return function (t) {
            zoom
                .scale(iScale(t))
                .translate(iTranslate(t));
            zoomed();
        };
    });
}

function zoomClick() {
    var clicked = d3.event.target,
        direction = 1,
        factor = 0.2,
        target_zoom = 1,
        center = [width / 2 + 200, height / 2-100],
        extent = zoom.scaleExtent(),
        translate = zoom.translate(),
        translate0 = [],
        l = [],
        view = {x: translate[0], y: translate[1], k: zoom.scale()};

    d3.event.preventDefault();
    direction = (this.id === 'zoom_in') ? 1 : -1;
    target_zoom = zoom.scale() * (1 + factor * direction);

    if (target_zoom < extent[0] || target_zoom > extent[1]) { return false; }

    translate0 = [(center[0] - view.x) / view.k, (center[1] - view.y) / view.k];
    view.k = target_zoom;
    l = [translate0[0] * view.k + view.x, translate0[1] * view.k + view.y];

    view.x += center[0] - l[0];
    view.y += center[1] - l[1];

    interpolateZoom([view.x, view.y], view.k);
}

d3.selectAll('button').on('click', zoomClick);

function drawpolyline() {
  svgContainer.selectAll("polyline").data(rdata)
    .enter().append("polyline")
    .attr("points",function(d) { 
          return d.map(function(d) { return [scaleX(d.x),scaleY(d.y)].join(","); }).join(" ");})
.attr("fill","none")      
.attr("stroke","black")
      .attr("stroke-width",1); 
}

$.getJSON("streets.json", function(data) {
            $.each(data, function(index, d){            
                rdata.push(d)});
drawpolyline()

});
var x = d3.scale.linear()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);
d3.csv("pumps.csv", function(error, data) {
  if (error) throw error;

  // Coerce the strings to numbers.
  data.forEach(function(d) {
    d.x = +d.x;
    d.y = +d.y;
  });

  // Compute the scales’ domains.
  x.domain(d3.extent(data, function(d) { return d.x; })).nice();
  y.domain(d3.extent(data, function(d) { return d.y; })).nice();


  // Add points
  svgContainer.selectAll(".point")
      .data(data)
    .enter().append("path")
      .attr("class", "point")
      .attr("d", d3.svg.symbol().type("cross"))
      .attr("transform", function(d) { return "translate(" + scaleX(d.x) + "," + scaleY(d.y) + ")"; });
});
/*

to do: 

Add css for p, shapes
Add mouseover to triangle/circle to show only triangle & circle & show circle's center?
Add mouseover to polygons to highlight that polygon & its dot?
*/

// so that touchmove is not scrolling
document.body.addEventListener('touchmove', function(event) {
  event.preventDefault();
}, false); 


var endOfLastDrag = 0;

svgContainer.on("click", function(){
  // ignore click if it just happened
  if(Date.now() - endOfLastDrag > 500){
    updateDots(d3.mouse(this))
  }
})

var myVoronoi = d3.geom.voronoi()
                .x(function(d) {
                    return d[0];
                })
                .y(function(d) {
                    return d[1];
                })
                .clipExtent([[0, 0], [width, height]])

var show = {voronoi: true}

// for now, easier to debug when element types are grouped
var voronoiG = svgContainer.append("g");



function updateDots(coord) {
  if(coord){
    var data = [coord];
  } else {
    var data = []
  }

  d3.selectAll(".dots")[0].forEach(function(d){data.push(d.__data__)})

  dots = svgContainer.selectAll(".dots").data(data);

  dots.attr(dotsAttr);

  dots.enter()
  .append("circle")
  .attr(dotsAttr)
  .classed("dots", true)
  .call(drag);

  dots.exit().remove();

  updateVoronoi(data);
}

function updateVoronoi(data) {

  // voronoi
  currentVoronoi = voronoiG
                   .selectAll(".voronoi")
                   .data(myVoronoi(data));


  currentVoronoi
    .classed("hidden", !show.voronoi)
    .attr("d", function(d) {
      if(typeof(d) != 'undefined'){
    return "M" + d.join("L") + "Z"}
    })
    .datum(function(d) {
    if(typeof(d) != 'undefined'){
      return d.point;
    }});

  currentVoronoi.enter()
    .append("path")
    .attr("d", function(d) {
      if(typeof(d) != 'undefined'){
		return "M" + d.join("L") + "Z"}
    })
    .datum(function(d) {
		if(typeof(d) != 'undefined'){
			return d.point;
    }})
    .attr("class", "voronoi")
    .classed("hidden", !show.voronoi);

  currentVoronoi.exit().remove();

}
d3.select("#show-voronoi")
    .on("change", function() {
      show.voronoi = this.checked; 
      d3.selectAll(".voronoi").classed("hidden", !show.voronoi);
    });



// dot attributes
var dotsAttr = {cx: function(d){return d[0]},
                cy:function(d){return d[1]},
                r: 5,
                fill: "blue"}

// set up drag for circles
var drag = d3.behavior.drag()
    .on("drag", dragmove);

function dragmove(d) {
    d3.select(this)
      .attr("cx", d3.event.x)
      .attr("cy", d3.event.y);

    this.__data__ = [d3.event.x, d3.event.y]

    updateDots();

    endOfLastDrag = Date.now();
}
