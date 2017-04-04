/**
 * 
 */
var app = angular.module('pixeland');
app.factory('colorUtilities', function() {
	return new function() {
		var self = this;
		this.BLACK = 0;
		this.DARK_GRAY = 21;
		this.LIGHT_GRAY = 42;
		this.WHITE = 63;
		this.RED = 48;
		this.ORANGE = 52;
		this.BROWN = 56;
		this.YELLOW = 60;
		this.GREEN = 12;
		this.DARK_GREEN = 8;
		this.CYAN = 15;
		this.BLUE = 3;
		this.PURPLE = 19;
		this.PINK = 59;
		this.MAGENTA = 51;
		this.MAROON = 16;
		this.LIGHT_RED = 48 + 8 + 2;
		this.LIGHT_YELLOW = 48 + 12 + 2;
		this.LIGHT_GREEN = 32 + 12 + 2;
		this.DARK_BROWN = 20;

		this.colors = [[this.BLACK, this.LIGHT_GRAY, this.MAROON, this.ORANGE,
				this.LIGHT_YELLOW, this.YELLOW, this.LIGHT_GREEN, this.CYAN,
				this.PURPLE, this.MAGENTA],[this.DARK_GRAY, this.WHITE,
				this.LIGHT_RED, this.RED, this.BROWN, this.GREEN,
				this.DARK_GREEN, this.DARK_BROWN, this.BLUE, this.PINK ]];

		//				this.colors = [];
		//				for(var r =0; r < 4; r++){
		//					for(var g =0; g < 4; g++){
		//						for(var b =0; b < 4; b++){
		//							this.colors.push(r*16+g*4+b);
		//						}
		//					}
		//				}

		this.toRGB = function(c) {
			var r, g, b;
			r = ((c & 0x30) >>> 4) / 3 * 255;
			g = ((c & 0x0C) >>> 2) / 3 * 255;
			b = ((c & 0x03)) / 3 * 255;
			return {
				"r" : r,
				"g" : g,
				"b" : b
			};
		};

		this.toRGBcss = function(c) {
			var rgb = self.toRGB(c);
			return 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ', 1)';
		};

		this.setContextPixelated = function(context) {
			context['imageSmoothingEnabled'] = false; /* standard */
			context['mozImageSmoothingEnabled'] = false; /* Firefox */
			context['oImageSmoothingEnabled'] = false; /* Opera */
			context['webkitImageSmoothingEnabled'] = false; /* Safari */
			context['msImageSmoothingEnabled'] = false; /* IE */
		};
	};
});