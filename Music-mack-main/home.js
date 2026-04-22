// Sample songs data
const songs = {
    happy: [
        { title: "Good Vibes", artist: "DJ Happy", duration: "3:15" },
        { title: "Sunshine", artist: "Pop Stars", duration: "2:45" }
    ],
    sad: [
        { title: "Rainy Days", artist: "Melancholy", duration: "4:20" }
    ],
    chill: [
        { title: "Ocean Waves", artist: "Lo-Fi Girl", duration: "3:30" }
    ],
    party: [
        { title: "Dance Floor", artist: "Party Kings", duration: "3:10" }
    ],
    focus: [
        { title: "Deep Work", artist: "Study Beats", duration: "4:00" }
    ],
    romantic: [
        { title: "Perfect Love", artist: "Romantic Souls", duration: "3:50" }
    ]
};

const currentSongs = [];

// DOM Elements
const moodCards = document.querySelectorAll('.mood-card');
const playPauseBtn = document.querySelector('.play-pause');
const progressFill = document.querySelector('.progress-fill');
const trackTitle = document.querySelector('.track-title');
const trackArtist = document.querySelector('.track-artist');
const currentTimeEl = document.querySelector('.current-time');
const playlistCards = document.querySelectorAll('.playlist-card');
const searchBar = document.querySelector('.search-bar');
const navLinks = document.querySelectorAll('.nav-link');
const ctaButton = document.querySelector('.cta-button');

// Initialize
let isPlaying = false;
let currentSongIndex = 0;
let progress = 0;

// Event Listeners
moodCards.forEach(card => {
    card.addEventListener('click', () => {
        const mood = card.dataset.mood;
        filterByMood(mood);
        updateActiveMood(card);
    });
});

playPauseBtn.addEventListener('click', togglePlayPause);
progressFill.parentElement.addEventListener('click', handleProgressClick);

playlistCards.forEach(card => {
    card.addEventListener('click', (e) => {
        if (!e.target.closest('.play-btn')) return;
        playPlaylist(card);
    });
});

searchBar.addEventListener('focus', () => {
    searchBar.parentElement.style.transform = 'scale(1.02)';
});

searchBar.addEventListener('blur', () => {
    searchBar.parentElement.style.transform = 'scale(1)';
});

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
    });
});

ctaButton.addEventListener('click', () => {
    playPauseBtn.click();
});

// Functions
function filterByMood(mood) {
    currentSongs.length = 0;
    currentSongs.push(...songs[mood]);
    currentSongIndex = 0;
    if (currentSongs.length > 0) {
        updateTrackInfo();
        showNotification(`${mood.charAt(0).toUpperCase() + mood.slice(1)} playlist loaded!`);
    }
}

function updateActiveMood(activeCard) {
    moodCards.forEach(card => {
        card.style.transform = 'translateY(0) scale(1)';
    });
    setTimeout(() => {
        activeCard.style.transform = 'translateY(-20px) scale(1.1)';
    }, 150);
}

function togglePlayPause() {
    isPlaying = !isPlaying;
    playPauseBtn.classList.toggle('playing', isPlaying);
    playPauseBtn.textContent = isPlaying ? '⏸' : '▶';
    
    if (isPlaying) {
        simulateProgress();
        animateAlbumArt();
    }
}

function updateTrackInfo() {
    if (currentSongs.length === 0) return;
    
    const song = currentSongs[currentSongIndex];
    trackTitle.textContent = song.title;
    trackArtist.textContent = song.artist;
}

function simulateProgress() {
    if (!isPlaying) return;
    
    progress += 0.1;
    if (progress >= 100) {
        progress = 0;
        nextTrack();
    }
    
    progressFill.style.width = progress + '%';
    updateTimeDisplay();
    
    requestAnimationFrame(simulateProgress);
}

function updateTimeDisplay() {
    const totalDuration = 225; // 3:45 in seconds
    const elapsed = Math.floor((progress / 100) * totalDuration);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    currentTimeEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function nextTrack() {
    currentSongIndex = (currentSongIndex + 1) % currentSongs.length;
    updateTrackInfo();
}

function handleProgressClick(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    progress = percent * 100;
    progressFill.style.width = progress + '%';
}

function playPlaylist(card) {
    const playlistName = card.querySelector('h3').textContent;
    showNotification(`${playlistName} playing!`);
    playPauseBtn.click();
}

function animateAlbumArt() {
    const albumArt = document.querySelector('.now-playing-art');
    if (isPlaying) {
        albumArt.style.animation = 'none';
        albumArt.offsetHeight; // Trigger reflow
        albumArt.style.animation = 'spin 20s linear infinite';
    } else {
        albumArt.style.animation = 'none';
    }
}

function showNotification(message) {
    // Simple notification effect
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: rgba(0, 212, 255, 0.9);
        color: #000;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        font-weight: 500;
        backdrop-filter: blur(10px);
        z-index: 2000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 10px 30px rgba(0, 212, 255, 0.3);
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Add CSS animation for spinning album art
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// Intersection Observer for scroll animations
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
});

// Observe mood cards and playlist cards
moodCards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(50px)';
    card.style.transition = 'all 0.6s ease';
    observer.observe(card);
});

playlistCards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(50px)';
    card.style.transition = 'all 0.6s ease';
    observer.observe(card);
});

// Initial track
updateTrackInfo();
