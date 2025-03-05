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

    async updateVisible() {
        const viewport = this.page.viewport();
        const scrollPosition = await this.page.evaluate(() => ({
            x: window.pageXOffset,
            y: window.pageYOffset,
        }));
        this.currentVisible = {
            x1: scrollPosition.x,
            x2: scrollPosition.x + viewport.width,
            y1: scrollPosition.y,
            y2: scrollPosition.y + viewport.height,
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
    async moveToElement(elementHandler) {
        try {
            // ======== Anti-bot Logic ========
            // Thêm delay ngẫu nhiên trước khi bắt đầu
            await this.delay(500, 1500);

            // Thêm chuyển động chuột giả ngẫu nhiên
            await this.#fakeMouseMovement();

            // ======== Logic chính ========
            let boundingBox = await elementHandler.boundingBox();
            if (!boundingBox) return false;

            // Kiểm tra viewport với sai số
            if (!await this.isElementInViewport(elementHandler, 15)) {
                await this.#humanLikeScroll(elementHandler);
                await this.delay(300, 800);
                boundingBox = await elementHandler.boundingBox();
            }

            // ======== Di chuyển chuột thực tế ========
            const targetX = boundingBox.x + boundingBox.width * (0.3 + Math.random() * 0.4);
            const targetY = boundingBox.y + boundingBox.height * (0.3 + Math.random() * 0.4);

            // Di chuyển theo đường cong với nhiều điểm dừng
            await this.#moveMouseToXY(targetX, targetY);

            // Thêm rung chuột nhẹ
            await this.#mouseTremor(3);

            // ======== Anti-bot Enhancements ========
            // Thêm hành động phụ
            await this.randomCursorDrift();
            await this.delay(200, 500);

            return true;
        } catch (err) {
            console.error("ERROR [moveToElement]:", err);
            return false;
        }
    }

    // ======== Các hàm hỗ trợ ========
    async delay(min, max) {
        await new Promise(resolve => setTimeout(resolve, Math.random() * (max - min) + min));
    }
    async #moveMouseToXY(targetX, targetY) {
        // Lấy vị trí ban đầu ngẫu nhiên hóa
        const startPos = this.mousePosition || {
            x: Math.random() * this.page.viewport.width * 0.3,
            y: Math.random() * this.page.viewport.height * 0.3
        };

        // Tạo đường cong Bezier phức tạp với 3 control points ngẫu nhiên
        const controlPoints = this.#generateHumanLikeControlPoints(startPos, { x: targetX, y: targetY });

        // Tính toán số bước di chuyển với biến động ngẫu nhiên
        const baseSteps = Math.hypot(targetX - startPos.x, targetY - startPos.y) / 2;
        const steps = Math.floor(baseSteps * (0.8 + Math.random() * 0.4));

        // Tạo hiệu ứng tốc độ biến đổi (ease-in/ease-out)
        const speedCurve = this.#generateVelocityProfile(steps);

        // Thêm điểm dừng giả (ghost pauses)
        const pauseIndices = this.#generateRandomPauses(steps);

        let currentPosition = { ...startPos };

        for (let i = 0; i <= steps; i++) {
            // Tính toán vị trí hiện tại với độ lệch ngẫu nhiên
            const t = i / steps;
            const pos = this.#calculateBezierPosition(t, controlPoints);

            // Thêm độ rung tay (hand tremor)
            pos.x += (Math.random() - 0.5) * this.#randomTremorIntensity();
            pos.y += (Math.random() - 0.5) * this.#randomTremorIntensity();

            // Điều chỉnh tốc độ theo profile
            const dynamicDelay = speedCurve[i] * (15 + Math.random() * 25);

            // Di chuyển thực tế
            await this.page.mouse.move(pos.x, pos.y);
            this.mousePosition = { x: pos.x, y: pos.y };

            // Thêm điểm dừng ảo
            if (pauseIndices.includes(i)) {
                await this.#randomMicroPause();
                await this.#addSubtleMovement(pos); // Di chuyển vi mô trong lúc dừng
            }

            await new Promise(resolve => setTimeout(resolve, dynamicDelay));
        }

        // Hiệu ứng điều chỉnh cuối cùng
        await this.#finalAdjustment(targetX, targetY);
    }

    // ======== Các hàm hỗ trợ ========
    #generateHumanLikeControlPoints(start, end) {
        // Tạo 3 control points ngẫu nhiên theo quy tắc vật lý
        const cp1 = {
            x: start.x + (end.x - start.x) * (0.2 + Math.random() * 0.3),
            y: start.y + (end.y - start.y) * (0.1 + Math.random() * 0.4)
        };

        const cp2 = {
            x: start.x + (end.x - start.x) * (0.5 + Math.random() * 0.2),
            y: start.y + (end.y - start.y) * (0.6 + Math.random() * 0.3)
        };

        const cp3 = {
            x: start.x + (end.x - start.x) * (0.7 + Math.random() * 0.2),
            y: start.y + (end.y - start.y) * (0.4 + Math.random() * 0.3)
        };

        return [start, cp1, cp2, cp3, end];
    }

    #calculateBezierPosition(t, points) {
        // Tính toán vị trí trên đường cong Bezier bậc 4
        const mt = 1 - t;
        return {
            x: points[0].x * mt ** 4 +
                4 * points[1].x * mt ** 3 * t +
                6 * points[2].x * mt ** 2 * t ** 2 +
                4 * points[3].x * mt * t ** 3 +
                points[4].x * t ** 4,
            y: points[0].y * mt ** 4 +
                4 * points[1].y * mt ** 3 * t +
                6 * points[2].y * mt ** 2 * t ** 2 +
                4 * points[3].y * mt * t ** 3 +
                points[4].y * t ** 4
        };
    }

    #generateVelocityProfile(steps) {
        // Tạo profile tốc độ dạng sine biến đổi
        const profile = [];
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const speed = Math.sin(Math.PI * t) * (0.8 + Math.random() * 0.2);
            profile.push(speed);
        }
        return profile;
    }

    #generateRandomPauses(steps) {
        // Tạo 1-3 điểm dừng ngẫu nhiên
        const pauseCount = Math.floor(Math.random() * 3) + 1;
        return Array.from({ length: pauseCount }, () =>
            Math.floor(Math.random() * (steps * 0.8)) + steps * 0.1
        );
    }

    #randomMicroPause() {
        // Dừng từ 50-300ms với xác suất 30%
        return Math.random() < 0.3 ?
            new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 250))
            : Promise.resolve();
    }

    #addSubtleMovement(basePos) {
        // Thêm chuyển động vi mô trong khi dừng
        const moves = [];
        for (let i = 0; i < 3; i++) {
            moves.push(this.page.mouse.move(
                basePos.x + (Math.random() - 0.5) * 8,
                basePos.y + (Math.random() - 0.5) * 8
            ));
        }
        return Promise.all(moves);
    }

    #randomTremorIntensity() {
        // Cường độ rung tay thay đổi theo khoảng cách
        return Math.random() < 0.15 ? 3 : 1.5;
    }

    async #finalAdjustment(targetX, targetY) {
        // Hiệu ứng điều chỉnh cuối cùng
        for (let i = 0; i < 2; i++) {
            await this.page.mouse.move(
                targetX + (Math.random() - 0.5) * 15,
                targetY + (Math.random() - 0.5) * 15
            );
            await new Promise(resolve => setTimeout(resolve, 30 + Math.random() * 50));
        }
        await this.page.mouse.move(targetX, targetY);
    }
    async #fakeMouseMovement() {
        const randomPoints = Array.from({ length: 3 }, () => ({
            x: Math.random() * this.page.viewport.width,
            y: Math.random() * this.page.viewport.height
        }));

        for (const point of randomPoints) {
            await this.#moveMouseToXY(point.x, point.y);
            await this.delay(50, 150);
        }
    }

    async #humanLikeScroll(elementHandler) {
        const MAX_ATTEMPTS = 5;
        const viewport = await this.page.viewport();

        for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
            const elementBox = await elementHandler.boundingBox();
            const currentScroll = await this.page.evaluate(() => window.scrollY);
            const targetPosition = elementBox.y + elementBox.height / 2 - viewport.height / 2;

            const scrollDistance = targetPosition - currentScroll;
            const step = scrollDistance * (0.7 + Math.random() * 0.3);

            await this.page.evaluate((step) => {
                window.scrollBy({
                    top: step,
                    behavior: 'auto'
                });
            }, step);

            await this.delay(200, 500);
            await this.#mouseTremor(2);

            if (await this.isElementInViewport(elementHandler, 50)) break;
        }
    }

    async #mouseTremor(intensity = 2) {
        const originalPos = { ...this.mousePosition };

        for (let i = 0; i < 3; i++) {
            const dx = (Math.random() - 0.5) * intensity;
            const dy = (Math.random() - 0.5) * intensity;
            await this.page.mouse.move(originalPos.x + dx, originalPos.y + dy);
            await this.delay(20, 50);
        }

        await this.page.mouse.move(originalPos.x, originalPos.y);
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

    async randomCursorDrift() {
        const driftSteps = Math.floor(Math.random() * 4) + 2;
        for (let i = 0; i < driftSteps; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 30;

            const targetX = this.mousePosition.x + Math.cos(angle) * distance;
            const targetY = this.mousePosition.y + Math.sin(angle) * distance;

            await this.#moveMouseToXY(targetX, targetY);
            await this.delay(50, 150);
        }
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
                    await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 500)); // Nghỉ ngẫu nhiên từ 500ms đến 1000ms
                };
            };
            return true;
        } catch (err) {
            console.error(err);
            return false;
        };
    };

}

module.exports = Controller;