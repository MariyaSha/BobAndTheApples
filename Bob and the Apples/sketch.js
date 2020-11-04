/*

- Help Bob collect all the apples and reach the flagpole
- Sounds obtained from https://opengameart.org/

*/

var gameChar_x;
var gameChar_y;
var floorPos_y;
var scrollPos;
var gameChar_world_x;

var isLeft;
var isRight;
var isFalling;
var isPlummeting;

var trees_x;
var collectables;
var clouds;
var canyons;
var mountains; 

var flagpole;
var game_score;
var game_over;
var lives;

var jumpSound;
var collectSound;
var backgroundSound;
var levelUpSound;
var gameOverSound;
var failSound;

var greetingText;

var platforms;

function preload()
{
    soundFormats('mp3','wav');
    
    //load your sounds here
    jumpSound = loadSound('assets/jump.wav');
    collectSound = loadSound('assets/collected.wav');
    backgroundSound = loadSound('assets/forest.wav');
    levelUpSound = loadSound('assets/win.ogg');
    gameOverSound = loadSound('assets/totalfail.ogg');
    failSound = loadSound('assets/fail.ogg');
    
    jumpSound.setVolume(0.085);
    collectSound.setVolume(0.3);
    backgroundSound.setVolume(0.065);
    levelUpSound.setVolume(0.1);
    gameOverSound.setVolume(0.065);
    failSound.setVolume(0.1);
}


function setup()
{
	createCanvas(1024, 576);
    floorPos_y = height * 3/4;
    lives = 3;
    greetingText = true;
    
    //play background music as the game begins
    backgroundSound.loop();
    
    startGame();
}


function draw()
{
    // Fill the sky blue.
	background(100,211,255); 
	noStroke();
    
    // Draw some green ground.
	fill(10,204,38);
	rect(0, floorPos_y, width, height/4); 
    
    // Enable scrolling.
    push();
    translate(scrollPos,0);

	// Draw clouds.
    drawClouds();

	// Draw mountains.
    drawMountains();
    
	// Draw trees.
    drawTrees();
    
    //Draw platforms
    for (var i = 0; i < platforms.length; i++){
        platforms[i].draw();
    }

	// Draw canyons.
    for (var i=0 ; i < canyons.length ; i++)
    {
        drawCanyon(canyons[i]);   
        checkCanyon(canyons[i]);
        checkPlayerDie();
    }
    
    // Draw collectable items.
    for(var i = 0; i < collectables.length ; i++)
        {                    
            if(!collectables[i].isFound)
            {
                drawCollectable(collectables[i]);
                checkCollectable(collectables[i]);
            }
        }
    
    // Draw Flagpole.
    renderFlagpole();

    pop();

	// Draw game character.	
	drawGameChar();
    
    // Post score & lives.
    fill(0);
    textSize(14);
    textFont('Raleway Medium');
    noStroke();
    text('lives: ', 20,25);
    text('score: ' + game_score, 20,45);
    
    // Draw Lives.
    fill(255,18,18);    
    for(var i=0; i<lives; i++){
        var radius = 10;
        drawHeart(65 + i*radius*2.5, 17, radius); 
    }
    
    // Greeting text.
    displayGreetingText();
    
    // Level Complete text.
    displayLevelComplete();

	// Logic to make the game character move or the background scroll.
	if(isLeft)
	{
		if(gameChar_x > width * 0.2)
		{
			gameChar_x -= 5;
		}
		else
		{
			scrollPos += 5;
		}
	}

	if(isRight)
	{
		if(gameChar_x < width * 0.8)
		{
			gameChar_x  += 5;
		}
		else
		{
			scrollPos -= 5; // negative for moving against the background
		}
	}

	// Logic to make the game character rise and fall.
    if(gameChar_y < floorPos_y)
        // when Bob is above the ground
        {
            var isContact = false;
            for(var i=0 ; i<platforms.length ; i++){
               if(platforms[i].checkContact(gameChar_world_x, gameChar_y)){
                   // when Bob is on the platform
                   isContact = true;
                   break;
               }
            }
            if(isContact == false){
                //when Bob is not on the platform
                gameChar_y += 4;
            }
        }
    else
        //if Bob is not above the ground
        {
            isFalling = false;        
        }
    
    if(isPlummeting)
        //Bob is plummeting downwards
        {
            gameChar_y += 5;
        }
    
    if(flagpole.isReached == false)
        //Check if the flagpole was reached
        {
            checkFlagpole();
        }
    
	// Update real position of gameChar for collision detection.
	gameChar_world_x = gameChar_x - scrollPos;
}



