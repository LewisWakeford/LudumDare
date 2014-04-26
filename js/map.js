var MAPTILE_BLANK 		= 0;
var MAPTILE_WALL 		= 1;
var MAPTILE_COMPUTER 	= 2;

var MAP_TILESIZE = 50;
var MAP_TILESIZE_HALF = MAP_TILESIZE * 0.5;
var MAP_ROOMSIZE = 15;

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
	
	this.buildAIGrid();
};

Room.prototype.buildAIGrid = function()
{

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
					//TODO: Use Sprite
					var posX = origin._x + (x * MAP_TILESIZE) - gTheGame._cameraPos._x;
					var posY = origin._y + (y * MAP_TILESIZE) - gTheGame._cameraPos._y;
					
					context.fillStyle="red";
					context.fillRect(posX,posY,MAP_TILESIZE,MAP_TILESIZE);
				}
				break;
			}
		}
	}
};

Room.prototype.postTick = function(deltaTime)
{
	
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