Menu Module
===========

The Menu module provides developers with a way to organize content into tree-like structures composed of nodes and leafs.

The Menu module is defined by menu.js. This file defines the module's base classes, block handlers, and load event handler. The opening to this file reads.

```javascript
/*
  The Menu module provides developers with a way
  to organize content into tree-like structures
  composed of nodes and leafs.
*/

// Declares the QUnit test module.
QUnit.module ('Menu');
```

Example Usage
-------------
The Menu module defineds the Menu class, which represents menus within Lucidity. Each Menu object must be added to the menu_MENUS array, which maintains a record of all registered menus. Once a Menu object has been registered, it can then be displayed using the Menu blocks listed below. The following presents an example of a Menu object:

```javascript
/*
  Accepts no arguments and returns a new example
  menu.
*/
function createExampleMenu () {
  // I. Create a menu that does not have any children.
  var menu = new menu_Menu ([]);

  // II. Create a menu node that does not have any children.
  var node0 = new menu_Node (null, 'example_node_0', 'Example Node 0', [], 'menu_example_node');
  menu.children.push (node0);  

  // III. Create a leaf and add it to our menu.
  var leaf0 = new menu_Leaf (null, 'example_leaf_0', 'Example Leaf 0', 'menu_example_leaf');
  menu.children.push (leaf0);

  // IV. Create two leafs and add them to node0..
  var leaf1 = new menu_Leaf (node0, 'example_leaf_1', 'Example Leaf 1', 'menu_example_leaf');
  var leaf2 = new menu_Leaf (node0, 'example_leaf_2', 'Example Leaf 2', 'menu_example_leaf'); 
  node0.children.push (leaf1, leaf2);

  // V. Create two new menu nodes.
  var node1 = new menu_Node (node0, 'example_node_1', 'Example Node 1', [], 'menu_example_node');
  var node2 = new menu_Node (node0, 'example_node_2', 'Example Node 2', [], 'menu_example_node');  
  node0.children.push (node1, node2);  

  // VI. Create a leaf and add it to node1.
  var leaf3 = new menu_Leaf (node1, 'example_leaf_3', 'Example Leaf 3', 'menu_example_leaf');
  node1.children.push (leaf3);

  // VII. Create a leaf and add it to node2.
  var leaf4 = new menu_Leaf (node2, 'example_leaf_4', 'Example Leaf 4', 'menu_example_leaf');
  node2.children.push (leaf4);  

  return menu;
}
```


The Global Variables
--------------------

```javascript
/*
  The `menu_MENUS` menu_Menu array lists the
  set of registered menus keyed by menu ID.
*/
var menu_MENUS = {};
```

The Load Event Handler
----------------------

```javascript
/*
  The Menu module's load event handler. This
  function registers the module's block and
  curly handlers.
*/
MODULE_LOAD_HANDLERS.add (
  function (done) {
    // I. Register the block handlers.
    block_HANDLERS.addHandlers ({
      menu_contents_block:            menu_contentsBlock,
      menu_leaf_label_block:          menu_leafLabelBlock,
      menu_leaf_link_block:           menu_leafLinkBlock,
      menu_leaf_next_label_block:     menu_leafNextLabelBlock,
      menu_leaf_next_link_block:      menu_leafNextLinkBlock,
      menu_leaf_parent_label_block:   menu_leafParentLabelBlock,
      menu_leaf_parent_link_block:    menu_leafParentLinkBlock,
      menu_leaf_previous_label_block: menu_leafPreviousLabelBlock,
      menu_leaf_previous_link_block:  menu_leafPreviousLinkBlock,
      menu_leaf_breadcrumb_block:     menu_leafBreadcrumbBlock,
      menu_node_label_block:          menu_nodeLabelBlock,
      menu_node_link_block:           menu_nodeLinkBlock,
      menu_node_next_label_block:     menu_nodeNextLabelBlock,
      menu_node_next_link_block:      menu_nodeNextLinkBlock,
      menu_node_parent_label_block:   menu_nodeParentLabelBlock,
      menu_node_parent_link_block:    menu_nodeParentLinkBlock,
      menu_node_previous_label_block: menu_nodePreviousLabelBlock,
      menu_node_previous_link_block:  menu_nodePreviousLinkBlock
    });

    // II. Register the curly handlers.
    curly_HANDLERS.addHandlers ({
      'menu.current_page': menu_currentPageCurlyBlock
    });

    done ();
});
```

The Curly Block Handlers
------------------------

The Menu module also defines Curly block handlers. 

```javascript
/*
  Accepts three arguments:

  * pageId, a string that represents the current
    page ID
  * content, a string that represents the text
    passed to this block
  * and done, a function that accepts two
    arguments: error, an Error; and expansion,
    a string

  where `content` must be a menu ID string, and
  passes the name of the current page to done.
*/
function menu_currentPageCurlyBlock (pageID, content, done) {
  var errorPrefix = '[menu][menu_currentPageCurlyBlock]';
  var menu = menu_MENUS [content.trim ()];
  if (!menu) {
    var error = new Error (errorPrefix + ' Error: invalid menu ID ("' + content + '").');
    strictError (error);
    return done (null, '');
  }
  var leaf = menu.getLeaf (pageID);
  if (!leaf) {
    var error = new Error (errorPrefix + ' Error: the current page is not listed in menu "' + content + '".');
    strictError (error);
    return done (null, '');
  }
  done (null, leaf.getLabelElement ().text ());
}

// Unittests for `menu_currentPageCurlyBlock`.
unittest ('menu_currentPageCurlyBlock',
  {
    globals: [
      {variableName: 'menu_MENUS', value: {}}
    ]
  },
  function (assert, elements) {
    menu_MENUS = {
      'example_menu': createExampleMenu ()
    }

    assert.expect (1);
    var handlers = new curly_HandlerStore ();
    handlers.add ('menu.current_page', menu_currentPageCurlyBlock);

    var done0 = assert.async ();
    curly_expandBlocks (handlers, 'example_leaf_4',
      'current page: {{#menu.current_page}}example_menu{{/menu.current_page}}',
      function (error, expansion) {
        assert.strictEqual (expansion, 'current page: Example Leaf 4');
        done0 ();
    });
});
```

The Block Handlers
------------------

The Menu module defines multiple block handlers. The most important of these is the Menu Contents block which returns an HTML element that represents a given menu node.