// ---------------------
// Key control functions
// ---------------------

function keyPressed()
{
    
    //when pressing "A" or "Left Arrow"
    if (keyCode == 37 || keyCode == 65){
        isLeft = true;
    }
    
    //when pressing "D" or "Right Arrow"
    else if (keyCode == 39 || keyCode == 68){
        isRight = true;
    }
    
    //when pressing "W" or "space"
    if (keyCode == 32 || keyCode == 87){
        
        greetingText = false;
        
        //play jump sound only when the char is not falling or the flagpole is not reached
        if(!isFalling && flagpole.isReached == false){
           jumpSound.play(); 
        }
        
        //pressing SPACE when the flagpole is reached will start a new level (not included in this project)
        if (flagpole.isReached == true){
            console.log('NEXT LEVEL BEGINS');
            levelUpSound.stop();
        }
        //pressing SPACE when the game is over will start a new game (indluded in this project)
        else if (game_over == true){
            startGame();
            lives = 3;
        }
        //pressing SPACE to jump
        else if(!isFalling && !isPlummeting){
            gameChar_y -= 150;
        }

    }

}

function keyReleased()
{
    //when pressing "A" or "Left Arrow"
    if (keyCode == 37 || keyCode == 65){
        isLeft = false;
    }
    //when pressing "D" or "Right Arrow"
    else if (keyCode == 39 || keyCode == 68){
        isRight = false;
    }
}

// ------------------------------
// Game character render function
// ------------------------------

// Function to draw the game character.

