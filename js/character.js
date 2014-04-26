/**
	Class: Character
*/

var CHARSHEET_CHAR_WIDTH = 11;
var CHARSHEET_CHAR_HEIGHT = 26;
var CHARACTER_SCALE = 2.0;
var CHARACTER_SPEED = 0.2;

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
};


Character.prototype.preTick = function(deltaTime)
{
	if(this._isMoving)
	{
		var toTarget = this._targetPos.diff(this._realPos);
		var distance = toTarget.mag();
		var moveThisTick = CHARACTER_SPEED * deltaTime;
		
		if(distance < moveThisTick)
		{
			this._realPos = this._targetPos.clone();
			this._isMoving = false;
		}
		else
		{
			toTarget.normalise();
			toTarget.scale(moveThisTick);
			this._realPos.add(toTarget);
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
};

Character.prototype.postTick = function(deltaTime)
{
	
};

Character.prototype.getTargetPos = function()
{
	return gTheGame._map.getTargetPos(this, this._currentRoomPos, this._gridPos);
};

Character.prototype.processPlayerInput = function()
{
	if(!this._isMoving)
	{
		var dir = new Vec2(0, 0);
		
		if(gTheGame.keyPressed(KEY_LEFT))
		{
			dir._x = -1;
			this._animFrame = 2;
		}
		else if(gTheGame.keyPressed(KEY_RIGHT))
		{
			dir._x = 1;
			this._animFrame = 1;
		}
		else if(gTheGame.keyPressed(KEY_FORWARD))
		{
			dir._y = -1;
			this._animFrame = 3;
		}
		else if(gTheGame.keyPressed(KEY_BACKWARD))
		{
			dir._y = 1;
			this._animFrame = 0;
		}
	
		if(dir._x != 0 || dir._y != 0)
		{
			var testPos = this._gridPos.sum(dir);
	
			if(gTheGame._map.isWalkable(this._currentRoomPos, testPos))
			{
				this._gridPos = testPos;
				gTheGame._map.fixupGridPos(this._currentRoomPos, this._gridPos);
				
				//Javascript you cray cray...
				this._currentRoomPos = this._currentRoomPos.value.clone();
				this._gridPos = this._gridPos.value.clone();
				
				this._targetPos = this.getTargetPos();
				this._isMoving = true;
			}
		}
		
	}
	

};