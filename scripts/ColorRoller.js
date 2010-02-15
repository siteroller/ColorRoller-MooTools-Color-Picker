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
			{Space:'select',Type:'select',Img:'img',Show:'img',View:'span'},
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
				e.crBoxSel.adopt(e.crBoxSee)
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
		this.radius = els.crBox.getSize().x / 2;
		
		this.BoxSel = new Drag(els.crBoxSel, {
			snap: 0,
			onDrag: self.picker.bind(self)
		});
		this.BarSel = new Drag(els.crBarSel, {
			snap: 0,
			limit: {x:[-1,-1],y:[0,self.barHeight]},
			onDrag: self.slider.bind(self)
		});

		this.setRGB(this.options.RGB,3);
		els.crImg.addEvent('mousedown',this.click.bind(self));
		els.crSpace.addEvent('change',this.setSpace.bind(this)).fireEvent('change');
		els.crShow.addEvent('click',this.show.bind(this));
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
	slider: function(cursor){
		this.setV(100 - cursor.getStyle('top').slice(0,-2) / this.barHeight * 100,2);
		//Was e.crBarSel.getPosition(e.crBar).y or cursor.getPosition(arguments[1].originalTarget).y 
	},
	picker: function(){
		var els = this.e;	//needs acces to e, radius, g.Since stored on object for now, needs to maintain this.
		var pos = els.crBoxSel.getPosition(els.crBox), // can this be done cheaper using getStyle or using the event?
			x = pos.x - this.radius,
			y = this.radius - pos.y,
			h = Math.atan2(x,y) * 180 / Math.PI,
			s = Math.sqrt(x*x+y*y) * 100 / this.radius;
			
		if (s > 99) return this.BoxSel.stop(); 
		if (h < 0) h -= -360;
		this.setHS(h,s,2);
	},
	
	// Set Values
	setHS: function(H,S,step){
		//Steps: #1 - Set inputs. #2 - Set Picker Position. #0 - Set RGB
		if (step != 1) this.setValues({H:H,S:S});
		if (step != 2){
			var	radius = S * this.radius / 100,
				angle = H * Math.PI / 180;
			this.e.crBoxSel.setStyles({
				top :this.radius - radius * Math.cos(angle) ,
				left:this.radius + radius * Math.sin(angle) 
			});
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
		if (step != 2) els.crBarSel.setStyle('top',100-val+'%');
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
	setValues: function(val){
		var self = this;
		$each(val, function(v,k){ self.e['crI'+k].set('value',v) });
	},
	getValues:function(val){
		var self = this;		
		return val.map(function(el){ return self.e['crI'+el].get('value') });
	},
	
	click:function(event){
		this.e.crBoxSel.setPosition({
			y:event.page.y-this.e.crBox.getPosition().y,
			x:event.page.x-this.e.crBox.getPosition().x,
		});
		this.BoxSel.start(event);
		this.updateBox();
	},
	setSpace: function(e){
		this.space = e.target.value;
		this.e.crV.set('text',this.space);
		this.options.setspace == 'rgb' 
			? this.inputRGB(this.getValues(['R','G','B']))
			: (this.inputHS(this.getValues(['H','S'])) && this.inputV(['V']));
	},
	setPicker: function(shape){
		this.shape = shape ? 'linear' : 'radial';
		this.control = '';
	},
	show: function(){
		this.e.crColorRoller.removeClass('crHide');
	}

});
/*
//todo
1. Add support for other browsers
2. Add support for other shapes besides sphere.
3. Allow for smaller color wheel, with just a wheel.
4. Allow for hex to be manually updated.
*/
