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
        };
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
        await this.page.waitForSelector("div[role='dialog']");
        this.ARIA_LABEL.close = this.pageLanguage === "vi" ? "đóng" : "close";
        try {
            const dialogs = await this.page.$$("div[role='dialog']");
            for (let dialog of dialogs) {
                if (!await this.isElementInteractable(dialog)) { continue; };
                await this.delay(2000, 5000);
                await this.page.waitForSelector(this.SELECTOR.button);
                const buttons = await this.page.$$(this.SELECTOR.button);
                for (let button of buttons) {
                    const isCloseBtn = await button.evaluate((elm, ariaLabel) => {
                        const label = elm.getAttribute("aria-label");
                        if (label && label.toLowerCase().includes(ariaLabel.toLowerCase())) return true;
                        return false;
                    }, this.ARIA_LABEL);
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

}

module.exports = FacebookController;