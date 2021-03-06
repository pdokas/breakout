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
	pink:  '#ff0084',
	blue:  '#0063dc',
	white: '#ffffff',
	black: '#000000'
};

var names = [
	'Chronic Rehab', 'brought to', 'you by:', 'Peter Norby', 'Scott Schiller', 'Daniel Bogan',
	'David Fusco', 'Emily Yiu', 'Phil Yu', 'Kay Kremerskothen', 'Jenny Mette', 'Ross Harmes',
	'Timothy Denike', 'Phil King', 'Daniel Eiba', 'Denise Leung', 'Trevor Hartsell', 'Eric Gelinas',
	'Markus Spiering', 'Henry Lyne', 'Stephen Woods', 'Jamal Fanaian', 'Chris Berry',
	'Sergey Morozov', 'Cindy Li', 'Tim Miller', 'Brad Peralta', 'Chris Hamilton', 'Matt Jennings',
	'Peter Welch', 'Phil Dokas', 'Hugo Haas', 'Marc Perry', 'William Stubbs', 'Georges Haddad',
	'Joshua Cohen', 'Erin Wermuth', 'John Ubante', 'Brett Wayn', 'Anna Thomas',
	'Sean Perkins'
];



//
// Class Game
//
function Game() {
	this.loop = null;
	this.paused = true;
	
	this.elt = window.elt = document.getElementById('breakout');
	this.ctx = window.ctx = this.elt.getContext('2d');
	this.w = this.elt.width;
	this.h = this.elt.height;
	
	this.paddle = this.makeNewPaddle();
	this.ball   = this.makeNewBall();
	this.bricks = this.makeBrickWall();
}

Game.prototype.start = function() {
	var game = this;
	
	this.paused = false;
	
	(function eventLoop() {
		game.loop = requestAnimationFrame(eventLoop);
		game.update();
	})();
};

Game.prototype.update = function() {
	if (!this.ball.update()) {
		return false;
	}
	
	if (!this.paddle.update()) {
		return false;
	}
};

Game.prototype.getPaddle = function() {
	return this.paddle;
};

Game.prototype.getBall = function() {
	return this.ball;
};

Game.prototype.getBricks = function() {
	return this.bricks;
};

Game.prototype.ballWasMissed = function() {
	delete this.ball;
	this.ball = this.makeNewBall();
};

Game.prototype.restart = function() {
	this.erase();
	
	this.paddle = this.makeNewPaddle();
	this.ball   = this.makeNewBall();
	this.bricks = this.makeBrickWall();
	
	return false;
};

Game.prototype.pause = function() {
	cancelAnimationFrame(this.loop);
	this.paused = true;
};

Game.prototype.isPaused = function() {
	return this.paused;
};

Game.prototype.erase = function() {
	this.elt.setAttribute('width', this.elt.getAttribute('width'));
}

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
		vx: 0, vy: 2.5,
		color: Math.random() > 0.5 ? colors.pink : colors.blue
	});
	
	return ball;
};

Game.prototype.makeBrickWall = function() {
	var game = this,
	    wall = [],
	    row  = [],
	    brick,
	    
	    brickX       = 3,
	    brickY       = 32,
	    brickGutterX = 1,
	    brickGutterY = 6,
	    brickHeight  = 12,
	    rowWidth     = game.w - 3;
	
	for (var i = 0, len = names.length; i < len; i++) {
		var name = names[i],
		    extraWidthPerBrick,
		    brickIsTooWideForRow = false,
		    brickIsTheFinalBrick = false,
		    brickToMove;
		
		brick = new Brick({
			x: brickX,
			y: brickY,
			h: brickHeight,
			text: name,
			color: (i % 2) ? colors.pink : colors.blue
		});
		
		if (brick.getComputedWidth() > rowWidth - brickX) {
			brickIsTooWideForRow = true;
		}
		
		if (i === names.length - 1) {
			brickIsTheFinalBrick = true;
		}
		
		//
		// Reflow the row if it's the end of a row or the end of the names
		//
		if (brickIsTooWideForRow || brickIsTheFinalBrick) {
			if (!brickIsTooWideForRow && brickIsTheFinalBrick) {
				row.push(brick);
				brickX += brick.getComputedWidth() + brickGutterX;
			}
			
			extraWidthPerBrick = (rowWidth - brickX) / (row.length - 1);
			
			//
			// Spread out bricks
			//
			for (var j = row.length - 1; j > 0; j--) {
				brickToMove = row[j];
				brickToMove.moveTo(brickToMove.x + j * extraWidthPerBrick, brickToMove.y, true);
				brickToMove.draw();
			}
			
			//
			// Make a new row if the last one just ended
			//
			if (brickIsTooWideForRow) {
				wall.push(row);
				row = [];

				brickX = 3;
				brickY += brickHeight + brickGutterY;

				brick.moveTo(brickX, brickY);
			}
		}
		
		if (!brickIsTheFinalBrick) {
			row.push(brick);
			brickX += brick.getComputedWidth() + brickGutterX;
		}
		else if (brickIsTooWideForRow && brickIsTheFinalBrick) {
			row.push(brick);
			wall.push(row);
		}
		
		brick.draw();
	}
	
	return wall;
};



