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