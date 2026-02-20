# Testing Guide - Interactive Frontend Features

This guide explains how to test the WebSocket client infrastructure and voice interaction capabilities that were just implemented.

## Prerequisites

- Development server running: `npm run dev` (currently on http://localhost:3001)
- Modern browser (Chrome, Edge, or Safari recommended for best Web Speech API support)
- Microphone access for voice testing

## Feature 1: WebSocket Client Infrastructure (Mock Mode)

### Testing the Interview Session Hook

The `useInterviewSession` hook includes a mock data system for testing without a backend.

#### Test Steps:

1. **Navigate to the Interview Page**
   - Open: http://localhost:3001/interview/test-session-123
   - The page should load with the interview interface

2. **Verify Mock Session Initialization**
   - Check the browser console (F12 → Console tab)
   - You should see: "Mock mode: Simulating session join"
   - The chat panel should show a greeting message from the agent

3. **Test Sending Messages**
   - Type a message in the chat input field
   - Press Enter or click the Send button
   - Your message should appear immediately
   - After 1-2 seconds, a mock agent response should appear
   - Check console for: "Mock mode: Simulating code submission"

4. **Test Code Submission**
   - Write some code in the Monaco editor
   - Click "Run Code" button (if integrated)
   - After ~1.5 seconds, you should see a mock execution result
   - Result should show "Code executed successfully!"

5. **Test Hint Request**
   - Click "Request Hint" button (if integrated)
   - After ~800ms, a mock hint should appear in the chat
   - The hint counter should increment

### Testing Connection State Management

The WebSocket client manages connection states even in mock mode:

1. **Check Initial State**
   - Open React DevTools
   - Find the component using `useInterviewSession`
   - Verify `connectionState.status` is "disconnected" in mock mode

2. **Monitor State Changes**
   - Watch the console for connection-related logs
   - In real mode (when backend is ready), you'll see:
     - "WebSocket connected"
     - "Attempting to reconnect..." (if connection drops)

## Feature 2: Voice Interaction Capabilities

### Testing Speech-to-Text (STT)

1. **Check Browser Support**
   - Open: http://localhost:3001/interview/test-session-123
   - Look for the microphone button in the chat panel header
   - If you see "Voice features not supported", try Chrome or Edge

2. **Grant Microphone Permissions**
   - Click the microphone button
   - Browser will prompt for microphone access
   - Click "Allow"

3. **Test Voice Recording**
   - Click the microphone button (should turn red and pulse)
   - You should see "Recording..." indicator
   - Speak clearly: "Hello, this is a test message"
   - Watch the interim transcript appear in real-time
   - Click the microphone button again to stop
   - The transcript should populate the message input field

4. **Test Automatic Message Population**
   - Start recording
   - Say: "I think I should use a hash map for this problem"
   - Stop recording
   - The text should appear in the chat input
   - Press Enter to send it

5. **Test Error Handling**
   - Try recording without speaking (should show "No speech detected")
   - Deny microphone access (should show "Microphone access denied")
   - Check console for detailed error messages

### Testing Text-to-Speech (TTS)

1. **Access Voice Settings**
   - Click the settings icon (gear) next to the microphone button
   - A settings panel should slide out

2. **Test Voice Output Toggle**
   - Click the speaker icon to toggle voice output on/off
   - Icon should change between Volume2 and VolumeX

3. **Test Voice Synthesis**
   - In the settings panel, click "Test Voice"
   - You should hear: "This is a test of the voice synthesis system"
   - Adjust volume slider and test again

4. **Customize Voice Settings**
   - **Speech Rate**: Adjust slider (0.5 = slow, 2.0 = fast)
   - **Pitch**: Adjust slider (0.5 = low, 2.0 = high)
   - **Volume**: Adjust slider (0 = mute, 1.0 = max)
   - Click "Test Voice" after each adjustment to hear changes

5. **Test Auto-Play (Future Integration)**
   - Toggle "Auto-play responses" to On
   - When backend is connected, agent messages will automatically play
   - Currently this is prepared but needs backend integration

### Testing Voice + Chat Integration

1. **Complete Voice-to-Chat Flow**
   - Click microphone button
   - Say: "Can you give me a hint?"
   - Stop recording
   - Verify text appears in input field
   - Press Enter to send
   - Mock agent should respond with a hint

2. **Test Multiple Voice Inputs**
   - Record several messages in succession
   - Each should populate the input field
   - Send each one and verify mock responses

## Testing WebSocket Events (When Backend is Ready)

Once the backend is implemented, test these additional scenarios:

### Connection Management

1. **Test Initial Connection**
   ```javascript
   // In browser console:
   // The hook should automatically connect when sessionId is provided
   ```

2. **Test Reconnection**
   - Disconnect network
   - Wait for "reconnecting" status
   - Reconnect network
   - Should auto-reconnect within 3-5 seconds

3. **Test Heartbeat**
   - Keep connection open for 30+ seconds
   - Check Network tab for periodic heartbeat messages

### Event Handling

1. **Session Joined Event**
   - Navigate to interview page
   - Verify session data loads
   - Check console: "Successfully joined session: [id]"

2. **Message Received Event**
   - Send a message
   - Backend should respond
   - Message should appear in chat

3. **Code Executed Event**
   - Submit code
   - Wait for execution result
   - Verify test results display

4. **Hint Provided Event**
   - Request a hint
   - Hint should appear as a special message type
   - Hint counter should increment

5. **Error Event**
   - Trigger an error (invalid code, etc.)
   - Error message should display in chat
   - Check console for error details

## Browser Compatibility Testing

### Speech Recognition Support

| Browser | STT Support | TTS Support | Notes |
|---------|-------------|-------------|-------|
| Chrome 25+ | ✅ Yes | ✅ Yes | Best support |
| Edge 79+ | ✅ Yes | ✅ Yes | Chromium-based |
| Safari 14.1+ | ✅ Yes | ✅ Yes | iOS 14.5+ |
| Firefox | ❌ No | ✅ Yes | No STT support |

### Testing in Different Browsers

1. **Chrome/Edge** (Recommended)
   - Full feature support
   - Best voice recognition accuracy

2. **Safari**
   - Test on macOS and iOS
   - May require additional permissions

3. **Firefox**
   - Voice controls should show "not supported" message
   - TTS should still work
   - Chat functionality works normally

## Debugging Tips

### Console Logs to Watch For

**WebSocket Client:**
```
WebSocket connected
Speech recognition started
Mock mode: Simulating session join
Mock mode: Simulating code submission
```

**Voice Recognition:**
```
Speech recognition started
Speech recognition ended
Speech recognition error: [error type]
```

**Connection Issues:**
```
Attempting to reconnect in Xms (attempt Y/Z)
Max reconnection attempts reached
```

### Common Issues and Solutions

1. **"Voice features not supported"**
   - Solution: Use Chrome, Edge, or Safari
   - Check: https://caniuse.com/speech-recognition

2. **Microphone not working**
   - Check browser permissions (chrome://settings/content/microphone)
   - Verify microphone is not used by another app
   - Try refreshing the page

3. **No mock responses**
   - Check console for errors
   - Verify `useMockData={true}` is set in the hook
   - Check that messages array is updating

4. **WebSocket connection fails**
   - Normal in mock mode (backend not running)
   - Check `NEXT_PUBLIC_WS_URL` environment variable
   - Verify backend is running when testing real connections

## Testing Checklist

### WebSocket Infrastructure ✓
- [ ] Mock session initializes correctly
- [ ] Messages send and receive (mock)
- [ ] Code submission works (mock)
- [ ] Hint requests work (mock)
- [ ] Connection state updates properly
- [ ] Event handlers fire correctly

### Voice Capabilities ✓
- [ ] Browser support detection works
- [ ] Microphone permission request appears
- [ ] Recording starts/stops correctly
- [ ] Transcript appears in real-time
- [ ] Transcript populates input field
- [ ] Voice output toggle works
- [ ] Settings panel opens/closes
- [ ] Voice customization works (rate, pitch, volume)
- [ ] Test voice button plays audio
- [ ] Error messages display correctly

### Integration ✓
- [ ] Voice transcript sends as chat message
- [ ] Chat panel displays all message types
- [ ] UI updates smoothly
- [ ] No console errors
- [ ] Build completes successfully

## Next Steps

Once the backend is implemented (tasks 3-6), return to this guide and test:
- Real WebSocket connections
- Actual code execution
- Live agent responses
- AWS Bedrock integration
- Polly TTS integration

## Quick Test Script

Run this in the browser console to verify the hook is working:

```javascript
// Check if useInterviewSession is working
const checkSession = () => {
  console.log('Session:', window.__NEXT_DATA__);
  console.log('Check React DevTools for hook state');
};
checkSession();
```

## Performance Testing

1. **Message Throughput**
   - Send 10 messages rapidly
   - All should queue and send
   - Responses should arrive in order

2. **Voice Recognition Accuracy**
   - Test with different accents
   - Test with technical terms
   - Test with background noise

3. **Memory Leaks**
   - Keep page open for 10+ minutes
   - Monitor memory in DevTools Performance tab
   - Should remain stable

---

**Current Status**: ✅ All features implemented and ready for testing
**Server**: http://localhost:3001
**Test Session URL**: http://localhost:3001/interview/test-session-123
