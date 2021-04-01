Template Module
===============

The Template module allows other modules to define and nest templates.

```javascript
/*
  The Template module allows other modules to define and nest templates.
*/

// Declares the QUnit test module.
QUnit.module ('Template');
```

Example Usage
-------------
The Menu module defines the Menu class, which represents menus within Lucidity. Each Menu object must be added to the menu_MENUS array, which maintains a record of all registered menus. Once a Menu object has been registered, it can then be displayed using the Menu blocks listed below. The following presents an example of a Menu object:

```javascript
/*
  Accepts no arguments and returns a new example
  menu.
*/
function createExampleTemplates () {
  var section0 = new template_Section (null, 'section0', [], getSectionExample, ['section0']);
  var section1 = new template_Section (section0, 'section1', [], getSectionExample, ['section1'])

  var page0 = new template_Page (section0, 'page0', getPageExample, ['page0']);
  var page1 = new template_Page (section1, 'page1', getPageExample, ['page1']);
  var page2 = new template_Page (section1, 'page2', getPageExample, ['page2']);

  section0.children.push (section1, page0);
  section1.children.push (page1, page2)

  return section0;
}

function getSectionExample (done) {
  var rawTemplate = $('<div class="container">\
    <div class="template_hole_block"></div>\
  </div>');
  done (null, rawTemplate)
}

function getPageExample (done) {
  var rawTemplate = $('<div class="container">\
    <div class="page_block"></div>\
  </div>');
  done (null, rawTemplate);
}
```

The Template Class
------------------
This is an abstract class that template_Page and template_Section inherit from. There are no template_Template objects.

