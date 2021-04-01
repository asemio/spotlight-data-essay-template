/*
  The Data table module defines the Data table block which generates an
  HTML table that renders the contents of a CSV file.
*/

MODULE_LOAD_HANDLERS.add (
  function (done) {
    block_HANDLERS.add ('data_table_block', data_table_block);
    done (null);
})

/*
  Accepts two arguments:

  * context, a Block Expansion Context
  * and done, a function that accepts two arguments: an Error object
    and a JQuery HTML Element

  where context.element.text contains the URL of a CSV file; replaces
  context.element with an HTML table that renders the contents of the
  given CSV file; and passes the resulting element to done.
*/
function data_table_block (context, done) {
  getBlockArguments ([
      {'name': 'data_file_name', 'text': true, 'required': true},
      {'name': 'caption',        'text': true, 'required': false}
    ],
    context.element,
    function (error, blockArguments) {
      if (error) return done (error)

      getPlainText (blockArguments.data_file_name,
        function (error, content) {
        if (error) {
          strictError (error);
          done (error);
        }
        var lines = content.split ('\n');
        if (lines.length < 1 ) {
          var error = new Error ('[data_table][data_table_block] Error: invalid CSV file. The CSV file is missing a header row.');
          strictError (error);
          done (error);
        }
        var headerElement = $('<thead></thead>').attr ('style', 'width: 100%;');
        var bodyElement   = $('<tbody></tbody>').attr ('style', 'width: 100%;');

        var headerLine = lines.shift ();
        data_table_parse_csv (
          function (headerFieldElements) {
            headerElement.append ($('<tr></tr>').append (headerFieldElements));
            return null;
          },
          function (fieldText) {
            var fieldValue = fieldText.match (/"?([^\"]*)"?/);
            return $('<th></th>')
              .attr ('style', 'text-align: right;')
              .text (fieldValue [1]);
          },
          [headerLine]
        );

        data_table_parse_csv (
          function (bodyFieldElements) {
            bodyElement.append ($('<tr></tr>').append (bodyFieldElements));
            return null;
          },
          function (fieldText) {
            var fieldValue = fieldText.match (/"?([^\"]*)"?/);
            return $('<th></th>').text (fieldValue [1]);
          },
          lines
        );

        var element = $('<div></div>')
          .append ($('<div></div>')
            .attr ('style', 'width: 100%; overflow-x: scroll')
            .append ( 
              $('<table></table>')
                .attr ('style', 'width: 100%; overflow-x: scroll')
                .append (headerElement)
                .append (bodyElement)));

        if (blockArguments.caption) {
          element.append ($('<p style="text-align:right"><small>' + blockArguments.caption + '</small></p>'));
        }

        context.element.replaceWith (element)

        done (null, null);
      })
  })
}

/*
  Accepts three arguments:

  * lineFn, a function that accepts a list of field values and returns
    a row value
  * fieldFn, a function that accepts a field string value and returns
    a field value
  * and lines, a string array representing the lines of a CSV file

  applies fieldFn to every field in the CSV lines; passes these field
  values to lineFn for each line; and returns the resulting row values.
*/
function data_table_parse_csv (lineFn, fieldFn, lines) {
  var rows = [];
  lines.forEach (function (line) {
    var fields = [];
    var fieldMatch = [];
    var fieldRegEx = RegExp (/((?:"[^\"]*")|(?:[^,\"]*))?(?:,|\n)/y);
    while ((fieldMatch = fieldRegEx.exec (line + "\n")) != null) {
      fields.push (fieldFn (fieldMatch [1] || ""));
    }
    rows.push (lineFn (fields));
  })
  return rows;
}