function drawGameChar()
{
	// draw game character
    
	if(isLeft && isFalling)
	{
		// add your jumping-left code

        //Head
        fill(229,209,208);
        ellipse(gameChar_x, gameChar_y - 50, 30, 30);

        //Hair
        fill(218,146,62);
        triangle(gameChar_x - 9, gameChar_y -62,
                 gameChar_x, gameChar_y - 68,
                 gameChar_x + 9, gameChar_y - 62);

        //Eye
        fill(255);
        ellipse(gameChar_x - 9, gameChar_y - 48, 9,9);
        fill(113,184,255);
        ellipse(gameChar_x - 9, gameChar_y - 48, 5,5);
        fill(0);
        ellipse(gameChar_x - 9, gameChar_y - 48, 2,2);
        fill(255);
        stroke(255);
        strokeWeight(1);
        point(gameChar_x - 10, gameChar_y - 48);
        noStroke();

        //Mouth
        fill(246,69,105);
        arc(gameChar_x - 10, gameChar_y - 42, 5, 5, 0, PI, CHORD);

        //Shirt
        fill(246,69,105);
        rect(gameChar_x -5, gameChar_y -35, 10,25);

        //Jeans
        fill(74,116,158);
        rect(gameChar_x -5, gameChar_y -15, 10,5);

        //Feet
        rect(gameChar_x -2.5, gameChar_y-10, 5,10);

        //Shoes
        fill(0);
        rect(gameChar_x -2.5, gameChar_y -2, 5,3);

        //Hands
        strokeWeight(3);

        //hand
        stroke(229,209,208);
        line(gameChar_x + 3, gameChar_y - 33, gameChar_x + 11, gameChar_y -20);
        stroke(246,69,105);
        line(gameChar_x + 3, gameChar_y - 33, gameChar_x + 6, gameChar_y - 28);

        noStroke;    

	}
	else if(isRight && isFalling)
	{
		// add your jumping-right code

        //Head
        fill(229,209,208);
        ellipse(gameChar_x, gameChar_y - 50, 30, 30);

        //Hair
        fill(218,146,62);
        triangle(gameChar_x - 9, gameChar_y -62,
                 gameChar_x, gameChar_y - 68,
                 gameChar_x + 9, gameChar_y - 62);

        //Eye
        fill(255);
        ellipse(gameChar_x + 9, gameChar_y - 48, 9,9);
        fill(113,184,255);
        ellipse(gameChar_x + 9, gameChar_y - 48, 5,5);
        fill(0);
        ellipse(gameChar_x + 9, gameChar_y - 48, 2,2);
        fill(255);
        stroke(255);
        strokeWeight(1);
        point(gameChar_x + 10, gameChar_y - 48);
        noStroke();

        //Mouth
        fill(246,69,105);
        arc(gameChar_x + 10, gameChar_y - 42, 5, 5, 0, PI, CHORD);

        //Shirt
        fill(246,69,105);
        rect(gameChar_x -5, gameChar_y -35, 10,25);

        //Jeans
        fill(74,116,158);
        rect(gameChar_x -5, gameChar_y -15, 10,5);


        //Feet
        rect(gameChar_x -2.5, gameChar_y-10, 5,10);

        //Shoes
        fill(0);
        rect(gameChar_x -2.5, gameChar_y -2, 5,3);

        //Hands
        strokeWeight(3);

        //hand
        stroke(229,209,208);
        line(gameChar_x - 3, gameChar_y - 33, gameChar_x - 11, gameChar_y -20);
        stroke(246,69,105);
        line(gameChar_x - 3, gameChar_y - 33, gameChar_x - 6, gameChar_y - 28);

        noStroke;    

	}
	else if(isLeft)
	{
		// add your walking left code        
        
        //Head
        fill(229,209,208);
        ellipse(gameChar_x, gameChar_y - 50, 30, 30);

        //Hair
        fill(218,146,62);
        triangle(gameChar_x - 9, gameChar_y -62,
                 gameChar_x, gameChar_y - 68,
                 gameChar_x + 9, gameChar_y - 62);

        //Eye
        fill(255);
        ellipse(gameChar_x - 9, gameChar_y - 48, 9,9);
        fill(113,184,255);
        ellipse(gameChar_x - 9, gameChar_y - 48, 5,5);
        fill(0);
        ellipse(gameChar_x - 9, gameChar_y - 48, 2,2);
        fill(255);
        stroke(255);
        strokeWeight(1);
        point(gameChar_x - 10, gameChar_y - 48);
        noStroke();

        //Mouth
        fill(246,69,105);
        arc(gameChar_x - 10, gameChar_y - 42, 5, 5, 0, PI, CHORD);

        //Shirt
        fill(246,69,105);
        rect(gameChar_x -5, gameChar_y -35, 10,25);

        //Jeans
        fill(74,116,158);
        rect(gameChar_x -5, gameChar_y -15, 10,5);

        //Feet
        rect(gameChar_x -2.5, gameChar_y-10, 5,10);

        //Shoes
        fill(0);
        rect(gameChar_x -2.5, gameChar_y -2, 5,3);

        //Hands
        strokeWeight(3);

        //hand
        stroke(229,209,208);
        line(gameChar_x - 3, gameChar_y - 33, gameChar_x - 11, gameChar_y -20);
        stroke(246,69,105);
        line(gameChar_x - 3, gameChar_y - 33, gameChar_x - 6, gameChar_y - 28);

        noStroke;    

	}
	else if(isRight)
	{
		// add your walking right code

        //Head
        fill(229,209,208);
        ellipse(gameChar_x, gameChar_y - 50, 30, 30);

        //Hair
        fill(218,146,62);
        triangle(gameChar_x - 9, gameChar_y -62,
                 gameChar_x, gameChar_y - 68,
                 gameChar_x + 9, gameChar_y - 62);

        //Eye
        fill(255);
        ellipse(gameChar_x + 9, gameChar_y - 48, 9,9);
        fill(113,184,255);
        ellipse(gameChar_x + 9, gameChar_y - 48, 5,5);
        fill(0);
        ellipse(gameChar_x + 9, gameChar_y - 48, 2,2);
        fill(255);
        stroke(255);
        strokeWeight(1);
        point(gameChar_x + 10, gameChar_y - 48);
        noStroke();

        //Mouth
        fill(246,69,105);
        arc(gameChar_x + 10, gameChar_y - 42, 5, 5, 0, PI, CHORD);

        //Shirt
        fill(246,69,105);
        rect(gameChar_x -5, gameChar_y -35, 10,25);

        //Jeans
        fill(74,116,158);
        rect(gameChar_x -5, gameChar_y -15, 10,5);


        //Feet
        rect(gameChar_x -2.5, gameChar_y-10, 5,10);

        //Shoes
        fill(0);
        rect(gameChar_x -2.5, gameChar_y -2, 5,3);

        //Hands
        strokeWeight(3);

        //hand
        stroke(229,209,208);
        line(gameChar_x + 3, gameChar_y - 33, gameChar_x + 11, gameChar_y -20);
        stroke(246,69,105);
        line(gameChar_x + 3, gameChar_y - 33, gameChar_x + 6, gameChar_y - 28);

        noStroke;    

	}
	else if (isFalling || isPlummeting)
	{
		// add your jumping facing forwards code

        //Head
        fill(229,209,208);
        ellipse(gameChar_x, gameChar_y - 50, 30, 30);

        //Hair
        fill(218,146,62);
        triangle(gameChar_x - 9, gameChar_y -62,
                 gameChar_x, gameChar_y - 68,
                 gameChar_x + 9, gameChar_y - 62);

        //Eyes
        fill(255);
        ellipse(gameChar_x - 5, gameChar_y - 48, 9,9);
        ellipse(gameChar_x + 5, gameChar_y - 48, 9,9);
        fill(113,184,255);
        ellipse(gameChar_x - 5, gameChar_y - 48, 5,5);
        ellipse(gameChar_x + 5, gameChar_y - 48, 5,5);
        fill(0);
        ellipse(gameChar_x - 5, gameChar_y - 48, 2,2);
        ellipse(gameChar_x + 5, gameChar_y - 48, 2,2);
        fill(255);
        stroke(255);
        strokeWeight(1);
        point(gameChar_x - 6, gameChar_y - 48);
        point(gameChar_x + 4, gameChar_y - 48);
        noStroke();

        //Mouth
        fill(246,69,105);
        arc(gameChar_x, gameChar_y - 42, 6, 6, 0, PI, CHORD);

        //Shirt
        fill(246,69,105);
        rect(gameChar_x -7.5, gameChar_y -35, 15,25);

        //Jeans
        fill(74,116,158);
        rect(gameChar_x -7.5, gameChar_y -15, 15,5);

        //Feet
        rect(gameChar_x -7.5, gameChar_y-10, 5,10);
        rect(gameChar_x +2.5, gameChar_y-10, 5,10);

        //Shoes
        fill(0);
        rect(gameChar_x -7.5, gameChar_y -2, 5,3);
        rect(gameChar_x +2.5, gameChar_y -2, 5,3);

        //Hands
        strokeWeight(3);

        //hand-left
        stroke(229,209,208);
        line(gameChar_x - 7, gameChar_y - 33, gameChar_x -19, gameChar_y -38);
        stroke(246,69,105);
        line(gameChar_x - 7, gameChar_y - 33, gameChar_x - 12, gameChar_y - 34.7);
        //hand-right
        stroke(229,209,208);
        line(gameChar_x + 7, gameChar_y - 33, gameChar_x +19, gameChar_y -38);
        stroke(246,69,105);
        line(gameChar_x + 7, gameChar_y - 33, gameChar_x + 12, gameChar_y - 34.7);

        noStroke;

	}
	else
	{
		// add your standing front facing code
        
        //Head
        fill(229,209,208);
        ellipse(gameChar_x, gameChar_y - 50, 30, 30);

        //Hair
        fill(218,146,62);
        triangle(gameChar_x - 9, gameChar_y -62,
                 gameChar_x, gameChar_y - 68,
                 gameChar_x + 9, gameChar_y - 62);

        //Eyes
        fill(255);
        ellipse(gameChar_x - 5, gameChar_y - 48, 9,9);
        ellipse(gameChar_x + 5, gameChar_y - 48, 9,9);
        fill(113,184,255);
        ellipse(gameChar_x - 5, gameChar_y - 48, 5,5);
        ellipse(gameChar_x + 5, gameChar_y - 48, 5,5);
        fill(0);
        ellipse(gameChar_x - 5, gameChar_y - 48, 2,2);
        ellipse(gameChar_x + 5, gameChar_y - 48, 2,2);
        fill(255);
        stroke(255);
        strokeWeight(1);
        point(gameChar_x - 6, gameChar_y - 48);
        point(gameChar_x + 4, gameChar_y - 48);
        noStroke();

        //Mouth
        fill(246,69,105);
        arc(gameChar_x, gameChar_y - 42, 6, 6, 0, PI, CHORD);

        //Shirt
        fill(246,69,105);
        rect(gameChar_x -7.5, gameChar_y -35, 15,25);

        //Jeans
        fill(74,116,158);
        rect(gameChar_x -7.5, gameChar_y -15, 15,5);

        //Feet
        rect(gameChar_x -7.5, gameChar_y-10, 5,10);
        rect(gameChar_x +2.5, gameChar_y-10, 5,10);

        //Shoes
        fill(0);
        rect(gameChar_x -7.5, gameChar_y -2, 5,3);
        rect(gameChar_x +2.5, gameChar_y -2, 5,3);

        //Hands
        strokeWeight(3);

        //hand-left
        stroke(229,209,208);
        line(gameChar_x - 7, gameChar_y - 33, gameChar_x - 15, gameChar_y -20);
        stroke(246,69,105);
        line(gameChar_x - 7, gameChar_y - 33, gameChar_x - 10, gameChar_y - 28);
        //hand-right
        stroke(229,209,208);
        line(gameChar_x + 7, gameChar_y - 33, gameChar_x + 15, gameChar_y -20);
        stroke(246,69,105);
        line(gameChar_x + 7, gameChar_y - 33, gameChar_x + 10, gameChar_y - 28);

        noStroke;

	}
}