```javascript
/*
  menu_contentsBlock accepts two arguments:

  * context, a Block Expansion Context
  * done, a function that accepts two arguments:
    an Error object and a JQuery HTML Element.

  context.element must be a DIV element that
  contains seven child elements:

  * The first element must belong to the
    menu_id class and contain a single text node
    representing a menu ID.

  * The second element must belong to the
    menu_node_id class and contain a single text
    node representing a menu node ID.

  * The third element must belong to the
    menu_num_columns class and contain a single
    text node specifying the number of columns
    that the menu element will be divided into.

  * The fourth element must belong to the
    menu_max_level class and contain an integer
    value specifying the maximum number of menu
    levels to include in the menu element.

  * The fifth element must belong to the
    max_expand_level class and contains an
    integer value specifying the maximum number
    of menu levels to initially display in the
    menu element.

  * The sixth element must belong to the
    menu_expandable class and must contain a
    single boolean value of "true" or "false". This
    element indicates whether or not users should
    be able to expand and collapse menu items
    beyond the max_expand_level.

  * and the seventh element must belong to the
    menu_selected_element_id class and contain a
    single text node representing the initially
    selected element ID.

  If an error occurs in menu_contentsBlock, it 
  passes the error to done.
*/
function menu_contentsBlock (context, done) {
  getBlockArguments ([
      {'name': 'menu_id',                  'text': true, 'required': true},
      {'name': 'menu_node_id',             'text': true, 'required': true},
      {'name': 'menu_num_columns',         'text': true, 'required': true},
      {'name': 'menu_max_level',           'text': true, 'required': true},
      {'name': 'menu_expand_level',        'text': true, 'required': true},
      {'name': 'menu_expandable',          'text': true, 'required': true},
      {'name': 'menu_selected_element_id', 'text': true, 'required': true}
    ],
    context.element,
    function (error, blockArguments) {
      if (error) { return done (error); }
      var menu = menu_MENUS [blockArguments.menu_id.trim ()];

      if (!menu) {
        var error = new Error ('[menu][menu_contentsBlock] Error: an error occured while trying to load menu "' + blockArguments.menu_id.trim () + '". The menu does not exist.');
        strictError (error);
        return done (error);
      }

      // I. Load the menu node referenced by menu_id
      var node = menu.getNode (blockArguments.menu_node_id.trim ());
      if (!node) {
        var error = new Error ('[menu][menu_contentsBlock] Error: an error occured while trying to load node "' + blockArguments.menu_node_id.trim () + '". The node does not exist.');
        strictError (error);
        return done (error);
      }

      /*
        II. Create a new HTML element that 
        represents the node using the settings
        provided by context.element
      */
      var element = node.getContentsElement (
        blockArguments.menu_num_columns.trim (),
        blockArguments.menu_max_level.trim ()
      );

      var level = parseInt (blockArguments.menu_expand_level.trim ()) + 1;
      menu_collapse (level, element);

      if (blockArguments.menu_expandable === 'true') {
        menu_makeCollapsable (level, blockArguments.menu_max_level.trim (), element);
      }

      var leaf = menu.getLeaf (blockArguments.menu_selected_element_id.trim ());
      if (leaf) {
        var line = leaf.getLine ();

        menu_select     (blockArguments.menu_selected_element_id.trim (), element);
        menu_selectLine (line, element);

        if (blockArguments.menu_expandable.trim () === 'true') {
          menu_expandLine (line, element);
        }
      }

      /*
        III. Replace context.element with the new
        element
      */
      context.element.replaceWith (element);

      PAGE_LOAD_HANDLERS.add (
        function (id, done) {
          menu_deselect (element);
          var leaf = menu.getLeaf (id);
          if (leaf) {
            var newLine = leaf.getLine ();
            menu_select     (id, element);
            menu_selectLine (newLine, element);
            menu_expandLine (newLine, element);
          }
          done (null);
      });

      // IV. Pass the element to done
      done (null, element);
  });
}

/*
  Unittest for menu_contentsBlock.

  Confirms that the function generates an ol element
  that reflects the contents within a given book. 
*/
unittest ('menu_contentsBlock', 
  { 
    globals: [
      { variableName: 'menu_MENUS', value: {} }
    ],
    elements: [
        $('<div class="menu_container">\
          <div class="menu_id">example_menu</div>\
          <div class="menu_node_id">example_node_0</div>\
          <div class="menu_num_columns">1</div>\
          <div class="menu_max_level">5</div>\
          <div class="menu_expand_level">2</div>\
          <div class="menu_expandable">true</div>\
          <div class="menu_selected_element_id">example_leaf_1</div>\
        </div>')
      ]
  },
  function (assert, elements) {
    menu_MENUS = {
      example_menu: createExampleMenu ()
    }  
    assert.expect (3);
    var done = assert.async ();
    var context = new block_Context (12, elements [0]);

    menu_contentsBlock (context, function (error, element) {
      assert.strictEqual ($('ol.menu_contents .menu_selected').length, 1, 'Only one item in the menu is selected.');
      assert.strictEqual ($('ol.menu_contents .menu_contents_leaf_item').length, $('ol.menu_contents a').length, 'The number of leaf items in the menu matches the number of links in the menu.');
      assert.strictEqual ($('ol.menu_contents .menu_contents_leaf_item').length, 4, 'The number of leaf items in the menu matches the number of leafs in the example menu.');
      done ();
    });
  }
)

/*
  menu_leafLabelBlock accepts two arguments:

  * context, a Block Expansion Context
  * done, a function that accepts two arguments:
    an Error object and a JQuery HTML Element.

  context.element must be a DIV element that
  contains two child elements.

  * The first, must belong to the menu_id class
    and contain a single text node representing
    a menu ID.
  * The second, must belong to the menu_leaf_id
    class and contain a single text node
    representing a menu leaf ID.

  If an error occurs, menu_leafLabelBlock passes
  the error to done and returns done. Otherwise
  it passes the element to done.
*/
function menu_leafLabelBlock (context, done) {
  var errorPrefix = '[menu][menu_leafLabelBlock]';

  getBlockArguments ([
      {'name': 'menu_id',      'text': true, 'required': true},
      {'name': 'menu_leaf_id', 'text': true, 'required': true}
    ],
    context.element,

    // I. Load referenced menu element
    function (error, blockArguments) {
      var menu = menu_MENUS [blockArguments.menu_id.trim ()];
      if (!menu) {
        var error = new Error (errorPrefix + ' Error: an error occured while trying to load menu "' + blockArguments.menu_id.trim () + '". The menu does not exist.');
        strictError (error);
        return done (error);
      }

      var leaf = menu.getLeaf (blockArguments.menu_leaf_id.trim ())
      if (!leaf) {
        var error = new Error (errorPrefix + ' Error: an error occured while trying to load menu leaf "' + blockArguments.menu_leaf_id.trim () + '". The leaf does not exist.');
        strictError (error);
        return done (error);
      }

      /*
        II. Create an HTML element that represents
        the element's title
      */
      var element = leaf.getLabelElement ();

      /* 
        III. Replace context.element with the new
        element
      */
      context.element.replaceWith (element);

      // IV. Pass the new element to done
      done (null, element);
  });
}

/*
  Unittest for menu_leafLabelBlock.

  Confirms that the function generates a span
  element with the appropriate classes.
*/
unittest ('menu_leafLabelBlock', 
  { 
    globals: [
      { variableName: 'menu_MENUS', value: {} }
    ],
    elements: [
        $('<div class="menu_container">\
          <div class="menu_id">example_menu</div>\
          <div class="menu_leaf_id">example_leaf_1</div>\
        </div>')
      ]
  },
  function (assert, elements) {
    assert.expect (4);
    menu_MENUS = {
      example_menu: createExampleMenu ()
    }
    var done = assert.async ();
    var context = new block_Context (12, elements [0]);

    menu_leafLabelBlock (context, function (error, element) {
      assert.ok ($(element[0]).is('span'), 'menu_leafLabelBlock returns a span element.');
      assert.ok (element.hasClass('menu_leaf_label'), 'The leaf label has the .menu_leaf_label class.');
      assert.strictEqual (element.children ().length, 0, 'The leaf label has no children.');
      assert.strictEqual (element[0].innerText, 'Example Leaf 1', 'The leaf label matches the title of the leaf object.');
      done ();
    });
  }
)

/*
  menu_leafLinkBlock accepts two arguments:

  * context, a Block Expansion Context
  * done, a function that accepts two arguments:
    an Error object and a JQuery HTML Element.

  context.element must be a DIV element that
  contains two child elements.

  * The first, must belong to the menu_id class
    and contain a single text node representing
    a menu ID.
  * The second, must belong to the menu_leaf_id
    class and contain a single text node
    representing a menu leaf ID.

  If an error occurs, menu_leafLinkBlock passes
  the error to done and returns done. Otherwise
  it passes the element to done.
*/
function menu_leafLinkBlock (context, done) {
  var errorPrefix = '[menu][menu_leafLinkBlock]';

  getBlockArguments ([
      {'name': 'menu_id',      'text': true, 'required': true},
      {'name': 'menu_leaf_id', 'text': true, 'required': true}
    ],
    context.element,

    // I. Load the references menu element
    function (error, blockArguments) {
      var menu = menu_MENUS [blockArguments.menu_id.trim ()];
      if (!menu) {
        var error = new Error (errorPrefix + ' Error: an error occured while trying to load menu "' + blockArguments.menu_id.trim () + '". The menu does not exist.');
        strictError (error);
        return done (error);
      }

      var leaf = menu.getLeaf (blockArguments.menu_leaf_id.trim ())
      if (!leaf) {
        var error = new Error (errorPrefix + ' Error: an error occured while trying to load menu leaf "' + blockArguments.menu_leaf_id.trim () + '". The leaf does not exist.');
        strictError (error);
        return done (error);
      }

      /* 
        II. Creates an HTML link element that 
        represents the menu element's title
      */
      var element = leaf.getLinkElement ();

      /* 
        III. Replace context.element with the new
        element
      */
      context.element.replaceWith (element);

      // IV. Pass the new element to done
      done (null, element);
  });
}

/*
  Unittest for menu_leafLinkBlock.

  Confirms that the function generates a link
  to the page URL, as determined by the menu leaf
  ID.
*/
unittest ('menu_leafLinkBlock', 
  {
    globals: [
      { variableName: 'menu_MENUS', value: {} }
    ],  
    elements: [
        $('<div class="menu_container">\
          <div class="menu_id">example_menu</div>\
          <div class="menu_leaf_id">example_leaf_0</div>\
        </div>')
      ]
  },
  function (assert, elements) {
    assert.expect (4);
    var done = assert.async ();
    var context = new block_Context (12, elements [0]);
    menu_MENUS = {
      example_menu: createExampleMenu ()
    }     

    menu_leafLinkBlock (context, function (error, element) {
      assert.ok ($(element[0]).is('a'), 'menu_leafLabelBlock returns a link element.');
      assert.ok (element.hasClass('menu_leaf_link'), 'The leaf link has the .menu_leaf_link class.');
      assert.strictEqual (element.children ().length, 0, 'The leaf link has no children.');
      assert.strictEqual (element[0].href.split('#')[1], $('.menu_leaf_id', elements[0]).text (), 'The leaf link\'s href element matches the menu_leaf_id of the given context.');
      done ();
    });
  }
)

/*
  menu_leafNextLabelBlock accepts two arguments:

  * context, a Block Expansion Context
  * done, a function that accepts two arguments:
    an Error object and a JQuery HTML Element.

  context.element must be a DIV element that
  contains two child elements.

  * The first, must belong to the menu_id class
    and contain a single text node representing
    a menu ID.
  * The second, must belong to the menu_leaf_id
    class and contain a single text node
    representing a menu leaf ID.

  If an error occurs, menu_leafNextLabelBlock passes
  the error to done and returns done. Otherwise
  it passes the element to done.
*/
function menu_leafNextLabelBlock (context, done) {
  var errorPrefix = '[menu][menu_leafNextLabelBlock]';

  getBlockArguments ([
      {'name': 'menu_id',      'text': true, 'required': true},
      {'name': 'menu_leaf_id', 'text': true, 'required': true}
    ],
    context.element,

    // I. Load referenced menu element
    function (error, blockArguments) {
      var menu = menu_MENUS [blockArguments.menu_id.trim ()];
      if (!menu) {
        var error = new Error (errorPrefix + ' Error: an error occured while trying to load menu "' + blockArguments.menu_id.trim () + '". The menu does not exist.');
        strictError (error);
        return done (error);
      }

      var leaf = menu.getLeaf (blockArguments.menu_leaf_id.trim ())
      if (!leaf) {
        var error = new Error (errorPrefix + ' Error: an error occured while trying to load menu leaf "' + blockArguments.menu_leaf_id.trim () + '". The leaf does not exist.');
        strictError (error);
        return done (error);
      }

      /* 
        II. Create an HTML element that represents
        the title of the next leaf in the 
        referenced menu
      */
      var element = leaf.getNextLabelElement ();

      /* 
        III. Replace context.element with the new
        element
      */
      context.element.replaceWith (element);

      // IV. Pass the new element to done
      done (null, element);
  });
}

/*
  Unittest for menu_leafNextLabelBlock.

  Confirms that the function generates a span
  element equivalent to the leaf that most
  closely follows the submitted leaf element.
*/
unittest ('menu_leafNextLabelBlock', 
  {
    globals: [
      { variableName: 'menu_MENUS', value: {} }
    ],  
    elements: [
        $('<div class="menu_container">\
          <div class="menu_id">example_menu</div>\
          <div class="menu_leaf_id">example_leaf_1</div>\
        </div>'),
        $('<div class="menu_container">\
          <div class="menu_id">example_menu</div>\
          <div class="menu_leaf_id">example_leaf_0</div>\
        </div>'),        
      ]
  },
  function (assert, elements) {
    assert.expect (5);
    menu_MENUS = {
      example_menu: createExampleMenu ()
    }

    var done0 = assert.async ();
    var context0 = new block_Context (12, elements [0]);
    menu_leafNextLabelBlock (context0, function (error, element) {
      assert.ok ($(element[0]).is('span'), 'menu_leafNextLabelBlock returns a span element.');
      assert.ok (element.hasClass('menu_leaf_label'), 'The leaf label has the .menu_leaf_label class.');
      assert.strictEqual (element.children ().length, 0, 'The leaf label has no children.');
      assert.strictEqual (element[0].innerText, 'Example Leaf 2', 'The leaf label matches the title of the next leaf.');
      done0 ();
    });

    var done1 = assert.async ();
    var context1 = new block_Context (4, elements [1]);    
    menu_leafNextLabelBlock (context1, function (error, element) {
      assert.notOk (element, 'Element returns null because example_leaf_0 is the last leaf in the menu.');
      done1 ();
    }); 

  }
)

/*
  menu_leafNextLinkBlock accepts two arguments:

  * context, a Block Expansion Context
  * done, a function that accepts two arguments:
    an Error object and a JQuery HTML Element.

  context.element must be a DIV element that
  contains two child elements.

  * The first, must belong to the menu_id class
    and contain a single text node representing
    a menu ID.
  * The second, must belong to the menu_leaf_id
    class and contain a single text node
    representing a menu leaf ID.

  If an error occurs, menu_leafNextLabelBlock passes
  the error to done and returns done. Otherwise
  it passes the element to done.
*/
function menu_leafNextLinkBlock (context, done) {
  var errorPrefix = '[menu][menu_leafNextLinkBlock]';
  getBlockArguments ([
      {'name': 'menu_id',      'text': true, 'required': true},
      {'name': 'menu_leaf_id', 'text': true, 'required': true}
    ],
    context.element,

    // I. Load referenced menu element
    function (error, blockArguments) {
      var menu = menu_MENUS [blockArguments.menu_id.trim ()];
      if (!menu) {
        var error = new Error (errorPrefix + ' Error: an error occured while trying to load menu "' + blockArguments.menu_id.trim () + '". The menu does not exist.');
        strictError (error);
        return done (error);
      }

      var leaf = menu.getLeaf (blockArguments.menu_leaf_id.trim ())
      if (!leaf) {
        var error = new Error (errorPrefix + ' Error: an error occured while trying to load menu leaf "' + blockArguments.menu_leaf_id.trim () + '". The leaf does not exist.');
        strictError (error);
        return done (error);
      }

      /* 
        II. Create an HTML element that represents
        a link to the next leaf in the referenced
        menu
      */
      var element = leaf.getNextLinkElement ();

      /* 
        II. Replace context.element with the new
        element
      */
      context.element.replaceWith (element);

      // IV. Pass the new element to done
      done (null, element);
  });
}

/*
  Unittest for menu_leafNextLinkBlock.

  Confirms that the function generates a link
  to the page URL of the most closely following
  leaf to the submitted element.
*/
unittest ('menu_leafNextLinkBlock', 
  {
    globals: [
      { variableName: 'menu_MENUS', value: {} }
    ],  
    elements: [
        $('<div class="menu_container">\
          <div class="menu_id">example_menu</div>\
          <div class="menu_leaf_id">example_leaf_1</div>\
        </div>'),
        $('<div class="menu_container">\
          <div class="menu_id">example_menu</div>\
          <div class="menu_leaf_id">example_leaf_0</div>\
        </div>'),        
      ]
  },
  function (assert, elements) {
    assert.expect (4);
    menu_MENUS = {
      example_menu: createExampleMenu ()
    }

    var done0 = assert.async ();
    var context0 = new block_Context (12, elements [0]);    
    menu_leafNextLinkBlock (context0, function (error, element) {
      assert.ok ($(element[0]).is('a'), 'menu_leafLabelBlock returns a link element.');
      assert.ok (element.hasClass('menu_leaf_link'), 'The leaf link has the .menu_leaf_link class.');
      assert.strictEqual (element[0].innerText, 'Example Leaf 2', 'The element returns matches the title of the next element.');
      done0 ();
    });

    var done1 = assert.async ();
    var context1 = new block_Context (4, elements [1]);    
    menu_leafNextLinkBlock (context1, function (error, element) {
      assert.notOk (element, 'Element returns null because example_leaf_0 is the last leaf in the menu.');
      done1 ();
    });    
  }
)

/*
  menu_leafParentLabelBlock accepts two
  arguments:

  * context, a Block Expansion Context
  * done, a function that accepts two arguments:
    an Error object and a JQuery HTML Element.

  context.element must be a DIV element that
  contains two child elements.

  * The first, must belong to the menu_id class
    and contain a single text node representing
    a menu ID.
  * The second, must belong to the menu_leaf_id
    class and contain a single text node
    representing a menu leaf ID.

  If an error occurs, menu_leafParentLabelBlock 
  passes the error to done and returns done. 
  Otherwise it passes the element to done.
*/
function menu_leafParentLabelBlock (context, done) {
  var errorPrefix = '[menu][menu_leafParentLabelBlock]';
  getBlockArguments ([
      {'name': 'menu_id',      'text': true, 'required': true},
      {'name': 'menu_leaf_id', 'text': true, 'required': true}
    ],
    context.element,

    // I. Load referenced menu element
    function (error, blockArguments) {
      var menu = menu_MENUS [blockArguments.menu_id.trim ()];
      if (!menu) {
        var error = new Error (errorPrefix + ' Error: an error occured while trying to load menu "' + blockArguments.menu_id.trim () + '". The menu does not exist.');
        strictError (error);
        return done (error);
      }

      var leaf = menu.getLeaf (blockArguments.menu_leaf_id.trim ())
      if (!leaf) {
        var error = new Error (errorPrefix + ' Error: an error occured while trying to load menu leaf "' + blockArguments.menu_leaf_id.trim () + '". The leaf does not exist.');
        strictError (error);
        return done (error);
      }
      /* 
        II. Create an HTML element that represents
        the title of the referenced leaf's parent
      */
      var element = leaf.getParentLabelElement ();

      /* 
        III. Replace context.element with the new
        element
      */
      context.element.replaceWith (element);

      // IV. Pass the new element to done
      done (null, element);
  });
}

/*
  Unittest for menu_leafParentLinkBlock.

  Confirms that the function generates a spam
  element with the name of the leaf's parent
  node.
*/
unittest ('menu_leafParentLabelBlock', 
  {
    globals: [
      { variableName: 'menu_MENUS', value: {} }
    ],  
    elements: [
        $('<div class="menu_container">\
          <div class="menu_id">example_menu</div>\
          <div class="menu_leaf_id">example_leaf_1</div>\
        </div>'),
        $('<div class="menu_container">\
          <div class="menu_id">example_menu</div>\
          <div class="menu_leaf_id">example_leaf_0</div>\
        </div>'),        
      ]
  },
  function (assert, elements) {
    assert.expect (4);
    menu_MENUS = {
      example_menu: createExampleMenu ()
    }

    var done0 = assert.async ();
    var context0 = new block_Context (12, elements [0]);    
    menu_leafParentLabelBlock (context0, function (error, element) {
      assert.ok ($(element[0]).is('span'), 'menu_leafParentLabelBlock returns a span element.');
      assert.ok (element.hasClass('menu_node_label'), 'The leaf label has the .menu_node_label class.');
      assert.strictEqual (element[0].innerText, 'Example Node 0', 'The label matches the title of the node.');
      done0 ();
    });

    var done1 = assert.async ();
    var context1 = new block_Context (15, elements [1]);    
    menu_leafParentLabelBlock (context1, function (error, element) {
      assert.notOk (element, 'menu_leafParentLabelBlock returns null because example_leaf_0 does not have a parent.');
      done1 ();
    });    
  }
)   

/*
  menu_leafParentLinkBlock accepts two
  arguments:

  * context, a Block Expansion Context
  * done, a function that accepts two arguments:
    an Error object and a JQuery HTML Element.

  context.element must be a DIV element that
  contains two child elements.

  * The first, must belong to the menu_id class
    and contain a single text node representing
    a menu ID.
  * The second, must belong to the menu_leaf_id
    class and contain a single text node
    representing a menu leaf ID.

  If an error occurs, menu_leafParentLinkBlock 
  passes the error to done and returns done. 
  Otherwise it passes the element to done.
*/
function menu_leafParentLinkBlock (context, done) {
  var errorPrefix = '[menu][menu_leafParentLinkBlock]';
  getBlockArguments ([
      {'name': 'menu_id',      'text': true, 'required': true},
      {'name': 'menu_leaf_id', 'text': true, 'required': true}
    ],
    context.element,

    // I. Load referenced menu element
    function (error, blockArguments) {
      var menu = menu_MENUS [blockArguments.menu_id.trim ()];
      if (!menu) {
        var error = new Error (errorPrefix + ' Error: an error occured while trying to load menu "' + blockArguments.menu_id.trim () + '". The menu does not exist.');
        strictError (error);
        return done (error);
      }

      var leaf = menu.getLeaf (blockArguments.menu_leaf_id.trim ())
      if (!leaf) {
        var error = new Error (errorPrefix + ' Error: an error occured while trying to load menu leaf "' + blockArguments.menu_leaf_id.trim () + '". The leaf does not exist.');
        strictError (error);
        return done (error);
      }

      /* 
        II. Create an HTML element that represents
        a link to the referenced leaf's parent
      */
      var element = leaf.getParentLinkElement ();

      /* 
        III. Replace context.element with the new
        element
      */
      context.element.replaceWith (element);

      // IV. Pass the new element to done
      done (null, element);
  });
}

/*
  Unittest for menu_leafParentLinkBlock.

  Confirms that the function generates a link
  to the leaf's parent's first child (since nodes
  themselves do not have links).
*/
unittest ('menu_leafParentLinkBlock', 
  {
    globals: [
      { variableName: 'menu_MENUS', value: {} }
    ],  
    elements: [
        $('<div class="menu_container">\
          <div class="menu_id">example_menu</div>\
          <div class="menu_leaf_id">example_leaf_1</div>\
        </div>'),
        $('<div class="menu_container">\
          <div class="menu_id">example_menu</div>\
          <div class="menu_leaf_id">example_leaf_0</div>\
        </div>'),        
      ]
  },
  function (assert, elements) {
    assert.expect (4);
    menu_MENUS = {
      example_menu: createExampleMenu ()
    }
    console.log('1')

    var done0 = assert.async ();
    var context0 = new block_Context (12, elements [0]);    
    menu_leafParentLinkBlock (context0, function (error, element) {
      assert.ok ($(element[0]).is('a'), 'menu_leafNextLinkBlock returns a link element.');
      assert.ok (element.hasClass('menu_example_node'), 'The leaf link has the .menu_example_node class.');
      assert.strictEqual (element[0].innerText, 'Example Node 0', 'The element returned matches the title of the leaf\'s parent node.');
      done0 ();
    });

    var done1 = assert.async ();
    var context1 = new block_Context (4, elements [1]);    
    menu_leafParentLinkBlock (context1, function (error, element) {
      assert.notOk (element, 'Element returns null because example_leaf_0 has no parent.');
      done1 ();
    });    
  }
)


/*
  menu_leafPreviousLabelBlock accepts two
  arguments:

  * context, a Block Expansion Context
  * done, a function that accepts two arguments:
    an Error object and a JQuery HTML Element.

  context.element must be a DIV element that
  contains two child elements.

  * The first, must belong to the menu_id class
    and contain a single text node representing
    a menu ID.
  * The second, must belong to the menu_leaf_id
    class and contain a single text node
    representing a menu leaf ID.

  If an error occurs, menu_leafPreviousLabelBlock
  passes the error to done and returns done. 
  Otherwise it passes the element to done.  
*/
function menu_leafPreviousLabelBlock (context, done) {
  var errorPrefix = '[menu][menu_leafPreviousLabelBlock]';
  getBlockArguments ([
      {'name': 'menu_id',      'text': true, 'required': true},
      {'name': 'menu_leaf_id', 'text': true, 'required': true}
    ],
    context.element,

    // I. Load referenced menu element
    function (error, blockArguments) {
      var menu = menu_MENUS [blockArguments.menu_id.trim ()];
      if (!menu) {
        var error = new Error (errorPrefix + ' Error: an error occured while trying to load menu "' + blockArguments.menu_id.trim () + '". The menu does not exist.');
        strictError (error);
        return done (error);
      }

      var leaf = menu.getLeaf (blockArguments.menu_leaf_id.trim ())
      if (!leaf) {
        var error = new Error (errorPrefix + ' Error: an error occured while trying to load menu leaf "' + blockArguments.menu_leaf_id.trim () + '". The leaf does not exist.');
        strictError (error);
        return done (error);
      }
      /* 
        II. Create an HTML element that represents
        the title of the previous leaf in the
        referenced menu
      */      
      var element = leaf.getPreviousLabelElement ();

      /* 
        III. Replace context.element with the new
        element
      */
      context.element.replaceWith (element);

      // IV. Pass the new element to done      
      done (null, element);
  });
}

/*
  Unittest for menu_leafPreviousLabelBlock.

  Confirms that the function generates a span
  element equivalent to the leaf that most
  closely precedes the submitted leaf element.
*/
unittest ('menu_leafPreviousLabelBlock', 
  {
    globals: [
      { variableName: 'menu_MENUS', value: {} }
    ],  
    elements: [
        $('<div class="menu_container">\
          <div class="menu_id">example_menu</div>\
          <div class="menu_leaf_id">example_leaf_1</div>\
        </div>'),   
        $('<div class="menu_container">\
          <div class="menu_id">example_menu</div>\
          <div class="menu_leaf_id">example_leaf_3</div>\
        </div>'),
        $('<div class="menu_container">\
          <div class="menu_id">example_menu</div>\
          <div class="menu_leaf_id">example_leaf_0</div>\
        </div>')              
      ]
  },
  function (assert, elements) {
    assert.expect (5);
    menu_MENUS = {
      example_menu: createExampleMenu ()
    }

    var done0 = assert.async ();
    var context0 = new block_Context (12, elements [0]);
    menu_leafPreviousLabelBlock (context0, function (error, element) {
      assert.notOk (element, 'Element returns null because example_leaf_0 is the first leaf in the menu.');
      done0 ();
    });

    var done1 = assert.async ();
    var context1 = new block_Context (12, elements [1]);
    menu_leafPreviousLabelBlock (context1, function (error, element) {
      assert.ok ($(element[0]).is('span'), 'menu_leafPreviousLabelBlock returns a span element.');
      assert.ok (element.hasClass('menu_leaf_label'), 'The leaf label has the .menu_leaf_label class.');
      assert.strictEqual (element[0].innerText, 'Example Leaf 2', 'The leaf label matches the title of the preceding leaf.');
      done1 ();
    });

    var done2 = assert.async ();
    var context2 = new block_Context (12, elements [2]);
    menu_leafPreviousLabelBlock (context2, function (error, element) {
      assert.notOk (element, 'Element returns null because Example Leaf 0 has no preceding leaf element at or above its level.');
      done2 ();
    });  
  }
)

/*
  menu_leafPreviousLinkBlock accepts two
  arguments:

  * context, a Block Expansion Context
  * done, a function that accepts two arguments:
    an Error object and a JQuery HTML Element.

  context.element must be a DIV element that
  contains two child elements.

  * The first, must belong to the menu_id class
    and contain a single text node representing
    a menu ID.
  * The second, must belong to the menu_leaf_id
    class and contain a single text node
    representing a menu leaf ID.

  If an error occurs, menu_leafPreviousLinkBlock
  passes the error to done and returns done. 
  Otherwise it passes the element to done. 
*/
function menu_leafPreviousLinkBlock (context, done) {
  var errorPrefix = '[menu][menu_leafPreviousLinkBlock]';
  getBlockArguments ([
      {'name': 'menu_id',      'text': true, 'required': true},
      {'name': 'menu_leaf_id', 'text': true, 'required': true}
    ],
    context.element,
    function (error, blockArguments) {
      // I. Load referenced menu element
      var menu = menu_MENUS [blockArguments.menu_id.trim ()];
      if (!menu) {
        var error = new Error (errorPrefix + ' Error: an error occured while trying to load menu "' + blockArguments.menu_id.trim () + '". The menu does not exist.');
        strictError (error);
        return done (error);
      }

      var leaf = menu.getLeaf (blockArguments.menu_leaf_id.trim ())
      if (!leaf) {
        var error = new Error (errorPrefix + ' Error: an error occured while trying to load menu leaf "' + blockArguments.menu_leaf_id.trim () + '". The leaf does not exist.');
        strictError (error);
        return done (error);
      }

      /* 
        II. Create an HTML element that represents
        a link to the previous leaf in the 
        referenced menu
      */
      var element = leaf.getPreviousLinkElement ();

      /* 
        III. Replace context.element with the new
        element
      */      
      context.element.replaceWith (element);

      // IV. Pass the new element to done
      done (null, element);
  });
}

/*
  Unittest for menu_leafNextLinkBlock.

  Confirms that the function generates a link
  to the page URL of the most closely preceding
  leaf to the submitted element.
*/
unittest ('menu_leafPreviousLinkBlock', 
  {
    globals: [
      { variableName: 'menu_MENUS', value: {} }
    ],  
    elements: [
        $('<div class="menu_container">\
          <div class="menu_id">example_menu</div>\
          <div class="menu_leaf_id">example_leaf_2</div>\
        </div>'),
        $('<div class="menu_container">\
          <div class="menu_id">example_menu</div>\
          <div class="menu_leaf_id">example_leaf_1</div>\
        </div>')
      ]
  },
  function (assert, elements) {
    assert.expect (4);
    menu_MENUS = {
      example_menu: createExampleMenu ()
    };

    var done0 = assert.async ();
    var context0 = new block_Context (12, elements [0]);    
    menu_leafPreviousLinkBlock (context0, function (error, element) {
      assert.ok ($(element[0]).is('a'), 'menu_leafPreviousLabelBlock returns a link element.');
      assert.ok (element.hasClass('menu_leaf_link'), 'The leaf link has the .menu_leaf_link class.');
      assert.strictEqual (element[0].innerText, 'Example Leaf 1', 'The element returns matches the title of the next element.');
      done0 ();
    });

    var done1 = assert.async ();
    var context1 = new block_Context (4, elements [1]);    
    menu_leafPreviousLinkBlock (context1, function (error, element) {
      assert.notOk (element, 'Element returns null because example_leaf_1 is the first leaf in the menu.');
      done1 ();
    });    
  }
);

/*
  menu_leafBreadcrumbBlock accepts two
  arguments:

  * context, a Block Expansion Context
  * done, a function that accepts two arguments:
    an Error object and a JQuery HTML Element.

  context.element must be a DIV element that
  contains two child elements.

  * The first, must belong to menu_id class
    and contain a single text node representing
    a menu ID.
  * The second, must belong to the menu_leaf_id
    class and contain a single text node
    representing a menu leaf ID.

  menu_leafBreadcrumbBlock replaces
  context.element with a new element that
  represents a breadcrumb pointing to the leaf
  referenced by menu_leaf_id.
  
  If an error occurs, menu_leafPreviousLinkBlock
  passes the error to done and returns done. 
  Otherwise it passes the element to done. 
*/
function menu_leafBreadcrumbBlock (context, done) {
  var errorPrefix = '[menu][menu_leafBreadcrumbBlock]';
  getBlockArguments ([
      {'name': 'menu_id',      'text': true, 'required': true},
      {'name': 'menu_leaf_id', 'text': true, 'required': true}
    ],
    context.element,
    function (error, blockArguments) {
      // I. Load the referenced menu element.
      var menu = menu_MENUS [blockArguments.menu_id.trim ()];
      if (!menu) {
        var error = new Error (errorPrefix + ' Error: an error occured while trying to load menu "' + blockArguments.menu_id.trim () + '". The menu does not exist.');
        strictError (error);
        return done (error);
      }

      var leaf = menu.getLeaf (blockArguments.menu_leaf_id.trim ())
      if (!leaf) {
        var error = new Error (errorPrefix + ' Error: an error occured while trying to load menu leaf "' + blockArguments.menu_leaf_id.trim () + '". The leaf does not exist.');
        strictError (error);
        return done (error);
      }

      // II. Create the Breadcrumb element.
      var path = leaf.getPath ();
      var numItems = path ? path.length : 0;
      var breadcrumbElement = $('<div></div>')
        .addClass ('menu_leaf_breadcrumb')
        .attr ('data-menu-id', menu.id)
        .attr ('data-menu-leaf-id', leaf.id);

      path.forEach (
        function (element, index) {
          breadcrumbElement.append (
            (index === 0 ?
              $('<a></a>')
                .attr ('href', getContentURL (element.id))
                .addClass ('fa fa-home')
                .addClass ('menu_leaf_breadcrumb_arrow_first'):
              $('<span></span>')
                .addClass ('fa fa-angle-right'))
            .addClass ('menu_leaf_breadcrumb_arrow')
            .attr ('data-menu-leaf-breadcrumb-arrow-index', index)
            .addClass (index === numItems - 1 && 'menu_leaf_breadcrumb_arrow_last'));

          breadcrumbElement.append ($('<span></span>')
            .addClass ('menu_leaf_breadcrumb_item')
            .addClass (element instanceof menu_Leaf && 'menu_leaf_breadcrumb_item_leaf')
            .addClass (element instanceof menu_Node && 'menu_leaf_breadcrumb_item_node')
            .addClass (index === 0 && 'menu_leaf_breadcrumb_item_first')
            .addClass (index === numItems - 1 && 'menu_leaf_breadcrumb_item_last')
            .attr ('data-menu-leaf-breadcrumb-item-id', element.id)
            .attr ('data-menu-leaf-breadcrumb-item-index', index)
            .append (element.getPlainLinkElement ()));
      });

       // III. Replace context.element with the breadcrumb element.
       context.element.replaceWith (breadcrumbElement);

       // IV. Pass the new element to done.
       done (null, breadcrumbElement);
    }
  );
}

/*
  Unittest for menu_leafBreadcrumbBlock.
*/
unittest ('menu_leafBreadcrumbBlock',
  {
    globals: [
      { variableName: 'menu_MENUS', value: {} }
    ],
    elements: [
      $('<div class="test_0">\
        <div class="menu_id">example_menu</div>\
        <div class="menu_leaf_id">example_leaf_0</div>\
      </div>'),
      $('<div class="test_1">\
        <div class="menu_id">example_menu</div>\
        <div class="menu_leaf_id">example_leaf_4</div>\
      </div>')
    ]
  },
  function (assert, elements) {
    assert.expect (6);
    menu_MENUS = {
      example_menu: createExampleMenu ()
    };

    var done0 = assert.async ();
    var context0 = new block_Context (0, elements [0]);
    menu_leafBreadcrumbBlock (context0, function (error, element) {
      assert.ok ($('.menu_leaf_breadcrumb', element), 'menu_leafBreadcrumbBlock created a breadcrumb element.');
      assert.ok ($('.menu_leaf_breadcrumb_item', element).length === 1, 'menu_leafBreadcrumbBlock created the correct number of items.');
      assert.strictEqual ($('[data-menu-leaf-breadcrumb-item-id="example_leaf_0"] .menu_link', element).attr ('href'), '#example_leaf_0', 'menu_leafBreadcrumbBlock linked the leaf correctly.');
      done0 ();
    });

    var done1 = assert.async ();
    var context1 = new block_Context (1, elements [1]);
    menu_leafBreadcrumbBlock (context1, function (error, element) {
      assert.strictEqual ($('[data-menu-leaf-breadcrumb-item-id="example_leaf_4"] .menu_link', element).attr ('href'), '#example_leaf_4', 'menu_leafBreadcrumbBlock linked the last leaf correctly.');
      assert.strictEqual ($('[data-menu-leaf-breadcrumb-item-id="example_node_2"] .menu_link', element).attr ('href'), '#example_leaf_4', 'menu_leafBreadcrumbBlock linked the subnode correctly.');
      assert.strictEqual ($('[data-menu-leaf-breadcrumb-item-id="example_node_0"] .menu_link', element).attr ('href'), '#example_leaf_1', 'menu_leafBreadcrumbBlock linked the root node correctly.');
      done1 ();
    });
  }
);

/*
  menu_nodeLabelBlock accepts two arguments:

  * context, a Block Expansion Context
  * done, a function that accepts two arguments:
    an Error object and a JQuery HTML Element.

  context.element must be a DIV element that
  contains two child elements.

  * The first, must belong to the menu_id class
    and contain a single text node representing
    a menu ID.
  * The second, must belong to the menu_node_id
    class and contain a single text node
    representing a menu node ID.

  If an error occurs, menu_nodeLabelBlock passes
  the error to done and returns done. Otherwise
  it passes the element to done. 
*/
function menu_nodeLabelBlock (context, done) {
  var errorPrefix = '[menu][menu_nodeLabelBlock]';
  getBlockArguments ([
      {'name': 'menu_id',      'text': true, 'required': true},
      {'name': 'menu_node_id', 'text': true, 'required': true}
    ],
    context.element,

    // I. Load referenced menu element
    function (error, blockArguments) {
      var menu = menu_MENUS [blockArguments.menu_id.trim ()];
      if (!menu) {
        var error = new Error (errorPrefix + ' Error: an error occured while trying to load menu "' + blockArguments.menu_id.trim () + '". The menu does not exist.');
        strictError (error);
        return done (error);
      }

      var node = menu.getNode (blockArguments.menu_node_id.trim ())
      if (!node) {
        var error = new Error (errorPrefix + ' Error: an error occured while trying to load menu node "' + blockArguments.menu_node_id.trim () + '". The leaf does not exist.');
        strictError (error);
        return done (error);
      }

      /* 
        II. Create an HTML element that represents
        the menu node's title
      */
      var element = node.getLabelElement ();

      /* 
        III. Replace context.element with the new
        element
      */      
      context.element.replaceWith (element);

      // IV. Pass the new element to done
      done (null, element);
  });
}

/*
  Unittest for menu_nodeLabelBlock.

  Confirms that the function generates a span
  element with the appropriate classes.
*/
unittest ('menu_nodeLabelBlock', 
  { 
    globals: [
      { variableName: 'menu_MENUS', value: {} }
    ],
    elements: [
        $('<div class="menu_container">\
          <div class="menu_id">example_menu</div>\
          <div class="menu_node_id">example_node_0</div>\
        </div>')
      ]
  },
  function (assert, elements) {
    assert.expect (3);
    menu_MENUS = {
      example_menu: createExampleMenu ()
    }
    var done = assert.async ();
    var context = new block_Context (12, elements [0]);

    menu_nodeLabelBlock (context, function (error, element) {
      assert.ok ($(element[0]).is('span'), 'menu_nodeLabelBlock returns a span element.');
      assert.ok (element.hasClass('menu_node_label'), 'The node label has the .menu_node_label class.');
      assert.strictEqual (element[0].innerText, 'Example Node 0', 'The label matches the title of the node.');
      done ();
    });
  }
)

/*
  menu_nodeLinkBlock accepts two arguments:

  * context, a Block Expansion Context
  * done, a function that accepts two arguments:
    an Error object and a JQuery HTML Element.

  context.element must be a DIV element that
  contains two child elements.

  * The first, must belong to the menu_id class
    and contain a single text node representing
    a menu ID.
  * The second, must belong to the menu_node_id
    class and contain a single text node
    representing a menu node ID.

  If an error occurs, menu_nodeLinkBlock passes 
  the error to done and returns done. Otherwise
  it passes the element to done. 
*/
function menu_nodeLinkBlock (context, done) {
  var errorPrefix = '[menu][menu_nodeLinkBlock]';
  getBlockArguments ([
      {'name': 'menu_id',      'text': true, 'required': true},
      {'name': 'menu_node_id', 'text': true, 'required': true}
    ],
    context.element,

    // I. Load referenced menu element
    function (error, blockArguments) {
      var menu = menu_MENUS [blockArguments.menu_id.trim ()];
      if (!menu) {
        var error = new Error (errorPrefix + ' Error: an error occured while trying to load menu "' + blockArguments.menu_id.trim () + '". The menu does not exist.');
        strictError (error);
        return done (error);
      }

      var node = menu.getNode (blockArguments.menu_node_id.trim ())
      if (!node) {
        var error = new Error (errorPrefix + ' Error: an error occured while trying to load menu node "' + blockArguments.menu_node_id.trim () + '". The node does not exist.');
        strictError (error);
        return done (error);
      }

      /* 
        II. Create an HTML element that links to
        the menu node
      */
      var element = node.getLinkElement ();

      /* 
        III. Replace context.element with the new
        element
      */
      context.element.replaceWith (element);

      // IV. Pass the new element to done
      done (null, element);
  });
}

/*
  Unittest for menu_nodeLinkBlock.

  Confirms that the function generates a link
  to the page URL, as determined by the menu leaf
  ID.
*/
unittest ('menu_nodeLinkBlock', 
  {
    globals: [
      { variableName: 'menu_MENUS', value: {} }
    ],  
    elements: [
        $('<div class="menu_container">\
          <div class="menu_id">example_menu</div>\
          <div class="menu_node_id">example_node_0</div>\
        </div>')
      ]
  },
  function (assert, elements) {
    assert.expect (3);
    var done = assert.async ();
    var context = new block_Context (12, elements [0]);
    menu_MENUS = {
      example_menu: createExampleMenu ()
    }     

    menu_nodeLinkBlock (context, function (error, element) {
      assert.ok ($(element[0]).is('a'), 'menu_nodeLinkBlock returns a link element.');
      assert.ok (element.hasClass('menu_example_node'), 'The leaf link has the .menu_example_node class.');
      assert.strictEqual (element[0].href.split('#')[1], 'example_leaf_1', 'The node link\'s href element matches the first leaf child of the node.');
      done ();
    });
  }
)

/*
  menu_nodeNextLabelBlock accepts two arguments:

  * context, a Block Expansion Context
  * done, a function that accepts two arguments:
    an Error object and a JQuery HTML Element.

  context.element must be a DIV element that
  contains two child elements.

  * The first, must belong to the menu_id class
    and contain a single text node representing
    a menu ID.
  * The second, must belong to the menu_node_id
    class and contain a single text node
    representing a menu leaf ID.

  If an error occurs, menu_nodeNextLabelBlock
  passes the error to done and returns done. 
  Otherwise it passes the element to done.
*/
function menu_nodeNextLabelBlock (context, done) {
  var errorPrefix = '[menu][menu_nodeNextLabelBlock]';
  getBlockArguments ([
      {'name': 'menu_id',      'text': true, 'required': true},
      {'name': 'menu_node_id', 'text': true, 'required': true}
    ],
    context.element,

    // I. Load referenced menu element
    function (error, blockArguments) {
      var menu = menu_MENUS [blockArguments.menu_id.trim ()];
      if (!menu) {
        var error = new Error (errorPrefix + ' Error: an error occured while trying to load menu "' + blockArguments.menu_id.trim () + '". The menu does not exist.');
        strictError (error);
        return done (error);
      }

      var node = menu.getNode (blockArguments.menu_node_id.trim ())
      if (!node) {
        var error = new Error (errorPrefix + ' Error: an error occured while trying to load menu node "' + blockArguments.menu_node_id.trim () + '". The node does not exist.');
        strictError (error);
        return done (error);
      }

      /* 
        II. Create an HTML element that represents
        the title of the next leaf in the
        referenced menu
      */
      var element = node.getNextLabelElement ();

      /* 
        III. Replace context.element with the new
        element
      */
      context.element.replaceWith (element);

      // IV. Pass the new element to done
      done (null, element);
  });
}

/*
  Unittest for menu_nodeNextLabelBlock.

  Confirms that the function generates a span
  element equivalent to the leaf that most
  closely follows the submitted node element.
*/
unittest ('menu_nodeNextLabelBlock', 
  {
    globals: [
      { variableName: 'menu_MENUS', value: {} }
    ],  
    elements: [
      $('<div class="menu_container">\
        <div class="menu_id">example_menu</div>\
        <div class="menu_node_id">example_node_1</div>\
      </div>'),     
      $('<div class="menu_container">\
        <div class="menu_id">example_menu</div>\
        <div class="menu_node_id">example_node_2</div>\
      </div>'),     
      $('<div class="menu_container">\
        <div class="menu_id">example_menu</div>\
        <div class="menu_node_id">example_node_0</div>\
      </div>')
    ] 
  },
  function (assert, elements) {
    assert.expect (5);
    menu_MENUS = {
      example_menu: createExampleMenu ()
    }

    var done0 = assert.async ();
    var context0 = new block_Context (12, elements [0]);
    menu_nodeNextLabelBlock (context0, function (error, element) {
      assert.ok ($(element[0]).is('span'), 'menu_nodeNextLabelBlock returns a span element.');
      assert.ok (element.hasClass('menu_leaf_label'), 'The leaf has the .menu_leaf_label class.');
      assert.strictEqual (element[0].innerText, 'Example Leaf 4', 'The leaf label matches the title of the following node\'s leaf child.');
      done0 ();
    });

    var done1 = assert.async ();
    var context1 = new block_Context (12, elements [1]);
    menu_nodeNextLabelBlock (context1, function (error, element) {
      assert.notOk (element, 'menu_nodeNextLabelBlock returns null because example_node_2\'s only following leaf that is at its level or deeper is its own child.');
      done1 ();
    });

    var done2 = assert.async ();
    var context2 = new block_Context (12, elements [2]);
    menu_nodeNextLabelBlock (context1, function (error, element) {
      assert.notOk (element, 'menu_nodeNextLabelBlock returns null because example_node_0 has no parent in the menu.');
      done2 ();
    });
  }
)

/*
  menu_nodeNextLinkBlock accepts two arguments:

  * context, a Block Expansion Context
  * done, a function that accepts two arguments:
    an Error object and a JQuery HTML Element.

  context.element must be a DIV element that
  contains two child elements.

  * The first, must belong to the menu_id class
    and contain a single text node representing
    a menu ID.
  * The second, must belong to the menu_node_id
    class and contain a single text node
    representing a menu leaf ID.

  If an error occurs, menu_nodeNextLinkBlock
  passes the error to done and returns done. 
  Otherwise it passes the element to done. 
*/
function menu_nodeNextLinkBlock (context, done) {
  var errorPrefix = '[menu][menu_nodeNextLinkBlock]';
  getBlockArguments ([
      {'name': 'menu_id',      'text': true, 'required': true},
      {'name': 'menu_node_id', 'text': true, 'required': true}
    ],
    context.element,

    // I. Load referenced menu element
    function (error, blockArguments) {
      var menu = menu_MENUS [blockArguments.menu_id.trim ()];
      if (!menu) {
        var error = new Error (errorPrefix + ' Error: an error occured while trying to load menu "' + blockArguments.menu_id.trim () + '". The menu does not exist.');
        strictError (error);
        return done (error);
      }

      var node = menu.getNode (blockArguments.menu_node_id.trim ())
      if (!node) {
        var error = new Error (errorPrefix + ' Error: an error occured while trying to load menu node "' + blockArguments.menu_node_id.trim () + '". The node does not exist.');
        strictError (error);
        return done (error);
      }

      /* 
        II. Create an HTML element that represents
        a link to the next leaf in the referenced
        menu
      */
      var element = node.getNextLinkElement ();

      /* 
        III. Replace context.element with the new
        element
      */      
      context.element.replaceWith (element);

      // IV. Pass the new element to done
      done (null, element);
  });
}

/*
  Unittest for menu_nodeNextLinkBlock.

  Confirms that the the function returns a link
  to the leaf element that closest follows the
  given node.
*/
unittest ('menu_nodeNextLinkBlock', 
  {
    globals: [
      { variableName: 'menu_MENUS', value: {} }
    ],  
    elements: [
      $('<div class="menu_container">\
        <div class="menu_id">example_menu</div>\
        <div class="menu_node_id">example_node_1</div>\
      </div>'),     
      $('<div class="menu_container">\
        <div class="menu_id">example_menu</div>\
        <div class="menu_node_id">example_node_2</div>\
      </div>'),     
      $('<div class="menu_container">\
        <div class="menu_id">example_menu</div>\
        <div class="menu_node_id">example_node_0</div>\
      </div>')
    ] 
  },
  function (assert, elements) {
    assert.expect (5);
    menu_MENUS = {
      example_menu: createExampleMenu ()
    }

    var done0 = assert.async ();
    var context0 = new block_Context (12, elements [0]);
    menu_nodeNextLinkBlock (context0, function (error, element) {
      assert.ok ($(element[0]).is('a'), 'menu_nodeNextLabelBlock returns a link element.');
      assert.ok (element.hasClass('menu_leaf_link'), 'The leaf link has the .menu_leaf_link class.');
      assert.strictEqual (element[0].href.split('#')[1], 'example_leaf_4', 'The leaf link\'s href element matches the menu_leaf_id of the given context.');
      done0 ();
    });

    var done1 = assert.async ();
    var context1 = new block_Context (12, elements [1]);
    menu_nodeNextLinkBlock (context1, function (error, element) {
      assert.notOk (element, 'menu_nodeNextLinkBlock returns null because example_node_2\'s only following leaf that is at its level or deeper is its own child.');
      done1 ();
    });

    var done2 = assert.async ();
    var context2 = new block_Context (12, elements [2]);
    menu_nodeNextLinkBlock (context2, function (error, element) {
      assert.notOk (element, 'menu_nodeNextLinkBlock returns null because example_node_0 has no parent in the menu.');
      done2 ();
    });
  }
)

/*
  menu_nodeParentLabelBlock accepts two
  arguments:

  * context, a Block Expansion Context
  * done, a function that accepts two arguments:
    an Error object and a JQuery HTML Element.

  context.element must be a DIV element that
  contains two child elements.

  * The first, must belong to the menu_id class
    and contain a single text node representing
    a menu ID.
  * The second, must belong to the menu_node_id
    class and contain a single text node
    representing a menu node ID.

  If an error occurs, menu_nodeParentLabelBlock
  passes the error to done and returns done.
  Otherwise it passes the element to done. 
*/
function menu_nodeParentLabelBlock (context, done) {
  var errorPrefix = '[menu][menu_nodeParentLabelBlock]';
  getBlockArguments ([
      {'name': 'menu_id',      'text': true, 'required': true},
      {'name': 'menu_node_id', 'text': true, 'required': true}
    ],
    context.element,

    // I. Load referenced menu element
    function (error, blockArguments) {
      var menu = menu_MENUS [blockArguments.menu_id.trim ()];
      if (!menu) {
        var error = new Error (errorPrefix + ' Error: an error occured while trying to load menu "' + blockArguments.menu_id.trim () + '". The menu does not exist.');
        strictError (error);
        return done (error);
      }

      var node = menu.getNode (blockArguments.menu_node_id.trim ())
      if (!node) {
        var error = new Error (errorPrefix + ' Error: an error occured while trying to load menu node "' + blockArguments.menu_node_id.trim () + '". The node does not exist.');
        strictError (error);
        return done (error);
      }

      /* 
        II. Create an HTML element that represents
        the title of the referenced node's parent
      */
      var element = node.getParentLabelElement ();

      /* 
        III. Replace context.element with the new
        element
      */
      context.element.replaceWith (element);
      
      // IV. Pass the new element to done
      done (null, element);
  });
}

/*
  Unittest for menu_nodeParentLabelBlock.

  Confirms that the function generates a span
  element equivalent to the parent of the node.
*/
unittest ('menu_nodeParentLabelBlock', 
  {
    globals: [
      { variableName: 'menu_MENUS', value: {} }
    ],  
    elements: [
        $('<div class="menu_container">\
          <div class="menu_id">example_menu</div>\
          <div class="menu_node_id">example_node_1</div>\
        </div>'),
        $('<div class="menu_container">\
          <div class="menu_id">example_menu</div>\
          <div class="menu_node_id">example_node_0</div>\
        </div>'),        
      ]
  },
  function (assert, elements) {
    assert.expect (4);
    menu_MENUS = {
      example_menu: createExampleMenu ()
    }

    var done0 = assert.async ();
    var context0 = new block_Context (12, elements [0]);
    menu_nodeParentLabelBlock (context0, function (error, element) {
      assert.ok ($(element[0]).is('span'), 'menu_nodeParentLabelBlock returns a span element.');
      assert.ok (element.hasClass('menu_node_label'), 'The node label has the .menu_node_label class.');
      assert.strictEqual (element[0].innerText, 'Example Node 0', 'The label matches the title of the node\'s parent.');
      done0 ();
    });
    
    var done1 = assert.async ();
    var context1 = new block_Context (4, elements [1]);    
    menu_nodeParentLabelBlock (context1, function (error, element) {
      assert.notOk (element, 'Element returns null because example_node_0 has no parent.');
      done1 ();
    }); 
  }
)

/*
  menu_nodeParentLinkBlock accepts two
  arguments:

  * context, a Block Expansion Context
  * done, a function that accepts two arguments:
    an Error object and a JQuery HTML Element.

  context.element must be a DIV element that
  contains two child elements.

  * The first, must belong to the menu_id class
    and contain a single text node representing
    a menu ID.
  * The second, must belong to the menu_node_id
    class and contain a single text node
    representing a menu node ID.

  If an error occurs, menu_nodeParentLinkBlock
  passes the error to done and returns done.
  Otherwise it passes the element to done. 
*/
function menu_nodeParentLinkBlock (context, done) {
  var errorPrefix = '[menu][menu_nodeParentLinkBlock]';
  getBlockArguments ([
      {'name': 'menu_id',      'text': true, 'required': true},
      {'name': 'menu_node_id', 'text': true, 'required': true}
    ],
    context.element,

    // I. Load referenced menu element
    function (error, blockArguments) {
      var menu = menu_MENUS [blockArguments.menu_id.trim ()];
      if (!menu) {
        var error = new Error (errorPrefix + ' Error: an error occured while trying to load menu "' + blockArguments.menu_id.trim () + '". The menu does not exist.');
        strictError (error);
        return done (error);
      }

      var node = menu.getNode (blockArguments.menu_node_id.trim ())
      if (!node) {
        var error = new Error (errorPrefix + ' Error: an error occured while trying to load menu node "' + blockArguments.menu_node_id.trim () + '". The node does not exist.');
        strictError (error);
        return done (error);
      }

      /* 
        II. Create an HTML element that represents
        a link to the referenced node's parent
      */
      var element = node.getParentLinkElement ();

      /* 
        III. Replace context.element with the new
        element
      */
      context.element.replaceWith (element);

      // IV. Pass the new element to done
      done (null, element);
  });
}

/*
  Unittest for menu_nodeParentLinkBlock.

  Confirms that the function generates a link to
  the given node's parent.
*/
unittest ('menu_nodeParentLinkBlock', 
  {
    globals: [
      { variableName: 'menu_MENUS', value: {} }
    ],  
    elements: [
        $('<div class="menu_container">\
          <div class="menu_id">example_menu</div>\
          <div class="menu_node_id">example_node_1</div>\
        </div>'),
        $('<div class="menu_container">\
          <div class="menu_id">example_menu</div>\
          <div class="menu_node_id">example_node_0</div>\
        </div>'),        
      ]
  },
  function (assert, elements) {
    assert.expect (4);
    menu_MENUS = {
      example_menu: createExampleMenu ()
    }

    var done0 = assert.async ();
    var context0 = new block_Context (12, elements [0]);
    menu_nodeParentLinkBlock (context0, function (error, element) {
      assert.ok ($(element[0]).is('a'), 'menu_nodeParentLinkBlock returns a link element.');
      assert.ok (element.hasClass('menu_link'), 'The node link has the .menu_link class.');
      assert.strictEqual (element[0].innerText, 'Example Node 0', 'The element returned matches the title of the parent node.');
      done0 ();
    });
    
    var done1 = assert.async ();
    var context1 = new block_Context (4, elements [1]);    
    menu_nodeParentLinkBlock (context1, function (error, element) {
      assert.notOk (element, 'Element returns null because example_node_0 has no parent.');
      done1 ();
    }); 
  }
)

/*
  menu_nodePreviousLabelBlock accepts two
  arguments:

  * context, a Block Expansion Context
  * done, a function that accepts two arguments:
    an Error object and a JQuery HTML Element.

  context.element must be a DIV element that
  contains two child elements.

  * The first must belong to the menu_id class
    and contain a single text node representing
    a menu ID.
  * The second must belong to the menu_node_id
    class and contain a single text node
    representing a menu node ID.

  If an error occurs, menu_nodePreviousLabelBlock
  passes the error to done and returns done. 
  Otherwise it passes the element to done. 
*/
function menu_nodePreviousLabelBlock (context, done) {
  var errorPrefix = '[menu][menu_nodePreviousLabelBlock]';
  getBlockArguments ([
      {'name': 'menu_id',      'text': true, 'required': true},
      {'name': 'menu_node_id', 'text': true, 'required': true}
    ],
    context.element,

    // I. Load referenced menu element
    function (error, blockArguments) {
      var menu = menu_MENUS [blockArguments.menu_id.trim ()];
      if (!menu) {
        var error = new Error (errorPrefix + ' Error: an error occured while trying to load menu "' + blockArguments.menu_id.trim () + '". The menu does not exist.');
        strictError (error);
        return done (error);
      }

      var node = menu.getNode (blockArguments.menu_node_id.trim ())
      if (!node) {
        var error = new Error (errorPrefix + ' Error: an error occured while trying to load menu node "' + blockArguments.menu_node_id.trim () + '". The node does not exist.');
        strictError (error);
        return done (error);
      }

      /* 
        II. Create an HTML element that represents
        the title of the previous leaf
      */
      var element = node.getPreviousLabelElement ();

      /* 
        III. Replace context.element with the new
        element
      */      
      context.element.replaceWith (element);

      // IV. Pass the new element to done
      done (null, element);
  });
}

/*
  Unittest for menu_nodePreviousLabelBlock.

  Confirms that the function generates a span
  element for the last descendant leaf of the
  given node element.
*/
unittest ('menu_nodePreviousLabelBlock', 
  {
    globals: [
      { variableName: 'menu_MENUS', value: {} }
    ],  
    elements: [
      $('<div class="menu_container">\
        <div class="menu_id">example_menu</div>\
        <div class="menu_node_id">example_node_0</div>\
      </div>')
    ] 
  },
  function (assert, elements) {
    assert.expect (3);
    menu_MENUS = {
      example_menu: createExampleMenu ()
    }

    var done = assert.async ();
    var context = new block_Context (12, elements [0]);
    menu_nodePreviousLabelBlock (context, function (error, element) {
      assert.ok ($(element[0]).is('span'), 'menu_nodePreviousLabelBlock returns a span element.');
      assert.ok (element.hasClass('menu_leaf_label'), 'The leaf has the .menu_leaf_label class.');
      assert.strictEqual (element[0].innerText, 'Example Leaf 4', 'The label matches the title of the node\'s last descendant leaf.');
      done ();
    });
  }
)


/*
  menu_nodePreviousLinkBlock accepts two
  arguments:

  * context, a Block Expansion Context
  * done, a function that accepts two arguments:
    an Error object and a JQuery HTML Element.

  context.element must be a DIV element that
  contains two child elements.

  * The first, must belong to the menu_id class
    and contain a single text node representing
    a menu ID.
  * The second, must belong to the menu_node_id
    class and contain a single text node
    representing a menu leaf ID.

  If an error occurs, menu_nodePreviousLabelBlock
  passes the error to done and returns done. 
  Otherwise it passes the element to done.
*/
function menu_nodePreviousLinkBlock (context, done) {
  var errorPrefix = '[menu][menu_nodePreviousLinkBlock]';
  getBlockArguments ([
      {'name': 'menu_id',      'text': true, 'required': true},
      {'name': 'menu_node_id', 'text': true, 'required': true}
    ],
    context.element,

    // I. Load referenced menu element
    function (error, blockArguments) {
      var menu = menu_MENUS [blockArguments.menu_id.trim ()];
      if (!menu) {
        var error = new Error (errorPrefix + ' Error: an error occured while trying to load menu "' + blockArguments.menu_id.trim () + '". The menu does not exist.');
        strictError (error);
        return done (error);
      }

      var node = menu.getNode (blockArguments.menu_node_id.trim ())
      if (!node) {
        var error = new Error (errorPrefix + ' Error: an error occured while trying to load menu node "' + blockArguments.menu_node_id.trim () + '". The node does not exist.');
        strictError (error);
        return done (error);
      }

      /* 
        II. Create an HTML element that represents
        a link to the previous leaf in the 
        referenced menu
      */
      var element = node.getPreviousLinkElement ();

      /* 
        III. Replace context.element with the new
        element
      */
      context.element.replaceWith (element);

      // IV. Pass the new element to done
      done (null, element);
  });
}

/*
  Unittest for menu_nodePreviousLinkBlock.

  Confirms that the the function returns a link
  to the leaf element that closest follows the
  given node.
*/
unittest ('menu_nodePreviousLinkBlock', 
  {
    globals: [
      { variableName: 'menu_MENUS', value: {} }
    ],  
    elements: [
      $('<div class="menu_container">\
        <div class="menu_id">example_menu</div>\
        <div class="menu_node_id">example_node_0</div>\
      </div>'),     
    ] 
  },
  function (assert, elements) {
    assert.expect (3);
    menu_MENUS = {
      example_menu: createExampleMenu ()
    }

    var done = assert.async ();
    var context = new block_Context (12, elements [0]);
    menu_nodePreviousLinkBlock (context, function (error, element) {
      assert.ok ($(element[0]).is('a'), 'menu_nodePreviousLinkBlock returns a link element.');
      assert.ok (element.hasClass('menu_leaf_link'), 'The leaf link has the .menu_leaf_link class.');
      assert.strictEqual (element[0].href.split('#')[1], 'example_leaf_4', 'The leaf link\'s href element matches the menu_leaf_id of its last descendant.');
      done ();
    });
  }
)
```

