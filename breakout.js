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
// Class Game
//
function Game() {
	this.loop = null;
	
	this.elt = window.elt = document.getElementById('breakout');
	this.ctx = window.ctx = this.elt.getContext('2d');
	this.w = this.elt.width;
	this.h = this.elt.height;
	
	this.paddle = this.makeNewPaddle();
	this.ball = this.makeNewBall();
}

Game.prototype.start = function() {
	var game = this;
	
	(function eventLoop() {
		game.loop = requestAnimationFrame(eventLoop);
		game.update();
	})();
};

Game.prototype.update = function() {
	this.ball.update();
	this.paddle.update();
};

Game.prototype.makeNewPaddle = function() {
	return new Paddle({
		x: this.w / 2 - 15, y: this.h - 4,
		w: 30, h: 4
	});
};

Game.prototype.makeNewBall = function() {
	var ball = new Ball({
		r: 3,
		x: this.w / 2, y: this.h - 87,
		vx: 0, vy: 2,
		color: Math.random() > 0.5 ? colors.pink : colors.blue
	});
	
	return ball;
};

Game.prototype.getPaddle = function() {
	return this.paddle;
};

Game.prototype.getBall = function() {
	return this.ball;
};

Game.prototype.ballWasMissed = function() {
	delete this.ball;
	this.ball = this.makeNewBall();
};

Game.prototype.quit = function() {
	cancelAnimationFrame(this.loop);
};

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
}

Ball.prototype.moveTo = function(x, y) {
	this.erase();
	
	this.x = x;
	this.y = y;
};

Ball.prototype.update = function() {
	var paddle = game.getPaddle();
	
	//
	// Check for paddle hits
	//
	if (this.y + this.vy + this.r >= paddle.y
		&& this.x + this.vx + this.r > paddle.x
		&& this.x + this.vx - this.r < paddle.x + paddle.w)
	{
		var paddlePos = paddle.getBounds();
		var percentFromPaddleCenter = 2 * ((this.x - paddlePos.x) / paddle.w - 0.5);
		
		this.vy = -this.vy;
		this.vx += 2* Math.sin(Math.PI * percentFromPaddleCenter / 2);
		
		this.moveTo(this.x, paddle.y - this.r);
	}

	//
	// Die if going through the bottom
	//
	else if (this.y > game.h + this.r) {
		game.ballWasMissed();
	}
	
	//
	// Prevent exceeding the top
	//
	else if (this.y + this.vy < this.r) {
		this.vy = -this.vy;
		this.moveTo(this.x + this.vx, this.r);
	}

	//
	// Prevent going off the right
	//
	else if (this.x + this.vx > game.w - this.r) {
		this.vx = -this.vx;
		this.moveTo(game.w - this.r, this.y + this.vy);
	}

	//
	// Prevent going off the left
	//
	else if (this.x + this.vx < this.r) {
		this.vx = -this.vx;
		this.moveTo(this.r, this.y + this.vy);
	}
	
	//
	// Normal movement
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
	ctx.clearRect(
		this.x - this.r,
		this.y - this.r,
		this.r * 2, this.r * 2
	);
};



//
// Class Paddle
//

function Paddle(opt) {
	this.w = opt.w;
	this.h = opt.h;
	
	this.x = opt.x;
	this.y = opt.y;
	
	this.lastPos = {x: null, y: null};
	
	this.color = opt.color || colors.black;
	
	elt.addEventListener('mousemove', this.mouseMoved.bind(this));
}

Paddle.prototype.mouseMoved = function(e) {
	var x = e.pageX - elt.offsetLeft;
	
	if (x <= game.w - this.w) {
		this.x = x;
	}
};

Paddle.prototype.getBounds = function() {
	return {
		x: this.x, y: this.y,
		w: this.w, h: this.h
	};
};

Paddle.prototype.update = function() {
	this.draw();
};

Paddle.prototype.draw = function() {
	this.erase();
	
	ctx.fillStyle = this.color;
	ctx.fillRect(this.x, this.y, this.w, this.h);
	
	this.lastPos = {x: this.x, y: this.y};
};

Paddle.prototype.erase = function() {
	ctx.clearRect(this.lastPos.x, this.y, this.w, this.h);
};



//
// Set up the world
//
window.game = new Game();
game.start();

})();