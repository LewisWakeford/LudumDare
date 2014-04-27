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
	Class: Trigger
	Really simplistic Event type structure
*/

function Trigger()
{
	this._listeners = new Array();
};

Trigger.prototype.addListener = function(listener)
{
	this._listeners.push(listener);
};

Trigger.prototype.trigger = function()
{
	for(var i = 0; i < this._listeners.length; i++)
	{
		this._listeners[i].trigger();
	}
	this._listeners.length = 0;
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
};

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
		if(this._brain._timeToProcess < 0.0)
			this._brain._timeToProcess = 0.0;
			
		return TASK_COMPLETE;
	}	
	else
	{
		this._brain._timeToProcess = 0.0;
		return TASK_CONTINUE;
	}
}

/**
	Class: WaitForTriggerTask
	Wait for a trigger to go...
*/
function WaitForTriggerTask(trigger)
{
	this._brain = {};
	this._trigger = trigger;
	this._ready = false;
};

WaitForTriggerTask.prototype.init = function()
{
	this._trigger.addListener(this);
	this._ready = false;
};

WaitForTriggerTask.prototype.trigger = function()
{
	this._ready = true;
};

WaitForTriggerTask.prototype.process = function()
{	
	if(this._ready)
	{			
		return TASK_COMPLETE;
	}	
	else
	{
		this._brain._timeToProcess = 0.0;
		return TASK_CONTINUE;
	}
};

/**
	Class: TriggerTask
	Call a trigger...
*/
function TriggerTask(trigger)
{
	this._brain = {};
	this._trigger = trigger;
};

TriggerTask.prototype.init = function()
{
};

TriggerTask.prototype.trigger = function()
{
};

TriggerTask.prototype.process = function()
{	
	this._trigger.trigger();
	return TASK_COMPLETE;
};

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
	this._brain._character.tryToStopInteraction();
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

/**
	Class: MapMoveTask
	Move to a place within a (potentially) different room.
*/

function MapMoveTask(roomPos, gridPos)
{
	this._brain = {};
	this._currentPathIndex = 0;
	this._destRoom = roomPos;
	this._destGrid = gridPos;
	
	this._path = null;
	this._roomMoveTask = null;
}

MapMoveTask.prototype.init = function()
{
	var roomPos = this._brain._character._currentRoomPos;
	this._roomMoveTask = null;
	
	if(roomPos.isEqual(this._destRoom)) //Already in the room.
	{
		this._roomMoveTask = new RoomMoveTask(this._destGrid);
		this._roomMoveTask._brain = this._brain;
		this._roomMoveTask.init();
	}
	else
	{
		var roomAIPos = new Vec2(roomPos._x * 2.0, roomPos._y * 2.0);
		var destAIPos = new Vec2(this._destRoom._x * 2.0, this._destRoom._y * 2.0);
		
		this._path = gPathFinder.findPath(roomAIPos._x, roomAIPos._y, destAIPos._x, destAIPos._y, gTheGame._map._aiGrid.clone());
	}
	
	this._currentPathIndex = 0;
}

MapMoveTask.prototype.process = function()
{
	var roomPos = this._brain._character._currentRoomPos;
	var gridPos = this._brain._character._gridPos;
	
	if(this._roomMoveTask)
	{
		var processResult = this._roomMoveTask.process();
		
		if(processResult === TASK_COMPLETE)
		{
			if(roomPos.isEqual(this._destRoom)) //Reached destination
			{
				this._brain._timeToProcess = 0.0;
				this._roomMoveTask = null;
				this._brain._character.setNextMoveDir(-1);
				return TASK_COMPLETE
			}
			else
			{
				this._roomMoveTask = null;
			}
		}
	}
	
	if(!this._roomMoveTask)
	{
		var roomAIPos = new Vec2(roomPos._x * 2.0, roomPos._y * 2.0);
		
		var done = false
		
		var targetPos = null;
		var xDelta = 0;
		var yDelta = 0;
		
		while(!done)
		{
			done = true;
			xDelta = this._path[this._currentPathIndex][0] - roomAIPos._x;
			yDelta = this._path[this._currentPathIndex][1] - roomAIPos._y;
			
			var roomRef = gTheGame._map._roomGrid[roomPos._y][roomPos._x];
			
			if(xDelta > 0)
			{
				targetPos = roomRef._rightDoor;
			}
			else if(xDelta < 0)
			{
				targetPos = roomRef._leftDoor;
			}
			else if(yDelta > 0)
			{
				targetPos = roomRef._downDoor;
			}
			else if(yDelta < 0)
			{
				targetPos = roomRef._upDoor;
			}
			else
			{
				if(roomPos.isEqual(this._destRoom)) //Reached destination
				{
					targetPos = this._destGrid;
				}
				else
				{
					this._currentPathIndex += 2;
					done = false;
				}
			}
		}
		
		
		if(gridPos.isEqual(targetPos))
		{
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
				this._brain.timeToProcess = 0.0;
				return TASK_COMPLETE;
			}
		}
		else
		{	
			this._roomMoveTask = new RoomMoveTask(targetPos);
			this._roomMoveTask._brain = this._brain;
			this._roomMoveTask.init();
		}
	}
	
	return TASK_CONTINUE;
};

/**
	Class: InteractTask
	Interact for a bit.
*/

function InteractTask(duration)
{
	this._brain = {};
	this._timer = 0.0;
	this._duration = duration;
}

InteractTask.prototype.init = function()
{
	this._timer = 0.0;
}

InteractTask.prototype.process = function()
{
	this._brain._character.tryToStartInteraction();

	this._timer += this._brain._timeToProcess;
	
	if(this._timer > this._duration)
	{
		this._brain._timeToProcess -= this._duration;
		if(this._brain._timeToProcess < 0.0)
			this._brain._timeToProcess = 0.0;
			
		return TASK_COMPLETE;
	}	
	else
	{
		this._brain._timeToProcess = 0.0;
		return TASK_CONTINUE;
	}
};