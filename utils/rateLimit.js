// Rate Limiting Middleware Function
function rateLimit(maxTokens, refillTime) {
    const tokens = new Map();

    setInterval(() => {
        for (const [key, value] of tokens.entries()) {
            tokens.set(key, Math.min(maxTokens, value + 1));
        }
    }, refillTime);

    return (req, res, next) => {
        let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        // console.log(ip)
        ip = ip.split(',')[0].trim();
        if (!tokens.has(ip)) {
            tokens.set(ip, maxTokens);
        }

        const tokenCount = tokens.get(ip);
        // console.log(tokenCount)
        if (tokenCount === 0) {
            res.status(429).send(`http://localhost:5173/too-many-requests?refillTime=${refillTime}`)
            return;
        }

        tokens.set(ip, tokenCount - 1);
        next();
    };
}

module.exports = rateLimit