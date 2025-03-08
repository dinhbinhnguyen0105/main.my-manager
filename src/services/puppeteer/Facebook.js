// Facebook.js
const path = require("path");
const Controller = require("./Controller");

class Facebook extends Controller {
    constructor(options) {
        super(options);

        this.ARIA_LABEL = {
            container__main: undefined,
            container__feeds: undefined,

            button__close: undefined,
            button__like: undefined,
            button__comment: undefined,
            button__submitComment: undefined,
            button__timeline: undefined,
            button__profile: undefined,
            button__poke: undefined,
            button__pokeBack: undefined,
            button__videoPlay: undefined,
            button__videoPause: undefined,
            button__profileSetting: undefined,

            dialog__name__reactions: undefined,
            dialog__name__leavePage: undefined,
            dialog__name__createListing: undefined,
            dialog__name__videoViewer: undefined,
            dialog__name__inviteFriend: undefined,
            dialog__leavePage__button__leave: undefined,
            dialog__createListing__button__next: undefined,
            dialog__createListing__button__post: undefined,
        };

        this.SELECTOR = {
            watch__feed__id: "#watch_feed",

            div__container__main: "div[role='main']",
            div__dialog: "div[role='dialog']",
            div__whatHappened: 'div[aria-labelledby][role="dialog"]',
            div__feedArticle: "div[aria-describedby]",
            div__videoArticle: "div[data-virtualized]",

            div__button: "div[role='button']",
            div__button__expand: "div[aria-expanded='false'][role='button']",
            div__button__hashpopup__menu: "div[aria-haspopup='menu'][role='button'][aria-expanded='false']",
            div__textbox: "div[role='textbox']",
            div__tablist: 'div[aria-orientation="horizontal"][role="tablist"]',
            div__popup__menu: "div[role='menu']",
            div__popup__menu__item: "div[role='menuitem']",
            div__video: "div[role='presentation']",

            div__listbox: "div[role='listbox']",
            div__listbox__option: "div[role='option']",
            div__checkbox__false: "div[role='checkbox'][aria-checked='false']",
            div__loadingState: "div[data-visualcompletion='loading-state']",

            input__file: "input[type='file']",
            input__text: "input[type='text']",
            textarea: "textarea",
            input__text__combobox: "input[role='combobox'][type='text']",
            ul__listbox: "ul[role='listbox']",
            li__listbox__option: "li[role='option']",
            label__listbox: "label[aria-haspopup='listbox'][role='combobox']",
        };

        this.TEXTCONTENT = {};
    };

