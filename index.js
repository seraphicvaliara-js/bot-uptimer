const express = require('express');
const axios = require('axios');
const login = require('fca-project-orai');

const app = express();
const PORT = process.env.PORT || 3000;
const TARGET_URL = 'https://sinzu-a-1.onrender.com/';

// ==========================================
// 1. EXPRESS WEB SERVER & UPTIMER SYSTEM
// ==========================================

app.get('/', (req, res) => {
  res.send('Messenger Bot Status: ONLINE & ACTIVE');
});

app.listen(PORT, () => {
  console.log(`[SERVER] Web server listening on port ${PORT}`);
});

// Self-ping kada 2 minuto (120,000 ms) para hindi matulog sa Render
setInterval(async () => {
  try {
    await axios.get(TARGET_URL);
    console.log(`[UPTIMER] Pinged ${TARGET_URL} successfully at ${new Date().toLocaleTimeString()}`);
  } catch (error) {
    console.error(`[UPTIMER ERROR]:`, error.message);
  }
}, 2 * 60 * 1000);


// ==========================================
// 2. APPSTATE & SESSION PERSISTENCE HANDLING
// ==========================================

let appState;

// Unang hahanapin ang APPSTATE mula sa Render Environment Variables
if (process.env.APPSTATE) {
  try {
    appState = JSON.parse(process.env.APPSTATE);
    console.log('[AUTH] Loaded appstate from Environment Variables.');
  } catch (err) {
    console.error('[AUTH ERROR] Failed to parse APPSTATE environment variable:', err.message);
  }
} else {
  // Kung wala sa environment variable, gagamitin ang local appstate.json file
  try {
    appState = require('./appstate.json');
    console.log('[AUTH] Loaded appstate from local appstate.json file.');
  } catch (err) {
    console.error('[AUTH ERROR] Could not find local appstate.json file.');
  }
}


// ==========================================
// 3. MESSENGER BOT INITIALIZATION
// ==========================================

if (!appState) {
  console.error('[FATAL ERROR] No valid appState found! Please set APPSTATE env variable or provide appstate.json');
  process.exit(1);
}

const loginOptions = {
  listenEvents: true,
  selfListen: false
};

login({ appState }, loginOptions, (err, api) => {
  if (err) {
    console.error('[LOGIN ERROR] Failed to login to Facebook:', err);
    return;
  }

  console.log('[BOT] Facebook Messenger Bot successfully logged in!');

  // Listener sa mga pumasok na mensahe
  api.listenMqtt((err, event) => {
    if (err) {
      console.error('[LISTEN ERROR]:', err);
      return;
    }

    // Halimbawang auto-response kapag may nag-message
    if (event.type === 'message' && event.body) {
      const messageText = event.body.toLowerCase();

      if (messageText === 'ping') {
        api.sendMessage('Pong! 🏓 Bot is active and running.', event.threadID, event.messageID);
      }
    }
  });
});
