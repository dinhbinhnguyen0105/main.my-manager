function isValidIpPort(input) {
    if (typeof input !== 'string') {
        return false;
    }

    const parts = input.split(':');
    if (parts.length < 2) {
        return false;
    }

    const ip = parts[0];
    const port = parseInt(parts[1], 10);

    if (!isValidIp(ip) || !isValidPort(port)) {
        return false;
    }

    return true;
}

// console.log(isValidIpPort("71.236.160.49:45270:LHGWUD:QtfNYb"));

function isValidIp(ip) {
    const ipParts = ip.split('.');
    if (ipParts.length !== 4) {
        return false;
    }

    for (const part of ipParts) {
        const num = parseInt(part, 10);
        if (isNaN(num) || num < 0 || num > 255) {
            return false;
        }
    }

    return true;
}

function isValidPort(port) {
    return !isNaN(port) && port >= 0 && port <= 65535;
}

const getProxy = (_string) => {
    return new Promise(async (resolve, reject) => {
        if (isValidIpPort(_string)) { resolve(_string); };
        const urls = _string.split("|");
        for (let url of urls) {
            if (url.includes("https://proxyxoay.shop/")) {
                const rawRes = await fetch(url.trim());
                const res = await rawRes.json();
                if (res.status === 100) {
                    resolve(res.proxyhttp);
                } else {
                    reject(res);
                };
            };
        };
        reject("Failed to fetch proxy from server");
    });
};

module.exports = getProxy;