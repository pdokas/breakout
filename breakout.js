(function() {
	var lastTime = 0,
		vendors  = ['ms', 'moz', 'webkit', 'o'];
	
	for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
		window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
		window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
	}

	if (!window.requestAnimationFrame) {
		window.requestAnimationFrame = function(callback, element) {
			var currTime   = new Date().getTime(),
				timeToCall = Math.max(0, 16 - (currTime - lastTime)),
				id         = window.setTimeout(function() { callback(currTime + timeToCall); }, timeToCall);
			
			lastTime = currTime + timeToCall;
			
			return id;
		};
	}

	if (!window.cancelAnimationFrame){
		window.cancelAnimationFrame = function(id) {
			clearTimeout(id);
		};
	}
})();

var canvas  = document.getElementById('breakout');
var context = canvas.getContext('2d');
var width   = canvas.width;
var height  = canvas.height;

function render() {
	
}

(function animationLoop(){
	requestAnimationFrame(animationLoop);
	render();
})();