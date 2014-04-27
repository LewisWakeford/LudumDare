var MAPTILE_BLANK 		= 0;
var MAPTILE_WALL 		= 1;
var MAPTILE_COMPUTER 	= 2;
var MAPTILE_AIDOOR		= 3;
var MAPTILE_PLAYEREXIT  = 4;

var MAP_TILESIZE = 50;
var MAP_TILESIZE_HALF = MAP_TILESIZE * 0.5;
var MAP_ROOMSIZE = 15;

var ATTENTION_CLOSENESS_THRESHOLD = 0.2;
var ATTENTION_CLOSENESS_MOD = 30.0;
var ATTENTION_MOVE = 30.0;
var ATTENTION_WORK = 30.0;

/**
	Class: Room
	One room in the map.
*/
function Room(grid/*, width, height*//*Fixed room size for now.*/)
{
	this._grid = grid;
	this._width = MAP_ROOMSIZE/*width*/;
	this._height = MAP_ROOMSIZE/*height*/;
	
	if(this._grid.length != MAP_ROOMSIZE)
		throw "Room's grid is wrong height: " + this._grid.length;
	
	if(this._grid[0].length != MAP_ROOMSIZE)
		throw "Room's grid is wrong width: " + this._grid[0].length;
	
	this._upDooar = null;
	this._downDoor = null;
	this._leftDoor = null;
	this._rightDoor = null;
	
	this._exits = new Array();
	
	this._computerImage = gTheGame.getImage("computer");
	this._fileImage = gTheGame.getImage("file");
	
	this._characters = new Array();
	
	this._averageCloseness 	= 0.0;
	this._moveRatio			= 0.0;
	this._workerRatio		= 0.0;
	
	this.buildAIGrid();
};

Room.prototype.buildAIGrid = function()
{
	var matrix = new Array(this._height);
	for(var y = 0; y < this._height; y++)
	{
		matrix[y] = new Array(this._width);
		for(var x = 0; x < this._width; x++)
		{
			var mapTileId = this._grid[y][x];
			switch(mapTileId)
			{
				case MAPTILE_BLANK :
				{
					matrix[y][x] = 0;
				}
				break;
				case MAPTILE_WALL :
				{
					matrix[y][x] = 1;
				}
				break;
				case MAPTILE_COMPUTER :
				{
					matrix[y][x] = 0;
				}
				break;
				case MAPTILE_AIDOOR :
				{
					this.addAIDoor(x, y);
					matrix[y][x] = MAPTILE_BLANK;
				}
				break;
				case MAPTILE_PLAYEREXIT :
				{
					this._exits.push(new Vec2(x, y));
					matrix[y][x] = MAPTILE_BLANK;
				}
				break;
			}
		}
	}
	
	this._aiGrid = new PF.Grid(matrix[0].length, matrix.length, matrix);
};

Room.prototype.addCharacter = function(character)
{
	this._characters.push(character);
};

Room.prototype.removeCharacter = function(character)
{
	for(var i = 0; i < this._characters.length; i++)
	{
		if(this._characters[i] === character)
		{
			this._characters.splice(i, 1);
		}
	}
};

Room.prototype.analyzeCharacters = function()
{
	//Get averages
	if(this._characters.length < 2)
		return;
	
	var averageCloseness = 0.0;
	var moveRatio = 0.0;
	var workerRatio = 0.0;
	for(var i = 0; i < this._characters.length; i++)
	{
		this._characters[i].calculateCloseness(this._characters);
	
		if(this._characters[i] == gTheGame._playerCharacter)
			continue;
		
		averageCloseness += this._characters[i]._closeness;
		
		if(this._characters[i]._isMoving)
		{
			moveRatio++;
		}
		
		if(this._characters[i]._interacting)
		{
			workerRatio++;
		}
	}
	
	//-1 because we don't include player.
	averageCloseness	/= this._characters.length-1;
	moveRatio			/= this._characters.length-1;
	workerRatio			/= this._characters.length-1;
	
	this._averageCloseness = averageCloseness;
	this._moveRatio = moveRatio;
	this._workerRatio = workerRatio;
};

