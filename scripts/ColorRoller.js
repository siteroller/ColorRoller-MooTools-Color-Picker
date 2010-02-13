var ColorRoller = new Class({
	options: {
	
	},
	
	initialize: function(elements,options){
		this.build();
	},
	
	build: function(){
		var self = this, i=0, e = this.e = {};

		$each(
			{Space:'select',Type:'select',Img:'img',View:'span'},
			function(v,k){ e['cr'+k] = new Element(v,{'class':'cr'+k}) }
		);
		$each({G:'HSG', B:'HSB/V',L:'HSL/I',CW:'Color - Wheel', CS:'Color - Square',GS:'Grey - Stretched',GL:'Grey - Literal'},
			function(v,k){
				new Element('option',{'text':v,'class':'crO'+k}).inject(++i>3 ? e.crType : e.crSpace);
			});
		['ColorRoller','Head','Box','BoxSel','BoxSee','Bar','BarSel','Nums','Val','Shade'].each(
			function(v){
				e['cr'+v] = new Element('div',{'class':'cr'+v});
			});
		$each({R:'updateRGB',G:'updateRGB',B:'updateRGB',H:'setBox',S:'setBox',V:'setBar',Hex:''},
			function(v,k){
				e['cr' +k] = new Element('span',{'text':k,'class':'cr'+k});
				e['crI'+k] = new Element('input',{'type':'text','class':'crI'+k});
				if (v) e['crI'+k].addEvent('keyup',self[v].bind(self)); // is the if(v) check needed?
			});
		
		e.crColorRoller.adopt(
			e.crHead,
			e.crBox.adopt(
				e.crImg.set('src','images/Color-Wheel.png'),//Transp.png
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
	},
	
	addEvents: function(){
		var self = this, els = this.e;
		
		this.barHeight = els.crBar.getSize().y;
		this.radius = els.crBox.getSize().x / 2;
		this.updateBar();
		
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
		
	},
	setBG:function(val){
		var v = Math.round(val * 2.55), grey = v+','+v+','+v, shape = 'radial';
		
		if (Browser.Engine.gecko && window.hasOwnProperty("onhashchange"))
			this.e.crShade.setStyle('background-image','-moz-'+shape+'-gradient(center center, circle closest-side, rgb('+grey+') '+(100-(this.val||1))+'%,  rgba('+grey+',0)100%)');//rgb('+grey+'),
		else if (Browser.Engine.trident && shape == 'linear')
			this.e.crShade.setStyle(
				Browser.Engine.version < 4 ? 'filter':'-ms-filter',
				'progid:DXImageTransform.Microsoft.Gradient(GradientType=0, StartColorStr="#FF'+000000+'", EndColorStr="#00'+000000+'")'
			);
		else if (Browser.Engine.webkit)
			this.e.crShade.setStyle('background','-webkit-gradient('+shape+', center center, 0, center center, '+70.5+', from(rgb('+grey+')), to(rgba('+grey+',0))');
		else this.e.crBox.setStyle('background-color', 'rgb('+grey+')');
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
		var rgb = [hue,sat,this.val].toRgb('hsg'), e = this.e;
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
	setSpace: function(event){
		// Change the background and foreground image.
		//e[].replaces(crImg);
		cS.set('text','B');
	},
	
	show: function(){
	
	},
	shading: function(){
		var bgs = "background-image: -moz-radial-gradient(rgba(255,255,255,1), rgba(255,255,255,0)),\
		-webkit-gradient(radial, center center, 0, center center, 70.5, from(green), to(yellow))";
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
2. Add support for other browsers
3. Add support for all color spaces within the sphere.
4. Add support for other shapes besides sphere.
5. Allow for smaller color wheel, with just a wheel.
6. Allow for rgb to be manually updated.
7. When Hue or saturation is manually updated, the coordinates are 90 degrees turned to the side.
*/
/*
Notes:
#1:
Zero degrees on the sphere is assumed to be at the the 12:00 position.  
This differs from classic trig, which assumes zero to be at 3:00.
To switch to classic, make the following changes:
In updateBox: 
	h = Math.atan2(y,x) * 180 / Math.PI,
In setBox:
	left :this.radius + radius * Math.cos(angle) ,
	top  :this.radius + radius * Math.sin(angle) 

#2:
Full support in Firefox 3.6, and webkit.
Support for linear in trident.
Fallback hsg support for Opera, Trident/radial, FF 3.5, other browsers.
Regarding IE support:
	a. Overview of filters: 
		http://msdn.microsoft.com/en-us/library/ms532853%28VS.85%29.aspx
		http://www.ssi-developer.net/css/visual-filters.shtml
	b. The gradient filter does not support a start [or end] point, and cannot do radial.
		http://msdn.microsoft.com/en-us/library/ms532997%28VS.85%29.aspx
	c. The light filter may well be able to do a controlled radial gradient, though I failed to create one.
		It allows for any numbers of points, cones or ambiences.
		http://msdn.microsoft.com/en-us/library/ms533011%28VS.85%29.aspx
		http://www.javascriptkit.com/filters/light.shtml
	d. The alpha linear filter supports start [and end] points.
		[It also allows for angle gradients. The gradient is applied to the whole element, not just the background.]  
		The radial filter does not support start points [though it does support endpoints]
		http://msdn.microsoft.com/en-us/library/ms532967%28VS.85%29.aspx
		http://www.javascriptkit.com/filters/alpha.shtml
	e. [Other useful filters are Composite, which allows for elements to be combined. and BasicImage: Rotation, opacity, greyscale, mirror, xray, etc. 
*/