// ---------------------------
// Background render functions
// ---------------------------

// Function to draw cloud objects.

function drawClouds()
{
    for (var i = 0; i < clouds.length ; i++)
        {
    
            fill(255,255,255);
            ellipse(clouds[i].x_pos,
                    clouds[i].y_pos,
                    clouds[i].diam,
                    clouds[i].diam);
            ellipse(clouds[i].x_pos + 55,
                    clouds[i].y_pos,
                    clouds[i].diam + 27,
                    clouds[i].diam + 27);    
            ellipse(clouds[i].x_pos + 110,
                    clouds[i].y_pos + 10,
                    clouds[i].diam - 8,
                    clouds[i].diam - 8);
            ellipse(clouds[i].x_pos + 32,
                    clouds[i].y_pos + 30,
                    clouds[i].diam + 7,
                    clouds[i].diam + 7);
            ellipse(clouds[i].x_pos + 77,
                    clouds[i].y_pos + 35,
                    clouds[i].diam - 10,
                    clouds[i].diam - 10);
        }
}

// Function to draw mountains objects.

function drawMountains()
{
    for (var i = 0 ; i < mountains.length ; i++ )
    {
        //mountains-shadows
        fill(11,120,32);
        triangle(mountains[i].x_pos, mountains[i].y_pos,
                 mountains[i].x_pos + 85, mountains[i].y_pos - 197,
                 mountains[i].x_pos + 150, mountains[i].y_pos);
        
        //mountain-midtones
        fill(11,145,32);  
        triangle(mountains[i].x_pos + 45, mountains[i].y_pos,
                 mountains[i].x_pos + 140, mountains[i].y_pos - 162,
                 mountains[i].x_pos + 215, mountains[i].y_pos);

        //mountains-highlights
        fill(11,160,32);  
        triangle(mountains[i].x_pos - 48, mountains[i].y_pos,
                 mountains[i].x_pos + 25, mountains[i].y_pos - 232,
                 mountains[i].x_pos + 100, mountains[i].y_pos);
    }
}

