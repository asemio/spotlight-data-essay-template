// Specifies the search database file
var search_DATABASE_URL = 'modules/search/database.xml';

/* 
  Empty associative array to hold items from
  database
*/
var search_DATABASE = {};

/* 
  Empty associative array to hold search
  interfaces
*/
var search_INTERFACES = {};

/* 
  Empty associative array to hold search sources
  (videos, books, global, etc. See setID tags in
  database.xml)
*/
var search_SOURCES = {};

/* 
  Empty associative array to hold search entries
*/
var search_ENTRIES = {};

/*
  Empty associative array to hold json files for
  Lunr (see lunrIndexURL tags in database.xml)
*/
var search_LUNR_INDICES = {};

/*
  The module's load event handler. Accepts one
  argument, done, a function; loads the libraries
  and search databases; registers the block and
  page handlers; and calls done.
*/
MODULE_LOAD_HANDLERS.add (
  function (done) {
    // I. Load libraries.
    loadScript ('modules/search/lib/lunr/lunr.js',
      function (error) {
        if (error) { return done (error); }

        // II. Load the search database.
        search_loadDatabase (search_DATABASE_URL,
          function (error, database) {
            if (error) { return done (error); }

            search_DATABASE = database;

            // III. Register the block handlers.
            block_HANDLERS.addHandlers ({
              search_filter_block:     search_filterBlock,
              search_form_block:       search_formBlock,
              search_index_block:      search_indexBlock,
              search_interface_block:  search_interfaceBlock,
              search_link_block:       search_linkBlock,
              search_results_block:    search_resultsBlock,
              search_no_results_block: 'modules/search/templates/search_no_results_block.html',
              search_pagination_block: search_paginationBlock
            });

            // IV. Register the page handlers.
            page_HANDLERS.add ('search_page_block', 'modules/search/templates/search_page.html');

            done (null);
        });
    });
});

/*
  Accepts three arguments:

  * context, a Block Expansion Context 
  * done, a function that accepts a JQuery
    HTML Element
  * and expand, a function that accepts a JQuery
    HTML Element and expands any blocks embedded
    within the element

  context.element must contain a single text node
  that represents a Search Interface ID.

  Loads search interface and replaces 
  context.element with the filter element. If an 
  error occurs, that error is passed to done.
  If no error, calls done and then expand.
*/
function search_filterBlock (context, done, expand) {
  var interface = search_INTERFACES [context.element.text ()];
  if (!interface) {
    var error = new Error ('[search][search_filterBlock] Error: The "' + context.element.text () + '" search interface has not been initialized.'); 
    strictError (error);
    return done (error);
  }
  interface.getFilterElement (
    function (error, filterElement) {
      if (error) { return done (error); }

      context.element.replaceWith (filterElement);
      done (null, filterElement);
    },
    expand
  );
}

/*
  search_form_block accepts three arguments:

  * context, a Block Expansion Context
  * and done, a function that accepts two
    arguments: an Error object and a JQuery HTML
    Element.

  context.element must contain a single text node
  that represents a Search Interface id.

  search_form_block replaces context.element with an
  inline search form and calls done. Whenever
  a query is entered into the form, an event
  handler executes the query against the
  referenced search interface.

  If an error occurs, search_block throws a
  strict error and passes the error to done.
*/
function search_formBlock (context, done) {
  var interface = search_INTERFACES [context.element.text ()];
  if (!interface) {
    var error = new Error ('[search][search_formBlock] Error: The "' + context.element.text () + '" search interface has not been initialized.');
    strictError (error);
    return done (error);
  }
  var element = search_createFormElement (interface);
  context.element.replaceWith (element);
  done (null, element);
}

/*
  Accepts two arguments:
  * context, a Block Expansion Context
  * one, a function that accepts two arguments:
   an Error object and a JQuery HTML Element

  context.element must contain a text node that
  represents an index name.

  search_IndexBlock loads the search database for
  the index given by context.element.text (),
  generates a Lunr index from that database, and
  creates an HTML Element that replaces 
  context.element and is passed to done.
*/
function search_indexBlock (context, done) {
  var indexName = context.element.text ();

  // I. Load search database
  var index = search_DATABASE [indexName];
  if (!index) {
    var error = new Error ('[search][search_indexBlock] Error: The "' + indexName + '" index does not exist.');
    strictError (error);
    return done (error);
  }
  // II. Generate lunr index
  index.getLunrIndex (
    function (error, lunrIndex) {
      if (error) { done (error); }

      // III. Create Lunr index element
      var element = $('<div></div>')
        .addClass ('search_index')
        .append ($('<div></div>')
          .addClass ('search_index_name')
          .text (indexName))
        .append ($('<textarea></textarea>')
          .addClass ('search_lunr_index')
          .text (JSON.stringify (lunrIndex.toJSON ())));

      // IV. Replace context.element
      context.element.replaceWith (element);
      done (null, element);
  }); 
}