    async checkLogin() {
        try {
            const uid = path.basename(this.puppeteerOptions.userDataDir);
            const loginUrl = "https://www.facebook.com/login";
            await this.page.goto(loginUrl);
            await new Promise(resolve => setTimeout(resolve, 1000));
            const currentUrl = await this.page.url();
            if (currentUrl.includes("home.php")) {
                return true;
            } else {
                console.error(`User is not logged into Facebook in userDataDir: [${uid}]`)
                return false;
            };
        } catch (error) {
            console.error("ERROR [checkLogin]", error);
            await this.cleanup();
            return false;
        };
    };
    async initConstants() {
        try {
            if (!await this.page.url().includes("facebook")) {
                console.error("This website is not affiliated with Facebook.");
                return false;
            };
            const pageLanguage = await this.page.evaluate(() => document.documentElement.lang);
            console.log({ pageLanguage });
            if (pageLanguage.trim() === "vi") {
                this.ARIA_LABEL.container__main = "";
                this.ARIA_LABEL.container__feeds = "bảng feed";
                this.ARIA_LABEL.button__close = "đóng";
                this.ARIA_LABEL.button__like = "thích";
                this.ARIA_LABEL.button__comment = "viết bình luận";
                this.ARIA_LABEL.button__submitComment = "bình luận";
                this.ARIA_LABEL.button__timeline = "dòng thời gian";
                this.ARIA_LABEL.button__profile = "trang cá nhân";
                this.ARIA_LABEL.button__poke = "chọc";
                this.ARIA_LABEL.button__pokeBack = "chọc lại";
                this.ARIA_LABEL.button__videoPlay = "phát";
                this.ARIA_LABEL.button__videoPause = "tạm dừng";
                this.ARIA_LABEL.button__profileSetting = "xem thêm tùy chọn trong phần cài đặt trang cá nhân";
                this.ARIA_LABEL.button__invite = "gửi lời mời";
                this.ARIA_LABEL.dialog__name__reactions = "cảm xúc";
                this.ARIA_LABEL.dialog__name__leavePage = "rời khỏi trang?";
                this.ARIA_LABEL.dialog__name__createListing = "tạo bài niêm yết mới";
                this.ARIA_LABEL.dialog__name__videoViewer = "trình xem video";
                this.ARIA_LABEL.dialog__name__inviteFriend = "mời bạn bè";
                this.ARIA_LABEL.dialog__leavePage__button__leave = "rời khỏi trang";
                this.ARIA_LABEL.dialog__createListing__button__next = "tiếp";
                this.ARIA_LABEL.dialog__createListing__button__post = "đăng";

                this.TEXTCONTENT.menu__item__inviteFriend = "mời bạn bè";
            }
            else if (pageLanguage.trim() === "en") {
                this.ARIA_LABEL.container__main = "";
                this.ARIA_LABEL.container__feeds = "feeds";
                this.ARIA_LABEL.button__close = "close";
                this.ARIA_LABEL.button__like = "like";
                this.ARIA_LABEL.button__comment = "leave a comment";
                this.ARIA_LABEL.button__submitComment = "comment";
                this.ARIA_LABEL.button__timeline = "timeline";
                this.ARIA_LABEL.button__profile = "profile";
                this.ARIA_LABEL.button__poke = "poke";
                this.ARIA_LABEL.button__pokeBack = "poke back";
                this.ARIA_LABEL.button__videoPlay = "play";
                this.ARIA_LABEL.button__videoPause = "pause";
                this.ARIA_LABEL.button__profileSetting = "profile settings see more options";
                this.ARIA_LABEL.button__invite = "send invites";
                this.ARIA_LABEL.dialog__name__reactions = "reactions";
                this.ARIA_LABEL.dialog__name__leavePage = "leave page?";
                this.ARIA_LABEL.dialog__name__createListing = "create new listing";
                this.ARIA_LABEL.dialog__name__videoViewer = "video viewer";
                this.ARIA_LABEL.dialog__name__inviteFriend = "invite friends";
                this.ARIA_LABEL.dialog__leavePage__button__leave = "leave page";
                this.ARIA_LABEL.dialog__createListing__button__next = "next";
                this.ARIA_LABEL.dialog__createListing__button__post = "post";

                this.TEXTCONTENT.menu__item__inviteFriend = "invite friends";
            }
            else {
                console.error("Please switch the language to English or Vietnamese");
                return false;
            };
        } catch (error) {
            console.error("ERROR [initConstants]: ", error);
            return false;
        };
    };
    async closeWhatHappenedDialog() {
        try {
            let timeTry = 0;
            while (timeTry < 5) {
                const whatHappenedDialog = await this.page.$(this.SELECTOR.div__whatHappened);
                if (whatHappenedDialog) {
                    const buttons = await whatHappenedDialog.waitForSelector(this.SELECTOR.div__button);
                    for (let button of buttons) {
                        const buttonName = await button.evaluate(elm => elm.getAttribute("aria-label"));
                        if (!buttonName) { continue; };
                        if (buttonName.trim().toLowerCase() === this.ARIA_LABEL.button__close) {
                            await button.click();
                            return true;
                        };
                    };
                };
                timeTry += 1;
                await new Promise(resolve => setTimeout(resolve, 1000));
            };
            return false;
        } catch (error) {
            if (error.name.includes("TimeoutError")) { return false; }
        }
    };

