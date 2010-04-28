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
		space: 'W',
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
		this.boxH = this.boxW = els.crBox.getSize().y;
		this.radius = els.crBox.getSize().x / 2;
		
		this.vLast = +(this.options.type < 2);
		// Todo: The next two lines should probably become a function that can be called from outside the class.
		this.setRGB($type(color) == 'string' ? color.hexToRgb(1) : color, 3);
		els.crIcon0.setStyle('background-color', color.rgbToHex());
		els.crFrame.setStyle('height',0); //('.crClose')
		this.addEvents();
		//this.draw();
		this.wheel();
		return els.crColorRoller;
	},
	
	build: function(){
		var self = this, i=0, els = this.els = {};

		$each(
			{Space:'select',Type:'select',Img:'img',Show:'img',View:'span',Icon:'span',ColorRoller:'span',Apply:'span',Draw:'canvas'},
			function(v,k){ els['cr'+k] = new Element(v,{'class':'cr'+k}) }
		);
		$each({0:'Wheel', 1:'MS Paint',2:'Adobe CS',3:'Triangle',W:'HSW', B:'HSB/V',L:'HSL/I'},
			function(v,k){
				new Element('option',{'value':k,'text':v,'class':'crO'+k}).inject(++i>4 ? els.crSpace : els.crType);
			});
		['ColorPicker','Frame','Head','Box','BoxSel','BoxSee','Bar','BarSel','Nums','Val','Cancel','Isoceles','Right','Icon0','Icon1','Icon2','Circle','Triangle','Tri1','Tri2','Shade','L0','L1','L2','X','V','Bot','Circle'].each(
			function(v){
				els['cr'+v] = new Element('div',{'class':'cr'+v});
			});
		$each({R:'inputRGB',G:'inputRGB',B:'inputRGB',0:'input0',S:'inputS',1:'input1',Hex:'inputRGBHex'},//Apply:'close'
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
				crFrame.set('morph', {duration: 'long', link: 'cancel'}).adopt(
					crColorPicker.adopt(
						crHead.adopt(
							crCancel.adopt( crX.set('html','+'))//X'&#8855;','&#x2717;'
						)
						, crBox.adopt(
							//crCircle, 
							crL0, crL1, crL2
							, crBoxSel.adopt(crBoxSee)
							, crTriangle.adopt(crTri1, crTri2).setStyle('display','none') //This should be able to be done in one element.
							, crShade
						)
						, crBar.adopt(crBarSel)
						, crNums.adopt(
							crSpace, crType, crVal.adopt(
								crDR, crD0, crDG, crDS, crDB, crD1
							)
						), crBot.adopt(
							crDHex, crView, crApply.addClass('crD').set('html','Apply')//.set('html', 	'&#8730;')'&#9745;'+'&#10003;'+'&#x2713;'+ '<span style="font-family: verdana; letter-spacing: -8px; font-weight: bold;">v/</span>'), //,
						)
					)
				).addClass(Browser.Engine.name)
			).inject(document.body);
		}

		if (Browser.Engine.trident)
			for (var grad = 0; grad < 12; grad++ )
				new Element('div',{'class':'crIE'+grad}).inject(els[grad < 6 ? 'crL1' : 'crBar']);
		
		if (Browser.Engine.trident && false) {
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
		els.crIcon.addEvent('click',this.toggle.bind(this));
		els.crApply.addEvent('click',this.close.pass(1,self));
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
			if (val < 0) val += 360;
		} else if (this.type < 3) {
			val = (this.vLast ? 360 : 100) * X / this.boxH;
			S = 100 - 100 * Y / this.boxH;
		} else {
			switch (this.space){
				case 'W':
					val = ((Y - this.boxH) / 2 + X) / Y;
					S = 1 - Y / this.boxH;
					break;
				case 'L':
					S = ((this.boxH - Y) / (2 * (X > this.boxH / 2 ? this.boxH - X : X)));	
					val = X / this.boxH;
					break;
				case 'B':
					var diff = this.boxH - (this.boxH - Y) / 2 - X;
					val = 1 - diff / this.boxH;
					S = 1 - (Y - diff) / (this.boxH - diff);
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
				var Y = this.boxH - S * this.boxH / 100
					, X = val * this.boxH / (this.vLast ? 360 : 100);
			else {
				var s = S / 100
					, m = 2 //If angle is changed, this would be: m = 2 * this.boxH / this.boxW,
					, X = this.boxW * val / 100;

				switch (this.space){
					case 'L':
						Y = this.boxH - (this.boxH - m * ((val < 50 ? this.boxW - X : X) - this.boxW / 2)) * s;
						//Y = this.boxH + s * (m * ((val < 50 ? this.boxW - X : X) - this.boxW / 2) - this.boxH);
						break;
					case 'B':
						var b = this.boxH - m * X;
						X -= X * s * .5;
						Y = X * m + b;
						break;
					case 'W':
						X -= s * (X - this.boxW * .5);
						Y = this.boxH - this.boxH * s;
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
		
		// Set opacity if slider is greyscale. 
		if (this.vLast){
			var v = Math.round(val * 2.55) 
				, bg = [v,v,v];
			els.crL2.setStyles({'background-color':bg, opacity: this.space == 'B' ? 1 - val / 100 
				: this.space == 'L' ? Math.abs(val / 50 - 1) : 0});
		} else var bg = [val,100,100].toRgb(); 
		
		//Set this.val, Slider, BG Color, steps - 0:RGB, 1:inputs.
		this.val = val;
		els.crBarSel.setStyle('top', 100 - val / (this.vLast || 3.6) + '%'); //100 - (this.vLast ? val : val / 3.6) + '%'
		
		Browser.Engine.gecko && (this.space == 'W' || this.type != 2)
			? els.crL1.setStyle('background-image', '-moz-' +
				(this.type 
					? 'linear-gradient(' + (this.vLast ? 'bottom' : 'top') 
					: 'radial-gradient(center center, circle closest-side'	
				) + ',rgb(' + bg + '),transparent)'
			): els.crL0.setStyle('background-color', 'rgb(' + bg + ')');
		
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
		//if(Browser.Engine.gecko && this.space != 'W') this.els.crL1.setStyle('background-image','');
	},
	setType: function(e){
		var els = this.els,
			type = this.type = e ? +(e.target.value) : this.options.type,
			img = ['wheel','paint',false,'triangle'];
		if (!e) this.els.crType.set('value',type);
		this.vLast = +(type < 2);
		//els.crBar.setStyle('background-image', 'url('+ CRImages + (this.vLast ? 'greyscale' : 'rainbow') + '.png)');
		//if (this.type == 2) els.crImg.setStyle('opacity',1);
		els.crBar.addClass('bar'+this.vLast).removeClass('bar'+ +!this.vLast);
		els.crBox[type ? 'removeClass' : 'addClass']('crRound');
		els.crBox.setStyle('background-color','');
		this.setImg(img[type]);
		if (!this.vLast) els.crL2.setStyles({'background-color':'','opacity':1});
		this.inputRGB();
	},
	setImg: function(img){
		var els = this.els;
		[0,1,2].each(function(num){
			var classname = 'crL' + num;
			els['crL'+num].set('class', classname + ' ' + (classname += this.type) + ' ' + classname + this.space);
		}, this);
		//this.els.crL1.set('class','crL1 crL1'+this.type+' crL1'+this.space);
		
		/*
		this.els.crL0.removeClass('crL00').removeClass('crL01').removeClass('crL02').removeClass('crL03').addClass();
		if (this.type == 3){
			this.els.crL0.addClass('crL0W').removeClass('crL0B').removeClass('crL0L');
			this.els.crL1.addClass('crL1W').removeClass('crL1B').removeClass('crL1L');			
		}else if(this.type == 2){
			this.els.crL0.removeClass('crL0B').removeClass('crL0L').removeClass('crL0W').addClass();
			this.els.crL1.addClass('crL1W').removeClass('crL1B').removeClass('crL1L');		
		
		}
		img = CRImages + (img || 'adobehs' + this.space) + '.png';
		Browser.Engine.trident && Browser.Engine.version < 5 
			? this.els.crImgIE.setStyle('width',80).set('src', CRImages + 'clear.gif').setStyle('filter','progid:DXImageTransform.Microsoft.AlphaImageLoader(src='+ img +',sizingMethod="scale")')
			: this.els.crImg.set('src', img);//(this.type ? 'clear' : 'crop')
		if (Browser.Engine.trident) this.els.crCircle.setStyle('display', this.type ? 'none' : 'block'); 
		*/
		this.els.crTriangle.setStyle('display', this.type == 3 ? 'block' : 'none'); 
	},
	
	//Events
	toggle: function(){
		this[this.els.crFrame.getStyle('height') == '0px' ? 'show' : 'close']();  
	},
	show: function(){
		this.els.crFrame.morph({height:152});
		this.offset = {
			y: this.els.crBox.getPosition().y,
			x: this.els.crBox.getPosition().x
		};
		this.fireEvent('show');
	},
	close: function(action){
		var hex = this.getValues(['R','G','B']).rgbToHex().toUpperCase();
		this.els.crFrame.morph({height:0});//'.crClose'
		if (action) this.els.crIcon0.setStyle('background-color',hex);
		this.fireEvent(action ? 'complete' : 'cancel',hex); 
	},
	
	// Create color wheel
	draw: function(){
		if (Browser.Engine.trident){} //|| (Browser.Engine.gecko && Browser.Engine.version > 1.9)
		else {
			var draw = Browser.Engine.gecko 
				? this.els.crDraw.set({width:this.boxH, height:this.boxH}).inject(this.els.crL0, 'before').getContext('2d')
				: document.getCSSCanvasContext('2d', 'circle', 100, 100)
			, img = draw.createImageData(this.boxH,this.boxW)
			, pix = img.data
			, r = this.radius
			, d = this.boxH - 1
			, x = d
			, y = d;

			for (var l = pix.length - 4; l > 0; l -= 4){
				var hue = Math.atan2(x - r, r - y) * 0.95492965855137201461330258023509;
				if (hue < 0) hue += 6;
				var f = Math.floor(hue)
					, map = [0, Math.round(255 * (f % 2 ? 1 + f - hue : hue - f)), 255]
					, ind = ['210','201','021','012','102','120'][f];
				
				for (var m = 0; m < 3; m++)	pix[l + +ind[m]] = map[m];
				pix[l + 3] = 255;
				if (!x-- && y--) x = d;
			}

			draw.putImageData(img,0,0);
			draw.globalCompositeOperation = 'destination-out';
			
			draw.beginPath();
			draw.arc(r,r,r+10,6.2,0,true);
			draw.lineWidth = 20;
			draw.stroke();
		}
	},
	
	wheel: function(){
		var draw
			, r = this.radius
			, d = this.boxH - 1
			, x = d
			, y = d
			, up = false;
			//, rgb = [];
			//$$('head')[0].adopt(new Element('style',{'text':'v\:*{behavior:url(#default#VML)}'}));
		switch (Browser.Engine.name){
			case 'webkit': draw = document.getCSSCanvasContext('2d', 'circle', 100, 100); break;
			case 'trident': this.els.crL1.adopt(this.els.crCircle); 
			draw = '<v:group style="width:'+this.boxW+';height:'+this.boxH+'" coordsize="'+this.boxW+','+this.boxH+'">';break;
			case 'gecko': draw = this.els.crDraw.set({width:this.boxH, height:this.boxH}).inject(this.els.crL0, 'before').getContext('2d'); 
				draw.mozImageSmoothingEnabled = false;  
		}
		draw.lineWidth = 3;
			
		for (var l = d * 4; l > 0; l--){
			var hue = Math.atan2(x - r, r - y) * 0.95492965855137201461330258023509;
			if (hue < 0) hue += 6;
			var f = Math.floor(hue)
				, rgb = []
				, map = [0, Math.round(255 * (f % 2 ? 1 + f - hue : hue - f)), 255]
				, ind = ['210','201','021','012','102','120'][f];
			for (var m = 0; m < 3; m++) rgb[ind.charAt(m)]=map[m];
			rgb = rgb[0]+','+rgb[1]+','+rgb[2]; //rgb.toString();
			
			if (Browser.Engine.trident) 
				draw += '<v:line from="'+r+','+r+'" to="'+x+','+y+'" strokecolor=rgb('+rgb+') />'
			else {			//|| (Browser.Engine.gecko && Browser.Engine.version > 1.9)
				draw.beginPath();
				draw.strokeStyle = 'rgb('+rgb+')';  
				draw.moveTo(r,r);
				draw.lineTo(x,y);
				draw.stroke(); 	
			}
			
			if (!(x || y)) up = true;
			up ? (x < d ? ++x : ++y) : (x ? --x : --y);	
		}
		
		if (Browser.Engine.trident)
			// entire function take 350 ms to run, except this line, which moves it to 3900ms to run
			this.els.crCircle.innerHTML = draw+'</v:group>';
		else {
			draw.globalCompositeOperation = 'destination-out';
			draw.beginPath();
			draw.lineWidth = 20;
			draw.arc(r,r,r+10,Math.PI*2,0,true);
			draw.stroke();
		}
	}
});