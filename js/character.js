/**
	Class: Character
*/

var CHARSHEET_CHAR_WIDTH = 11;
var CHARSHEET_CHAR_HEIGHT = 26;
var CHARACTER_SCALE = 2.0;
var CHARACTER_SPEED = 150.0;

var DIRECTION_LEFT 	= 0;
var DIRECTION_RIGHT = 1;
var DIRECTION_UP 	= 2;
var DIRECTION_DOWN 	= 3;

var HACK_TIME = 3.0;

var GUARD_SIGHTRANGE = 6 * MAP_TILESIZE;

var CLOSENESS_DISTANCE_MOD = 0.5;

function Character(startRoomPos, startGridPos, characterId)
{
	this._currentRoomPos = startRoomPos;
	this._gridPos = startGridPos;
	this._targetPos = this.getTargetPos();
	this._realPos = this._targetPos;
	this._characterId = characterId;
	this._animFrame = 0;
	this._imageRef = gTheGame.getImage("charsheet");
	this._isMoving = false;
	this._nextMoveDir = -1;
	this._interacting = false;
	this._interactTimer = 0.0;
	this._closeness = 0.0;
	
	var roomRef = gTheGame._map._roomGrid[startRoomPos._y][startRoomPos._x];
	roomRef.addCharacter(this);
};


Character.prototype.preTick = function(deltaTime)
{	
	var timeToMove = deltaTime;
	
	while(timeToMove > 0.0)
	{
		if(this._isMoving)
		{
			var toTarget = this._targetPos.diff(this._realPos);
			var distance = toTarget.mag();
			var moveThisTick = CHARACTER_SPEED * deltaTime;
			
			if(distance < moveThisTick)
			{
				timeToMove -= distance / CHARACTER_SPEED;
				this._realPos = this._targetPos.clone();
				this._isMoving = false;
			}
			else
			{
				timeToMove = 0.0;
				toTarget.normalise();
				toTarget.scale(moveThisTick);
				this._realPos.add(toTarget);
			}
		}
		
		if(!this._isMoving)
		{
			this.startNewMove(this._nextMoveDir);
			this._nextMoveDir = -1;
		}
		
		if(!this._isMoving)
			timeToMove = 0.0;
	}
	
	
	if(!this._isMoving)
	{
		if(this._interacting)
		{
			this._interactTimer += deltaTime;	
			this.faceDirection(DIRECTION_UP);
			
			if(this._interactTimer >= HACK_TIME)
			{
				var roomRef = gTheGame._map._roomGrid[this._currentRoomPos._y][this._currentRoomPos._x];
				if(gTheGame.isObjective(roomRef, this._gridPos))
					gTheGame.completeObjective(roomRef, this._gridPos);
			}
		}
	}
};

Character.prototype.render = function(context)
{
	var clipX = this._animFrame * CHARSHEET_CHAR_WIDTH;
	var clipY = this._characterId * CHARSHEET_CHAR_HEIGHT;
	
	var characterWidth = CHARSHEET_CHAR_WIDTH*CHARACTER_SCALE;
	var characterHeight = CHARSHEET_CHAR_HEIGHT*CHARACTER_SCALE;
	
	var posX = this._realPos._x - gTheGame._cameraPos._x - (characterWidth * 0.5);
	var posY = this._realPos._y - gTheGame._cameraPos._y - (characterHeight * 0.5);
	
	context.drawImage(this._imageRef, clipX, clipY, CHARSHEET_CHAR_WIDTH, CHARSHEET_CHAR_HEIGHT, posX, posY, characterWidth, characterHeight);
	
	if(this._interacting)
	{
		context.fillStyle = "white";
		context.font = "15px Arial Bold";
		var numDots = ((this._interactTimer / HACK_TIME) * 6) % 6;
		var text = "";
		while(numDots > 0.0)
		{
			text += ".";
			numDots -= 1.0;
		}
		context.fillText(text, posX, posY);
	}
	
	/*
	context.fillStyle = "red";
	context.font = "15px Arial Bold";
	context.fillText(this._closeness, posX, posY);
	*/
};

Character.prototype.postTick = function(deltaTime)
{
	if(this._characterId === 1)
	{
		if(this.canSeePlayer())
		{
			gTheGame.onGuardSeePlayer(deltaTime);
		}
	}
};

Character.prototype.canSeePlayer = function()
{
	if(this._currentRoomPos.isEqual(gTheGame._playerCharacter._currentRoomPos))
	{
		var toPlayer = gTheGame._playerCharacter._realPos.diff(this._realPos);
		var faceDir;
		
		var distance = toPlayer.mag();
		
		if(distance > GUARD_SIGHTRANGE)
			return false;
		
		if(this._animFrame === 2)
			faceDir = new Vec2(-1, 0);
		else if(this._animFrame === 1)
			faceDir = new Vec2(1,0);
		else if(this._animFrame === 3)
			faceDir = new Vec2(0, -1);
		else if(this._animFrame === 0)
			faceDir = new Vec2(0, 1);

		var dotProduct = faceDir.dotProduct(toPlayer);
		
		if(dotProduct >= 0.0)
			return true;
			
	}
	
	return false;
};

