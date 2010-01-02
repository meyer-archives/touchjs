var log = {
	add: function(msg){
		x$("#content-inner ul").html("top",msg+"");
	},
	reset: function(){
		x$("#content-inner ul").html("");
	}
}

var device = {
	touch: [],
	// Read-only meta info
	type: false,
	orientation: false,
	rotating: false,
	pinching: false,
	swiping: false,
	touching: false
}

// Nice-looking custom events
var event = {
	// Some code I snarfed from here and modified : http://bit.ly/6s0rhu
	fire: function(eventName,payload) {
		var e = document.createEvent("Events");
		e.data = payload;
		e.initEvent(eventName, true, true);
		document.dispatchEvent(e);
	},
	listen: function(eventName, functionToCall) {
		window.addEventListener( eventName, functionToCall, false);
	}
}

function swipeDirection( angle ){
	if( angle > 22.5 && angle < 67.5 ){ // 45
		return "up-left";
	} else
	if( angle > 67.5 && angle < 112.5 ){ // 90
		return "left";
	} else
	if( angle > 112.5 && angle < 157.5 ){ // 135
		return "down-left";
	} else
	if( angle > 157.5 && angle < 202.5 ){ // 180
		return "down";
	} else
	if( angle > 202.5 && angle < 247.5 ){ // 225
		return "down-right";
	} else
	if( angle > 247.5 && angle < 292.5 ){ // 270
		return "right";
	} else
	if( angle > 292.5 && angle < 337.5 ){ // 315
		return "up-right";
	} else
	if( angle > 337.5 || angle < 22.5 ){ // 360
		return "up";
	} else {
		return false;
	}
}

// Basic "finger" class
function Finger(touchObject){
	// Empty arrays
	this.x = [];
	this.y = [];
	this.angle = [];
	this.id = touchObject.identifier;
	this.totalDistance = 0,
	this.toString = function(){
		return "[Finger Object:"+this.id+"]";
	}

	var initX = touchObject.pageX;
	var initY = touchObject.pageY;


	this.addPoint = function(){
		var prevX, prevY;

		if( this.angle.length == 0 ){
			prevX = initX;
			prevY = initY;
		} else {
			prevX = this.x[this.x.length-1];
			prevY = this.y[this.y.length-1];
		}

		var newX = touchObject.pageX;
		var newY = touchObject.pageY;

		var diffX = prevX-newX;
		var diffY = prevY-newY;

		var delta = Math.round( Math.sqrt( diffX*diffX + diffY*diffY ) );

		if( delta > 2 ){
			this.totalDistance += delta;

			var angle = (360 - (Math.floor( ( Math.atan2(diffX,diffY)/Math.PI ) * 180 ))) % 360;

			var a = {
				sum: 0,
				max: Math.max.apply( Math, this.angle ),
				min: Math.min.apply( Math, this.angle ),
				avg: 0,
				angle: angle,
				distance: this.totalDistance,
				direction: false
			}

			// Record a new point
			this.x.push(newX);
			this.y.push(newY);
			this.angle.push(angle);

			for(q = 0; q < this.angle.length; q++){
				if(
					a.max > 270 &&
					a.min < 90 &&
					this.angle[q] > 180
				) // Swiping up-ish
					this.angle[q] -= 360;
				a.sum += this.angle[q];
			}
			a.avg = a.sum/this.angle.length;
			a.direction = swipeDirection(a.avg);
			if(
				Math.abs(a.avg-a.min) < 25 &&
				Math.abs(a.avg-a.max) < 25
			){
				event.fire("swipeGesture",a);
			}

			// Debug
			var point = document.createElement('div');
			x$(point)
				.addClass("point")
				.addClass("id"+touchObject.identifier)
				.css({
					top:newY+"px",
					left:newX+"px",
					position:"absolute"
				})
				.setStyle("-webkit-transform","rotate("+angle+"deg)")
				.html("<span>"+touchObject.identifier+"</span>");
			x$("body").html( "after", point );
		} else {
			return false;
		}
	}
}

// Detect orientation
function updateOrientation(){
	switch( window.orientation ){
		case 0:
			x$("body").removeClass("landscape").addClass("portrait");
			device.orientation = "portrait";
		break;
		case 90: // Home button is on the right
		case -90: // Home button is on the left
			x$("body").addClass("landscape").removeClass("portrait");
			device.orientation = "landscape";
		break;
		case 180:
			// What a goofy browser you must be using.
		break;
	}
	if( window.navigator.standalone ){ // Launched from the home screen
		setTimeout(function() { window.scrollTo(0, 0) }, 100); // Scroll to top
	} else {
		setTimeout(function() { window.scrollTo(0, 1) }, 100); // Scroll past the address bar & debug menu
	}
}

x$(window).load(function(e){
	// TODO: Android support (?)
	if( navigator.userAgent.match(/iPhone/i) ){
		device.type = "iphone";
	} else if( navigator.userAgent.match(/iPod/i) ){
		device.type = "ipod";
	} else {
		device.type = "unknown"; // Desktop computer or other browser/device
	}
	
	if( window.navigator.standalone )
		x$("body").addClass("standalone");

	updateOrientation();
	x$(window).orientationchange(updateOrientation);

	// The Magic
	x$(document)
	.touchstart( function(e){
		e.preventDefault();
		if( e.touches.length == 1 )
			log.reset();
		for( i in e.changedTouches){
			var t = e.changedTouches[i];
			if( typeof(t.identifier) != "undefined" ){
				device.touch[t.identifier] = new Finger(t);
			}
		}
	})
	.touchmove(function(e){
		e.preventDefault();
		for( i in device.touch )
			device.touch[i].addPoint();
	})
	.touchend(function(e){
		for( i in e.changedTouches ){
			var t = e.changedTouches[i];
			if( typeof(t.identifier) != "undefined" ){
				x$(".point.id"+t.identifier).remove();
				device.touch.splice(t.identifier, 1);
			}
		}
		if( e.touches.length == 0 ){
//			device.touch = [];
		}
	})
	// 2-finger gestures
	.gesturestart(function(e){
	})
	.gesturechange(function(e){
	})
	.gestureend(function(e){
	})
});

event.listen("swipeGesture",function(e){
	x$("#content").html("<p>Direction: "+e.data.direction+"</p><p>Distance: "+e.data.distance+"px</p><p>Angle: "+e.data.angle+"deg</p><p>Average: "+e.data.avg+"deg</p>");
});