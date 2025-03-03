const path = require("path");
const Controller = require("./Controller");

class FacebookController extends Controller {
    constructor(options) {
        super(options);
        this.pageLanguage = null;
        this.ARIA_LABEL = {
        };
        this.SELECTOR = {
            button: "div[role='button']",
            feeds_all: "a[href='https://www.facebook.com/?filter=all&sk=h_chr']",
            feeds_friend: "a[href='/?filter=friends&sk=h_chr']",
            feeds_group: "a[href='/?filter=groups&sk=h_chr']",
            feeds_page: "a[href='/?filter=groups&sk=h_chr']",
            feed_article: "div[aria-describedby]",
            main_container: "div[role='main']",
            dialog: "div[role='dialog']",
            textbox: "div[role='textbox']",
        };
        this.REACTIONS = [];
    }
    async checkLogin() {
        try {
            const uid = path.basename(this.puppeteerOptions.userDataDir);
            const loginUrl = "https://www.facebook.com/login";
            await this.page.goto(loginUrl);
            await new Promise(resolve => setTimeout(resolve, 1000));
            const currentUrl = await this.page.url();
            if (currentUrl.includes("home.php")) {
                const pageLanguage = await this.page.evaluate(() => {
                    return document.documentElement.lang;
                });
                this.pageLanguage = pageLanguage;
                if (this.pageLanguage.trim() !== "vi" && this.pageLanguage.trim() !== "en") {
                    console.error("Please switch the language to English or Vietnamese");
                    return false;
                }
                return true;
            }
            else {
                console.error(`User is not logged into Facebook in userDataDir: [${uid}]`)
                return false;
            };
        } catch (err) {
            console.error("Check login failed: ", err);
            await this.cleanup();
            throw err;
        };
    };

    async handleCloseVisibleDialog() {
        try {
            await this.page.waitForSelector("div[role='dialog']");
            this.ARIA_LABEL.close = this.pageLanguage === "vi" ? "đóng" : "close";
            const dialogs = await this.page.$$("div[role='dialog']");
            for (let dialog of dialogs) {
                if (!await this.isElementInteractable(dialog)) { continue; };
                await this.delay(2000, 5000);
                await this.page.waitForSelector(this.SELECTOR.button);
                const buttons = await this.page.$$(this.SELECTOR.button);
                for (let button of buttons) {
                    const isCloseBtn = await button.evaluate((elm, ariaLabel) => {
                        const label = elm.getAttribute("aria-label");
                        if (label && label.toLowerCase() === ariaLabel.toLowerCase()) return true;
                        return false;
                    }, this.ARIA_LABEL.close);
                    if (isCloseBtn) {
                        await this.delay();
                        await this.clickToElement(button);
                        return true;
                    };
                };
                return false;
            };
        } catch (err) {
            console.error(err);
            return false;
        };
    };

    async handleHover(element) {
        try {
            const box = await element.boundingBox();
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

            await element.hover();
            return true;
        } catch (err) {
            console.error("Error in handleHover:", err);
            return false;
        }
    }

    async getReactionsDialog(timeWait = 0) {
        this.ARIA_LABEL.reactions = this.pageLanguage === "vi" ? "cảm xúc" : "reactions";
        try {
            // await this.page.waitForSelector(this.SELECTOR.dialog);
            const dialogs = await this.page.$$(this.SELECTOR.dialog);
            for (let dialog of dialogs) {
                const labelDialog = await dialog.evaluate(elm => elm.getAttribute("aria-label"));
                if (labelDialog.toLowerCase() === this.ARIA_LABEL.reactions) { return dialog; };
            };
            if (timeWait > 10) { return false; }
            else {
                await new Promise(resolve => setTimeout(resolve, 1000));
                return this.getReactionsDialog(timeWait + 1);
            };
        } catch (err) {
            console.log("ERROR getReactionsDialog: ", err);
            return false;
        };
    };

