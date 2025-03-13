document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');
    
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
    
    console.log('Music player element:', musicPlayer);
    console.log('Audio source:', musicPlayer.querySelector('source').src);
    
    // Ensure the audio element has the loop attribute
    musicPlayer.loop = true;
    
    // Create an overlay for page brightness control
    const brightnessOverlay = document.createElement('div');
    brightnessOverlay.id = 'brightness-overlay';
    brightnessOverlay.style.position = 'fixed';
    brightnessOverlay.style.top = '0';
    brightnessOverlay.style.left = '0';
    brightnessOverlay.style.width = '100%';
    brightnessOverlay.style.height = '100%';
    brightnessOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    brightnessOverlay.style.pointerEvents = 'none'; // Allow clicks to pass through
    brightnessOverlay.style.zIndex = '9999';
    brightnessOverlay.style.transition = 'opacity 0.5s ease';
    brightnessOverlay.style.opacity = '0'; // Start with overlay hidden
    document.body.appendChild(brightnessOverlay);
    
    // State
    let state = {
        music_playing: musicNote.classList.contains('playing'),
        lights_on: lightBulb.classList.contains('on'),
        volume: parseInt(volumeValue.textContent),
        brightness: parseInt(brightnessValue.textContent)
    };
    
    console.log('Initial state:', state);
    
    // Set initial brightness
    updatePageBrightness(state.lights_on, state.brightness);
    
    // Preload the audio file
    musicPlayer.load();
    console.log('Audio loaded');
    
    // Set initial volume
    musicPlayer.volume = state.volume / 100;
    console.log('Volume set to:', musicPlayer.volume);
    
    // Add direct play button for testing
    const testButton = document.createElement('button');
    testButton.textContent = 'Test Audio Play';
    testButton.style.position = 'fixed';
    testButton.style.bottom = '10px';
    testButton.style.right = '10px';
    testButton.style.zIndex = '10000'; // Above the overlay
    testButton.style.padding = '10px';
    testButton.style.backgroundColor = '#6c5ce7';
    testButton.style.color = 'white';
    testButton.style.border = 'none';
    testButton.style.borderRadius = '5px';
    testButton.style.cursor = 'pointer';
    
    testButton.addEventListener('click', () => {
        console.log('Test button clicked');
        try {
            // Reset the audio to the beginning
            musicPlayer.currentTime = 0;
            
            // Ensure it's set to loop
            musicPlayer.loop = true;
            
            // Play the audio
            const playPromise = musicPlayer.play();
            console.log('Play initiated');
            
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        console.log('Audio playback started successfully');
                        // Update the UI to show music is playing
                        musicNote.classList.add('playing');
                        musicToggle.querySelector('.toggle-slider').classList.add('active');
                        state.music_playing = true;
                    })
                    .catch(error => {
                        console.error('Playback error:', error);
                        alert('Error playing audio: ' + error.message);
                    });
            }
        } catch (e) {
            console.error('Exception during play:', e);
            alert('Exception during play: ' + e.message);
        }
    });
    
    document.body.appendChild(testButton);
    
    // Add a stop button for testing
    const stopButton = document.createElement('button');
    stopButton.textContent = 'Stop Audio';
    stopButton.style.position = 'fixed';
    stopButton.style.bottom = '10px';
    stopButton.style.right = '150px';
    stopButton.style.zIndex = '10000'; // Above the overlay
    stopButton.style.padding = '10px';
    stopButton.style.backgroundColor = '#d63031';
    stopButton.style.color = 'white';
    stopButton.style.border = 'none';
    stopButton.style.borderRadius = '5px';
    stopButton.style.cursor = 'pointer';
    
    stopButton.addEventListener('click', () => {
        console.log('Stop button clicked');
        try {
            musicPlayer.pause();
            musicNote.classList.remove('playing');
            musicToggle.querySelector('.toggle-slider').classList.remove('active');
            state.music_playing = false;
            console.log('Audio stopped');
        } catch (e) {
            console.error('Exception during stop:', e);
        }
    });
    
    document.body.appendChild(stopButton);
    
    // Initialize music player
    if (state.music_playing) {
        console.log('Attempting to autoplay music');
        // Use a promise to handle autoplay restrictions
        const playPromise = musicPlayer.play();
        
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    console.log('Autoplay successful');
                })
                .catch(error => {
                    console.error('Autoplay prevented:', error);
                    // If autoplay is prevented, update the UI to reflect that music is not playing
                    state.music_playing = false;
                    musicNote.classList.remove('playing');
                    musicToggle.querySelector('.toggle-slider').classList.remove('active');
                    alert('Autoplay prevented by browser. Please interact with the page first.');
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
        console.log('Music toggle clicked');
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
        console.log('Light toggle clicked');
        fetch('/webhook?action=lights_toggle')
            .then(response => response.json())
            .then(data => {
                console.log('Light toggle response:', data);
            })
            .catch(error => {
                console.error('Error toggling lights:', error);
            });
    });
    
    // Function to update page brightness
    function updatePageBrightness(lightsOn, brightnessValue) {
        console.log('Updating page brightness:', lightsOn, brightnessValue);
        
        if (!lightsOn) {
            // If lights are off, make the page dark
            brightnessOverlay.style.opacity = '0.7';
        } else {
            // If lights are on, adjust brightness based on the brightness value
            // Invert the brightness value for the overlay (higher brightness = less overlay)
            const overlayOpacity = 0.7 * (1 - (brightnessValue / 100));
            brightnessOverlay.style.opacity = overlayOpacity.toString();
        }
    }
    
    // Update UI based on state
    function updateState(newState) {
        console.log('Updating state with:', newState);
        
        // Update music state
        if (newState.hasOwnProperty('music_playing')) {
            state.music_playing = newState.music_playing;
            console.log('Music playing state updated to:', state.music_playing);
            
            if (state.music_playing) {
                musicNote.classList.add('playing');
                musicToggle.querySelector('.toggle-slider').classList.add('active');
                
                console.log('Attempting to play music');
                // Use a promise to handle playback restrictions
                try {
                    // Reset the audio to the beginning
                    musicPlayer.currentTime = 0;
                    
                    // Ensure it's set to loop
                    musicPlayer.loop = true;
                    
                    // Play the audio
                    const playPromise = musicPlayer.play();
                    
                    if (playPromise !== undefined) {
                        playPromise
                            .then(() => {
                                console.log('Music playback started successfully');
                            })
                            .catch(error => {
                                console.error('Playback prevented:', error);
                                // If playback is prevented, update the server state
                                alert('Browser prevented music playback. Try clicking the test button.');
                                fetch('/webhook?action=music_toggle')
                                    .then(response => response.json())
                                    .then(data => {
                                        console.log('Reverting music state:', data);
                                    });
                            });
                    }
                } catch (e) {
                    console.error('Exception during play:', e);
                    alert('Exception during play: ' + e.message);
                }
            } else {
                musicNote.classList.remove('playing');
                musicToggle.querySelector('.toggle-slider').classList.remove('active');
                console.log('Pausing music');
                musicPlayer.pause();
            }
        }
        
        // Update light state
        if (newState.hasOwnProperty('lights_on')) {
            state.lights_on = newState.lights_on;
            console.log('Lights on state updated to:', state.lights_on);
            
            if (state.lights_on) {
                lightBulb.classList.add('on');
                lightToggle.querySelector('.toggle-slider').classList.add('active');
            } else {
                lightBulb.classList.remove('on');
                lightToggle.querySelector('.toggle-slider').classList.remove('active');
            }
            
            // Update page brightness when light state changes
            updatePageBrightness(state.lights_on, state.brightness);
        }
        
        // Update volume
        if (newState.hasOwnProperty('volume')) {
            state.volume = newState.volume;
            volumeLevel.style.width = `${state.volume}%`;
            volumeValue.textContent = `${state.volume}%`;
            musicPlayer.volume = state.volume / 100;
            console.log('Volume updated to:', state.volume, 'Audio volume:', musicPlayer.volume);
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
                
                // Update page brightness when brightness changes
                updatePageBrightness(state.lights_on, state.brightness);
            }
        }
    }
    
    // Add audio event listeners for debugging
    musicPlayer.addEventListener('play', () => {
        console.log('Audio play event fired');
    });
    
    musicPlayer.addEventListener('playing', () => {
        console.log('Audio playing event fired');
    });
    
    musicPlayer.addEventListener('pause', () => {
        console.log('Audio pause event fired');
    });
    
    musicPlayer.addEventListener('ended', () => {
        console.log('Audio ended event fired');
        // If the audio ends and should be playing, restart it
        if (state.music_playing) {
            console.log('Restarting audio because it ended while it should be playing');
            musicPlayer.currentTime = 0;
            musicPlayer.play().catch(e => console.error('Error restarting audio:', e));
        }
    });
    
    musicPlayer.addEventListener('canplay', () => {
        console.log('Audio canplay event fired');
    });
    
    musicPlayer.addEventListener('canplaythrough', () => {
        console.log('Audio canplaythrough event fired');
    });
    
    // Add audio error handling
    musicPlayer.addEventListener('error', (e) => {
        console.error('Audio error:', e);
        console.error('Audio error code:', musicPlayer.error ? musicPlayer.error.code : 'unknown');
        console.error('Audio error message:', musicPlayer.error ? musicPlayer.error.message : 'unknown');
        alert('There was an error playing the audio. Please check the console for details.');
    });
}); 