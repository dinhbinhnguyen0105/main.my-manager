const path = require("path");
const readConfigs = require("./readConfig");
const browsersPath = path.resolve(__dirname, "..", "..", "browsers");

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
    return {
        status: true,
        data: {
            puppeteerOptions: puppeteerOptions,
            browserOptions: browserOptions,
            proxy: proxy,
        },
    };

}

module.exports = prepareOptionPuppeteer;