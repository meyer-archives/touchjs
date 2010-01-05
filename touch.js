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
	// Empty arrays
	this.x = [];
	this.y = [];
	this.id = touchObject.identifier; // this may come in handy
	this.distanceTotal = 0;

	// Angle Data
	this.angle = [];
//	this.angleMax = 0;		// Maximum angle between prevX/Y and newX/Y
//	this.angleMin = 0;		// Minimum angle between prevX/Y and newX/Y
	this.angleFinal = 0;	// Compare to angleAvg
//	this.angleAvg = 0;
//	var angleTotal = 0;		// Used for the average angle

	// Number of pixels between points
	var pointPrecision = 10;

	// Used for the first angleDelta
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

		if( delta > pointPrecision ){
			this.distanceTotal += delta;

			var angleDelta = (360 - ( Math.atan2(diffX,diffY)/Math.PI * 180 )) % 360;

			// Record a new point
			this.x.push(newX);
			this.y.push(newY);
			this.angle.push(angleDelta);

			this.angleFinal = (360 - ( Math.atan2(initX-newX,initY-newY)/Math.PI ) * 180 ) % 360;

			return true;
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
			if( touch.addPoint() ){
				event.fire("swipeMove");
			}
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

event.listen("swipeEnd",function(e){
	x$(".point").remove();
});

event.listen("swipeMove",function(e){
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

	var point = document.createElement('div');
	x$(point)
		.addClass("point")
		.css({
			top:touch.y[touch.y.length-1]+"px",
			left:touch.x[touch.x.length-1]+"px",
			position:"absolute"
		})
		.setStyle("-webkit-transform","rotate("+touch.angle[touch.angle.length-1]+"deg)")
		.html("<span>"+touch.angle[touch.angle.length-1].toFixed(2)+"</span>");

	x$("body").html( "after", point );

});