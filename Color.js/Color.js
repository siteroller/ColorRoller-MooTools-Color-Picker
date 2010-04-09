/*
---

script: Color.js

description: Class for creating and manipulating colors in JavaScript. Supports HSB -> RGB Conversions and vice versa.

license: MIT-style license

authors:
- Valerio Proietti
- Sam Goody

requires:
- core:1.2.4/Array
- core:1.2.4/String
- core:1.2.4/Number
- core:1.2.4/Hash
- core:1.2.4/Function
- core:1.2.4/$util

provides: [Color]

...
*/

var Color = new Native({

	initialize: function(color, type){
		if (arguments.length >= 3){
			type = 'rgb'; color = Array.slice(arguments, 0, 3);
		} else if (typeof color == 'string'){
			if (color.match(/rgb/)) color = color.rgbToHex().hexToRgb(true);
			else if (color.match(/hsb/)) color = color.hsbToRgb();
			else color = color.hexToRgb(true);
		}
		type = type || 'rgb';
		switch (type){
			case 'hsb':
				var old = color;
				color = color.hsbToRgb();
				color.hsb = old;
			break;
			case 'hex': color = color.hexToRgb(true); break;
		}
		color.rgb = color.slice(0, 3);
		color.hsb = color.hsb || color.rgbToHsb();
		color.hex = color.rgbToHex();
		return $extend(color, this);
	}

});

Color.implement({

	mix: function(){
		var colors = Array.slice(arguments);
		var alpha = ($type(colors.getLast()) == 'number') ? colors.pop() : 50;
		var rgb = this.slice();
		colors.each(function(color){
			color = new Color(color);
			for (var i = 0; i < 3; i++) rgb[i] = Math.round((rgb[i] / 100 * (100 - alpha)) + (color[i] / 100 * alpha));
		});
		return new Color(rgb, 'rgb');
	},

	invert: function(){
		return new Color(this.map(function(value){
			return 255 - value;
		}));
	},

	setHue: function(value){
		return new Color([value, this.hsb[1], this.hsb[2]], 'hsb');
	},

	setSaturation: function(percent){
		return new Color([this.hsb[0], percent, this.hsb[2]], 'hsb');
	},

	setBrightness: function(percent){
		return new Color([this.hsb[0], this.hsb[1], percent], 'hsb');
	}

});

var $RGB = function(r, g, b){
	return new Color([r, g, b], 'rgb');
};

var $HSB = function(h, s, b){
	return new Color([h, s, b], 'hsb');
};

var $HEX = function(hex){
	return new Color(hex, 'hex');
};

Array.implement({

	fromRgb: function(space,decimal){
		var v,
			hsl = 0,
			rgb = $A(this).sort(function(a,b){
				return res = a - b
			}),
			min = rgb[0],
			max = rgb[2];
		
		switch((space||'').toLowerCase().slice(-1)){
			default :
				v = max / 2.55;
				span = v;  break;
			case 'g':
				v = min / (min - max + 255) * 100;
				span = 100;  break;
			case 'l':
				v = (+max + +min) / 5.1;
				span = v * 2;
				if (v > 50){
					span = 200 - span;
					hsl = 100 - span;
				}
		}

		var s = 100 * (min / 2.55 - v) / (hsl - v);
		var d = (100 * (rgb[1] / 2.55 - v) / s + v - hsl) / span;
		for (var ind = '', i = 0; i < 3; i++) ind += rgb.indexOf(this[i]);
		var h = '210,120,021,012,102,201,110,020,011,002,101,000,200'.indexOf(ind)/4%6;
		h += h%2 ? 1-d : d;
		return [h*60,s,v].map(function(i){ return decimal ? i||0 : Math.round(i||0) });
	},

	toRgb: function(space,decimal){
		var hsl = 0,
			rgb = [],
			max = +this[2],
			val = max,
			hue = this[0] % 360 / 60,
			f = Math.floor(hue),
			map = [0, (f % 2 ? 1 + f - hue : hue - f), 1],
			ind = ['210','201','021','012','102','120'][f];
			
		switch((space||'').slice(-1).toLowerCase()){
			case 'w': case 'g': max = 100; break;
			case 'l': case 'i': max *= 2;
				if (val > 50){
					max = 200 - max;
					hsl = 100 - max;
				}
		}
		
		map.each(function(perc,i){
			var tint = 2.55 * (this[1] / 100 * (perc * max - val + hsl) + val);
			rgb[ind.charAt(i)] = decimal ? tint : Math.round(tint);
		}, this);

		return rgb;
	}
});

String.implement({

	fromRgb: function(space){
		var rgb = this.match(/\d{1,3}/g);
		return (rgb) ? rgb.fromRgb(space) : null;
	},

	toRgb: function(space){
		var hsb = this.match(/\d{1,3}/g);
		return (hsb) ? hsb.toRgb(space) : null;
	}

});

['b','l','w','v','i','g'].each(function(space){
	
	String.implement('hs'+space+'ToRgb', function(){
		var hsb = this.match(/\d{1,3}/g);
		return (hsb) ? hsb.toRgb(space) : null;
	});
	
	String.implement('rgbToHs'+space, function(){
		var hsb = this.match(/\d{1,3}/g);
		return (hsb) ? hsb.fromRgb(space) : null;
	});
	
	Array.implement('rgbToHs'+space, function(dec){ 
		return this.fromRgb(space,dec);
	});
	Array.implement('hs'+space+'ToRgb', function(dec){ 
		return this.toRgb(space,dec); 
	});
});

/*
ToDo: 6,163,0 - infinity in HSW
*/