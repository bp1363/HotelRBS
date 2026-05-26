# Step-by-Step Guide: Testing n8n and ElevenLabs Chatbots Locally

This guide will help you test the newly configured n8n and ElevenLabs chatbots on your local development environment.

## Prerequisites
- Node.js installed (v16 or higher recommended)
- npm or yarn package manager
- A modern web browser (Chrome, Firefox, Edge, Safari)

---

## Step 1: Navigate to Project Directory

Open your terminal/command prompt and navigate to the project root:

```bash
cd "SUNDAYFLOW-main"
```

---

## Step 2: Install Dependencies

If this is your first time running the project, or if dependencies have changed, install them:

```bash
npm install
```

**Or if you're using yarn:**
```bash
yarn install
```

**Expected output:** All packages should install successfully without errors.

---

## Step 3: Start the Development Server

Run the Vite development server:

```bash
npm run dev
```

**Expected output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:8083/
  ➜  Network: http://[::]:8083/
  ➜  press h to show help
```

The server should start on **port 8083** (as configured in `vite.config.ts`).

---

## Step 4: Open the Application in Browser

Open your web browser and navigate to:

```
http://localhost:8083
```

You should see your application homepage loading.

---

## Step 5: Verify Chatbots Are Loaded

### Check Browser Console

1. **Open Developer Tools:**
   - Press `F12` or `Ctrl+Shift+I` (Windows/Linux)
   - Or `Cmd+Option+I` (Mac)
   - Or right-click → "Inspect"

2. **Check the Console Tab:**
   - Look for any errors (red text)
   - You should see: `"ElevenLabs script loaded successfully"` if ElevenLabs loaded correctly
   - Check for any 404 errors related to scripts or API calls

3. **Check the Network Tab:**
   - Click on the "Network" tab
   - Refresh the page (F5)
   - Look for these requests:
     - `embed.js` from `cdn.n8nchatui.com` (n8n chatbot)
     - `convai-widget-embed` from `unpkg.com` (ElevenLabs chatbot)

---

## Step 6: Test the n8n Chatbot

The n8n chatbot appears as an **animated avatar/bubble** (usually in the bottom-right corner).

1. **Locate the Chatbot Button:**
   - Look for an animated avatar/chat bubble icon
   - It should be styled with your custom colors (#23665a)

2. **Click to Open:**
   - Click on the chatbot button/avatar
   - A chat window should open

3. **Verify n8n Integration:**
   - Check the browser console (F12)
   - Look for network requests to: `https://n8n.srv982383.hstgr.cloud/webhook/27dc8f3f-135a-46ed-9a6f-149c8b9eb778/chat`
   - Send a test message (e.g., "What kind of hotels can use HotelRBS?")
   - You should receive a response from your n8n workflow

