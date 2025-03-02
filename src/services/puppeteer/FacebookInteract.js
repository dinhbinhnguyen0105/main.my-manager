const path = require("path");
const FacebookController = require("./Facebook");

class FacebookInteract extends FacebookController {
    constructor(options, interactOptions) {
        super(options);
        this.likeAndComment = interactOptions.likeAndComment;
    };

    async controller() {
        await this.initBrowser();
        // await this.page.goto("https://www.facebook.com/home.php");
        if (!await this.checkLogin()) { return false; }
        await this.interactFriend();
    };

    async interactFriend() {

        const friendConfigs = this.likeAndComment.friend;
        if (!friendConfigs.isSelected) { return true; };
        if (await this.page.url().includes("https://www.facebook.com/home.php") !== await this.page.url().includes("https://www.facebook.com/home.php")) {
            await this.page.goto("https://www.facebook.com/");
        };
        try {
            await this.page.waitForSelector(this.SELECTOR.feeds_all);
            const feedsElm = await this.page.$(this.SELECTOR.feeds_all);
            if (!await this.isElementInteractable(feedsElm)) {
                if (await this.handleCloseVisibleDialog()) { return this.interactFriend() }
                else {
                    console.error("!await this.handleCloseVisibleDialog()");
                    return false;
                };
            };
            await this.delay();
            await this.clickToElement(feedsElm);

        } catch (err) {
            console.error(err);
            return false;
        };
        // https://www.facebook.com/?filter=all&sk=h_chr [a]
    };

    async interactNewsFeed() {

    };
    async interactWatch() {

    };
    async interactGroup() {

    };
    async interactPage() {

    };
    async interactMarketplace() {

    };
    async interactNotification() {

    };
    async interactSearch() {

    };
}

module.exports = FacebookInteract;