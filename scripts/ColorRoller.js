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
		$each({G:'HSG', B:'HSB/V',L:'HSL/I',CW:'Color - Wheel', CS:'Color - Square',GS:'Grey - Stretched',GL:'Grey - Literal'},
			function(v,k){
				new Element('option',{'value':k,'text':v,'class':'crO'+k}).inject(++i>3 ? e.crType : e.crSpace);
			});
		['ColorRoller','Head','Box','BoxSel','BoxSee','Bar','BarSel','Nums','Val'].each(
			function(v){
				e['cr'+v] = new Element('div',{'class':'cr'+v});
			});
		$each({R:'inputRGB',G:'inputRGB',B:'inputRGB',H:'inputHS',S:'inputHS',V:'inputV',Hex:'inputRGBHex'},
			function(v,k){
				e['cr' +k] = new Element('span',{'text':k,'class':'cr'+k});
				e['crI'+k] = new Element('input',{'type':'text','class':'crI'+k});
				if (v) e['crI'+k].addEvent('keyup',self[v].bind(self)); // is the if(v) check needed?
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
					e.crR,e.crIR,e.crG,e.crIG,e.crB,e.crIB,e.crH,e.crIH,e.crS,e.crIS,e.crV,e.crIV
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
		this.setRGB(event.target.value.hexToRgb(),2);
	},
	inputV: function(event){
		this.setV(event.target.value,1);
	},
	inputHS: function(){
		var v = this.getValues(['H','S']);
		this.setHS(v[0],v[1],1);
	},
	slider: function(event){
		var val = 100 - 100 * (event.page.y - this.offset.y) / this.barHeight
		if(this.mousedown && (val > -1) && (val < 101))this.setV(val, 2);
	},
	picker: function(event){
		if (!this.mousedown) return;
		var els = this.e, H, S,
			X = event.page.x - this.offset.x,
			Y = event.page.y - this.offset.y;
		
		if (this.shape == 'CW'){
			var O = X - this.radius,
				A = this.radius - Y;
			H = Math.atan2(O,A) * 180 / Math.PI;
			S = Math.sqrt(O*O+A*A) * 100 / this.radius;
			if (S > 100) return;
			if (H < 0) H -= -360;
		} else {
			S = 100 - Y * 100 / this.boxHeight; 
			if (this.shape == 'CS') H = X * 360 / this.boxHeight;
			else if (this.shape == '2') H = X * 360 / (this.space == 'G' ? this.boxHeight : Y);
		}
		
		els.crBoxSel.setPosition({
			y:Y, 
			x:X 
		});
		this.setHS(H,S,2);
	},
	
	// Set Values
	setHS: function(H,S,step){
		//Steps: #1 - Set inputs. #2 - Set Picker Position. #0 - Set RGB
		if (step != 1) this.setValues({H:H,S:S});
		if (step != 2){
			if(this.shape == 'CW'){
				var	angle = H * Math.PI / 180,
					radius = S * this.radius / 100,
					top  = this.radius - radius * Math.cos(angle),
					left = this.radius + radius * Math.sin(angle);
			} else if(this.shape == 'CS'){
				var top  = S * this.boxHeight / 100,
					left = H * this.boxHeight / 360 ;
			}
			this.e.crBoxSel.setStyles({top:top, left:left});
		}
		if (step) this.setRGB([H,S,this.val].toRgb(this.space));
	},
	setV: function(val,step){
		//Steps: #1 - Set inputs. #2 - Set Slider. #3 - Set Background Shading. #0 - Set RGB
		this.val = val;
		var els = this.e,
			v = Math.round(val * 2.55), 
			grey = v+','+v+','+v,
			value = this.space == 'B' ? val / 100 : 
				this.space == 'L' ? 1 - Math.abs(val / 50 - 1) : 1;
		els.crImg.setStyle('opacity',value);
		els.crBox.setStyle('background-color', 'rgb('+grey+')'); 
		
		if (step != 1) els.crIV.set('value',Math.round(val));
		els.crBarSel.setStyle('top',100-val+'%');
		if (step){
			var rgb = this.getValues(['H','S']);
			rgb.push(val);
			this.setRGB(rgb.toRgb(this.space));
		}
	}, 
	setRGB: function(val,step){
		//Steps: #1 - Set inputs. #2 - Set Hex. #3 - Set View. #0 - Set HSV
		var e = this.e;
		this.setValues({R:val[0],G:val[1],B:val[2]});
		e.crIHex.set('value',val.rgbToHex().toUpperCase());
		e.crView.setStyle('background-color','rgb('+val+')');
		if (step){
			var hsv = val.fromRgb(this.space); 
			this.setHS(hsv[0],hsv[1]);
			this.setV(hsv[2]);
		}
	},
	
	// Utilities
	getValues:function(val){
		var self = this;		
		return val.map(function(el){ return self.e['crI'+el].get('value') });
	},
	setValues: function(val){
		var self = this;
		$each(val, function(v,k){ self.e['crI'+k].set('value',Math.round(v)) });
	},
	setSpace: function(e){
		this.space = e ? e.target.value : 'G';
		this.e.crV.set('text',this.space);
		this.options.setspace == 'rgb' 
			? this.inputRGB()
			: (this.setV(this.getValues(['V'])[0]) && this.inputHS());
	},
	setType: function(e){
		var shape = this.shape =  e ? e.target.value : 'CW';
		this.e.crShade.set('src',shape == 'CW' ? 'images/border.png' : '');
		if (shape == 'CS') this.e.crImg.set('src','images/rainbow2.png');
		else if(shape == 'CW') this.e.crImg.set('src','images/Transp.png');
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
2. Add support for other shapes besides sphere.
3. Allow for smaller color wheel, with just a wheel.
4. Allow for hex to be manually updated.
*/