```javascript
/*
  Defines the template_Template class. Accepts 
  four arguments: 
  * parent, a template_Template object
  * id, a Menu Element ID string
  * getRawElement, a function that accepts one
    argument, another function
  * classes, an array of strings
*/
function template_Template (parent, id, getRawElement, classes) {
  this.parent        = parent;
  this.id            = id;
  this.getRawElement = getRawElement;
  this.classes       = classes;
}

/*
  Accepts no arguments. Returns an array of the
  template's parents, grandparents, etc. and an
  empty array if it has no parents.
*/
template_Template.prototype.getAncestors = function () {
  return this.parent ? this.parent.getPath () : [];
}

/*
  Unittest for getAncestors.

  Confirms that the function returns an array 
  consisting of the template's ancestors.
*/
QUnit.test ('getAncestors', function (assert) {
  assert.expect (4);
  var done = assert.async ();

  var section0 = createExampleTemplates ();
  var page1 = section0.children [0].children [0];

  assert.notOk (section0.getAncestors ().length, 'Because section0 has no ancestors, getAncestors returns an empty array.');
  assert.strictEqual (page1.getAncestors ().length, 2, 'The array that page1.getAncestors returns includes 2 items, because it has 2 ancestors.');  
  assert.strictEqual (page1.getAncestors () [0], section0, 'The first item in page1\'s getAncestors array is identical to its grandparent, template0.');
  assert.strictEqual (page1.getAncestors () [1], section0.children [0], 'The second item in page1\'s getAncestors array is identical to its parent element.');
  done ();
})


/*
  Accepts no arguments, and returns ancestors, an
  array of objects representing:
  * each of template_Template's ancestors, and
  * the template_Template instance itself.
*/
template_Template.prototype.getPath = function () {
  var ancestors = this.getAncestors ();
  ancestors.push (this);
  return ancestors;
}

/*
  Unittest for getPath.

  Confirms that the function returns an array
  consisting of the template's ancestors as well
  as the template object itself.
*/
QUnit.test ('getPath', function (assert) {
  assert.expect (5);
  var done = assert.async ();

  var section0 = createExampleTemplates ();
  var section1 = section0.children [0];

  assert.strictEqual (section0.getPath ().length, 1, 'getPath returns a single-item array for section, because it has no ancestors.');
  assert.strictEqual (section1.getPath ().length, 2, 'getPath returns a two-item array for section1, because it has one ancestor.');  
  assert.strictEqual (section1.getPath () [0], section0, 'The first object returned by section1.getPath is equivalent to its parent.');
  assert.strictEqual (section1.getPath () [1], section1, 'The second object returned by section1.getPath is identical to section1.'); 
  assert.strictEqual (section1.children [0].getPath ().length, 3, 'getPath returns a three-item array for page1, because it has two ancestors.');
  done ();
})

/*
  Accepts no arguments, and returns line, an
  array consisting of the ancestors that make up
  template_Template's path.
*/
template_Template.prototype.getLine = function () {
  var line = [];
  var path = this.getPath ();
  for (var i = 0; i < path.length; i ++) {
    line.push (path [i].id);
  }
  return line;
}

/*
  Unittest for getLine.

  Confirms that the function returns an array of
  template objects, representing the given
  template's ancestors.
*/
QUnit.test ('getLine', function (assert) {
  assert.expect (5);
  var done = assert.async ();

  var section0 = createExampleTemplates ();
  var section1 = section0.children [0];

  assert.strictEqual (section0.getPath ().length, 1, 'getPath returns a single-item array for section0, because it has no ancestors.');
  assert.strictEqual (section1.getPath ().length, 2, 'getPath returns a two-item array for section0, because it has one ancestor.');
  assert.strictEqual (section1.children [0].getPath ().length, 3, 'getPath returns a three-item array for section0, because it has two ancestors.');    
  assert.strictEqual (section1.getPath () [0], section0, 'The first object returned by section1.getPath is identical to its parent, tsection0.');  
  assert.strictEqual (section1.getPath () [1].id, section1.id, 'The second object returned by section1.getPath is identical to section1.');    
  done ();
})

/*
  Accepts no arguments and returns an integer
  representing the level of the template, as
  determined by its path.
*/
template_Template.prototype.getLevel = function () {
  return this.getPath ().length;
}

/*
  Unittest for getLevel.

  Confirms that the function returns an integer
  equal to the level of the template.
*/
QUnit.test ('getLevel', function (assert) {
  assert.expect (3);
  var done = assert.async ();

  var section0 = createExampleTemplates ();

  assert.strictEqual (section0.getLevel (), 1, 'section0.getLevel returns 1 because it is the topmost template.');
  assert.strictEqual (section0.children [1].getLevel (), 2, 'page0.getLevel returns 2 because it is a second-level template.');
  assert.strictEqual (section0.children [0].children [0].getLevel (), 3, 'page1.getLevel returns 3 because it is a third-level template.');
  done ();
})

/*
  Accepts one argument, a function; applies that
  function to the template_Template object; and
  returns undefined.
*/
template_Template.prototype.iterate = function (templateFunction) {
  templateFunction (this);
}

/*
  Unittest for iterate.

  Confirms that the function applies the function
  to the template object and all of its children.
*/

QUnit.test ('iterate', function (assert) {
  assert.expect (2);
  var done = assert.async ();

  var section0 = createExampleTemplates ();
  function testIterate (input) {
    input.iterated = true;
  }
  section0.iterate (testIterate);

  assert.ok (section0.iterated, 'The test function testIterate successfully added the key "iterated" to section0.');
  assert.ok (section0.children [0].iterated, 'The test function testIterate successfully added the key "iterated" to the first child of section0.');
  done ();
})


/*
  Accepts one argument, done, a function; sends
  the raw template of the template_Template 
  element to done; and returns undefined.
*/
template_Template.prototype.getElement = function (done) {
  var self = this;
  this.getRawElement (
    function (error, rawTemplate) {
      if (error) { return done (error); }

      done (null, rawTemplate
        .addClass (self.classes)
        .attr ('data-template-id', self.id)
        .attr ('data-template-level', self.getLevel ()));
  });
}

/*
  Unittest for getElement.

  Confirms that the function generates an object
  representing the template's HTML structure,
  using its getElement method.
*/
QUnit.test ('getElement', function (assert) {
  assert.expect (4);

  var section0 = createExampleTemplates ();
  var page0 = section0.children [1];

  var done0 = assert.async ();
  section0.getElement (function (error, rawTemplate) {
    assert.ok (rawTemplate, 'getElement successfully returns a rawTemplate object for section0.');
    assert.ok ($(rawTemplate [0].children [0]).hasClass ('template_hole_block'), 'section0.getElement\'s rawTemplate object includes the appropriate template class.');
    done0 ();
  })

  var done1 = assert.async ();
  page0.getElement (function (error, rawTemplate) {
    assert.ok (rawTemplate, 'getElement successfully returns a rawTemplate object for page0.');
    assert.ok ($(rawTemplate [0].children [0]).hasClass ('page_block'), 'page0.getElement\'s rawTemplate object includes the appropriate template class.');
    done1 ();
  })

})
```

