# Voice Technology Explanation

## 🎤 Speech-to-Text (STT): Web Speech API

### What is it?

The **Web Speech API** is a browser-native JavaScript API that provides speech recognition capabilities. It's part of the browser itself - no external libraries or server calls needed!

### Key Components

#### 1. SpeechRecognition Interface

```javascript
// Get the API (with browser prefix fallback)
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

// Create a new instance
const recognition = new SpeechRecognition();
```

#### 2. Configuration Options

```javascript
recognition.continuous = true;        // Keep listening until stopped
recognition.interimResults = true;    // Get real-time partial results
recognition.lang = 'en-US';          // Language for recognition
recognition.maxAlternatives = 1;      // Number of alternative transcriptions
```

**What each setting does:**

- **continuous**: 
  - `true` = Keeps listening until you stop it manually
  - `false` = Stops after detecting silence
  
- **interimResults**: 
  - `true` = Get partial results as you speak (real-time feedback)
  - `false` = Only get final results after pauses
  
- **lang**: 
  - Specifies the language/dialect
  - Examples: 'en-US', 'en-GB', 'es-ES', 'fr-FR'
  
- **maxAlternatives**: 
  - How many alternative interpretations to provide
  - We use 1 for simplicity (just the best guess)

#### 3. Event Handlers

```javascript
recognition.onstart = () => {
  // Called when recording starts
  console.log('Listening...');
};

recognition.onresult = (event) => {
  // Called when speech is recognized
  // This is where we get the transcribed text!
  for (let i = event.resultIndex; i < event.results.length; i++) {
    const result = event.results[i];
    const transcript = result[0].transcript;
    
    if (result.isFinal) {
      // This is confirmed text that won't change
      console.log('Final:', transcript);
    } else {
      // This is temporary text that might change
      console.log('Interim:', transcript);
    }
  }
};

recognition.onerror = (event) => {
  // Called when an error occurs
  console.error('Error:', event.error);
};

recognition.onend = () => {
  // Called when recognition stops
  console.log('Stopped listening');
};
```

#### 4. Control Methods

```javascript
recognition.start();   // Start listening
recognition.stop();    // Stop listening
recognition.abort();   // Abort and discard results
```

### How Our Implementation Works

#### Step 1: Check Browser Support

```javascript
const hasSpeechRecognition =
  typeof window !== 'undefined' &&
  ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

if (!hasSpeechRecognition) {
  setError('Speech recognition is not supported in this browser');
}
```

#### Step 2: Initialize Recognition

```javascript
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

// Configure it
recognition.continuous = true;      // Keep listening
recognition.interimResults = true;  // Show real-time results
recognition.lang = 'en-US';        // English (US)
```

#### Step 3: Handle Results

```javascript
recognition.onresult = (event) => {
  let interimTranscript = '';
  let finalTranscript = '';

  // Process all results from this event
  for (let i = event.resultIndex; i < event.results.length; i++) {
    const result = event.results[i];
    const transcriptPart = result[0].transcript;

    if (result.isFinal) {
      // Confirmed text - add to final transcript
      finalTranscript += transcriptPart + ' ';
    } else {
      // Temporary text - show but don't save yet
      interimTranscript += transcriptPart;
    }
  }

  // Update the display
  if (finalTranscript) {
    finalTranscriptRef.current += finalTranscript;
    setTranscript(finalTranscriptRef.current + interimTranscript);
  } else if (interimTranscript) {
    setTranscript(finalTranscriptRef.current + interimTranscript);
  }
};
```

#### Step 4: Start/Stop Recording

```javascript
// Start recording
const startRecording = () => {
  setTranscript('');
  finalTranscriptRef.current = '';
  recognition.start();
};

// Stop recording
const stopRecording = () => {
  recognition.stop();
};
```

### Real-World Example

When you say: **"Hello, this is a test"**

