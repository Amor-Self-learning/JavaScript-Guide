# 39.1 Speech Recognition

The Web Speech API provides speech-to-text capabilities through the SpeechRecognition interface.

---

## 39.1.1 Create Recognition

```javascript
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
  console.error('Speech recognition not supported');
}

const recognition = new SpeechRecognition();
```

---

## 39.1.2 Configuration

```javascript
recognition.continuous = true;       // Keep listening
recognition.interimResults = true;   // Get results while speaking
recognition.lang = 'en-US';          // Language
recognition.maxAlternatives = 3;     // Number of alternatives
```

---

## 39.1.3 Events

### Handle Results

```javascript
recognition.onresult = (event) => {
  for (let i = event.resultIndex; i < event.results.length; i++) {
    const result = event.results[i];
    const transcript = result[0].transcript;
    const confidence = result[0].confidence;
    
    if (result.isFinal) {
      console.log('Final:', transcript, confidence);
    } else {
      console.log('Interim:', transcript);
    }
  }
};
```

### Other Events

```javascript
recognition.onstart = () => console.log('Started');
recognition.onend = () => console.log('Ended');
recognition.onerror = (e) => console.error(e.error);
recognition.onspeechstart = () => console.log('Speech detected');
recognition.onspeechend = () => console.log('Speech ended');
```

---

## 39.1.4 Control

```javascript
// Start
recognition.start();

// Stop (returns final result)
recognition.stop();

// Abort (no result)
recognition.abort();
```

---

## 39.1.5 Summary

| Property | Description |
|----------|-------------|
| `continuous` | Keep listening |
| `interimResults` | Interim results |
| `lang` | Language code |
| `maxAlternatives` | Number of alternatives |

---

**End of Chapter 39.1: Speech Recognition**

Next: **39.2 Speech Synthesis**.
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
