//Source code by Gabriel Dube
//Modified by Ryan Wiseman to make Speed Pong

var DIRECTION = {
    IDLE: 0,
    UP: 1,
    DOWN: 2,
    LEFT: 3,
    RIGHT: 4
};
 
var rounds = [5, 5, 3, 3, 2];
//Personal color choices I used to create a better palette
var colors = ['#b0e0e6', '#20b2aa', '#daa520', '#ece6ff', '#ffc0cb'];

//Sound FX to be used
let pongimact = new Audio ('/src/sounds/pongimpact.mp3');
let gameover = new Audio ('/src/sounds/gameover.mp3');
let gamestart = new Audio ('/src/sounds/gamestart.mp3')
let gamewin = new Audio ('src/sounds/gamewin.mp3')
let blip = new Audio ('/src/sounds/blip.mp3')

var Ball = {
    new: function (incrementedSpeed) {
        return {
            width: 18,
            height: 18,
            x: (this.canvas.width / 2) - 9,
            y: (this.canvas.height / 2) - 9,
            moveX: DIRECTION.IDLE,
            moveY: DIRECTION.IDLE,
            //Increased ball speed to fit baseline for SpeedPong
            speed: incrementedSpeed || 8,

        };
    }
};
 
var Ai = {
    new: function (side) {
        return {
            width: 18,
            height: 180,
            x: side === 'left' ? 150 : this.canvas.width - 150,
            y: (this.canvas.height / 2) - 35,
            score: 0,
            move: DIRECTION.IDLE,
            //This is player speed, (this.player is = to Ai.new.call)
            speed: 10,
            
        };
    }
};
 