The Element Class
-----------------

The Element class defines a base class for both the Leaf and Node classes.

```javascript
/*
  The menu_Element class is a base class for both
  the menu_Leaf and menu_Node classes. It
  represents generic menu elements.

  The menu_Element function accepts four
  arguments:

  * parent, a menu_Element instance
  * id, a Menu Element ID string
  * title, a string
  * and classes, a string.

  Note: If parent is not null, it must be a
  menu Node that contains this element in its
  children array.
*/
function menu_Element (parent, id, title, classes) {
  this.parent         = parent;
  this.id             = id;
  this.title          = title;
  this.classes        = classes;
}

/*
  Accepts no arguments and returns an integer
  representing the index of the menu_Element
  instance among it siblings.
*/
menu_Element.prototype.getIndex = function () {
  if (!this.parent) { return null; }

  for (var i = 0; i < this.parent.children.length; i ++) {
    if (this.parent.children [i].id === this.id) { return i; }
  }

  /* 
    If the menu_Element instance is not found,
    throw a strict error and return null
  */
  strictError (new Error ('[menu][menu_Element.getIndex] Error: the "' + this.id + '" menu element references a parent ("' + this.parent.id + '") that does not list "' + this.id + '" as a child.'));
  return null;
}

/*
  Accepts no arguments and returns a boolean
  representing whether or not the menu_Element
  instance is the first child of its parent.
*/
menu_Element.prototype.isFirstChild = function () {
  return this.parent && this.parent.getFirstChild ().id === this.id;
}

/*
  Accepts no arguments and returns a boolean
  representing whether or not the menu_Element
  instance is the last child of its parent.
*/
menu_Element.prototype.isLastChild = function () {
  return this.parent && this.parent.getLastChild ().id === this.id;
}

/*
  Accepts no arguments and returns a menu_Element 
  instance representing the next sibling of the
  object, if it exists. 
*/
menu_Element.prototype.getNextSibling = function () {
  // Return null if no parent exists
  if (!this.parent) { return null; }

  var i = this.getIndex () + 1;

  // Return null if no next sibling exists
  return this.parent.children.length > i ? this.parent.children [i] : null;
}

/*
  Accepts no arguments and returns a menu_Element 
  instance representing the previous sibling of
  the object.
*/
menu_Element.prototype.getPreviousSibling = function () {
  // Return null if no parent exists
  if (!this.parent) { return null; }

  var i = this.getIndex () - 1;
  // Return null if no previous sibling exists
  return i >= 0 ? this.parent.children [i] : null;
}

/*
  Accepts no arguments. Returns the next
  menu_Element if it exists, and null if not.
*/
menu_Element.prototype.getNext = function () {

  // I. If the object has no parent, return null
  if (!this.parent) { return null; }

  // II. If no next sibling, return its parent
  var successor = this.getNextSibling ();
  if (!successor) { return this.parent; }

  /*
    III. If next item is a menu_Node with 
    children, return the first child of menu_Node
  */
  while (successor instanceof menu_Node && successor.children.length > 0) {
    successor = successor.getFirstChild ();
  }

  // IV. Otherwise return next sibling
  return successor;
}

/*
  Accepts no arguments. Returns the preceding
  menu_Element if it exists, and null if not.
*/
menu_Element.prototype.getPrevious = function () {
  /*
    I. If the object is a menu_Node and has
    children, return its last child
  */
  if (this instanceof menu_Node && this.children.length > 0) {
    return this.getLastChild ();
  }

  // II. If it has no parent, return null
  if (!this.parent) { return null; }

  /*
    III. Recurse up the tree until it finds
    first ancestor of this element with a 
    previous sibling, and returns that sibling.
  */
  var element = this;
  while (element.isFirstChild ()) {
    element = element.parent;
    if (!element.parent) { return null; }
  }
  return element.getPreviousSibling ();
}

/*
  Accepts no arguments. Returns the closest
  following instance of menu_Element.
*/
menu_Element.prototype.getNextLeaf = function () {
  var element = this.getNext ();
  while (element && element instanceof menu_Node) {
    element = element.getNext ();
  }
  return element;
}

/*
  Accepts no arguments. Returns the closest
  preceding instance of menu_Element.
*/
menu_Element.prototype.getPreviousLeaf = function () {
  var element = this.getPrevious ();
  while (element && element instanceof menu_Node) {
    element = element.getPrevious ();
  }
  return element;
}

/*
  Accepts no arguments. Returns a an array 
  representing the parent's path if the 
  menu_Element has a parent, and an empty array
  if not.
*/
menu_Element.prototype.getAncestors = function () {
  return this.parent ? this.parent.getPath () : [];
}

/*
  Accepts no arguments. Returns an array
  representing the menu_Element's ancestors
  as well as the menu_Element instance itself.
*/
menu_Element.prototype.getPath = function () {
  var ancestors = this.getAncestors ();
  ancestors.push (this);
  return ancestors;
}

/* 
  Accepts no arguments. Returns an integer
  representing the level of the menu_Element
  instance as determined by the length of its 
  path.
*/
menu_Element.prototype.getLevel = function () {
  return this.getPath ().length;
}

/*
  Accepts no arguments, and returns an array
  consisting of the IDs of the items that make up
  the menu_Element instance's path.
*/
menu_Element.prototype.getLine = function () {
  var line = [];
  var path = this.getPath ();
  for (var i = 0; i < path.length; i ++) {
    line.push (path [i].id);
  };
  return line;
}

/*
  Accepts one argument, element, a jQuery HTML 
  Element. Returns that element with additional
  HTML attributes.
*/
menu_Element.prototype.addAttributes = function (element) {
  return element
    .addClass (this.classes)
    .attr ('data-menu-id', this.id)
    .attr ('data-menu-level', this.getLevel ());
}

/*
  Accepts no arguments. Generates and returns a
  jQuery HTML Element representing the HTML 
  structure of an instance of menu_Element.
*/
menu_Element.prototype.getLabelElement = function () {
  return this.addAttributes (
    $('<span></span>')
      .addClass ('menu_label')
      .addClass ('menu_title')
      .html (this.title));
}

/*
  Accepts no arguments and returns a jQuery HTML
  Element that displays this menu element's
  title. Note: this function removes any HTML
  tags contained in the title.
*/
menu_Element.prototype.getPlainLabelElement = function () {
  return this.addAttributes (
    $('<span></span>')
      .addClass ('menu_label')
      .addClass ('menu_title')
      .text (this.title));
}

/*
  Accepts one argument, id, a Menu Element ID 
  string. Generates and returns a jQuery HTML
  Element representing the HTML structure of the
  instance of menu_Element.
*/
menu_Element.prototype._getLinkElement = function (id) {
  return this.addAttributes (
    $('<a></a>')
      .addClass ('menu_link')
      .addClass ('menu_title')
      .attr ('href', getContentURL (id))
      .html (this.title));
}

/*
  Accepts one argument, id, a Menu Element ID
  string and returns a link to the referenced
  menu element.

  Note: this function strips an HTML tags
  included in the elements title.
*/
menu_Element.prototype._getPlainLinkElement = function (id) {
  return this.addAttributes (
    $('<a></a>')
      .addClass ('menu_link')
      .addClass ('menu_link_plain')
      .addClass ('menu_title')
      .attr ('href', getContentURL (id))
      .text ($('<span>' + this.title + '</span>').text ()));
}

/*
  Accepts two arguments:
  * numColumns, an integer
  * depth, an integer

  Generates and returns a jQuery HTML Element 
  representing the HTML structure of an instance
  of menu_Element.
*/
menu_Element.prototype.getContentsItemElement = function (numColumns, depth) {
  return this.addAttributes ($('<li></li>').addClass ('menu_contents_item'));
}

/*
  Accepts no arguments. Generates and returns a
  jQuery HTML Element representing the HTML text
  structure of the parent of menu_Element if it
  exists, and null if not.
*/
menu_Element.prototype.getParentLabelElement = function () {
  return this.parent ? this.parent.getLabelElement () : null;
}

/*
  Accepts no arguments. Generates and returns a
  jQuery HTML Element representing the HTML link
  structure of the parent of menu_Element if it
  exists, and null if not.
*/
menu_Element.prototype.getParentLinkElement = function () {
  return this.parent ? this.parent.getLinkElement () : null;
}

/*
  Accepts no arguments and returns a link to this
  element's parent. Note: this function removes
  any HTML tags contained in the parent's title.
*/
menu_Element.prototype.getPlainParentLinkElement = function () {
  return this.parent ? this.parent.getPlainLinkElement () : null;
}

/*
  Accepts no arguments. Generates and returns a
  jQuery HTML Element representing the HTML text
  structure of the next sibling of menu_Element
  if it exists, and null if not.
*/
menu_Element.prototype.getNextLabelElement = function () {
  var element = this.getNextLeaf ();
  return element ? element.getLabelElement () : null;
}

/*
  Accepts no arguments. Generates and returns a
  jQuery HTML Element representing the HTML link
  structure of the next sibling of menu_Element 
  if it exists, and null if not.
*/
menu_Element.prototype.getNextLinkElement = function () {
  var element = this.getNextLeaf ();
  return element ? element.getLinkElement () : null;
}

/*
  Accepts no arguments and returns a link to
  the menu element that follows this one. Note:
  this function removes any HTML elements that
  may be contained in the next element's title.
*/
menu_Element.prototype.getPlainNextLinkElement = function () {
  var element = this.getNextLeaf ();
  return element ? element.getPlainLinkElement () : null;
}

/*
  Accepts no arguments. Generates and returns a
  jQuery HTML Element representing the HTML text
  structure of the previous sibling of 
  menu_Element if it exists, and null if not.
*/
menu_Element.prototype.getPreviousLabelElement = function () {
  var element = this.getPreviousLeaf ();
  return element ? element.getLabelElement () : null;
}

/*
  Accepts no arguments. Generates and returns a
  jQuery HTML Element representing the HTML link
  structure of the previous sibling of 
  menu_Element if it exists, and null if not.
*/
menu_Element.prototype.getPreviousLinkElement = function () {
  var element = this.getPreviousLeaf ();
  return element ? element.getLinkElement () : null;
}

/*
  Accepts no arguments and returns a link to
  the menu element that precedes this one. Note:
  this function removes any HTML elements that
  may be contained in the next element's title.
*/
menu_Element.prototype.getPlainPreviousLinkElement = function () {
  var element = this.getPreviousLeaf ();
  return element ? element.getPlainLinkElement () : null;
}
```