//
// Class Brick
//

function Brick(opt) {
	this.x = opt.x;
	this.y = opt.y;
	this.h = opt.h;
	
	this.color = opt.color;
	this.textColor = opt.textColor || colors.white;
	
	this.text = opt.text || '';
	this.textH = opt.textH || 9;
	
	this.brickPadding = opt.brickPadding || 1;
}

Brick.prototype.moveTo = function(x, y, cleanup) {
	if (cleanup) {
		this.erase();
	}
	
	this.x = x;
	this.y = y;
};

Brick.prototype.draw = function() {
	ctx.font = 'bold '+this.textH+'px verdana';
	
	// Draw the background
	ctx.fillStyle = this.color;
	ctx.fillRect(this.x, this.y, this.getComputedWidth(), this.h);
	
	// Draw the text
	ctx.fillStyle = this.textColor;
	ctx.fillText(this.text, this.x + this.brickPadding, this.y + this.textH);
};

Brick.prototype.getComputedWidth = function() {
	if (!this.w) {
		this.w = ctx.measureText(this.text).width + this.brickPadding * 2;
	}
	
	return this.w;
};

Brick.prototype.erase = function() {
	ctx.clearRect(Math.floor(this.x), this.y, this.getComputedWidth() + 1, this.h);
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
	var paddle = game.getPaddle(),
		bricks = game.getBricks(),
		row,
		brick,
		x, y,
		brickCollision = false;
	
	//
	// Check for brick hits
	//
	for (y = bricks.length - 1; y >= 0; y--) {
		row = bricks[y];
		
		for (x = row.length - 1; x >= 0; x--) {
			brick = row[x];
			
			if (this.y + this.vy + this.r > brick.y
				&& this.y + this.vy - this.r < brick.y + brick.h
				&& this.x + this.vx + this.r > brick.x
				&& this.x + this.vx - this.r < brick.x + brick.w
			) {
				//
				// Side collision
				//
				if (this.x + this.vx < brick.x
					|| this.x + this.vx > brick.x + brick.w)
				{
					this.vx = -this.vx;
				}
				
				//
				// Top/bottom collision
				//
				else {
					this.vy = -this.vy;
				}

				this.moveTo(this.x, this.y);
				
				row.splice(x, 1);
				brick.erase();
				
				if (row.length === 0) {
					bricks.splice(y, 1);
				}
				
				if (bricks.length === 0) {
					return game.restart();
				}
				
				brickCollision = true;
				break;
			}
		}
		
		if (brickCollision) {
			break;
		}
	}

	if (!brickCollision) {
		//
		// Check for paddle hits
		//
		if (this.y + this.vy + this.r >= paddle.y
			&& this.x + this.vx + this.r > paddle.x
			&& this.x + this.vx - this.r < paddle.x + paddle.w
		) {
			var paddlePos = paddle.getBounds();
			var percentFromPaddleCenter = 2 * ((this.x - paddlePos.x) / paddlePos.w - 0.5);
		
			this.vy = -this.vy;
			this.vx += 2 * Math.sin(Math.PI * percentFromPaddleCenter / 2);
		
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
	}

	this.draw();
	
	return true;
};

Ball.prototype.draw = function() {
	ctx.fillStyle = this.color;
	ctx.beginPath();
	ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2, false);
	ctx.fill();
};

Ball.prototype.erase = function() {
	ctx.clearRect(
		Math.floor(this.x - this.r),
		Math.floor(this.y - this.r),
		this.r * 2 + 1, this.r * 2 + 1
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
	
	document.addEventListener('mousemove', this.mouseMoved.bind(this));
}

Paddle.prototype.mouseMoved = function(e) {
	var x = e.pageX - elt.offsetLeft;

	this.x = Math.max(Math.min(x, game.w - this.w), 0);
};

Paddle.prototype.getBounds = function() {
	return {
		x: this.x, y: this.y,
		w: this.w, h: this.h
	};
};

Paddle.prototype.update = function() {
	this.draw();
	return true;
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

document.addEventListener('click', function() {
	if (game.isPaused()) {
		game.start();
	}
	else {
		game.pause();
	}
});



})();