/*
  search_interfaceBlock accepts two arguments:

  * context, a Block Expansion Context
  * and done, a function that accepts two
    arguments: an Error object and a JQuery HTML
    Element.

  context.element must have an HTML ID attribute
  and contain a single text node that represents
  a Search ID.

  search_interfaceBlock removes context.element,
  creates a search interface linked to the index
  given by the search ID, adds the interface to
  search_INTERFACES using context.element's ID as
  the interface ID, and calls done.

  If the search ID includes a query,
  search_interfaceBlock executes it before
  calling done.

  If an error occurs, search_interfaceBlock
  throws a strict error and passes the error
  to done.
*/
function search_interfaceBlock (context, done) {
  var errorMessage = '[search][search_interfaceBlock]';

  // I. Get the interface ID
  var interfaceId = context.element.attr ('id');
  if (!interfaceId) {
    var error = new Error (errorMessage + ' Error: The Search Interface block is invalid. The HTML ID attribute is required for Search Interface blocks.');
    strictError (error);
    return done (error);
  }

  // II. Parse the search ID
  var searchId    = new URI (context.element.text ());
  var indexName   = searchId.segmentCoded (1);
  var query       = searchId.segmentCoded (2);
  var start       = parseInt (searchId.segment (3), 10);
  var num         = parseInt (searchId.segment (4), 10);

  if (isNaN (start)) {
    strictError (errorMessage + ' Error: "' + context.element.text () + '" is an invalid search id. The "start" parameter is missing or invalid.');
    start = 0;
  }
  if (isNaN (num)) {
    strictError (errorMessage + ' Error: "' + context.element.text () + '" is an invalid search id. The "num" parameter is missing or invalid.');
    num = 10;
  }

  // II. Remove the block element
  context.element.remove ();

  // III. Create and register the search interface 
  var index = search_DATABASE [indexName];
  if (!index) {
    var error = new Error (errorMessage + ' Error: The Search index "' + indexName + '" does not exist.');
    strictError (error);
    return done (error);
  }

  var interface = new search_Interface (interfaceId, index, start, num);

  search_INTERFACES [interfaceId] = interface;

  query ? interface.search (query, function () {
    done (null);
  }) : done (null);
}

/*
  search_linkBlock accepts two arguments:

  * context, a Block Expansion Context
  * and done, a function that does not accept
    any arguments.

  context.element must contain a single text node
  that represents a Search ID. 

  search_linkBlock replaces context.element with
  a search form linked to the referenced search
  index and calls done. Whenever a user enters
  a query into the form, the Search module will
  redirect them to the search results page.
*/
function search_linkBlock (context, done) {
  var searchId = new URI (context.element.text ());
  var element = search_createLinkElement (searchId);
  context.element.replaceWith (element);
  done (element);
}

/*
  search_resultsBlock accepts three arguments:
  
  * context, a Block Expansion Context
  * done, a function that accepts two arguments:
    an Error object and a JQuery HTML Element
  * and expand, a function that accepts a JQuery
    HTML Element.

  context.element must contain a single text node
  that represents a Search Interface ID.

  search_resultsElement replaces context.element
  with a search results element that lists the
  results returned by the last query executed
  against the referenced interface and then calls
  done. Whenever the interface executes a
  new query, an event handler updates this list.

  If an error occurs, search_resultsBlock throws
  a strict error and passes the error to done.
*/
function search_resultsBlock (context, done, expand) {
  var interface = search_INTERFACES [context.element.text ()];
  if (!interface) {
    var error = new Error ('[search][search_resultsBlock] Error: The "' + context.element.text () + '" search interface has not been initialized.');
    strictError (error);
    return done (error);
  }

  var loadingElement = $('<div></div>').addClass ('search_loading');
  context.element.replaceWith (loadingElement);

  interface.getResultsElement (
    function (error, resultsElement) {
      if (error) { return done (error); }

      loadingElement.replaceWith (resultsElement);
      done (null, resultsElement);
    },
    expand
  );
} 