4. **Verify Customization:**
   - Title should show: "HotelRBS AI Assistance"
   - Welcome message: "Welcome to HotelRBS! 😊"
   - Button colors should match your theme (#23665a, #178070)

---

## Step 7: Test the ElevenLabs Voice Chatbot

The ElevenLabs chatbot is a **voice assistant** that should appear automatically (or may need to be triggered depending on configuration).

1. **Look for ElevenLabs Widget:**
   - The widget may appear as a voice button/icon
   - Usually positioned somewhere on the page (check top-right or bottom-right)
   - Look for an agent ID: `agent_7601k8adqn77ec9bhk69g39k19fp`

2. **Verify Script Loading:**
   - Open browser console (F12)
   - Check for: `"ElevenLabs script loaded successfully"`
   - Verify the custom element exists:
     ```javascript
     // In console, run:
     document.querySelector('elevenlabs-convai')
     ```
     Should return the element (not null)

3. **Test Voice Interaction:**
   - Click the ElevenLabs widget button
   - Grant microphone permissions when prompted
   - Try speaking to the agent
   - Verify the agent responds with voice

4. **Check Agent ID:**
   - Inspect the element:
     ```javascript
     // In console:
     document.querySelector('elevenlabs-convai')?.getAttribute('agent-id')
     ```
     Should return: `"agent_7601k8adqn77ec9bhk69g39k19fp"`

---

## Step 8: Verify Both Chatbots Work Simultaneously

1. **Test Both at Once:**
   - Open the n8n text chatbot
   - Keep ElevenLabs voice chatbot available
   - Both should work independently without conflicts

2. **Check for Errors:**
   - Monitor the browser console for any JavaScript errors
   - Check the Network tab for failed requests
   - Verify no conflicts between the two chatbot scripts

---

## Step 9: Test on Different Pages

Navigate to different pages in your application and verify:

1. **Homepage** (`/`)
2. **Search Results** (`/search`)
3. **Hotel Details** (`/hotel/:id`)
4. **Any other pages**

Both chatbots should be available on all pages where the `ChatBot` component is rendered.

---

## Step 10: Test Responsive Behavior

Test on different screen sizes:

1. **Desktop:** Full browser window
2. **Tablet:** Resize to ~768px width
3. **Mobile:** Resize to ~375px width (or use browser DevTools device emulation)

Verify:
- Chatbots are visible and accessible on all sizes
- n8n chatbot window adjusts size (as configured in code)
- ElevenLabs widget remains functional

---

## Troubleshooting Common Issues

### Issue: Scripts not loading

**Solution:**
- Check internet connection
- Verify no ad blockers are blocking external scripts
- Check browser console for CORS errors
- Try hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

### Issue: n8n chatbot not responding

**Solution:**
- Verify the webhook URL is correct: `https://n8n.srv982383.hstgr.cloud/webhook/27dc8f3f-135a-46ed-9a6f-149c8b9eb778/chat`
- Test the webhook URL directly in a browser or Postman
- Check if your n8n workflow is active and running

### Issue: ElevenLabs chatbot not appearing

**Solution:**
- Check browser console for script loading errors
- Verify the script URL is accessible: `https://unpkg.com/@elevenlabs/convai-widget-embed`
- Ensure the agent ID is correct: `agent_7601k8adqn77ec9bhk69g39k19fp`
- Check if custom element is registered:
  ```javascript
  customElements.get('elevenlabs-convai')
  ```

### Issue: Microphone permissions denied

**Solution:**
- Grant microphone permissions in browser settings
- Check site permissions in browser address bar
- Ensure you're testing on `localhost` (not file:// protocol)

### Issue: CORS errors

**Solution:**
- Both chatbots use external CDNs, so CORS should not be an issue
- If you see CORS errors, check your network/firewall settings
- Verify you're accessing via `http://localhost:8083` not `file://`

---

## Quick Verification Checklist

- [ ] Development server starts without errors
- [ ] Application loads in browser
- [ ] Browser console shows no critical errors
- [ ] n8n chatbot button/avatar is visible
- [ ] n8n chatbot opens and displays correctly
- [ ] n8n chatbot sends and receives messages
- [ ] ElevenLabs script loads successfully
- [ ] ElevenLabs widget/element is present in DOM
- [ ] ElevenLabs agent ID matches: `agent_7601k8adqn77ec9bhk69g39k19fp`
- [ ] ElevenLabs voice interaction works
- [ ] Both chatbots work simultaneously
- [ ] Chatbots work on different pages
- [ ] Responsive behavior is correct

---

## Additional Debugging Commands

### Check if scripts are loaded:

```javascript
// In browser console:
// Check n8n
document.querySelector('script[src*="n8nchatui"]') || document.querySelector('script[innerHTML*="n8nchatui"]')

// Check ElevenLabs
document.querySelector('script[src*="elevenlabs"]')
```

### Verify chatbot global objects:

```javascript
// In browser console:
window.n8nChatbot
window.ElevenLabsConvAI
```

### Check network requests:

```javascript
// In browser console Network tab:
// Filter by "n8n" or "elevenlabs" or "webhook"
```

---

## Next Steps

Once both chatbots are verified working locally:

1. Test thoroughly with different user scenarios
2. Verify integrations with your backend APIs (if applicable)
3. Test on staging environment before deploying to production
4. Monitor performance and user experience

---

## Support

If you encounter issues not covered in this guide:

1. Check the browser console for detailed error messages
2. Review the network tab for failed requests
3. Verify your n8n workflow is properly configured
4. Confirm your ElevenLabs agent is active and configured correctly
5. Check the component code in: `src/components/ChatBot.tsx`

---

**Last Updated:** Based on current ChatBot.tsx configuration
**Current n8n Webhook:** `27dc8f3f-135a-46ed-9a6f-149c8b9eb778`
**Current ElevenLabs Agent ID:** `agent_7601k8adqn77ec9bhk69g39k19fp`

