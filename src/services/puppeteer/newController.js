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

    #randomBezierCurve() {
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
    };

    async #moveMouseToXY(x, y) {
        const { startX, startY } = await this.page.evaluate(() => ({
            startX: window.pageXOffset,
            startY: window.pageYOffset
        }));

        const steps = Math.floor(Math.random() * 15) + 25; // 25-40 steps
        const bezierCurve = this.#randomBezierCurve().bind(this);

        for (let i = 0; i <= steps; i++) {
            const progress = bezierCurve(i / steps);
            const currentX = startX + (x - startX) * progress;
            const currentY = startY + (y - startY) * progress;

            await this.page.mouse.move(currentX, currentY);

            // Delay between 20-50ms based on the distance moved
            const delay = Math.random() * 30 + 20;
            await new Promise(resolve => setTimeout(resolve, delay));
        };
    };

    async #delay(min = 1000, max = 3000) {
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

    async #isElementInteractable(elementHandler) {
        if (!elementHandler) return false;

        try {
            // Check if the element exists in the DOM
            const isAttached = await this.page.evaluate(el => document.body.contains(el), elementHandler);
            if (!isAttached) {
                console.error("Element is not attached to the DOM");
                return false;
            }

            // Check if the element is visible in the viewport
            const isVisible = await elementHandler.isIntersectingViewport();
            if (!isVisible) {
                console.error("Element is not visible in the viewport");
                return false;
            }

            // Check if the element is not disabled
            const isDisabled = await this.page.evaluate(el => el.disabled, elementHandler);
            if (isDisabled) {
                console.error("Element is disabled");
                return false;
            }

            // Check if the element is not covered by another element
            const boundingBox = await elementHandler.boundingBox();
            if (!boundingBox || boundingBox.width === 0 || boundingBox.height === 0) {
                console.error("Element has no bounding box or is not visible");
                return false;
            }

            const testPoints = [
                { x: boundingBox.x + boundingBox.width / 2, y: boundingBox.y + boundingBox.height / 2 },
                { x: boundingBox.x + boundingBox.width / 4, y: boundingBox.y + boundingBox.height / 4 },
                { x: boundingBox.x + 3 * boundingBox.width / 4, y: boundingBox.y + 3 * boundingBox.height / 4 }
            ];

            const isCovered = await this.page.evaluate((points, element) => {
                return points.some(({ x, y }) => {
                    const topElement = document.elementFromPoint(x, y);
                    return topElement !== element && !topElement.contains(element);
                });
            }, testPoints, elementHandler);

            if (isCovered) {
                console.error("Element is covered by another element");
                return false;
            }

            return true;
        } catch (err) {
            console.error("Error checking if element is interactable:", err);
            return false;
        }
    };

    async moveToElement(elementHandler) {
        try {
            // Kiểm tra bounding box của phần tử
            let boundingBox = await elementHandler.boundingBox();
            if (!boundingBox) {
                console.error("Element not found:", elementHandler);
                return false;
            }

            let elementY = boundingBox.y;
            let elementX = boundingBox.x;
            let viewportHeight = await this.page.evaluate(() => window.innerHeight);
            let viewportWidth = await this.page.evaluate(() => window.innerWidth);
            let currentScrollY = await this.page.evaluate(() => window.scrollY);

            // Nếu phần tử nằm ngoài viewport, cuộn đến nó
            if (elementY < currentScrollY || elementY > currentScrollY + viewportHeight) {
                while (Math.abs(currentScrollY - elementY) > 10) {
                    let distance = elementY - currentScrollY;
                    let scrollStep = Math.min(Math.abs(distance), Math.floor(Math.random() * 150) + 100);

                    if (Math.abs(distance) > 300) {
                        scrollStep += Math.floor(Math.random() * 100);
                    } else if (Math.abs(distance) < 100) {
                        scrollStep -= Math.floor(Math.random() * 50);
                    }

                    if (distance > 0) {
                        await this.page.mouse.wheel({ deltaY: scrollStep });
                        currentScrollY += scrollStep;
                    } else {
                        await this.page.mouse.wheel({ deltaY: -scrollStep });
                        currentScrollY -= scrollStep;
                    }

                    let delay = Math.floor(Math.random() * 500) + 300;
                    if (Math.random() < 0.2) delay += 500;
                    await new Promise(resolve => setTimeout(resolve, delay));

                    if (Math.random() < 0.1) {
                        await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 1000) + 500));
                    }

                    if (Math.random() < 0.1) {
                        await this.page.mouse.move(Math.random() * viewportWidth, Math.random() * viewportHeight);
                    }

                    boundingBox = await elementHandler.boundingBox();
                    elementY = boundingBox.y;
                    currentScrollY = await this.page.evaluate(() => window.scrollY);
                }

                // Scroll nhẹ lên/xuống một chút để tự nhiên hơn
                if (Math.random() < 0.3) {
                    let overscroll = Math.floor(Math.random() * 50) + 20;
                    await this.page.mouse.wheel({ deltaY: overscroll });
                    await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 500) + 500));
                    await this.page.mouse.wheel({ deltaY: -overscroll });
                }

                // Đảm bảo phần tử nằm chính giữa viewport
                await elementHandler.evaluate(el => el.scrollIntoView({ behavior: 'smooth', block: 'center' }));
            }

            // Cập nhật lại tọa độ sau khi scroll
            boundingBox = await elementHandler.boundingBox();
            elementX = boundingBox.x + boundingBox.width / 2;
            elementY = boundingBox.y + boundingBox.height / 2;

            // Di chuyển chuột đến phần tử
            await this.#moveMouseToXY(elementX, elementY);
            return true;
        } catch (err) {
            console.error("Error in scrollAndMoveMouseToElement:", err);
            return false;
        }
    };

    async waitForElementToDisappear(elementHandler, timeout = 60000) {
        const startTime = Date.now();
        try {
            while (Date.now() - startTime < timeout) {
                const isGone = await this.page.evaluate(el => !document.body.contains(el), elementHandler);
                if (isGone) return true;
            };
            return false;
        } catch (err) {
            console.error(err);
            return false;
        }
    };

    async clickToElement(elementHandler) {
        if (!await this.moveToElement(elementHandler)) { return false; };
        if (!await this.#isElementInteractable(elementHandler)) { return false; };
        try {
            await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));

            await this.page.mouse.down();
            await new Promise(resolve => setTimeout(resolve, 80 + Math.random() * 300));
            await this.page.mouse.up();
            await this.#delay(100, 300);

            return true;
        } catch (err) {
            console.err("[ERROR] moveToElement: ", err);
            return false;
        };
    }

    async hoverToElement(elementHandler) {
        try {
            const box = await elementHandler.boundingBox();
            if (!box) {
                console.error("Element not found or not visible");
                return false;
            }

            const startX = Math.floor(Math.random() * box.width) + box.x;
            const startY = Math.floor(Math.random() * box.height) + box.y;
            const endX = box.x + box.width / 2;
            const endY = box.y + box.height / 2;

            await this.page.mouse.move(startX, startY);
            await this.page.mouse.move(endX, endY, { steps: 20 });

            await elementHandler.hover();
            return true;
        } catch (err) {
            console.error("Error in handleHover:", err);
            return false;
        }
    }

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

}