/*
  Accepts three arguments:

  * context, a Block Expansion Context
  * and done, a function that accepts a jQuery
    HTML Element

  context.element must contain a single text node
  that represents a Search Interface ID.

  Loads the search interface referenced by
  context.element and passes a pagination element
  to done. If an error occurs, this function
  passes the error to done.

  If a search update occurs, this function
  updates the pagination.
*/
function search_paginationBlock (context, done) {
  // I. Load the search interface.
  var interface = search_INTERFACES [context.element.text ()];
  if (!interface) {
    var error = new Error ('[search][search_paginationBlock] Error: The "' + context.element.text () + '" search interface has not been initialized.');
    strictError (error);
    return done (error);
  }
  var paginationElement = interface.createPaginationElement ();
  context.element.replaceWith (paginationElement);
  done (null, paginationElement);
}

/*
  Accepts no arguments and returns a jQuery HTML
  Element that represents a pagination element
  for this interface.

  Note: this function registers a search event
  handler with this interface.
*/
search_Interface.prototype.createPaginationElement = function () {
  var self = this;

  // I. Get current properties.
  var currentPage = this.getCurrentPage ();
  var numPages    = this.getNumPages ();
  var numResults  = this.getNumResults ();

  // II. Create pagination element.
  var paginationElement = $('<div></div>')
    .addClass ('search_pagination')
    .attr ('data-search-pagination-num-results', numResults)
    .attr ('data-search-pagination-num-pages', numPages);

  // III. Create the first link element.
  var firstLinkElement = this.createPaginationFirstLinkElement ();
  paginationElement.append (firstLinkElement);

  // IV. Create the previous link element.
  var prevLinkElement = this.createPaginationPrevLinkElement ();
  paginationElement.append (prevLinkElement);

  // V. Create the pagination links.
  var pageLinkContainerElement = $('<div></div>')
    .addClass ('search_pagination_link_container')
    .append (this.createPaginationPageLinkElements ());

  paginationElement.append (pageLinkContainerElement);

  // VI. Create the next link element.
  var nextLinkElement = this.createPaginationNextLinkElement ();
  paginationElement.append (nextLinkElement);

  // VII. Create the last link element.
  var lastLinkElement = this.createPaginationLastLinkElement ();
  paginationElement.append (lastLinkElement);

  // V. Register the search event handler.
  this.searchEventHandlers.push (function (done) {
    // Update the previous link element.
    if (self.onFirstPage ()) {
      prevLinkElement.addClass (search_disabledClassName);
      firstLinkElement.addClass (search_disabledClassName);
    } else {
      prevLinkElement.removeClass (search_disabledClassName);
      firstLinkElement.removeClass (search_disabledClassName);
    }

    // Update the pagination link elements.
    pageLinkContainerElement.empty ()
      .append (self.createPaginationPageLinkElements ());

    // Update the next link element.
    if (self.onLastPage ()) {
      nextLinkElement.addClass (search_disabledClassName);
      lastLinkElement.addClass (search_disabledClassName);
    } else {
      nextLinkElement.removeClass (search_disabledClassName);
      lastLinkElement.removeClass (search_disabledClassName);
    }

    // Continue.
    done ();
  });

  // VI. Return the pagination element.
  return paginationElement;
}

/*
  Accepts no arguments and returns an array of
  jQuery HTML Elements that represent pagination
  links.
*/
search_Interface.prototype.createPaginationPageLinkElements = function () {
  var linkElements = [];
  var lastPage    = this.getLastPage ();
  for (var index = 0; index <= lastPage; index ++) {
    linkElements.push (this.createPaginationPageLinkElement (index));
  }
  return linkElements;
}

/*
  Accepts one argument: index, an integer; and
  returns a jQuery HTML Element the represets
  a pagination page link to index.
*/
search_Interface.prototype.createPaginationPageLinkElement = function (index) {
  var self = this;
  var linkElement = search_createPaginationLinkElement ()
    .addClass ('search_pagination_page_link')
    .addClass (this.isCurrentPage (index) && 'search_pagination_page_link_current')
    .addClass (this.isFirstPage (index) && 'search_pagination_page_link_first')
    .addClass (this.isLastPage (index) && 'search_pagination_page_link_last')
    .attr ('data-search-pagination-page-link-index', index)
    .text (index + 1)
    .click (function () {
        self.start = index * self.num;
        self.search (self.query, function () {});
      });

  var maxRadius = 10;
  var radius = this.getPaginationRadius (index);
  linkElement.attr ('data-search-pagination-page-link-radius', radius);
  for (; radius <= maxRadius; radius ++) {
    linkElement.addClass ('search-pagination-page-link-radius-' + radius);
  }
  return linkElement;
}

