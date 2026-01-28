class NumberGuessingGame {
    constructor() {
        this.secretNumber = null;
        this.attempts = 0;
        this.maxAttempts = 10;
        this.guessHistory = [];
        this.minRange = 1;
        this.maxRange = 100;
        this.bestScore = localStorage.getItem('bestScore') || null;
        
        this.initializeElements();
        this.attachEventListeners();
        this.startNewGame();
    }

    initializeElements() {
        this.guessInput = document.getElementById('guessInput');
        this.guessBtn = document.getElementById('guessBtn');
        this.restartBtn = document.getElementById('restartBtn');
        this.feedbackMessage = document.getElementById('feedbackMessage');
        this.attemptsDisplay = document.getElementById('attempts');
        this.remainingDisplay = document.getElementById('remaining');
        this.bestScoreDisplay = document.getElementById('bestScore');
        this.historyList = document.getElementById('historyList');
        this.minRangeDisplay = document.getElementById('minRange');
        this.maxRangeDisplay = document.getElementById('maxRange');
        this.confettiContainer = document.getElementById('confettiContainer');
    }

    attachEventListeners() {
        this.guessBtn.addEventListener('click', () => this.makeGuess());
        this.guessInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.makeGuess();
        });
        this.restartBtn.addEventListener('click', () => this.startNewGame());
    }

    startNewGame() {
        this.secretNumber = Math.floor(Math.random() * 100) + 1;
        this.attempts = 0;
        this.guessHistory = [];
        this.minRange = 1;
        this.maxRange = 100;
        
        this.updateDisplay();
        this.guessInput.value = '';
        this.guessInput.disabled = false;
        this.guessBtn.disabled = false;
        this.historyList.innerHTML = '';
        
        this.showFeedback('Make your first guess!', 'neutral');
        this.updateRangeDisplay();
        
        if (this.bestScore) {
            this.bestScoreDisplay.textContent = this.bestScore;
        }
    }

    makeGuess() {
        const guess = parseInt(this.guessInput.value);
        
        // Validation
        if (!guess || guess < 1 || guess > 100) {
            this.showFeedback('Please enter a number between 1 and 100', 'neutral');
            this.shakeInput();
            return;
        }

        if (this.guessHistory.includes(guess)) {
            this.showFeedback('You already guessed that number!', 'neutral');
            this.shakeInput();
            return;
        }

        this.attempts++;
        this.guessHistory.push(guess);
        this.updateDisplay();

        // Check the guess
        if (guess === this.secretNumber) {
            this.handleWin();
        } else if (this.attempts >= this.maxAttempts) {
            this.handleLoss();
        } else {
            this.handleIncorrectGuess(guess);
        }

        this.guessInput.value = '';
        this.guessInput.focus();
    }

    handleWin() {
        this.showFeedback(`🎉 Congratulations! You found ${this.secretNumber} in ${this.attempts} attempts!`, 'success');
        this.endGame();
        this.updateBestScore();
        this.createConfetti();
        this.pulseStats();
    }

    handleLoss() {
        this.showFeedback(`😢 Game Over! The number was ${this.secretNumber}`, 'too-high');
        this.endGame();
    }

    handleIncorrectGuess(guess) {
        const difference = Math.abs(guess - this.secretNumber);
        let feedback = '';
        let className = '';

        if (guess > this.secretNumber) {
            feedback = this.getHotColdFeedback(difference, 'Too high!');
            className = 'too-high';
            this.maxRange = Math.min(this.maxRange, guess - 1);
        } else {
            feedback = this.getHotColdFeedback(difference, 'Too low!');
            className = 'too-low';
            this.minRange = Math.max(this.minRange, guess + 1);
        }

        this.showFeedback(feedback, className);
        this.addToHistory(guess, className);
        this.updateRangeDisplay();
    }

    getHotColdFeedback(difference, direction) {
        if (difference <= 5) return `${direction} 🔥 SO CLOSE!`;
        if (difference <= 10) return `${direction} 🌡️ Getting warm!`;
        if (difference <= 20) return `${direction} ❄️ Getting cold...`;
        return `${direction} 🧊 Way off!`;
    }

    showFeedback(message, className) {
        this.feedbackMessage.textContent = message;
        this.feedbackMessage.className = 'feedback-message ' + className;
        
        // Trigger animation
        this.feedbackMessage.style.animation = 'none';
        setTimeout(() => {
            this.feedbackMessage.style.animation = '';
        }, 10);
    }

    addToHistory(guess, className) {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item ' + className;
        historyItem.textContent = guess;
        this.historyList.appendChild(historyItem);
    }

    updateDisplay() {
        this.attemptsDisplay.textContent = this.attempts;
        this.remainingDisplay.textContent = this.maxAttempts - this.attempts;
    }

    updateRangeDisplay() {
        this.minRangeDisplay.textContent = this.minRange;
        this.maxRangeDisplay.textContent = this.maxRange;
    }

    updateBestScore() {
        if (!this.bestScore || this.attempts < parseInt(this.bestScore)) {
            this.bestScore = this.attempts;
            localStorage.setItem('bestScore', this.bestScore);
            this.bestScoreDisplay.textContent = this.bestScore;
        }
    }

    endGame() {
        this.guessInput.disabled = true;
        this.guessBtn.disabled = true;
    }

    shakeInput() {
        this.guessInput.style.animation = 'shake 0.5s';
        setTimeout(() => {
            this.guessInput.style.animation = '';
        }, 500);
    }

    pulseStats() {
        const stats = document.querySelectorAll('.stat-item');
        stats.forEach((stat, index) => {
            setTimeout(() => {
                stat.style.animation = 'pulse 0.5s';
                setTimeout(() => {
                    stat.style.animation = '';
                }, 500);
            }, index * 100);
        });
    }

    createConfetti() {
        const colors = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6'];
        const confettiCount = 100;

        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            confetti.style.animationDuration = Math.random() * 2 + 2 + 's';
            
            this.confettiContainer.appendChild(confetti);

            setTimeout(() => confetti.remove(), 4000);
        }
    }
}

// Add shake animation to CSS via JavaScript
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
    }
`;
document.head.appendChild(style);

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new NumberGuessingGame();
});
