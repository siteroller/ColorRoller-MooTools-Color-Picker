ColorRoller - Color Picker
===========

Color Picker for Mootools.

Tiny, Simple, Cross Browser: IE4+, FF1+, Webkit2+, Opera

Popular formats: HSB / HSV, HSL / HSI, HSG

Various style pickers: Color Wheel, MS Paint, Adobe Photoshop, [GIMP Triangle under developement].

## Community
The Color Picker was devised as part of the MooRTE wysiwyg editor.

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