The Page Template Class
-----------------------

```javascript
/*
  Defines the template_Page class, a subclass
  of template_Template. Accepts four arguments:
  * parent, a template_Template instance
  * id, a Menu Element ID string
  * getRawElement, a function that accepts one
    argument, another function
  * classes, an array of strings
*/
function template_Page (parent, id, getRawElement, classes) {
  template_Template.call (this, parent, id, getRawElement, classes);
}

/*
  Create a new prototype object for template_Page
  and set template_Template's prototype as the
  object's prototype.
*/
template_Page.prototype = Object.create (template_Template.prototype);

/*
  Assign the template_Page prototype's constructor
  property so that any functions that read it can
  determine which constructor function was used
  to create its instance objects.
*/
template_Page.prototype.constructor = template_Page;

/*
  Accepts one argument, id, a Menu Element ID 
  string. Returns the page template matching that
  ID, or null if no match is found.
*/
template_Page.prototype.getPageTemplate = function (id) {
  return this.id === id ? this : null;
}

/*
  Unittest for getPageTemplate.

  Confirms that the function returns the page
  template if it matches the given ID.
*/
QUnit.test ('getPageTemplate', function (assert) {
  assert.expect (2);
  var done = assert.async ();

  var page0 = createExampleTemplates ().children [1];
  assert.strictEqual(page0.getPageTemplate ('page0').id, 'page0', 'getPageTemplate returns the page object when it matches the given ID.')
  assert.notOk(page0.getPageTemplate ('page1'), 'getPageTemplate returns nll when the page\'s ID is different than the given ID.')
  done ();
})

/*
  Accepts one argument, id, a template ID string.
  Returns the section within it with the target
  ID, but because pages do not have children, it
  returns null.
*/
template_Page.prototype.getSectionTemplate = function (id) {
  return null;
}

/*
  Accepts one argument, done, a function; 
  generates a template for the template_Page 
  Object by calling template_Template's getElement
  method; and passes this new template to done.
  Returns undefined.
*/
template_Page.prototype.getElement = function (done) {
  template_Template.prototype.getElement.call (this,
    function (error, template) {
      if (error) { return done (error); }

      done (null, template.addClass ('template_page'));
  });
}

/*
  Accepts one argument, done, a function.
  Places the HTML for the appropriate section
  into the .template_hold_block element, and
  passes it to next. Calls done.
*/
template_Page.prototype.getPageElement = function (done) {
  var templates = this.getPath ().reverse ();
  var pageTemplate = templates.shift ();
  pageTemplate.getElement (
    function (error, pageElement) {
      if (error) { return done (error); }

      async.reduce (
        templates,
        pageElement,
        function (element, sectionTemplate, next) {
          sectionTemplate.getElement (
            function (error, sectionElement) {
              if (error) { return next (error); }

              $('.template_id_block', sectionElement).replaceWith (sectionTemplate.id);
              $('.template_hole_block', sectionElement).replaceWith (element);
              next (null, sectionElement);
          });
        },
        done
      );
  });
}

/*
  Unittest for getPageElement.

  Confirms that the function builds an HTML
  structure, via an array of nested objects,
  that reflects the page's HTML as placed within
  its section parent's HTML.
*/
QUnit.test ('getPageElement', function (assert) {
  assert.expect (5);
  var done = assert.async ();
  var page0 = createExampleTemplates ().children [1];

  page0.getPageElement (function (error, pageElement) {
    assert.strictEqual (pageElement.length, 1, 'getPageElement returns a pageElement array with one item in it.');
    assert.ok ($(pageElement [0]).hasClass ('template_section'), 'getPageElement returns an HTML template with the correct section template name.');
    assert.strictEqual ($(pageElement [0]).attr ('data-template-id'), page0.parent.id, 'The HTML template matches the assigned template for page0\'s parent, section0.');  
    assert.ok ($(pageElement [0].children [0]).hasClass ('template_page'), 'The page template is within the outer template, and has the correct class name.');
    assert.strictEqual ($(pageElement [0].children [0]).attr ('data-template-id'), page0.id, 'The page template matches the assigned template for page0.');
    done ();
  })
})
```

