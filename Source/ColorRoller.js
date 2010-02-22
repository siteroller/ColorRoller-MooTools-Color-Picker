/*
---
description: Color Picker. Support for HSB / HSL / HSG.  Support For MSPaint, Adobe, GIMP, and Wheel Style pickers.

license: OSL [Open Source License from the Open Source Initiative].

authors:
- Sam Goody

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
		space: '',
		color: [127,127,127],
		type: '',
		colorswitch: 'rgb'
	},

	initialize: function(element,options){
		this.setOptions(options);
		this.build().setStyles({'height':22, 'vertical-align':'top'}).injectAfter($(element));
		this.e.crColorRoller.addClass('crHide');
	},
	
	build: function(){
		var self = this, i=0, e = this.e = {};

		$each(
			{Space:'select',Type:'select',Img:'img',Shade:'img',Show:'img',View:'span'},
			function(v,k){ e['cr'+k] = new Element(v,{'class':'cr'+k}) }
		);
		$each({0:'Color Wheel', 1:'MS Paint',2:'GIMP',3:'Adobe CS',G:'HSG', B:'HSB/V',L:'HSL/I',},
			function(v,k){
				new Element('option',{'value':k,'text':v,'class':'crO'+k}).inject(++i>4 ? e.crSpace : e.crType);
			});
		['ColorRoller','Head','Box','BoxSel','BoxSee','Bar','BarSel','Nums','Val','Complete','Cancel'].each(
			function(v){
				e['cr'+v] = new Element('div',{'class':'cr'+v});
			});
		$each({R:'inputRGB',G:'inputRGB',B:'inputRGB',0:'input0',S:'inputS',1:'input1',Hex:'inputRGBHex'},
			function(v,k){
				if (k==0) k = 0; // Yes, I know this is odd.
				e['cr' +k] = new Element('span',{'text':k||'H','class':'cr'+k||'H'});
				e['crI'+k] = new Element('input',{'type':'text','class':'crI'+k});
				e['crI'+k].addEvent('keyup',self[v].bind(self));
			});
		
		
		with(e){ // After a month of sleepless nights, I sold my soul to the evil 'with'. [Ran some tests. Its actually efficient and readable.]
			crColorRoller.adopt(
				crHead.adopt(
					crComplete.set('html', 	'&#8730;'),//'&#9745;'+'&#10003;'+'&#x2713;'+ '<span style="font-family: verdana; letter-spacing: -8px; font-weight: bold;">v/</span>'), //,
					crCancel.set('html','X')//'&#8855;','&#x2717;'
				),
				crBox.adopt(
					crImg.set('src',CRImages+'Transp.png'),
					crBoxSel.adopt(crBoxSee),
					crShade
				),
				crBar.adopt(crBarSel),
				crNums.adopt(
					crSpace,crType,crVal.adopt(
						crR,crIR,crG,crIG,crB,crIB,cr0,crI0,crS,crIS,cr1,crI1
					),
					crHex,crIHex,crView
				)
			).inject(document.body);
		}
		this.addEvents();
		return e.crShow.set('src',CRImages+'crShow.png');
	},
	
	addEvents: function(){
		var self = this, els = this.e;
		this.barHeight = els.crBar.getSize().y;
		this.boxHeight = els.crBox.getSize().y;
		this.radius = els.crBox.getSize().x / 2;
		
		this.vLast = 1;
		this.setRGB(this.options.color,3);
		els.crSpace.addEvent('change',this.setSpace.bind(this)).fireEvent('change');
		els.crType.addEvent('change',this.setType.bind(this)).fireEvent('change');
		els.crShow.addEvent('click',this.show.bind(this));
		els.crComplete.addEvent('click',this.close.pass('1',self));
		function mousedown(e){ self.mousedown = true; e.stop() }
		els.crColorRoller.addEvent('mouseup',function(){ self.mousedown = false });
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
		this.setHS( this.e['crI'+ +(!this.vLast)].get('value'), event.target.value, 1)
	},
	input1: function(event){
		this.inputHSV(1,event.target.value);
	},
	inputHSV: function(el,val){
		this.vLast != el 
			? this.setHS(val,this.getValues(['S']),1)
			: this.setV(val,1);
	},
	slider: function(event){
		var val = 100 - 100 * (event.page.y - this.offset.y) / this.barHeight;
		if(this.mousedown && (val > -1) && (val < 101)) this.setV(val, 2);
	},
	picker: function(event){
		if (!this.mousedown) return;
		var els = this.e, H, S,
			X = event.page.x - this.offset.x,
			Y = event.page.y - this.offset.y;
		
		if (!this.type){
			var O = X - this.radius,
				A = this.radius - Y;
			H = Math.atan2(O,A) * 180 / Math.PI;
			S = Math.sqrt(O*O+A*A) * 100 / this.radius;
			if (S > 100) return;
			if (H < 0) H -= -360;
		} else {
			var perc = this.vLast ? 360 : 100;
			S = 100 - Y * 100 / this.boxHeight;
			H = X * perc / (this.type == 1 || this.space == 'G' ? this.boxHeight : Y);
		}
		
		els.crBoxSel.setPosition({
			y:Y, 
			x:X 
		});
		this.setHS(H,S,2);
	},
	
	// Set Values
	setRGB: function(val,step){
		//Steps: #1 - Set inputs. #2 - Set Hex. #3 - Set View. #0 - Set HSV
		var e = this.e, hex = val.rgbToHex().toUpperCase();
		this.fireEvent('change',hex);  
		this.setValues(['R','G','B'],val);
		e.crIHex.set('value', hex);
		e.crView.setStyle('background-color','rgb('+val+')');
		if (step){
			var hsv = val.fromRgb(this.space);
			this.setHS(hsv[0],hsv[1]);
			this.setV(hsv[2]);
		}
	},
	setHS: function(val,S,step){
		//Steps: #1 - Set inputs. #2 - Set Picker Position. #0 - Set RGB
		if (step != 1) this.setValues([+(!this.vLast),'S'],[val,S],5);
		if (step != 2){
			if(!this.type){
				var	angle = val * Math.PI / 180,
					radius = S * this.radius / 100,
					top  = this.radius - radius * Math.cos(angle),
					left = this.radius + radius * Math.sin(angle);
			} else { 
				var top  = this.boxHeight - S * this.boxHeight / 100,
					left = val * this.boxHeight / (this.vLast ? 360 : 100);
			}
			this.e.crBoxSel.setStyles({top:top, left:left});
		}
		if (step){ 
			var hsv = this.vLast
				? [val,S,this.val]
				: [this.val * 3.59,S,val];
			this.setRGB(hsv.toRgb(this.space));
		}
	},
	setV: function(val,step){
		var els = this.e;

		// Set Opacity if slider is greyscale. 
		if (this.vLast){
			var v = Math.round(val * 2.55), 
			grey = [v,v,v],
			value = this.space == 'B' ? val / 100 : 
				this.space == 'L' ? 1 - Math.abs(val / 50 - 1) : 1;
			els.crImg.setStyle('opacity',value);
		} else var V = val * 3.59, grey = [V,100,100].toRgb();
		
		//Set this.val. Set Slider. Set BG Color. #1 - Set inputs. #0 - Set RGB
		this.val = val;
		els.crBarSel.setStyle('top',100-val+'%');
		els.crBox.setStyle('background-color', 'rgb('+grey+')'); 
		if (step != 1) els['crI'+this.vLast].set('value', Math.round(V||val));
		if (step) this.setRGB(this.getValues([0,'S',1]).toRgb(this.space));
	}, 
	
	// Utilities
	getValues:function(val){
		var self = this;		
		return val.map(function(el){ return self.e['crI'+el].get('value') });
	},
	setValues: function(key,val){
		var self = this;
		val.each(function(v,i){ self.e['crI'+key[i]].set('value',Math.round(v)) });
	},
	setSpace: function(e){
		this.space = e ? e.target.value : 'G';
		this.e.cr1.set('text',this.space);
		this.options.colorswitch == 'rgb' 
			? this.inputRGB()
			: (this.setV(this.getValues(['V'])[0]) && this.inputHS());
	},
	setType: function(e){
		var els = this.e,
			type = this.type = e ? e.target.value : 0,
			img = ['wheel','paint','gimp','adobe'];
		this.vLast = +(type < 2);
		els.crBar.setStyle('background-image', 'url('+CRImages+ (this.vLast ? 'greyscale' : 'rainbow') + '.png)')
		els.crShade.set('src',!type ? CRImages+'border.png' : '');
		els.crImg.set('src',CRImages+img[type]+'.png');
		els.crBox.setStyle('background-color','');
		this.inputRGB();
	},
	show: function(){
		this.e.crColorRoller.removeClass('crHide');
		this.offset = {
			y: this.e.crBox.getPosition().y,
			x: this.e.crBox.getPosition().x
		};
	},
	
	//Events
	close: function(action){
		var hex = this.getValues(['R','G','B']).rgbToHex().toUpperCase();
		this.e.crColorRoller.addClass('crHide');
		if (action) this.e.crShow.setStyle('background-color',hex);
		this.fireEvent(action ? 'complete' : 'cancel',hex); 
	}

});
/*
//todo
1. Add support for other browsers
2. Add support for Adobe color picker.
3. Allow color picker, without inputs.
*/
