document.addEventListener('DOMContentLoaded', () => {
    // Connect to WebSocket server
    const socket = io();
    
    // DOM Elements
    const musicPlayer = document.getElementById('music-player');
    const musicToggle = document.getElementById('music-toggle');
    const lightToggle = document.getElementById('light-toggle');
    const musicNote = document.querySelector('.music-note');
    const lightBulb = document.querySelector('.light-bulb');
    const volumeLevel = document.querySelector('.volume-level');
    const volumeValue = document.querySelector('.volume-value');
    const brightnessLevel = document.querySelector('.brightness-level');
    const brightnessValue = document.querySelector('.brightness-value');
    
    // State
    let state = {
        music_playing: musicNote.classList.contains('playing'),
        lights_on: lightBulb.classList.contains('on'),
        volume: parseInt(volumeValue.textContent),
        brightness: parseInt(brightnessValue.textContent)
    };
    
    // Preload the audio file
    musicPlayer.load();
    
    // Set initial volume
    musicPlayer.volume = state.volume / 100;
    
    // Initialize music player
    if (state.music_playing) {
        // Use a promise to handle autoplay restrictions
        const playPromise = musicPlayer.play();
        
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.error('Autoplay prevented:', error);
                // If autoplay is prevented, update the UI to reflect that music is not playing
                state.music_playing = false;
                musicNote.classList.remove('playing');
                musicToggle.querySelector('.toggle-slider').classList.remove('active');
            });
        }
    }
    
    // WebSocket event listeners
    socket.on('connect', () => {
        console.log('Connected to server');
    });
    
    socket.on('state_update', (data) => {
        console.log('State update received:', data);
        updateState(data);
    });
    
    // UI event listeners
    musicToggle.addEventListener('click', () => {
        fetch('/webhook?action=music_toggle')
            .then(response => response.json())
            .then(data => {
                console.log('Music toggle response:', data);
            })
            .catch(error => {
                console.error('Error toggling music:', error);
            });
    });
    
    lightToggle.addEventListener('click', () => {
        fetch('/webhook?action=lights_toggle')
            .then(response => response.json())
            .then(data => {
                console.log('Light toggle response:', data);
            })
            .catch(error => {
                console.error('Error toggling lights:', error);
            });
    });
    
    // Update UI based on state
    function updateState(newState) {
        // Update music state
        if (newState.hasOwnProperty('music_playing')) {
            state.music_playing = newState.music_playing;
            
            if (state.music_playing) {
                musicNote.classList.add('playing');
                musicToggle.querySelector('.toggle-slider').classList.add('active');
                
                // Use a promise to handle playback restrictions
                const playPromise = musicPlayer.play();
                
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.error('Playback prevented:', error);
                        // If playback is prevented, update the server state
                        fetch('/webhook?action=music_toggle')
                            .then(response => response.json())
                            .then(data => {
                                console.log('Reverting music state:', data);
                            });
                    });
                }
            } else {
                musicNote.classList.remove('playing');
                musicToggle.querySelector('.toggle-slider').classList.remove('active');
                musicPlayer.pause();
            }
        }
        
        // Update light state
        if (newState.hasOwnProperty('lights_on')) {
            state.lights_on = newState.lights_on;
            
            if (state.lights_on) {
                lightBulb.classList.add('on');
                lightToggle.querySelector('.toggle-slider').classList.add('active');
            } else {
                lightBulb.classList.remove('on');
                lightToggle.querySelector('.toggle-slider').classList.remove('active');
            }
        }
        
        // Update volume
        if (newState.hasOwnProperty('volume')) {
            state.volume = newState.volume;
            volumeLevel.style.width = `${state.volume}%`;
            volumeValue.textContent = `${state.volume}%`;
            musicPlayer.volume = state.volume / 100;
        }
        
        // Update brightness
        if (newState.hasOwnProperty('brightness')) {
            state.brightness = newState.brightness;
            brightnessLevel.style.width = `${state.brightness}%`;
            brightnessValue.textContent = `${state.brightness}%`;
            
            // Adjust light intensity based on brightness
            if (state.lights_on) {
                const intensity = state.brightness / 100;
                lightBulb.style.opacity = intensity;
                lightBulb.style.boxShadow = `0 0 ${15 * intensity}px var(--light-color)`;
            }
        }
    }
    
    // Add audio error handling
    musicPlayer.addEventListener('error', (e) => {
        console.error('Audio error:', e);
        alert('There was an error playing the audio. Please try again.');
    });
}); 