var ColorRoller = new Class({
	options: {
	
	},
	
	initialize: function(element,options){	
		 this.build().setStyles({'height':22, 'vertical-align':'top'}).injectAfter(element);
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
		['ColorRoller','Head','Box','BoxSel','BoxSee','Bar','BarSel','Nums','Val','Shade'].each(
			function(v){
				e['cr'+v] = new Element('div',{'class':'cr'+v});
			});
		$each({R:'updateRGB',G:'updateRGB',B:'updateRGB',H:'setBox',S:'setBox',V:'setBar',Hex:'setHex'},
			function(v,k){
				e['cr' +k] = new Element('span',{'text':k,'class':'cr'+k});
				e['crI'+k] = new Element('input',{'type':'text','class':'crI'+k});
				if (v) e['crI'+k].addEvent('keyup',self[v].bind(self)); // is the if(v) check needed?
			});
		
		e.crColorRoller.adopt(
			e.crHead,
			e.crBox.adopt(
				e.crImg.set('src','images/Transp.png'),//Color-Wheel.png
				e.crShade,
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
		this.setSpace();
		
		els.crShade.addEvent('mousedown',this.click.bind(self));		
		this.BoxSel = new Drag(els.crBoxSel, {
			snap: 0,
			onDrag: self.updateBox.bind(self)
		});
		this.BarSel = new Drag(els.crBarSel, {
			snap: 0,
			limit: {x:[-1,-1],y:[0,self.barHeight]},
			onDrag: self.updateBar.bind(self)
		});
		els.crSpace.addEvent('change',this.setSpace.bind(this));
		els.crShow.addEvent('click',this.show.bind(this));
	},
	setBG: function(val){
		var v = Math.round(val * 2.55), 
			grey = v+','+v+','+v, 
			shape = 'radial', 
			space = this.space;
		val = space == 'B' ? val / 100 : 
			space == 'L' ? 1 - Math.abs(val / 50 - 1) : 1;
		this.e.crImg.setStyle('opacity',val);
		this.e.crBox.setStyle('background-color', 'rgb('+grey+')'); 
	},
	updateBar: function(){
		var val = this.val = 100 - this.e.crBarSel.getStyle('top').slice(0,-2) / this.barHeight * 100;// was e.crBarSel.getPosition(e.crBar).y 
		this.e.crIV.set('value',Math.round(val));
		this.setBG(val);
		this.updateBox();
	},
	setBar: function(set){
		var val = this.val = this.e.crIV.get('value');
		this.e.crBarSel.setStyle('top',100-val+'%');
		this.setBG(val);
		if(set)this.updateBox();
	},
	click:function(event){
		this.e.crBoxSel.setPosition({
			y:event.page.y-this.e.crBox.getPosition().y,
			x:event.page.x-this.e.crBox.getPosition().x,
		});
		this.BoxSel.start(event);
		this.updateBox();
	},
	setHex: function(e){
		this.updateRGB(e.target.get('value'));
		
		//this.e.crIHex.
	},
	updateBox: function(){
		var e = this.e;	//needs acces to e, radius, g.Since stored on object for now, needs to maintain this.
		var pos = e.crBoxSel.getPosition(e.crBox), // can this be done cheaper using getStyle?
			x = pos.x - this.radius,
			y = this.radius - pos.y,
			h = Math.atan2(x,y) * 180 / Math.PI,
			s = Math.sqrt(x*x+y*y) * 100 / this.radius;
			
		if (s > 99) return this.BoxSel.stop(); 
		if (h < 0) h -= -360;
		this.updateNums(h,s);
	},
	setBox:function(set){
		var hue = this.e.crIH.get('value'),
			sat = this.e.crIS.get('value'),
			radius = sat * this.radius / 100,
			angle = hue * Math.PI / 180;
		
		this.e.crBoxSel.setStyles({
			top :this.radius - radius * Math.cos(angle) ,
			left:this.radius + radius * Math.sin(angle) 
		});
		if(set) this.updateNums(hue,sat)
	},
	updateNums: function(hue,sat){
		var rgb = [hue,sat,this.val].toRgb('hs'+this.space), e = this.e;
		$each(
			{R:rgb[0],G:rgb[1],B:rgb[2],H:Math.round(hue),S:Math.round(sat)},
			function(v,k){ e['crI'+k].set('value',v) }
		);
		
		e.crIHex.set('value',rgb.rgbToHex().toUpperCase());
		e.crView.setStyle('background-color','rgb('+rgb+')');
	},
	updateRGB:function(color){
		var e = this.e,
			rgb = $type(color) != 'event'
				? color.hexToRgb()
				: [
					e.crIR.get('value'),
					e.crIG.get('value'),
					e.crIB.get('value')
				],
			hsg = rgb.fromRgb('hs'+this.space);
		$each(
			{H:hsg[0],S:hsg[1],V:hsg[2]},
			function(v,k){ e['crI'+k].set('value',v) }
		);
		if(!color)e.crIHex.set('value',rgb.rgbToHex().toUpperCase());
		e.crView.setStyle('background-color','rgb('+rgb+')');
		this.setBar(false);
		this.setBox(false);
	},
	setSpace: function(e){
		this.space = e ? e.target.value : 'G';
		this.e.crV.set('text',this.space);
		this.updateBar();
	},
	
	show: function(){
		this.e.crColorRoller.removeClass('crHide');
	},

	
	boxCoords: function(){
		var e = this.e;	//needs acces to e, radius, g.Since stored on object for now, needs to maintain this.
		var pos = e.crBoxSel.getPosition(e.crBox), // can this be done cheaper using getStyle?
			x = pos.x - this.radius,
			y = this.radius - pos.y;
		if(circle){
			h = Math.atan2(x,y) * 180 / Math.PI,
			s = Math.sqrt(x*x+y*y) * 100 / this.radius;
			if (s > 99) return this.BoxSel.stop(); 
			if (h < 0) h -= -360;
		} else{
			h = x; 
			s = y;
		}	
		
		this.updateNums(h,s);
		
		//update the gradient.
	}
	

});
/*
//todo
1. Add support for other browsers
2. Add support for other shapes besides sphere.
3. Allow for smaller color wheel, with just a wheel.
4. Allow for hex to be manually updated.
*/