/*
  Accepts no arguments and returns a jQuery HTML
  Element that represent the pagination Previous
  link element.
*/
search_Interface.prototype.createPaginationPrevLinkElement = function () {
  var self = this;
  return search_createPaginationStepLinkElement ()
    .addClass ('search_pagination_step_link_prev')
    .addClass (this.onFirstPage () && search_disabledClassName)
    .text ('Prev')
    .click (function () {
        var currentPage = self.getCurrentPage ();
        if (currentPage === 0) { return; }
        self.start = (currentPage - 1) * self.num;
        self.search (self.query, function (error) {});
      });
}

/*
  Accepts no arguments and returns a jQuery HTML
  Element that represent the pagination Next
  link element.
*/
search_Interface.prototype.createPaginationNextLinkElement = function () {
  var self = this;
  return search_createPaginationStepLinkElement ()
    .addClass ('search_pagination_step_link_next')
    .addClass (this.onLastPage () && search_disabledClassName)
    .text ('Next')
    .click (function () {
        var currentPage = self.getCurrentPage ();
        var lastPage    = self.getLastPage ();
        if (currentPage === lastPage) { return; }
        self.start = (currentPage + 1) * self.num;
        self.search (self.query, function () {});
      });
}

/*
  Accepts no arguments and returns a jQuery HTML
  Element that represents a previous/next link.
*/
function search_createPaginationStepLinkElement () {
  return search_createPaginationLinkElement ()
    .addClass ('search_pagination_step_link');
}

/*
  Accepts no arguments and returns a jQuery HTML
  Element that represents the First link.
*/
search_Interface.prototype.createPaginationFirstLinkElement = function () {
  var self = this;
  return search_createPaginationQuickLinkElement ()
    .addClass ('search_pagination_quicklink_first')
    .addClass (this.onFirstPage () && search_disabledClassName)
    .text ('First')
    .click (function () {
        self.start = 0;
        self.search (self.query, function () {});
      });
}

/*
  Accepts no arguments and returns a jQuery HTML
  Element that represents the Last link.
*/
search_Interface.prototype.createPaginationLastLinkElement = function () {
  var self = this;
  return search_createPaginationQuickLinkElement ()
    .addClass ('search_pagination_quicklink_last')
    .addClass (this.onLastPage () && search_disabledClassName)
    .text ('Last')
    .click (function () {
        self.start = self.getLastPage () * self.num;
        self.search (self.query, function () {});
      });
}

/*
  Accepts no arguments and returns a jQuery HTML
  Element that represents a generic pagination
  quicklink.
*/
function search_createPaginationQuickLinkElement () {
  return search_createPaginationLinkElement ()
    .addClass ('search_pagination_quicklink');
}

/*
  Accepts no arguments and returns a jQuery HTML
  Element that represents a generic pagination
  link.
*/
function search_createPaginationLinkElement () {
  return $('<div></div>').addClass ('search_pagination_link');
}

/*
  Represents the class used to label disabled
  pagination links.
*/
var search_disabledClassName = 'search_disabled';

/*
  Accepts one argument: index, an integer that
  represents a pagination link index; and returns
  the minimum bracket radius that includes the
  link at index.
*/
search_Interface.prototype.getPaginationRadius = function (index) {
  var currentPage = this.getCurrentPage ();
  return index >= currentPage ?
    Math.min (index - currentPage, Math.ceil (index/2)):
    Math.min (currentPage - index, Math.ceil ((this.getLastPage () - index)/2));
}

/*
  Accepts two arguments:
  * name, a string that represents a Search Interface ID
  * source, the name of a search source

  Returns a strict error if search_SOURCES already
  has a value assigned to the given name.
  Otherwise adds the source to the search_SOURCES
  variable, associated with the key of name, and
  returns undefined.
*/
function search_registerSource (name, source) {
  if (search_SOURCES [name]) {
    return strictError ();
  }
  search_SOURCES [name] = source;
}

/*
  Accepts two arguments:
  * url, the location of the database XML file
  * done, a function that accepts an Error
    object and a JQuery HTML Element

  Loads and parses the search database. Returns
  undefined.

*/
function search_loadDatabase (url, done) {
  $.ajax (url, {
    dataType: 'xml',
    success: function (doc) {
      done (null, search_parseDatabase (doc));
    },
    error: function (request, status, errorMsg) {
      var error = '[search][search_loadDatabase] Error: an error occured while trying to load the database at "' + url + '".';
      strictError (error);
      done (error); 
    }
  });
}

