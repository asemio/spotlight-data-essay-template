/*
  The Unittests module ensures that QUnit does
  not run until all of the app modules are 
  completely loaded.
*/

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