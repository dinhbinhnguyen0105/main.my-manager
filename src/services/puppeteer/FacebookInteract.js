// facebookInteract.js
const path = require("path");
const FacebookController = require("./newFacebook");

class FacebookInteract extends FacebookController {
    constructor(options, interactOptions) {
        super(options);
        this.likeAndComment = interactOptions.likeAndComment;
    };
    async controller() {
        await this.initBrowser();
        if (!await this.checkLogin()) { return false; }
        await this.interactFriend();
    };

    async handlePokes(count) {
        if (!count) return false;
        try {
            await this.page.goto("https://www.facebook.com/pokes");
            await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 5000));
            this.SELECTOR.pokes = this.pageLanguage === "vi" ? "div[aria-label='Chọc']" : "div[aria-label='Poke']";
            this.ARIA_LABEL.pokes = this.pageLanguage === "vi" ? "chọc" : "poke";
            try {
                await this.page.waitForSelector(this.SELECTOR.pokes);
            } catch (err) { };
            await this.page.waitForSelector(this.SELECTOR.button);
            const buttons = await this.page.$$(this.SELECTOR.button);
            let pokeButtons = [];
            for (let button of buttons) {
                const isPokeButton = await button.evaluate((elm, ariaLabel) => {
                    const label = elm.getAttribute("aria-label");
                    if (label && label.toLowerCase().includes(ariaLabel.toLowerCase())) return true;
                    return false;
                }, this.ARIA_LABEL.pokes);
                if (isPokeButton) pokeButtons.push(button);
            };
            const pokeButtonCount = pokeButtons.length;

            if (pokeButtonCount > 0) {
                const randomMove = Math.floor(Math.random() * (pokeButtonCount > 5 ? (Math.floor(Math.random() * 5)) : (Math.floor(Math.random() * pokeButtonCount))))
                for (let i = 0; i < randomMove; i++) { await this.moveToElement(pokeButtons[i]); };
                const newCount = count > pokeButtonCount ? pokeButtonCount : count;
                for (let i = 0; i < newCount; i++) {
                    const buttonIndex = Math.floor(Math.random() * pokeButtonCount);
                    await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 500 + 1500)));
                    await this.moveToElement(pokeButtons[buttonIndex]);
                    await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 300 + 1000)));
                    await this.clickToElement(pokeButtons[buttonIndex]);
                };
                return true;
            };
            return false;
        } catch (err) {
            console.error("ERROR [handlePokes]: ", err);
            return false;
        };
    };

    async handleRePokes(count) {
        if (!count) { return false; };
        try {
            await this.page.goto("https://www.facebook.com/pokes");
            await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 5000));
            this.SELECTOR.pokes = this.pageLanguage === "vi" ? "div[aria-label='Chọc']" : "div[aria-label='Poke']";
            this.ARIA_LABEL.pokes = this.pageLanguage === "vi" ? "chọc" : "poke";
            this.ARIA_LABEL.re_pokes = this.pageLanguage === "vi" ? "chọc lại" : "poke back";

            try {
                await this.page.waitForSelector(this.SELECTOR.pokes);
            } catch (err) { };
            await this.page.waitForSelector(this.SELECTOR.button);
            const buttons = await this.page.$$(this.SELECTOR.button);
            let rePokeButtons = [];
            for (let button of buttons) {
                const isPokeButton = await button.evaluate((elm, ariaLabel) => {
                    const label = elm.getAttribute("aria-label");
                    if (label && label.toLowerCase().includes(ariaLabel.toLowerCase())) return true;
                    return false;
                }, this.ARIA_LABEL.re_pokes);
                if (isPokeButton) rePokeButtons.push(button);
            };
            const rePokeButtonCount = rePokeButtons.length;
            if (rePokeButtonCount > 0) {
                const randomMove = Math.floor(Math.random() * (rePokeButtonCount > 5 ? (Math.floor(Math.random() * 5)) : (Math.floor(Math.random() * rePokeButtonCount))))
                for (let i = 0; i < randomMove; i++) { await this.moveToElement(rePokeButtons[i]); };
                const newCount = count > rePokeButtonCount ? rePokeButtonCount : count;
                for (let i = 0; i < newCount; i++) {
                    await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 500 + 1500)));
                    const buttonIndex = Math.floor(Math.random() * rePokeButtonCount);
                    await this.moveToElement(rePokeButtons[buttonIndex]);
                    await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 300 + 1000)));
                    await this.clickToElement(rePokeButtons[buttonIndex]);
                };
                return true;
            };
            return false;
        } catch (err) {
            console.error("ERROR [handleRePokes]: ", err);
            return false
        }
    }

    async interactFriend() {
        // const handleClickFeedsAllElm = async () => {
        //     try {
        //         await this.page.waitForSelector(this.SELECTOR.feeds_all, { timeout: 60000 });
        //         const feedsElm = await this.page.$(this.SELECTOR.feeds_all);
        //         await this.delay();
        //         if (await this.handleCloseVisibleDialog()) { return handleClickFeedsAllElm(); };
        //         await this.moveToElement(feedsElm);
        //         await this.clickToElement(feedsElm);
        //         return true;
        //     } catch (err) {
        //         console.error("ERROR [handleClickFeedsAllElm]", err);
        //         return false;
        //     };
        // };
        // const handleClickFeedsFriendElm = async () => {
        //     try {
        //         await this.page.waitForSelector(this.SELECTOR.feeds_friend, { timeout: 60000 });
        //         const feedsFriend = await this.page.$(this.SELECTOR.feeds_friend);
        //         if (await this.handleCloseVisibleDialog()) { return handleClickFeedsFriendElm(); };
        //         await this.moveToElement(feedsFriend);
        //         await this.clickToElement(feedsFriend);
        //         return true;
        //     } catch (err) {
        //         console.error("ERROR [handleClickFeedsFriendElm]", err);
        //         return false;
        //     };
        // };

        const friendConfigs = this.likeAndComment.friend;
        if (!friendConfigs.isSelected) { return true; };
        if (await this.page.url().includes("https://www.facebook.com/home.php") !== await this.page.url().includes("https://www.facebook.com/home.php")) {
            await this.page.goto("https://www.facebook.com/");
        };
        try {
            // if (!await handleClickFeedsAllElm()) { await this.page.goto("https://www.facebook.com/?filter=all&sk=h_chr"); };
            // if (!await handleClickFeedsFriendElm()) { await this.page.goto("https://www.facebook.com/?filter=friends&sk=h_chr"); };
            await this.page.goto("https://www.facebook.com/?filter=friends&sk=h_chr");
            const isFeeds = await this.handleFeeds(300000, friendConfigs.like.isSelected && friendConfigs.like.value, friendConfigs.comment.isSelected && friendConfigs.comment.value)
            console.log("isFeeds: ", isFeeds);
            // const isPoked = await this.handlePokes(friendConfigs.poke.isSelected && friendConfigs.poke.value);
            // console.log("poked: ", isPoked);
            // const isRePoked = await this.handleRePokes(friendConfigs.rePoke.isSelected && friendConfigs.rePoke.value);
            // console.log("rePoked: ", isRePoked);

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