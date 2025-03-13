# Guide 00: Project Setup

This guide outlines the steps to set up the Bedside Companion project from scratch.

## Prerequisites

- Python 3.7 or higher
- pip (Python package manager)
- Basic knowledge of HTML, CSS, and JavaScript
- Understanding of Flask and WebSockets

## Step 1: Create Project Structure

Create the following directory structure:

```
BedsideCompanion/
├── static/
│   ├── css/
│   ├── js/
│   └── audio/
└── templates/
```

```bash
mkdir -p BedsideCompanion/static/{css,js,audio} BedsideCompanion/templates
cd BedsideCompanion
```

## Step 2: Set Up Virtual Environment

Create and activate a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

## Step 3: Install Dependencies

Create a `requirements.txt` file with the following content:

```
Flask==2.3.3
Flask-SocketIO==5.3.4
python-socketio==5.8.0
python-engineio==4.5.1
Werkzeug==2.3.7
eventlet==0.33.3
```

Install the dependencies:

```bash
pip install -r requirements.txt
```

## Step 4: Create Main Application File

Create `app.py` with the following content:

```python
from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'bedside-companion-secret'
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
    socketio.run(app, host='0.0.0.0', port=port, debug=True)
```

## Step 5: Create Basic HTML Template

Create `templates/index.html` with a basic structure. This will be expanded in later guides.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bedside Companion</title>
    <link rel="stylesheet" href="{{ url_for('static', filename='css/style.css') }}">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.0.1/socket.io.js"></script>
</head>
<body>
    <h1>Bedside Companion</h1>
    <div id="app">
        <!-- Content will be added in later guides -->
    </div>
    <script src="{{ url_for('static', filename='js/main.js') }}"></script>
</body>
</html>
```

## Step 6: Test Basic Setup

Run the application to ensure everything is set up correctly:

```bash
python app.py
```

Visit `http://localhost:5000` in your browser. You should see a page with the title "Bedside Companion".

## Next Steps

Proceed to Guide 01: Core Functionality to implement the webhook endpoints and state management system. 