var Game = {
    initialize: function () {
        this.canvas = document.querySelector('canvas');
        this.context = this.canvas.getContext('2d');
 
        this.canvas.width = 1400;
        this.canvas.height = 1000;
 
        this.canvas.style.width = (this.canvas.width / 2) + 'px';
        this.canvas.style.height = (this.canvas.height / 2) + 'px';
 
        this.player = Ai.new.call(this, 'left');
        this.ai = Ai.new.call(this, 'right');
        this.ball = Ball.new.call(this);
 
        //Keeping a high enough speed for the AI, but not too drastic, 
        //or else you are not winning this game of pong against a computer
        this.ai.speed = 6;
        this.running = this.over = false;
        this.turn = this.ai;
        this.timer = this.round = 0;
        this.color = '#ffb6c1';
 
        Pong.menu();
        Pong.listen();
    },
 
    endGameMenu: function (text) {
        Pong.context.font = '45px Courier New';
        Pong.context.fillStyle = this.color;
 
        Pong.context.fillRect(
            Pong.canvas.width / 2 - 350,
            Pong.canvas.height / 2 - 48,
            700,
            100
        );
 
        Pong.context.fillStyle = '#ffffff';
 
        Pong.context.fillText(text,
            Pong.canvas.width / 2,
            Pong.canvas.height / 2 + 15
        );
 
        setTimeout(function () {
            Pong = Object.assign({}, Game);
            Pong.initialize();
        }, 3000);
    },
 
    menu: function () {
        Pong.draw();
        this.context.font = '50px Courier New';
        this.context.fillStyle = this.color;
 
        this.context.fillRect(
            this.canvas.width / 2 - 350,
            this.canvas.height / 2 - 48,
            700,
            100
        );

        this.context.fillStyle = '#ffffff';
 
        this.context.fillText('Press any key to begin',
            this.canvas.width / 2,
            this.canvas.height / 2 + 15
        );
    },
 
    update: function () {
        if (!this.over) {
            if (this.ball.x <= 0) Pong._resetTurn.call(this, this.ai, this.player);
            if (this.ball.x >= this.canvas.width - this.ball.width) Pong._resetTurn.call(this, this.player, this.ai);
            if (this.ball.y <= 0) this.ball.moveY = DIRECTION.DOWN;
            if (this.ball.y >= this.canvas.height - this.ball.height) this.ball.moveY = DIRECTION.UP;
                
            
 
            if (this.player.move === DIRECTION.UP) this.player.y -= this.player.speed;
            else if (this.player.move === DIRECTION.DOWN) this.player.y += this.player.speed;
 
            if (Pong._turnDelayIsOver.call(this) && this.turn) {
                this.ball.moveX = this.turn === this.player ? DIRECTION.LEFT : DIRECTION.RIGHT;
                this.ball.moveY = [DIRECTION.UP, DIRECTION.DOWN][Math.round(Math.random())];
                this.ball.y = Math.floor(Math.random() * this.canvas.height - 200) + 200;
                this.turn = null;
                pongimact.load();
                pongimact.play();
            }
 
            if (this.player.y <= 0) this.player.y = 0;
            else if (this.player.y >= (this.canvas.height - this.player.height)) this.player.y = (this.canvas.height - this.player.height);
 
            if (this.ball.moveY === DIRECTION.UP) this.ball.y -= (this.ball.speed / 2);
            else if (this.ball.moveY === DIRECTION.DOWN) this.ball.y += (this.ball.speed / 2);
            if (this.ball.moveX === DIRECTION.LEFT) this.ball.x -= this.ball.speed;
            
            else if (this.ball.moveX === DIRECTION.RIGHT) this.ball.x += this.ball.speed;
            
 
            if (this.ai.y > this.ball.y - (this.ai.height / 2)) {
                if (this.ball.moveX === DIRECTION.RIGHT) this.ai.y -= this.ai.speed / 1.5;
                else this.ai.y -= this.ai.speed / 4;
            }
            if (this.ai.y < this.ball.y - (this.ai.height / 2)) {
                if (this.ball.moveX === DIRECTION.RIGHT) this.ai.y += this.ai.speed / 1.5;
                else this.ai.y += this.ai.speed / 4;
            }
 
            if (this.ai.y >= this.canvas.height - this.ai.height) this.ai.y = this.canvas.height - this.ai.height;
            else if (this.ai.y <= 0) this.ai.y = 0;
 
            if (this.ball.x - this.ball.width <= this.player.x && this.ball.x >= this.player.x - this.player.width) {
                if (this.ball.y <= this.player.y + this.player.height && this.ball.y + this.ball.height >= this.player.y) {
                    this.ball.x = (this.player.x + this.ball.width);
                    this.ball.moveX = DIRECTION.RIGHT;
                    //This is the sound for when the pong ball strikes a surface. Technically, you could do 2 sounds for direction left and right
                    blip.load();
                    blip.play();
 
                }
            }
 
            if (this.ball.x - this.ball.width <= this.ai.x && this.ball.x >= this.ai.x - this.ai.width) {
                if (this.ball.y <= this.ai.y + this.ai.height && this.ball.y + this.ball.height >= this.ai.y) {
                    this.ball.x = (this.ai.x - this.ball.width);
                    this.ball.moveX = DIRECTION.LEFT;
                    //The blip sound is the least annoying of all sound effects I found, hence, it's use on both sides
                    //Potential to create slight variation in the audio
                    blip.load();
                    blip.play();
 
                }
            }
        }
 
        if (this.player.score === rounds[this.round]) {
            if (!rounds[this.round + 1]) {
                this.over = true;
                //if you win, congrats, gamewin sound
                gamewin.load();
                gamewin.play();
                setTimeout(function () { Pong.endGameMenu('Winner!'); }, 1000);
            } else {
                gamestart.load();
                gamestart.play();
                this.color = this._generateRoundColor();
                this.player.score = this.ai.score = 0;
                this.player.speed += 2.3;
                this.ai.speed += 1.985;
                this.ball.speed += 2;
                this.round += 1;
 
            }
        }
        else if (this.ai.score === rounds[this.round]) {
            this.over = true;
            //if you lose, congrats, ur a loser sound
            gameover.load();
            gameover.play();
            setTimeout(function () { Pong.endGameMenu('Game Over!'); }, 1000);
        }
    },
 
    draw: function () {
        this.context.clearRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );
 
        this.context.fillStyle = this.color;
 
        this.context.fillRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );
 
        this.context.fillStyle = '#ffffff';

        this.context.fillRect(
            this.player.x,
            this.player.y,
            this.player.width,
            this.player.height
        );
 
        this.context.fillRect(
            this.ai.x,
            this.ai.y,
            this.ai.width,
            this.ai.height 
        );
 
        if (Pong._turnDelayIsOver.call(this)) {
            this.context.fillRect(
                this.ball.x,
                this.ball.y,
                this.ball.width,
                this.ball.height
            );
        }
        
        this.context.beginPath();
        this.context.setLineDash([7, 15]);
        this.context.moveTo((this.canvas.width / 2), this.canvas.height - 140);
        this.context.lineTo((this.canvas.width / 2), 140);
        this.context.lineWidth = 10;
        this.context.strokeStyle = '#ffffff';
        this.context.stroke();
 
        this.context.font = '100px Courier New';
        this.context.textAlign = 'center';
 
        this.context.fillText(
            this.player.score.toString(),
            (this.canvas.width / 2) - 300,
            200
        );

        this.context.fillText(
            this.ai.score.toString(),
            (this.canvas.width / 2) + 300,
            200
        );
 
        this.context.font = '30px Courier New';
        this.context.fillText(
            'Round ' + (Pong.round + 1),
            (this.canvas.width / 2),
            35
        );
 
        this.context.font = '40px Courier';
 
        this.context.fillText(
            rounds[Pong.round] ? rounds[Pong.round] : rounds[Pong.round - 1],
            (this.canvas.width / 2),
            100
        );
    },
 
    loop: function () {
        Pong.update();
        Pong.draw();
        if (!Pong.over) requestAnimationFrame(Pong.loop);
    },

    listen: function () {
        document.addEventListener('keydown', function (key) {
            if (Pong.running === false) {
                Pong.running = true;
                window.requestAnimationFrame(Pong.loop);
            }
 
            if (key.keyCode === 38 || key.keyCode === 87) Pong.player.move = DIRECTION.UP;
 
            if (key.keyCode === 40 || key.keyCode === 83) Pong.player.move = DIRECTION.DOWN;
        });
 
        document.addEventListener('keyup', function (key) { Pong.player.move = DIRECTION.IDLE; });
    },
 
    _resetTurn: function(victor, loser) {
        this.ball = Ball.new.call(this, this.ball.speed);
        this.turn = loser;
        this.timer = (new Date()).getTime();
 
        victor.score++;
    },
 
    _turnDelayIsOver: function() {
        return ((new Date()).getTime() - this.timer >= 1000);
    },
 
    _generateRoundColor: function () {
        var newColor = colors[Math.floor(Math.random() * colors.length)];
        if (newColor === this.color) return Pong._generateRoundColor();
        return newColor;
    }
};
 
var Pong = Object.assign({}, Game);
Pong.initialize();