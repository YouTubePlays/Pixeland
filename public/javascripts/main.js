var BLACK = 0;
var DARK_GRAY = 21;
var LIGHT_GRAY = 42;
var WHITE = 63;
var RED = 48;
var ORANGE = 52;
var BROWN = 56;
var YELLOW = 60;
var GREEN = 12;
var DARK_GREEN = 8;
var CYAN = 15;
var BLUE = 3;
var PURPLE = 19;
var PINK = 59;
var MAGENTA = 51;
var MAROON = 16;


var colors = [BLACK, LIGHT_GRAY, MAROON, ORANGE, YELLOW, CYAN, PURPLE, MAGENTA, DARK_GRAY, WHITE, RED, BROWN, GREEN, DARK_GREEN, BLUE, PINK]
var color = MAGENTA;

function toRGB(c) {
	var r, g, b;
	r = ((c & 0x30) >>> 4) / 3 * 255;
	g = ((c & 0x0C) >>> 2) / 3 * 255;
	b = ((c & 0x03)) / 3 * 255;
	return {
		"r" : r,
		"g" : g,
		"b" : b
	};
}

function setColors() {
	for(var i =0; i<16; i++) {
		var rgb = toRGB(colors[i]);
		$("#colors-cell-"+(i+1)).css('background-color', 'rgba('+rgb.r+','+rgb.g+','+rgb.b+', 1)');
		var clickHandler = function(x) {return function(){color = colors[x]}};
		$("#colors-cell-"+(i+1)).on( "click", clickHandler(i));
	}
}
setColors();

var canvas = document.getElementById("pixeland");
var canvasWidth = canvas.width;
var canvasHeight = canvas.height;
var ctx = canvas.getContext("2d");
var canvasData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);

function setpixelated(context) {
	context['imageSmoothingEnabled'] = false; /* standard */
	context['mozImageSmoothingEnabled'] = false; /* Firefox */
	context['oImageSmoothingEnabled'] = false; /* Opera */
	context['webkitImageSmoothingEnabled'] = false; /* Safari */
	context['msImageSmoothingEnabled'] = false; /* IE */
}

function drawPixelRGB(x, y, r, g, b, a) {
	var index = (x + y * canvasWidth) * 4;
	canvasData.data[index + 0] = r;
	canvasData.data[index + 1] = g;
	canvasData.data[index + 2] = b;
	canvasData.data[index + 3] = a;
}

function drawPixel(x, y, c) {
	var p = toRGB(c);
	drawPixelRGB(x, y, p.r, p.g, p.b, 255);
}

function redraw() {
	ctx.putImageData(canvasData, 0, 0);
}

setpixelated(ctx);

function loadPixelMap() {
	$.ajax({
		url : "pixels",
		type : "GET",
		success : function(result) {
			console.log(result.length);
			for (var i = 0; i < result.length; i++) {
				var bit = result[i].charCodeAt(0);
				drawPixel(Math.floor(i / 1000), i % 1000, bit)
			}
			redraw();
		}
	});
}

var container = document.getElementById("container");
var mc = new Hammer.Manager(container);
var pinch = new Hammer.Pinch();
var pan = new Hammer.Pan();
pinch.recognizeWith(pan);

mc.add([ pinch, pan ]);

var adjustScale = 1;
var adjustDeltaX = 0;
var adjustDeltaY = 0;

var currentScale = 1;
var currentDeltaX = 0;
var currentDeltaY = 0;

function centerPixeland() {
	var centerX = $("#container").width() / 2;
	var centerY = $("#container").height() / 2;
	var x = $("#pixeland").width() / 2;
	var y = $("#pixeland").height() / 2;
	currentDeltaX = centerX - x;
	currentDeltaY = centerY - y;

	$("#pixeland").css(
			"-ms-transform",
			"translate(" + currentDeltaX + "px," + currentDeltaY + "px) scale("
					+ currentScale + ")");
	$("#pixeland").css(
			"-webkit-transform",
			"translate(" + currentDeltaX + "px," + currentDeltaY + "px) scale("
					+ currentScale + ")");
	$("#pixeland").css(
			"transform",
			"translate(" + currentDeltaX + "px," + currentDeltaY + "px) scale("
					+ currentScale + ")");
	adjustScale = currentScale;
	adjustDeltaX = currentDeltaX;
	adjustDeltaY = currentDeltaY;
}