Room.prototype.howMuchAttention = function(character)
{
	if(this._characters.length < 2)
		return 0;

	var attention = 0;
	
	var closenessDiff = Math.max(0.0,  this._averageCloseness - character._closeness - ATTENTION_CLOSENESS_THRESHOLD);
	var attentionFromCloseness = closenessDiff * ATTENTION_CLOSENESS_MOD;
	
	if(attentionFromCloseness > 0.0)
	{
		gTheGame._attentionClose = "You are standing on your own: +" + Math.floor(attentionFromCloseness) + " Att";
		gTheGame._attentionCloseColor = "red";
		attention += attentionFromCloseness;
	}
	else
	{
		gTheGame._attentionClose = "You look like part of the group, or there is no group.";
		gTheGame._attentionCloseColor = "#00FF00";
	}
	
	if(character._isMoving && this._moveRatio <= 0.2)
	{
		gTheGame._attentionMove = "You are moving around alone: +30 Att";
		gTheGame._attentionMoveColor = "red";
		attention += ATTENTION_MOVE;
	}		
	else if(!character._isMoving && this._moveRatio >= 0.7)
	{
		gTheGame._attentionMove = "You are standing still: +30 Att";
		gTheGame._attentionMoveColor = "red";
		attention += ATTENTION_MOVE;
	}
	else
	{
		if(!character._isMoving)
			gTheGame._attentionMove = "You are standing still like everyone else.";
		else
			gTheGame._attentionMove = "You are moving around with friends";
			
		gTheGame._attentionMoveColor = "#00FF00";
	}
	
	if(character._interacting && this._workerRatio <= 0.0)
	{
		gTheGame._attentionWork = "You are the only one doing any work: +30 Att";
		gTheGame._attentionWorkColor = "red";
		attention += ATTENTION_WORK;
	}
	else if(!character._interacting && this._workerRatio >= 0.6)
	{
		gTheGame._attentionWork = "You should probably be working: +30 Att";
		gTheGame._attentionWorkColor = "red";
		attention += ATTENTION_WORK;
	}
	else
	{
		if(character._interacting)
			gTheGame._attentionWork = "You are working, like most people in this room.";
		else
			gTheGame._attentionWork = "Not everyone is doing work here.";
			
		gTheGame._attentionWorkColor = "#00FF00";
	}
		
	return attention;
};

Room.prototype.addAIDoor = function(x, y)
{
	if(x === 0)
		this._leftDoor = new Vec2(x, y);
	else if(x === this._width-1)
		this._rightDoor = new Vec2(x, y);
	else if(y === 0)
		this._upDoor = new Vec2(x, y);
	else if(y === this._height-1)
		this._downDoor = new Vec2(x, y);
	else
		throw "invalid position for ai door";
};

Room.prototype.isExit = function(gridPos)
{
	for(var i = 0; i < this._exits.length; i++)
	{
		if(this._exits[i].isEqual(gridPos))
			return true;
	}
	
	return false;
};

Room.prototype.preTick = function(deltaTime)
{
	
};

Room.prototype.render = function(origin, context)
{
	for(var y = 0; y < this._height; y++)
	{
		for(var x = 0; x < this._width; x++)
		{
			var mapTileId = this._grid[y][x];
			switch(mapTileId)
			{
				case MAPTILE_BLANK :
				{
					//Do Nothing (background colour can be the floor to save on drawing)
				}
				break;
				case MAPTILE_WALL :
				{
					var posX = origin._x + (x * MAP_TILESIZE) - gTheGame._cameraPos._x;
					var posY = origin._y + (y * MAP_TILESIZE) - gTheGame._cameraPos._y;
					
					context.fillStyle="black";
					context.fillRect(posX,posY,MAP_TILESIZE,MAP_TILESIZE);
				}
				break;
				case MAPTILE_COMPUTER :
				{					
					var posX = origin._x + (x * MAP_TILESIZE) - gTheGame._cameraPos._x;
					var posY = origin._y + (y * MAP_TILESIZE) - gTheGame._cameraPos._y;
					
					context.drawImage(this._computerImage, posX, posY, MAP_TILESIZE, MAP_TILESIZE);
					
					if(gTheGame.isObjective(this, new Vec2(x, y)))
					{
						context.drawImage(this._fileImage, posX, posY-MAP_TILESIZE, MAP_TILESIZE, MAP_TILESIZE);
					}
				}
				break;
			}
		}
	}
};

Room.prototype.postTick = function(deltaTime)
{
	this.analyzeCharacters();
};

Room.prototype.getTargetPos = function(origin, character, gridPos)
{
	var posX = origin._x + (gridPos._x * MAP_TILESIZE) + (MAP_TILESIZE_HALF);
	var posY = origin._y + (gridPos._y * MAP_TILESIZE) + (MAP_TILESIZE_HALF);
	
	return new Vec2(posX, posY);
};

/**
	Class: BlankRoom
	Renders as solid wall, but doesn't actually store any data.
*/
function BlankRoom()
{
	this._width = MAP_ROOMSIZE/*width*/;
	this._height = MAP_ROOMSIZE/*height*/;
};

BlankRoom.prototype.preTick = function(deltaTime)
{
	
};

BlankRoom.prototype.render = function(origin, context)
{			
	var posX = origin._x - gTheGame._cameraPos._x;
	var posY = origin._y - gTheGame._cameraPos._y;

	context.fillStyle="black";
	context.fillRect(posX,posY,MAP_TILESIZE*MAP_ROOMSIZE,MAP_TILESIZE*MAP_ROOMSIZE);
};

BlankRoom.prototype.postTick = function(deltaTime)
{
	
};

