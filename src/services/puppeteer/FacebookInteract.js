const path = require("path");
const FacebookController = require("./Facebook");

class FacebookInteract extends FacebookController {
    constructor(options, interactOptions) {
        super(options);
        this.likeAndComment = interactOptions.likeAndComment;
        console.log(options);
    };
    async controller() {
        await this.initBrowser();
        if (!await this.checkLogin()) { return false; }
        await this.interactFriend();
    };

    async interactFriend() {
        const handleClickFeedsAllElm = async () => {
            try {
                await this.page.waitForSelector(this.SELECTOR.feeds_all, { timeout: 60000 });
                const feedsElm = await this.page.$(this.SELECTOR.feeds_all);
                if (!await this.isElementInteractable(feedsElm)) {
                    if (await this.handleCloseVisibleDialog()) { return handleClickFeedsAllElm(); }
                    else {
                        console.error("!await this.isElementInteractable(feedsElm)");
                        return false;
                    };
                };
                await this.delay();
                await this.clickToElement(feedsElm);
                return true;
            } catch (err) {
                console.error(err);
                return false;
            };
        };
        const handleClickFeedsFriendElm = async () => {
            try {
                await this.page.waitForSelector(this.SELECTOR.feeds_friend, { timeout: 60000 });
                const feedsFriend = await this.page.$(this.SELECTOR.feeds_friend);
                if (!await this.isElementInteractable(feedsFriend)) {
                    if (await this.handleCloseVisibleDialog()) { return handleClickFeedsFriendElm(); }
                    else {
                        console.error("!await this.isElementInteractable(feedsFriend)");
                        return false;
                    };
                };
                await this.delay();
                await this.clickToElement(feedsFriend);
                return true;
            } catch (err) {
                console.error(err);
                return false;
            };
        };

        const friendConfigs = this.likeAndComment.friend;
        if (!friendConfigs.isSelected) { return true; };
        if (await this.page.url().includes("https://www.facebook.com/home.php") !== await this.page.url().includes("https://www.facebook.com/home.php")) {
            await this.page.goto("https://www.facebook.com/");
        };
        try {
            // if (!await handleClickFeedsAllElm()) { await this.page.goto("https://www.facebook.com/?filter=all&sk=h_chr"); };
            // if (!await handleClickFeedsFriendElm()) { await this.page.goto("https://www.facebook.com/?filter=friends&sk=h_chr"); };
            await this.page.goto("https://www.facebook.com/?filter=friends&sk=h_chr");
            await this.handleInteractFeeds(300000, ["like", "love", "like", "like"], ["❤️❤️❤️", "♥️♥️♥️"]);
            console.log("Finished");

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