// newFacebook.js

const path = require("path");
const Controller = require(".new/Controller");

class Facebook extends Controller {
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
    };

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
                };
                return true;
            } else {
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

    async getReactionsDialog(timeWait = 0) {
        this.ARIA_LABEL.reactions = this.pageLanguage === "vi" ? "cảm xúc" : "reactions";
        try {
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

    async interactingLike(articleElm, reaction) {
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
                    // await this.hoverToElement(buttonElm);
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
                        };
                    };
                    return false;
                };
            };
        } catch (err) {
            console.error("ERROR in handleInteractLike: ", err);
            return false;
        };
    };
}