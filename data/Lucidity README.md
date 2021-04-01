Lucidity Readme
===============

## Introduction

Lucidity is a simple content management system designed to run within a minimalistic server environment. It requires no database backend, no PHP interpreter - nothing more than a web accessible directory.

Lucidity was designed to run within the client's browser and is written entirely in JavaScript. It's modular design allows it to be adapted seamlessly to any server environment and to any use case.

Despite it's lean design and minimal footprint, Lucidity's modular system provides it with features rarely found outside of larger content management systems such as Drupal and Wordpress.

Lucidity's core modules enable video streaming, sophisticated search, and Google Analytics integration.

Lucidity also includes two modules for representing textual content. Its Article module can be used to quickly create and publish articles while its Book module can be used to publish larger works divided into parts, chapters, and sections.

Using Lucidity's module system, developers can cleanly extend the core platform through an intuitive API and powerful interface.

What's more, features provided by modules can be reused and combined flexibly through Lucidity's block system. Briefly, Lucidity enables developers to define new features in modules and expose and combine those features through blocks.     

Web designers can quickly customize those blocks through Lucidity's theme system and non-programmers can leverage the features provided by those blocks using Lucidity's template system.

If you're looking for a platform that can seamlessly deliver content within a minimal server environment, you will find Lucidity to be a gratifying option. 

## How To

### Installation

Because Lucidity has no external dependencies, you can install Lucidity by simply copying it's package into any web accessible directory.

Once you have installed Lucidity, you need only to update its configuration file, settings.xml, and you're done. 

### Configuration

Lucidity has a single configuration file, settings.xml. This file specifies three parameters:

* The error handling mode

  Lucidity was designed to be fault-less. As a result, it aggressively reports any errors that it encounters by default. While this is great during development and testing, in production Lucidity can be instructed to seamlessly recover from any errors that it encounters and degrade as gracefully as possible.

  The *errorMode* parameter instructs Lucidity as to how to handle errors. errorMode should equal "strict" during development and "nonstrict" while in production.

* The theme file

  Lucidity separates structure from presentation. Structure is handled by its module system; presentation, by its theme system. By default, themes are stored within the ./theme directory while modules are stored under ./modules. The *theme* parameter specifies the location of the currently enabled theme's CSS file.

* Enabled modules

  settings.xml lists the modules that have been installed on the system under *modules*. Every module has an associated *module* element whose attributes specify the module's internal name, status, and location.

  You can enable and disable modules simply by setting the *enabled* attribute to "true" or "false" respectively.

### Creating Pages

The simplest way to create a new page is to use the Page module.

To create a new page using the Page module:

1. Enable the Page module in settings.xml

  See "Configuration" for more information about how to enable modules.

2. Create a new page template

  A page template is just an HTML file containing the content that you want the page to display. This file may be placed anywhere, but usually it is placed under ./templates.

3. Register your page template

  The page module directory (./modules/page) includes a file named templates.xml. This file is referred to as the Page Template List file and lists all of the page templates registered with Lucidity. Simply add a new entry within the templates XML element that includes a name for your template and its URL. See ./modules/page/example_templates.xml for an example.

4. Validate templates.xml 

  Whenever you modify an XML file, you should validate it against its XML schema. Simply use an XML validator to validate templates.xml against ./modules/page/templates.xsd.

5. Visit your page

  Once you have registered your page template you should now be able to view your new page. Simply enter "HOST/index.html?id=page/PAGENAME" into your browser where HOST is your site's host name and PAGENAME is the name you entered in templates.xml. For example "www.example.org/index.html?page/Example_Page".

Note: your page template's internal name must not contain any spaces (use underscores instead) and should avoid any special characters that are not allowed in URLs. 

### Using Blocks

Page templates can include blocks. Blocks are HTML elements that instruct Lucidity to perform special actions. This action might simply replace the block with a new HTML element or it might do something more abstract.

These actions are performed by *Block Handlers*. When applied, block handlers may either replace, modify, or remove the block element.

Blocks handlers are defined by modules and, when registered, every block handler is associated with an HTML class.

Developers tell Lucidity which block handler it should apply to a block element by adding the handler's class to the element.

It's important to note that every block must be associated with only one block handler.

Blocks can include text, nested HTML elements, and even other blocks inside of them. Many block handlers treat these nested elements as arguments that they need to perform their actions.

The Example Page Template defined by the Example module provides an illustration of how you can use blocks within page templates.

### Installing Modules

Installing modules in Lucidity is easy. Simply copy the module directory into ./modules/ and add an entry to the modules element in settings.xml that gives the internal name and URL of the module and its directory.