    async confirmLeavePage() {
        try {
            let timeTry = 0;
            while (timeTry < 5) {
                const dialogs = await this.page.$$(this.SELECTOR.div__dialog);
                for (let dialog of dialogs) {
                    const dialogName = await dialog.evaluate(elm => elm.getAttribute("aria-label"));
                    if (!dialogName) { continue; };
                    if (dialogName.trim().toLowerCase() === this.ARIA_LABEL.dialog__name__leavePage) {
                        await dialog.waitForSelector(this.SELECTOR.div__button);
                        const buttons = await dialog.$$(this.SELECTOR.div__button);
                        for (let button of buttons) {
                            const buttonName = await button.evaluate(elm => elm.getAttribute("aria-label"));
                            const isDisabled = await button.evaluate(elm => elm.getAttribute("aria-disabled"));
                            if (isDisabled || !buttonName) { continue; };
                            if (buttonName.trim().toLowerCase() === this.ARIA_LABEL.dialog__leavePage__button__leave) {
                                await this.delay();
                                await button.click();
                                console.log("Clicked: ", { buttonName });
                                return true;
                            } else { continue; };
                        };
                    };
                };
                timeTry += 1;
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            console.error("ERROR [confirmLeavePage]: Not found leave page dialog");
            return false;
        } catch (error) {
            console.error("ERROR [confirmLeavePage]: ", error);
            return false;
        }
    };

    async getReactionsDialog() {
        try {
            let timeTry = 0;
            while (timeTry < 10) {
                const dialogs = await this.page.$$(this.SELECTOR.div__dialog);
                for (let dialog of dialogs) {
                    const dialogName = await dialog.evaluate(elm => elm.getAttribute("aria-label"));
                    if (!dialogName) { continue; };
                    if (dialogName.trim().toLowerCase() === this.ARIA_LABEL.dialog__name__reactions) { return dialog; };
                };
                timeTry += 1;
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            console.error("ERROR [getReactionsDialog]: Not found reaction dialog");
            return false;
        } catch (error) {
            console.log("ERROR [getReactionsDialog]: ", error);
            return false;
        };
    };

    async interactReaction(article, reaction) {
        const reactions = ["like", "love", "care", "haha", "wow", "sad", "angry",];
        try {
            await article.waitForSelector(this.SELECTOR.div__button, { timeout: 30000 });
            const buttons = await article.$$(this.SELECTOR.div__button);
            for (let button of buttons) {
                const buttonName = await button.evaluate(elm => elm.getAttribute("aria-label"));
                if (!buttonName) { continue; };
                if (buttonName.trim().toLowerCase() === this.ARIA_LABEL.button__like) {
                    await this.scrollToElement(button);
                    await this.delay(500, 1000);
                    await button.hover();
                    const reactionsDialog = await this.getReactionsDialog();
                    if (!reactionsDialog) { return false; };
                    if (typeof reaction === "string") {
                        const buttonIndex = reactions.findIndex(r => r.toLowerCase() === reaction.toLowerCase());
                        await reactionsDialog.waitForSelector(this.SELECTOR.div__button);
                        const _buttons = await reactionsDialog.$$(this.SELECTOR.div__button);
                        if (buttonIndex < _buttons.length) {
                            await this.delay(1000, 3000);
                            await _buttons[buttonIndex].click();
                            console.log(`Clicked [${reaction}]`);
                            await this.delay(2000, 3000);
                            return true;
                        } else { return false; };
                    };
                    return false;
                };
            };
        } catch (error) {
            console.log("ERROR [interactReaction]: ", error);
            return false;
        };
    };

    async interactComment(article, comment) {
        try {
            await article.waitForSelector(this.SELECTOR.div__button, { timeout: 30000 });
            let buttons = await article.$$(this.SELECTOR.div__button);
            for (let button of buttons) {
                const buttonName = await button.evaluate(elm => elm.getAttribute("aria-label"));
                if (buttonName && buttonName.trim().toLowerCase() === this.ARIA_LABEL.button__comment) {
                    await this.scrollToElement(button);
                    await button.click();
                    await this.delay(500, 2000);
                    if (await this.closeWhatHappenedDialog()) { return false; };
                    await article.waitForSelector(this.SELECTOR.div__textbox);
                    const textBox = await article.$(this.SELECTOR.div__textbox);
                    await textBox.focus();
                    await textBox.type(comment);
                    break;
                }
            };
            await article.waitForSelector(this.SELECTOR.div__button, { timeout: 30000 });
            buttons = await article.$$(this.SELECTOR.div__button);
            for (let button of buttons) {
                const buttonName = await button.evaluate(elm => elm.getAttribute("aria-label"));
                if (buttonName && buttonName.trim().toLowerCase() === this.ARIA_LABEL.button__submitComment) {
                    await this.delay(500, 2000);
                    await button.click();
                    await this.delay(500, 2000);
                    console.log(`Submit [${comment}].`);
                    return true;
                };
            };
            return false;
        } catch (err) {
            console.error("handleInteractComment: ", err);
            return false;
        };
    };

    async interactFeed(url, duration = 300000, reactions, comments, share) {
        await this.page.goto(url);
        await this.page.waitForSelector(this.SELECTOR.div__container__main, { timeout: 60000 });
        const mainContainer = await this.page.$(this.SELECTOR.div__container__main);
        if (!mainContainer) { return false; };
        const startTime = Date.now();
        let count = 0;
        while (Date.now() - startTime < duration) {
            await mainContainer.waitForSelector(this.SELECTOR.div__feedArticle);
            const articles = await mainContainer.$$(this.SELECTOR.div__feedArticle);
            // if (articles.length > 0) {
            if (count < articles.length) {
                await this.scrollToElement(articles[count]);
                await this.delay(1000, 3000);
                if (Math.random() < 0.2) {
                    if (reactions.length > 0) {
                        const isLiked = await this.interactReaction(articles[count], reactions[reactions.length - 1]);
                        isLiked && reactions.pop();
                    };
                    if (comments.length > 0) {
                        const isCommented = await this.interactComment(articles[count], comments[comments.length - 1]);
                        isCommented && comments.pop();
                    };
                    if (share.length > 0) {
                        //share
                    };
                };
                count++;
            };
        };
        return true;
    };
}

module.exports = Facebook;