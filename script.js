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
        
        // Add input focus effect
        this.guessInput.addEventListener('focus', () => {
            this.guessInput.parentElement.style.transform = 'scale(1.01)';
        });
        this.guessInput.addEventListener('blur', () => {
            this.guessInput.parentElement.style.transform = 'scale(1)';
        });
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
        
        // Animate new game start
        this.animateNewGame();
    }

    animateNewGame() {
        const cards = document.querySelectorAll('.stat-item');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.style.animation = 'scaleInBounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
                setTimeout(() => {
                    card.style.animation = '';
                }, 600);
            }, index * 100);
        });
    }

    makeGuess() {
        const guess = parseInt(this.guessInput.value);
        
        // Validation
        if (!guess || guess < 1 || guess > 100) {
            this.showFeedback('⚠️ Please enter a number between 1 and 100', 'neutral');
            this.shakeInput();
            return;
        }

        if (this.guessHistory.includes(guess)) {
            this.showFeedback('🔁 You already guessed that number!', 'neutral');
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
        this.showFeedback(`🎉 Congratulations! You found ${this.secretNumber} in ${this.attempts} ${this.attempts === 1 ? 'attempt' : 'attempts'}!`, 'success');
        this.endGame();
        this.updateBestScore();
        this.createConfetti();
        this.pulseStats();
        this.celebrationAnimation();
    }

    handleLoss() {
        this.showFeedback(`😢 Game Over! The number was ${this.secretNumber}`, 'too-high');
        this.endGame();
        this.screenShake();
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
        
        // Add proximity effect
        if (difference <= 5) {
            this.screenPulse();
        }
    }

    getHotColdFeedback(difference, direction) {
        if (difference <= 3) return `${direction} 🔥 BURNING HOT!`;
        if (difference <= 7) return `${direction} 🌡️ Very warm!`;
        if (difference <= 15) return `${direction} ☀️ Getting warm...`;
        if (difference <= 25) return `${direction} ❄️ Getting cold...`;
        return `${direction} 🧊 Ice cold!`;
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
        
        // Add tooltip with attempt number
        historyItem.title = `Attempt #${this.attempts}`;
        
        this.historyList.appendChild(historyItem);
        
        // Animate entry
        setTimeout(() => {
            historyItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    }

    updateDisplay() {
        this.animateNumber(this.attemptsDisplay, this.attempts);
        this.animateNumber(this.remainingDisplay, this.maxAttempts - this.attempts);
    }

    animateNumber(element, targetNumber) {
        const currentNumber = parseInt(element.textContent) || 0;
        if (currentNumber === targetNumber) return;
        
        const duration = 300;
        const steps = 10;
        const increment = (targetNumber - currentNumber) / steps;
        let current = currentNumber;
        let step = 0;
        
        const timer = setInterval(() => {
            step++;
            current += increment;
            element.textContent = Math.round(current);
            
            if (step >= steps) {
                element.textContent = targetNumber;
                clearInterval(timer);
            }
        }, duration / steps);
    }

    updateRangeDisplay() {
        this.minRangeDisplay.textContent = this.minRange;
        this.maxRangeDisplay.textContent = this.maxRange;
        
        // Pulse animation for range update
        const rangeElement = document.querySelector('.hint-range');
        rangeElement.style.animation = 'none';
        setTimeout(() => {
            rangeElement.style.animation = 'fadeInScale 0.5s ease';
        }, 10);
    }

    updateBestScore() {
        if (!this.bestScore || this.attempts < parseInt(this.bestScore)) {
            this.bestScore = this.attempts;
            localStorage.setItem('bestScore', this.bestScore);
            this.animateNumber(this.bestScoreDisplay, this.bestScore);
            
            // Add special effect for new best score
            this.newRecordAnimation();
        }
    }

    endGame() {
        this.guessInput.disabled = true;
        this.guessBtn.disabled = true;
        
        // Visual feedback
        this.guessInput.style.opacity = '0.5';
        this.guessBtn.style.opacity = '0.5';
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
                stat.style.animation = 'pulse 0.6s';
                setTimeout(() => {
                    stat.style.animation = '';
                }, 600);
            }, index * 100);
        });
    }

    screenPulse() {
        const gameCard = document.querySelector('.game-card');
        gameCard.style.animation = 'pulse 0.4s';
        setTimeout(() => {
            gameCard.style.animation = '';
        }, 400);
    }

    screenShake() {
        const container = document.querySelector('.container');
        container.style.animation = 'shake 0.6s';
        setTimeout(() => {
            container.style.animation = '';
        }, 600);
    }

    celebrationAnimation() {
        const gameCard = document.querySelector('.game-card');
        gameCard.style.animation = 'successPulse 1s ease-out';
        setTimeout(() => {
            gameCard.style.animation = '';
        }, 1000);
    }

    newRecordAnimation() {
        const bestScoreElement = this.bestScoreDisplay.parentElement;
        bestScoreElement.style.animation = 'successPulse 1s ease-out';
        setTimeout(() => {
            bestScoreElement.style.animation = '';
        }, 1000);
    }

    createConfetti() {
        const colors = ['#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b'];
        const confettiCount = 150;
        const shapes = ['●', '■', '▲', '★', '♦'];

        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.textContent = shapes[Math.floor(Math.random() * shapes.length)];
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.color = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.fontSize = (Math.random() * 20 + 10) + 'px';
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            confetti.style.animationDuration = (Math.random() * 2 + 2.5) + 's';
            
            this.confettiContainer.appendChild(confetti);

            setTimeout(() => confetti.remove(), 5000);
        }
    }
}

// Add enhanced animations to CSS via JavaScript
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
        20%, 40%, 60%, 80% { transform: translateX(10px); }
    }
    
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.08); }
    }
    
    .input-container {
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
`;
document.head.appendChild(style);

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new NumberGuessingGame();
    
    // Add smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';
});
