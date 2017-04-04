/**
 * 
 */
var app = angular.module('pixeland',[]);
app.controller('CanvasContoller', function($http, $window, colorUtilities) {
	var self = this;
	self.WIDTH = 1000;
	self.HEIGHT = 1000;
	self.colorUtilities = colorUtilities;
	self.onlinePeople = "-";
	self.drawLoop = setInterval(function(){ self.redraw(); }, 40);
	self.transformation = {
		"adjustScale" : 1,
		"adjustDeltaX" : 0,
		"adjustDeltaY" : 0,
		"currentScale" : 1,
		"currentDeltaX" : 0,
		"currentDeltaY" : 0,
	};

	// Init Canvas
	self.init = function(url) {
		self.color = self.colorUtilities.BLACK;
		self.url = url;
		self.initCanvas();
		self.initMoveScaleContainer();
		self.connect();
		self.centerPixeland();
	}

	self.initCanvas = function() {
		self.canvas = document.getElementById("pixeland");
		self.canvasWidth = self.canvas.width;
		self.canvasHeight = self.canvas.height;
		self.ctx = self.canvas.getContext("2d");
		self.canvasData = self.ctx.getImageData(0, 0, self.canvasWidth,
				self.canvasHeight);
		self.colorUtilities.setContextPixelated(self.ctx);
	};

	self.initMoveScaleContainer = function() {
		self.container = document.getElementById("container");
		self.mc = new Hammer.Manager(container);
		var pinch = new Hammer.Pinch();
		var pan = new Hammer.Pan();
		pinch.recognizeWith(pan);
		self.mc.add([ pinch, pan ]);
		self.mc.on("pinch pan", function(ev) {
			self.transformation.currentScale = self.transformation.adjustScale * ev.scale;
			self.transformation.currentDeltaX = self.transformation.adjustDeltaX + (ev.deltaX);
			self.transformation.currentDeltaY = self.transformation.adjustDeltaY + (ev.deltaY);
			
			self.transformation.currentScale = Math.max(0.1, self.transformation.currentScale);
			self.transformation.currentScale = Math.min(200, self.transformation.currentScale);
			
			self.scaleMove();
		});

		self.mc.on("panend pinchend", function(ev) {
			self.doneMoveAction();
		});
		
		self.mouseWheel = function (e) {
			var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
			if (delta < 0)
				self.transformation.currentScale /= -delta * 0.5;
			else
				self.transformation.currentScale *= delta * 0.5;

			self.transformation.currentScale = Math.max(0.1, self.transformation.currentScale);
			self.transformation.currentScale = Math.min(200, self.transformation.currentScale);
			
			self.scaleMove();
			self.doneMoveAction();
		}
		
		if (self.container.addEventListener) {
			// IE9, Chrome, Safari, Opera
			self.container.addEventListener("mousewheel", self.mouseWheel, false);
			// Firefox
			self.container.addEventListener("DOMMouseScroll", self.mouseWheel, false);
		}
		
		self.mc2 = new Hammer(self.canvas, []);
		self.mc2.on("tap", function(ev) {
			var bb = ev.target.getBoundingClientRect();
			var x = Math.floor((ev.pointers[0].clientX - bb.left) / self.transformation.adjustScale);
			var y = Math.floor((ev.pointers[0].clientY - bb.top) / self.transformation.adjustScale);
			self.setPixel(x,y,self.color);
		});
	};

	self.drawPixelRGB = function(x, y, r, g, b, a) {
		var index = (x + y * self.canvasWidth) * 4;
		self.canvasData.data[index + 0] = r;
		self.canvasData.data[index + 1] = g;
		self.canvasData.data[index + 2] = b;
		self.canvasData.data[index + 3] = a;
	};
	
	self.setCanvasCss = function() {
		var x = self.transformation.currentDeltaX;
		var y = self.transformation.currentDeltaY;
		var scale = self.transformation.currentScale;
		self.canvas.style.transform = "translate(" + x + "px," + y + "px) scale(" + scale + ")";
// self.canvas.css("-ms-transform", "translate(" + x + "px," + y + "px) scale("
// + scale + ")");
// self.canvas.css("-webkit-transform", "translate(" + x + "px," + y + "px)
// scale(" + scale + ")");
// self.canvas.css("transform", "translate(" + x + "px," + y + "px) scale(" +
// scale + ")");
	};
	
	self.doneMoveAction = function() {
		self.transformation.adjustScale = self.transformation.currentScale;
		self.transformation.adjustDeltaX = self.transformation.currentDeltaX;
		self.transformation.adjustDeltaY = self.transformation.currentDeltaY;
	};
	
	self.centerPixeland = function() {
		var centerX = self.container.clientWidth / 2;
		var centerY = self.container.clientHeight / 2;
		var x = self.canvas.clientWidth / 2;
		var y = self.canvas.clientHeight / 2;
		self.transformation.currentDeltaX = centerX - x;
		self.transformation.currentDeltaY = centerY - y;
		
		self.scaleMove();
		self.doneMoveAction();
	};
	
	self.scaleMove = function() {
		var centerX = self.container.clientWidth / 2;
		var centerY = self.container.clientHeight / 2;
		
		var x = self.canvas.clientWidth * self.transformation.adjustScale / 2 + self.transformation.currentDeltaX;
		var y = self.canvas.clientHeight * self.transformation.adjustScale / 2 + self.transformation.currentDeltaY;
		
		self.transformation.currentDeltaX = ((x - centerX) *  self.transformation.currentScale / self.transformation.adjustScale) + centerX - self.canvas.clientWidth / 2 ;
		self.transformation.currentDeltaY = ((y - centerY) *  self.transformation.currentScale / self.transformation.adjustScale) + centerY - self.canvas.clientHeight / 2 ;

		self.setCanvasCss();
			
		self.transformation.currentDeltaX = (self.transformation.currentDeltaX + self.canvas.clientWidth / 2) - self.canvas.clientWidth *  self.transformation.currentScale / 2;
		self.transformation.currentDeltaY = (self.transformation.currentDeltaY + self.canvas.clientHeight / 2) - self.canvas.clientHeight *  self.transformation.currentScale / 2;
	};

	self.drawPixel = function(x, y, c) {
		var p = self.colorUtilities.toRGB(c);
		self.drawPixelRGB(x, y, p.r, p.g, p.b, 255);
	};

	self.redraw = function() {
		if (self.ctx)
			self.ctx.putImageData(self.canvasData, 0, 0);
	};

	self.loadPixelMap = function() {
		$http.get("/pixels").then(
				function(response) {
					for (var i = 0; i < response.data.length; i++) {
						var bit = response.data[i].charCodeAt(0);
						self.drawPixel(Math.floor(i / self.WIDTH), i
								% self.HEIGHT, bit)
					}
					self.redraw();
				}, function(error){console.log(error);});
	};
	
	self.setPixel = function(x, y, color) {
		$http({
			url : "/pixels",
			method : "POST",
			headers : { 'Content-Type': "application/json; charset=utf-8"},
			data : '{"x": ' + x + ', "y" : ' + y + ', "c":'+ color +'}'
		}).then(function(data) {},
			function(errMsg) {
				alert(errMsg);
			});
	};
	
	self.connect = function() {
		var websocket = new ReconnectingWebSocket(self.url, null,{reconnectInterval: 1000, maxReconnectInterval: 2000});
		websocket.onopen = function(evt) {
			self.loadPixelMap();
		};
		websocket.onclose = function(evt) {
			console.log(evt)
		};
		websocket.onmessage = function(evt) {
			var p = JSON.parse(evt.data);
			//console.log(p);
			if(p.t == 'p') {
				self.drawPixel(p.m.x, p.m.y, p.m.c);
				//self.redraw();
			} else if(p.t == 'c') {
				angular.element(document.querySelector("#peopleCount")).text("Online: "+p.m);
			} else if(p.t == 'r') {
				self.loadPixelMap();
			}
		};
		websocket.onerror = function(evt) {
			console.log(evt)
		};
		$window.onfocus = function(){
			console.log("focused");
			if(websocket.readyState == WebSocket.CLOSED) {
				self.connect();
			}
		};
	};
	// self.colorUtilities =
});