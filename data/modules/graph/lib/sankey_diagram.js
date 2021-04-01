sankeyDiagram = function (
  dataFileName,
  containerID,
  width  = 1100,
  height = 800
) {
  // append the svg object to the body of the page
  var svg = d3.select ('#' + containerID)
    .append("svg")
    .attr ('viewBox', '0 0 ' + width + ' ' + height)

  // Set the sankey diagram properties
  var sankey = d3.sankey()
    .nodeWidth(36)
    .nodePadding(40)
    .size([width, height]);

  var path = sankey.link();

  var graph = {nodes: [], links: []}

  d3.xml(dataFileName, function(error, data) {
    if (error) {
      strictError (error)
      return null;
    }

    data.querySelectorAll ('node').forEach (node =>
      graph.nodes.push ({
        'id':    node.getAttribute ('id'),
        'name':  node.getAttribute ('name'),
        'total': parseInt (node.getAttribute ('total'))
      })
    )

    data.querySelectorAll ('link').forEach (link =>
      graph.links.push ({
        'sourceID': link.getAttribute ('sourceID'),
        'targetID': link.getAttribute ('targetID'),
        'value':    parseInt (link.getAttribute ('value'))
      })
    )

    graph.links.forEach (link => {
      link.source = graph.nodes.findIndex (node => node.id == link.sourceID);
      link.target = graph.nodes.findIndex (node => node.id == link.targetID);
    });

    sankey
      .nodes (graph.nodes)
      .links (graph.links)
      .layout (32);

    // add in the links
    var links = svg
      .append ("g")
      .selectAll (".link")
      .data (graph.links)
      .enter ()
      .append ("path")
      .attr ("class", "link")
      .attr ("d", path)
      .style ("stroke-width", d => d.dy)
      .sort ((a, b) => b.dy - a.dy);

    // add the link titles
    links.append ("title")
      .text(d => d.source.name + " → " + d.target.name + "\n" + d.value);

    var nodes = svg
      .append ("g")
      .selectAll (".node")
      .data (graph.nodes)
      .enter ()
      .append ("g")
      .attr ("class", "node")
      .attr ("transform", d => "translate(" + d.x + "," + d.y + ")"); 

    var color = d3.scaleOrdinal (d3.schemeCategory10);

    // add the rectangles for the nodes
    nodes.append("rect")
      .attr ("height", d => d.dy)
      .attr ("width", sankey.nodeWidth ())
      .style ("fill", d => d.color = color (d.name.replace (/ .*/, "")))
      .style ("stroke", d => d3.rgb (d.color).darker (2))
      .append("title")
        .text(d => d.name + "\n" + d.total);

    // add in the title for the nodes
    nodes.append("text")
      .attr ("x", -6)
      .attr ("y", d => d.dy / 2)
      .attr ("dy", ".35em")
      .attr ("text-anchor", "end")
      .attr ("transform", null)
      .text (d => d.name)
      .filter (d => d.x < width / 2)
         .attr ("x", 6 + sankey.nodeWidth ())
        .attr ("text-anchor", "start");
  })
}