Character.prototype.getTargetPos = function()
{
	return gTheGame._map.getTargetPos(this, this._currentRoomPos, this._gridPos);
};

Character.prototype.faceDirection = function(direction)
{
	if(!this._isMoving)
	{
		switch(direction)
		{
			case DIRECTION_LEFT :
			{
				this._animFrame = 2;
			}
			break;
			case DIRECTION_RIGHT :
			{
				this._animFrame = 1;
			}
			break;
			case DIRECTION_UP :
			{
				this._animFrame = 3;
			}
			break;
			case DIRECTION_DOWN :
			{
				this._animFrame = 0;
			}
			break;
		}
	}
	
};

Character.prototype.setNextMoveDir = function(direction)
{
	this._nextMoveDir = direction;
};

Character.prototype.startNewMove = function(direction)
{
	if(direction === -1)
		return;

	if(this._isMoving)
		return; //Shouldn't have called this anyway.
		
	var dir = new Vec2(0, 0);
		
	this.faceDirection(direction);
		
	switch(direction)
	{
		case DIRECTION_LEFT :
		{
			dir._x = -1;
		}
		break;
		case DIRECTION_RIGHT :
		{
			dir._x = 1;
		}
		break;
		case DIRECTION_UP :
		{
			dir._y = -1;
		}
		break;
		case DIRECTION_DOWN :
		{
			dir._y = 1;
		}
		break;
	}
	
	if(dir._x != 0 || dir._y != 0)
	{
		var testPos = this._gridPos.sum(dir);

		if(gTheGame._map.isWalkable(this._currentRoomPos, testPos))
		{
			this._gridPos = testPos;
			gTheGame._map.fixupGridPos(this._currentRoomPos, this._gridPos);
			
			var oldRoomRef = gTheGame._map._roomGrid[this._currentRoomPos._y][this._currentRoomPos._x];
			
			//Javascript you cray cray...
			this._currentRoomPos = this._currentRoomPos.value.clone();
			this._gridPos = this._gridPos.value.clone();
			
			var newRoomRef = gTheGame._map._roomGrid[this._currentRoomPos._y][this._currentRoomPos._x];
			
			if(oldRoomRef !== newRoomRef)
			{
				oldRoomRef.removeCharacter(this);
				newRoomRef.addCharacter(this);
			}
			
			this._targetPos = this.getTargetPos();
			this._isMoving = true;
			
			this.tryToStopInteraction();
		}
	}
};

Character.prototype.tryToStartInteraction = function()
{
	if(this._isMoving)
		return;
		
	if(this._interacting)
		return;
		
	var roomRef = gTheGame._map._roomGrid[this._currentRoomPos._y][this._currentRoomPos._x];
	if(roomRef._grid[this._gridPos._y][this._gridPos._x] === MAPTILE_COMPUTER)
	{
		this._interacting = true;
		this._interactTimer = 0.0;
	}
};

Character.prototype.tryToStopInteraction = function()
{
	this._interacting = false;
	this._interactTimer = 0.0;
};

Character.prototype.processPlayerInput = function()
{	
	if(gTheGame.keyPressed(KEY_LEFT))
	{
		this.setNextMoveDir(DIRECTION_LEFT);
	}
	else if(gTheGame.keyPressed(KEY_RIGHT))
	{
		this.setNextMoveDir(DIRECTION_RIGHT);
	}
	else if(gTheGame.keyPressed(KEY_FORWARD))
	{
		this.setNextMoveDir(DIRECTION_UP);
	}
	else if(gTheGame.keyPressed(KEY_BACKWARD))
	{
		this.setNextMoveDir(DIRECTION_DOWN);
	}
	else 
		this.setNextMoveDir(-1);
		
	if(gTheGame.keyPressed(KEY_ACTION))
	{
		this.tryToStartInteraction();
	}
};

//Closeness is an abstraction based on how many other characters are nearby.
Character.prototype.calculateCloseness = function(otherCharacters)
{
	this._closeness = 0.0;
	for(var i = 0; i < otherCharacters.length; i++)
	{
		if(otherCharacters[i] === this)
			continue;
			
		var toOther = otherCharacters[i]._realPos.diff(this._realPos);
		var distance = Math.max(1.0, (toOther.mag()/MAP_TILESIZE)*CLOSENESS_DISTANCE_MOD);
		this._closeness += 1.0 / distance;
	}
};