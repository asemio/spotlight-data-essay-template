network = function (
  dataFileName, // the raw data, for example: `Social Enterprise  |  Transitions Track 3  |  0  |  12  |  2`
  containerID,
  knn, // for each node, sort the edges associated with the node by value, mark the knn largest, and only display edges that were marked by one of their endpoints. 
  threshold, // the minimum percentage of overlap needed to display an edge between two nodes e.g. 0.01.
  logNodeScale = false, // whether or not the node scale should be logarithmic (true) or linear (false).
  nodeScaleFactor,
  edgeScaleFactor,
  minLinkLength = 200,
  width = 500,
  height = 200,
  shortName = x => x // a function that accepts a long name and returns it's abbreviation.
) {
  var svg = d3.select (containerID)
    .append ('svg')
    .attr ('id', containerID)
    .attr ('viewBox', '0 0 ' + width + ' ' + height)

  d3.csv (dataFileName, function (csv) {
    const { max, nodes, nodeLinks} = csv
      .reduce((acc, row) => {
        const value = parseInt (row.overlap)
        const sourceName = shortName (row.source)
        const targetName = shortName (row.target)
        const sourceCount = parseInt (row.sourceCount)
        const targetCount = parseInt (row.targetCount)

        if (sourceCount > 0 && acc.nodeLinks[sourceName] == null) {
          acc.nodeLinks[sourceName] = []
          acc.nodes.push({ id: sourceName, group: row.source, count: sourceCount })
        }
        if (targetCount > 0 && acc.nodeLinks[targetName] == null) {
          acc.nodeLinks[targetName] = []
          acc.nodes.push({ id: targetName, group: row.target, count: targetCount })
        }

        acc.max = Math.max (acc.max, row.sourceCount, row.targetCount)

        if (value === 0) return acc

        const proportion = Math.min (sourceCount, targetCount) === 0 ? 0 : value / Math.min (sourceCount, targetCount)

        if (proportion >= threshold) {
          const link = {
            source: sourceName,
            target: targetName,
            value,
            proportion
          }

          acc.nodeLinks[sourceName].push(link)
          acc.nodeLinks[targetName].push(link)
        }
        return acc
      }, { max: 0, nodes: [], nodeLinks: {} })

    const links = Object.values (nodes.reduce ((allLinks, node) =>
      nodeLinks [node.id]
        .sort ((nodeLink, otherNodeLink) => nodeLink.value - otherNodeLink.value)
        .slice (0, knn)
        .reduce ((acc, nodeLink) => ({
            ...acc, 
            [JSON.stringify ([nodeLink.target, nodeLink.source].sort ())]: nodeLink
          }), allLinks)
    , {}))

    const data = { nodes, links }

    var magnitude = n =>
      Math.round (logNodeScale ?
        nodeScaleFactor * Math.log10 (n) + 2 :
        nodeScaleFactor * n + 2)

    var edgeMagnitude = n =>
      Math.round (logNodeScale ?
        edgeScaleFactor * Math.log10 (n) + 2 :
        edgeScaleFactor * n + 2)

    var color = d3.scaleLinear ()
      .domain ([0, max])
      .range (d3.schemeSet2)

    const drag = simulation => {
      function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.2).restart();
        d.fx = d.x;
        d.fy = d.y;
      }
      function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
      }
      function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }
      return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }
  
    const linksData = data.links.map(d => Object.create(d))
    const nodesData = data.nodes.map(d => Object.create(d))
  
    const simulation = d3.forceSimulation(nodesData)
      .force("link", d3.forceLink(linksData).distance(minLinkLength).id(d => d.id))
      .force("charge", d3.forceManyBody())
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force('colide', d3.forceCollide().radius (d => magnitude (d.count)))
  
    svg.append("style")
      .text(`
        .label {
          font: 6px sans-serif;
          -webkit-touch-callout: none;
          -webkit-user-select:none;
          -khtml-user-select:none;
          -moz-user-select:none;
          -ms-user-select:none;
          -o-user-select:none;
          user-select:none;
        }
      `)
  
    const link = svg.append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(linksData)
      .enter ()
      .append("line")
        .attr('class', 'link')
        .style ("cursor", "pointer")
        .attr("stroke-width", d =>
          edgeMagnitude (d.value))
  
    link.append("title").text(d => d.value)

      const node = svg.append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 0.7)
      .selectAll("circle")
      .data(nodesData)
      .enter ()
      .append("circle")
        .attr("r", d => magnitude (d.count))
        .attr("fill", d => color (d.count))
        .style ("cursor", "pointer")
        .call(drag(simulation))
  
    const label = svg.append("g")
      .attr("stroke", "black")
      .attr("stroke-width", 0.4)
      .attr("stroke-opacity", 0.8)
      .selectAll("text")
      .data(nodesData)
      .enter ()
      .append("text")
        .attr("class", "label")
        .style("font-size", "34px")
        .style ("cursor", "pointer")
        .call(drag(simulation))

    label
      .text(d => d.id)
      .append ("title").text (d => d.count)

    node.append("title").text(d => d.id + ' ' + d.count)

    simulation.on("tick", () => {
      svg.selectAll ('.link')
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y)
  
      node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
  
      label
        .attr("x", d => d.x)
        .attr("y", d => d.y)
    })
  })
}