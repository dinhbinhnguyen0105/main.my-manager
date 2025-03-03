const path = require("path");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

class Controller {
    constructor(options) {
        puppeteer.use(StealthPlugin());
        this.browser = null;
        this.page = null;
        const [proxyIP, proxyPort, proxyUsername, proxyPassword] = options.proxy.split(":");
        // const [proxyIP, proxyPort, proxyUsername, proxyPassword] = "71.236.160.49:45270:LHGWUD:QtfNYb".split(":");
        this.proxyOptions = { proxyIP, proxyPort, proxyUsername, proxyPassword, };
        this.browserOptions = options.browserOptions;

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

    async #__randomBezierCurve() {
        const p1 = [Math.random() * 0.4, Math.random() * 0.4]; // Control point 1
        const p2 = [Math.random() * 0.6 + 0.4, Math.random() * 0.6 + 0.4]; // Control point 2
        return (t) => {
            const u = 1 - t;
            return (
                u * u * 0 + // P0 = (0,0)
                2 * u * t * p1[1] +
                t * t * p2[1]
            );
        };
    }

    async #moveMouse(x, y) {
        const { startX, startY } = await this.page.evaluate(() => ({
            startX: window.pageXOffset,
            startY: window.pageYOffset
        }));

        const steps = Math.floor(Math.random() * 15) + 25; // 25-40 bước
        const bezierCurve = randomBezierCurve();