// Function to draw trees objects.

function drawTrees()
{
    for (var i = 0 ; i< trees_x.length ; i++ )
        {
            //tree-trunk
            fill(132,98,76); 
            rect(trees_x[i], floorPos_y - 160, 15, 160);

            //tree-leaves-shadows
            fill(8,180,39);
            ellipse(trees_x[i] + 9, floorPos_y - 160 + 8, 125, 125);
            ellipse(trees_x[i] - 51, floorPos_y - 160 + 28, 70, 70);
            ellipse(trees_x[i] + 65, floorPos_y - 160 + 28, 70, 70);

            //tree-leaves-highlights
            fill(10,204,38);
            ellipse(trees_x[i] + 9, floorPos_y - 160 + 8, 80, 80);
            ellipse(trees_x[i] - 51, floorPos_y - 160 + 28, 32, 32);
            ellipse(trees_x[i] + 65, floorPos_y - 160 + 28, 32, 32);

            //tree-branches
            stroke(135,98,76);
            strokeWeight(4);
            line(trees_x[i], floorPos_y - 160 + 98,
                 trees_x[i] - 33, floorPos_y - 160 + 58);
            line(trees_x[i] + 15, floorPos_y - 160 + 98,
                 trees_x[i] + 47, floorPos_y - 160 + 58);
            noStroke();
        }
}

