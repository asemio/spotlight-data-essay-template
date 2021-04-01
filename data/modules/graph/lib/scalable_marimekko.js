scalableMarimekko = function (
  dataFileName,
  containerID,
  xAxisLabel,
  yAxisLabel,
  groupFieldName,    // groups of bars
  subgroupFieldName, // bars
  groupNameAbbrevs,
  yMaxUnscaled,
  yMaxScaled,
  containerWidth = 920,
  containerHeight = 800
) {
  var margin = {top: 10, right: 30, bottom: 100, left: 100},
      width = containerWidth - margin.left - margin.right,
      height = containerHeight - margin.top - margin.bottom;

  var svg = d3.select (containerID)
    .append ("svg")
      .attr ('id', containerID)
      .attr ('viewBox', '0 0 ' + containerWidth + ' ' + containerHeight)
    .append ("g")
      .attr ("transform", "translate(" + margin.left + "," + margin.top + ")");

  d3.csv (dataFileName, function (data) {

    var groups = data
      .map (x => x [groupFieldName])
      .reduce (((groups, group) => {
        if (!groups.includes (group)) {
          groups.push (group);
        }
        return groups;
      }), []);

    var subgroups = data
      .map (x => x [subgroupFieldName])
      .reduce (((subgroups, subgroup) => {
        if (!subgroups.includes (subgroup)) {
          subgroups.push (subgroup);
        }
        return subgroups;
      }), []);

    var segments = data.columns.slice (2);  // the bar segments.

    // Add X axis
    var x = d3.scaleBand()
      .domain(groups)
      .range([0, width])
      .padding([0.2])

    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(
        d3.axisBottom (x)
          .tickSizeOuter (0)
          .tickFormat ((d, i) => groupNameAbbrevs (d))
      );

    // text label for the x axis
    svg.append("text")             
      .attr ("transform", "translate(" + (width/2) + " ," +  (height + margin.top + 40) + ")")
      .style ("text-anchor", "middle")
      .text (xAxisLabel);

    var scaled = false;

    var y = d3.scaleLinear()
      .domain([0, yMaxUnscaled])
      .range([ height, 0 ]);

    var yAxis = d3.axisLeft (y);

    svg.append("g")
      .attr ('class', 'y-axis')
      .call (yAxis);

    svg.append("text")
      .attr ("transform", "rotate(-90)")
      .attr ("y", 0 - margin.left)
      .attr ("x", 0 - (height / 2))
      .attr ("dy", "1em")
      .style ("text-anchor", "middle")
      .text (yAxisLabel);

    var color = d3.scaleOrdinal()
      .domain(segments)
      .range(d3.schemeSet2);

    var stackedData = d3.stack()
      .keys(segments)
      (data)

    var xYear = d3.scaleBand()
      .domain(subgroups)
      .range([0, x.bandwidth()])
      .padding([0.05])

    var mouseover = function(d) {
      var segment = d3.select(this).datum().key;
      d3.selectAll(containerID + " .myRect").style("opacity", 0.2)
      d3.selectAll(containerID + " ." + segment)
        .style("opacity", 1)
      }

    var mouseleave = function(d) {
      d3.selectAll(containerID + " .myRect")
        .style("opacity",0.8)
      }

    svg.append("g")
      .selectAll(containerID + " g")
      .data (groups)
      .enter ()
      .append("g")
      .attr('class', 'group')

      // create subgroup element
      .selectAll (containerID + ' .group')
      .data (p => {
        var result = subgroups.map (function (y) {
          return {group: p, subgroup: y};
        });
        return result;
      })
      .enter ()
      .append ('g')
      .attr ('class', 'subgroup')
      .attr("transform", d => "translate(" + x(d.group) + ",0)")
    
      // create the subgroup bar element
      .selectAll (containerID + ' .subgroup')
      .data (d => {
        var es = data.filter (e => e [groupFieldName] == d.group && e [subgroupFieldName] == d.subgroup);

        var stacks = d3.stack ().keys (segments) (es);

        var results = stacks.map (function (s, i) {
          return {
            key: segments [i],
            value: {
              subgroup: d.subgroup,
              stack: s
          }};
        });

        return results;
      })
      .enter()

      // create the bar segment elements
      .append ("rect")
        .attr ("x", d => xYear (d.value.subgroup)) 
        .attr ("y", d => y (d.value.stack [0][1]))
        .attr ("height", d => y (d.value.stack [0][0]) - y (d.value.stack [0][1]))
        .attr ("width", xYear.bandwidth ())
        .attr ("stroke", "grey")
        .attr ("fill", d => color (d.key))
        .attr ("class", d => "myRect " + d.key)
        .style("cursor", "pointer")
        .on ("mouseover", mouseover)
        .on ("mouseleave", mouseleave)
        .on ('click', () => {
           y.domain ([0, scaled ? yMaxUnscaled : yMaxScaled]);

           svg.select ('.y-axis')
             .transition ()
             .duration (1500)
             .call (yAxis);

           svg.selectAll (containerID + ' .myRect')
             .transition ()
             .duration (1500)
             .attr ('y', d => y (d.value.stack [0][1]))
             .attr ('height', d => y (d.value.stack [0][0]) - y (d.value.stack [0][1]))

            scaled = !scaled;
        });

      var swabSize = 25;
      var legendX = - margin.left;
      var legendY = 0;

      svg.selectAll ('legend-swabs')
        .data (segments)
        .enter ()
        .append ('rect')
          .attr ("x", legendX)
          .attr ("y", (d, i) => legendY + i * (swabSize + 5))
          .attr ("width", swabSize)
          .attr ("height", swabSize)
          .style ("fill", d => color (d));

      svg.selectAll (containerID + ' legend-labels')
      .data (segments)
        .enter ()
       .append ("text")
         .attr ("x", legendX + swabSize * 1.2)
         .attr ("y", (d, i) => legendY + i * (swabSize + 5) + (swabSize / 2))
         .style ("fill", d => color (d))
         .text (d => d)
         .attr ("text-anchor", "left")
         .style ("alignment-baseline", "middle"); 
  })
}