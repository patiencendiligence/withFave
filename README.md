# withFave 🎭

A cross-platform (macOS, Windows) system pet app built with Electron that monitors CPU usage and displays it as character emotions.

## Features

- **Real-time CPU Monitoring**: Measures CPU usage every 500ms with moving average smoothing
- **Emotion System**: Converts CPU usage to 4 emotional states (calm, normal, excited, stressed)
- **Multiple Characters**: Choose from different character sets (Default, Cute, Cat, Robot)
- **Tray Application**: Runs in system tray with minimal footprint
- **Always on Top**: Floating window stays visible while you work
- **Dark Mode UI**: Modern, clean interface with smooth animations

## Emotion States

| CPU Usage | Emotion | Default | Cute | Cat | Robot |
|-----------|---------|---------|------|-----|-------|
| 0-25% | Calm | 😌 | 🐣 | 😺 | 🤖 |
| 25-55% | Normal | 🙂 | 🐤 | 😸 | ⚡ |
| 55-80% | Excited | 😄 | 🦄 | 😻 | 🚀 |
| 80%+ | Stressed | 😤 | 🔥 | 🙀 | 💥 |

## Installation

```bash
# Clone or download the project
cd withFave

# Install dependencies
npm install

# Run the app
npm start
```

## Development

```bash
# Run with logging enabled
npm run dev
```

## Building

```bash
# Build for macOS
npm run package:mac

# Build for Windows
npm run package:win

# Build for both platforms
npm run package
```

## Project Structure

```
withFave/
├── main.js              # Electron main process (tray + window management)
├── preload.js           # Context bridge for IPC
├── package.json
├── system/
│   └── cpu.js           # CPU monitoring logic with systeminformation
├── renderer/
│   ├── index.html       # Main floating window UI
│   ├── app.js           # Main app rendering logic
│   ├── settings.html    # Settings window UI
│   ├── settings.js      # Settings logic
│   └── styles.css       # Shared styles (dark mode)
└── assets/
    └── (icons)          # App icons for tray and packaging
```

## Technical Details

### CPU Measurement
- Uses `systeminformation` library for cross-platform CPU monitoring
- Applies moving average smoothing: `avg = prev * 0.7 + current * 0.3`
- Updates every 500ms

### Architecture
- **Main Process**: Handles tray, windows, and CPU monitoring
- **Renderer Process**: Handles UI updates and animations
- **IPC Bridge**: Secure communication via contextBridge

### Customization
Add new characters by extending the `CHARACTERS` object in `app.js` and `settings.js`:

```javascript
const CHARACTERS = {
  myCharacter: {
    name: 'My Character',
    emotions: {
      calm: '🌙',
      normal: '☀️',
      excited: '🌟',
      stressed: '⚡'
    }
  }
};
```

## Requirements

- Node.js 18+
- npm or yarn

## License

MIT
