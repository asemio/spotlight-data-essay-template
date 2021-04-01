Curly Readme
============

The Curly module defines the curly block which allows you to define templates using a double curly brace syntax similar to [Mustache](https://mustache.github.io/).

Unlike Mustache, Curly expands blocks in inner-outer order and allows asynchronous expansion functions.

The double curly brace syntax has a number of advantages over the HTML element-based syntax used by the Block module. Specifically, Curly blocks can be used to set class names and HTML attribute values.

Note however that there are cases, such as the Page and Template blocks where such placement would be incorrect, so there is a use case for both styles.

```javascript
/*
  The Curly module defines the curly block
  which allows you to define templates using
  a double curly brace syntax similar to
  [Mustache](https://mustache.github.io/).
*/

// Declares the QUnit test module.
QUnit.module ('Curly');
```

Usage Example
-------------

To use the Curly module, simply insert an HTML DIV element into your HTML template and add a class to it named "curly_block". Then you can insert curly blocks in your template using Curly block variables and sections.

For example:

```html
<div class="curly_block">
  This is a test: (22 + 11) * 2 = {{#multiply}} {{#add}} 22 11 {{/add}} 2 {{/multiply}}.
</div>
```

The Curly Block Handler Store
-----------------------------

The Curly block handlers are stored in a `curly_HandlerStore` object named `curly_HANDLERS`. Other modules can register Curly block handlers using `curly_HANDLERS.add` and `curly_HANDLERS.addHandlers`.

```javascript
/*
  A curly_HandlerStore object that stores the
  registered Curly block handlers.
*/
var curly_HANDLERS = new curly_HandlerStore ();

/*
  Curly Block Handlers store the registered Curly
  block handlers and provide a safe interface
  for registering and retrieving them.
*/
function curly_HandlerStore () {
  var self = this;

  /*
    An associative array of Curly Block Handlers
    keyed by name. 
  */
  var _handlers = {};

  /*
    Accepts one argument: 

    * name, a name string

    and returns the first Handler in handlers
    that is associated with `name`. If none of
    the handlers in handlers are associated
    with `name`, this function returns undefined
    instead.
  */
  this.get = function (name) {
    return _handlers [name];
  }

  /*
    Accepts two arguments:

    * name, a string
    * and handler, a Curly Block Handler;

    and adds handler to handlers under
    name. If another handler has already
    been added to handlers under name,
    this function throws a strictError instead.
  */
  this.add = function (name, handler) {
    if (_handlers [name]) {
      return strictError (new Error ('[curly][curly_HandlerStore] Error: an error occured while trying to register a Curly block handler for "' + name + '". Another Curly block handler has already been registered for "' + name + '"'));
    }
    _handlers [name] = handler;
  }

  /*
    Accepts one argument:

    * handlers, an associative array of Curly
      Block Handlers keyed by name strings

    and adds handlers to this._handlers. If
    any block handlers have already been added
    to this store under a name listed in
    handlers, this function throws a strict
    error and skips the handler associated with
    the name.
  */
  this.addHandlers = function (handlers) {
    for (var name in handlers) {
      self.add (name, handlers [name]);
    }
  }
}
```

The Load Event Handler
----------------------

The Curly module defines a single block, the Curly block, which allows site developers to define a region where the Curly module will scan for and expand Curly blocks.

The module's load event handler is responsible for registering the Curly block's handler.

```javascript
// Registers the block handlers.
MODULE_LOAD_HANDLERS.add (
  function (done) {
    // I. Register the curly block handler.
    block_HANDLERS.add ('curly_block', curly_block);

    // II. Register the curly block handlers.
    curly_HANDLERS.addHandlers ({
      'curly.id':       curly_id_block,
      'curly.foldr':    curly_foldr_block,
      'curly.map':      curly_map_block,
      'curly.add':      curly_add_block,
      'curly.multiply': curly_multiply_block
    });

    done (null);
});
```

The Curly Block Handler
-----------------------

The Curly block defines a region where the Curly module will scan for and expand nested Curly block elements. Curly block elements use a double curly brace syntax similar to Mustache.

```javascript
/*
  Accepts two arguments:

  * context, a Block Expansion Context
  * and done, a function that accepts two
    arguments: an Error object and a JQuery
    HTML Element

  expands any Curly blocks nested within
  context.element in inner-outer order and passes
  the expanded result to done.
*/
function curly_block (context, done) {
  var element = $(context.element);
  curly_expandBlocks (curly_HANDLERS, context.getId (), element.html (), 
    function (error, expansion) {
      if (error) { return done (error); }

      element.html (expansion);
      done (null, element);
  });
}
```

Curly Block Expansion Functions
-------------------------------

The Curly block expansion functions are responsible for expanding Curly block elements.

```javascript
/*
  Accepts four arguments:

  * handlers, a Curly Block Handler store
  * pageId, a string that represents the current
    page ID
  * content, a string that may contain one or
    more Curly blocks
  * and done, a function that accepts two
    arguments: error, an Error object; and
    expansion a string

  expands any Curly blocks nested within
  `content` in inner-outer left-right order and
  passes the result to `done`.
*/
function curly_expandBlocks (handlers, pageId, content, done) {
  curly_expandBlocksAux (handlers, pageId, [], '', content, done);
}

// Unittests for `curly_expandBlocks`.
QUnit.test ('curly_expandBlocks',
  function (assert) {
    assert.expect (9);

    var handlers = new curly_HandlerStore ();
    handlers.addHandlers ({
      'curly.id':       curly_id_block,
      'curly.foldr':    curly_foldr_block,
      'curly.map':      curly_map_block,
      'curly.add':      curly_add_block,
      'curly.multiply': curly_multiply_block
    });

    var done0 = assert.async ();
    curly_expandBlocks (handlers, '12',
      'current id: {{curly.id}}',
      function (error, expansion) {
        assert.strictEqual (expansion, 'current id: 12', 'correctly expanded a curly.id block.');
        done0 ();
    });

    var done1 = assert.async ();
    curly_expandBlocks (handlers, '12',
      '{{#curly.multiply}} {{#curly.add}} 7 11 13 {{/curly.add}} 2 {{/curly.multiply}}',
      function (error, expansion) {
        assert.strictEqual (expansion, '62', 'correctly expanded nested blocks.');
        done1 ();
    });

    var done2 = assert.async ();
    curly_expandBlocks (handlers, '12',
      '{{#curly.foldr}}curly.add 1 2 3{{/curly.foldr}}',
      function (error, expansion) {
        assert.strictEqual (expansion, '6', 'correctly expanded blocks that expanded into other blocks.');
        done2 ();
    });

    var done3 = assert.async ();
    curly_expandBlocks (handlers, '12',
      '{{#curly.quote}}{{#curly.add}}1 2{{/curly.add}}{{/curly.quote}}',
      function (error, expansion) {
        assert.strictEqual (expansion, '{{#curly.add}}1 2{{/curly.add}}', 'correctly expanded a quoted block.');
        done3 ();
    });

    var done4 = assert.async ();
    curly_expandBlocks (handlers, '12',
      '{{#curly.foldr}}curly.add 1 2 3 4{{/curly.foldr}}{{#curly.quote}}{{#curly.add}}1 2 3{{/curly.add}}{{/curly.quote}}',
      function (error, expansion) {
        assert.strictEqual (expansion, '10{{#curly.add}}1 2 3{{/curly.add}}', 'correctly expanded both a foldr and a quote block.');
        done4 ();
    });

    var done5 = assert.async ();
    curly_expandBlocks (handlers, '12',
      '{{#curly.quote}}This is a {{#curly.quote}} quoted passage.{{/curly.quote}}{{/curly.quote}}',
      function (error, expansion) {
        assert.strictEqual (expansion, 'This is a {{#curly.quote}} quoted passage.{{/curly.quote}}', 'correctly expanded a nested quote.');
        done5 ();
    });

    var done6 = assert.async ();
    curly_expandBlocks (handlers, '12',
      '{{#curly.quote}}A{{#curly.quote}}B{{#curly.quote}}C{{/curly.quote}}B{{/curly.quote}}A{{/curly.quote}}',
      function (error, expansion) {
        assert.strictEqual (expansion, 'A{{#curly.quote}}B{{#curly.quote}}C{{/curly.quote}}B{{/curly.quote}}A', 'correctly expanded a double nested quote.');
        done6 ();
    });

    var done7 = assert.async ();
    curly_expandBlocks (handlers, '12',
      '{{#curly.foldr}}curly.quote 0 1 2 3{{/curly.foldr}}',
      function (error, expansion) {
        assert.strictEqual (expansion, '1 {{#curly.quote}}2 {{#curly.quote}}3 0{{/curly.quote}}{{/curly.quote}}', 'correctly expanded a foldr nesting a quote block.');
        done7 ();
    });

    var done8 = assert.async ();
    curly_expandBlocks (handlers, '12',
      '{{#curly.map}}curly.add{{/curly.map}}',
      function (error, expansion) {
        assert.strictEqual (expansion, '', 'correctly mapped the add function to an empty list.');
        done8 ();
    });
});

/*
  Accepts six arguments:

  * handlers, a Curly Block Handler store
  * pageId, a string that represents the current
    page ID
  * name, a string that represents the name of
    the Curly block currently being expanded.
  * content, the content belonging to the current
    block that has been scanned so far
  * remaining, the text remaining to be scanned
  * and done, a function that accepts two
    arguments: error, an Error; and expansion,
    the input string after all of the Curly blocks
    have been expanded.

  expands any Curly blocks nested in `remaining`
  and passes the result to `done`.

  Note: This function essentially represents the
  transition function of a push-down automata.
*/
function curly_expandBlocksAux (handlers, pageId, names, content, remaining, done) {
  var currName = names.length ? names [0] : '';
    
  // I. Expand variables.
  var re = /^{{\s*((\w|\.)+)\s*}}/g;
  var match = re.exec (remaining);
  if (match) {
    var suffix = remaining.slice (re.lastIndex);
    var token     = match [0];
    var tokenName = match [1];

    return currName === 'curly.quote' ?
      curly_expandBlocksAux (handlers, pageId, names, content + token, suffix, done):
      curly_expandBlock (handlers, pageId, tokenName, '',
        function (error, expansion) {
          error ? done (error) :
            curly_expandBlocksAux (handlers, pageId, names, content, expansion + suffix, done);
      });
  }
  // II. Recurse into section.
  re = /^{{#\s*((\w|\.)+)\s*}}/g;
  match = re.exec (remaining);
  if (match) {
    var suffix = remaining.slice (re.lastIndex);
    var token     = match [0];
    var tokenName = match [1];

    if (tokenName === 'curly.quote') {
      if (currName === 'curly.quote') {
        return curly_expandBlocksAux (handlers, pageId, [tokenName].concat (names), token, suffix,
          function (error, expansion, remaining) {
            return error ? done (error) :
              curly_expandBlocksAux (handlers, pageId, names, content + expansion, remaining, done);
        });
      } else {
        return curly_expandBlocksAux (handlers, pageId, [tokenName].concat (names), '', suffix,
          function (error, expansion, remaining) {
            return error ? done (error) :
              curly_expandBlocksAux (handlers, pageId, names, content + expansion, remaining, done);
        });
      }
    } else {
      if (currName === 'curly.quote') {
        return curly_expandBlocksAux (handlers, pageId, names, token, suffix,
          function (error, expansion, remaining) {
            return error ? done (error) :
              curly_expandBlocksAux (handlers, pageId, names.slice (1), content + expansion, remaining, done);
        });
      } else {
        return curly_expandBlocksAux (handlers, pageId, [tokenName].concat (names), '', suffix,
          function (error, expansion, remaining) {
            return error ? done (error) :
              curly_expandBlocksAux (handlers, pageId, names, content, expansion + remaining, done);
        });
      }
    }
  }
  // III. Recurse out of section and expand block.
  re = /^{{\/\s*((\w|\.)+)\s*}}/g;
  match = re.exec (remaining);
  if (match) {
    var suffix = remaining.slice (re.lastIndex);
    var token     = match [0];
    var tokenName = match [1];

    if (currName === 'curly.quote') {
      if (tokenName === 'curly.quote') { // tokenName === currName
        var prevName = names.length > 1 ? names [1] : '';
        if (prevName === 'curly.quote') {
          return done (null, content + token, suffix); 
        } else {
          return done (null, content, suffix);
        }
      } else {
        return curly_expandBlocksAux (handlers, pageId, names, content + token, suffix, done);
      }
    } else {
      if (tokenName === currName) {
        return curly_expandBlock (handlers, pageId, currName, content, 
          function (error, expansion) {
            return error ? done (error) :
              done (null, '', expansion + suffix);
        });
      } else {
        var error = new Error ('[curly_expandBlocksAux] Error: invalid block syntax. Unexpected close tag "' + tokenName + '"');
        strictError (error);
        return done (error);
      }
    }
  }
  // IV. Scan to the next variable/section.
  var index = remaining.indexOf ('{{');
  if (index < 0) {
    if (currName) {
      var error = new Error ('[curly_expandBlocksAux] Error: invalid block syntax. Missing closing tag for "' + currName + '".');
      strictError (error);
      return done (error);
    } else {
      return done (null, content + remaining, '');
    }
  }
  var prefix = remaining.slice (0, index);
  var suffix = remaining.slice (index);
  return curly_expandBlocksAux (handlers, pageId, names, content + prefix, suffix, done);
}

/*
  Accepts five arguments:

  * handlers, a Curly Block Handler store
  * pageId, a string that represents the current
    page ID
  * name, the name of the Curly block being
    expanded
  * content, a string representing the content
    contained in the Curly block
  * and done, a function that accepts two
    arguments: error, an Error; and expansion,
    a string

  finds the Curly block handler named `name`,
  passes `content` to the handler, and passes
  the resulting expansion to `done`.

  If none of the registered Curly block handlers
  are named `name`, this function throws a strict
  error and passes the error to `done`.
*/
function curly_expandBlock (handlers, pageId, name, content, done) {
  var handler = handlers.get (name);
  handler ? handler (pageId, content, done) : done (null, content);
}
```

Core Curly Block Handlers
-------------------------

This module defines several core Curly blocks. The most important of these is the ID block which expands to the current page ID.

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

  and passes the current page ID to `done`.

  Note: `content` is not used by this function.
*/
function curly_id_block (pageId, content, done) {
  done (null, pageId);
}

// Unittests for `curly_id_block`.
QUnit.test ('curly_id_block',
  function (assert) {
    assert.expect (1);
    var handlers = new curly_HandlerStore ();
    handlers.add ('curly.id', curly_id_block);

    var done0 = assert.async ();
    curly_expandBlocks (handlers, '37',
      'current id: {{curly.id}}',
      function (error, expansion) {
        assert.strictEqual (expansion, 'current id: 37', 'correctly expanded the curly.id block.');
        done0 ();
    });
});

/*
  Accepts three arguments:

  * pageId, a string that represents the current
    page ID
  * content, a string that represents the text
    passed to this block
  * and done, a function that accepts two
    arguments: error, an Error; and expansion,
    a string.

  `content` must be a string that lists two or
  more words/integers seperated by spaces or tabs.
  The first word should be the name of a Curly
  block.

  Expands the values in `content` so that the
  function represented by the first word in
  `content` is folded over the remaining values.

  Passes the result to `done`.
*/
function curly_foldr_block (pageId, content, done) {
  var xs = curly_parse_list (content);
  if (xs.length < 2) {
    var error = new Error ("[curly][curly_foldr_block] Error: invalid foldr call missing either the operation or initial value. The expression was: '" + content + "'.");
    strictError (error);
    return done (error);
  }
  var f    = xs [0];
  var init = xs [1];
  done (null, xs.slice (2).reduceRight (
    function (expansion, x) {
      return '{{#' + f + '}}' + x + ' ' + expansion + '{{/' + f + '}}';
    }, init
  ));
}

/*
  Accepts three arguments:

  * pageId, a string that represents the current
    page ID (not used).
  * content, a string that represents the text
    passed to this block
  * and done, a function that accepts two
    arguments: error, an Error; and expansion,
    a string.

  `content` must be a string that lists two or
  more words/integers seperated by spaces or
  tabs. The first word should be the name of a
  Curly block.

  Exands the values of `content` so that the
  function represented by the first work in
  `content` is mapped over the remaining values.

  Passes the result to `done`.
*/
function curly_map_block (pageId, content, done) {
  var xs = curly_parse_list (content);
  if (xs.length < 1) {
    var error = new Error ("[curly][curly_map_block] Error: invalid map call missing its operation. The expression was: '" + content + "'.");
    strictError (error);
    return done (error);
  }
  var f = xs [0];
  done (null,
    xs.slice (1)
      .map (function (x) {
          return '{{#' + f + '}}' + x + '{{/' + f + '}}';
        })
      .join (' ')
  );
}
```

Arithmetic Curly Block Handlers
-------------------------------

```
/*
  Accepts three arguments:

  * pageId, a string that represents the current
    page ID
  * content, a string that represents the text
    passed to this block
  * and done, a function that accepts two
    arguments: error, an Error; and expansion,
    a string.

  `content` must be a string that lists zero or
  more integers seperated by spaces or tabs.

  Adds the numbers listed in `content` and passes
  the result to `done` as a string.

  Note: this function returns NaN if any of the
  values listed in `content` are not a number.
*/
function curly_add_block (pageId, content, done) {
  done (null,
    content
      .trim ()
      .split (/\s+/g)
      .map (function (x) { return parseInt (x.trim ()); })
      .reduceRight (function (y, x) { return y + x; }, 0));
}

/*
  Accepts three arguments:

  * pageId, a string that represents the current
    page ID
  * content, a string that represents the text
    passed to this block
  * and done, a function that accepts two
    arguments: error, an Error; and expansion,
    a string.

  `content` must be a string that lists zero or
  more integers seperated by spaces or tabs.

  Adds the numbers listed in `content` and passes
  the result to `done` as a string.

  Note: this function returns NaN if any of the
  values listed in `content` are not a number.
*/
function curly_multiply_block (pageId, content, done) {
  done (null,
    content
      .trim ()
      .split (/\s+/g)
      .map (function (x) { return parseInt (x.trim ()); })
      .reduceRight (function (y, x) { return y * x; }, 1));
}
```

String Parser Functions
-----------------------

```javascript
/*
  Accepts three argument:

  * f, a function that accepts two string
    arguments: partial, the partial result; and x,
    the iterator value; and returns a string.
  * init, a string
  * and text, a string that contains zero or more
    words/numbers seperated by spaces (or tabs).

  Performs a right fold over `text` using `f`.
*/
function curly_foldr_list (f, init, text) {
  return curly_parse_list (text).reduceRight (f, init);
}

/*
  Accepts two argument:

  * f, a function that accepts a string and
    returns a string.
  * and text, a string that contains zero or more
    words/numbers seperated by spaces (or tabs).

  Performs a map over the words/numbers in `text`
  using `f`.
*/
function curly_foldr_list (f, init, text) {
  return curly_parse_list (text).map (f);
}

/*
  Accepts one argument: text, a string that
  contains zero or more words or numbers
  seperated by spaces (or tabs), and returns an
  array listing those words/numbers.
*/
function curly_parse_list (text) {
  return text.trim ().split (/\s+/g).map (function (x) { return x.trim (); });
}
```

Generating Source Files
-----------------------

You can generate the Curly module's source files using [Literate Programming](https://github.com/jostylr/literate-programming), simply execute:
`literate-programming Readme.md`
from the command line.

<!---
### Curly.js
```
_"Curly Readme"

_"The Curly Block Handler Store"

_"The Load Event Handler"

_"The Curly Block Handler"

_"Curly Block Expansion Functions"

_"Core Curly Block Handlers"

_"Arithmetic Curly Block Handlers"

_"String Parser Functions"
```
[curly.js](#Curly.js "save:")
-->
