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

		if( this.x.length == 0 ){
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

		var delta = Math.sqrt( diffX*diffX + diffY*diffY );

		if( delta > 10 ){
			this.totalDistance += delta;

//			var angle = (360 - ( Math.atan2(diffX,diffY)/Math.PI * 180 )) % 360;

			// Record a new point
			this.x.push(newX);
			this.y.push(newY);
//			this.angle.push(angle);

			var a = {
				sum: 0,
//				max: this.angle.length > 1 ? Math.max.apply( Math, this.angle ) : this.angle[0],
//				min: this.angle.length > 1 ? Math.min.apply( Math, this.angle ) : this.angle[0],
				x: newX,
				y: newY,
				diffX: diffX,
				diffY: diffY,
//				avg: 0,
//				angle: angle,
				id: touchObject.identifier,
				totalDistance: this.totalDistance,
				totalPoints: this.x.length == this.y.length ? this.x.length : "[error]"
//				finalAngle: (360 - ( Math.atan2(initX-newX,initY-newY)/Math.PI ) * 180 ) % 360
			}
/*
			for(q = 0; q < this.angle.length; q++){
				if(
					a.max > 270 &&
					a.min < 90 &&
					this.angle[q] > 180
				){ // Swiping up-ish
					this.angle[q] -= 360;
				}
				a.sum += this.angle[q];
			}

			a.avg = a.sum/this.angle.length;
*/
			event.fire("swipeGesture",a);
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
				device.touch.splice(t.identifier, 1);
			}
		}
		if( e.touches.length == 0 ){
//			device.touch = [];
		}
		console.log("-----");
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
	var debugHTML = "";
	for( i in e.data ){
		debugHTML = debugHTML + "<p>"+i+": "+e.data[i]+"</p>";
	}
	x$("#content").html(debugHTML+"");
	// Debug
	var point = document.createElement('div');
	x$(point)
		.addClass("point")
		.addClass("id"+e.data.id)
		.css({
			top:e.data.y+"px",
			left:e.data.x+"px",
			position:"absolute"
		})
//		.setStyle("-webkit-transform","rotate("+e.data.angle+"deg)")
		.html("<span>"+e.data.id+"</span>");

	x$("body").html( "after", point );

});