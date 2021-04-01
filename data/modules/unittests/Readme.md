Unittests Module
================

The Unittests module ensures that QUnit does not run until all of the app modules are completely loaded. 

```javascript
/*
  The Unittests module ensures that QUnit does
  not run until all of the app modules are 
  completely loaded.
*/
```

Displaying Test Results
-----------------------
In order to display the tests' output, you must insert two div elements with the ids of "qunit" and "qunit-fixture", respectively. They must be explicitly embedded in index.html, NOT inserted with a template, so that they exist when QUnit starts.

Paste the following lines into index.html, inside of the element with the id of "main_content":

```html
<div id="qunit"></div>
<div id="qunit-fixture"></div>
```

index.html also needs to load the QUnit library, and ensure that QUnit's autostart value is set to false. To do so, paste the following inside of the head element, below the other script elements:
```javascript
<script src="lib/qunit/qunit.js"></script>
<script>
  QUnit.config.autostart = false;
</script>
```


The Module Load Event Handler
-----------------------------

```javascript
/*
  Register app load event handler to start
  QUnit tests.
*/
MODULE_LOAD_HANDLERS.add (
  function (done) {
    APP_LOAD_HANDLERS.add (
      function (appSettings, done) {
        $.getCSS ('lib/qunit/qunit.css');
        QUnit.start ();
        done ();
    });
    done (); 
});
```

Generating Source Files
-----------------------

You can generate the Unittests module's source files using [Literate Programming](https://github.com/jostylr/literate-programming), simply execute:
`literate-programming Readme.md`
from the command line.

<!---
#### Unittests.js
```
_"Unittests Module"

_"The Module Load Event Handler"
```
[unittests.js](#Unittests.js "save:")
-->
