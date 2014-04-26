var gCtx2D;
var gViewportWidth;
var gViewportHeight;

var gGrid;
var gFinder;

$(document).ready(function()
{
	$("#title").text("Pathfind Test");
	
	var canvas = document.getElementById("canvas");
	
	if(canvas)
	{
		console.log("Pathfinding Test START");
		console.log("----------------------");
		console.log("Get Context");
		gCtx2D = canvas.getContext("2d");
		
		gViewportWidth = canvas.width;
		gViewportHeight = canvas.height;
		
		//INIT!
		console.log("Begin Init");
		
		initAI();
		initGrid();
		doTests();
	
	}
	else
	{
		alert("Canvas could not initialise. Maybe update your browser?");
	}
});

function initAI()
{
	console.log("Init AI");
	gFinder = new PF.AStarFinder();
};

function initGrid()
{
	console.log("Init Grid");
	var matrix = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 0, 0, 1, 1, 1, 0],
    [0, 1, 0, 0, 0, 0, 0, 0, 1, 0],
	[0, 1, 0, 1, 1, 1, 0, 0, 1, 0],
    [0, 0, 0, 1, 0, 1, 0, 0, 0, 0],
	[0, 0, 0, 1, 0, 1, 0, 0, 0, 0],
    [0, 1, 0, 1, 0, 0, 0, 0, 1, 0],
    [0, 1, 0, 0, 0, 0, 0, 0, 1, 0],
	[0, 1, 1, 1, 0, 0, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	];
	gGrid = new PF.Grid(10, 10, matrix);
};

function doTests()
{
	console.log("Do Tests");
	var path1 = gFinder.findPath(0, 0, 9, 9, gGrid.clone());
	var path2 = gFinder.findPath(9, 9, 0, 0, gGrid.clone());
	var path3 = gFinder.findPath(5, 0, 5, 9, gGrid.clone());
	var path4 = gFinder.findPath(0, 5, 9, 5, gGrid.clone());
	console.log("Test Done");
};