function scaleMove() {
	var centerX = $("#container").width() / 2;
	var centerY = $("#container").height() / 2;
	
	var x = $("#pixeland").width() * adjustScale / 2 + currentDeltaX;
	var y = $("#pixeland").height() * adjustScale / 2 + currentDeltaY;
	
	currentDeltaX = ((x - centerX) *  currentScale / adjustScale)+centerX - $("#pixeland").width() / 2 ;
	currentDeltaY = ((y - centerY) *  currentScale / adjustScale)+centerY - $("#pixeland").height() / 2 ;

	$("#pixeland").css(
			"-ms-transform",
			"translate(" + currentDeltaX + "px," + currentDeltaY + "px) scale("
					+ currentScale + ") ");
	$("#pixeland").css(
			"-webkit-transform",
			"translate(" + currentDeltaX + "px," + currentDeltaY + "px) scale("
					+ currentScale + ") ");
	$("#pixeland").css(
			"transform",
			"translate(" + currentDeltaX + "px," + currentDeltaY + "px) scale("
					+ currentScale + ") ");
	currentDeltaX = (currentDeltaX + $("#pixeland").width()/ 2) - $("#pixeland").width()*  currentScale / 2;
	currentDeltaY = (currentDeltaY + $("#pixeland").height() / 2) - $("#pixeland").height()*  currentScale / 2;
}

mc.on("pinch pan", function(ev) {

	// Adjusting the current pinch/pan event properties using the previous ones
	// set when they finished touching
	currentScale = adjustScale * ev.scale;
	currentDeltaX = adjustDeltaX + (ev.deltaX);
	currentDeltaY = adjustDeltaY + (ev.deltaY);
	scaleMove();

});

mc.on("panend pinchend", function(ev) {

	// Saving the final transforms for adjustment next time the user interacts.
	adjustScale = currentScale;
	adjustDeltaX = currentDeltaX;
	adjustDeltaY = currentDeltaY;

});

function MouseWheelHandler(e) {
	var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
	if (delta < 0)
		currentScale /= -delta * 0.5;
	else
		currentScale *= delta * 0.5;

	currentScale = Math.max(0.1, currentScale);
	currentScale = Math.min(200, currentScale);
	scaleMove();
	adjustScale = currentScale;
	adjustDeltaX = currentDeltaX;
	adjustDeltaY = currentDeltaY;
}

var myitem = document.getElementById("container");
if (myitem.addEventListener) {
	// IE9, Chrome, Safari, Opera
	myitem.addEventListener("mousewheel", MouseWheelHandler, false);
	// Firefox
	myitem.addEventListener("DOMMouseScroll", MouseWheelHandler, false);
}

var mc2 = new Hammer(document.getElementById("pixeland"), []);
mc2.on("tap", function(ev) {
	var bb = ev.target.getBoundingClientRect();
	var x = Math.floor((ev.pointers[0].clientX - bb.left) / adjustScale);
	var y = Math.floor((ev.pointers[0].clientY - bb.top) / adjustScale);
	$.ajax({
		url : "pixels",
		type : "POST",
		dataType : 'json',
		contentType : "application/json; charset=utf-8",
		dataType : "json",
		success : function(data) {
			// alert(data);
		},
		failure : function(errMsg) {
			alert(errMsg);
		},
		// json object to sent to the authentication url
		data : '{"x": ' + x + ', "y" : ' + y + ', "c":'+ color +'}'
	});
});

function connect(url) {
	var websocket = new ReconnectingWebSocket(url);
	websocket.onopen = function(evt) {
		loadPixelMap();
	};
	websocket.onclose = function(evt) {
		connect();
	};
	websocket.onmessage = function(evt) {
		var p = JSON.parse(evt.data);
		drawPixel(p.x, p.y, p.c);
		redraw();
	};
	websocket.onerror = function(evt) {
		console.log(evt)
	};
}
centerPixeland();