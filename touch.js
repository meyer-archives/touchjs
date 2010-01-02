Array.prototype.max = function(){
    return Math.max.apply( this );
}
Array.prototype.min = function(){
    return Math.min.apply( this );
}

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
	fire: function(eventName) {
		var e = document.createEvent("Events");
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
	this.angle = []; // first angle can't be set, silly
	this.id = touchObject.identifier;

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

		if( delta > 10 ){

			var angle = (360 - (Math.floor( ( Math.atan2(diffX,diffY)/Math.PI ) * 180 ))) % 360;

			// Record a new point
			this.x.push(newX);
			this.y.push(newY);
			this.angle.push(angle);

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
				.html("<span>"+angle+"</span>");
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
		log.reset();
		for( i in e.changedTouches){
			var t = e.changedTouches[i];
			if( typeof(t.identifier) != "undefined" ){
				device.touch[t.identifier] = new Finger(t);
				log.add("Creating new object: "+t.identifier);
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
			var id = e.changedTouches[i].identifier;
			if( typeof(id) != "undefined" ){
				x$(".point.id"+id).remove();
				device.touch.splice(id, 1);
				log.add("Destroying object: "+id);
			}
		}
		if( e.touches.length == 0 ){
			// Destroy everything!!!
			device.touch = [];
		}
	});
});

// Extra
/*

// touchstart
device.rotate.initial = Math.round( (Math.atan2(diffX,diffY)/(2*Math.PI))*360 ) + 180;
device.pinch.initial =  Math.round( Math.sqrt( diffX*diffX + diffY*diffY ) );

// touchmove
device.rotate.delta = device.rotate.initial - ((Math.floor( ( Math.atan2(diffX,diffY)/Math.PI ) * 180 ) + 180) % 360);
device.rotate.final = (device.rotate.prev + device.rotate.delta + 360) % 360;
device.pinch.final = Math.floor( Math.sqrt( diffX*diffX + diffY*diffY ) );
device.pinch.delta = device.pinch.final - device.pinch.initial;
device.pinch.angle = device.rotate.initial;

if( device.swipe.angle > 35 && device.swipe.angle < 55 ){ // 45
	device.swipe.direction = "up-left";
} else
if( device.swipe.angle > 80 && device.swipe.angle < 100 ){ // 90
	device.swipe.direction = "left";
} else
if( device.swipe.angle > 125 && device.swipe.angle < 145 ){ // 135
	device.swipe.direction = "down-left";
} else
if( device.swipe.angle > 170 && device.swipe.angle < 190 ){ // 180
	device.swipe.direction = "down";
} else
if( device.swipe.angle > 215 && device.swipe.angle < 235 ){ // 225
	device.swipe.direction = "down-right";
} else
if( device.swipe.angle > 260 && device.swipe.angle < 280 ){ // 270
	device.swipe.direction = "right";
} else
if( device.swipe.angle > 305 && device.swipe.angle < 325 ){ // 315
	device.swipe.direction = "up-right";
} else
if( device.swipe.angle > 350 || device.swipe.angle < 10 ){ // 360
	device.swipe.direction = "up";
}

*/