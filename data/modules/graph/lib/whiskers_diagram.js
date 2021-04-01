whiskersDiagram = function (
  dataFileName,
  containerID,
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
  
  d3.csv (dataFileName, function (data) {
    var programs = data
      .map (x => x.program)
      .reduce (((programs, program) => {
        if (!programs.includes (program)) {
          programs.push (program);
        }
        return programs;
      }), []);
  
    var years = data
      .map (x => x.year)
      .reduce (((years, year) => {
        if (!years.includes (year)) {
          years.push (year);
        }
        return years;
      }), []);
  
    // color palette = one color per subgroup
    var color = d3.scaleOrdinal ()
      .domain (years)
      .range (d3.schemeSet2);
  
    // Add X axis
    var x = d3.scaleBand ()
        .domain (programs)
        .range ([0, width])
        .padding ([0.2])
  
    // text label for the x axis
    svg.append ("text")             
      .attr ("transform",
        "translate(" + (width/2) + " ," +  (height + margin.top + 40) + ")")
      .style ("text-anchor", "middle")
      .text ("Program/Year (2017, 2018, 2019)");
  
    svg.append ("g")
      .attr ("transform", "translate(0," + height + ")")
      .call (
        d3.axisBottom (x)
          .tickSizeOuter (0)
          .tickFormat ((d, i) => d)
      );
  
    // Add Y axis
    var y = d3.scaleLinear ()
      .domain ([0, 2000])
      .range ([ height, 0 ]);
  
    // text label for the y axis
    svg.append ("text")
      .attr ("transform", "rotate(-90)")
      .attr ("y", 0 - margin.left)
      .attr ("x",0 - (height / 2))
      .attr ("dy", "1em")
      .style ("text-anchor", "middle")
      .text ("Days");      
  
    svg.append("g")
      .call (d3.axisLeft (y));
  
    var xYear = d3.scaleBand ()
      .domain (years)
      .range ([0, x.bandwidth()])
      .padding ([0.05])
  
    var boxWidth = 10;
  
    var yearElems = svg.append ("g")
      .selectAll ("g")
      .data (programs)
      .enter ()
      .append ("g")
      .attr ('class', 'program')
  
      // create year element
      .selectAll ('.program')
      .data (function (p) {
        var result = years
          .map (y => {
            var entry = data.find (entry => entry.program == p && entry.year == y);
  
            return entry ? {
              key: y,
              value: {
                program: p,
                avg_days: entry.avg_days,
                q1: entry.q1,
                q2: entry.q2,
                q3: entry.q3,
                q4: entry.q4
              }
            } : null;
          })
          .filter (entry => entry);
        return result;
      })
      .enter ()
      .append ('g')
      .attr ('class', d => 'year-' + d.value.q1 + '-' + d.value.q2 + '-' + d.value.q3 + '-' + d.value.q4)
      .attr("transform", function(d) {
        return "translate(" + x(d.value.program) + ",0)";
      });
  
      // draw the main box line for each year
      yearElems.append ('line')
        .attr ('x1', d => xYear (d.key))
        .attr ('x2', d => xYear (d.key))    
        .attr ('y1', d => y (d.value.q1))
        .attr ('y2', d => y (d.value.q4))
        .attr ('stroke', 'black');
  
      // draw the main box for each year
      yearElems.append ("rect")
        .attr ("x", d => xYear (d.key) - boxWidth/2)
        .attr ("y", d => y (d.value.q3) )
        .attr ("height", d => y (d.value.q2) - y (d.value.q3))
        .attr ("width", boxWidth)
        .attr ("stroke", "black")
        .attr ("fill", d => color (d.key));
  
      // draw the average and quntile lines for each year
      yearElems
        .selectAll ("marks")
        .data (d => [
          {key: d.key, value: d.value.avg_days},
          {key: d.key, value: d.value.q1},
          {key: d.key, value: d.value.q4}
        ])
        .enter ()
        .append ("line")
        .attr ('class', 'stat-lines')
        .attr ("x1", d => xYear (d.key) - boxWidth/2)
        .attr ("x2", d => xYear (d.key) + boxWidth/2)
        .attr ("y1", d => y (d.value)) 
        .attr ("y2", d => y (d.value))
        .attr ("stroke", "black");
  })
}                                                      