The Leaf Class
--------------

The Leaf class defines the basic block elements and functions for leaves. They are the final descendants of their parent elements and have no children.

```javascript
/*
  Accepts three arguments:
  * parent, a menu_Element instance
  * id, a Menu Element ID string
  * title, a string
  * classes, an array of strings

  and returns a menu_Leaf object.
*/
function menu_Leaf (parent, id, title, classes) {
  menu_Element.call (this, parent, id, title, classes);
}

/*
  Create a new prototype object for menu_Leaf and
  set menu_Element's prototype as the object's
  prototype.
*/
menu_Leaf.prototype = Object.create (menu_Element.prototype);

/*
  Assign the menu_Leaf prototype's constructor
  property so that any functions that read it can
  determine which constructor function was used 
  to create its instance objects.
*/
menu_Leaf.prototype.constructor = menu_Leaf;

/*
  Accepts no arguments and returns the menu_Leaf
  instance.
*/
menu_Leaf.prototype.getFirstLeaf = function () {
  return this;
}

/*
  Accepts one argument, id, a Menu Element ID
  string. Returns the menu_Leaf instance if it
  matches the id, and null if not.
*/
menu_Leaf.prototype.getLeaf = function (id) {
  return this.id === id ? this : null;
}

/*
  Accepts one argument, id, a Menu Element ID
  string. Returns null, to indicate that the object
  instance is not a node.
*/
menu_Leaf.prototype.getNode = function (id) {
  return null;
}

/*
  Accepts no arguments, and returns a jQuery HTML
  Element representing the HTML text structure of
  the menu_Leaf instance.
*/
menu_Leaf.prototype.getLabelElement = function () {
  return menu_Element.prototype.getLabelElement.call (this).addClass ('menu_leaf_label');
}

/*
  Accepts no arguments, and returns a jQuery HTML
  Element representing the HTML link structure of
  the menu_Leaf instance.
*/
menu_Leaf.prototype.getLinkElement = function () {
  return menu_Element.prototype._getLinkElement.call (this, this.id).addClass ('menu_leaf_link');
}

/*
  Accepts no arguments, and returns a link to
  this menu_Leaf instance. Note: this function
  removes any HTML elements that may be contained
  in this leaf's title.
*/
menu_Leaf.prototype.getPlainLinkElement = function () {
  return menu_Element.prototype._getPlainLinkElement.call (this, this.id).addClass ('menu_leaf_link');
}

/*
  Accepts two arguments:
  * numColumns, an integer
  * depth, an integer

  Generates and returns a jQuery HTML Element 
  representing the HTML structure of an instance
  of menu_Leaf.
*/
menu_Leaf.prototype.getContentsItemElement = function (numColumns, depth) {
  return menu_Element.prototype.getContentsItemElement.call (this, numColumns, depth)
    .addClass ('menu_contents_leaf_item')
    .append (this.getLinkElement ());
}
```

