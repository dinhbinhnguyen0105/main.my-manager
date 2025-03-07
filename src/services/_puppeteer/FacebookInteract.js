// FacebookInteract.js
const FacebookController = require("./Facebook");

class FacebookInteract extends FacebookController {
    constructor(options, interactOptions) {
        super(options);
        this.likeAndComment = interactOptions.likeAndComment;
    };

    async controller() {
        await this.initBrowser();
        if (!await this.checkLogin()) { return false; }
        if (this.likeAndComment.isSelected) {
            if (this.likeAndComment.friend.isSelected) { await this.handleFriendInteract(); };
            if (this.likeAndComment.newsFeed.isSelected) { await this.handleNewsFeedInteract(); };
            if (this.likeAndComment.watch.isSelected) { await this.handleWatchInteract(); };
            if (this.likeAndComment.page.isSelected) { await this.handlePageInteract(); };
        };
    };

    async handleFriendInteract() {
        const handlePoke = async (count) => {
            if (!count) return false;
            try {
                await this.delay(1000, 5000);
                await this.page.waitForSelector(this.SELECTOR.div__button__hashpopup__menu);
                let isPokeButtonExisted = false;

                for (let i = 0; i < 5; i++) {
                    const hashpopupButtons = await this.page.$$(this.SELECTOR.div__button__hashpopup__menu);
                    for (let hashpopupButton of hashpopupButtons) {
                        const hashpopupButtonName = await hashpopupButton.evaluate(elm => elm.getAttribute("aria-label"));
                        if (hashpopupButtonName && hashpopupButtonName.trim().toLowerCase() === this.ARIA_LABEL.button__poke) {
                            isPokeButtonExisted = true;
                            break;
                        };
                    };
                    if (isPokeButtonExisted) { break; }
                    else { await new Promise(resolve => setTimeout(resolve, 1000)); };
                }
                if (!isPokeButtonExisted) {
                    console.error("ERROR [handlePoke]: Not found poke button");
                    return false;
                };

                for (let i = 0; i < 3; i++) {
                    const loadingState = await this.page.$(this.SELECTOR.div__loadingState);
                    if (loadingState) {
                        await this.scrollToElement(loadingState);
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    };
                };

                const hashpopupButtons = await this.page.$$(this.SELECTOR.div__button__hashpopup__menu);
                for (let hashpopupButton of hashpopupButtons) {
                    const hashpopupButtonName = await hashpopupButton.evaluate(elm => elm.getAttribute("aria-label"));
                    if (hashpopupButtonName && this.ARIA_LABEL.button__poke === hashpopupButtonName.trim().toLowerCase()) {
                        if (count) {
                            if (Math.random() > 0.2) {
                                await this.delay();
                                await this.scrollToElement(hashpopupButton);
                                await this.delay();
                                await hashpopupButton.click();
                                count--;
                            };
                        }
                        else { return true; };
                    };
                };
            } catch (error) {
                console.error("ERROR [handlePokes]: ", error);
                return false;
            };
        };
        const handlePokeBack = async (count) => {
            if (!count) return false;
            try {
                await this.delay(1000, 5000);
                await this.page.waitForSelector(this.SELECTOR.div__button__hashpopup__menu);
                let isPokeButtonExisted = false;

                for (let i = 0; i < 5; i++) {
                    const hashpopupButtons = await this.page.$$(this.SELECTOR.div__button__hashpopup__menu);
                    for (let hashpopupButton of hashpopupButtons) {
                        const hashpopupButtonName = await hashpopupButton.evaluate(elm => elm.getAttribute("aria-label"));
                        if (hashpopupButtonName && hashpopupButtonName.trim().toLowerCase() === this.ARIA_LABEL.this.ARIA_LABEL.button__pokeBack) {
                            isPokeButtonExisted = true;
                            break;
                        };
                    };
                    if (isPokeButtonExisted) { break; }
                    else { await new Promise(resolve => setTimeout(resolve, 1000)); };
                }
                if (!isPokeButtonExisted) {
                    console.error("ERROR [handlePokeBack]: Not found poke back button");
                    return false;
                };

                const hashpopupButtons = await this.page.$$(this.SELECTOR.div__button__hashpopup__menu);
                for (let hashpopupButton of hashpopupButtons) {
                    const hashpopupButtonName = await hashpopupButton.evaluate(elm => elm.getAttribute("aria-label"));
                    if (hashpopupButtonName && this.ARIA_LABEL.this.ARIA_LABEL.button__pokeBack === hashpopupButtonName.trim().toLowerCase()) {
                        if (count) {
                            if (Math.random() > 0.2) {
                                await this.delay();
                                await this.scrollToElement(hashpopupButton);
                                await this.delay();
                                await hashpopupButton.click();
                                count--;
                            };
                        }
                        else { return true; };
                    };
                };
            } catch (error) {
                console.error("ERROR [handlePokeBack]: ", error);
                return false;
            };
        };
        const friend = this.likeAndComment.friend;
        try {
            const results = {};
            const isFeeds = await this.interactFeed(
                "https://www.facebook.com/?filter=friends&sk=h_chr",
                300000,
                friend.like.isSelected && friend.like.value,
                friend.comment.isSelected && friend.comment.value,
                0,
            );
            results.isFeeds = isFeeds;
            if (friend.poke.isSelected && friend.poke.value) {
                await this.page.goto("https://www.facebook.com/pokes");
                const isPoke = await handlePoke(friend.poke.value);
                results.isPoke = isPoke;
            } else if (friend.rePoke.isSelected && friend.rePoke.value) {
                await this.page.goto("https://www.facebook.com/pokes");
                const isPokeBack = await handlePokeBack(friend.poke.value);
                results.isPokeBack = isPokeBack;
            };
            console.log("handleFriendInteract: ", results);
            return true;
        } catch (error) {
            console.error("ERROR [interactFriend]: ", error);
            return false;
        };
    };
    async handleNewsFeedInteract() {
        try {
            const newsFeed = this.likeAndComment.newsFeed;
            const isFeeds = await this.interactFeed(
                "https://www.facebook.com/?filter=all&sk=h_chr",
                parseInt(newsFeed.value),
                newsFeed.like.isSelected && newsFeed.like.value,
                newsFeed.comment.isSelected && newsFeed.comment.value,
                0,
            );
            console.log("handleNewsFeedInteract: ", { isFeeds });
            return true;
        } catch (error) {
            console.error("ERROR [handleNewsFeedInteract]: ", error);
            return false;
        };
    };
    async handleWatchInteract() {
        const handleWatch = async (article) => {
            try {
                await this.scrollToElement(article);
                await this.delay();
                const video = await article.waitForSelector(this.SELECTOR.div__video);
                await this.scrollToElement(video);
                await this.delay();
                await video.hover();
                await this.delay();
                await article.waitForSelector(this.SELECTOR.div__button);
                const buttons = await article.$$(this.SELECTOR.div__button);
                for (let button of buttons) {
                    const buttonName = await button.evaluate(elm => elm.getAttribute("aria-label"));
                    if (buttonName && buttonName.trim().toLowerCase() === this.ARIA_LABEL.button__videoPlay.trim().toLowerCase()) {
                        await this.delay();
                        await button.click();
                        console.log("Watching ...");
                        return true;
                    } else if (buttonName && buttonName.trim().toLowerCase() === this.ARIA_LABEL.button__videoPause.trim().toLowerCase()) {
                        console.log("Watching ...");
                        return true;
                    };
                };
                return false;
            } catch (error) {
                console.error("ERROR [handleWatch]: ", error);
                return false;
            };
        };
        const handleCommentToWatch = async (comment) => {
            try {
                for (let i = 0; i < 30; i++) {
                    await this.page.waitForSelector(this.SELECTOR.dialog);
                    const dialogs = await this.page.$$(this.SELECTOR.dialog);
                    for (let dialog of dialogs) {
                        const dialogName = await dialog.evaluate(elm => elm.getAttribute("aria-label"));
                        if (dialogName && dialogName.trim().toLowerCase() === this.ARIA_LABEL.dialog__name__videoViewer) {
                            //type
                            await dialog.waitForSelector(this.SELECTOR.div__textbox);
                            const textBox = await dialog.$(this.SELECTOR.div__textbox);
                            await this.delay();
                            await textBox.focus();
                            await this.delay();
                            await textBox.type(comment);
                            // get action buttons
                            await dialog.waitForSelector(this.SELECTOR.div__button, { timeout: 60000 });
                            const buttons = await dialog.$$(this.SELECTOR.div__button);
                            const actionButtons = {};
                            for (let button of buttons) {
                                const buttonName = await button.evaluate(elm => elm.getAttribute("aria-label"));
                                if (!buttonName) { continue; };
                                if (buttonName.trim().toLowerCase() === this.ARIA_LABEL.button__close) { actionButtons.close = button; }
                                else if (buttonName.trim().toLowerCase() === this.ARIA_LABEL.button__submitComment) { actionButtons.submit = button; }
                                else { continue; };
                            };
                            //submit
                            await this.delay(500, 2000);
                            await actionButtons.submit.click();
                            //close
                            await this.delay(2000, 4000);
                            await actionButtons.close.click();
                            return true;
                        };
                    };
                    await new Promise(resolve => setTimeout(resolve, 1000));
                };
                console.error("ERROR [handleCommentToWatch]: cannot found dialog");
                return false;
            } catch (err) {
                console.error("ERROR [handleCommentToWatch]: ", err);
                return false;
            };
        };

        const watch = this.likeAndComment.watch;
        try {
            const videoWatchedIndex = [];
            const startTime = Date.now();
            await this.page.goto("https://www.facebook.com/watch/");
            await this.page.waitForSelector(this.SELECTOR.watch_feed);
            const watchFeed = await this.page.$(this.SELECTOR.watch_feed);

            while (Date.now() - startTime < watch.value) {
                await watchFeed.waitForSelector(this.SELECTOR.video_article);
                const videoArticles = await watchFeed.$$(this.SELECTOR.video_article);
                // 1m-3m
                const timeWatch = Math.floor(Math.random() * 60000 + 180000);   //delay
                const videoIndex = Math.floor(Math.random() * (videoArticles.length - 1));
                if (videoWatchedIndex.includes(videoIndex)) { continue; };
                const isWatching = await handleWatch(videoArticles[videoIndex]);
                if (!isWatching) { return false; };
                await new Promise(resolve => setTimeout(resolve, timeWatch));
                if (Math.random() < 0.5) {
                    if (watch.like.isSelected && watch.like.value.length > 0) {
                        const isLiked = await this.handleInteractLike(videoArticles[videoIndex], watch.like.value[watch.like.value.length - 1]);
                        isLiked && watch.like.value.pop();
                    }
                    if (watch.comment.isSelected && watch.comment.value.length > 0) {
                        await videoArticles[videoIndex].waitForSelector(this.SELECTOR.div__button, { timeout: 60000 });
                        let buttons = await videoArticles[videoIndex].$$(this.SELECTOR.div__button);
                        for (let button of buttons) {
                            const buttonName = await button.evaluate(elm => elm.getAttribute("aria-label"));
                            if (buttonName.trim().toLowerCase() === this.ARIA_LABEL.button_comment) {
                                await this.delay();
                                await this.scrollToElement(button);
                                await this.delay();
                                await button.click();
                                await this.delay(1000, 3000);
                                const isCommented = await handleCommentToWatch(watch.comment.value[watch.comment.value.length - 1]);
                                await new Promise(resolve => setTimeout(resolve, 3000));
                                if (await this.handleLeavePageDialog()) { console.log("Leaved.") };
                                isCommented && watch.comment.value.pop();
                            };
                        };
                    };
                    videoWatchedIndex.push(videoIndex);
                };
            }
            console.log("interactWatch: ", true);
            return true;
        } catch (error) {
            console.error("ERROR [interactWatch]: ", error);
            return false;
        };
    };
    async handleGroupInteract() {
        try {
            const group = this.likeAndComment.group;
            const isFeeds = await this.interactFeed(
                "https://www.facebook.com/?filter=groups&sk=h_chr",
                parseInt(group.value),
                group.like.isSelected && group.like.value,
                group.comment.isSelected && group.comment.value,
                0,
            );
            console.log("handleGroupInteract: ", { isFeeds });
            return true;
        } catch (error) {
            console.error("ERROR [handleGroupInteract]: ", error);
            return false;
        };
    };
    async handlePageInteract() {
        try {
            const page = this.likeAndComment.page;
            const isFeeds = await this.interactFeed(
                "https://www.facebook.com/?filter=pages&sk=h_chr",
                parseInt(page.value),
                page.like.isSelected && page.like.value,
                page.comment.isSelected && page.comment.value,
                0,
            );
            if (page.invite.isSelected && page.invite.url && page.invite.value) {
                await this.page.goto(page.invite.url);
                // hashpopup menu
                const main = await this.page.waitForSelector(this.SELECTOR.div__container__main);
                await main.waitForSelector(this.SELECTOR.div__button__hashpopup__menu);
                const hashpopupMenuButtons = await main.$$(this.SELECTOR.div__button__hashpopup__menu);
                for (let hashpopupMenuButton of hashpopupMenuButtons) {
                    const label = await hashpopupMenuButton.evaluate(elm => elm.getAttribute("aria-label"));
                    const _label = label && label.trim().toLowerCase();
                    if (_label === this.ARIA_LABEL.profile__setting.trim().toLowerCase()) {
                        await this.scrollToElement(hashpopupMenuButton);
                        await this.delay();
                        await hashpopupMenuButton.click();
                        await this.delay();
                        await this.page.waitForSelector(this.SELECTOR.div__popup__menu);
                        const popupMenu = await this.page.$(this.SELECTOR.div__popup__menu);
                        await popupMenu.waitForSelector(this.SELECTOR.div__popup__menu__item);
                        const menuItems = await popupMenu.$$(this.SELECTOR.div__popup__menu__item);
                        for (let menuItem of menuItems) {
                            const textContent = await menuItem.evaluate(elm => elm.textContent);
                            if (textContent.trim().toLowerCase().includes(this.TEXTCONTENT.menu__item__inviteFriend)) {
                                await menuItem.click();
                                await this.delay();

                                // handle dialog 
                                await this.page.waitForSelector(this.SELECTOR.dialog);
                            }
                        }
                    } else { continue; };
                };
            };

            console.log("handlePageInteract: ", { isFeeds });
            return true;
        } catch (error) {
            console.error("ERROR [handlePageInteract]: ", error);
            return false;
        };
    };
}

module.exports = FacebookInteract;