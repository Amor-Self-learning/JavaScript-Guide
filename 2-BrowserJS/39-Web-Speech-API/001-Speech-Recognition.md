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