The Section Template Class
--------------------------

```javascript
/*
  Defines the template_Section class, a 
  subclass of template_Template. 

  Accepts five arguments: 
  * parent, a template_Template object
  * id, a Menu Element ID string
  * children, an array of page template objects
  * getRawElement, a function 
    * which accepts one argument, another function
  * classes, an array of strings

  Returns undefined.
*/
function template_Section (parent, id, children, getRawElement, classes) {
  template_Template.call (this, parent, id, getRawElement, classes);
  this.children = children;
}

/*
  Create a new prototype object for 
  template_Section and set template_Template's
  prototype as the object's prototype.
*/
template_Section.prototype = Object.create (template_Template.prototype);

/*
  Assign the template_Section prototype's
  constructor property so that any functions that
  read it can determine which constructor 
  function was used to create its instance 
  objects.
*/
template_Section.prototype.constructor = template_Section;

/*
  Accepts one argument, id, a Menu Element ID 
  string; returns the child of the 
  template_Section object that has a matching id.
*/
template_Section.prototype.getPageTemplate = function (id) {
  return template_findPageTemplate (id, this.children);
}

/*
  Accepts one argument, id, a Menu Element ID 
  string. Searches template_Section and its
  children, and returns the object that matches
  the ID.
*/
template_Section.prototype.getSectionTemplate = function (id) {
  return this.id === id ? this : template_findSectionTemplate (id, this.children);
}

/*
  Unittest for getSectionTemplate.

  Confirms that the function searches through the
  template and its children, and returns the
  instance, if any, that matches the given ID.
*/
QUnit.test ('getSectionTemplate', function (assert) {
  assert.expect (3);
  var done = assert.async ();

  var section0 = createExampleTemplates ();
  assert.strictEqual(section0.getSectionTemplate ('section0').id, 'section0', 'getSectionTemplate returns the section object when it matches the given ID.')
  assert.strictEqual(section0.getSectionTemplate ('section1').id, 'section1', 'getSectionTemplate returns the section\'s child that matches the given ID.');
  assert.notOk(section0.getSectionTemplate ('page1'), 'getSectionTemplate returns null when the given ID matches neither the section nor one of its children.');
  done ();
})

/*
  Accepts one argument, templateFunction, a
  function; applies that function to the
  template_Section object, all of its children,
  all of those children's children, etc. until
  there are no further children; and returns 
  undefined.
*/
template_Section.prototype.iterate = function (templateFunction) {
  templateFunction (this);
  for (var i = 0; i < this.children.length; i ++) {
    this.children [i].iterate (templateFunction);
  }
}

/*
  Accepts one argument, done, a function; 
  generates the the section template for the 
  template_Section instance and sends it to done;
  returns undefined.
*/
template_Section.prototype.getElement = function (done) {
  template_Template.prototype.getElement.call (this,
    function (error, template) {
      if (error) { return done (error); }

      done (null, template.addClass ('template_section'));
  });
}
```

The Template Store Class
------------------------

