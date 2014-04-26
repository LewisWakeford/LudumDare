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
	
function loopGame()
{
	gTheGame.loop();
	var nextFrame = FRAME_RATE-gTheGame._deltaTime;
	nextFrame = Math.min(nextFrame, FRAME_RATE);
	nextFrame = Math.max(nextFrame, 0.0);
	setTimeout(loopGame, nextFrame);
}

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
	
}
	
Game.prototype.startImageLoad = function(shortname, filepath)
{
	this._imagesLoading++;
	var imageObj = new Image();
	imageObj.onload = gTheGame.imageLoaded();
	imageObj.src = filepath;
	imageObj.game_shortname = shortname;
	
	this._images.push(imageObj)
}

Game.prototype.imageLoaded = function()
{
	this._imagesLoaded++;
}

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
}

Game.prototype.startAudioLoad = function(shortname, filepath)
{
	this._soundsLoading++;
	var soundObj = new Audio();
	soundObj.onload = gTheGame.soundLoaded();
	soundObj.src = filepath;
	soundObj.game_shortname = shortname;
	
	this._sounds.push(soundObj)
}

Game.prototype.soundLoaded = function()
{
	this._soundsLoaded++;
}

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
}

Game.prototype.resourcesLoaded = function()
{
	return (this._imagesLoaded >= this._imagesLoading) && (this._soundsLoaded >= this._soundsLoading);
}	

Game.prototype.setContext = function(context)
{
	this._ctx2D = context;
}
	
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
	}
	else
	{
		console.log("ERROR: Missing cavnas context.");
	}
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

Game.prototype.processPlayerInput = function()
{
	if(this._playerCharacter !== 'undefined')
	{
		this._playerCharacter.processPlayerInput();
		this._cameraPos = this._playerCharacter._realPos.clone();
		this._cameraPos._y -= this._viewportHeight * 0.5;
		this._cameraPos._x -= this._viewportWidth * 0.5;
	}
};

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
	
	if(!this.resourcesLoaded())
	{
		this.renderLoadingScreen();
	}
	else
	{
		//Main Loop
		this.processPlayerInput();
		this.processAI();
		
		this.preTick(this._deltaTime);
		
		this.render();
		
		this.postTick(this._deltaTime);
		
		this.clockTick();
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