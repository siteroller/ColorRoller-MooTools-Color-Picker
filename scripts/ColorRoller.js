var ColorRoller = new Class({
	Implements: Options,
	
	options: {
		setspace: 'rgb',
		RGB: [127,127,127]
	},

	initialize: function(element,options){
		this.setOptions(options);
		this.build().setStyles({'height':22, 'vertical-align':'top'}).injectAfter($(element));
		this.e.crColorRoller.addClass('crHide')
	},
	
	build: function(){
		var self = this, i=0, e = this.e = {};

		$each(
			{Space:'select',Type:'select',Img:'img',Shade:'img',Show:'img',View:'span'},
			function(v,k){ e['cr'+k] = new Element(v,{'class':'cr'+k}) }
		);
		$each({G:'HSG', B:'HSB/V',L:'HSL/I',0:'Color Wheel', 1:'MS Paint',2:'GIMP',3:'Adobe CS'},
			function(v,k){
				new Element('option',{'value':k,'text':v,'class':'crO'+k}).inject(++i>3 ? e.crType : e.crSpace);
			});
		['ColorRoller','Head','Box','BoxSel','BoxSee','Bar','BarSel','Nums','Val'].each(
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
		
		e.crColorRoller.adopt(
			e.crHead,
			e.crBox.adopt(
				e.crImg.set('src','images/Transp.png'),
				e.crBoxSel.adopt(e.crBoxSee),
				e.crShade
			),
			e.crBar.adopt(e.crBarSel),
			e.crNums.adopt(
				e.crSpace,e.crType,e.crVal.adopt(
					e.crR,e.crIR,e.crG,e.crIG,e.crB,e.crIB,e.cr0,e.crI0,e.crS,e.crIS,e.cr1,e.crI1
					//e.crR,e.crIR,e.crG,e.crIG,e.crB,e.crIB,e.crH,e.crIH,e.crS,e.crIS,e.crV,e.crIV
				),
				e.crHex,e.crIHex,e.crView
			)
		).inject(document.body);
		
		this.addEvents();
		return e.crShow.set('src','images/crShow.png');
	},
	
	addEvents: function(){
		var self = this, els = this.e;
		this.barHeight = els.crBar.getSize().y;
		this.boxHeight = els.crBox.getSize().y;
		this.radius = els.crBox.getSize().x / 2;
		
		this.modify = 1;
		this.setRGB(this.options.RGB,3);
		els.crSpace.addEvent('change',this.setSpace.bind(this)).fireEvent('change');
		els.crType.addEvent('change',this.setType.bind(this)).fireEvent('change');
		els.crShow.addEvent('click',this.show.bind(this));
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
		//this.modify 
		//	? this.setHS(event.target.value,this.e.crS.get('value'),1)
		//	: this.setV(event.target.value,1);
	},
	inputS: function(event){
		this.setHS( this.e['crI'+ +(!this.modify)].get('value'), event.target.value, 1)
	},
	input1: function(event){
		this.inputHSV(1,event.target.value);
		//this.modify 
		//	? this.setV(event.target.value,1)
		//	: this.setHS(event.target.value,this.e.crS.get('value'),1);
		//var v = this.getValues(['H','S']);
		//var v = this.getValues([0,'S']);
		//this.setHS(v[0],v[1],1);
	},
	inputHSV: function(el,val){
		//console.log('this.modify == el', this.modify,el,  this.modify == el )
		this.modify != el 
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
			var perc = this.modify ? 360 : 100;
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
		var e = this.e;
		//console.log('setRGB - val',val)
		this.setValues(['R','G','B'],val);
		e.crIHex.set('value',val.rgbToHex().toUpperCase());
		e.crView.setStyle('background-color','rgb('+val+')');
		if (step){
			var hsv = val.fromRgb(this.space);
				//console.log(hsv)
			this.setHS(hsv[0],hsv[1]);
			this.setV(hsv[2]);
		}
	},
	setHS: function(H,S,step){
		//console.log(arguments, 'arguments')
		//Steps: #1 - Set inputs. #2 - Set Picker Position. #0 - Set RGB
		if (step != 1) this.setValues([+(!this.modify),'S'],[H,S],5);
		if (step != 2){
			if(!this.type){
				var	angle = H * Math.PI / 180,
					radius = S * this.radius / 100,
					top  = this.radius - radius * Math.cos(angle),
					left = this.radius + radius * Math.sin(angle);
			} else { //if(this.type == 1)
				var top  = this.boxHeight - S * this.boxHeight / 100,
					left = H * this.boxHeight / (this.modify ? 360 : 100);
			}
			this.e.crBoxSel.setStyles({top:top, left:left});
		}
		if (step){ 
			var hsv = this.modify
				? [H,S,this.val]
				: [this.val * 3.59,S,H];// that order should only be if modify is true
				//console.log('hsv',hsv)
			//hsv[this.modify ? 'push' : 'unshift'](); // that 3.59 should only be if modify is true
			//console.log(hsv)
			this.setRGB(hsv.toRgb(this.space));
		}
	},
	setV: function(val,step){
		var els = this.e;
		//console.log('setvV - val',val)
		// Set Opacity if slider is greyscale. 
		if (this.modify){
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
		if (step != 1) els['crI'+this.modify].set('value', Math.round(V||val));
		if (step) this.setRGB(this.getValues([0,'S',1]).toRgb(this.space));
	}, 
	
	// Utilities
	getValues:function(val){
		var self = this;		
		return val.map(function(el){ return self.e['crI'+el].get('value') });
	},
	setValues: function(key,val){
		var self = this;
		//console.log('val',val)
		val.each(function(v,i){ self.e['crI'+key[i]].set('value',Math.round(v)) });
	},
	setSpace: function(e){
		this.space = e ? e.target.value : 'G';
		this.e.cr1.set('text',this.space);
		this.options.setspace == 'rgb' 
			? this.inputRGB()
			: (this.setV(this.getValues(['V'])[0]) && this.inputHS());
	},
	setType: function(e){
		var type = this.type = e ? e.target.value : 0,
			img = ['wheel','paint','gimp','adobe'];
		this.modify = +(type < 2);
		this.e.crShade.set('src',!type ? 'images/border.png' : '');
		this.e.crImg.set('src','images/'+img[type]+'.png');
		this.e.crBox.setStyle('background-color','');
		this.inputRGB();
	},
	show: function(){
		this.e.crColorRoller.removeClass('crHide');
		this.offset = {
			y: this.e.crBox.getPosition().y,
			x: this.e.crBox.getPosition().x
		};
		
	}

});
/*
//todo
1. Add support for other browsers
2. Add support for Adobe typ color picker.
3. Allow for smaller color wheel, with just a wheel.
*/
