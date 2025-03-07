//Controller.js
const path = require("path");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

class Controller {
    constructor(options) {
        puppeteer.use(StealthPlugin());
        this.browser = null;
        this.page = null;
        const [proxyIP, proxyPort, proxyUsername, proxyPassword] = options.proxy.split(":");
        this.proxyOptions = { proxyIP, proxyPort, proxyUsername, proxyPassword, };
        this.browserOptions = options.browserOptions;
        this.currentVisible = { x1: 0, x2: 0, y1: 0, y2: 0 };

        const args = [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--window-position=0,0",
            "--ignore-certificate-errors",
            "--ignore-certificate-errors-spki-list",
            "--disable-blink-features=AutomationControlled",
            "--disable-infobars",
            this.browserOptions.userAgent && `--user-agent=${this.browserOptions.userAgent}`,//
            `--proxy-server=${proxyIP}:${proxyPort}`,
        ];

        this.puppeteerOptions = {
            ignoreHTTPSErrors: true,
            args: args,
            executablePath: this.browserOptions.executablePath,
            ...options.puppeteerOptions,
        };
    };


    async initBrowser() {
        this.browser = await puppeteer.launch(this.puppeteerOptions);
        this.page = await this.browser.newPage();

        if (this.proxyOptions) {
            await this.page.authenticate({
                username: this.proxyOptions.proxyUsername,
                password: this.proxyOptions.proxyPassword
            });
        };
        await this.page.setUserAgent(this.browserOptions.userAgent);
        await this.page.setExtraHTTPHeaders({ "User-Agent": this.browserOptions.userAgent });
        await this.page.evaluateOnNewDocument((ua) => {
            Object.defineProperty(navigator, "userAgent", { get: () => ua });
            Object.defineProperty(navigator, 'webdriver', { get: () => false });
            Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'vi-VN'] });
            Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
            Object.defineProperty(screen, 'colorDepth', { get: () => 24 });
        }, this.browserOptions.userAgent);
        await this.page.setViewport({
            width: this.browserOptions.width,
            height: this.browserOptions.height,
            deviceScaleFactor: 1,
            isMobile: this.browserOptions.isMobile,
            hasTouch: this.browserOptions.isMobile,
        });
        console.log("Browser info: ", {
            userDataDir: path.basename(this.puppeteerOptions.userDataDir),
            proxyIP: `${this.proxyOptions.proxyIP}:${this.proxyOptions.proxyPort}`,
            userAgent: this.browserOptions.userAgent,
        });
        return this.browser;
    };

    async isElementInteractable(elementHandler) {
        if (!elementHandler) return false;

        try {
            // Check if the element exists in the DOM
            const isAttached = await this.page.evaluate(el => document.body.contains(el), elementHandler);
            if (!isAttached) { return false; };

            // Check if the element is visible in the viewport
            const isVisible = await elementHandler.isIntersectingViewport();
            if (!isVisible) { return false; };

            // Check if the element is not disabled
            const isDisabled = await this.page.evaluate(el => el.disabled, elementHandler);
            if (isDisabled) { return false; };

            return true;
        } catch (err) {
            console.error("ERROR [isElementInteractable]:", err);
            return false;
        }
    };

    async delay(min = 300, max = 1000) {
        await new Promise(resolve => setTimeout(resolve, Math.random() * (max - min) + min));
    }

    async isElementInViewport(element, tolerance = 0) {
        return await element.evaluate((el, tol) => {
            const rect = el.getBoundingClientRect();
            return (
                rect.top >= -tol &&
                rect.left >= -tol &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + tol &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth) + tol
            );
        }, tolerance);
    }

    async waitForElementToDisappear(elementHandler, timeout = 60000) {
        const startTime = Date.now();
        try {
            while (Date.now() - startTime < timeout) {
                const isGone = await this.page.evaluate(el => !document.body.contains(el), elementHandler);
                if (isGone) return true;
            };
            return false;
        } catch (err) {
            console.error("ERROR [waitForElementToDisappear]:", err);
            return false;
        };
    };

    async typeToElement(elemHandler, text) {
        const delayChar = (char) => {
            if (char === " ") return 150 + Math.random() * 100;
            return Math.random() < 0.15 ? 200 + Math.random() * 100 : Math.random() * 100 + 50;
        };
        try {
            await elemHandler.focus();
            for (let char of text) {
                await this.page.keyboard.type(char, { delay: delayChar(char) });

                // // Mô phỏng lỗi gõ và sửa
                // if (Math.random() < 0.1) {
                //     const deleteCount = Math.random() < 0.3 ? 2 : 1;
                //     for (let i = 0; i < deleteCount; i++) {
                //         await this.page.keyboard.press("Backspace", { delay: 50 + Math.random() * 50 });
                //     };
                // };

                // Di chuyển chuột ngẫu nhiên sau khi nhập một từ
                if (Math.random() < 0.3 && char === " ") {
                    await this.page.mouse.move(
                        Math.random() * 800 + 500,
                        Math.random() * 600 + 300,
                        { steps: 10 + Math.random() * 5 }
                    );
                };

                // Nghỉ lâu hơn khi gặp dấu câu
                if (/[.,?!]/.test(char)) {
                    await this.delay(500, 1000);
                };

                // Nghỉ ngắn bất chợt để trông tự nhiên hơn
                if (Math.random() < 0.1) {
                    await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 500)); // Nghỉ ngẫu nhiên từ 500ms đến 1000ms
                };
            };
            return true;
        } catch (err) {
            console.error(err);
            return false;
        };
    };

    async scrollToElement(element) {
        try {
            await this.page.evaluate(el => {
                el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
            }, element);
            await this.delay(500, 1000); // Wait for the scroll to complete
            return true;
        } catch (err) {
            console.error("ERROR [scrollToElement]:", err);
            return false;
        }
    }

    async cleanup() {
        try {
            if (this.browser) {
                await this.browser.close();
                console.log("Browser closed successfully.");
                this.browser = null;
                this.page = null;
            } else {
                console.log("No browser instance found.");
            }
        } catch (error) {
            console.error("Error while closing the browser:", error);
        }
    }

}

module.exports = Controller;