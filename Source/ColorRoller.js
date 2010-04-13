/*
---
description: Color Picker. Support for HSB / HSL / HSG.  Support For MSPaint, Adobe, GIMP, and Wheel Style pickers.

license: OSL [Open Source License from the Open Source Initiative].

authors:
- Sam Goody

credits:
- eliyahug for the math that was used to get the triangle coordinates.  While I didn't use it all, I'm impressed.
- burielwebworx for the wheel image.

requires:
- Core/*
- More/Utilites: Color

provides: [ColorRoller]

...
*/
var CRImages = "../Source/Assets/";

var ColorRoller = new Class({

	Implements: [Options,Events],
	
	options: {
        onComplete: $empty, 
        onCancel: $empty,
		onChange: $empty,
		onShow: $empty,
		space: 'G',
		color: [127,127,127],
		type: 0,
		colorswitch: true
	},

	initialize: function(options){
		this.setOptions(options);
		this.build();
		
		var els = this.els, 
			color = this.options.color;
		this.barHeight = els.crBar.getSize().y;
		this.boxHeight = els.crBox.getSize().y;
		this.radius = els.crBox.getSize().x / 2;
		
		this.vLast = +(this.options.type < 2);
		this.setRGB($type(color) == 'string' ? color.hexToRgb(1) : color, 3);
		els.crIcon0.setStyle('background-color', color.rgbToHex())//.set('src', CRImages + 'crShow.png');
		//els.crColorRoller.addClass('crHide');
		this.addEvents();
		return els.crIcon;
	},
	
	build: function(){
		var self = this, i=0, els = this.els = {};

		$each(
			{Space:'select',Type:'select',Img:'img',Show:'img',View:'span',Icon:'span'},
			function(v,k){ els['cr'+k] = new Element(v,{'class':'cr'+k}) }
		);
		$each({0:'Wheel', 1:'MS Paint',2:'Adobe CS',3:'Triangle',G:'HSG', B:'HSB/V',L:'HSL/I'},
			function(v,k){
				new Element('option',{'value':k,'text':v,'class':'crO'+k}).inject(++i>4 ? els.crSpace : els.crType);
			});
		['ColorRoller','ColorPicker','Head','Box','BoxSel','BoxSee','Bar','BarSel','Nums','Val','Complete','Cancel','Isoceles','Right','Icon0','Icon1','Icon2','Circle','Triangle','Tri1','Tri2','Shade'].each(
			function(v){
				els['cr'+v] = new Element('div',{'class':'cr'+v});
			});
		$each({R:'inputRGB',G:'inputRGB',B:'inputRGB',0:'input0',S:'inputS',1:'input1',Hex:'inputRGBHex'},
			function(v,k){
				if (k == 0) k = 0; // Yes, I know this is odd.
				els['cr' +k] = new Element('span',{'text':k||'H','class':'cr'+k||'H'});
				els['crI'+k] = new Element('input',{'type':'text','class':'crI'+k});
				els['crI'+k].addEvent('keyup',self[v].bind(self));  // combine with previous line
				
				els['crA1'+k] = new Element('span');
				els['crA2'+k] = new Element('span');
				els['crD'+k] = new Element('span',{'class':'crD'}).adopt(els['cr' +k], els['crI'+k]);
			});
		
		if (Browser.Engine.trident && Browser.Engine.version < 5)
				els.crImg = new Element('span').adopt(els.crImgIE = new Element('img',{'class':'crImg'}));
		
		with(els){		// The evil 'with'. Ran tests, found it efficient and readable.
			crColorRoller.adopt(
				crIcon.adopt(
					crIcon0, crIcon1.adopt(crIcon2)
				),
				crColorPicker.adopt(
					crHead.adopt(
						crComplete.set('html', 	'&#8730;'),//'&#9745;'+'&#10003;'+'&#x2713;'+ '<span style="font-family: verdana; letter-spacing: -8px; font-weight: bold;">v/</span>'), //,
						crCancel.set('html','X')//'&#8855;','&#x2717;'
					),
					crBox.adopt(
						crImg,
						crBoxSel.adopt(crBoxSee),
						crCircle,
						crTriangle.adopt(crTri1, crTri2).setStyle('display','none'),
						crShade
					),
					crBar.adopt(crBarSel),
					crNums.adopt(
						crSpace,crType,crVal.adopt(
							crDR,crDG,crDB,crD0,crDS,crD1
						),
						crDHex,crView
					)
				)
			).inject(document.body);
		}
		
		if (Browser.Engine.trident) {
			var H = els.crBox.clientHeight;
			for (var i=1; i<13; i++){
				var rad = 7 * i * Math.PI * 2 / 360,
				cos = Math.cos(rad),
				sin = Math.sin(rad),
				filter = 'progid:DXImageTransform.Microsoft.Matrix(sizingMethod="auto expand", M11 = '
					+ cos + ', M12 = '+ (-sin) + ', M21 = ' + sin + ', M22 = ' + cos +')',
				obj = new Element('div', { styles:{
					filter: filter,
					'-ms-filter': filter
				}}).inject(els.crCircle);
				obj.setStyles({
					top: (H - obj.offsetHeight) / 2,
					left: (H - obj.offsetWidth) / 2
				});
			}
		}
	},
	
	addEvents: function(){
		var self = this, els = this.els;
		els.crSpace.addEvent('change',this.setSpace.bind(this)).fireEvent('change');
		els.crType.addEvent('change',this.setType.bind(this)).fireEvent('change');
		els.crIcon.addEvent('click',this.show.bind(this));
		els.crComplete.addEvent('click',this.close.pass(1,self));
		els.crCancel.addEvent('click',this.close.pass(0,self));
		function mousedown(e){ self.mousedown = true; e.stop() }
		els.crColorPicker.addEvent('mouseup',function(){ self.mousedown = false });
		els.crBarSel.addEvents('mousedown',mousedown);
		els.crBar.addEvents({
			'mousemove':self.slider.bind(self),
			'mousedown':function(e){
				mousedown(e);
				self.slider(e);
			}
		});
		els.crShade.addEvents({
			'mousemove':self.picker.bind(self),
			'mousedown':function(e){
				mousedown(e);
				self.picker(e);
			}
		});
	},
	
	//Inputs:
	inputRGB: function(){
		this.setRGB(this.getValues(['R','G','B']),1);
	},
	inputRGBHex: function(event){
		this.setRGB(event.target.value.hexToRgb(1),2);
	},
	input0: function(event){
		this.inputHSV(0,event.target.value);
	},
	inputS: function(event){
		this.setPicker( this.els['crI'+ +!this.vLast].get('value'), event.target.value, 1)
	},
	input1: function(event){
		this.inputHSV(1,event.target.value);
	},
	inputHSV: function(el,val){
		this.vLast != el 
			? this.setPicker(val,this.getValues(['S']),1)
			: this.setSlider(val,1);
	},
	slider: function(event){
		var max = this.vLast ? 100 : 360,
			val = max - max * (event.page.y - this.offset.y) / this.barHeight;
		if (this.mousedown && val > -1 && val < max) this.setSlider(val, 2);
	},
	picker: function(event){
		if (!this.mousedown) return;
		var els = this.els, val, S,
			X = event.page.x - this.offset.x,
			Y = event.page.y - this.offset.y;
		
		if (!this.type){
			var O = X - this.radius,
				A = this.radius - Y;
			val = Math.atan2(O,A) * 180 / Math.PI;
			S = Math.sqrt(O*O+A*A) * 100 / this.radius;
			if (val < 0) val -= -360;
		} else if (this.type < 3) {
			val = (this.vLast ? 360 : 100) * X / this.boxHeight;
			S = 100 - 100 * Y / this.boxHeight;
		} else {
			switch (this.space){
				case 'G':
					val = ((Y - this.boxHeight) / 2 + X) / Y;
					S = 1 - Y / this.boxHeight;
					break;
				case 'L':
					S = ((this.boxHeight - Y) / (2 * (X > this.boxHeight / 2 ? this.boxHeight - X : X)));	
					val = X / this.boxHeight;
					break;
				case 'B':
					var diff = this.boxHeight - (this.boxHeight - Y) / 2 - X;
					val = 1 - diff / this.boxHeight;
					S = 1 - (Y - diff) / (this.boxHeight - diff);
			}
			val *= 100;
			S *= 100;
			if (val > 100 || val < 0) return;
		}
		if (S > 100) return;
		els.crBoxSel.setPosition({
			y:Y, 
			x:X 
		});
		this.setPicker(val, S, 2);
	},
	
	// Set Values
	setRGB: function(val,step){
		//steps - 0:HSV, 1:inputs, 2:Hex, 3:View. 
		var e = this.els, hex = val.rgbToHex().toUpperCase();
		this.fireEvent('change',hex);
		if (step != 1) this.setValues(['R','G','B'], val);
		if (step != 2) e.crIHex.set('value', hex);
		e.crView.setStyle('background-color', 'rgb(' + val + ')');
		if (step){
			var hsv = val.fromRgb(this.space);
			if (!this.vLast) hsv.reverse();
			this.setPicker(hsv[0],hsv[1]);
			this.setSlider(hsv[2]);
		}
	},
	setPicker: function(val,S,step){
		//steps - 0:RGB, 1:inputs, 2:Picker Position.
		if (step != 1) this.setValues([+(!this.vLast),'S'],[val,S],5);
		if (step != 2){
			if (!this.type)
				var m = val * Math.PI / 180
					, radius = S * this.radius / 100
					, Y  = this.radius - radius * Math.cos(m)
					, X = this.radius + radius * Math.sin(m);
			else if (this.type < 3)
				var Y = this.boxHeight - S * this.boxHeight / 100
					, X = val * this.boxHeight / (this.vLast ? 360 : 100);
			else {
				var s = S / 100
					, boxWidth = this.boxHeight // incase we change angle.
					, m = 2 * this.boxHeight / boxWidth //2, unless we change angle.
					, X = boxWidth * val / 100;

				switch (this.space){
					case 'L':
						Y = this.boxHeight - (this.boxHeight - m * ((val < 50 ? boxWidth - X : X) - boxWidth / 2)) * s;
						break;
					case 'B':
						var b = this.boxHeight - m * X;
						X -= X * s * .5;
						Y = X * m + b;
						break;
					case 'G':
						X -= s * (X - boxWidth * .5);
						Y = this.boxHeight - this.boxHeight * s;
				}
			}
			this.els.crBoxSel.setStyles({top:Y, left:X});
		}
		if (step){
			var hsv = this.vLast
				? [val, S, this.val]
				: [this.val, S, val];
			this.setRGB(hsv.toRgb(this.space));
		}
	},
	setSlider: function(val,step){
		var els = this.els;
		
		// Set Opacity if slider is greyscale. 
		if (this.vLast){
			var v = Math.round(val * 2.55), 
			bg = [v,v,v],
			value = this.space == 'B' ? val / 100 : 
				this.space == 'L' ? 1 - Math.abs(val / 50 - 1) : 1;
			els.crImg.setStyle('opacity',value);
		} else var bg = [val,100,100].toRgb(); 
		
		//Set this.val, Slider, BG Color, steps - 0:RGB, 1:inputs.
		this.val = val;
		els.crBarSel.setStyle('top', 100 - val / (this.vLast || 3.6) + '%'); //100 - (this.vLast ? val : val / 3.6) + '%'
		els.crBox.setStyle('background-color', 'rgb(' + bg + ')');
		if (step != 1) els['crI'+this.vLast].set('value', Math.round(val));
		if (step) this.setRGB(this.getValues([0,'S',1]).toRgb(this.space)); 
	}, 
	
	// Utilities
	getValues:function(val){
		var self = this;
		return val.map(function(el){ return self.els['crI'+el].get('value') });
	},
	setValues: function(key,val){
		var self = this;
		val.each(function(v,i){ self.els['crI'+key[i]].set('value',Math.round(v)) });
	},
	setSpace: function(e){
		var els = this.els, 
			vFirst = +!this.vLast, 
			vals = this.getValues([this.vLast,vFirst]);
		this.space = e ? e.target.value : this.options.space;
		if (!e) this.els.crSpace.set('value',this.space);
		this.els.cr1.set('text',this.space);
		this.options.colorswitch
			? this.inputRGB()
			: (this.setSlider(vals[0]) || this.inputHSV(vFirst,vals[1]));
		if (this.type == 2) this.setImg();
	},
	setType: function(e){
		var els = this.els,
			type = this.type = e ? +(e.target.value) : this.options.type,
			img = ['wheel','paint',false,'triangle'];
		if (!e) this.els.crType.set('value',type);
		this.vLast = +(type < 2);
		//els.crBar.setStyle('background-image', 'url('+ CRImages + (this.vLast ? 'greyscale' : 'rainbow') + '.png)');
		els.crBar.addClass('bar'+this.vLast).removeClass('bar'+ +!this.vLast);
		els.crBox[type ? 'removeClass' : 'addClass']('crRound');
		els.crBox.setStyle('background-color','');
		this.setImg(img[type]);
		if (this.type == 2) els.crImg.setStyle('opacity',1);
		this.inputRGB();
	},
	setImg: function(img){
		img = CRImages + (img || 'adobehs' + this.space) + '.png';
		Browser.Engine.trident && Browser.Engine.version < 5 
			? this.els.crImgIE.setStyle('width',80).set('src', CRImages + 'clear.gif').setStyle('filter','progid:DXImageTransform.Microsoft.AlphaImageLoader(src='+ img +',sizingMethod="scale")')
			: this.els.crImg.set('src', img);//(this.type ? 'clear' : 'crop')
		if (Browser.Engine.trident) this.els.crCircle.setStyle('display', this.type ? 'none' : 'block'); 
		this.els.crTriangle.setStyle('display', this.type == 3 ? 'block' : 'none'); 
	},
	
	//Events
	show: function(){
		//this.els.crColorRoller.removeClass('crHide');
		this.els.crColorRoller.morph('.crHide');
		this.offset = {
			y: this.els.crBox.getPosition().y,
			x: this.els.crBox.getPosition().x
		};
	},
	close: function(action){
		var hex = this.getValues(['R','G','B']).rgbToHex().toUpperCase();
		this.els.crColorRoller.addClass('crHide');
		if (action) this.els.crIcon0.setStyle('background-color',hex);
		this.fireEvent(action ? 'complete' : 'cancel',hex); 
	}

});

