// Numerical Ninja - Premium Logic
let game = null;

class NumberGuessingGame {
    constructor() {
        this.difficulties = {
            easy: { min: 1, max: 50, attempts: 12 },
            medium: { min: 1, max: 100, attempts: 10 },
            hard: { min: 1, max: 200, attempts: 8 }
        };

        this.currentDifficulty = 'medium';
        this.secretNumber = null;
        this.attempts = 0;
        this.guessHistory = [];
        this.minRange = 1;
        this.maxRange = 100;
        this.bestScores = JSON.parse(localStorage.getItem('ninjaBestScores')) || { easy: null, medium: null, hard: null };

        this.initializeElements();
        this.attachEventListeners();
        this.startNewGame('medium');
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
        this.masteryWheel = document.getElementById('masteryWheel');
        this.diffButtons = document.querySelectorAll('.diff-btn');
    }

    attachEventListeners() {
        this.guessBtn.addEventListener('click', () => this.makeGuess());
        this.guessInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') this.makeGuess(); });
        this.restartBtn.addEventListener('click', () => this.startNewGame(this.currentDifficulty));

        this.diffButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const diff = btn.dataset.difficulty;
                this.startNewGame(diff);
            });
        });

        // Mouse parallax effect for card
        document.addEventListener('mousemove', (e) => {
            const card = document.querySelector('.game-card');
            if (!card) return;
            const x = (window.innerWidth / 2 - e.pageX) / 45;
            const y = (window.innerHeight / 2 - e.pageY) / 45;
            card.style.transform = `rotateY(${x}deg) rotateX(${y}deg)`;
        });
    }

    startNewGame(difficulty = 'medium') {
        this.currentDifficulty = difficulty;
        const config = this.difficulties[difficulty];

        this.secretNumber = Math.floor(Math.random() * (config.max - config.min + 1)) + config.min;
        this.attempts = 0;
        this.guessHistory = [];
        this.minRange = config.min;
        this.maxRange = config.max;
        this.totalTries = config.attempts;

        // UI Updates
        this.diffButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.difficulty === difficulty));
        this.guessInput.disabled = false;
        this.guessInput.value = '';
        this.guessInput.focus();
        this.guessBtn.disabled = false;
        this.historyList.innerHTML = '';
        this.showFeedback('Guess the number to begin!', 'neutral');

        this.updateDisplay();
        this.updateRangeDisplay();
        this.updateBestScoreDisplay();

        console.log(`New ${difficulty} game started. Secret: ${this.secretNumber}`);
    }

    makeGuess() {
        const val = this.guessInput.value.trim();
        const guess = parseInt(val);

        if (isNaN(guess) || guess < this.difficulties[this.currentDifficulty].min || guess > this.difficulties[this.currentDifficulty].max) {
            this.showFeedback(`❌ Enter a number between ${this.difficulties[this.currentDifficulty].min} and ${this.difficulties[this.currentDifficulty].max}`, 'neutral');
            this.shakeInput();
            return;
        }

        if (this.guessHistory.includes(guess)) {
            this.showFeedback('🔄 You already tried that!', 'neutral');
            this.shakeInput();
            return;
        }

        this.attempts++;
        this.guessHistory.push(guess);
        this.updateDisplay();

        if (guess === this.secretNumber) {
            this.handleWin();
        } else if (this.attempts >= this.totalTries) {
            this.handleLoss();
        } else {
            this.handleIncorrectGuess(guess);
        }

        this.guessInput.value = '';
        this.guessInput.focus();
    }

    handleIncorrectGuess(guess) {
        const diff = Math.abs(guess - this.secretNumber);
        let msg = '';
        let type = '';

        if (guess > this.secretNumber) {
            msg = diff < 5 ? '🔥 Just a bit too high!' : diff < 15 ? '🌡️ High!' : '🧊 Way too high!';
            type = 'too-high';
            this.maxRange = Math.min(this.maxRange, guess - 1);
        } else {
            msg = diff < 5 ? '🔥 Just a bit too low!' : diff < 15 ? '🌡️ Low!' : '🧊 Way too low!';
            type = 'too-low';
            this.minRange = Math.max(this.minRange, guess + 1);
        }

        this.showFeedback(msg, type);
        this.addToHistory(guess, type);
        this.updateRangeDisplay();

        if (diff < 5) this.pulseCard('rgba(139, 92, 246, 0.3)');
    }

    handleWin() {
        this.showFeedback(`👑 Victory! It was ${this.secretNumber}`, 'success');
        this.endGame();
        this.saveBestScore();
        this.createConfetti();
        this.pulseCard('rgba(16, 185, 129, 0.4)');
    }

    handleLoss() {
        this.showFeedback(`💀 Defeat! The number was ${this.secretNumber}`, 'too-high');
        this.endGame();
        this.shakeCard();
    }

    updateDisplay() {
        this.attemptsDisplay.textContent = this.attempts;
        this.remainingDisplay.textContent = this.totalTries - this.attempts;

        // Update Mastery Wheel
        const offset = 283 - (this.attempts / this.totalTries) * 283;
        this.masteryWheel.style.strokeDashoffset = offset;

        // Color transition for wheel
        const progress = this.attempts / this.totalTries;
        if (progress > 0.8) this.masteryWheel.style.stroke = 'var(--danger)';
        else if (progress > 0.5) this.masteryWheel.style.stroke = 'var(--warning)';
        else this.masteryWheel.style.stroke = 'var(--primary)';
    }

    updateRangeDisplay() {
        this.minRangeDisplay.textContent = this.minRange;
        this.maxRangeDisplay.textContent = this.maxRange;
    }

    updateBestScoreDisplay() {
        const best = this.bestScores[this.currentDifficulty];
        this.bestScoreDisplay.textContent = best || '-';
    }

    saveBestScore() {
        const currentBest = this.bestScores[this.currentDifficulty];
        if (!currentBest || this.attempts < currentBest) {
            this.bestScores[this.currentDifficulty] = this.attempts;
            localStorage.setItem('ninjaBestScores', JSON.stringify(this.bestScores));
            this.updateBestScoreDisplay();
        }
    }

    showFeedback(msg, type) {
        this.feedbackMessage.textContent = msg;
        this.feedbackMessage.className = `feedback-message ${type}`;
    }

    addToHistory(guess, type) {
        const item = document.createElement('div');
        item.className = `history-item ${type}`;
        item.textContent = guess;
        this.historyList.prepend(item);
    }

    endGame() {
        this.guessInput.disabled = true;
        this.guessBtn.disabled = true;
    }

    shakeInput() {
        this.guessInput.style.animation = 'shake 0.4s ease';
        setTimeout(() => this.guessInput.style.animation = '', 400);
    }

    pulseCard(color) {
        const card = document.querySelector('.game-card');
        card.style.boxShadow = `0 0 30px ${color}`;
        setTimeout(() => card.style.boxShadow = '', 1000);
    }

    shakeCard() {
        const card = document.querySelector('.game-card');
        card.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => card.style.animation = '', 500);
    }

    createConfetti() {
        const colors = ['#8b5cf6', '#ec4899', '#06b6d4', '#10b981'];
        const container = document.getElementById('confettiContainer');

        for (let i = 0; i < 100; i++) {
            const p = document.createElement('div');
            p.style.position = 'absolute';
            p.style.width = '8px';
            p.style.height = '8px';
            p.style.background = colors[Math.floor(Math.random() * colors.length)];
            p.style.left = Math.random() * 100 + 'vw';
            p.style.top = '-10px';
            p.style.borderRadius = '50%';
            p.style.zIndex = '1000';
            p.animate([
                { transform: 'translate(0, 0) rotate(0)', opacity: 1 },
                { transform: `translate(${Math.random() * 200 - 100}px, 100vh) rotate(${Math.random() * 360}deg)`, opacity: 0 }
            ], {
                duration: Math.random() * 3000 + 2000,
                easing: 'cubic-bezier(0, .9, .57, 1)'
            }).onfinish = () => p.remove();
            container.appendChild(p);
        }
    }
}

// Initialize
window.addEventListener('load', () => {
    game = new NumberGuessingGame();
});
