//// CONFIG

device = {
	finger1: false,
	finger2: false,
	rotate: {
		initial: 0, // initial rotation
		prev: 0, // previous rotation
		next: 0, // new rotation
		delta: 0  // 
	},
	pinch: {
		initial: 0, // initial distance
		final: 0, // final distance
		delta: 0 // difference between the two
	},
	page: {
		orientation: false
	},
	is: "unknown",
	orientation: false
}

// Nice-looking custom events
event = {
	// Some code I snarfed from here and modified : http://bit.ly/6s0rhu
	fire: function(eventName, target) {
		var e = document.createEvent("Events");
		e.initEvent(eventName, true, true);
		target.dispatchEvent(e);
	},
	listen: function(eventName, functionToCall) {
		window.addEventListener( eventName, functionToCall, false);
	}
}

x$(window).load(function(e){
	if( navigator.userAgent.match(/iPhone/i) )
		device.is = "iphone";
	else
	if( navigator.userAgent.match(/iPod/i) )
		device.is = "ipod";
	else
		device.is = "computer";

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
	}
	updateOrientation();
	x$(window).orientationchange(updateOrientation);

	// The Magic
	x$(document)
	.touchstart( function(t){
//		t.preventDefault();
		if( t.touches.length == 1 ){
			device.finger1 = t.touches[0];
		} else
		if( t.touches.length == 2 ){
			device.finger1 = t.touches[0];
			device.finger2 = t.touches[1];

			var diffX = device.finger2.pageX-device.finger1.pageX;
			var diffY = device.finger2.pageY-device.finger1.pageY;

			device.rotate.prev = device.rotate.next;
			device.rotate.initial = Math.floor( (Math.atan2(diffX,diffY)/(2*Math.PI))*360 ) + 180;
			device.pinch.initial = Math.floor( Math.sqrt( diffX*diffX + diffY*diffY ) );

			device.touching = true;
		}
	})
	.touchmove(function(t){
//		t.preventDefault();
		if( t.touches.length == 1 ){ // One finger
			device.finger1 = t.touches[0];
			//// Swipe detection
			
		} else
		if( t.touches.length == 2 ){
			device.finger1 = t.touches[0]; // Finger 1
			device.finger2 = t.touches[1]; // Finger 2

			var diffX = device.finger2.pageX - device.finger1.pageX;
			var diffY = device.finger2.pageY - device.finger1.pageY;

			//// Rotation detection
			device.rotate.delta = device.rotate.initial - Math.floor( ( Math.atan2(diffX,diffY)/Math.PI ) * 180 ) + 180;

			// The total amount of rotation applied to the object, based on the initial rotate.
			device.rotate.next = (device.rotate.prev + device.rotate.delta + 360) % 360;

			event.fire("onRotate", document);
			
			//// Pinch detection
			device.pinch.delta = device.pinch.final; // Grab the old distance between two fingers
			device.pinch.final = Math.floor( Math.sqrt( diffX*diffX + diffY*diffY ) );
			
			if( device.pinch.delta == device.pinch.final ) {
				// Do nothing
			} else if( device.pinch.delta > device.pinch.final ) {
				event.fire("pinchZoomOut", document);
			} else if( device.pinch.delta < device.pinch.final ) {
				event.fire("pinchZoomIn", document);
			}
		}
	})
	.touchend(function(){
		device.touching = false;
		device.finger1 = false;
		device.finger2 = false;
	});
});

function rotateSquare() {
	x$("#square").setStyle("-webkit-transform","rotate("+device.rotate.next+"deg)");
}

function squareEmbiggen() {
	var square = x$("#square");
	var h = parseInt( square.getStyle("height") );
	var w = parseInt( square.getStyle("width") );
	h+=3;
	w+=3;
	if( h > 250 )
		h = 250;
	if( w > 250 )
		w = 250;
	square.css({height:h+"px",width:w+"px"});
}

function squareShrink() {
	var h = parseInt( square.getStyle("height") );
	var w = parseInt( square.getStyle("width") );
	h-=5;
	w-=5;
	if( h < 10 )
		h = 10;
	if( w < 10 )
		w = 10;
	square.css({height:h+"px",width:w+"px"});
}

event.listen("onRotate", rotateSquare);
//event.listen("pinchZoomIn", squareEmbiggen);
//event.listen("pinchZoomOut", squareShrink);