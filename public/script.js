const audioPlayer = document.getElementById('audioPlayer');
const playBtn = document.getElementById('playBtn');
const status = document.getElementById('status');
const volumeSlider = document.getElementById('volumeSlider');
const timeDisplay = document.getElementById('timeDisplay');

const streamUrl = 'https://d3d4yli4hf5bmh.cloudfront.net/hls/live.m3u8';
let hls;
let isPlaying = false;
let currentTrackIndex = 0;
let recentlyPlayedTracks = [];
let trackChangeTimer;

// Mock song database with album artwork, ratings and years
const songDatabase = [
    { title: "Sunset Dreams", artist: "The Wavelength", album: "Ocean Vibes", year: 1987, source: "Ocean Vibes (Original Album)", artwork: "https://picsum.photos/500/500?random=1", thumbsUp: 127, thumbsDown: 8 },
    { title: "Midnight Jazz", artist: "Blue Note Collective", album: "After Hours", year: 1995, source: "After Hours (Deluxe Edition)", artwork: "https://picsum.photos/500/500?random=2", thumbsUp: 89, thumbsDown: 12 },
    { title: "Electric Pulse", artist: "Synth Masters", album: "Digital Revolution", year: 1982, source: "Digital Revolution (Remastered)", artwork: "https://picsum.photos/500/500?random=3", thumbsUp: 156, thumbsDown: 23 },
    { title: "Acoustic Soul", artist: "Sarah Mitchell", album: "Unplugged Sessions", year: 2001, source: "Unplugged Sessions (Live)", artwork: "https://picsum.photos/500/500?random=4", thumbsUp: 203, thumbsDown: 5 },
    { title: "City Lights", artist: "Urban Echo", album: "Metropolitan", year: 1999, source: "Metropolitan (Original Motion Picture Soundtrack)", artwork: "https://picsum.photos/500/500?random=5", thumbsUp: 78, thumbsDown: 34 },
    { title: "Forest Whispers", artist: "Nature's Symphony", album: "Earth Songs", year: 1993, source: "Earth Songs (Environmental Collection)", artwork: "https://picsum.photos/500/500?random=6", thumbsUp: 145, thumbsDown: 7 },
    { title: "Retro Wave", artist: "Neon Nights", album: "80s Revival", year: 1984, source: "80s Revival (Complete Collection)", artwork: "https://picsum.photos/500/500?random=7", thumbsUp: 298, thumbsDown: 15 },
    { title: "Gentle Rain", artist: "Ambient Spaces", album: "Weather Patterns", year: 2003, source: "Weather Patterns (Ambient Series)", artwork: "https://picsum.photos/500/500?random=8", thumbsUp: 167, thumbsDown: 9 },
    { title: "Dancing Stars", artist: "Cosmic Groove", album: "Galaxy Mix", year: 1979, source: "Galaxy Mix (Space Disco Collection)", artwork: "https://picsum.photos/500/500?random=9", thumbsUp: 134, thumbsDown: 18 },
    { title: "Morning Coffee", artist: "Café Musicians", album: "Daily Rhythms", year: 2005, source: "Daily Rhythms (Coffee House Sessions)", artwork: "https://picsum.photos/500/500?random=10", thumbsUp: 92, thumbsDown: 11 },
    { title: "Ocean Breeze", artist: "Coastal Sounds", album: "Seaside Sessions", year: 1991, source: "Seaside Sessions (Beach Collection)", artwork: "https://picsum.photos/500/500?random=11", thumbsUp: 188, thumbsDown: 6 },
    { title: "Mountain High", artist: "Peak Performance", album: "Summit Collection", year: 1996, source: "Summit Collection (Mountain Classics)", artwork: "https://picsum.photos/500/500?random=12", thumbsUp: 76, thumbsDown: 29 }
];

// Track user votes for current session
let userVotes = {};

