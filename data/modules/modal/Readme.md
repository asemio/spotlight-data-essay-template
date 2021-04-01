Modal Module
============

The Modal module is responsible for defining the modal block which displays content within modal windows.

These modal windows can be customized by modifying the template provided in the templates folder.

```javascript
/*
  The modal module is responsible for defining
  the modal block which displays content within
  modal windows.
*/
```

Global Variables
----------------

The Modal module defines a single global constant variable named `modal_TEMPLATE_URL` that stores a URL referencing the module's template.

```
/*
  A constant URL string referencing the Modal
  element's template.
*/
var modal_TEMPLATE_URL = 'modules/modal/templates/template.html';
```

The Load Event Handler
----------------------

The module's load event handler registers the Modal block handler and loads the default stylesheets.

```javascript
/*
  Loads the module's stylesheets and registers
  the Modal block handler.
*/
MODULE_LOAD_HANDLERS.add (
  function (done) {
    // I. Load the module's stylesheet.
    $.getCSS ('modules/modal/css/modal.css');

    // II. Register the modal block handler.
    block_HANDLERS.add ('modal_block', modal_block);

    // III. Continue.
    done (null);
});
```

The Modal Block Handler
-----------------------

The Modal block handler expands Modal blocks. Every modal block may contain an HTML child element. When expanded, the Modal block handler will replace the element in the Modal block template that has a class named "modal_content_block" with the child node passed to the block element.

```javascript
/*
  Accepts two arguments:

  * context, a Block Expansion Context
  * and done, a function that accepts two
    arguments: an Error object and a JQuery
    HTML Element

  replaces context.element with the Modal Block
  Template, replaces the template element
  that has the "modal_content_block" class with
  context.element's child, and passes the
  resulting template element to done.
*/
function modal_block (context, done) {
  var content = context.element.children ();
  getTemplate (modal_TEMPLATE_URL,
    function (error, template) {
      if (error) { done (error); }

      template.insertBefore (context.element);
      $('.modal_content_block', template).replaceWith (content);
      // context.element.remove ();

      $('.modal_close').click (function () {
        template.hide ();
      });

      done (template);
  });
}
```

The Default Modal Template
--------------------------

The default modal template is presented below and can be found in [templates/template.html.default](#The Default Modal Template "save:").

```html
<div class="modal">
  <div class="modal_overlay">
    <div class="modal_element">
      <div class="modal_header">
        <div class="modal_close"></div>
      </div>
      <div class="modal_body">
        <div class="modal_content_block"></div>
      </div>
      <div class="modal_footer">
      </div>
    </div>
  </div>
</div>
```

The Default Stylesheet
----------------------

The default stylesheet is responsible for overlaying and positioning the modal element. The stylesheet can be found in [scss/modal.scss.default](#The Default Stylesheet "save:").

```css
/*
  This stylesheet is responsible for defining
  the default styles applied to Modal block
  elements.
*/

$modal_overlay_background_color: rgba(0,0,0,0.8);
$modal_element_width: 300px;

.modal {
  height: 100vh;
  left: 0;
  position: fixed;
  top: 0;
  width: 100vw;

  .modal_overlay {
    background-color: $modal_overlay_background_color;
    height: 100%;
    width: 100%;

    .modal_element {
      left: 50%;
      position: absolute;
      top: 50%;
      transform: translate(-50%, -50%);
      -ms-transform: translate(-50%, -50%);
      width: $modal_element_width;
    }
  }
}
```

Generating Source Files
-----------------------

You can generate this module's source files using [Literate Programming](https://github.com/jostylr/literate-programming), simply execute:
`literate-programming "Readme.md"`
from the command line.

<!---
### modal.js
```
_"Modal Module"

_"Global Variables"

_"The Load Event Handler"

_"The Modal Block Handler"
```
[modal.js](#modal.js "save:")
-->

