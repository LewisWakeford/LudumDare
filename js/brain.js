/**
	Class: Brain
	AI Thingy
*/

var BRAIN_MAX_PROCESS_TIME = 0.3;

var TASK_CONTINUE = 0; //Still processing
var TASK_COMPLETE = 1; //Move along

function Brain(controllingCharacter)
{
	this._character = controllingCharacter;
	this._taskList = new Array();
	this._currentTaskIndex = 0;
	this._timeToProcess = 0.0;
};

Brain.prototype.addTask = function(task)
{
	this._taskList.push(task);
	task._brain = this;
	
	if(this._taskList.length === 1)
		task.init();
};

Brain.prototype.process = function(deltaTime)
{
	var processResult = TASK_COMPLETE;
	this._timeToProcess = deltaTime;
	if(this._timeToProcess > BRAIN_MAX_PROCESS_TIME)
		this._timeToProcess = BRAIN_MAX_PROCESS_TIME;
	
	while(processResult === TASK_COMPLETE)
	{
		processResult = this._taskList[this._currentTaskIndex].process();
		if(processResult === TASK_COMPLETE)
		{
			this._currentTaskIndex++;
			
			if(this._currentTaskIndex >= this._taskList.length)
				this._currentTaskIndex = 0; //Loop back to first task.
	
			this._taskList[this._currentTaskIndex].init();
		}
	}
};

/**
	Class: WaitTask
	Wait for X seconds...
*/

function WaitTask(duration)
{
	this._brain = {};
	this._timer = 0.0;
	this._duration = duration;
}

WaitTask.prototype.init = function()
{
	this._timer = 0.0;
}

WaitTask.prototype.process = function()
{
	this._timer += this._brain._timeToProcess;
	
	if(this._timer > this._duration)
	{
		this._brain._timeToProcess -= this._duration;
		return TASK_COMPLETE;
	}	
	else
	{
		this._brain._timeToProcess = 0.0;
		return TASK_CONTINUE;
	}
}

/**
	Class: FaceTask
	Face a direction
*/

function FaceTask(direction)
{
	this._brain = {};
	this._direction = direction;
}

FaceTask.prototype.init = function()
{
	
}

FaceTask.prototype.process = function()
{
	this._brain._character.faceDirection(this._direction);
	
	return TASK_COMPLETE;
}

/**
	Class: RoomMoveTask
	Move to a place within the same room.
*/

function RoomMoveTask(gridPos)
{
	this._brain = {};
	this._path = {};
	this._currentPathIndex = 0;
	this._destination = gridPos;
}

RoomMoveTask.prototype.init = function()
{
	var roomPos = this._brain._character._currentRoomPos;
	var roomRef = gTheGame._map._roomGrid[roomPos._y][roomPos._x];
	this._path = gPathFinder.findPath(this._brain._character._gridPos._x, this._brain._character._gridPos._y, this._destination._x, this._destination._y, roomRef._aiGrid.clone());
	
	this._currentPathIndex = 0;
}

RoomMoveTask.prototype.process = function()
{
	var done = this._currentPathIndex >= this._path.length;
	
	while(!done)
	{
		done = true;
		var currentPos = this._brain._character._gridPos;
		var xDelta = this._path[this._currentPathIndex][0] - currentPos._x;
		var yDelta = this._path[this._currentPathIndex][1] - currentPos._y;
		
		if(xDelta > 0)
		{
			this._brain._character.setNextMoveDir(DIRECTION_RIGHT);
		}
		else if(xDelta < 0)
		{
			this._brain._character.setNextMoveDir(DIRECTION_LEFT);
		}
		else if(yDelta > 0)
		{
			this._brain._character.setNextMoveDir(DIRECTION_DOWN);
		}
		else if(yDelta < 0)
		{
			this._brain._character.setNextMoveDir(DIRECTION_UP);
		}
		else
		{
			this._brain._character.setNextMoveDir(-1);
			this._currentPathIndex++;
			if(this._currentPathIndex < this._path.length-1)
				done = false; //Need to try again.
		}
	}
	
	if(this._currentPathIndex < this._path.length || this._brain._character._isMoving)
	{
		this._brain._timeToProcess = 0.0;
		return TASK_CONTINUE;
	}
	else
	{
		return TASK_COMPLETE;
	}
};