/*
  Accepts one argument, databaseElement, the XML
  database document. Creates a search_Index
  object from each lunrIndexURL element and adds
  it to the database associative array. Returns
  database.
*/
function search_parseDatabase (databaseElement) {
  var database = {};
  $('> database > index', databaseElement).each (
    function (i, indexElement) {
      database [$('> name', indexElement).text ()]
        = new search_Index (
            $('> lunrIndexURL', indexElement).text (),
            $('> setIds > setId', indexElement).map (
              function (i, setElement) {
                return $(setElement).text ();
              }).toArray ());
  });
  return database;
}

/*
  Accepts two arguments:
  * lunrIndexURL, a string representing the json
    URL of an index
  * setIds, an array identifying the data
    included in the index

  and returns a search_Index object.
*/
function search_Index (lunrIndexURL, setIds) {
  this.lunrIndexURL = lunrIndexURL;
  this.setIds = setIds;
}

/*
  Accepts one argument, done, a function that
  accepts two arguments: an Error object and a
  JQuery HTML Element. Generates a lunrIndex 
  value if the search_Index instance doesn't
  have one, passes that result to done, and
  passes done to createLunrIndex.
*/
search_Index.prototype.getLunrIndex = function (done) {
  if (this.lunrIndex) {
    return done (null, this.lunrIndex);
  } 
  if (this.lunrIndexURL) {
    var self = this;
    return search_loadLunrIndex (this.lunrIndexURL,
      function (error, lunrIndex) {
        if (error) { return done (error); }

        self.lunrIndex = lunrIndex;
        done (null, lunrIndex);
    });
  }
  this.createLunrIndex (done);
}

/*
  Accepts one argument, done, a function that
  accepts two arguments: an Error object and a
  JQuery HTML Element. Generates a lunrIndex
  value and attaches it to the search_Index
  instance.

  If an error occurs, passes it to done and
  returns done. Otherwise returns undefined.
*/
search_Index.prototype.createLunrIndex = function (done) {
  var self = this;
  this.getEntries (
    function (error, entries) {
      if (error) { return done (error); }

      self.lunrIndex = search_createLunrIndex (entries);
      done (null, self.lunrIndex);
  });
}

/*
  Accepts one argument, done, a function that
  accepts two arguments: an Error object and a
  JQuery HTML Element. Generates an array of
  search index entries and attaches them to the
  search_Index instance.

  Returns done if this.entries exists, or if an
  error occurs. Otherwise calls done.
*/
search_Index.prototype.getEntries = function (done) {
  // I. If this.entries exists, return done
  if (this.entries) {
    return done (null, this.entries);
  }
  var self = this;

  // II. If not, generate entries
  search_getSetsEntries (this.setIds,
    function (error, entries) {
      /// III. Send error to done and return
      if (error) { return done (error); }

      self.entries = entries;

      // IV. Send new entries to done
      done (null, entries);
  });
}

/*
  Accepts two arguments: 
  * url, a string
  * done, a function that accepts two arguments:
    an Error object and a JQuery HTML Element

  Runs an Ajax call for the Lunr index file.
  Calls done when finished, passing an error if
  one occurs and the retrieved json file if not.
 
*/
function search_loadLunrIndex (url, done) {
  $.get (url,
    function (json) {
      index = lunr.Index.load (json);
      done (null, index);
    },
    'json'
  ).fail (function () {
    var error = new Error ('[search][search_loadLunrIndex] Error: An error occured while trying to load the Lunr index "' + url + '".');
    strictError (error);
    done (error);
  });
}

/*
  Accepts one argument, id, string. Returns
  a search_Entry object.
*/
function search_Entry (id) {
  this.id = id;
}

/*
  Accepts two arguments:

  * query, a string that represents the current
    search query
  * and done, a function that accepts two
    arguments: error, an Error object; and
    resultElement, a jQuery HTML Element

  and passes a jQuery HTML Element that
  represents this entry to done.
*/
search_Entry.prototype.getResultElement = function (query, done) {
  done (null, $('<li></li>')
    .addClass ('search_result')
    .addClass ('search-' + getContentType (this.id) + '-result')
    .append ($('<div></div>')
      .addClass ('search_result_id')
      .append (getContentLink (this.id, this.id))));
}

