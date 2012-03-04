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

//
// Global definitions
//
(function() {

var c   = document.getElementById('breakout');
var ctx = c.getContext('2d');
var w   = c.width;
var h   = c.height;

var colors = {
	pink: '#ff0084',
	blue: '#0063dc',
	white: '#ffffff',
	black: '#000000'
};

var names = [
	'Peter Norby', 'Manny Ventura', 'Gilad Raphaelli', 'Scott Schiller', 'Zack Sheppard',
	'Daniel Bogan', 'David Fusco', 'Phil Yu', 'Kay Kremerskothen', 'Jenny Mette', 'Ross Harmes',
	'Timothy Denike', 'Phil King', 'Daniel Eiba', 'Fiona Miller', 'Denise Leung',
	'Trevor Hartsell', 'Eric Gelinas', 'Markus Spiering', 'Henry Lyne', 'Stephen Woods',
	'Jamal Fanaian', 'Phillip Moore', 'Mike Deerkoski', 'Bridget Lewis', 'Chris Berry',
	'Sergey Morozov', 'Steven Loyd', 'Cindy Li', 'Tim Miller', 'Brad Peralta',
	'Ben Freeman', 'Chris Hamilton', 'Matt Jennings', 'Peter Welch', 'Nick Rettinghouse',
	'Phil Dokas', 'Hugo Haas', 'Marc Perry', 'William Stubbs', 'Georges Haddad', 'Joshua Cohen'
];

var bricks = [
	// Coming soon to a game near you!
];

//
// Class Ball
//

function Ball(opt) {
	this.r = opt.r;
	this.x = opt.x;
	this.y = opt.y;
	
	this.vx = opt.vx || 0;
	this.vy = opt.vy || 0;
	
	this.color = opt.color || colors.black;
	
	this.paddle = null;
	this.pause = false;
}

Ball.prototype.debug = function() {
	console.log('ball - x:', this.x, 'y:', this.y, '- vx:', this.vx, 'vy:', this.vy);
	console.log('ball - bottom:', this.y + this.r, 'top:', this.y - this.r, 'left:', this.x - this.r, 'right:', this.x + this.r);
};

Ball.prototype.setPaddle = function(paddle) {
	this.paddle = paddle;
};

Ball.prototype.moveTo = function(x, y) {
	this.erase();
	
	this.x = x;
	this.y = y;
};

Ball.prototype.update = function() {
	//
	// Check for paddle hits
	//
	if (this.y + this.vy + this.r >= this.paddle.y
		&& this.x + this.vx + this.r >= this.paddle.x
		&& this.x + this.vx + this.r <= this.paddle.x + this.paddle.w)
	{
		this.vy = -this.vy;
		this.moveTo(this.x, this.paddle.y - this.r);
		
		// todo: figure out where we hit the paddle and break that into x and y vectors
	}
	
	//
	// Check for the top of the field
	//
	else if (this.y + this.vy < this.r) {
		this.vy = -this.vy;
		this.moveTo(this.x + this.vx, this.r);
	}
	
	//
	// Normal movements
	//
	else {
		this.moveTo(this.x + this.vx, this.y + this.vy);
	}

	this.draw();
};

Ball.prototype.draw = function() {
	ctx.fillStyle = this.color;
	ctx.beginPath();
	ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2, false);
	ctx.fill();
};

Ball.prototype.erase = function() {
	if (this.vx || this.vy) {
		ctx.clearRect(
			this.x - this.r,
			this.y - this.r,
			this.r * 2, this.r * 2
		);
	}
};

var ball = new Ball({
	r: 3,
	x: w / 2, y: h - 87,
	vx: 0, vy: 4,
	color: Math.random() > 0.5 ? colors.pink : colors.blue
});

//
// Class Paddle
//

function Paddle(opt) {
	this.w = opt.w;
	this.h = opt.h;
	
	this.x = opt.x;
	this.y = opt.y;
	
	this.color = opt.color || colors.black;
}

Paddle.prototype.debug = function() {
	console.log('paddle - x:', this.x, 'y:', this.y);
	console.log('paddle - bottom:', this.y + this.h, 'top:', this.y, 'left:', this.x, 'right:', this.x + this.w);
};

Paddle.prototype.update = function() {
	this.draw();
};

Paddle.prototype.draw = function() {
	ctx.fillStyle = this.color;
	ctx.fillRect(this.x, this.y, this.w, this.h);
};

var paddle = new Paddle({
	x: w / 2 - 15, y: h -4,
	w: 30, h: 4
});


//
// Tell the ball about the paddle
//
ball.setPaddle(paddle);

//
// Start the party
//
(function animationLoop() {
	requestAnimationFrame(animationLoop);
	(function() {
		paddle.update();
		ball.update();
	})();
})();

})();