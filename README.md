# withFave 💜

> A desktop companion app for ARMYs who study, work, and create with Bangtan by their side.

I made this app so our 탄이들 (Tannies) can keep you company while monitoring your CPU usage! Whether you're studying for exams, working on projects, or just being productive — let BTS cheer you on. 

**For ARMYs, by an ARMY. Use it freely!** 보라해 💜

---

## 📥 Download

| Platform | Download |
|----------|----------|
| **macOS** (Apple Silicon) | preparing |
| **Windows** | [withFave Setup 1.0.0.exe](https://github.com/patiencendiligence/withFave/releases/download/v1.0.0/withFave.Setup.1.0.0.exe) |

### Installation
**macOS**: Download DMG → Open → Drag to Applications  
**Windows**: Download EXE → Run installer → Follow instructions

---

## Features

- **Real-time CPU Monitoring**: Your bias reacts to how hard your computer is working
- **Emotion System**: 4 emotional states (calm, normal, excited, stressed) based on CPU load
- **BTS Characters**: All 7 members available as your desktop companion
- **Custom Characters**: Add your own fave photos to create personalized characters!
- **Tray Application**: Runs quietly in system tray
- **Always on Top**: Floating window stays visible while you work
- **Liquid Glass UI**: Beautiful, modern interface

---

## Emotion States

| CPU Usage | Emotion | JIN | SUGA | RM | J-HOPE | JIMIN | V | JUNGKOOK |
|-----------|---------|-----|------|-----|--------|-------|---|----------|
| 0-25% | Calm 😌 | 💖 | 💖 | 💖 | 💖 | 💖 | 💖 | 💖 |
| 25-55% | Normal 🙂 | 💜 | 💜 | 💜 | 💜 | 💜 | 💜 | 💜 |
| 55-80% | Excited 😄 | 🔥 | 🔥 | 🔥 | 🔥 | 🔥 | 🔥 | 🔥 |
| 80%+ | Stressed 😤 | 💪 | 💪 | 💪 | 💪 | 💪 | 💪 | 💪 |

Each member has 4 different images for each emotional state!

---

## Add Your Own Fave! 🌟

Want to use your own bias photos? You can!

1. Open **Settings** (right-click tray icon)
2. Click **+ Add** button
3. Enter a name for your character
4. Upload 4 images (200x200px recommended):
   - Calm state
   - Normal state
   - Excited state
   - Stressed state
5. Click **Register**

Now your custom fave will appear alongside the default characters!

---


### Project Structure

```
withFave/
├── main.js              # Electron main process
├── preload.js           # IPC bridge
├── system/
│   └── cpu.js           # CPU monitoring
├── renderer/
│   ├── index.html       # Main floating window
│   ├── app.js           # App logic
│   ├── settings.html    # Settings window
│   ├── settings.js      # Settings logic
│   ├── info.html        # Info/About page
│   └── styles.css       # Liquid glass styles
└── assets/
    └── images/          # Character images
```

---

## Support

If you enjoy this app, consider supporting me on [Ko-fi](https://ko-fi.com/H2H61W7DT8)! ☕

---

## ⚠️ Disclaimer

**This is a non-commercial, fan-made project.**

- This app is created purely for fun and for the ARMY community.
- **No profit is being made** from this project whatsoever.
- All BTS-related images and content are the property of **BIGHIT MUSIC / HYBE**.
- This project is not affiliated with, endorsed by, or connected to BTS or HYBE in any way.

If there are any copyright concerns or issues, please contact me at:  
📧 **patiencendiligence@gmail.com**

I will respond promptly and take appropriate action.

---

## License

MIT

---

Made with 💜 by an ARMY who develops.
