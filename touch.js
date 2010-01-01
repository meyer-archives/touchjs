//// CONFIG

function Finger(){
	// Empty arrays
	this.x = [],
	this.y = []
}

device = {
	finger1: false,
	finger2: false,
	touch: {
		count: 0,
		start: 0,
		duration: 0
	},
	rotate: {
		initial: 0, // initial rotation
		prev: 0, // previous rotation
		final: 0, // new rotation
		delta: 0
	},
	pinch: {
		initial: 0, // initial distance
		final: 0, // final distance
		delta: 0, // difference between the two
		angle: 0 // angle at which the pinch is being performed
	},
	swipe: {
		initial: {
			x: 0,
			y: 0
		}, // initial distance, touch object
		final: {
			x: 0,
			y: 0
		}, // final distance, touch object
		delta: 0, // swipe distance
		angle: 0, // swipe angle // TODO: Round to the nearest X degrees?
		direction: "" // human-readable version of the swipe angle: up, down, etc.
	},

	type: false,
	orientation: false,
	rotating: false,
	pinching: false,
	swiping: false,
	touching: false
}

// Nice-looking custom events
event = {
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
	
	if( window.navigator.standalone ){
		x$("body").addClass("standalone");
	}

	updateOrientation();
	x$(window).orientationchange(updateOrientation);

	// The Magic
	x$(document)
	.touchstart( function(e){
		e.preventDefault();
		device.touch.start = new Date().getTime();
		device.touching = true;
		if( e.touches.length == 1 ){
			var t1 = e.touches[0];

			device.finger1 = new Finger();

			//// Swipe detection
			// First info
			device.finger1.x.push(t1.pageX);
			device.finger1.y.push(t1.pageY);
		} else
		if( e.touches.length == 2 ){
			var t1 = e.touches[0];
			var t2 = e.touches[1];

			device.finger1 = new Finger();
			device.finger2 = new Finger();

			var diffX = t2.pageX-t1.pageX;
			var diffY = t2.pageY-t1.pageY;

			device.rotate.prev = device.rotate.final; // Old final rotation = previous rotation
			device.rotate.initial = Math.round( (Math.atan2(diffX,diffY)/(2*Math.PI))*360 ) + 180;
			// Length of the hypotenuse, given a and b
			device.pinch.initial =  Math.round( Math.sqrt( diffX*diffX + diffY*diffY ) );
		}
	})
	.touchmove(function(e){
		e.preventDefault();
		if( e.touches.length == 1 ){ // One finger
			var t1 = e.touches[0];
			//// Swipe detection
			var prevX = device.finger1.x[device.finger1.x.length-1];
			var prevY = device.finger1.y[device.finger1.y.length-1];

			var diffX = prevX-t1.pageX;
			var diffY = prevY-t1.pageY;

			var delta = Math.round( Math.sqrt( diffX*diffX + diffY*diffY ) );
			if( delta > 20 ){
				// Record a new point
				device.finger1.x.push(t1.pageX);
				device.finger1.y.push(t1.pageY);
				var angle = ((Math.floor( ( Math.atan2(diffX,diffY)/Math.PI ) * 180 ) + 180) % 360);
				var point = "<div class='point' style='position:absolute;top:"+t1.pageY+"px;left:"+t1.pageX+"px;-webkit-transform:rotate(-"+angle+"deg)'><span>&darr;</span></div>";
				x$("body").html("after",point);
			}

//			if( !device.swiping && device.swipe.delta > 20 )
				device.swiping = true;

			if( device.swiping ) {
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
				event.fire("swipeGesture");
			}
		} else
		if( e.touches.length == 2 ){
			t1 = e.touches[0]; // Finger 1
			t2 = e.touches[1]; // Finger 2

			var diffX = t2.pageX - t1.pageX;
			var diffY = t2.pageY - t1.pageY;

			//// Rotation detection
			device.rotate.delta = device.rotate.initial - ((Math.floor( ( Math.atan2(diffX,diffY)/Math.PI ) * 180 ) + 180) % 360);

			// The total amount of rotation applied to the object, based on the initial rotate.
			device.rotate.final = (device.rotate.prev + device.rotate.delta + 360) % 360;

//			if( !device.rotating && Math.abs( device.rotate.delta ) > 10 )
				device.rotating = true;

			if( device.rotating )
				event.fire("rotateGesture");

			//// Pinch detection
			device.pinch.final = Math.floor( Math.sqrt( diffX*diffX + diffY*diffY ) );
			device.pinch.delta = device.pinch.final - device.pinch.initial;
			device.pinch.angle = device.rotate.initial;

//			if( !device.pinching && Math.abs( device.pinch.delta ) > 40 )
				device.pinching = true;

			if( device.pinching )
				event.fire("pinchGesture");
		}
	})
	.touchend(function(){
		x$(".point").remove();
		device.touching = false;
		device.rotating = false;
		device.swiping = false;
		device.swipe.direction = "";

		device.finger1 = false;
		device.finger2 = false;
	});
});

function rotateSquare() {
	x$("#square").setStyle("-webkit-transform","rotate("+device.rotate.final+"deg)");
	x$("#rotate-old span").html(device.rotate.prev+"");
	x$("#rotate-delta span").html(device.rotate.delta+"");
	x$("#rotate-initial span").html(device.rotate.initial+"");
	x$("#rotate-new span").html(device.rotate.final+"");
}

function pinchSquare() {
	x$("#pinch-initial span").html(device.pinch.initial+"");
	x$("#pinch-delta span").html(device.pinch.delta+"");
}

function swipeSquare() {
	x$("#swipe-vector span").html(device.swipe.delta+"px, "+device.swipe.angle+"");
	x$("#swipe-direction span").html(device.swipe.direction+"");
}

event.listen("rotateGesture", rotateSquare);
event.listen("pinchGesture", pinchSquare);
event.listen("swipeGesture", swipeSquare);