/*
  Accepts three arguments:

  * query, a string that represents the current
    search query
  * entries, an array
  * done, a function that accepts two arguments:
    an Error object and a JQuery HTML Element

  Generates jQuery HTML Objects representing the
  result entries, and calls done.
*/
function search_getEntriesResultElements (query, entries, done) {
  async.mapSeries (entries,
    function (entry, next) {
      entry.getResultElement (query, next);
    },
    done
  );
}

/*
  Accepts three arguments:
  * index, a Lunr Index
  * start, an integer
  * num, an integer

  and returns a search_Interface object.
*/
function search_Interface (id, index, start, num) {
  this.id                  = id;
  this.index               = index;
  this.query               = ''; 
  this.start               = start;
  this.num                 = num;
  this.results             = []; 
  this.searchEventHandlers = [];
  this.lastQueryTime       = 0; // timestamp of the last query.
}

/*
  Accepts no arguments and returns an integer
  representing the current page index.
*/
search_Interface.prototype.getCurrentPage = function () {
  return Math.floor (this.start / this.num);
}

/*
  Accepts no arguments and returns the total
  number of results.
*/
search_Interface.prototype.getNumResults = function () {
  return this.results.length;
}

/*
  Accepts no arguments and returns an integer
  representing the total number of pages.
*/
search_Interface.prototype.getNumPages = function () {
  return Math.ceil (this.getNumResults () / this.num);
}

/*
  Accepts no arguments and returns an integer
  that represents the index of the last page.
*/
search_Interface.prototype.getLastPage = function () {
  return this.getNumPages () - 1;
}

/*
  Accepts no arguments and returns true iff this
  interface is currently on its first page.
*/
search_Interface.prototype.onFirstPage = function () {
  return this.getCurrentPage () === 0;
}

/*
  Accepts no arguments and returns true iff this
  interface is currently on its last page.
*/
search_Interface.prototype.onLastPage = function () {
  return this.getCurrentPage () === this.getLastPage ();
}

/*
  Accepts one argument: index, an integer;
  and returns true iff index refers to this
  interface's current page.
*/
search_Interface.prototype.isCurrentPage = function (index) {
  return index === this.getCurrentPage ();
}

/*
  Accepts one argument: index, an integer;
  and returns true iff index refers to this
  interface's first page.
*/
search_Interface.prototype.isFirstPage = function (index) {
  return index === 0;
}

/*
  Accepts one argument: index, an integer;
  and returns true iff index refers to this
  interface's last page.
*/
search_Interface.prototype.isLastPage = function (index) {
  return index === this.getLastPage ();
}

/*
  Accepts two arguments:
  * query, a string
  * done, a function that accepts two arguments:
    an Error object and a JQuery HTML Element

  Searches the lunrIndex with the given query,
  and sends done to callSearchEventHandlers.
*/
search_Interface.prototype.search = function (query, done) {
  this.query = query;
  var self = this;
  this.index.getLunrIndex (
    function (error, lunrIndex) {
      if (error) { done (error); }

      self.lastQueryTime = Date.now ();
      self.results = lunrIndex.search (query);
      if (self.start >= self.results.length) { self.start = 0; }
      self.callSearchEventHandlers (done);
  });
}

/*
  Accepts one argument, done, a function that 
  accepts two arguments: an Error object and a 
  JQuery HTML Element. Calls searchEventHandlers
  and then done.
*/
search_Interface.prototype.callSearchEventHandlers = function (done) {
  async.series (this.searchEventHandlers, done);
}

/*
  Accepts two arguments: 
  * done, a function that accepts two arguments:
    an Error object and a JQuery HTML Element
  * expand, a function that accepts a JQuery
    HTML Element and expands any blocks embedded
    within the element

  Opens the filter element and appends the search
  results. This function also registers
  a search event handler that updates the filter
  element. Passes the filter element, with the
  appended results, to done.
*/
search_Interface.prototype.getFilterElement = function (done, expand) {
  var filterElement = $('<ol></ol>').addClass ('search_filter');

  var self = this;
  this.getFilterElements (
    function (error, filterElements) {
      if (error) { return done (error); }

      self.searchEventHandlers.push (
      	function (done) {
      	  self.getFilterElements (
      	    function (error, filterElements) {
              if (error) { return done (error); }

    	      expand (filterElement.empty ().append (resultElements), done);
    	  });
      });

      done (null, filterElement.append (resultElements));
  });
}

