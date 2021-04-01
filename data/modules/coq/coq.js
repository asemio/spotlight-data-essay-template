/*
  The module load event handler. This function
  registers the module's block and page handlers.
*/
MODULE_LOAD_HANDLERS.add (
  function (done) {
    block_HANDLERS.add ('coq_block', coq_block);
    done (null);
});

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