```
Time: 0.0s
Event: onstart
Action: Start listening
Display: ""

Time: 0.3s
Event: onresult (interim)
Result: "hello"
Display: "hello"

Time: 0.6s
Event: onresult (interim)
Result: "hello this"
Display: "hello this"

Time: 1.0s
Event: onresult (final)
Result: "hello"
Final stored: "hello "
Display: "hello "

Time: 1.2s
Event: onresult (interim)
Result: "this"
Display: "hello this"

Time: 1.5s
Event: onresult (final)
Result: "this"
Final stored: "hello this "
Display: "hello this "

Time: 1.8s
Event: onresult (interim)
Result: "is a test"
Display: "hello this is a test"

Time: 2.5s
Event: onresult (final)
Result: "is a test"
Final stored: "hello this is a test "
Display: "hello this is a test "

Time: 3.0s
User clicks stop button
Event: onend
Action: Stop listening
Final result: "hello this is a test "
```

## 🔊 Text-to-Speech (TTS): Web Speech Synthesis API

### What is it?

The **SpeechSynthesis API** is another browser-native API that converts text to speech. It's the companion to SpeechRecognition.

### Key Components

#### 1. SpeechSynthesis Interface

```javascript
// Get the synthesis API
const synth = window.speechSynthesis;

// Create an utterance (thing to say)
const utterance = new SpeechSynthesisUtterance('Hello world');

// Speak it
synth.speak(utterance);
```

#### 2. Customization Options

```javascript
const utterance = new SpeechSynthesisUtterance(text);

utterance.rate = 1.0;      // Speed (0.1 to 10, default 1)
utterance.pitch = 1.0;     // Pitch (0 to 2, default 1)
utterance.volume = 0.8;    // Volume (0 to 1, default 1)
utterance.voice = voice;   // Specific voice to use
utterance.lang = 'en-US';  // Language
```

#### 3. Event Handlers

```javascript
utterance.onstart = () => {
  console.log('Started speaking');
};

utterance.onend = () => {
  console.log('Finished speaking');
};

utterance.onerror = (event) => {
  console.error('Speech error:', event.error);
};
```

#### 4. Our Implementation

```javascript
const playText = async (text: string): Promise<void> => {
  const synth = window.speechSynthesis;
  
  // Cancel any ongoing speech
  synth.cancel();

  return new Promise((resolve, reject) => {
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Apply user settings
    utterance.rate = settings.rate;      // e.g., 1.5 = 50% faster
    utterance.pitch = settings.pitch;    // e.g., 0.8 = lower pitch
    utterance.volume = settings.volume;  // e.g., 0.5 = half volume

    utterance.onend = () => resolve();
    utterance.onerror = (event) => reject(event);

    synth.speak(utterance);
  });
};
```

## 🌐 Browser Support

### Speech Recognition (STT)

| Browser | Version | Support | Notes |
|---------|---------|---------|-------|
| Chrome | 25+ | ✅ Full | Best support, uses Google's servers |
| Edge | 79+ | ✅ Full | Chromium-based, same as Chrome |
| Safari | 14.1+ | ✅ Full | iOS 14.5+, on-device processing |
| Firefox | All | ❌ None | No support yet |
| Opera | 27+ | ✅ Full | Chromium-based |

### Speech Synthesis (TTS)

| Browser | Version | Support | Notes |
|---------|---------|---------|-------|
| Chrome | 33+ | ✅ Full | Multiple voices available |
| Edge | 14+ | ✅ Full | Windows voices |
| Safari | 7+ | ✅ Full | macOS/iOS voices |
| Firefox | 49+ | ✅ Full | Limited voices |
| Opera | 21+ | ✅ Full | Multiple voices |

## 🔒 Privacy & Security

### Where Does Processing Happen?

**Chrome/Edge:**
- Audio is sent to Google's servers for processing
- Requires internet connection
- More accurate but less private

**Safari:**
- Processing happens on-device (iOS/macOS)
- Works offline
- More private but slightly less accurate

### Permissions Required

