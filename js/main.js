var gCtx2D;
var gPathFinder;

//I put all the static hardcoded shit here.

$(document).ready(function()
{
	$("#title").text("Sheep's Clothing");
	$("#instructions").text("Move around with WASD. Space to Interact with objects. Blue guys are guards, don't get caught. Hide by acting like an NPC.");
	
	var canvas = document.getElementById("canvas");
	
	if(canvas)
	{
		console.log("Get Context");
		gCtx2D = canvas.getContext("2d");
		
		console.log("Create Game");
		gTheGame = new Game();
		
		//INIT!
		console.log("Begin Init");
		gPathFinder = new PF.AStarFinder();
		
		initResources();
		buildMap();
		
		gTheGame.setContext(gCtx2D);
		gTheGame.setViewport(canvas.width, canvas.height);
	
		loopGame();
	}
	else
	{
		alert("Canvas could not initialise. Maybe update your browser?");
	}
});

function initResources()
{
	gTheGame.startImageLoad("charsheet"		, "image/characters.png"		);
	gTheGame.startImageLoad("computer"		, "image/computer.png"			);
	//gTheGame.startAudioLoad("footstep"	, "audio/footstep_metal.wav");
};

function buildMap()
{
	var grid00 = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 3, 1, 1, 1, 1, 1, 1, 1],
	];
	var Room00 = new Room(grid00);
	var grid01 = [
    [1, 1, 1, 1, 1, 1, 1, 3, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
	];
	var Room01 = new Room(grid01);
	var grid02 = [
    [1, 1, 1, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
	];
	var Room02 = new Room(grid02);
	var grid10 = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
	];
	var Room10 = new Room(grid10);
	var Room11 = new BlankRoom();
	var grid12 = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1],
	];
	var Room12 = new Room(grid12);
	var grid20 = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
	];
	var Room20 = new Room(grid20);
	var grid21 = [
    [1, 1, 1, 1, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 1, 1, 1],
	];
	var Room21 = new Room(grid21);
	var grid22 = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1],
	[1, 0, 0, 2, 1, 0, 0, 0, 2, 1, 0, 0, 2, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1],
    [1, 0, 0, 2, 1, 0, 0, 0, 2, 1, 0, 0, 2, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1],
    [1, 0, 0, 2, 1, 0, 0, 0, 2, 1, 0, 0, 2, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
	];
	var Room22 = new Room(grid22);
	
	var roomGrid = [
    [Room00, Room10, Room20],
	[Room01, Room11, Room21],
	[Room02, Room12, Room22],
	];
	var map = new Map(roomGrid, 3, 3);
	gTheGame.addMap(map);
	
	//Player
	gTheGame.addPlayer(new Character(new Vec2(1,2), new Vec2(7,14), 0));
	
	var aiChar;
	var brain;
	
	//Room12
	//Guy at desk
	aiChar = new Character(new Vec2(1,2), new Vec2(7,9),0);
	brain = new Brain(aiChar);
	brain.addTask(new WaitTask(1.0));
	brain.addTask(new FaceTask(DIRECTION_RIGHT));
	brain.addTask(new WaitTask(1.0));
	brain.addTask(new FaceTask(DIRECTION_LEFT));
	brain.addTask(new WaitTask(1.0));
	brain.addTask(new FaceTask(DIRECTION_DOWN));
	gTheGame._sceneObjects.addEntity(aiChar);
	gTheGame._brains.push(brain);
	
	//Guys that loop around anti clockwise
	aiChar = new Character(new Vec2(0,2), new Vec2(10,4),0);
	brain = new Brain(aiChar);
	brain.addTask(new MapMoveTask(new Vec2(2,1), new Vec2(4,10)));
	brain.addTask(new WaitTask(5.0));
	brain.addTask(new MapMoveTask(new Vec2(0,0), new Vec2(7,7)));
	brain.addTask(new WaitTask(6.0));
	brain.addTask(new MapMoveTask(new Vec2(0,2), new Vec2(10,4)));
	brain.addTask(new WaitTask(4.0));
	gTheGame._sceneObjects.addEntity(aiChar);
	gTheGame._brains.push(brain);
	
	aiChar = new Character(new Vec2(0,2), new Vec2(11,5),0);
	brain = new Brain(aiChar);
	brain.addTask(new MapMoveTask(new Vec2(2,1), new Vec2(5,11)));
	brain.addTask(new WaitTask(5.0));
	brain.addTask(new MapMoveTask(new Vec2(0,0), new Vec2(8,8)));
	brain.addTask(new WaitTask(6.0));
	brain.addTask(new MapMoveTask(new Vec2(0,2), new Vec2(12,4)));
	brain.addTask(new WaitTask(4.0));
	gTheGame._sceneObjects.addEntity(aiChar);
	gTheGame._brains.push(brain);
	
	aiChar = new Character(new Vec2(0,2), new Vec2(9,5),0);
	brain = new Brain(aiChar);
	brain.addTask(new MapMoveTask(new Vec2(2,1), new Vec2(6,11)));
	brain.addTask(new WaitTask(5.0));
	brain.addTask(new MapMoveTask(new Vec2(0,0), new Vec2(9,6)));
	brain.addTask(new WaitTask(6.0));
	brain.addTask(new MapMoveTask(new Vec2(0,2), new Vec2(10,6)));
	brain.addTask(new WaitTask(4.0));
	gTheGame._sceneObjects.addEntity(aiChar);
	gTheGame._brains.push(brain);
	
	//Guys that loop around clockwise
	aiChar = new Character(new Vec2(2,2), new Vec2(4,7),0);
	brain = new Brain(aiChar);
	brain.addTask(new MapMoveTask(new Vec2(0,1), new Vec2(4,10)));
	brain.addTask(new WaitTask(5.0));
	brain.addTask(new MapMoveTask(new Vec2(2,0), new Vec2(7,7)));
	brain.addTask(new WaitTask(6.0));
	brain.addTask(new MapMoveTask(new Vec2(2,2), new Vec2(4,7)));
	brain.addTask(new WaitTask(4.0));
	gTheGame._sceneObjects.addEntity(aiChar);
	gTheGame._brains.push(brain);
	
	aiChar = new Character(new Vec2(2, 2), new Vec2(6,7),0);
	brain = new Brain(aiChar);
	brain.addTask(new MapMoveTask(new Vec2(0,1), new Vec2(5,11)));
	brain.addTask(new WaitTask(5.0));
	brain.addTask(new MapMoveTask(new Vec2(2,0), new Vec2(8,8)));
	brain.addTask(new WaitTask(6.0));
	brain.addTask(new MapMoveTask(new Vec2(2,2), new Vec2(6,7)));
	brain.addTask(new WaitTask(4.0));
	gTheGame._sceneObjects.addEntity(aiChar);
	gTheGame._brains.push(brain);
	
	aiChar = new Character(new Vec2(2, 2), new Vec2(5,8),0);
	brain = new Brain(aiChar);
	brain.addTask(new MapMoveTask(new Vec2(0,1), new Vec2(6,11)));
	brain.addTask(new WaitTask(5.0));
	brain.addTask(new MapMoveTask(new Vec2(2,0), new Vec2(9,6)));
	brain.addTask(new WaitTask(6.0));
	brain.addTask(new MapMoveTask(new Vec2(2,2), new Vec2(5,8)));
	brain.addTask(new WaitTask(4.0));
	gTheGame._sceneObjects.addEntity(aiChar);
	gTheGame._brains.push(brain);
	
	//Room22 guard
	aiChar = new Character(new Vec2(2,2), new Vec2(2,7),1);
	brain = new Brain(aiChar);
	brain.addTask(new RoomMoveTask(new Vec2(10,7)));
	brain.addTask(new RoomMoveTask(new Vec2(10,12)));
	brain.addTask(new RoomMoveTask(new Vec2(2,12)));
	brain.addTask(new RoomMoveTask(new Vec2(2,7)));
	gTheGame._sceneObjects.addEntity(aiChar);
	gTheGame._brains.push(brain);
	
	//Room22 workers
	aiChar = new Character(new Vec2(2,2), new Vec2(3,3),0);
	brain = new Brain(aiChar);
	brain.addTask(new FaceTask(DIRECTION_UP));
	brain.addTask(new WaitTask(4.0));
	brain.addTask(new FaceTask(DIRECTION_RIGHT));
	brain.addTask(new WaitTask(1.0));
	brain.addTask(new FaceTask(DIRECTION_UP));
	brain.addTask(new WaitTask(7.0));
	brain.addTask(new FaceTask(DIRECTION_RIGHT));
	brain.addTask(new WaitTask(1.0));
	gTheGame._sceneObjects.addEntity(aiChar);
	gTheGame._brains.push(brain);
	
	aiChar = new Character(new Vec2(2,2), new Vec2(8,3),0);
	brain = new Brain(aiChar);
	brain.addTask(new FaceTask(DIRECTION_UP));
	brain.addTask(new WaitTask(5.0));
	brain.addTask(new FaceTask(DIRECTION_LEFT));
	brain.addTask(new WaitTask(1.0));
	brain.addTask(new FaceTask(DIRECTION_UP));
	brain.addTask(new WaitTask(5.0));
	brain.addTask(new FaceTask(DIRECTION_LEFT));
	brain.addTask(new WaitTask(1.0));
	gTheGame._sceneObjects.addEntity(aiChar);
	gTheGame._brains.push(brain);
	
	aiChar = new Character(new Vec2(2,2), new Vec2(12,3),0);
	brain = new Brain(aiChar);
	brain.addTask(new FaceTask(DIRECTION_UP));
	brain.addTask(new WaitTask(1.0));
	gTheGame._sceneObjects.addEntity(aiChar);
	gTheGame._brains.push(brain);
	
	aiChar = new Character(new Vec2(2,2), new Vec2(3,6),0);
	brain = new Brain(aiChar);
	brain.addTask(new FaceTask(DIRECTION_UP));
	brain.addTask(new WaitTask(1.0));
	gTheGame._sceneObjects.addEntity(aiChar);
	gTheGame._brains.push(brain);
	
	aiChar = new Character(new Vec2(2,2), new Vec2(12,6),0);
	brain = new Brain(aiChar);
	brain.addTask(new FaceTask(DIRECTION_UP));
	brain.addTask(new WaitTask(1.0));
	gTheGame._sceneObjects.addEntity(aiChar);
	gTheGame._brains.push(brain);
	
	aiChar = new Character(new Vec2(2,2), new Vec2(8,11),0);
	brain = new Brain(aiChar);
	brain.addTask(new FaceTask(DIRECTION_UP));
	brain.addTask(new WaitTask(1.0));
	gTheGame._sceneObjects.addEntity(aiChar);
	gTheGame._brains.push(brain);
	
	//Room 21 Guard
	aiChar = new Character(new Vec2(2,1), new Vec2(10,2),1);
	brain = new Brain(aiChar);
	brain.addTask(new FaceTask(DIRECTION_DOWN));
	brain.addTask(new WaitTask(1.0));
	gTheGame._sceneObjects.addEntity(aiChar);
	gTheGame._brains.push(brain);
	
	//Room21 workers
	aiChar = new Character(new Vec2(2,1), new Vec2(10,8),0);
	brain = new Brsain(aiChar);
	brain.addTask(new FaceTask(DIRECTION_DOWN));
	brain.addTask(new WaitTask(8.0));
	brain.addTask(new RoomMoveTask(new Vec2(7,3)));
	brain.addTask(new FaceTask(DIRECTION_DOWN));
	brain.addTask(new WaitTask(6.0));
	brain.addTask(new RoomMoveTask(new Vec2(10,8)));
	gTheGame._sceneObjects.addEntity(aiChar);
	gTheGame._brains.push(brain);
	
	aiChar = new Character(new Vec2(2,1), new Vec2(11,9),0);
	brain = new Brain(aiChar);
	brain.addTask(new FaceTask(DIRECTION_LEFT));
	brain.addTask(new WaitTask(8.0));
	brain.addTask(new RoomMoveTask(new Vec2(8,4)));
	brain.addTask(new FaceTask(DIRECTION_LEFT));
	brain.addTask(new WaitTask(6.0));
	brain.addTask(new RoomMoveTask(new Vec2(11,9)));
	gTheGame._sceneObjects.addEntity(aiChar);
	gTheGame._brains.push(brain);
	
	aiChar = new Character(new Vec2(2,1), new Vec2(9,9),0);
	brain = new Brain(aiChar);
	brain.addTask(new FaceTask(DIRECTION_RIGHT));
	brain.addTask(new WaitTask(8.0));
	brain.addTask(new RoomMoveTask(new Vec2(6,4)));
	brain.addTask(new FaceTask(DIRECTION_RIGHT));
	brain.addTask(new WaitTask(6.0))
	brain.addTask(new RoomMoveTask(new Vec2(9,9)));
	gTheGame._sceneObjects.addEntity(aiChar);
	gTheGame._brains.push(brain);
	
	/*
	aiChar = new Character(new Vec2(0,0), new Vec2(2,0),1);
	brain = new Brain(aiChar);
	brain.addTask(new WaitTask(1.0));
	brain.addTask(new FaceTask(DIRECTION_RIGHT));
	brain.addTask(new WaitTask(1.0));
	brain.addTask(new FaceTask(DIRECTION_LEFT));
	brain.addTask(new WaitTask(1.0));
	brain.addTask(new FaceTask(DIRECTION_DOWN));
	gTheGame._sceneObjects.addEntity(aiChar);
	gTheGame._brains.push(brain);
	
	aiChar = new Character(new Vec2(0,0), new Vec2(8,0),1);
	brain = new Brain(aiChar);
	brain.addTask(new MapMoveTask(new Vec2(0,0), new Vec2(8,0)));
	brain.addTask(new WaitTask(1.0));
	brain.addTask(new MapMoveTask(new Vec2(0,1), new Vec2(8,0)));
	brain.addTask(new WaitTask(1.0));
	gTheGame._sceneObjects.addEntity(aiChar);
	gTheGame._brains.push(brain);
	
	aiChar = new Character(new Vec2(0,0), new Vec2(8,5),0);
	brain = new Brain(aiChar);
	brain.addTask(new RoomMoveTask(new Vec2(7, 2)));
	brain.addTask(new InteractTask(5.0));
	brain.addTask(new RoomMoveTask(new Vec2(8,5)));
	brain.addTask(new WaitTask(1.0));
	gTheGame._sceneObjects.addEntity(aiChar);
	gTheGame._brains.push(brain);
	*/
};