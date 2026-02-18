# 39.2 Speech Synthesis

Speech Synthesis provides text-to-speech capabilities.

---

## 39.2.1 Basic Usage

```javascript
const utterance = new SpeechSynthesisUtterance('Hello, world!');
speechSynthesis.speak(utterance);
```

---

## 39.2.2 Configuration

```javascript
const utterance = new SpeechSynthesisUtterance('Hello');

utterance.rate = 1.0;    // 0.1 to 10
utterance.pitch = 1.0;   // 0 to 2
utterance.volume = 1.0;  // 0 to 1
utterance.lang = 'en-US';
```

---

## 39.2.3 Voices

### Get Available Voices

```javascript
// May need to wait for voices to load
speechSynthesis.onvoiceschanged = () => {
  const voices = speechSynthesis.getVoices();
  
  voices.forEach(voice => {
    console.log(voice.name, voice.lang, voice.default);
  });
};
```

### Set Voice

```javascript
const voices = speechSynthesis.getVoices();
const englishVoice = voices.find(v => v.lang.startsWith('en'));

utterance.voice = englishVoice;
```

---

## 39.2.4 Control

```javascript
// Pause/Resume
speechSynthesis.pause();
speechSynthesis.resume();

// Cancel all queued
speechSynthesis.cancel();

// Check state
speechSynthesis.speaking;  // Currently speaking
speechSynthesis.pending;   // Queued utterances
speechSynthesis.paused;    // Is paused
```

---

## 39.2.5 Events

```javascript
utterance.onstart = () => console.log('Started');
utterance.onend = () => console.log('Ended');
utterance.onpause = () => console.log('Paused');
utterance.onresume = () => console.log('Resumed');
utterance.onerror = (e) => console.error(e.error);

utterance.onboundary = (e) => {
  console.log('Boundary:', e.name, e.charIndex);
};
```

---

## 39.2.6 Summary

| Property | Range | Description |
|----------|-------|-------------|
| `rate` | 0.1-10 | Speech speed |
| `pitch` | 0-2 | Voice pitch |
| `volume` | 0-1 | Volume level |
| `voice` | Voice | Voice to use |
| `lang` | string | Language code |

---

**End of Chapter 39.2: Speech Synthesis**

This completes Group 39 — Web Speech API. Next: **Group 40 — Web Components**.