/**
	Class: Map
	The collection of rooms.
*/
function Map(roomGrid, width, height)
{
	this._roomGrid = roomGrid;
	this._width = width;
	this._height = height;
	
	this.buildAIGrid();
};

Map.prototype.buildAIGrid = function()
{
	//Build Grid
	var matrix = new Array((2*this._height)-1);
	for(var y = 0; y < matrix.length; y++)
	{
		matrix[y] = new Array((2*this._width)-1);
	}
	
	//Fill grid in
	for(var y = 0; y < this._height; y++)
	{
		for(var x = 0; x < this._width; x++)
		{
			var roomRef = this._roomGrid[y][x];
			if(roomRef instanceof BlankRoom)
			{
				matrix[y*2][x*2] = 1;
				
				if(x < this._width-1)
					matrix[y*2][(x*2)+1] = 1;
					
				if(y < this._height-1)
					matrix[(y*2)+1][x*2] = 1;
			}
			else
			{
				matrix[y*2][x*2] = 0;
				
				if(x < this._width-1)
					matrix[y*2][(x*2)+1] = roomRef._rightDoor ? 0 : 1;
					
				if(y < this._height-1)
					matrix[(y*2)+1][x*2] = roomRef._downDoor ? 0 : 1;
			}
				
			if(x < this._width-1 && y < this._height-1)
				matrix[(y*2)+1][(x*2)+1] = 1;
		}
	}
	
	this._aiGrid = new PF.Grid(matrix[0].length, matrix.length, matrix);
};

Map.prototype.preTick = function(deltaTime)
{
	for(var y = 0; y < this._height; y++)
	{
		for(var x = 0; x < this._width; x++)
		{
			this._roomGrid[y][x].preTick(deltaTime);
		}
	}
};

Map.prototype.render = function(context)
{
	for(var y = 0; y < this._height; y++)
	{
		for(var x = 0; x < this._width; x++)
		{
			var origin = new Vec2(x * MAP_ROOMSIZE * MAP_TILESIZE, y * MAP_ROOMSIZE * MAP_TILESIZE);
			this._roomGrid[y][x].render(origin, context);
		}
	}
};

Map.prototype.postTick = function(deltaTime)
{
	for(var y = 0; y < this._height; y++)
	{
		for(var x = 0; x < this._width; x++)
		{
			this._roomGrid[y][x].postTick(deltaTime);
		}
	}
};

Map.prototype.getTargetPos = function(character, roomPos, gridPos)
{
	var origin = new Vec2(roomPos._x * MAP_ROOMSIZE * MAP_TILESIZE, roomPos._y * MAP_ROOMSIZE * MAP_TILESIZE);
	return this._roomGrid[roomPos._y][roomPos._x].getTargetPos(origin, character, gridPos);
};

Map.prototype.isWalkable = function(roomPos, gridPos)
{
	var tempRoomPos = roomPos.clone();
	var tempGridPos = gridPos.clone();
	
	if(!this.fixupGridPos(tempRoomPos, tempGridPos))
		return false;
		
	tempRoomPos = tempRoomPos.value.clone();
	tempGridPos = tempGridPos.value.clone();
	
	var roomRef = this._roomGrid[tempRoomPos._y][tempRoomPos._x];
			
	var gridCellId = roomRef._grid[tempGridPos._y][tempGridPos._x];
	
	if(gridCellId === MAPTILE_WALL)
		return false;
		
	return true;
};

Map.prototype.fixupGridPos = function(roomPos, gridPos)
{
	var roomRef = this._roomGrid[roomPos._y][roomPos._x];
	
	var newRoomPos = roomPos.clone();
	var newGridPos = gridPos.clone();
	
	if(gridPos._x < 0)
	{
		newRoomPos._x -= 1;
		newGridPos._x = MAP_ROOMSIZE-1;
	}
	else if(gridPos._x >= MAP_ROOMSIZE)
	{
		newRoomPos._x += 1;
		newGridPos._x = 0;
	}
	
	if(gridPos._y < 0)
	{
		newRoomPos._y -= 1;
		newGridPos._y = MAP_ROOMSIZE-1;
	}
	else if(gridPos._y >= MAP_ROOMSIZE)
	{
		newRoomPos._y += 1;
		newGridPos._y = 0;
	}
	
	if(newRoomPos._x < 0 || newRoomPos._x >= this._width || newRoomPos._y < 0 || newRoomPos._y >= this._height)
		return false;
		
	roomRef = this._roomGrid[newRoomPos._y][newRoomPos._x];
	
	if(roomRef instanceof BlankRoom)
		return false;
		
	if(newGridPos._x < 0 || newGridPos._x >= roomRef._width || newGridPos._y < 0 || newGridPos._y >= roomRef._height)
		return false;
		
	//Valid pos
	roomPos.value = newRoomPos;
	gridPos.value = newGridPos;
		
	return true;
};