        for (let i = 0; i <= steps; i++) {
            const progress = bezierCurve(i / steps);
            const currentX = startX + (x - startX) * progress;
            const currentY = startY + (y - startY) * progress;

            await this.page.mouse.move(currentX, currentY);

            // Nghỉ từ 20-50ms dựa vào khoảng cách di chuyển
            const delay = Math.random() * 30 + 20;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    async #scrollToElement(elmHandler) {
        try {
            const boundingBox = await elmHandler.boundingBox();
            if (!boundingBox) {
                console.error("Not found element:", elmHandler);
                return;
            };

            let elementY = boundingBox.y;
            let viewportHeight = await this.page.evaluate(() => window.innerHeight);
            let currentScrollY = await this.page.evaluate(() => window.scrollY);

            let overscroll = Math.random() < 0.3 ? Math.floor(Math.random() * 50) + 20 : 0; // Cuộn dư một chút (20-50px)

            while (Math.abs(currentScrollY - elementY) > 10) { // Chỉ dừng khi gần đúng
                let distance = elementY - currentScrollY;
                let scrollStep = Math.min(Math.abs(distance), Math.floor(Math.random() * 150) + 100); // Ngẫu nhiên 100-250 px

                // Cuộn nhanh hơn khi ở xa, chậm dần khi gần
                if (Math.abs(distance) > 300) {
                    scrollStep += Math.floor(Math.random() * 100);
                } else if (Math.abs(distance) < 100) {
                    scrollStep -= Math.floor(Math.random() * 50);
                };

                if (distance > 0) {
                    await this.page.mouse.wheel({ deltaY: scrollStep });
                    currentScrollY += scrollStep;
                } else {
                    await this.page.mouse.wheel({ deltaY: -scrollStep });
                    currentScrollY -= scrollStep;
                };

                // Delay không đều, giúp tránh bị phát hiện là bot
                let delay = Math.floor(Math.random() * 1200) + 300; // 300ms - 1500ms
                if (Math.random() < 0.2) delay += 500; // 20% cơ hội delay lâu hơn (tạo sự tự nhiên)
                await new Promise(resolve => setTimeout(resolve, delay));

                // Cập nhật lại vị trí sau mỗi lần cuộn
                elementY = (await elmHandler.boundingBox()).y;
                currentScrollY = await this.page.evaluate(() => window.scrollY);
            };

            // Cuộn dư một chút rồi quay lại để trông tự nhiên hơn
            if (overscroll > 0) {
                await this.page.mouse.wheel({ deltaY: overscroll });
                await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 1000) + 500));
                await this.page.mouse.wheel({ deltaY: -overscroll });
            };
            return true;
        } catch (err) {
            console.error(err);
            return false;
        };

    };

    async delay(min = 1000, max = 3000) {
        try {
            let totalDelay = Math.floor(min + Math.random() * (max - min)); // Chọn khoảng nghỉ chính
            let elapsed = 0;

            while (elapsed < totalDelay) {
                let chunk = Math.min(
                    totalDelay - elapsed,
                    Math.floor(200 + Math.random() * 800) // Chia nhỏ khoảng nghỉ thành từng phần (200ms - 1s)
                );

                await new Promise(resolve => setTimeout(resolve, chunk));
                elapsed += chunk;

                // Giả vờ hành động nhỏ trong lúc nghỉ
                if (Math.random() < 0.2) { // 20% cơ hội làm gì đó
                    if (Math.random() < 0.5) {
                        await this.page.mouse.move(
                            Math.random() * 800 + 500,
                            Math.random() * 600 + 300,
                            { steps: 5 + Math.random() * 10 }
                        );
                    } else {
                        await this.page.keyboard.press("ArrowRight"); // 50% cơ hội nhấn một phím vô nghĩa
                    };
                };
            };
        } catch (err) {
            console.log("delay: ", err);
            return false;
        };
    };


    async isElementInteractable(elmHandler) {
        if (!elmHandler) return false;
        if (! await this.moveToElement(elmHandler)) { return false; };
        try {
            // 🔹 Giả lập độ trễ như con người trước khi kiểm tra
            await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 1000))

            // 🔹 Kiểm tra xem phần tử có tồn tại trong DOM không
            const isAttached = await this.page.evaluate(el => document.body.contains(el), elmHandler);
            if (!isAttached) {
                console.error("!isAttached");
                return false;
            };

            // 🔹 Kiểm tra có trong viewport không (tránh việc click vào phần tử bị ẩn)
            const isVisible = await elmHandler.isIntersectingViewport();
            if (!isVisible) {
                console.error("!isVisible");
                return false;
            };

            // 🔹 Kiểm tra kích thước (tránh các phần tử `display: none`)
            const boundingBox = await elmHandler.boundingBox();
            if (!boundingBox || boundingBox.width === 0 || boundingBox.height === 0) {
                console.error("!boundingBox");
                return false;
            };

            // 🔹 Tạo danh sách điểm ngẫu nhiên để kiểm tra thay vì chỉ lấy tâm
            const testPoints = [];
            for (let i = 0; i < 3; i++) {
                testPoints.push({
                    x: boundingBox.x + Math.random() * boundingBox.width,
                    y: boundingBox.y + Math.random() * boundingBox.height
                });
            }

            // // 🔹 Kiểm tra từng điểm xem có bị che phủ bởi phần tử khác không
            // const isObstructed = await this.page.evaluate((points, element) => {
            //     return points.some(({ x, y }) => {
            //         const topElement = document.elementFromPoint(x, y);
            //         return topElement !== element && !topElement.contains(element);
            //     });
            // }, testPoints, elmHandler);

            // if (isObstructed) {
            //     console.error("!isObstructed");
            //     return false;
            // }

            // 🔹 Kiểm tra thuộc tính `disabled` (đối với button, input,...)
            const isDisabled = await this.page.evaluate(el => el.disabled, elmHandler);
            if (isDisabled) {
                console.error("!isDisabled");
                return false;
            }

            // // 🔹 Mô phỏng di chuyển chuột đến phần tử (tạo cảm giác tự nhiên)
            // const movePoint = testPoints[Math.floor(Math.random() * testPoints.length)];
            // await this.page.mouse.move(movePoint.x, movePoint.y, { steps: 5 + Math.floor(Math.random() * 5) });

            return true;
        } catch (err) {
            console.error(err);
            return false;
        };
    };

    async moveToElement(elmHandler) {
        if (!await this.#scrollToElement(elmHandler)) return false;

        try {
            const boundingBox = await elmHandler.boundingBox();
            if (!boundingBox) return false;

            // Tạo độ lệch ngẫu nhiên dựa trên kích thước phần tử
            const offsetX = (Math.random() - 0.5) * boundingBox.width * 0.15;
            const offsetY = (Math.random() - 0.5) * boundingBox.height * 0.15;
            const x = boundingBox.x + boundingBox.width / 2 + offsetX;
            const y = boundingBox.y + boundingBox.height / 2 + offsetY;

            // Chỉ cài đặt MouseHelper nếu đang debug
            if (process.env.DEBUG_MODE) {
                await installMouseHelper(this.page);
            }

            await this.#moveMouse(x, y);
            return true;
        } catch (err) {
            console.error("[ERROR] moveToElement:", err);
            return false;
        }
    }

    async clickToElement(elmHandler) {
        if (!await this.moveToElement(elmHandler)) { return false; };
        if (!await this.isElementInteractable(elmHandler)) { return false; };
        try {
            await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));

            await this.page.mouse.down();
            await new Promise(resolve => setTimeout(resolve, 80 + Math.random() * 300));
            await this.page.mouse.up();
            await this.delay(100, 300);

            return true;
        } catch (err) {
            console.err("[ERROR] moveToElement: ", err);
            return false;
        };
    };

    async typeToElement(elemHandler, text) {
        const delayChar = (char) => {
            if (char === " ") return 150 + Math.random() * 100;
            return Math.random() < 0.15 ? 200 + Math.random() * 100 : Math.random() * 100 + 50;
        };
        if (await this.clickToElement(elemHandler)) { return false; };
        try {
            for (let char of text) {
                await this.page.keyboard.type(char, { delay: delayChar(char) });

                // Mô phỏng lỗi gõ và sửa
                if (Math.random() < 0.1) {
                    const deleteCount = Math.random() < 0.3 ? 2 : 1;
                    for (let i = 0; i < deleteCount; i++) {
                        await this.page.keyboard.press("Backspace", { delay: 50 + Math.random() * 50 });
                    };
                };

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
                    await this.delay(200, 500);
                };
            };
            return true;
        } catch (err) {
            console.error(err);
            return false;
        };
    };

    async waitForElementToDisappear(elementHandler, timeout = 60000) {
        const startTime = Date.now();
        try {
            while (Date.now() - startTime < timeout) {
                const isGone = await this.page.evaluate(el => !document.body.contains(el), elementHandler);
                if (isGone) return true;

                // Thêm hành vi tự nhiên
                if (Math.random() < 0.5) await this.page.mouse.move(Math.random() * 1920, Math.random() * 1080);
                if (Math.random() < 0.3) await this.page.mouse.wheel({ deltaY: Math.random() * 100 - 50 });

                await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
            };
            return false;
        } catch (err) {
            console.error(err);
            return false;
        }
    };

    async cleanup() {
        try {
            if (this.page && !this.page.isClosed()) {
                await this.page.close();
            };
            if (this.browser) {
                await this.browser.close();
            };
            console.log("Browser closed successfully");
        } catch (error) {
            console.error("Cleanup failed:", error);
        };
    };
};

function randomBezierCurve() {
    const p1 = [Math.random() * 0.4, Math.random() * 0.4]; // Control point 1
    const p2 = [Math.random() * 0.6 + 0.4, Math.random() * 0.6 + 0.4]; // Control point 2
    return (t) => {
        const u = 1 - t;
        return (
            u * u * 0 + // P0 = (0,0)
            2 * u * t * p1[1] +
            t * t * p2[1]
        );
    };
}
module.exports = Controller;

// https://www.facebook.com/?filter=all&sk=h_chr