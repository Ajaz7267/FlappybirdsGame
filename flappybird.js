// Canvas and context
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

// Bird
let birdWidth = 34;
let birdHeight = 24;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;
let bird = {
    x: birdX,
    y: birdY,
    width: birdWidth,
    height: birdHeight
};

// Pipes
let pipeArray = [];
let pipeWidth = 52;
let pipeHeight = 320;
let pipeX = boardWidth;
let pipeY = 0;

// Physics
let velocityX = -2; // pipes moving left speed
let velocityY = 0; // bird jump speed
let gravity = 0.4;

// Game state
let gameOver = false;
let gameStarted = false;
let score = 0;
let highScore = parseInt(localStorage.getItem('flappyHighScore')) || 0;

// Images
let birdImg;
let topPipeImg;
let bottomPipeImg;
let backgroundImg;

// Sounds
let wingSound;
let pointSound;
let hitSound;

window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    // Load images
    birdImg = new Image();
    birdImg.src = "./flappybird.png";
    
    topPipeImg = new Image();
    topPipeImg.src = "./toppipe.png";
    
    bottomPipeImg = new Image();
    bottomPipeImg.src = "./bottompipe.png";
    
    backgroundImg = new Image();
    backgroundImg.src = "./flappybirdbg.png";
    
    // Load sounds
    wingSound = new Audio("./sfx_wing.wav");
    pointSound = new Audio("./sfx_point.wav");
    hitSound = new Audio("./sfx_hit.wav");

    // Wait for images to load
    let imagesLoaded = 0;
    const totalImages = 4;
    
    function checkImagesLoaded() {
        imagesLoaded++;
        if (imagesLoaded === totalImages) {
            // Start game loop
            requestAnimationFrame(update);
            setInterval(placePipes, 1500); // place pipes every 1.5 seconds
            document.addEventListener("keydown", moveBird);
            board.addEventListener("click", moveBird);
        }
    }
    
    birdImg.onload = checkImagesLoaded;
    topPipeImg.onload = checkImagesLoaded;
    bottomPipeImg.onload = checkImagesLoaded;
    backgroundImg.onload = checkImagesLoaded;
}

function update() {
    requestAnimationFrame(update);
    
    if (gameOver) {
        return;
    }
    
    context.clearRect(0, 0, board.width, board.height);
    
    // Draw background
    context.drawImage(backgroundImg, 0, 0, boardWidth, boardHeight);
    
    // Bird
    velocityY += gravity;
    bird.y = Math.max(bird.y + velocityY, 0); // apply gravity, limit to top of canvas
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    
    if (bird.y > board.height) {
        gameOver = true;
        onGameOver();
    }
    
    // Pipes
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        
        // Draw pipes stretched to fill the space
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);
        
        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5; // 0.5 because there are 2 pipes
            pipe.passed = true;
            if (score % 1 === 0) { // Play sound only for whole numbers
                pointSound.play();
            }
        }
        
        if (detectCollision(bird, pipe)) {
            gameOver = true;
            onGameOver();
        }
    }
    
    // Clear pipes that have gone off screen
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift(); // removes first element from array
    }
    
    // Score
    context.fillStyle = "white";
    context.font = "45px sans-serif";
    context.strokeStyle = "black";
    context.lineWidth = 3;
    context.strokeText(Math.floor(score), 5, 45);
    context.fillText(Math.floor(score), 5, 45);
    
    // High Score
    context.font = "20px sans-serif";
    context.lineWidth = 2;
    let highScoreText = "Best: " + highScore;
    let textWidth = context.measureText(highScoreText).width;
    context.strokeText(highScoreText, boardWidth - textWidth - 10, 30);
    context.fillText(highScoreText, boardWidth - textWidth - 10, 30);
}

function placePipes() {
    if (gameOver || !gameStarted) {
        return;
    }
    
    // Gap size between pipes
    let gap = 180;
    
    // Calculate safe range for gap position
    let minGapY = 150; // Minimum distance from top
    let maxGapY = boardHeight - gap - 150; // Minimum distance from bottom
    let randomGapY = minGapY + Math.random() * (maxGapY - minGapY);
    
    // Top pipe - positioned above the gap
    let topPipe = {
        img: topPipeImg,
        x: pipeX,
        y: randomGapY - pipeHeight, // Position pipe so only bottom part shows
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    }
    pipeArray.push(topPipe);
    
    // Bottom pipe - positioned below the gap
    let bottomPipe = {
        img: bottomPipeImg,
        x: pipeX,
        y: randomGapY + gap,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    }
    pipeArray.push(bottomPipe);
}

function moveBird(e) {
    // Prevent game start/jump if focus is in an input (name or country)
    const active = document.activeElement;
    if (active && (active.id === 'player-name' || active.id === 'player-country')) {
        return;
    }
    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX" || e.type == "click") {
        // Prevent default behavior (scrolling)
        if (e.preventDefault) {
            e.preventDefault();
        }
        if (!gameStarted) {
            gameStarted = true;
        }
        if (gameOver) {
            // Reset game
            bird.y = birdY;
            pipeArray = [];
            score = 0;
            velocityY = 0;
            gameOver = false;
            document.getElementById("game-over").classList.add("hidden");
            document.getElementById("start-screen").classList.add("hidden");
            return;
        }
        // Hide start screen on first interaction
        document.getElementById("start-screen").classList.add("hidden");
        // Jump
        velocityY = -6;
        wingSound.play();
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

function onGameOver() {
    hitSound.play();
    
    // Update high score
    if (score > highScore) {
        highScore = Math.floor(score);
        localStorage.setItem('flappyHighScore', highScore);
    }
    
    // Show game over screen
    document.querySelector(".final-score").innerText = Math.floor(score);
    document.getElementById("game-over").classList.remove("hidden");
}

// Show a custom toast notification
function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    toast.classList.remove('hidden');
    setTimeout(() => {
        toast.classList.remove('show');
        toast.classList.add('hidden');
    }, 2500);
}

function submitScore() {
    const playerName = document.getElementById("player-name").value.trim();
    const playerCountry = document.getElementById("player-country").value;
    
    if (!playerName) {
        showToast("Please enter your name!");
        return;
    }
    if (playerName.length > 20) {
        showToast("Name must be 20 characters or less!");
        return;
    }
    if (!playerCountry) {
        showToast("Please select your country!");
        return;
    }
    
    const scoreData = {
        playerName: playerName,
        country: playerCountry,
        score: Math.floor(score),
        date: new Date().toLocaleDateString()
    };
    
    // Get existing scores
    let scores = JSON.parse(localStorage.getItem("flappyBirdScores")) || [];
    
    // Add new score
    scores.push(scoreData);
    
    // Sort by score (highest first)
    scores.sort((a, b) => b.score - a.score);
    
    // Keep only top 10
    scores = scores.slice(0, 10);
    
    // Save back to localStorage
    localStorage.setItem("flappyBirdScores", JSON.stringify(scores));
    
    // Clear input
    document.getElementById("player-name").value = "";
    document.getElementById("player-country").value = "";
    
    // Hide modal
    document.getElementById("game-over").classList.add("hidden");
    
    // Show success message
    showToast("Score submitted successfully! Press SPACE or click to play again.");
}

function resetGame() {
    bird.y = birdY;
    pipeArray = [];
    score = 0;
    velocityY = 0;
    gameOver = false;
    document.getElementById("game-over").classList.add("hidden");
    document.getElementById("player-name").value = "";
    document.getElementById("player-country").value = "";
    document.getElementById("start-screen").classList.add("hidden");
} 