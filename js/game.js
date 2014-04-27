/**
	Class: Game
	Does gamey stuff
*/

var FRAME_RATE = 1000/60; //Let's try for 60.
var gTheGame;

//KEYS
var KEY_LEFT = 65;
var KEY_RIGHT = 68;
var KEY_FORWARD = 87;
var KEY_BACKWARD = 83;
var KEY_ACTION = 32; //Spacebar

var DETECTION_RATE = 0.4;
var DETECTION_LIMIT = 100;

var STATE_PLAY = 0;
var STATE_WIN = 1;
var STATE_LOSE = 2;

window.addEventListener('keydown', function(event) 
	{
	if(typeof gTheGame != 'undefined')
		gTheGame.keyDown(event.keyCode);
	}, false
);

window.addEventListener('keyup', function(event) 
	{
	if(typeof gTheGame != 'undefined')
		gTheGame.keyUp(event.keyCode);
	}, false
);

function Game()
{
	//Public Variables
	this._sceneObjects = new EntityList();
	
	this._images = new Array(); //Image objects
	this._sounds = new Array();
	
	this._brains = new Array();
	
	this._tickCount = 0;
	this._lastTickTime = 0.0;

	this._imagesLoading = 0;
	this._imagesLoaded = 0;
	this._soundsLoading = 0;
	this._soundsLoaded = 0;
	
	this._deltaTime = 0;
	
	this._keysPressed = {};
	
	this._ctx2D = {};
	this._viewportWidth = 0;
	this._viewportHeight = 0;
	
	this._cameraPos = new Vec2(0, 0);
	
	this._map = {};
	this._playerCharacter = {};
	this._playerAttention = 0.0;
	this._playerDetection = 0.0;
	
	this._objectiveRoom = new Array();
	this._objectiveGrid = new Array();
	
	this._reset = false;
	
	this._state = STATE_PLAY;
	
	this._attentionClose 	= "";
	this._attentionCloseColor = "";
	this._attentionMove 	= "";
	this._attentionMoveColor = "";
	this._attentionWork 	= "";
	this._attentionWorkColor = "";
	
};
	
Game.prototype.startImageLoad = function(shortname, filepath)
{
	this._imagesLoading++;
	var imageObj = new Image();
	imageObj.onload = gTheGame.imageLoaded();
	imageObj.src = filepath;
	imageObj.game_shortname = shortname;
	
	this._images.push(imageObj)
};

Game.prototype.imageLoaded = function()
{
	this._imagesLoaded++;
};

Game.prototype.getImage = function(shortname)
{
	for(var i = 0; i < this._images.length; i++)
	{
		if(this._images[i].game_shortname === shortname)
		{
			return this._images[i];
		}
	}
	
	return null;
};

Game.prototype.startAudioLoad = function(shortname, filepath)
{
	this._soundsLoading++;
	var soundObj = new Audio();
	soundObj.onload = gTheGame.soundLoaded();
	soundObj.src = filepath;
	soundObj.game_shortname = shortname;
	
	this._sounds.push(soundObj)
};

Game.prototype.soundLoaded = function()
{
	this._soundsLoaded++;
};

Game.prototype.getSound = function(shortname)
{
	for(var i = 0; i < this._sounds.length; i++)
	{
		if(this._sounds[i].game_shortname === shortname)
		{
			return this._sounds[i];
		}
	}
	
	return null;
};

Game.prototype.resourcesLoaded = function()
{
	return (this._imagesLoaded >= this._imagesLoading) && (this._soundsLoaded >= this._soundsLoading);
};

Game.prototype.setContext = function(context)
{
	this._ctx2D = context;
};
	
Game.prototype.getContext = function()
{
	return this._ctx2D;
};

Game.prototype.setViewport = function(width, height)
{
	this._viewportWidth = width;
	this._viewportHeight = height;
};
	
Game.prototype.clearCanvas = function()
{
	this._ctx2D.fillStyle="grey";
	this._ctx2D.fillRect(0,0,this._viewportWidth,this._viewportHeight);
};
	
Game.prototype.addMap = function(map)
{
	this._map = map;
	this._sceneObjects.addEntity(map);
};	

Game.prototype.addPlayer = function(playerCharacter)
{
	this._playerCharacter = playerCharacter;
	this._sceneObjects.addEntity(playerCharacter);
};	

Game.prototype.render = function()
{
	console.log("rendering");
	
	if(this._ctx2D !== 'undefined')
	{
		this.clearCanvas();
		this._sceneObjects.render(this._ctx2D);
		this.renderHUD();
	}
	else
	{
		console.log("ERROR: Missing cavnas context.");
	}
};

Game.prototype.renderHUD = function()
{
	this._ctx2D.font = "20px Arial";
	
	if(this._playerDetection >= 75)
		this._ctx2D.fillStyle = "#FF0000";
	else if(this._playerDetection >= 50)
		this._ctx2D.fillStyle = "#FFFF00";
	else
		this._ctx2D.fillStyle = "#00FF00";
	this._ctx2D.fillText("Detection: " + Math.round(this._playerDetection), 50, 50);
	
	if(this._playerAttention >= 60)
		this._ctx2D.fillStyle = "#FF0000";
	else if(this._playerAttention >= 30)
		this._ctx2D.fillStyle = "#FFFF00";
	else
		this._ctx2D.fillStyle = "#00FF00";
	this._ctx2D.fillText("Attention: " + Math.round(this._playerAttention), 50, 75);
	
	this._ctx2D.fillStyle = "#00FF00";
	this._ctx2D.fillText("RoomStatus: ", 50, 100);
	this._ctx2D.font = "15px Arial";
	this._ctx2D.fillStyle = this._attentionCloseColor;
	this._ctx2D.fillText(this._attentionClose, 50, 125);
	this._ctx2D.fillStyle = this._attentionMoveColor;
	this._ctx2D.fillText(this._attentionMove, 50, 150);
	this._ctx2D.fillStyle = this._attentionWorkColor;
	this._ctx2D.fillText(this._attentionWork, 50, 175);
};

