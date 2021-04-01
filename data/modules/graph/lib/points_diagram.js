pointsDiagram = function (
  dataFileName,
  containerID,
  x_field_name,
  y_field_name,
  x_axis_label,
  y_axis_label,
  maxWidth = 920,
  maxHeight = 800
) {
  const margin = {top: 10, right: 30, bottom: 100, left: 100}
  const width = maxWidth - margin.left - margin.right
  const height = maxHeight - margin.top - margin.bottom

  // append the svg object to the body of the page
  var svg = d3.select ('#' + containerID)
    .append ("svg")
    .attr ('viewBox', '0 0 ' + maxWidth + ' ' + maxHeight)
    .append ("g")
    .attr ("transform", "translate(" + margin.left + "," + margin.top + ")");
  
  d3.csv (dataFileName).then (function (data) {
    var parseDate = d3.timeParse("%Y-%m-%d %I:%M:%S");

    var points = data
      .slice (-14)
      .map (p => {
        return {
          x: parseDate (p [x_field_name]),
          y: p [y_field_name]
      }});

    var xs = points.map (p => p.x);
    var ys = points.map (p => p.y);

    // Add X axis
    var x = d3.scaleTime ()
     .domain (d3.extent (points, p => p.x))
     .range ([0, width]);
  
    // Add Y axis
    var y = d3.scaleLinear ()
      .domain ([d3.min (points, p => p.y), d3.max (points, p => p.y)]) // Note: starting value cannot be 0
      .range ([height, 0]);
  
    // create points
    svg.selectAll ("dot")
      .data (points)
      .enter ()
        .append ("circle")
        .attr ("fill", p => d3.color ('steelblue'))
        .attr ("r", 5)
        .attr ("cx", p => x (p.x))
        .attr ("cy", p => y (p.y));

   var xAxis = d3.axisBottom ().scale (x).ticks(5);

   var yAxis = d3.axisLeft ().scale (y).ticks(5);

    // Add the X Axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // Add the Y Axis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);
  })
}                                                      
