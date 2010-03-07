ColorRoller - Color Picker
===========

Color Picker for Mootools.

Tiny, Simple, Cross Browser: IE4+, FF1+, Webkit2+, Opera

Popular formats: HSB / HSV, HSL / HSI, HSG

Various style pickers: Color Wheel, MS Paint, Adobe Photoshop, [GIMP Triangle under developement].

![Screenshot](http://siteroller.net/archive/images/ColorRoller/wheelhslthumb.png)


## Community
The Color Picker was devised as part of the [MooRTE wysiwyg editor](http://siteroller.net/projects/moorte).

Issues? Ideas? Wanna Join? [We need help!]


 - Open threads regarding the color picker on the [MooRTE Google Group](http://groups.google.com/group/moorte).
 - Watch the [GitHUB page](http://github.com/siteroller/colorpicker) for updates.
 - Leave issues on the [GitHUB Issue Tracker](http://github.com/siteroller/colorpicker/issues).
 - Check out the [Mootools Forge Page](http://mootools.net/forge/p/colorroller%20-%20mootools%20color%20picker).  
    - As [the Forge is buggy](http://blog.siteroller.net/mootools-forge-gotchas), the info and downloads on this page are probably out of date.
 - Or email us:

        var name = "ColorRoller";
        var company = "siteroller.net";
        var email = name + '@' + company;
        // There's gotta be a better way to keep spammers at bay, no?!

Special thanks to [Buriel Webwerx](http://burielwebwerx.com/) for their help with the images.

## How To Use

    var CR = new ColorRoller(element [, options]);

### Arguments:
 - element [string, element] - ID of element or reference to the element object.
 - options [object]
    - color [RGB array or hexadecimal] - color cursor should be on when initialized.
    - type [string: 'wheel','paint','photoshop','gimp'] - default picker type.
    - space [string: 'hsv','hsl','hsg'] - default color space.
    - change [function] - callback every time the color is changed
    - cancel [function] - callback when color picker is closed via the 'x' button.
    - complete [function] - callback when 'check' button is pressed on color picker.
    - colorswitch [Boolean] - When switching color spaces or types, should the color be maintained and the cursor updated (true - default) or the position of the the cursor maintained and color be updated (false). 

### Styling
All of the styles are stored in a separate stylesheet: assets/CollerRoller.css<br>
You are encouraged to improve the layout of the picker, and to post on the the MooRTE forum some updated or variant styles.<br>
The colorpicker uses images instead of background-images so that the color picker can be scaled cross-browser.<br>

### Known Issues
1.  The Triangle / GIMP color picker is not yet supported.  
    If there is a desire for it, it will be completed quickly.  Otherwise it will be awhile.
2.  I am considering dropping all images and creating the gradients with  CSS alone.
    If there is any desire for this, it will get done.
3.  Bugs in the various flavors of IE keep on appearing and being squashed. Post if I missed any. 
4.  For all issues, please post to the Github issue page or start a thread on the MooRTE group.

## Screenshots
![Photoshop Style, HSL Space](http://siteroller.net/archive/images/ColorRoller/adobehsl.png)
![Paint Style, HSB Space](http://siteroller.net/archive/images/ColorRoller/painthsb.png)
![ColorWheel Style, HSL Space](http://siteroller.net/archive/images/ColorRoller/wheelhsl2.png)
![Photoshop Style, HSG Space](http://siteroller.net/archive/images/ColorRoller/adobehsg.png)