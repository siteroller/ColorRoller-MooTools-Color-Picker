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
	setBar: function(){
		var val = this.g = this.e.crIV.get('value');
		this.e.crBarSel.setStyle('top',100-val+'%');
		this.setBG(val);
		this.updateBox();
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
			
		if (h < 0) h -= -360;
		var rgb = [h,s,this.g].toRgb('hsg');
	
		$each(
			{R:rgb[0],G:rgb[1],B:rgb[2],H:Math.round(h),S:Math.round(s)},
			function(v,k){ e['crI'+k].set('value',v) }
		)
		e.crIHex.set('value',rgb.rgbToHex());
		e.crView.setStyle('background-color','rgb('+rgb+')');
	},
	setBox:function(){
		
		var hypotenuse = this.e.crIS.get('value') * 100 / this.radius;
		var h = this.e.crIH.get('value');
		switch(h){
			case h < 90 : break;
			//case h < 180: h = 180 - h; break;
			//case h < 270: h = 270 - h; break;
			//case h < 360: h = 360 - h; break;
		}
		console.log(hypotenuse,h);
		var opposite = Math.sin(h) * hypotenuse;
		console.log(opposite)
		var adjacent = Math.cos(h) * hypotenuse;
		console.log(hypotenuse,opposite,adjacent);
		console.log(this.e.crBoxSel.getPosition(this.e.crBox));
		/*
		h = Math.atan2(pos.x - this.radius,this.radius - pos.y) / Math.PI * 180,
		hypotenuse = s * this.radius / 100;
		
		sin(a) = opposite / hypotenuse 
		opposite = sin(h) * hypotenuse;
		
		if h = (Math.Atan2(x,y)) * 180 / Math.PI
		x = ?
		y = ?
		x = s*sin(h*Math.PI/180);
		y = s*cos(h*Math.PI/180);
		
		(distance*sin(Angle*Math.PI/180))+Pb.Lat = Pa.Lat
(distance*cos(Angle*Math.PI/180))/Math.Cos(Pb.Lat*Math.PI/180)+Pb.Lng = Pa.Lng
		*/
		
	},
	setSpace: function(){
		cS.set('text','B');
	},
	
	show: function(){
		
	}
	

});
/*
//todo
1. Stop the cursor when it goes out of bounds.
2. Add support for other browsers
3. Add support for all color spaces within the sphere.
4. Add support for other shapes besides sphere.
5. Allow for smaller color wheel, with just a wheel.
*/