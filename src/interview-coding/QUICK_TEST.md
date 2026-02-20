# Quick Testing Reference

## 🚀 Server Status
**Dev Server**: http://localhost:3001
**Status**: ✅ Running

## 🎯 Quick Test URLs

### Main Test Page
```
http://localhost:3001/interview/test-session-123
```

### Alternative Test Sessions
```
http://localhost:3001/interview/demo-session
http://localhost:3001/interview/voice-test
```

## ✅ Quick Feature Tests

### 1. WebSocket Mock Mode (30 seconds)
1. Open: http://localhost:3001/interview/test-session-123
2. Type "Hello" in chat → Press Enter
3. Wait 1-2 seconds → See mock agent response ✓
4. Click "Run Code" button
5. Wait 1.5 seconds → See execution result ✓

### 2. Voice Input (1 minute)
1. Click microphone button (top right of chat)
2. Allow microphone access
3. Say: "I need help with this problem"
4. Click microphone again to stop
5. Text appears in input field ✓
6. Press Enter to send ✓

### 3. Voice Settings (30 seconds)
1. Click settings icon (gear) next to microphone
2. Click "Test Voice" button
3. Hear: "This is a test..." ✓
4. Adjust sliders (rate, pitch, volume)
5. Test again to hear changes ✓

### 4. Complete Flow (2 minutes)
1. Open interview page
2. Read the problem (Two Sum)
3. Use voice: "Can you give me a hint?"
4. See hint appear in chat ✓
5. Write some code in editor
6. Click "Run Code"
7. See execution result ✓
8. Use voice again: "That makes sense, thank you"
9. See your message and agent response ✓

## 🔍 What to Check

### Console Logs (F12 → Console)
```
✓ Interview session started: test-session-123
✓ Connection state: { status: 'disconnected', ... }
✓ Session data: { id: 'mock-session-123', ... }
✓ Mock mode: Simulating session join
✓ Speech recognition started (when using voice)
```

### Visual Indicators
- 🔴 Red pulsing microphone = Recording
- 💬 Messages appear in chat
- ⚡ "Recording..." text visible
- 🎤 Interim transcript shows while speaking
- ✅ Code execution results display

## 🐛 Quick Troubleshooting

### Voice Not Working?
```bash
# Check browser support
Chrome/Edge: ✅ Full support
Safari: ✅ Full support  
Firefox: ❌ No STT (TTS works)
```

### No Mock Responses?
- Check console for errors
- Refresh the page
- Verify you're on the interview page

### Microphone Permission Denied?
- Chrome: chrome://settings/content/microphone
- Allow for localhost:3001
- Refresh page

## 📊 Test Results Template

Copy this to track your testing:

```
Date: ___________
Browser: ___________

WebSocket Mock:
[ ] Messages send/receive
[ ] Code execution
[ ] Hint requests
[ ] Connection state updates

Voice Input:
[ ] Microphone access granted
[ ] Recording starts/stops
[ ] Transcript appears
[ ] Text populates input

Voice Output:
[ ] Settings panel opens
[ ] Test voice plays
[ ] Volume control works
[ ] Rate/pitch adjustments work

Integration:
[ ] Voice → Chat flow works
[ ] All UI updates smoothly
[ ] No console errors
[ ] Build successful

Notes:
_________________________________
_________________________________
```

## 🎬 Demo Script

Use this to demo the features:

```
1. "Hi everyone, let me show you the new voice features"
2. Navigate to interview page
3. "First, let's test the chat with mock data"
4. Type and send a message
5. "Now let's try voice input"
6. Click microphone, say something
7. "See how it transcribes in real-time"
8. Stop recording, send message
9. "And here's the voice settings"
10. Open settings, adjust sliders
11. "Let's test the voice output"
12. Click test voice button
13. "Finally, let's run some code"
14. Click Run Code button
15. "All features working together!"
```

## 📝 Feature Checklist

### Implemented ✅
- [x] WebSocket client with reconnection
- [x] Event-based message handling
- [x] Mock data system for testing
- [x] Speech-to-text (Web Speech API)
- [x] Text-to-speech synthesis
- [x] Voice settings panel
- [x] Real-time transcript display
- [x] Chat integration
- [x] Error handling
- [x] Browser compatibility detection

### Ready for Backend Integration 🔄
- [ ] Real WebSocket connections
- [ ] AWS Bedrock agent responses
- [ ] Code execution via sandbox
- [ ] Polly TTS integration
- [ ] Session persistence

## 🔗 Related Files

**Hooks:**
- `src/hooks/useInterviewSession.ts` - WebSocket & session management
- `src/hooks/useVoice.ts` - Voice input/output

**Components:**
- `src/components/VoiceControls.tsx` - Voice UI
- `src/components/ChatPanel.tsx` - Chat with voice integration

**Infrastructure:**
- `src/lib/websocket.ts` - WebSocket client
- `src/lib/types.ts` - TypeScript definitions

## 💡 Tips

1. **Use Chrome** for best voice recognition
2. **Speak clearly** for better transcription
3. **Check console** for detailed logs
4. **Test in quiet environment** for voice features
5. **Use mock mode** until backend is ready

---

**Last Updated**: Now
**Status**: ✅ All features ready for testing
**Next**: Implement backend (tasks 3-6)
