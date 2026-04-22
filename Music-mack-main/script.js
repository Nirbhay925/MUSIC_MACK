// ===== MUSIC MACK - Frontend with Spring Boot Backend =====

const API_BASE = 'http://localhost:8080/api';

// --- STATE ---
let currentSongs = [];
let currentIndex = 0;
let isPlaying = false;
let isShuffle = false;
let isRepeat = false;
let audio = new Audio();
let currentMood = 'chill';

// --- DOM ELEMENTS ---
const musicGrid = document.getElementById('musicGrid');
const playlistContainer = document.getElementById('playlistContainer');
const moodSlider = document.getElementById('moodSlider');
const moodLabel = document.getElementById('moodLabel');
const playBtn = document.getElementById('playBtn');
const playerTitle = document.getElementById('playerTitle');
const playerArtist = document.getElementById('playerArtist');
const playerThumb = document.getElementById('playerThumb');
const progressBar = document.querySelector('.progress-bar');
const progressFill = document.querySelector('.progress-fill');
const currentTimeEl = document.getElementById('currentTime');
const totalTimeEl = document.getElementById('totalTime');
const volumeSlider = document.getElementById('volumeSlider');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const repeatBtn = document.getElementById('repeatBtn');
const searchInput = document.getElementById('searchInput');
const loadingOverlay = document.getElementById('loadingOverlay');
const songCountBadge = document.getElementById('songCount');

// --- INITIALIZATION ---
async function init() {
    // Check if we came from home page with a mood
    const urlParams = new URLSearchParams(window.location.search);
    const moodParam = urlParams.get('mood');

    if (moodParam) {
        currentMood = moodParam;
        setSliderForMood(moodParam);
    }

    await loadSongsForMood(currentMood);
    renderPlaylists();
    setupEventListeners();

    // Set initial volume
    audio.volume = 0.7;
    if (volumeSlider) volumeSlider.value = 70;
}

// --- API CALLS ---
async function loadSongsForMood(mood) {
    showLoading(true);
    try {
        const response = await fetch(`${API_BASE}/songs/${mood}`);
        if (!response.ok) throw new Error('Failed to fetch songs');
        const data = await response.json();
        currentSongs = data.songs || [];
        currentIndex = 0;
        renderSongs(currentSongs);
        updateSongCount(currentSongs.length);
        if (currentSongs.length > 0) {
            loadTrack(0, false); // load but don't play
        }
    } catch (error) {
        console.error('Error loading songs:', error);
        showError('Failed to load songs. Make sure the backend is running on port 8080.');
    } finally {
        showLoading(false);
    }
}

async function searchSongs(query) {
    if (!query || query.length < 2) {
        renderSongs(currentSongs);
        return;
    }
    showLoading(true);
    try {
        const response = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error('Search failed');
        const data = await response.json();
        const results = data.songs || [];
        renderSongs(results);
        updateSongCount(results.length);
        // Replace current playlist with search results for playback
        if (results.length > 0) {
            currentSongs = results;
            currentIndex = 0;
        }
    } catch (error) {
        console.error('Search error:', error);
    } finally {
        showLoading(false);
    }
}