    async handleInteractLike(articleElm, reaction) {
        // aria-label="Thích"
        this.ARIA_LABEL.button_like = this.pageLanguage === "vi" ? "thích" : "like";
        this.REACTIONS = this.pageLanguage === "vi" ? ["thích", "yêu thích", "thương thương", "haha", "wow", "buồn", "phẫn nộ"] : ["like", "love", "care", "haha", "wow", "sad", "angry",];
        try {
            await articleElm.waitForSelector(this.SELECTOR.button, { timeout: 60000 });
            const buttons = await articleElm.$$(this.SELECTOR.button);
            for (let buttonElm of buttons) {
                const isLikeBtn = await buttonElm.evaluate((elm, ariaLabel) => {
                    const label = elm.getAttribute("aria-label");
                    if (label && label.toLowerCase() === ariaLabel.toLowerCase()) return true;
                    return false;
                }, this.ARIA_LABEL.button_like);
                if (isLikeBtn) {
                    await this.moveToElement(buttonElm);
                    await this.handleHover(buttonElm);
                    const reactionsDialog = await this.getReactionsDialog();
                    if (typeof reaction === "string") {
                        const buttonIndex = this.REACTIONS.findIndex(r => r.toLowerCase() === reaction.toLowerCase());
                        await reactionsDialog.waitForSelector(this.SELECTOR.button);
                        const buttons = await reactionsDialog.$$((this.SELECTOR.button));
                        if (buttonIndex < buttons.length) {
                            await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 800));
                            await buttons[buttonIndex].click();
                            console.log(`Clicked [${reaction}]`);
                            return true;
                        } else {
                            return false;
                        }
                    }
                    return false;
                }
            };
        } catch (err) {
            console.error("ERROR in handleInteractLike: ", err);
            return false;
        };
    };

    async handleInteractComment(articleElm, comment) {
        this.ARIA_LABEL.button_comment = this.pageLanguage === "vi" ? "viết bình luận" : "Leave a comment";
        try {
            await articleElm.waitForSelector(this.SELECTOR.button, { timeout: 60000 });
            const buttons = await articleElm.$$(this.SELECTOR.button);
            for (let button of buttons) {
                const isComment = await button.evaluate((elm, ariaLabel) => {
                    const label = elm.getAttribute("aria-label");
                    if (label && label.toLowerCase() === ariaLabel.toLowerCase()) return true;
                    return false;
                }, this.ARIA_LABEL.button_comment);
                if (isComment) {
                    await this.clickToElement(button);
                    await this.page.waitForSelector(this.SELECTOR.textbox);
                    const textBox = await this.page.$(this.SELECTOR.textbox);
                    await this.typeToElement(textBox, comment);
                    console.log("Type: ", comment);
                    await new Promise((resolve) => setTimeout(resolve, 60000));
                    return true;
                };
            };
        } catch (err) {
            console.log("handlerInteractComment: ", err);
            return false;
        };
    }

    async handleInteractFeeds(duration = 30000, reactions, comments) {
        try {
            this.ARIA_LABEL.feeds_container = this.pageLanguage === "vi" ? "bảng feed" : "feeds";
            await this.page.waitForSelector(this.SELECTOR.main_container, { timeout: 60000 });
            const mainContainers = await this.page.$$(this.SELECTOR.main_container);
            for (let mainContainer of mainContainers) {
                const isFeeds = await mainContainer.evaluate((elm, ariaLabel) => {
                    const label = elm.getAttribute("aria-label");
                    if (label && label.toLowerCase().includes(ariaLabel.toLowerCase())) return true;
                    return false;
                }, this.ARIA_LABEL.feeds_container);
                if (isFeeds) {
                    const startTime = Date.now();
                    let count = 0;
                    while (Date.now() - startTime < duration) {
                        await mainContainer.waitForSelector(this.SELECTOR.feed_article);
                        const articles = await mainContainer.$$(this.SELECTOR.feed_article);
                        if (articles.length > 0) {
                            if (count < articles.length) {
                                await this.page.evaluate(async (element) => {
                                    const rect = element.getBoundingClientRect();
                                    const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
                                    if (!isVisible) {
                                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                        await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 2000)); // Nghỉ ngẫu nhiên từ 500ms đến 1000ms
                                    }
                                }, articles[count]);
                                console.log("count: ", count);
                                count += 1;
                                if (Math.random() < 0.5) {
                                    if (reactions.length > 0) {
                                        // await this.handleInteractLike(articles[count], reactions.pop());
                                    }
                                    if (comments.length > 0) {
                                        await this.handleInteractComment(articles[count], comments.pop())
                                    }
                                }
                            }
                        }
                    };
                    return true;
                };
            }

            return false;
        } catch (err) {
            console.error(err);
            return false;
        }
    }
}

module.exports = FacebookController;