/*
  Accepts one argument, done, a function that 
  accepts two arguments: an Error object and a 
  JQuery HTML Element. Looks up the search results
  for a query and passes done to getResultElements.
*/
search_Interface.prototype.getFilterElements = function (done) {
  var self = this;
  if (!this.query) {
    return this.index.getEntries (
      function (error, entries) {
        if (error) { return done (error); }

        search_getEntriesResultElements (self.query, entries, done);
    });
  }
  this.getResultElements (done);
}

/*
  Accepts two arguments:

  * done, a function that accepts a JQuery
    HTML Element
  * and expand, a function that accepts a JQuery
    HTML Element and expands any blocks embedded
    within the element

  Creates an JQuery HTML Element that represents
  this interface's search results and passes the
  element to done. This function also registers
  a search event handler that updates the search
  results element whenever a search is executed
  against the interface.
*/
search_Interface.prototype.getResultsElement = function (done, expand) {
  var self = this;
  this.getResultElements (
    function (error, resultElements) {
      var resultsElement = $('<ol></ol>')
        .addClass ('search_results')
        .attr ('style', 'counter-reset: search_interface ' + self.start)
        .append (resultElements && resultElements.length > 0 ?
            resultElements :
            $('<div class="search_no_results_block"></div>')
          );

      self.searchEventHandlers.push (
        function (done) {
          resultsElement
            .empty ()
            .attr ('style', 'counter-reset: search_interface ' + self.start)
            .append ($('<div></div>').addClass ('search_loading'));

          self.getResultElements (
            function (error, resultElements) {
              if (error) { return done (error); }

              expand (
                resultsElement.append (
                  resultElements && resultElements.length > 0 ?
                    resultElements :
                    $('<div class="search_no_results_block"></div>')),
                function (error) {
                  $('.search_loading', resultsElement).remove ();
                  done (error);
              });
          });
      });
      done (null, resultsElement);
  });
}

/*
  Accepts one argument:
  * done, a function that accepts a single JQuery
    HTML Element

  Gets the current search results, creates
  elements that represent these search results,
  and passes those results to 
  search_getEntriesResultElements.
*/
search_Interface.prototype.getResultElements = function (done) {
  var self = this;
  this.getResultEntries (
    function (error, entries) {
      if (error) { return done (error); }

      search_getEntriesResultElements (self.query, entries, done);
  });
}

/*
  Accepts one argument:
  * done, a function that accepts a single JQuery
    HTML Element

  Returns the entry for each item gathered by getResults.
*/
search_Interface.prototype.getResultEntries = function (done) {
  var self = this;
  this.index.getEntries (
    function (error, entries) {
      if (error) { return done (error); }

      done (null, self.getResults ().map (
        function (result) {
          var entry = search_getEntry (entries, result.ref);
          if (!entry) {
            strictError (new Error ('[search][search_Interface.getResultEntries] Error: no search entry exists for "' + result.ref + '".'));
            return null;
          }
          return entry;
      }));
  });
}

/*
  Accepts no arguments. Returns an array of results,
  a subsection of the this.results based on the 
  instance's start and num values.
*/
search_Interface.prototype.getResults = function () {
  return this.results.slice (this.start, this.start + this.num);
}

/*
  Accepts one argument, entries, an array of ??objects??.
  Returns index, a Lunr object that catalogues 
  search results.
*/
function search_createLunrIndex (entries) {
  var index = lunr (
    function () {
      var names = search_getFieldNames (entries);
      var numNames = names.length;
      for (var i = 0; i < numNames; i ++) {
        this.field (names [i]);
      }
  });
  var numEntries = entries.length;
  for (var i = 0; i < numEntries; i ++) {
    index.add (entries [i]);
  }
  return index;
}

/*
  Accepts one argument, entries, an array 
  representing search result entries. Returns
  names, an array of the names of all the entries
  given.
*/
function search_getFieldNames (entries) {
  var names = [];
  var numEntries = entries.length;
  for (var i = 0; i < numEntries; i ++) {
    var entry = entries [i];
    var entryNames = Object.keys (entry);
    var numEntryNames = entryNames.length;
    for (var j = 0; j < numEntryNames; j ++) {
      var entryName = entryNames [j];
      if (names.indexOf (entryName) === -1) {
        names.push (entryName);
      }
    }
  }
  return names;
}