function initializePlayer() {
    if (Hls.isSupported()) {
        hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
        });
        
        hls.loadSource(streamUrl);
        hls.attachMedia(audioPlayer);
        
        hls.on(Hls.Events.MANIFEST_PARSED, function() {
            updateStatus('Stream loaded - Ready to play', 'ready');
        });
        
        hls.on(Hls.Events.ERROR, function(event, data) {
            console.error('HLS error:', data);
            if (data.fatal) {
                switch(data.type) {
                    case Hls.ErrorTypes.NETWORK_ERROR:
                        updateStatus('Network error - Check your connection', 'error');
                        break;
                    case Hls.ErrorTypes.MEDIA_ERROR:
                        updateStatus('Media error - Trying to recover...', 'error');
                        hls.recoverMediaError();
                        break;
                    default:
                        updateStatus('Fatal error - Stream unavailable', 'error');
                        break;
                }
            }
        });
    } else if (audioPlayer.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari native HLS support
        audioPlayer.src = streamUrl;
        updateStatus('Using native HLS support', 'ready');
    } else {
        updateStatus('HLS not supported in this browser', 'error');
    }
}

function playStream() {
    if (!isPlaying) {
        audioPlayer.play().then(() => {
            isPlaying = true;
            playBtn.textContent = '⏸️';
            updateStatus('🎵 Playing live stream...', 'playing');
            startTrackRotation();
        }).catch((error) => {
            console.error('Play error:', error);
            updateStatus('Error playing stream', 'error');
        });
    } else {
        audioPlayer.pause();
        isPlaying = false;
        playBtn.textContent = '▶️';
        updateStatus('⏸️ Paused', 'stopped');
        stopTrackRotation();
    }
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function updateTimeDisplay() {
    if (audioPlayer.currentTime) {
        timeDisplay.textContent = formatTime(audioPlayer.currentTime);
    } else {
        timeDisplay.textContent = '00:00';
    }
}

function getCurrentTrack() {
    return songDatabase[currentTrackIndex];
}

function updateNowPlaying() {
    const track = getCurrentTrack();
    const trackId = currentTrackIndex;
    const userVote = userVotes[trackId];
    
    // Update all the display elements
    document.getElementById('currentAlbumArt').src = track.artwork;
    document.getElementById('yearBadge').textContent = track.year;
    document.getElementById('artistName').textContent = track.artist.toUpperCase();
    document.getElementById('trackTitle').textContent = track.title;
    document.getElementById('trackSubtitle').textContent = track.artist;
    document.getElementById('albumInfo').textContent = `${track.album} (${track.year})`;
    document.getElementById('albumSource').textContent = track.source;
    
    // Update rating buttons
    const thumbsUpBtn = document.getElementById('thumbsUp');
    const thumbsDownBtn = document.getElementById('thumbsDown');
    
    thumbsUpBtn.className = `rating-btn ${userVote === 'up' ? 'voted' : ''}`;
    thumbsDownBtn.className = `rating-btn ${userVote === 'down' ? 'voted' : ''}`;
    
    thumbsUpBtn.textContent = `👍 ${track.thumbsUp}`;
    thumbsDownBtn.textContent = `👎 ${track.thumbsDown}`;
}

function addToRecentlyPlayed(track) {
    // Add to beginning of array
    recentlyPlayedTracks.unshift(track);
    
    // Keep only last 5 tracks
    if (recentlyPlayedTracks.length > 5) {
        recentlyPlayedTracks = recentlyPlayedTracks.slice(0, 5);
    }
    
    updateRecentlyPlayedDisplay();
}

function updateRecentlyPlayedDisplay() {
    const recentDiv = document.getElementById('recentlyPlayed');
    
    if (recentlyPlayedTracks.length === 0) {
        recentDiv.innerHTML = `
            <div class="track-item">TLC: <span class="track-name">Ain't 2 Proud 2 Beg</span></div>
            <div class="track-item">The Raconteurs: <span class="track-name">Steady, As She Goes</span></div>
            <div class="track-item">Mick Jagger: <span class="track-name">Just Another Night</span></div>
            <div class="track-item">Beyoncé: <span class="track-name">Irreplaceable (Album Version)</span></div>
            <div class="track-item">Etta James: <span class="track-name">I'd Rather Go Blind</span></div>
        `;
        return;
    }
    
    const tracksHtml = recentlyPlayedTracks.map(track => 
        `<div class="track-item">
            <span class="track-artist">${track.artist}:</span> <span class="track-name">${track.title}</span>
        </div>`
    ).join('');
    
    recentDiv.innerHTML = tracksHtml;
}

function nextTrack() {
    // Add current track to recently played before switching
    addToRecentlyPlayed(getCurrentTrack());
    
    // Move to next track
    currentTrackIndex = (currentTrackIndex + 1) % songDatabase.length;
    updateNowPlaying();
}

function startTrackRotation() {
    // Change track every 30-60 seconds for demo (in production use 180-300 seconds)
    const intervalTime = (Math.random() * 30 + 30) * 1000;
    
    trackChangeTimer = setTimeout(() => {
        if (isPlaying) {
            nextTrack();
            startTrackRotation(); // Schedule next change
        }
    }, intervalTime);
}

function stopTrackRotation() {
    if (trackChangeTimer) {
        clearTimeout(trackChangeTimer);
        trackChangeTimer = null;
    }
}

function vote(type) {
    const trackId = currentTrackIndex;
    const track = songDatabase[trackId];
    const currentVote = userVotes[trackId];
    
    if (currentVote === type) {
        // User is removing their vote
        if (type === 'up') {
            track.thumbsUp--;
        } else {
            track.thumbsDown--;
        }
        delete userVotes[trackId];
    } else {
        // User is changing or adding their vote
        if (currentVote === 'up') {
            track.thumbsUp--;
            track.thumbsDown++;
        } else if (currentVote === 'down') {
            track.thumbsDown--;
            track.thumbsUp++;
        } else {
            // New vote
            if (type === 'up') {
                track.thumbsUp++;
            } else {
                track.thumbsDown++;
            }
        }
        userVotes[trackId] = type;
    }
    
    // Update the display
    updateNowPlaying();
    
    // Show feedback
    const message = currentVote === type ? 'Vote removed!' : 
                   type === 'up' ? 'Thanks for the thumbs up! 👍' : 'Thanks for the feedback! 👎';
    showVoteFeedback(message);
}

function showVoteFeedback(message) {
    const status = document.getElementById('status');
    const originalText = status.textContent;
    const originalClass = status.className;
    
    status.textContent = message;
    status.className = 'status playing';
    
    setTimeout(() => {
        status.textContent = originalText;
        status.className = originalClass;
    }, 2000);
}

function setVolume(value) {
    audioPlayer.volume = value / 100;
    updateVolumeDisplay();
}

function updateVolumeDisplay() {
    const volume = Math.round(audioPlayer.volume * 100);
    volumeSlider.value = audioPlayer.muted ? 0 : volume;
}

function updateStatus(message, type = '') {
    status.textContent = message;
    status.className = `status ${type}`;
}

// Event listeners
audioPlayer.addEventListener('loadstart', () => updateStatus('Loading stream...', ''));
audioPlayer.addEventListener('canplay', () => updateStatus('Stream ready to play', 'ready'));
audioPlayer.addEventListener('playing', () => {
    updateStatus('🎵 Playing live stream...', 'playing');
    playBtn.textContent = '⏸️';
    isPlaying = true;
    startTrackRotation();
});
audioPlayer.addEventListener('pause', () => {
    updateStatus('⏸️ Paused', 'stopped');
    playBtn.textContent = '▶️';
    isPlaying = false;
    stopTrackRotation();
});
audioPlayer.addEventListener('ended', () => {
    updateStatus('Stream ended', 'stopped');
    playBtn.textContent = '▶️';
    isPlaying = false;
    stopTrackRotation();
});
audioPlayer.addEventListener('timeupdate', updateTimeDisplay);
audioPlayer.addEventListener('error', (e) => {
    console.error('Audio error:', e);
    updateStatus('Stream error - Please try again', 'error');
});

// Initialize volume
audioPlayer.volume = 0.5;
updateVolumeDisplay();

// Initialize displays
updateNowPlaying();
updateRecentlyPlayedDisplay();

// Initialize player on page load
window.addEventListener('load', initializePlayer);