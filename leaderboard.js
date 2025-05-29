// Function to load and display leaderboard data
function loadLeaderboard() {
    const leaderboardBody = document.getElementById("leaderboard-body");
    if (!leaderboardBody) return;

    // Get scores from localStorage
    let scores = JSON.parse(localStorage.getItem("flappyBirdScores")) || [];
    
    // Sort scores by highest first
    scores.sort((a, b) => b.score - a.score);
    
    // Keep only top 10 scores
    scores = scores.slice(0, 10);

    // Check if we're on the main leaderboard page or game page
    const isMainLeaderboard = window.location.pathname.includes('leaderboard.html');
    
    // Generate table rows
    const tableContent = scores.map((score, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${score.playerName}</td>
            <td>${score.country ? score.country : '-'}</td>
            <td>${score.score}</td>
            ${isMainLeaderboard ? `<td>${score.date}</td>` : ''}
        </tr>
    `).join("");
    
    // If no scores, show message
    if (scores.length === 0) {
        leaderboardBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center;">
                    No scores yet. Be the first to play!
                </td>
            </tr>
        `;
    } else {
        leaderboardBody.innerHTML = tableContent;
    }
}

// Function to update high score display
function updateHighScore() {
    const highScoreElement = document.getElementById("high-score-value");
    if (!highScoreElement) return;

    const scores = JSON.parse(localStorage.getItem("flappyBirdScores")) || [];
    const highScore = scores.length > 0 ? Math.max(...scores.map(s => s.score)) : 0;
    highScoreElement.textContent = highScore;
}

// Load leaderboard when page loads
document.addEventListener("DOMContentLoaded", () => {
    loadLeaderboard();
    updateHighScore();
});

// Refresh leaderboard and high score every 30 seconds
setInterval(() => {
    loadLeaderboard();
    updateHighScore();
}, 30000); 