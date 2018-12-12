// Set the dimensions of the canvas / graph
var emargin = {top: 5, right: 20, bottom: 20, left: 50},
    ewidth = 500 - emargin.left - emargin.right,
    eheight = 450 - emargin.top - emargin.bottom;

// Set the ranges
var ex = d3.time.scale().range([0, ewidth]);
var ey = d3.scale.linear().range([eheight, 0]);

// Define the axes
var exAxis = d3.svg.axis().scale(ex)
    .orient("bottom").ticks(5);

var eyAxis = d3.svg.axis().scale(ey)
    .orient("left").ticks(5);

// Define the line
var evalueline = d3.svg.line()
    .x(function(d) { return ex(d.year); })
    .y(function(d) { return ey(d.enrollment); });
    
// Adds the svg canvas
var enrollmentchart = d3.select("#enrollment")
    .append("svg")
        .attr("width", ewidth + emargin.left + emargin.right)
        .attr("height", eheight + emargin.top + emargin.bottom)
    .append("g")
        .attr("transform", "translate(" + emargin.left + "," + emargin.top + ")");


// Get the data
d3.csv("data/enrollment.csv", function(error, data) {
    data.forEach(function(d) {
        d.year = parseDate(d.year);
        d.enrollment = +d.enrollment;
    });

    // Scale the range of the data
    ex.domain(d3.extent(data, function(d) { return d.year; }));
    ey.domain([0, d3.max(data, function(d) { return d.enrollment; })]);


    // Add the valueline path.
    enrollmentchart.append("path")
        .attr("class", "line")
        .attr("d", evalueline(data));

    // Add the X Axis
    enrollmentchart.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + eheight + ")")
        .call(exAxis);

    // Add the Y Axis
    enrollmentchart.append("g")
        .attr("class", "y axis")
        .call(eyAxis);
    // hoverline
    var focus = enrollmentchart.append("g")
        .attr("class", "focus")
        .style("display", "none");

    focus.append("line")
        .attr("class", "x-hover-line hover-line")
        .attr("y1", 0)
        .attr("y2", eheight);

    focus.append("line")
        .attr("class", "y-hover-line hover-line")
        .attr("x1", ewidth)
        .attr("x2", ewidth);

    focus.append("circle")
        .attr("r", 7.5);

    focus.append("text")
        .attr("x", 15)
        .attr("dy", ".31em")

    enrollmentchart.append("rect")
                    // .attr("transform", "translate(" + emargin.left + "," + emargin.top + ")")
                    .attr("class", "overlay")
                    .attr("width", ewidth + emargin.left + emargin.right)
                    .attr("height", eheight + emargin.top + emargin.bottom);


    function mousemove1() {
      var x0 = ex.invert(d3.mouse(this)[0]),
          i = bisectDate(data, x0, 1),
          d0 = data[i - 1],
          d1 = data[i],
          d = x0 - d0.year > d1.year - x0 ? d1 : d0;
      focus.attr("transform", "translate(" + ex(d.year) + "," + ey(d.enrollment) + ")");
      focus.select("text").text(function() { return d.enrollment; });
      focus.select(".x-hover-line").attr("y2", eheight - ey(d.enrollment));
      focus.select(".y-hover-line").attr("x2", ewidth + ewidth);
    }
});