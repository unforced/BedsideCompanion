from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'bedside-companion-secret')
socketio = SocketIO(app, cors_allowed_origins="*")

# Song information
songs = [
    {
        'id': 1,
        'title': 'i/o by Peter Gabriel',
        'file': 'io.mp3'
    },
    {
        'id': 2,
        'title': 'Hanuman Chalisa by Krishna Das',
        'file': 'hanuman.mp3'
    },
    {
        'id': 3,
        'title': 'Never Gonna Give You Up by Rick Astley',
        'file': 'rickroll.mp3'
    }
]

# State variables
state = {
    'music_playing': False,
    'lights_on': False,
    'volume': 50,  # 0-100
    'brightness': 50,  # 0-100
    'current_song': songs[0]  # Start with song 1
}

@app.route('/')
def index():
    return render_template('index.html', state=state, songs=songs)

@app.route('/webhook', methods=['GET'])
def webhook():
    action = request.args.get('action', '')
    
    if action == 'music_toggle':
        state['music_playing'] = not state['music_playing']
        socketio.emit('state_update', {'music_playing': state['music_playing']})
    
    elif action == 'lights_toggle':
        state['lights_on'] = not state['lights_on']
        socketio.emit('state_update', {'lights_on': state['lights_on']})
    
    elif action == 'volume_up':
        state['volume'] = min(100, state['volume'] + 10)
        socketio.emit('state_update', {'volume': state['volume']})
    
    elif action == 'volume_down':
        state['volume'] = max(0, state['volume'] - 10)
        socketio.emit('state_update', {'volume': state['volume']})
    
    elif action == 'brightness_up':
        state['brightness'] = min(100, state['brightness'] + 10)
        socketio.emit('state_update', {'brightness': state['brightness']})
    
    elif action == 'brightness_down':
        state['brightness'] = max(0, state['brightness'] - 10)
        socketio.emit('state_update', {'brightness': state['brightness']})
    
    elif action == 'play_song_one':
        state['current_song'] = songs[0]
        socketio.emit('state_update', {'current_song': state['current_song']})
    
    elif action == 'play_song_two':
        state['current_song'] = songs[1]
        socketio.emit('state_update', {'current_song': state['current_song']})
    
    elif action == 'play_song_three':
        state['current_song'] = songs[2]
        socketio.emit('state_update', {'current_song': state['current_song']})
    
    return jsonify({'status': 'success', 'action': action, 'state': state})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    # Use 0.0.0.0 to bind to all interfaces
    host = '0.0.0.0'
    # In production, debug should be set to False
    debug = os.environ.get('DEBUG', 'False').lower() == 'true'
    socketio.run(app, host=host, port=port, debug=debug) 