```javascript
/*
  Template Stores store registered templates.
*/
function template_TemplateStore () {
  var self = this;

  // An array of registered templates
  var _templates = [];

  /* 
    An associative array of template functions,
    keyed by ID 
  */
  var _templateFunctions = {};

  /*
    Accepts two arguments: 
    * id, a Menu Element ID string
    * templateFunction, a function

    Adds templateFunction to _templateFunctions,
    keying it by id.
  */
  var addTemplateFunction = function (id, templateFunction) {
    if (!_templateFunctions [id]) { _templateFunctions [id] = []; }
    _templateFunctions [id].push (templateFunction);
  }

  /*
    Accepts one argument, template; adds it to
    the store; applies template function(s) 
    matching the template's ID and then does the
    same to the template's children, children's
    children, etc. Returns undefined. 
  */
  this.add = function (template) {
    // I. Add the template to the store.
    _templates.push (template);

    // II. Call template functions on the added templates.
    template.iterate (
      function (template) {
        var id = template.id;
        var templateFunctions = _templateFunctions [id];
        if (templateFunctions) {
          for (var i = 0; i < templateFunctions.length; i ++) {
            (templateFunctions [i]) (template);
          }
        }
    });
  }

  /*
    Accepts one argument, templates, an array of
    template instance objects, adds each of the
    templates to the template store; returns
    undefined.
  */
  this.addTemplates = function (templates) {
    for (var i = 0; i < templates.length; i ++) {
      self.add (templates [i]);
    }
  }

  /*
    Accepts two arguments:
      * id, a Menu Element ID string
      * templateFunction, a function

    Finds the page template with the id submitted
    and applies the template functions associated
    with that ID to it. If no template matching
    the ID is found, adds templateFunction to 
    _templateFunctions, with the ID as its key.
  */
  this.getPageTemplate = function (id, templateFunction) {
    var template = template_findPageTemplate (id, _templates);
    template ? templateFunction (template) : addTemplateFunction (id, templateFunction);
  }

  /*
    Accepts two arguments:
      * id, a Menu Element ID string
      * templateFunction, a function

    Finds the section template with the id
    submitted and applies the template functions
    associated with that ID to it. If no template
    matching the ID is found, adds
    templateFunction to _templateFunctions, with
    the ID as its key.
  */
  this.getSectionTemplate = function (id, templateFunction) {
    var template = template_findSectionTemplate (id, _templates);
    template ? templateFunction (template) : addTemplateFunction (id, templateFunction);
  }
}

/*
  Unittest for template_TemplateStore.

  Confirms that the function properly stores
  added templates as well as template functions,
  and applies the functions to their associated
  templates regardless of whether a template's
  function was added before the function or vice
  versa.
*/
QUnit.test ('template_TemplateStore', function (assert) {
  assert.expect (4);
  var done = assert.async ();
  var section0 = createExampleTemplates ();

  // I. Template added before function
  var templateStore0 = new template_TemplateStore ();
  var templateFunction0HasRun, templateFunction1HasRun;
  function templateFunction0 () {
    return templateFunction0HasRun = true;
  }
  function templateFunction1 () {
    return templateFunction1HasRun = true;
  }
  templateStore0.add (section0);
  templateStore0.getPageTemplate ('page1', templateFunction0);
  templateStore0.getPageTemplate ('fakePage1', templateFunction1)

  assert.ok (templateFunction0HasRun, 'templateFunction0 was able to run, because page1 was included in the template store.');
  assert.notOk (templateFunction1HasRun, 'templateFunction1 could not run, because there is no fakePage1 template in the store.');

  // II. Function added before template
  var templateStore1 = new template_TemplateStore ();
  var templateFunction2HasRun, templateFunction3HasRun;
  function templateFunction2 () {
    return templateFunction2HasRun = true;
  }
  function templateFunction3 () {
    return templateFunction3HasRun = true;
  }
  templateStore1.getPageTemplate ('page1', templateFunction2);
  templateStore1.getPageTemplate ('fakePage1', templateFunction3);
  templateStore1.add (section0);

  assert.ok (templateFunction2HasRun, 'Once section0, which contains page1, was added to the store, templateFunction2 could run.');
  assert.notOk (templateFunction3HasRun, 'templateFunction3 could not run because fakePage1 was not added as a template.');

  done ();
})

```

