from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'bedside-companion-secret')
socketio = SocketIO(app, cors_allowed_origins="*")

# State variables
state = {
    'music_playing': False,
    'lights_on': False,
    'volume': 50,  # 0-100
    'brightness': 50  # 0-100
}

@app.route('/')
def index():
    return render_template('index.html', state=state)

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
    
    return jsonify({'status': 'success', 'action': action, 'state': state})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    # Use 0.0.0.0 to bind to all interfaces
    host = '0.0.0.0'
    # In production, debug should be set to False
    debug = os.environ.get('DEBUG', 'False').lower() == 'true'
    socketio.run(app, host=host, port=port, debug=debug, allow_unsafe_werkzeug=True) 