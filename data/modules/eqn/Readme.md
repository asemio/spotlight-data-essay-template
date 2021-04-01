Eqn Readme
==========

The Eqn module allows you to typeset mathematical equations. It imports the MathJAX library and defines a collection of Curly blocks that you can use to embed these equations.

```javascript
/*
The Eqn module allows you to typeset mathematical equations. It
imports the MathJAX library and defines a collection of Curly blocks
that you can use to embed these equations.
*/
```

The Load Event Handler
----------------------

The Eqn module loads the MathJAX library, defines a set of Curly blocks, and invokes the MathJAX render function each time a page loads.

```javascript
/*
  The Eqn module loads the MathJAX library, defines a set of Curly
  blocks, and invokes the MathJAX render function each time a
  page loads.
*/
MODULE_LOAD_HANDLERS.add (
  function (done) {
    loadScripts ([
        'https://polyfill.io/v3/polyfill.min.js?features=es6',
        'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js'
      ],
      function (error) {
        if (error) { return done (error); }

        PAGE_LOAD_HANDLERS.add (
          function (id, done) {
            MathJax.typeset ();
            done ();
        });

        done (null);
      });
});
```

Generating Source Files
-----------------------

You can generate the Curly module's source files using [Literate Programming](https://github.com/jostylr/literate-programming), simply execute:
`literate-programming Readme.md`
from the command line.

### Eqn.js
```
_"Eqn Readme"

_"The Load Event Handler"
```
[eqn.js](#Eqn.js "save:")