/*
  Accepts two arguments:
  * setIds, an array of strings that is a value
    of the search_Index object
  * done, a function that accepts two arguments:
    an Error object and a JQuery HTML Element

  Looks up the entries associated with a setId
  and pushes them into entries. Passes those
  entries into next, and then calls done.
*/
function search_getSetsEntries (setIds, done) {
  async.reduce (setIds, [],
    function (entries, setId, next) {
      search_getSetEntries (setId,
        function (error, setEntries) {
          if (error) { return next (error); }

          Array.prototype.push.apply (entries, setEntries);
          next (null, entries);
      });
    },
    done
  );
}

/*
  Accepts two arguments:
  * setId, a string value from the 
    search_Index.setIds array
  * done, a function that accepts two arguments:
    an Error object and a JQuery HTML Element

    Sends setName and done to source.
*/
function search_getSetEntries (setId, done) {
  var errorMsg = '[search][search_getSetEntries] Error: an error occured while trying get entries from search set "' + setId + '".';

  /*
    I. If a value with the key setId has already
    been added to search_ENTRIES, pass it to done
    and return done 
  */
  if (search_ENTRIES [setId]) {
    return done (null, search_ENTRIES [setId]);
  }

  // II. If not, create a URI path from setId
  var path = new URI (setId).segmentCoded ();
  if (path.length < 1) {
    var error = new Error (errorMsg);
    strictError (error);
    return done (error);
  }

  // III. Get the first value from the path 
  var sourceName = path [0];

  /*
    IV. Find the search_SOURCES function 
    associated with the sourceName key
  */
  var source = search_SOURCES [sourceName];
  if (!source) {
    var error = new Error (errorMsg);
    strictError (error);
    return done (error);
  }

  /*
    V. Assign setName to the second value of path
    or null if it doesn't exist
  */
  var setName = path.length > 1 ? path [1] : null;

  // VI. Call source
  source (setName, done);
}

/*
  Accepts two arguments:
  * entries, an array of objects
  * id, a string

  Iterates through the entries array, and returns
  the entry that matches the given id.
*/
function search_getEntry (entries, id) {
  for (var i = 0; i < entries.length; i ++) {
    if (entries [i].id === id) {
      return entries [i];
    }
  }
  return null;
}

/*
  search_createFormElement accepts one argument:
  interface, a Search Interface; and returns a
  search form element linked to interface as a
  JQuery HTML Element.
*/
function search_createFormElement (interface) {
  var inputElement = $('<input></input>')
    .addClass ('search_input')
    .addClass ('search_form_input')
    .attr ('type', 'text')
    .attr ('placeholder', 'Search')
    .val (interface.query)
    .on ('input', function () {
       interface.search ($(this).val (), function () {});
     });

  interface.searchEventHandlers.push (
    function (done) {
      inputElement.val (interface.query);
      done (null);
  });

  return $('<div></div>')
    .addClass ('search_form')
    .append (inputElement)
    .append ($('<div></div>')
      .addClass ('search_button')
      .addClass ('search_form_button')
      .click (function () {
          interface.search (inputElement.val (), function () {});
        }));
}

/*
  search_createLinkElement accepts one argument:
  searchId, a Search Id; and returns a search
  form as a JQuery HTML Element.

  If a user enters a query in the form, the
  Search module will redirect the user to the
  search results page with the query.
*/
function search_createLinkElement (searchId) {
  var inputElement = $('<input></input>')
    .addClass ('search_input')
    .addClass ('search_link_input')
    .attr ('type', 'text')
    .attr ('placeholder', 'Search')
    .val (searchId.segmentCoded (2))
    .keypress (function (event) {
        if (event.which === 13) {
          loadPage (search_getSearchURL (searchId, $(this).val ()));
        }
      });

  return $('<div></div>')
    .addClass ('search_link')
    .append (inputElement)
    .append ($('<div></div>')
      .addClass ('search_button')
      .addClass ('search_link_button')
      .click (function () {
          loadPage (search_getSearchURL (searchId, $(inputElement).val ()));
        }));
}

/*
  search_getSearchURL accepts two arguments:

  * searchId, a Search Id
  * and keywords, a string that represents a
    collection of search terms

  and returns a URL string that represents a
  query for keywords against searchId.
*/
function search_getSearchURL (searchId, keywords) {
  return new URI ('')
    .segmentCoded ('search_page_block')
    .segmentCoded (searchId.segmentCoded (1))
    .segmentCoded (keywords ? keywords : ' ')
    .segment (searchId.segment (3))
    .segment (searchId.segment (4))
    .toString ();
}
