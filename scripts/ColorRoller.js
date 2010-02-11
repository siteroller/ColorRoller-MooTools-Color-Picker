var ColorRoller = new Class({
	options: {
	
	},
	
	initialize: function(elements,options){
		this.build();
	},
	
	build: function(){
		var i=0,e = this.e = {};

		$each({Space:'select',Type:'select',Img:'img',View:'span'},function(v,k){
			e['cr'+k] = new Element(v,{'class':'cr'+k});
		});
		$each({G:'HSG', B:'HSB/V',L:'HSL/I',CW:'Color - Wheel', CS:'Color - Square',GS:'Grey - Stretched',GL:'Grey - Literal'},function(v,k){
			new Element('option',{'text':v,'class':'crO'+k}).inject(++i>3 ? e.crType : e.crSpace);
		});
		['ColorRoller','Head','Box','BoxSel','BoxSee','Bar','BarSel','Nums','Val'].each(function(v){
			e['cr'+v] = new Element('div',{'class':'cr'+v});
		});
		['R','G','B','H','S','V','Hex'].each(function(v){
			e['cr' +v] = new Element('span',{'text':v,'class':'cr'+v});
			e['crI'+v] = new Element('input',{'type':'text','class':'crI'+v});
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
	},
	
	addEvents: function(){
		var self = this, els = this.e;
		this.barHeight = els.crBar.getSize().y;
		this.radius = els.crBox.getSize().x / 2;
		this.updateBar();
		
		els.crIV.addEvent('keyup',this.setBar.bind(self));	
		els.crIH.addEvent('keyup',this.setBox.bind(self));
		els.crIS.addEvent('keyup',this.setBox.bind(self));
		els.crIR.addEvent('keyup',this.updateRGB.bind(self));
		els.crIG.addEvent('keyup',this.updateRGB.bind(self));
		els.crIB.addEvent('keyup',this.updateRGB.bind(self));
		els.crImg.addEvent('mousedown',this.click.bind(self))		
		this.BoxSel = new Drag(els.crBoxSel, {
			snap: 0,
			onDrag: self.updateBox.bind(self)
		});
		this.BarSel = new Drag(els.crBarSel, {
			snap: 0,
			limit: {x:[-1,-1],y:[0,self.barHeight]},
			onDrag: self.updateBar.bind(self)
		});
		
	},
	setBG: function(val){
		var n = Math.round(val * 2.55).toString(16);
		if (n.length < 2) n = '0' + n;
		this.e.crBox.setStyle('background-color', '#'+n+n+n);
		return n;
	},
	updateBar: function(){
		var val = this.g = 100 - this.e.crBarSel.getStyle('top').slice(0,-2) / this.barHeight * 100;// was e.crBarSel.getPosition(e.crBar).y 
		this.e.crIV.set('value',Math.round(val));
		this.setBG(val);
		this.updateBox();
	},
	setBar: function(set){
		var val = this.g = this.e.crIV.get('value');
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
		var rgb = [hue,sat,this.g].toRgb('hsg'), e = this.e;
		$each(
			{R:rgb[0],G:rgb[1],B:rgb[2],H:Math.round(hue),S:Math.round(sat)},
			function(v,k){ e['crI'+k].set('value',v) }
		);
		
		e.crIHex.set('value',rgb.rgbToHex().toUpperCase());
		e.crView.setStyle('background-color','rgb('+rgb+')');
	},
	updateRGB:function(){
		var e = this.e,
			rgb = [
				e.crIR.get('value'),
				e.crIG.get('value'),
				e.crIB.get('value')
			],
			hsg = rgb.fromRgb('hsg');
		$each(
			{H:hsg[0],S:hsg[1],V:hsg[2]},
			function(v,k){ e['crI'+k].set('value',v) }
		);
		e.crIHex.set('value',rgb.rgbToHex().toUpperCase());
		e.crView.setStyle('background-color','rgb('+rgb+')');
		this.setBar(false);
		this.setBox(false);
	},
	setSpace: function(){
		cS.set('text','B');
	},
	
	show: function(){
		
	}
	

});
/*
//todo
2. Add support for other browsers
3. Add support for all color spaces within the sphere.
4. Add support for other shapes besides sphere.
5. Allow for smaller color wheel, with just a wheel.
6. Allow for rgb to be manually updated.
7. When Hue or saturation is manually updated, the coordinates are 90 degrees turned to the side.
*/