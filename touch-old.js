/************************************************

	TOUCH.JS

	This hotness brought to you by:

	Michael Meyer
	mikemeyer@gmail.com
	twitter.com/mikemeyer

	Steal it, improve it, then let me know.

************************************************/

var touch;
var swiping = false;

var device = {
	// Read-only meta info
	type: false,
	orientation: false,
}

var event = {
	// Some code I snarfed from here and modified : http://bit.ly/6s0rhu
	fire: function(eventName,payload) {
		var e = document.createEvent("Events");
		e.initEvent(eventName, true, true);
		document.dispatchEvent(e);
	},
	listen: function(eventName, functionToCall) {
		window.addEventListener( eventName, functionToCall, false);
	}
}

// Number crunching for single-finger swipes
function Touch(touchObject){
	// Initial X & Y
	this.x1 = touchObject.pageX;
	this.y1 = touchObject.pageY;

	// Final X & Y
	this.x2 = this.x1;
	this.y2 = this.y1;

	this.dx = 0;
	this.dy = 0;

	this.id = touchObject.identifier; // this may come in handy

	this.update = function(){
		this.x2 = touchObject.pageX;
		this.y2 = touchObject.pageY;
		this.dx = this.x2 - this.x1;
		this.dy = this.y2 - this.y1;
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
		if( e.touches.length == 1 ){
			// Aw, that's touching. Ba dum, tsh.
			touch = new Touch(e.touches[0]);
			event.fire("swipeStart");
		}
	})
	.touchmove(function(e){
		e.preventDefault();
		// Gesture events take over from here
		if( e.touches.length > 1 ){
			event.fire("swipeEnd");
			touch = false;
		}

		if( touch ){ // if we started with one finger
			touch.update();
			event.fire("swipeMove");
		}
	})
	.touchend(function(e){
		if( touch ){
			event.fire("swipeEnd");
			touch = false;
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

function debug(){
	var debugHTML = [];
	for( i in this.touch ){
		switch( typeof(this.touch[i]) ){
			case "function":
				debugHTML.push( "function: " + i + "();" );
			break;
			case "object": // probably an array
				debugHTML.push( i + ": " + this.touch[i][this.touch[i].length-1] );
			break;
			case "number":
				debugHTML.push( i + ": " + this.touch[i].toFixed(2) );
			break;
			default:
				debugHTML.push( i + ": " + this.touch[i] );
			break;
		}
	}
	x$("#content").html((debugHTML.join("<br>"))+"");
}

//event.listen("swipeStart",debug);
//event.listen("swipeMove",debug);
//event.listen("swipeEnd",function(e){x$(".point").remove();});