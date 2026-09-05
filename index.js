const express = require('express');

const app = express();
app.use(express.json());

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
        document.getElementById('downloadBtn').addEventListener('click', function(e) {
            e.preventDefault();
            alert('The mod is in preview – check back later!');
        });
    </script>
</body>
</html>`);
});

if (require.main === module) {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Server listening on port ${port}`);
    });
}

// ---- Export for Vercel ----
module.exports = app;
