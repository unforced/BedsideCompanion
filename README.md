# Bedside Companion

A simple web application that provides a beautiful interface for controlling music and lighting through webhooks. Perfect for bedside automation or smart home integration.

## Features

- Real-time updates using WebSockets
- Music playback control (start/stop)
- Light control (on/off)
- Volume adjustment (up/down)
- Brightness adjustment (up/down)
- Beautiful, responsive UI
- Simple webhook API for integration with other systems

## Installation

1. Clone this repository:
   ```
   git clone https://github.com/yourusername/BedsideCompanion.git
   cd BedsideCompanion
   ```

2. Create a virtual environment and activate it:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```

## Usage

1. Start the server:
   ```
   python app.py
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:5000
   ```

3. The web interface will display the current state of music and lighting.

## Webhook API

You can control the application by sending GET requests to the following endpoints:

- `/webhook?action=music_toggle` - Start/Stop Music
- `/webhook?action=lights_toggle` - Lights On/Off
- `/webhook?action=volume_up` - Volume Up (10%)
- `/webhook?action=volume_down` - Volume Down (10%)
- `/webhook?action=brightness_up` - Brightness Up (10%)
- `/webhook?action=brightness_down` - Brightness Down (10%)

Example:
```
curl http://localhost:5000/webhook?action=music_toggle
```

## Integration Ideas

- Connect with home automation systems like Home Assistant or Node-RED
- Use with voice assistants (Alexa, Google Assistant) through IFTTT
- Create physical buttons using ESP8266/ESP32 microcontrollers
- Schedule actions using cron jobs or task schedulers

## Customization

- Replace the audio file at `static/audio/relaxing-music.mp3` with your preferred music
- Modify the CSS in `static/css/style.css` to change the appearance
- Add additional webhook actions in `app.py`

## License

MIT 