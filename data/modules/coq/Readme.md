Coq Module
==========

The Example module defines the Coq IDE block. This block relies on the JSCoq project which can be easily instelled using npm. See https://github.com/jscoq/jscoq/blob/v8.11/docs/embedding.md for more information.

Note: You must add `<script src="modules/coq/lib/node_modules/jscoq/ui-js/jscoq-loader.js"></script>` to index.html.

Initialization
--------------

The Coq module starts by loading the jscoq library and defines the coq block:

```javascript
/*
  The module load event handler. This function
  registers the module's block and page handlers.
*/
MODULE_LOAD_HANDLERS.add (
  function (done) {
    block_HANDLERS.add ('coq_block', coq_block);
    done (null);
});
```

Auxiliary Definitions
---------------------

The embedding code requires several global configuration variables and functions. Here, we simply include the definitions given in https://github.com/jscoq/jscoq/blob/v8.11/docs/embedding.md.

```javascript
var jscoq_ids  = ['.coq-code'];
var jscoq_opts = {
    focus:     false,
    prelude:   true,
    base_path: 'modules/coq/lib/node_modules/jscoq/',
    editor:    { mode: { 'company-coq': true }, keyMap: 'default' },
    init_pkgs: ['init'],
    all_pkgs:  ['init', 'coq-base', 'coq-collections', 'coq-arith', 'coq-reals', 'mathcomp'],
    layout: 'notflex'
};
```

The Coq Block Handler
---------------------

The Coq block embeds the jsCoq IDE. 

```javascript
/*
  Accepts two arguments:

  * context, a Block Expansion Context
  * and done, a function that accepts two
    arguments: an Error object and a JQuery
    HTML Element

  embeds the Coq IDE into context.element
  and passes the expanded result to done.

  Note: this function uses the embedding code
  provided by:
  https://github.com/jscoq/jscoq/blob/v8.11/docs/embedding.md
*/
function coq_block (context, done) {
  var element = $(context.element);
  var coqSourceURL = $(context.element).text ();

  getPlainText (coqSourceURL,
    function (error, coqSource) {
      if (error) { return done (error); }

      $(context.element)
        .text ('')
        .append ($('<div></div>')
          .addClass ('jscoq-main')
          .append ($('<div></div>')
            .attr ('id', 'ide-wrapper')
            .addClass ('toggled')
            .append ($('<div></div>')
              .attr ('id', 'code-wrapper')
              .append ($('<div></div>')
                .attr ('id', 'document')
                .append ($('<textarea></textarea>')
                  .addClass ('coq-code')
                  .text (coqSource)
        )))));

      JsCoq.start(jscoq_opts.base_path, 'modules/coq/lib/node_modules/', jscoq_ids, jscoq_opts);
      done (null);
  });
}
```

Generating Source Files
-----------------------

You can generate the Curly module's source files using [Literate Programming](https://github.com/jostylr/literate-programming), simply execute:
`literate-programming Readme.md`
from the command line.

### Coq.js
```
_"Initialization"

_"Auxiliary Definitions"

_"The Coq Block Handler"
```
[coq.js](#Coq.js "save:")
