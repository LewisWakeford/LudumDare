/**
	Class: EntityList
	Renders everything in it.
*/

function EntityList(game)
{
	this.entities = new Array();
	this.game = game;
}

EntityList.prototype.addEntity = function(entity)
{
	this.entities.push(entity);
};

EntityList.prototype.preTick = function(deltaTime)
{
	for(var i = 0; i < this.entities.length; i++)
	{
		if(typeof this.entities[i].preTick === 'function')
		{
			this.entities[i].preTick(deltaTime);
		}
	}
};

EntityList.prototype.render = function(context)
{
	for(var i = 0; i < this.entities.length; i++)
	{
		var currentEntity = this.entities[i];
		
		if(typeof currentEntity.render === 'function')
		{
			currentEntity.render(context);
		}
	}
};

EntityList.prototype.postTick = function(deltaTime)
{
	for(var i = 0; i < this.entities.length; i++)
	{
		if(typeof this.entities[i].postTick === 'function')
		{
			this.entities[i].postTick(deltaTime);
		}
	}
};