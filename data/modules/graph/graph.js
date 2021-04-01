/*
  The Graph module loads creates blocks that can be used to display graphs
  generated using the Data Driven Documents (D3) library.
*/

MODULE_LOAD_HANDLERS.add (
  function (done) {
    loadScripts ([
      'https://d3js.org/d3.v6.min.js',
      'https://d3js.org/d3-scale-chromatic.v1.min.js',
      'https://d3js.org/d3-fetch.v2.min.js',
      'https://d3js.org/d3-geo-projection.v2.min.js', // remove?
      'modules/graph/lib/scalable_marimekko.js',
      'modules/graph/lib/sankey.js',
      'modules/graph/lib/sankey_diagram.js',
      'modules/graph/lib/network.js',
      'modules/graph/lib/venn.js/venn.js',
      'modules/graph/lib/whiskers_diagram.js',
      'modules/graph/lib/points_diagram.js',
      'modules/graph/lib/map_diagram.js'
    ],
    function (error) {
      if (error) return done (error)

      $.getCSS ('modules/graph/css/style.css');

      block_HANDLERS.addHandlers ({
        'graph_scalable_marimekko_block': graph_scalable_marimekko_block,
        'graph_network_block': graph_network_block,
        'graph_venn_block': graph_venn_block,
        'graph_sankey_block': graph_sankey_block,
        'graph_whiskers_block': graph_whiskers_block,
        'graph_points_block': graph_points_block,
        'graph_map_block': graph_map_block
      });

      done (null)
    })
})

/*
  The source CSV file must have the following columns:
  source,target,overlap,sourceCount,targetCount
*/
function graph_scalable_marimekko_block (context, done, expand) {
  getBlockArguments ([
      {'name': 'data_file_name',      'text': true, 'required': true},
      {'name': 'container_id',        'text': true, 'required': true},
      {'name': 'x_axis_label',        'text': true, 'required': true},
      {'name': 'y_axis_label',        'text': true, 'required': true},
      {'name': 'group_field_name',    'text': true, 'required': true},
      {'name': 'subgroup_field_name', 'text': true, 'required': true},
      {'name': 'y_max_unscaled',      'text': true, 'required': true},
      {'name': 'y_max_scaled',        'text': true, 'required': true},
      {'name': 'container_height',    'text': true, 'required': false},
      {'name': 'container_width',     'text': true, 'required': false}
    ],
    context.element,
    function (error, blockArguments) {
      if (error) return done (error)

      var element = $('<div></div>').attr ('id', blockArguments.container_id)

      context.element.replaceWith (element)

      scalableMarimekko (
        blockArguments.data_file_name,
        '#' + blockArguments.container_id,
        blockArguments.x_axis_label,
        blockArguments.y_axis_label,
        blockArguments.group_field_name,
        blockArguments.subgroup_field_name,
        x => x,
        blockArguments.y_max_unscaled,
        blockArguments.y_max_scaled
      );
      done (null, null)
  })
}

function graph_network_block (context, done, expand) {
  getBlockArguments ([
      {'name': 'data_file_name',  'text': true, 'required': true},
      {'name': 'container_id',    'text': true, 'required': true},
      {'name': 'knn',             'text': true, 'required': true},
      {'name': 'threshold',       'text': true, 'required': true},
      {'name': 'logNodeScale',    'text': true, 'required': true},
      {'name': 'nodeScaleFactor', 'text': true, 'required': true},
      {'name': 'edgeScaleFactor', 'text': true, 'required': true},
      {'name': 'minLinkLength',   'text': true, 'required': false},
      {'name': 'height',          'text': true, 'required': false},
      {'name': 'width',           'text': true, 'required': false}
    ],
    context.element,
    function (error, blockArguments) {
      if (error) return done (error)


      var element = $('<div></div>').attr ('id', blockArguments.container_id)

      context.element.replaceWith (element)

      network (
        blockArguments.data_file_name,
        '#' + blockArguments.container_id,
        blockArguments.knn,
        blockArguments.threshold,
        blockArguments.logNodeScale == 'true',
        blockArguments.nodeScaleFactor,
        blockArguments.edgeScaleFactor,
        blockArguments.minLinkLength,
        blockArguments.width,
        blockArguments.height
      );
      done (null, null)
  })
}

