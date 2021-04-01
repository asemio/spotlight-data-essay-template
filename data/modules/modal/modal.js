/*
  The modal module is responsible for defining
  the modal block which displays content within
  modal windows.
*/

/*
  A constant URL string referencing the Modal
  element's template.
*/
var modal_TEMPLATE_URL = 'modules/modal/templates/template.html';

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