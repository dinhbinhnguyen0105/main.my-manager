const path = require("path");
const getProxy = require("./getProxy");
const readConfigs = require("./readConfig");
const browsersPath = path.resolve(__dirname, "..", "..", "browsers");

const handleInitProxy = async (proxy) => {
    try {
        const _proxy = await getProxy(proxy);
        return {
            statusCode: 200,
            proxy: _proxy,
        };
    } catch (error) {
        if (error.status === 101) {
            const regex = /\d+/g;
            const result = data.message.match(regex);
            console.log(data.message);
            await new Promise(resolve => setTimeout(resolve, parseInt(result[0]) * 1000));
            return await handleInitProxy(proxy);
        } else {
            return {
                statusCode: 500,
                message: "Token has expired"
            };
        };
    };
};

const prepareOptionPuppeteer = async (isMobile, userInfo, proxy) => {
    const userAgentOptions = isMobile ? userInfo.browser.mobile : userInfo.browser.desktop;
    const browserOptions = {
        isMobile: isMobile,
        userAgent: userAgentOptions.userAgent,
        width: userAgentOptions.viewportWidth,
        height: userAgentOptions.viewportHeight,
        deviceScaleFactor: Math.random() * 0.5 + 1
    };
    const puppeteerOptions = {
        headless: false,
        userDataDir: path.resolve(browsersPath, userInfo.browser.name)
    };

    const executablePaths = readConfigs("puppeteer.txt", "EXECUTABLE_PATH");
    if (executablePaths.length < 1) {
        return {
            status: false,
            data: {
                statusCode: 500,
                message: "EXECUTABLE_PATH not found in config",
            },
        };
    } else {
        browserOptions.executablePath = executablePaths[0];
    };
    const _proxy = await handleInitProxy(proxy);
    if (_proxy.statusCode === 500) {
        return {
            status: false,
            data: {
                puppeteerOptions: puppeteerOptions,
                browserOptions: browserOptions,
                proxy: _proxy.message,
            },
        };
    };
    return {
        status: true,
        data: {
            puppeteerOptions: puppeteerOptions,
            browserOptions: browserOptions,
            proxy: _proxy.proxy,
        },
    };

}

module.exports = prepareOptionPuppeteer;