The Node Class
-----------------

Nodes are elements that may contain other elements.

```javascript
/*
  Accepts three arguments:
  * parent, a menu_Element instance
  * id, a Menu Element ID string
  * title, a string
  * children, an array of menu_Element instances
  * classes, an array of strings

  and returns an instance of the menu_Node class,
  a subclass of menu_Element.
*/
function menu_Node (parent, id, title, children, classes) {
  menu_Element.call (this, parent, id, title, classes);
  this.children = children;
}

/*
  Create a new prototype object for menu_Node and
  set menu_Element's prototype as the object's
  prototype.
*/
menu_Node.prototype = Object.create (menu_Element.prototype);

/*
  Assign the menu_Node prototype's constructor
  property so that functions that any functions
  that read it can determine which constructor
  function was used to create its instance
  objects.
*/
menu_Node.prototype.constructor = menu_Node;

/*
  Accepts one argument, id. Iterates through
  menu_Node's children and returns an instance
  of menu_Leaf who matches the given id if it
  exists, and null if none is found.
*/
menu_Node.prototype.getLeaf = function (id) {
  for (var i = 0; i < this.children.length; i ++) {
    var element = this.children [i].getLeaf (id);
    if (element) { return element; }
  }
  return null;
}

/*
  Accepts one argument, id. Returns the menu_Node
  instance if it matches the id; otherwise, 
  iterates through its children and returns an
  instance of menu_Leaf who matches the given id
  if it exists. If no child has the id either,
  returns null.
*/
menu_Node.prototype.getNode = function (id) {
  if (this.id === id) { return this; }

  for (var i = 0; i < this.children.length; i ++) {
    var element = this.children [i].getNode (id);
    if (element) { return element; }
  }
  return null;
}

/*
  Accepts no arguments. Iterates through
  menu_Node's children and returns the first leaf
  found. If none is found, returns null.
*/
menu_Node.prototype.getFirstLeaf = function () {
  for (var i = 0; i < this.children.length; i ++) {
    var leaf = this.children [i].getFirstLeaf ();
    if (leaf) { return leaf; }
  }
  return null;
}

/*
  Accepts no arguments. Returns menu_Node's first
  child, or null if no child exists.
*/
menu_Node.prototype.getFirstChild = function () {
  return this.children.length > 0 ? this.children [0] : null;
}

/*
  Accepts no arguments. Returns menu_Node's last
  child, or null if no child exists.
*/
menu_Node.prototype.getLastChild = function () {
  return this.children.length > 0 ? this.children [this.children.length - 1] : null;
}

/*
  Accepts no arguments, and returns a jQuery HTML
  Element representing the HTML text structure of
  the menu_Node instance.
*/
menu_Node.prototype.getLabelElement = function () {
  return menu_Element.prototype.getLabelElement.call (this).addClass ('menu_node_label');
}

/*
  Accepts no arguments, and returns a jQuery HTML
  Element representing the HTML link structure of
  the menu_Node instance.
*/
menu_Node.prototype.getLinkElement = function () {
  var leaf = this.getFirstLeaf ();
  return leaf ? this._getLinkElement (leaf.id) :
                this.getLabelElement ();
}

/*
  Accepts no arguments and returns a link to
  this node's first leaf. Note: this function
  removes any HTML tags that may be contained
  in this node's title.
*/
menu_Node.prototype.getPlainLinkElement = function () {
  var leaf = this.getFirstLeaf ();
  return leaf ? this._getPlainLinkElement (leaf.id) :
                this.getPlainLabelElement ();
}

/*
  Accepts two arguments:
  * numColumns, an integer
  * depth, an integer

  Returns a jQuery HTML Element representing the
  the structure of menu_Node, plus its children if
  the depth is 1 or greater.
*/
menu_Node.prototype.getContentsItemElement = function (numColumns, depth) {
  var element = menu_Element.prototype.getContentsItemElement.call (this, numColumns, depth)
    .addClass ('menu_node_contents_item');

  return depth === 0 ? 
    element.append (this.getLinkElement ()) :
    element
      .append (this.getLabelElement ())
      .append (this.getContentsElement (numColumns, depth));
}

/*
  Accepts two arguments:
  * numColumns, an integer
  * depth, an integer

  Returns a jQuery HTML Element representing the
  the structure of menu_Node, plus generations of
  its descendants equal to the given depth (e.g.
  just children if depth is 1, children and 
  grandchildren if it is 2, etc.).
*/
menu_Node.prototype.getContentsElement = function (numColumns, depth) {
  var element = this.addAttributes ($('<ol></ol>').addClass ('menu_contents'));
  if (depth === 0) { return element; }

  for (var i = 0; i < this.children.length; i ++) {
    element.append (this.children [i].getContentsItemElement (numColumns, depth - 1));
  }
  return element;
}
```