// function to draw lives/hearts

function drawHeart(x, y, r){ 
        ellipse(x, y, r, r);
        ellipse(x+r, y, r, r);
        triangle(x-r/1.9, y+r/8, x+r/1.9, y+r*1.2, x+r*1.5, y+r/8);
        
    }

// ---------------------------------
// Flagpole render & check functions
// ---------------------------------

// Render Flagpole.
function renderFlagpole()
{
    push();
    stroke(0);
    strokeWeight(5);
    line(flagpole.x_pos , floorPos_y, flagpole.x_pos, floorPos_y - 250);
    
    noStroke();
    fill(255,0,0);
    if(flagpole.isReached){
        rect(flagpole.x_pos, floorPos_y - 250, 75, 50);  
    } else {
        rect(flagpole.x_pos, floorPos_y - 100, 75, 50);
    }
    
    pop();
}

// Check Flagpole.
function checkFlagpole(){
    var d = abs(gameChar_world_x - flagpole.x_pos);
    if(d<15){
        levelUpSound.play();
        flagpole.isReached = true;
    }
}

// ---------------------------------
// Canyon render and check functions
// ---------------------------------

// Function to draw canyon objects.

function drawCanyon(t_canyon)
{
    for (var i = 0; i < canyons.length ; i++)
        {    
            //canyon-void
            fill(100,211,255);
            rect(t_canyon.x_pos, t_canyon.y_pos, t_canyon.width, t_canyon.height);

            //canyon-shadows
            fill(8,180,39);
            triangle(t_canyon.x_pos + 150, t_canyon.y_pos,
                     t_canyon.x_pos + 150, t_canyon.y_pos + 144,
                     t_canyon.x_pos + 225, t_canyon.y_pos + 144);
            triangle(t_canyon.x_pos, t_canyon.y_pos,
                     t_canyon.x_pos, t_canyon.y_pos + 144,
                     t_canyon.x_pos - 90, t_canyon.y_pos + 144);
        }
}

// Function to check if character is over a canyon.

function checkCanyon(t_canyon)
{   
    if(gameChar_world_x > t_canyon.x_pos
       && gameChar_world_x < t_canyon.x_pos + t_canyon.width
       && gameChar_y >= floorPos_y)
    {
        isPlummeting = true;
    } 
}

// Function to Check if the character fell off the canyon and hit the rock bottom

function checkPlayerDie()
    {
        if(gameChar_y > height + 70
           && gameChar_y < height + 75)
        {   
            lives -= 1; //player lost 1 life
            
            //game over parameters
            if(lives < 1 && game_over == false)
            {
                isPlummeting = false;
                lives = 0;
                game_over = true;
                if(gameChar_y > floorPos_y)
                    {
                        //if the game is over - play GAME OVER sound
                        playEndGameSound();
                    }
            }
        //if the player dies - play FAIL sound
        else if(lives >= 1){
            failSound.play(); 
            startGame();
        }
    }
    
    // display GAME OVER message
    displayEndGame();
}


// ----------------------------------
// Collectable items render and check functions
// ----------------------------------

// Function to draw collectable objects.

function drawCollectable(t_collectable)
{
    //draw the collectable

    //apple-shadows
    fill(208,18,18);
    ellipse(t_collectable.x_pos,
            t_collectable.y_pos,
            t_collectable.width,
            t_collectable.height);

    //apple-highlights
    fill(255,18,18);
    ellipse(t_collectable.x_pos - 2,
            t_collectable.y_pos - 5,
            t_collectable.width -14,
            t_collectable.height - 17);

    //apples-leaf
    fill(8,193,39);
    ellipse(t_collectable.x_pos + 7,
            t_collectable.y_pos - 14,
            t_collectable.width - 15,
            t_collectable.height - 25);

    //apple-stem
    stroke(135,76,76);
    strokeWeight(3);
    line(t_collectable.x_pos,
         t_collectable.y_pos - 14,
         t_collectable.x_pos,
         t_collectable.y_pos - 19)
    noStroke();
}

// Function to check character has collected an item.

function checkCollectable(t_collectable)
{
    if (dist(gameChar_world_x, gameChar_y, t_collectable.x_pos, t_collectable.y_pos) <= t_collectable.width + 5)
    {
        t_collectable.isFound = true;
        console.log('found collectable: +1');
        collectSound.play();
        game_score += 1;
    }
}

