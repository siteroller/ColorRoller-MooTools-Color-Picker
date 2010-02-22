ColorRoller - Color Picker
===========

Color Picker for Mootools.

Tiny, Simple, Cross Browser: IE4+, FF1+, Webkit2+

Popular formats: HSB / HSV, HSL / HSI, HSG

Various style pickers: Color Wheel, MS Paint, GIMP Triangle, [Adobe Photoshop coming soon].

## Community
The Color Picker was devised as part of the MooRTE wysiwyg editor.

Issues? Ideas? Wanna Join? [We need help!]


 - Open threads regarding the color picker on the [MooRTE Google Group](http://groups.google.com/group/moorte).
 - Watch the [GitHUB page](http://github.com/siteroller/colorpicker) for updates.
 - Leave issues on the [GitHUB Issue Tracker]().
 - Check out the [Mootools Forge Page]()  
    - As [the Forge is buggy](), the info and downloads on this page are probably out of date.
 - Or email us:

        var name = "ColorRoller";
        var company = "siteroller.net";
        var email = name + '@' + company;
        // There's gotta be a better way to keep spammers at bay, no?!

Special thanks to [burielwebwerx]() for their help with the images.

## How To Use

    var CR = new CollorRoller(element [,options]);

### Arguments:
 - element [string, element] - ID of element or reference to the element object.
 - options [object]
    - color [hexadecimal value] - color cursor should be on when initialized.
    - type [string: 'wheel','paint','gimp','photoshop'] - default picker type
    - space     [string: 'hsv','hsl','hsg'] - default color space.
    - change   [function] - callback every time the color is changed
    - cancel     [function] - callback when color picker is closed via the 'x' button.
    - complete [function] - callback if 'ok' button is pressed on color picker.
    - colorswitch     [Boolean] - When switching color spaces or types, should the color be maintained and the cursor updated (true - default) or the position of the the cursor maintained and color be updated (false). 

### Styling
All of the styles are stored in a separate stylesheet: assets/CollerRoller.css
you are encouraged to improve the layout of the picker, and to post on the the MooRTE forum some updated or variant styles.
The colorpicker uses images instead of background-images so that the color picker can be scaled cross-browser.

### Known Issues
The Photoshop style color picker is [illogical and] not yet supported.  
If there is a desire for it, it will be completed quickly.  Otherwise it will be awhile.
For all issues, please post to the Github issue page or start a thread on the MooRTE group.

## Screenshots










ColorRoller - Color Picker
===========

Color Picker for Mootools.

Tiny, Simple, Cross Browser: IE4+, FF1+, Webkit2+

Popular formats: HSB / HSV, HSL / HSI, HSG

Various style pickers: Color Wheel, MS Paint, GIMP Triangle, [Adobe Photoshop coming soon].

## Community
The Color Picker was devised as part of the MooRTE wysiwyg editor.

Issues? Ideas? Wanna Join? [We obviously need help with the layout!]

 - Open threads regarding the color picker on [the MooRTE Google Group](http://groups.google.com/group/moorte).
 - Watch the [GitHUB page](http://github.com/siteroller/colorpicker) for updates.
 - Leave issues on the GitHUB issue Tracker
 - Or email us:
    
    var name = "ColorRoller";
    var company = "siteroller.net";
    var email = name + '@' + company;
    // There's gotta be a better way to keep spammers at bay, no?!

We anticipate issues with the Forge, the information here is only as a backup.

## How To Use

### Requirements
ColorRoller assumes that you have the [following fork of Color.js]().
This is a drop-in replacement for the class in Mootools More. It adds support for HSL and HSG, is about the same size, and is fully backwards compatible.

A copy of this version is included as part of the repo in a folder called Color.js.

### Usage

    var CR = new ColorRoller('myEl');




#### Underscores
this should have _emphasis_
this_should_not
_nor_should_this

#### Autolinking
a non-markdown link: http://github.com/blog
this one is [a markdown link](http://github.com/blog)
Email test: support@github.com

#### Commit links
c4149e7bac80fcd1295060125670e78d3f15bf2e
tekkub@c4149e7bac80fcd1295060125670e78d3f15bf2e
mojombo/god@c4149e7bac80fcd1295060125670e78d3f15bf2e

#### Issue links
issue #1
tekkub#1
mojombo/god#1




ColorRoller - Color Picker
===========

Color Picker for Mootools.

Cross Browser: IE4+, FF1+, Webkit2+

Popular formats: HSB / HSV, HSL / HSI, HSG

Various style pickers: Color Wheel, MS Paint, GIMP Triangle, [Adobe Photoshop coming soon].

What goes here is the description. Please don't make it too long. It can contain basic *styling*, **styling**, etc. 

Easy to use.



If an image is found within the description, that becomes the screenshot of the plugin. Screenshots are optional but encouraged, given the plugin has some visual interaction. The screenshot can be of any size, but try to keep it of about 200x100.

![Screenshot](http://url_to_project_screenshot)

How to use
----------

We expect this section for every plugin. It just explains how to use your plugin.
Never should a plugin rely on a 3rd party link to explain its behavior or functionality. 


It often includes code snippets, which are just indented pieces of text:

	var script = new MyScript()
	script.doSomething();

Syntax highlighting will be done automatically for you.

Screenshots
-----------

This section is optional, but encouraged if the plugin affords it. Just a list of images, one per line. We do the resizing, so use actual size screenshots.

![Screenshot 1](http://url_to_project_screenshot)
![Screenshot 2](http://url_to_project_screenshot)
![Screenshot 3](http://url_to_project_screenshot)
![Screenshot 4](http://url_to_project_screenshot)

Arbitrary section
-----------------

This is an arbitrary section. You can have as many of these as you want.
Some arbitrary section examples:

* FAQ
* Notes
* Misc
* Known issues

The name is up to you, but remember to keep it meaningful and simple. Arbitrary sections are always optional.