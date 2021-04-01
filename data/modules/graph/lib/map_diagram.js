mapDiagram = function (
  dataFileName,
  mapFileName,
  containerID,
  csvIdFieldName,
  csvValueFieldName,
  logScale = true,
  absoluteRange = true,
  tooltipRegionLabel = 'ID',
  tooltipDataLabel = 'Value',
  tooltipDataPrefix = '',
  tooltipDataSuffix = '',
  minColor = '#fff5ea',
  maxColor = '#7f2704',
) {
  d3.svg (mapFileName).then (function (svg) {
    document
      .getElementById (containerID)
      .appendChild (svg.documentElement);

    let tooltip = d3.select ('#' + containerID)
      .attr ('class', 'graph_map')
      .append ('div')
      .attr ('class', 'tooltip')

    let toggleZoom = false
    d3.select ('#' + containerID + ' svg')
      .on ('click', function () {
        toggleZoom = !toggleZoom
        this.classList.toggle ('zoom');
      })

    d3.csv (dataFileName).then (function (csvData) {
      let values = csvData.map (x => x [csvValueFieldName])

      let color = (logScale ? d3.scaleLog () : d3.scaleLinear ())
       .domain ([absoluteRange ? 1 : Math.max (1, parseFloat (d3.min (values))), parseFloat (d3.max (values))])
       .range ([minColor, maxColor])

      let data = [];
      d3.selectAll ('#' + containerID + ' path')
        .each (function () {
          let self = this
          let x = csvData.find (x => {
            return x [csvIdFieldName] == self.id
          });
          data.push ({
            'id':      this.id,
            'unknown': x === undefined,
            'value':   x === undefined ? 0 : parseFloat (x [csvValueFieldName])
          })
        })
        // Note: this function has to use the function form so that "this" is
        // bound. See note immediately following this.
        .data (data, function (d) {
          // This function is used to compute the data value key and the element
          // key. It's called once for each value in csvData and once for each
          // element. When d is null, we're applying this function to an element.
          // When its non-null we're applying this function to a value from
          // csvData. No - I didn't come up with this convoluted scheme:
          // https://github.com/d3/d3-selection.
          return d ? d.id : this.id
        })
        .attr ('fill', function (d) {
          return (d && !d.unknown) ? color (d.value) : '#edecf4'
        })
        .on ('mouseover', function (e, d) { // https://observablehq.com/@d3/circle-dragging-iii
          if (!d.unknown) {
            tooltip
              .classed ('visible', true)
              .html ('<div><strong>' + tooltipRegionLabel + '</strong>: ' + d.id + '<br/><strong>' + tooltipDataLabel + '</strong>: ' + tooltipDataPrefix + new Intl.NumberFormat().format(d.value) + tooltipDataSuffix + '</div>');
          }
        })
        .on ('mousemove', function (e) {
            tooltip
              .style ('left', (e.pageX - 75) + 'px')
              .style ('top', (e.pageY - 100) + 'px')
        })
        .on ('mouseout', function (d) {
          tooltip
            .classed ('visible', null)
          
          setTimeout (function () {
            tooltip.classed ('visible') || tooltip.html ('<div></div>')
          }, 2000)
        })
    })
  })
}                                                      