The Template Store
------------------

```javascript
/*
  A template_TemplateStore that stores all of the
  registered templates.
*/
var template_TEMPLATES = new template_TemplateStore ();
```

The Load Event Handler
----------------------

```javascript
/*
  Registers the Page Handler with the load event
  handler.
*/

MODULE_LOAD_HANDLERS.add (
  function (done) {
    page_HANDLERS.add ('template_page', template_page);
    done (null);
});
```

The Page Handler
----------------

```javascript
/*
  Accepts two arguments:
  * id, a Menu Element ID string
  * done, a function

  Gets the page template associated with id and
  generates the HTML code for that template. 
  Returns undefined.
*/
function template_page (id, done) {
  template_TEMPLATES.getPageTemplate (id,
    function (template) {
      template.getPageElement (done);
  });
}
```

Auxiliary Functions
-------------------

```javascript
/*
  Accepts two arguments:
  * id, a Menu Element ID string
  * templates, an array of page template objects

  Iterates through templates and returns the
  template that matches id. If no match found,
  returns null.
*/
function template_findPageTemplate (id, templates) {
  for (var i = 0; i < templates.length; i ++) {
    var template = templates [i].getPageTemplate (id);
    if (template) { return template; }
  }
  return null;
} 

/*
  Unittest for template_findPageTemplate.

  Confirms that the function searches through the
  templates array, and all the children of those
  templates, and returns the page template that
  matches the given ID.
*/

QUnit.test ('template_findPageTemplate', function (assert) {
  assert.expect (2);
  var done = assert.async ();
  var templates = [];
  templates.push (createExampleTemplates ());

  assert.strictEqual (template_findPageTemplate ('page0', templates).id, 'page0', 'template_findPageTemplate searches the template in the templates array, as well as all their children, and returns the template_Page instance that matches the given ID.');
  assert.notOk (template_findPageTemplate ('fakepage0', templates), 'If no template matches the given ID, template_findPageTemplate returns null.');
  done ();
})

/*
  Accepts two arguments:
  * id, a Menu Element ID string
  * templates, an array of section template 
    instances

  Iterates through templates and returns the
  template that matches id. If no match found,
  returns null.
*/
function template_findSectionTemplate (id, templates) {
  for (var i = 0; i < templates.length; i ++) {
    var template = templates [i].getSectionTemplate (id);
    if (template) { return template; }
  }
  return null;
}

/*
  Unittest for template_findSectionTemplate.

  Confirms that the function searches through the
  templates array, and all the children of those
  templates, and returns the section template 
  that matches the given ID.
*/

QUnit.test ('template_findSectionTemplate', function (assert) {
  assert.expect (2);
  var done = assert.async ();
  var templates = [];
  templates.push (createExampleTemplates ());

  assert.strictEqual (template_findSectionTemplate ('section1', templates).id, 'section1', 'template_findSectionTemplate searches the template in the templates array, as well as all their children, and returns the template_Section instance that matches the given ID.');
  assert.notOk (template_findSectionTemplate ('fakesection0', templates), 'If no template matches the given ID, template_findSectionTemplate returns null.');
  done ();
})
```

Generating Source Files
-----------------------

You can generate the Template module's source files using [Literate Programming](https://github.com/jostylr/literate-programming), simply execute:
`literate-programming Readme.md`
from the command line.

<!---
#### Template.js
```
_"Template Module"

_"Example Usage"

_"The Template Class"

_"The Page Template Class"

_"The Section Template Class"

_"The Template Store Class"

_"The Template Store"

_"The Load Event Handler"

_"The Page Handler"

_"Auxiliary Functions"
```
[template.js](#Template.js "save:")
-->
