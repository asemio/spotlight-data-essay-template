Progressbar Module
==================

The Progress bar is responsible for only one feature, updating the global app load bar.

This module defines a list of activities that need to be completed to fully load the app. Other modules notify this module when these tasks have been completed and this module updates the global load bar accordingly.

```javascript
/*
  The Progress bar module is responsible for
  tracking the app's load status.
*/

// Declares the QUnit test module.
QUnit.module ('Progress Bar');

/*
*/
function progressbar_Activities () {
  this._activities = {
    'core.load_app':      0,
    'core.load_settings': 0,
    'core.load_modules':  0,
    'book.load_database': 0,
    'page.load':          0
  };
}

/*
*/
progressbar_Activities.prototype.num = function () {
  return Object.keys (this._activities).length;
}

/*
*/
progressbar_Activities.prototype.exists = function (activityId) {
  return this._activities.hasOwnProperty (activityId);
}

/*
*/
progressbar_Activities.prototype._get = function (activityId) {
  return this.exists (activityId) ? this._activities [activityId] : null;
}

/*
*/
progressbar_Activities.prototype.update = function (activityId, progress) {
  if (this.exists (activityId)) {
    this._activities [activityId] = Math.max (this._get (activityId), progress);

    var progress = this.progress ();
    var roundedProgress = Math.floor (progress);
    progressbar_getPercentageElement ().text (roundedProgress === 100 ? 'Fully Loaded' : (roundedProgress + '%'));
    progressbar_getProgressbarElement ().progressbar ({
      value: progress
    });
  }
}

/*
*/
progressbar_Activities.prototype.progress = function () {
  var progress = 0;
  var numActivities = this.num ();
  for (var activityId in this._activities) {
    progress += this._get (activityId) / numActivities;
  }
  return progress;
}

/*
*/
progressbar_Activities.prototype.initElement = function () {
  var progress = this.progress ();
  var roundedProgress = Math.floor (progress);
  progressbar_getPercentageElement ().text (roundedProgress === 100 ? 'Fully Loaded' : (roundedProgress + '%'));
  progressbar_getProgressbarElement ().progressbar ({
    value: progress
  });
}

/*
*/
function progressbar_getProgressbarElement () {
  return $('.progressbar_bar');
}

/*
*/
function progressbar_getPercentageElement () {
  return $('.progressbar_percentage');
}

// An Associative array listing progress bar activities by ID.
var progressbar = new progressbar_Activities ();

/*
*/
$(document).ready (function () {
  progressbar.initElement ();
});
```

The Progressbar Block Element
-----------------------------

The Progressbar module searches through the current document for the Progressbar Block element and uses it to display the current load state.

The Progressbar block element is an HTML that must have the following structure:

```html
  <div class="progressbar_block">
    <div class="progressbar_percentage"></div>
    <div class="progressbar_bar"></div>
  </div>
```

The block, percentage, and bar classes are required and must be attached to different DIV elements as shown above.

Developers may add additional child elements to the block element, but must not add any child elements to the percentage or progress bar elements.

The module uses the jQuery UI library to replace the progress_bar element with a slider UI component.


Generating Source Files
-----------------------

You can generate the Progressbar module's source files using [Literate Programming](https://github.com/jostylr/literate-programming), simply execute:
`literate-programming Readme.md`
from the command line.

<!---
#### Progressbar.js
```
_"Progressbar Module"
```
[progressbar.js](#Progressbar.js "save:")
-->

