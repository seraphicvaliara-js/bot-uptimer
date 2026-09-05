const http = require("http");
const https = require("https");
const { URL } = require("url");

const PORT = process.env.PORT || 3000;

// 🎯 BOT NA I-UUPTIME
const BOT_URL = "https://sinzu-a-1.onrender.com/";

// ⏱️ EVERY 2 MINUTES
const INTERVAL = 2 * 60 * 1000;

let lastStatus = "Not checked yet";
let lastCheck = null;
let totalChecks = 0;
let successfulChecks = 0;
let failedChecks = 0;

function pingBot() {
    try {
        const target = new URL(BOT_URL);
        const client = target.protocol === "https:" ? https : http;

        const request = client.get(target, {
            timeout: 30000,
            headers: {
                "User-Agent": "Sinzu-Bot-Uptimer/1.0"
            }
        }, (response) => {
            response.resume();

            totalChecks++;
            lastCheck = new Date().toISOString();

            if (response.statusCode >= 200 && response.statusCode < 500) {
                successfulChecks++;
                lastStatus = `ONLINE (${response.statusCode})`;

                console.log(
                    `[${new Date().toLocaleString()}] ✅ SINZU BOT ONLINE — HTTP ${response.statusCode}`
                );
            } else {
                failedChecks++;
                lastStatus = `ERROR (${response.statusCode})`;

                console.log(
                    `[${new Date().toLocaleString()}] ⚠️ SINZU BOT ERROR — HTTP ${response.statusCode}`
                );
            }
        });

        request.on("timeout", () => {
            request.destroy(new Error("Request timeout"));
        });

        request.on("error", (error) => {
            totalChecks++;
            failedChecks++;
            lastCheck = new Date().toISOString();
            lastStatus = `OFFLINE (${error.message})`;

            console.log(
                `[${new Date().toLocaleString()}] ❌ PING FAILED — ${error.message}`
            );
        });

    } catch (error) {
        totalChecks++;
        failedChecks++;
        lastCheck = new Date().toISOString();
        lastStatus = `ERROR (${error.message})`;

        console.log(`❌ ERROR: ${error.message}`);
    }
}

// 🌐 STATUS WEB PAGE
const server = http.createServer((req, res) => {

    if (req.url === "/") {
        res.writeHead(200, {
            "Content-Type": "text/html; charset=utf-8"
        });

        res.end(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Sinzu Bot Uptimer</title>

    <style>
        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            min-height: 100vh;
            background: #0d1117;
            color: white;
            font-family: Arial, sans-serif;

            display: flex;
            justify-content: center;
            align-items: center;
        }

        .container {
            width: 92%;
            max-width: 600px;

            background: #161b22;

            border: 1px solid #30363d;
            border-radius: 18px;

            padding: 28px;

            box-shadow: 0 10px 40px rgba(0,0,0,.35);
        }

        h1 {
            margin: 0 0 8px;
            font-size: 28px;
        }

        .subtitle {
            color: #8b949e;
            margin-bottom: 25px;
        }

        .status {
            background: #21262d;
            border-radius: 12px;
            padding: 18px;
            margin-bottom: 15px;
        }

        .online {
            color: #3fb950;
            font-weight: bold;
        }

        .offline {
            color: #f85149;
            font-weight: bold;
        }

        .row {
            display: flex;
            justify-content: space-between;
            padding: 9px 0;
            border-bottom: 1px solid #30363d;
        }

        .row:last-child {
            border-bottom: none;
        }

        .label {
            color: #8b949e;
        }

        .value {
            text-align: right;
            max-width: 65%;
            word-break: break-all;
        }

        .footer {
            margin-top: 20px;
            color: #8b949e;
            font-size: 13px;
            text-align: center;
        }
    </style>
</head>

<body>

<div class="container">

    <h1>🤖 Sinzu Bot Uptimer</h1>

    <div class="subtitle">
        Automatic uptime monitoring
    </div>

    <div class="status">
        <div class="${lastStatus.startsWith("ONLINE") ? "online" : "offline"}">
            ● ${lastStatus}
        </div>
    </div>

    <div class="row">
        <span class="label">Target</span>
        <span class="value">${BOT_URL}</span>
    </div>

    <div class="row">
        <span class="label">Interval</span>
        <span class="value">Every 2 minutes</span>
    </div>

    <div class="row">
        <span class="label">Total Checks</span>
        <span class="value">${totalChecks}</span>
    </div>

    <div class="row">
        <span class="label">Successful</span>
        <span class="value">${successfulChecks}</span>
    </div>

    <div class="row">
        <span class="label">Failed</span>
        <span class="value">${failedChecks}</span>
    </div>

    <div class="row">
        <span class="label">Last Check</span>
        <span class="value">${lastCheck || "Waiting..."}</span>
    </div>

    <div class="footer">
        Sinzu Bot Uptimer • Running continuously
    </div>

</div>

</body>
</html>
        `);

    } else if (req.url === "/health") {

        res.writeHead(200, {
            "Content-Type": "application/json"
        });

        res.end(JSON.stringify({
            status: "online",
            target: BOT_URL,
            interval: "2 minutes",
            lastStatus,
            lastCheck,
            totalChecks,
            successfulChecks,
            failedChecks,
            uptime: process.uptime()
        }));

    } else {

        res.writeHead(404, {
            "Content-Type": "text/plain"
        });

        res.end("Not Found");
    }
});

server.listen(PORT, () => {

    console.log("====================================");
    console.log("🤖 SINZU BOT UPTIMER");
    console.log("====================================");

    console.log(`🌐 Uptimer Port: ${PORT}`);
    console.log(`🎯 Target: ${BOT_URL}`);
    console.log("⏱️ Ping: Every 2 minutes");

    console.log("====================================");

    // 🚀 FIRST PING IMMEDIATELY
    pingBot();

    // 🔄 THEN EVERY 2 MINUTES
    setInterval(pingBot, INTERVAL);
});

Iyan na mismo ang target:

https://sinzu-a-1.onrender.com/

at 2 minutes ang pagitan ng bawat ping.

Sa Render, sapat na ang:

Build Command: npm install
Start Command: node index.js

Kailangan lang nasa repo mo ang "index.js" at "package.json".