```javascript
// Browser automatically requests microphone permission
// when recognition.start() is called

// User sees a prompt like:
// "localhost:3001 wants to use your microphone"
// [Block] [Allow]
```

### Security Restrictions

- Only works on HTTPS (or localhost for development)
- User must explicitly grant microphone permission
- Can be revoked at any time in browser settings

## 🆚 Alternatives (Not Used)

### Why NOT use these?

#### 1. Google Cloud Speech-to-Text
```javascript
// ❌ Requires backend server
// ❌ Costs money ($0.006 per 15 seconds)
// ❌ More complex setup
// ✅ More accurate
// ✅ More languages
```

#### 2. AWS Transcribe
```javascript
// ❌ Requires backend server
// ❌ Costs money ($0.0004 per second)
// ❌ More complex setup
// ✅ More accurate
// ✅ Better for long recordings
```

#### 3. OpenAI Whisper
```javascript
// ❌ Requires backend server
// ❌ Costs money ($0.006 per minute)
// ❌ More complex setup
// ✅ Very accurate
// ✅ Multilingual
```

#### 4. Browser Libraries (e.g., annyang.js)
```javascript
// ❌ Just a wrapper around Web Speech API
// ❌ Extra dependency
// ✅ Simpler API
// ✅ Better browser compatibility handling
```

## 💡 Why Web Speech API is Perfect for This Project

1. **No Backend Required** ✅
   - Works during frontend-only development
   - No server costs during testing

2. **Real-Time Performance** ✅
   - Instant feedback as you speak
   - No network latency

3. **Zero Cost** ✅
   - Completely free
   - No usage limits

4. **Good Enough Accuracy** ✅
   - Works well for interview conversations
   - Handles technical terms reasonably well

5. **Easy Integration** ✅
   - Native browser API
   - No external dependencies
   - Simple event-based model

## 🔮 Future Enhancements

When the backend is ready, we could optionally add:

### 1. AWS Polly for TTS (Already Planned)
```javascript
// Instead of browser TTS, use AWS Polly
const response = await fetch('/api/voice/tts', {
  method: 'POST',
  body: JSON.stringify({ text: 'Hello world' })
});
const audioBlob = await response.blob();
const audio = new Audio(URL.createObjectURL(audioBlob));
audio.play();
```

**Benefits:**
- More natural-sounding voices
- Consistent across all browsers
- SSML support for emphasis, pauses, etc.

### 2. Fallback to AWS Transcribe
```javascript
// If Web Speech API not available, use AWS
if (!hasSpeechRecognition) {
  // Record audio in browser
  const mediaRecorder = new MediaRecorder(stream);
  
  // Send to backend for transcription
  const response = await fetch('/api/voice/transcribe', {
    method: 'POST',
    body: audioBlob
  });
  
  const { transcript } = await response.json();
}
```

**Benefits:**
- Works in Firefox
- More accurate for technical terms
- Better noise handling

## 📚 Resources

- [MDN: Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [MDN: SpeechRecognition](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition)
- [MDN: SpeechSynthesis](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis)
- [Can I Use: Speech Recognition](https://caniuse.com/speech-recognition)
- [Can I Use: Speech Synthesis](https://caniuse.com/speech-synthesis)

## 🎯 Summary

**For Speech-to-Text (STT):**
- Using: **Web Speech API** (browser-native)
- Cost: **Free**
- Accuracy: **Good** (85-95% for clear speech)
- Latency: **Real-time** (instant)
- Privacy: **Depends on browser** (Chrome uses Google servers, Safari is on-device)

**For Text-to-Speech (TTS):**
- Using: **Web Speech Synthesis API** (browser-native)
- Future: **AWS Polly** (when backend is ready)
- Cost: **Free** (browser) / **$4 per 1M characters** (Polly)
- Quality: **Good** (browser) / **Excellent** (Polly)

The Web Speech API is the perfect choice for this project because it provides good-enough quality with zero cost and complexity, while we can always upgrade to cloud services later if needed!