function graph_venn_block (context, done, expand) {
  getBlockArguments ([
      {'name': 'data_file_name',  'text': true, 'required': true},
      {'name': 'container_id',    'text': true, 'required': true},
      {'name': 'label',           'text': true, 'required': true},
      {'name': 'height',          'text': true, 'required': false},
      {'name': 'width',           'text': true, 'required': false}
    ],
    context.element,
    function (error, blockArguments) {
      if (error) return done (error)

      var element = $('<div></div>').attr ('id', blockArguments.container_id)

      context.element.replaceWith (element)

      vennDiagram (
        blockArguments.data_file_name,
        blockArguments.container_id,
        blockArguments.label,
        blockArguments.height,
        blockArguments.width
      );
      done (null, null)
  })
}

function graph_sankey_block (context, done, expand) {
  getBlockArguments ([
      {'name': 'data_file_name',  'text': true, 'required': true},
      {'name': 'container_id',    'text': true, 'required': true},
      {'name': 'height',          'text': true, 'required': false},
      {'name': 'width',           'text': true, 'required': false}
    ],
    context.element,
    function (error, blockArguments) {
      if (error) return done (error)

      var element = $('<div></div>').attr ('id', blockArguments.container_id)

      context.element.replaceWith (element)

      sankeyDiagram (
        blockArguments.data_file_name,
        blockArguments.container_id,
        blockArguments.height,
        blockArguments.width
      );
      done (null, null)
  })
}

function graph_whiskers_block (context, done, expand) {
  getBlockArguments ([
      {'name': 'data_file_name',  'text': true, 'required': true},
      {'name': 'container_id',    'text': true, 'required': true},
      {'name': 'height',          'text': true, 'required': false},
      {'name': 'width',           'text': true, 'required': false}
    ],
    context.element,
    function (error, blockArguments) {
      if (error) return done (error)

      var element = $('<div></div>').attr ('id', blockArguments.container_id)

      context.element.replaceWith (element)

      whiskersDiagram (
        blockArguments.data_file_name,
        blockArguments.container_id,
        blockArguments.height,
        blockArguments.width
      );
      done (null, null)
  })
}

function graph_points_block (context, done, expand) {
  getBlockArguments ([
      {'name': 'data_file_name',  'text': true, 'required': true},
      {'name': 'container_id',    'text': true, 'required': true},
      {'name': 'x_field_name',    'text': true, 'required': true},
      {'name': 'y_field_name',    'text': true, 'required': true},
      {'name': 'x_axis_label',    'text': true, 'required': true},
      {'name': 'y_axis_label',    'text': true, 'required': true},
      {'name': 'height',          'text': true, 'required': false},
      {'name': 'width',           'text': true, 'required': false}
    ],
    context.element,
    function (error, blockArguments) {
      if (error) return done (error)

      var element = $('<div></div>').attr ('id', blockArguments.container_id)

      context.element.replaceWith (element)

      pointsDiagram (
        blockArguments.data_file_name,
        blockArguments.container_id,
        blockArguments.x_field_name,
        blockArguments.y_field_name,
        blockArguments.x_axis_label,
        blockArguments.y_axis_label,
        blockArguments.height,
        blockArguments.width
      );
      done (null, null)
  })
}

function graph_map_block (context, done, expand) {
  getBlockArguments ([
      {'name': 'data_file_name',       'text': true, 'required': true},
      {'name': 'map_file_name',        'text': true, 'required': true},
      {'name': 'container_id',         'text': true, 'required': true},
      {'name': 'csv_id_field_name',    'text': true, 'required': true},
      {'name': 'csv_value_field_name', 'text': true, 'required': true},
      {'name': 'absolute_range',       'text': true, 'required': false},
      {'name': 'log_scale',            'text': true, 'required': false},
      {'name': 'tooltip_region_label', 'text': true, 'required': false},
      {'name': 'tooltip_data_label',   'text': true, 'required': false},
      {'name': 'tooltip_data_prefix',  'text': true, 'required': false},
      {'name': 'tooltip_data_suffix',  'text': true, 'required': false},
      {'name': 'min_color',            'text': true, 'required': false},
      {'name': 'max_color',            'text': true, 'required': false},
    ],
    context.element,
    function (error, blockArguments) {
      if (error) return done (error)

      var element = $('<div></div>').attr ('id', blockArguments.container_id)

      context.element.replaceWith (element)

      mapDiagram (
        blockArguments.data_file_name,
        blockArguments.map_file_name,
        blockArguments.container_id,
        blockArguments.csv_id_field_name,
        blockArguments.csv_value_field_name,
        blockArguments.absolute_range != 'false',
        blockArguments.log_scale != 'false',
        blockArguments.tooltip_region_label,
        blockArguments.tooltip_data_label,
        blockArguments.tooltip_data_prefix,
        blockArguments.tooltip_data_suffix,
        blockArguments.min_color,
        blockArguments.max_color,
      );
      done (null, null)
  })
}
