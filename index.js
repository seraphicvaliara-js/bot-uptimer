const http = require("http");
const https = require("https");
const { URL } = require("url");

const PORT = process.env.PORT || 3000;

// Ilagay dito ang URL ng bot mo
const BOT_URL = process.env.BOT_URL || "https://your-bot.onrender.com";

// Every 2 minutes
const INTERVAL = 2 * 60 * 1000;

let lastStatus = "Not checked yet";
let lastCheck = null;
let totalChecks = 0;
let successfulChecks = 0;
let failedChecks = 0;

function pingBot() {
    if (!BOT_URL || BOT_URL.includes("your-bot.onrender.com")) {
        console.log("⚠️ BOT_URL is not configured.");
        return;
    }

    try {
        const target = new URL(BOT_URL);
        const client = target.protocol === "https:" ? https : http;

        const request = client.get(target, {
            timeout: 30000,
            headers: {
                "User-Agent": "Bot-Uptimer/1.0"
            }
        }, (response) => {
            // Consume response data so the connection can close properly
            response.resume();

            totalChecks++;
            lastCheck = new Date().toISOString();

            if (response.statusCode >= 200 && response.statusCode < 500) {
                successfulChecks++;
                lastStatus = `ONLINE (${response.statusCode})`;

                console.log(
                    `[${new Date().toLocaleString()}] ✅ Bot is online — HTTP ${response.statusCode}`
                );
            } else {
                failedChecks++;
                lastStatus = `ERROR (${response.statusCode})`;

                console.log(
                    `[${new Date().toLocaleString()}] ⚠️ Bot returned HTTP ${response.statusCode}`
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
                `[${new Date().toLocaleString()}] ❌ Bot ping failed: ${error.message}`
            );
        });

    } catch (error) {
        totalChecks++;
        failedChecks++;
        lastCheck = new Date().toISOString();
        lastStatus = `ERROR (${error.message})`;

        console.log(`❌ Invalid BOT_URL: ${error.message}`);
    }
}

// Simple status page
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
    <title>Bot Uptimer</title>
    <style>
        body {
            margin: 0;
            background: #0d1117;
            color: #fff;
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }

        .box {
            width: 90%;
            max-width: 550px;
            background: #161b22;
            border: 1px solid #30363d;
            border-radius: 15px;
            padding: 25px;
            box-sizing: border-box;
        }

        h1 {
            margin-top: 0;
        }

        .status {
            padding: 15px;
            background: #21262d;
            border-radius: 10px;
            margin: 15px 0;
        }

        .online {
            color: #3fb950;
        }

        .info {
            color: #8b949e;
            line-height: 1.7;
        }
    </style>
</head>

<body>
    <div class="box">
        <h1>🤖 Bot Uptimer</h1>

        <div class="status">
            <strong>Status:</strong>
            <span class="online">${lastStatus}</span>
        </div>

        <div class="info">
            <div><b>Bot:</b> ${BOT_URL}</div>
            <div><b>Ping interval:</b> Every 2 minutes</div>
            <div><b>Total checks:</b> ${totalChecks}</div>
            <div><b>Successful:</b> ${successfulChecks}</div>
            <div><b>Failed:</b> ${failedChecks}</div>
            <div><b>Last check:</b> ${lastCheck || "Not yet"}</div>
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
            uptime: process.uptime(),
            bot: BOT_URL,
            lastStatus,
            lastCheck,
            totalChecks,
            successfulChecks,
            failedChecks
        }));

    } else {
        res.writeHead(404);
        res.end("Not Found");
    }
});

server.listen(PORT, () => {
    console.log("=================================");
    console.log("🤖 BOT UPTIMER STARTED");
    console.log("=================================");
    console.log(`🌐 Port: ${PORT}`);
    console.log(`🎯 Target: ${BOT_URL}`);
    console.log("⏱️ Interval: Every 2 minutes");
    console.log("=================================");

    // First ping immediately
    pingBot();

    // Then every 2 minutes
    setInterval(pingBot, INTERVAL);
});