// ----------------------------------
// Game Messages and Sound Functions
// ----------------------------------


//function to display greeting text when the game begins

function displayGreetingText(){
    if(greetingText){
        fill(255,255,255,100);
        rect(0, 60, width, 160);
        fill(0);
        textSize(65);
        text('Bob and the Apples', 230, 150);
        textSize(25);
        text('press SPACE to begin', 390, 200);
        return;
    }
}

// function to play GAME OVER sound
function playEndGameSound(){
        if (lives < 1 && game_over == true){
            backgroundSound.stop();
            gameOverSound.play();
        }
    }

// function to display GAME OVER message
function displayEndGame(){
    if (game_over == true){
                fill(255,255,255,100);
                rect(0, 60, width, 160);
                fill(0);
                textSize(100);
                text('GAME OVER', 230, 150);
                textSize(25);
                text('press SPACE to start again', 390, 200);
                return;
            }
}

//function to display LEVEL UP message
function displayLevelComplete(){
    if (flagpole.isReached == true)
        {
            fill(255,255,255,100);
            rect(0, 60, width, 160);
            fill(0);
            textSize(50);
            text('Level Complete!', 330, 130);
            textSize(25);
            text('press SPACE to continue', 380, 185);
            return;
        }
}


// ----------------------------------
// Start game
// ----------------------------------

function startGame(){
    
    backgroundSound.play();
    
	gameChar_x = width/3;
	gameChar_y = floorPos_y;

	// Variable to control the background scrolling.
	scrollPos = 0;

	// Variable to store the real position of the gameChar in the game
	// world. Needed for collision detection.
	gameChar_world_x = gameChar_x - scrollPos;

	// Boolean variables to control the movement of the game character.
	isLeft = false;
	isRight = false;
	isFalling = false;
	isPlummeting = false;

	// Initialise arrays of scenery objects.
    
    trees_x = [-350, -150, 285, 700, 875, 1300, 1600];
    
    clouds = 
        [
            {x_pos: -700, y_pos: 170, diam: 53},
            {x_pos: -300, y_pos: 100, diam: 53},
            {x_pos: 140, y_pos: 150, diam: 53},
            {x_pos: 400, y_pos: 100, diam: 53},
            {x_pos: 800, y_pos: 75, diam: 53},
            {x_pos: 1300, y_pos: 175, diam: 53}
         ];
    
    collectables = 
        [
            {x_pos: 50, y_pos: 430, width: 27, height: 30, isFound: false},
            {x_pos: 500, y_pos: 200, width: 27, height: 30, isFound: false},
            {x_pos: 725, y_pos: 160, width: 27, height: 30, isFound: false},
            {x_pos: 795, y_pos: 235, width: 27, height: 30, isFound: false},
            {x_pos: 1180, y_pos: 160, width: 27, height: 30, isFound: false},    
            {x_pos: 830, y_pos: 430, width: 27, height: 30, isFound: false},
            {x_pos: 1200, y_pos: 430, width: 27, height: 30, isFound: false}
        ];
    
    canyons = 
        [
            {x_pos: 100, y_pos: 432, width: 150, height: 200},
            {x_pos: 1000, y_pos: 432, width: 150, height: 200}
        ];
    
    mountains = 
        [
            {x_pos: 350, y_pos: 432},
            {x_pos: 1420, y_pos: 432},
            {x_pos: -530, y_pos: 432},
            {x_pos: -235, y_pos: 432}
        ];
    
    platforms = [];
    
    platforms.push(createPlatforms(430, floorPos_y - 100,150));
    platforms.push(createPlatforms(620, floorPos_y - 150,100));
    platforms.push(createPlatforms(1200, floorPos_y - 120,125));
    
    flagpole = {isReached: false, x_pos: 1500};
    
    //initiallize game parameters
    game_score = 0;
    game_over = false;
    
    
}

//function to create platforms
function createPlatforms(x, y, length){
    var p = {
        x: x,
        y: y,
        length: length,
        draw: function(){
            fill(104, 71, 53);
            rect(this.x, this.y, this.length, 15);
        },
        //check is Bob is on the platform or not
        checkContact: function(gc_x, gc_y){
            if(gc_x > this.x && gc_x < this.x + this.length){
                
                var d = this.y - gc_y;
                if(d >= 0 && d < 5 ){
                    return true;
                }
            }
            return false;
        }
    }
    return p;
};
