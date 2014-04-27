//Vec
function Vec2(x, y)
{
	this._x = x;
	this._y = y;
};

Vec2.prototype.clone = function()
{
	return new Vec2(this._x, this._y);
};

Vec2.prototype.isEqual = function(otherVec)
{
	return (this._x === otherVec._x) && (this._y === otherVec._y);
};

Vec2.prototype.add = function(otherVec)
{
	this._x += otherVec._x;
	this._y += otherVec._y;
};

Vec2.prototype.sum = function(otherVec)
{
	return new Vec2(this._x + otherVec._x, this._y + otherVec._y);
};

Vec2.prototype.diff = function(otherVec)
{
	return new Vec2(this._x - otherVec._x, this._y - otherVec._y);
};

Vec2.prototype.scale = function(multiplier)
{
	this._x *= multiplier;
	this._y *= multiplier;
};

Vec2.prototype.mag = function()
{
	return Math.sqrt((this._x * this._x) + (this._y * this._y));
};

Vec2.prototype.normalise = function()
{
	var mag = this.mag();
	if(mag > 0.0)
	{
		this._x = this._x / mag;
		this._y = this._y / mag;
	}
};

Vec2.prototype.dotProduct = function(otherVec)
{
	return (this._x * otherVec._x) + (this._y * otherVec._y);
};

//Shapes
function Box(min, max)
{
	this._min = min;
	this._max = max;
};

