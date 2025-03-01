function isValidIpPort(input) {
    if (typeof input !== 'string') {
        return false;
    }

    const parts = input.split(':');
    if (parts.length !== 2) {
        return false;
    }

    const ip = parts[0];
    const port = parseInt(parts[1], 10);

    if (!isValidIp(ip) || !isValidPort(port)) {
        return false;
    }

    return true;
}

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

module.exports = isValidIpPort;