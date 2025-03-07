// facebookInteract.js
const path = require("path");
const FacebookController = require("./Facebook");

class FacebookInteract extends FacebookController {
    constructor(options, interactOptions) {
        super(options);
        this.likeAndComment = interactOptions.likeAndComment;
    };
    async controller() {
        await this.initBrowser();
        if (!await this.checkLogin()) { return false; }
        if (this.likeAndComment.friend.isSelected) { await this.interactFriend(); };
        if (this.likeAndComment.newsFeed.isSelected) { await this.interactNewsFeed(); };
        if (this.likeAndComment.watch.isSelected) { await this.interactWatch(); };
        if (this.likeAndComment.page.isSelected) { await this.interactPage(); };
    };

    async handlePokes(count) {
        if (!count) return false;
        try {
            await this.delay(1000, 5000);
            this.SELECTOR.pokes = this.pageLanguage === "vi" ? "div[aria-label='Chọc']" : "div[aria-label='Poke']";
            this.ARIA_LABEL.pokes = this.pageLanguage === "vi" ? "chọc" : "poke";
            try {
                await this.page.waitForSelector(this.SELECTOR.pokes);
            } catch (error) {
                console.error("ERROR [handlePokes]: ", error);
                return false;
            };
            await this.page.waitForSelector(this.SELECTOR.button);
            let buttons = await this.page.$$(this.SELECTOR.button);
            let pokeButtons = [];
            for (let button of buttons) {
                const isPokeButton = await button.evaluate((elm, ariaLabel) => {
                    const label = elm.getAttribute("aria-label");
                    if (label && label.toLowerCase().includes(ariaLabel.toLowerCase())) return true;
                    return false;
                }, this.ARIA_LABEL.pokes);
                if (isPokeButton) pokeButtons.push(button);
            };
            let pokeButtonCount = pokeButtons.length;
            if (pokeButtonCount > 0) {
                const randomMove = Math.floor(Math.random() * (pokeButtonCount > 5 ? (Math.floor(Math.random() * 5)) : (Math.floor(Math.random() * pokeButtonCount))))
                for (let i = 0; i < randomMove; i++) {
                    await this.scrollToElement(pokeButtons[i]);
                };

                buttons = await this.page.$$(this.SELECTOR.button);
                pokeButtons = [];
                for (let button of buttons) {
                    const isPokeButton = await button.evaluate((elm, ariaLabel) => {
                        const label = elm.getAttribute("aria-label");
                        if (label && label.toLowerCase().includes(ariaLabel.toLowerCase())) return true;
                        return false;
                    }, this.ARIA_LABEL.pokes);
                    if (isPokeButton) pokeButtons.push(button);
                };
                pokeButtonCount = pokeButtons.length;
                const newCount = count > pokeButtonCount ? pokeButtonCount : count;
                for (let i = 0; i < newCount; i++) {
                    const buttonIndex = Math.floor(Math.random() * pokeButtonCount);
                    await this.delay(500, 1500);
                    await this.scrollToElement(pokeButtons[buttonIndex]);
                    await this.delay(500, 1500);
                    await pokeButtons[buttonIndex].click();
                    await this.delay(500, 1500);
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
            await this.delay(1000, 5000);
            this.SELECTOR.pokes = this.pageLanguage === "vi" ? "div[aria-label='Chọc']" : "div[aria-label='Poke']";
            this.ARIA_LABEL.pokes = this.pageLanguage === "vi" ? "chọc" : "poke";
            this.ARIA_LABEL.re_pokes = this.pageLanguage === "vi" ? "chọc lại" : "poke back";

            try {
                await this.page.waitForSelector(this.SELECTOR.pokes);
            } catch (err) {
                console.error("ERROR [handleRePokes]: ", err);
            };
            await this.page.waitForSelector(this.SELECTOR.button);
            const buttons = await this.page.$$(this.SELECTOR.button);
            let rePokeButtons = [];
            for (let button of buttons) {
                const isPokeButton = await button.evaluate((elm, ariaLabel) => {
                    const label = elm.getAttribute("aria-label");
                    const isDisabled = elm.getAttribute("aria-disabled");
                    if (isDisabled === "true") { return false; };
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
                    await this.delay(300, 1000);
                    const buttonIndex = Math.floor(Math.random() * rePokeButtonCount);
                    await this.moveToElement(rePokeButtons[buttonIndex]);
                    await this.delay(300, 1000);
                    await rePokeButtons[buttonIndex].click();
                    await this.delay(300, 1000);
                };
            };
            return true;
        } catch (err) {
            console.error("ERROR [handleRePokes]: ", err);
            return false
        }
    }

    async interactFriend() {
        const friend = this.likeAndComment.friend;
        try {
            const results = {};
            await this.page.goto("https://www.facebook.com/?filter=friends&sk=h_chr");
            const isFeeds = await this.handleFeeds(
                300000,
                friend.like.isSelected && friend.like.value,
                friend.comment.isSelected && friend.comment.value,
                0
            );
            results.isFeeds = isFeeds;
            if (friend.poke.isSelected) {
                await this.page.goto("https://www.facebook.com/pokes");
                const isPoked = await this.handlePokes(friend.poke.isSelected && friend.poke.value);
                results.isPoked = isPoked;
            };
            if (friend.rePoke.isSelected) {
                await this.page.goto("https://www.facebook.com/pokes");
                const isRePoked = await this.handleRePokes(friend.rePoke.isSelected && friend.rePoke.value);
                results.isRePoked = isRePoked;
            };
            console.log("Interact friends: ", results);
            return true;
        } catch (error) {
            console.error("ERROR [interactFriend]: ", error);
            return false;
        };
    };
    async interactNewsFeed() {
        try {
            const newsFeed = this.likeAndComment.newsFeed;
            const results = {};
            await this.page.goto("https://www.facebook.com/?filter=all&sk=h_chr");
            const isNewsFeed = await this.handleFeeds(
                parseInt(newsFeed.value),
                newsFeed.like.isSelected && newsFeed.like.value,
                newsFeed.comment.isSelected && newsFeed.comment.value,
                newsFeed.share.isSelected && newsFeed.share.value,
            );
            results.newsFeed = isNewsFeed;
            console.log("Interact newsFeed: ", results);
            return true;
        } catch (error) {
            console.error("ERROR [interactNewsFeed]: ", error);
            return false;
        };
    };
    async interactWatch() {
        const watch = this.likeAndComment.watch;

        this.SELECTOR.watch_feed = "#watch_feed";
        this.SELECTOR.video_article = "div[data-virtualized]";
        this.SELECTOR.video = "div[role='presentation']"; //hover
        this.ARIA_LABEL.video_play = this.pageLanguage === "vi" ? "phát" : "play";
        this.ARIA_LABEL.video_pause = this.pageLanguage === "vi" ? "tạm dừng" : "pause";
        this.ARIA_LABEL.button_comment = this.pageLanguage === "vi" ? "viết bình luận" : "Leave a comment";
        this.ARIA_LABEL.video_viewer = this.pageLanguage === "vi" ? "trình xem video" : "video viewer";
        this.ARIA_LABEL.submit_comment = this.pageLanguage === "vi" ? "bình luận" : "comment";
        this.ARIA_LABEL.close_button = this.pageLanguage === "vi" ? "đóng" : "close";

        const handleWatch = async (article) => {
            try {
                await this.scrollToElement(article);
                await this.delay();
                const video = await article.waitForSelector(this.SELECTOR.video);
                await this.scrollToElement(video);
                await this.delay();
                await video.hover();
                await this.delay();
                await article.waitForSelector(this.SELECTOR.button);
                const buttons = await article.$$(this.SELECTOR.button);
                for (let button of buttons) {
                    const label = await button.evaluate(elm => elm.getAttribute("aria-label"));
                    if (label && label.trim().toLowerCase() === this.ARIA_LABEL.video_play.trim().toLowerCase()) {
                        await this.delay();
                        await button.click();
                        console.log("Watching ...");
                        return true;
                    } else if (label && label.trim().toLowerCase() === this.ARIA_LABEL.video_pause.trim().toLowerCase()) {
                        console.log("Watching ...");
                        return true;
                    };
                };
                return false;
            } catch (error) {
                console.error("ERROR [handleWatch]: ", error);
                return false;
            }
        };

        const handleCommentToWatch = async (comment, count = 0) => {
            try {
                await this.page.waitForSelector(this.SELECTOR.dialog);
                const dialogs = await this.page.$$(this.SELECTOR.dialog);
                for (let dialog of dialogs) {
                    const label = await dialog.evaluate(elm => elm.getAttribute("aria-label"));
                    if (label && label.trim().toLowerCase() === this.ARIA_LABEL.video_viewer.trim().toLowerCase()) {
                        //type
                        await dialog.waitForSelector(this.SELECTOR.textbox);
                        const textBox = await dialog.$(this.SELECTOR.textbox);
                        await this.delay();
                        await textBox.focus();
                        await this.delay();
                        await textBox.type(comment);
                        // get action buttons
                        await dialog.waitForSelector(this.SELECTOR.button, { timeout: 60000 });
                        const buttons = await dialog.$$(this.SELECTOR.button);
                        const actionButtons = {};
                        for (let button of buttons) {
                            const label = await button.evaluate(elm => elm.getAttribute("aria-label"));
                            const _label = label && label.trim().toLowerCase();
                            if (_label === this.ARIA_LABEL.close_button.trim().toLowerCase()) { actionButtons.close = button; }
                            else if (_label === this.ARIA_LABEL.submit_comment.trim().toLowerCase()) { actionButtons.submit = button; }
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
                if (count > 30) {
                    console.error("ERROR [handleCommentToWatch]: cannot found dialog");
                    return false;
                } else {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    return handleCommentToWatch(comment, count + 1);
                }
            } catch (err) {
                console.error("ERROR [handleCommentToWatch]: ", err);
                return false;
            };
        };

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
                        await videoArticles[videoIndex].waitForSelector(this.SELECTOR.button, { timeout: 60000 });
                        let buttons = await videoArticles[videoIndex].$$(this.SELECTOR.button);
                        for (let button of buttons) {
                            const label = await button.evaluate(elm => elm.getAttribute("aria-label"));
                            const _label = label && label.trim().toLowerCase();
                            if (_label === this.ARIA_LABEL.button_comment) {
                                await this.delay();
                                await this.scrollToElement(button);
                                await this.delay();
                                await button.click();
                                await this.delay(1000, 3000);
                                const isCommented = await handleCommentToWatch(watch.comment.value[watch.comment.value.length - 1]);
                                await new Promise(resolve => setTimeout(resolve, 3000));
                                if (await this.handleLeavePageDialog()) { console.log("Leaved.") };
                                isCommented && watch.comment.value.pop();
                            }
                        }

                        // if (share.length > 0) {
                        //     //share
                        // };
                    };
                    videoWatchedIndex.push(videoIndex);
                };
            }
            console.log("isWatched: ", true);
        } catch (error) {
            console.error("ERROR [interactWatch]: ", error);
            return false;
        };
    };
    async interactGroup() {
        try {
            const group = this.likeAndComment.group;
            const results = {};
            await this.page.goto("https://www.facebook.com/?filter=groups&sk=h_chr");
            const isGroup = await this.handleFeeds(
                parseInt(group.value),
                group.like.isSelected && group.like.value,
                group.comment.isSelected && group.comment.value,
                group.share.isSelected && group.share.value,
            );
            results.group = isGroup;
            console.log("Interact group: ", results);
            return true;
        } catch (error) {
            console.error("ERROR [interactGroup]: ", error);
            return false;
        };
    };
    async interactPage() {
        try {
            const page = this.likeAndComment.page;
            const results = {};
            if (page.isSelected) {
                await this.page.goto("https://www.facebook.com/?filter=pages&sk=h_chr");
                const isPage = await this.handleFeeds(
                    parseInt(page.value),
                    page.like.isSelected && page.like.value,
                    page.comment.isSelected && page.comment.value,
                    page.share.isSelected && page.share.value,
                );
                results.page = isPage;
            }

            //like in page
            // const main = document.querySelector("div[role='main']");
            // const articles = main.querySelectorAll('div[aria-labelledby]');
            // articles[0].querySelectorAll("div[data-ad-preview='message']") => not reel


            //invite
            // aria-label="Mời bạn bè"  ||  aria-label="Invite friends"
            this.ARIA_LABEL.profile__setting = this.pageLanguage === "vi" ? "xem thêm tùy chọn trong phần cài đặt trang cá nhân" : "profile settings see more options";
            this.ARIA_LABEL.dialog__invite__friend = this.pageLanguage === "vi" ? "mời bạn bè" : "invite friends";
            this.TEXTCONTENT.menu__item__inviteFriend = this.pageLanguage === "vi" ? "mời bạn bè" : "invite friends";
            if (page.invite.isSelected && page.invite.url && page.invite.value) {
                await this.page.goto(page.invite.url);
                // hashpopup menu
                const main = await this.page.waitForSelector(this.SELECTOR.main_container);
                await main.waitForSelector(this.SELECTOR.div__hashpopup__menu);
                const hashpopupMenuButtons = await main.$$(this.SELECTOR.div__hashpopup__menu);
                for (let hashpopupMenuButton of hashpopupMenuButtons) {
                    const label = await hashpopupMenuButton.evaluate(elm => elm.getAttribute("aria-label"));
                    const _label = label && label.trim().toLowerCase();
                    if (_label === this.ARIA_LABEL.profile__setting.trim().toLowerCase()) {
                        await this.scrollToElement(hashpopupMenuButton);
                        await this.delay();
                        await hashpopupMenuButton.click();
                        await this.page.waitForSelector(this.SELECTOR.div__popup__menu);
                        const popupMenu = await this.page.$(this.SELECTOR.div__popup__menu);
                        await popupMenu.waitForSelector(this.SELECTOR.div__popup__menu__item);
                        const menuItems = await popupMenu.$$(this.SELECTOR.div__popup__menu__item);
                        for (let menuItem of menuItems) {
                            const textContent = await menuItem.evaluate(elm => elm.textContent);
                            if (textContent.trim().toLowerCase().includes(this.TEXTCONTENT.menu__item__inviteFriend)) {
                                await menuItem.click();
                                await this.page.waitForSelector(this.SELECTOR.dialog);

                            }
                        }
                    } else { continue; };
                };
            };
            // aria-label="Profile settings see more options"
            // aria-label="Xem thêm tùy chọn trong phần cài đặt trang cá nhân"
            // aria-haspopup="menu" role="button"   aria-expanded="false"
            // div[role='menu']
            // div role='menuitem'
            // div role='dialog' aria-label='Mời bạn bè'
            // div role='checkbox' aria-checked='false'
            // div role='button' aria-label='Gửi lời mời'
            console.log("Interact page: ", results);
            return true;
        } catch (error) {
            console.error("ERROR [interactPage]: ", error);
            return false;
        };
    };
    async interactMarketplace() {

    };
    async interactNotification() {

    };
    async interactSearch() {

    };
}

module.exports = FacebookInteract;