The Menu Class
--------------

```javascript
/*
  Accepts one argument, children, an array of
  menu_Elementinstances. Returns a menu_Menu
  object. 
*/
function menu_Menu (children) {
  this.children = children;
}

/*
  Accepts one argument, id. Iterates through
  menu_Menu's children and returns an instance
  of menu_Leaf who matches the given id if it
  exists, and null if none is found.
*/
menu_Menu.prototype.getLeaf = function (id) {
  for (var i = 0; i < this.children.length; i ++) {
    var element = this.children [i].getLeaf (id);
    if (element) { return element; }
  }
  return null;
}

/*
  Accepts one argument, id. Iterates through
  menu_Menu's children and returns an instance
  of menu_Node who matches the given id if it
  exists, and null if none is found.
*/
menu_Menu.prototype.getNode = function (id) {
  for (var i = 0; i < this.children.length; i ++) {
    var element = this.children [i].getNode (id);
    if (element) { return element; }
  }
  return null;
}
```

Auxiliary Functions
-------------------

```javascript
/*
  Accepts two arguments:
  * numColumns, an integer
  * elements, an array of menu_Element instances

  Returns an array of jQuery HTML Objects, equal
  in length to the given numColumns, with the
  number of elements divided evenly among them.
 */
function menu_columnate (numColumns, elements) {
  var columns = [];
  var numElements = elements.length / numColumns;
  for (var i = 0; i < numColumns; i ++) {
    columns.push (
      $('<div></div>')
        .addClass ('menu_column')
        .append (elements.slice (i * numElements, (i + 1) * numElements)));
  }
  return columns;
}

/*
  Unittest for menu_columnate.

  Confirms that the function returns an array of
  objects equal to the given numColumns and divided
  among the number of columns.
*/

unittest ('menu_columnate', 
  {
    elements: [
      $('<div class="test_element_1"></div>'),
      $('<div class="test_element_2"></div>'),
      $('<div class="test_element_3"></div>'),
      $('<div class="test_element_4"></div>'),
      $('<div class="test_element_5"></div>'),
      $('<div class="test_element_6"></div>'),
      $('<div class="test_element_7"></div>')
    ] 
  },
  function (assert, elements) {
    assert.expect (4);
    var done = assert.async ();
    var columns = menu_columnate (3, elements);
    assert.strictEqual (columns.length, 3, 'The returned array is equal in length to the number of columns.');
    assert.ok (columns [0] [0].children.length === Math.ceil (elements.length / 3) || columns [0] [0].children.length === Math.floor (elements.length / 3), 'There are an appropriate number of elements in the first column.');
    assert.ok (columns [1] [0].children.length === Math.ceil (elements.length / 3) || columns [1] [0].children.length === Math.floor (elements.length / 3), 'There are an appropriate number of elements in the second column.');
    assert.ok (columns [2] [0].children.length === Math.ceil (elements.length / 3) || columns [2] [0].children.length === Math.floor (elements.length / 3), 'There are an appropriate number of elements in the third column.');
    done ();
  }
)


/*
  Accepts two arguments:
  * id, a Menu Element ID string
  * element, a menu_Element instance

  Generates the HTML structure for that element
  for display in the menu. Returns undefined.
*/
function menu_select (id, element) {
  $('.menu_contents_item[data-menu-id="' + id + '"]', element)
    .addClass ('menu_selected');
}

/*
  Accepts one argument, element, a menu_Element
  instance. Alters element's HTML structure to
  adopt the classes for an unselected menu item
  and returns undefined.
*/
function menu_deselect (element) {
  $('.menu_selected', element).removeClass ('menu_selected');
  $('.menu_selected_line', element).removeClass ('menu_selected_line');
}

/*
  Accepts two arguments:
  * level, an integer
  * element, a menu_Element instance

  Closes any menu items within element that are
  deeper than the level given. Returns undefined.
*/
function menu_collapse (level, element) {
  $('.menu_contents_item', element).each (
    function (itemElementIndex, itemElement) {
      itemElement = $(itemElement);
      if (itemElement.attr ('data-menu-level') >= level) {
        itemElement.addClass ('menu_collapsed');
        $('> .menu_contents', itemElement).hide ();
      }
  });
}

/*
  Accepts two arguments:
  * line, an array of strings
  * element, a menu_Element instance

  Displays the children of any menu items with 
  IDs identical to a value within line. Returns
  undefined.
*/
function menu_expandLine (line, element) {
  for (var i = 0; i < line.length; i ++) {
    $('.menu_contents_item[data-menu-id="' + line [i] + '"]', element)
      .removeClass ('menu_collapsed')
      .children ('.menu_contents')
        .show ();
  }
}

/*
  Accepts two arguments:
  * line, an array of strings
  * element, a menu_Element instance

  Adds the selected class to any menu items with 
  IDs identical to a value within line. Returns
  undefined.
*/
function menu_selectLine (line, element) {
  for (var i = 0; i < line.length; i ++) {
   $('.menu_contents_item[data-menu-id="' + line [i] + '"]', element)
     .addClass ('menu_selected_line'); 
  }
}

/*
  Accepts three arguments:
  * expandLevel, an integer
  * maxLevel, an integer
  * element, a menu_Element instance

  For every menu item in element with a level
  tha is both greater than expandLevel and less
  than maxLevel, adds a click event that toggles
  its collapse.
*/
function menu_makeCollapsable (expandLevel, maxLevel, element) {
  $('.menu_contents_item', element).each (
    function (itemElementIndex, itemElement) {
      itemElement = $(itemElement);
      var level = parseInt (itemElement.attr ('data-menu-level'));
      if (level >= expandLevel && level <= maxLevel) {
        var linkElement = $('> .menu_node_label', itemElement);
        linkElement.click (
          function (event) {
            event.preventDefault ();
            itemElement.toggleClass ('menu_collapsed');
            $('> .menu_contents', itemElement).slideToggle ();
        });
      }
  });
}
```

Generating Source Files
-----------------------

You can generate the Menu module's source files using [Literate Programming](https://github.com/jostylr/literate-programming), simply execute:
`literate-programming Readme.md`
from the command line.

<!---
#### Menu.js
```
_"Menu Module"

_"Example Usage"

_"The Global Variables"

_"The Load Event Handler"

_"The Curly Block Handlers"

_"The Block Handlers"

_"The Element Class"

_"The Leaf Class"

_"The Node Class"

_"The Menu Class"

_"Auxiliary Functions"
```
[menu.js](#Menu.js "save:")
-->