// --- RENDER FUNCTIONS ---
function renderSongs(songs) {
    if (!songs || songs.length === 0) {
        musicGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align:center; padding:3rem; color: var(--text-dim);">
                <i class="fas fa-music" style="font-size:3rem; margin-bottom:1rem; display:block; opacity:0.3;"></i>
                <p>No songs found. Try a different mood or search term.</p>
            </div>`;
        return;
    }

    musicGrid.innerHTML = songs.map((song, index) => `
        <div class="card ${index === currentIndex ? 'active-card' : ''}" 
             onclick="playFromIndex(${index})" 
             data-index="${index}">
            <img src="${song.artworkUrl100 || 'https://via.placeholder.com/300/1a1a2e/ffffff?text=♪'}" 
                 alt="${escapeHtml(song.trackName)}"
                 loading="lazy"
                 onerror="this.src='https://via.placeholder.com/300/1a1a2e/ffffff?text=♪'">
            <div class="play-overlay">
                <i class="fas fa-play" style="color: black"></i>
            </div>
            <h4>${escapeHtml(truncate(song.trackName, 22))}</h4>
            <p>${escapeHtml(truncate(song.artistName, 25))}</p>
            <span class="card-duration">${formatDuration(song.trackTimeMillis)}</span>
        </div>
    `).join('');
}

function renderPlaylists() {
    const moods = ['happy', 'sad', 'chill', 'energetic', 'party', 'romantic', 'focus', 'angry'];
    const moodIcons = {
        happy: 'fa-smile', sad: 'fa-sad-tear', chill: 'fa-snowflake',
        energetic: 'fa-bolt', party: 'fa-glass-cheers', romantic: 'fa-heart',
        focus: 'fa-brain', angry: 'fa-fire'
    };

    playlistContainer.innerHTML = moods.map(mood => `
        <div class="menu-item ${mood === currentMood ? 'active' : ''}" 
             onclick="switchMood('${mood}')">
            <i class="fas ${moodIcons[mood]}"></i> 
            ${mood.charAt(0).toUpperCase() + mood.slice(1)}
        </div>
    `).join('');
}

// --- AUDIO PLAYBACK ---
function loadTrack(index, autoPlay = true) {
    if (index < 0 || index >= currentSongs.length) return;

    currentIndex = index;
    const song = currentSongs[currentIndex];

    playerTitle.innerText = song.trackName;
    playerArtist.innerText = song.artistName;
    playerThumb.src = song.artworkUrl100 || 'https://via.placeholder.com/100/1a1a2e/ffffff?text=♪';

    audio.src = song.previewUrl;
    audio.load();

    // Highlight active card
    document.querySelectorAll('.card').forEach((card, i) => {
        card.classList.toggle('active-card', i === index);
    });

    if (autoPlay) {
        audio.play().then(() => {
            isPlaying = true;
            updatePlayButton();
        }).catch(e => console.error('Playback error:', e));
    }
}

function playFromIndex(index) {
    loadTrack(index, true);
}

function togglePlay() {
    if (!audio.src || currentSongs.length === 0) return;

    if (isPlaying) {
        audio.pause();
    } else {
        audio.play().catch(e => console.error('Playback error:', e));
    }
    isPlaying = !isPlaying;
    updatePlayButton();
}

function playNext() {
    if (currentSongs.length === 0) return;

    if (isShuffle) {
        let nextIndex;
        do {
            nextIndex = Math.floor(Math.random() * currentSongs.length);
        } while (nextIndex === currentIndex && currentSongs.length > 1);
        loadTrack(nextIndex);
    } else {
        loadTrack((currentIndex + 1) % currentSongs.length);
    }
}

function playPrev() {
    if (currentSongs.length === 0) return;

    // If more than 3 seconds in, restart current song
    if (audio.currentTime > 3) {
        audio.currentTime = 0;
        return;
    }

    if (isShuffle) {
        let prevIndex;
        do {
            prevIndex = Math.floor(Math.random() * currentSongs.length);
        } while (prevIndex === currentIndex && currentSongs.length > 1);
        loadTrack(prevIndex);
    } else {
        loadTrack((currentIndex - 1 + currentSongs.length) % currentSongs.length);
    }
}

function toggleShuffle() {
    isShuffle = !isShuffle;
    if (shuffleBtn) {
        shuffleBtn.style.color = isShuffle ? 'var(--accent-color)' : 'var(--text-dim)';
    }
}

function toggleRepeat() {
    isRepeat = !isRepeat;
    if (repeatBtn) {
        repeatBtn.style.color = isRepeat ? 'var(--accent-color)' : 'var(--text-dim)';
    }
}

function updatePlayButton() {
    const icon = playBtn.querySelector('i');
    if (isPlaying) {
        icon.classList.remove('fa-play');
        icon.classList.add('fa-pause');
    } else {
        icon.classList.remove('fa-pause');
        icon.classList.add('fa-play');
    }
}

// --- MOOD SWITCHING ---
async function switchMood(mood) {
    currentMood = mood;
    moodLabel.innerText = mood.charAt(0).toUpperCase() + mood.slice(1);
    setMoodColor(mood);
    setSliderForMood(mood);
    renderPlaylists();
    await loadSongsForMood(mood);
}

function setSliderForMood(mood) {
    const moodPositions = {
        chill: 10, sad: 20, happy: 30, romantic: 40,
        focus: 50, energetic: 65, party: 75,
        angry: 90
    };
    if (moodSlider && moodPositions[mood] !== undefined) {
        moodSlider.value = moodPositions[mood];
    }
    moodLabel.innerText = mood.charAt(0).toUpperCase() + mood.slice(1);
    setMoodColor(mood);
}

function setMoodColor(mood) {
    const moodColors = {
        chill: '#00f2ff',
        happy: '#ffeb3b',
        sad: '#667eea',
        energetic: '#ff5722',
        party: '#f093fb',
        romantic: '#ff6b9d',
        focus: '#4ecdc4',
        angry: '#f44336'
    };
    const color = moodColors[mood] || '#00f2ff';
    document.documentElement.style.setProperty('--accent-color', color);
    moodLabel.style.color = color;
}

// --- EVENT LISTENERS ---
function setupEventListeners() {
    // Play/Pause button
    playBtn.addEventListener('click', togglePlay);

    // Next/Previous
    if (nextBtn) nextBtn.addEventListener('click', playNext);
    if (prevBtn) prevBtn.addEventListener('click', playPrev);

    // Shuffle/Repeat
    if (shuffleBtn) shuffleBtn.addEventListener('click', toggleShuffle);
    if (repeatBtn) repeatBtn.addEventListener('click', toggleRepeat);

    // Audio events
    audio.addEventListener('timeupdate', () => {
        if (audio.duration) {
            const pct = (audio.currentTime / audio.duration) * 100;
            progressFill.style.width = pct + '%';
            if (currentTimeEl) currentTimeEl.innerText = formatTime(audio.currentTime);
            if (totalTimeEl) totalTimeEl.innerText = formatTime(audio.duration);
        }
    });

    audio.addEventListener('ended', () => {
        if (isRepeat) {
            audio.currentTime = 0;
            audio.play();
        } else {
            playNext();
        }
    });

    audio.addEventListener('play', () => {
        isPlaying = true;
        updatePlayButton();
    });

    audio.addEventListener('pause', () => {
        isPlaying = false;
        updatePlayButton();
    });

    // Progress bar click
    if (progressBar) {
        progressBar.addEventListener('click', (e) => {
            const rect = progressBar.getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            audio.currentTime = pct * audio.duration;
        });
    }

    // Volume
    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            audio.volume = e.target.value / 100;
        });
    }

    // Mood slider
    moodSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        let mood = 'chill';

        if (val <= 15) mood = 'chill';
        else if (val <= 30) mood = 'happy';
        else if (val <= 45) mood = 'romantic';
        else if (val <= 55) mood = 'focus';
        else if (val <= 70) mood = 'energetic';
        else if (val <= 85) mood = 'party';
        else mood = 'angry';

        if (mood !== currentMood) {
            switchMood(mood);
        }
    });

    // Search with debounce
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();
        searchTimeout = setTimeout(() => {
            if (query.length >= 2) {
                searchSongs(query);
            } else if (query.length === 0) {
                loadSongsForMood(currentMood);
            }
        }, 400);
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT') return; // Don't hijack search input
        switch (e.code) {
            case 'Space':
                e.preventDefault();
                togglePlay();
                break;
            case 'ArrowRight':
                playNext();
                break;
            case 'ArrowLeft':
                playPrev();
                break;
        }
    });
}

// --- UTILITIES ---
function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatDuration(millis) {
    if (!millis) return '';
    const totalSecs = Math.floor(millis / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function truncate(str, len) {
    if (!str) return '';
    return str.length > len ? str.substring(0, len) + '…' : str;
}

function showLoading(show) {
    if (loadingOverlay) {
        loadingOverlay.style.display = show ? 'flex' : 'none';
    }
}

function showError(msg) {
    musicGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align:center; padding:3rem; color: #ff5252;">
            <i class="fas fa-exclamation-triangle" style="font-size:3rem; margin-bottom:1rem; display:block;"></i>
            <p>${msg}</p>
            <button onclick="loadSongsForMood(currentMood)" 
                    style="margin-top:1rem; padding:10px 20px; background:var(--accent-color); 
                           border:none; border-radius:8px; color:black; cursor:pointer; font-weight:600;">
                Retry
            </button>
        </div>`;
}

function updateSongCount(count) {
    if (songCountBadge) {
        songCountBadge.innerText = `${count} songs`;
    }
}

// --- START ---
init();