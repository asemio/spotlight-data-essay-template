/*
  This file uses the Venn.js library from https://github.com/benfred/venn.js/ to
  generate Venn Diagrams.

  Note: the csv format must be have the following format:
  sets, n
  where sets is a semicolon delimited list of set names. for example: "A;B".

  Example:
  sets,n
  A,10
  A;B,5

  indicates that B is a subset of A and that A has 15 elements, 10 of which belong only to A.
*/

vennDiagram = function (
  dataFileName, // the URL of the data file
  containerID,  // the HTML element ID of the SVG container element
  label = '',   // the unit label displayed in tooltips
  height = 920, // the height of the SVG element
  width = 800   // the width of the SVG element
) {
  d3.csv (dataFileName, function (csv) {
    var sets = csv.reduce (
      function (acc, row, index) {
        acc.push ({
          index: index,
          sets: row.sets.split (';'),
          size: row.n
        })
        return acc
      }, []
    )

    var container = d3.select ('#' + containerID)
      .attr ('id', containerID)
      .attr ('height', height)
      .attr ('width', width)
      .datum (sets)
      .call (venn.VennDiagram ())

    var tooltip = d3.select ('#' + containerID)
      .append ('div')
      .attr ('class', 'tooltip')
      .style ('position', 'absolute')
      .style ('text-align', 'center')
    
    d3.selectAll ('#' + containerID + ' .venn-circle path')
      .on ('mouseover', function (d) {
          venn.sortAreas (container, d)

          tooltip
            .text (d.size + ' ' + label)
            .transition ()
            // .duration (400)
            .style ('opacity', 0.9)
         
          d3.select ('.tooltip')
            // .duration (400)
/*
          d3.select (this).select ('path')
            .style ('stroke-width', 3)
            .style ('fill-opacity', d.sets.length == 1 ? 0.4 : 0.1)
            .style ('stroke-opacity', 1) 
*/
          var selection = d3.select(this).transition("tooltip").duration(400);
          selection.select("path")
            .style("stroke-width", 3)
            .style("fill-opacity", d.sets.length == 1 ? .8 : 0)
            .style("stroke-opacity", 1);
        })
/*
      .on ('mousemove', function () {
          tooltip
            .style ('left', d3.event.pageX + 'px')
            .style ('top',  (d3.event.pageY - 50) + 'px')
        })
*/
      .on ('mouseout', function (d) {
/*
          tooltip
            .transition ()
            // .duration (400)
            // .style ('opacity', 0)

          d3.select (this)
            .transition ('tooltip')
            // .duration (400)

          d3.select (this).select ('path')
            .style ('stroke-width', 0)
            .style ('fill-opacity', d.sets.length == 1 ? 0.25 : 0.0)
            .style ('stroke-opacity', 0) 
*/
        })
  })
}