Game.prototype.renderWin = function()
{
	this._ctx2D.fillStyle = "#00FF00";
	this._ctx2D.font = "50px Arial";
	this._ctx2D.fillText("YOU WON THE GAME!", 150, 200);
	this._ctx2D.font = "13px Arial";
	this._ctx2D.fillText("congrats!", 615, 225);
	this._ctx2D.font = "20px Arial";
	this._ctx2D.fillText("Press SPACEBAR to restart.", 280, 400);
};

Game.prototype.renderLose = function()
{
	this._ctx2D.fillStyle = "#FF0000";
	this._ctx2D.font = "50px Arial";
	this._ctx2D.fillText("YOU LOST THE GAME!", 150, 200);
	this._ctx2D.font = "20px Arial";
	this._ctx2D.fillText("Pretend I animated a scene of your guy getting arrested or something...", 150, 275);
	this._ctx2D.font = "20px Arial";
	this._ctx2D.fillText("Press SPACEBAR to restart.", 280, 400);
};

Game.prototype.processDeltaTime = function()
{
	var currentTime = new Date().getTime();
	
	if(this._tickCount < 1)
    {
        this._lastTickTime = currentTime;
        return 0.0;
    }
	
    this._deltaTime = (currentTime - this._lastTickTime)/1000;
    this._lastTickTime = currentTime;
};

Game.prototype.processPlayer = function()
{
	if(this._playerCharacter !== 'undefined')
	{
		var roomRef = this._map._roomGrid[this._playerCharacter._currentRoomPos._y][this._playerCharacter._currentRoomPos._x];
		
		if(this._objectiveRoom.length === 0 && roomRef.isExit(this._playerCharacter._gridPos))
			this._state = STATE_WIN;
		
		this._playerAttention = roomRef.howMuchAttention(this._playerCharacter);
		
		this._playerCharacter.processPlayerInput();
		this._cameraPos = this._playerCharacter._realPos.clone();
		this._cameraPos._y -= this._viewportHeight * 0.5;
		this._cameraPos._x -= this._viewportWidth * 0.5;
	}
};

Game.prototype.processWin = function()
{
	if(this.keyPressed(KEY_ACTION))
		this._reset = true;
};

Game.prototype.processLose = function()
{
	if(this.keyPressed(KEY_ACTION))
		this._reset = true;
};

Game.prototype.onGuardSeePlayer = function(deltaTime)
{
	this._playerDetection += this._playerAttention * DETECTION_RATE * deltaTime;
	if(this._playerDetection >= DETECTION_LIMIT)
		this._state = STATE_LOSE;
}

Game.prototype.processAI = function()
{
	for(var i = 0; i < this._brains.length; i++)
	{
		this._brains[i].process(this._deltaTime);
	}
};

Game.prototype.clockTick = function()
{
	this._tickCount++;
};

Game.prototype.renderLoadingScreen = function()
{
	if(this._ctx2D !== 'undefined')
	{
		this.clearCanvas();
		this._ctx2D.fillStyle = "white";
		this._ctx2D.font = "20px Arial";
		this._ctx2D.fillText("Loading...", 100, 100);
	}
	else
	{
		console.log("ERROR: Missing canvas context.");
	}
};

Game.prototype.loop = function()
{
	this.processDeltaTime();
	
	switch(this._state)
	{
		case STATE_PLAY :
		{
			if(!this.resourcesLoaded())
			{
				this.renderLoadingScreen();
			}
			else
			{
				//Main Loop
				this.processPlayer();
				this.processAI();
				
				this.preTick(this._deltaTime);
				
				this.render();
				
				this.postTick(this._deltaTime);
				
				this.clockTick();
			}
		}
		break;
		case STATE_WIN :
		{
			this.processWin();
			this.render();
			this.renderWin();
		}
		break;
		case STATE_LOSE :
		{
			this.processLose();
			this.render();
			this.renderLose();
		}
		break;
	}
	
};

Game.prototype.preTick = function(deltaTime)
{
	this._sceneObjects.preTick(deltaTime);
}

Game.prototype.postTick = function(deltaTime)
{
	this._sceneObjects.postTick(deltaTime);
};

Game.prototype.keyDown = function(keyCode)
{
	this._keysPressed[keyCode] = true;
};

Game.prototype.keyUp = function(keyCode)
{
	delete this._keysPressed[keyCode];
};

Game.prototype.keyPressed = function(keyCode)
{
	return this._keysPressed[keyCode];
};

Game.prototype.isObjective = function(roomRef, gridPos)
{
	for(var i = 0; i < this._objectiveRoom.length; i++)
	{
		var objectiveRoom = this._map._roomGrid[this._objectiveRoom[i]._y][this._objectiveRoom[i]._x];
		if(objectiveRoom === roomRef)
		{
			if(this._objectiveGrid[i].isEqual(gridPos))
				return true;
		}
	}
	
	return false;
};

Game.prototype.completeObjective = function(roomRef, gridPos)
{
	for(var i = 0; i < this._objectiveRoom.length; i++)
	{
		var objectiveRoom = this._map._roomGrid[this._objectiveRoom[i]._y][this._objectiveRoom[i]._x];
		if(objectiveRoom === roomRef)
		{
			if(this._objectiveGrid[i].isEqual(gridPos))
			{
				this._objectiveRoom.splice(i, 1);
				this._objectiveGrid.splice(i, 1);
			}
		}
	}
};