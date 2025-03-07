// newFacebook.js

const path = require("path");
const Controller = require("./Controller");

class Facebook extends Controller {
    constructor(options) {
        super(options);
        this.pageLanguage = null;
        this.ARIA_LABEL = {
        };
        this.TEXTCONTENT = {};
        this.SELECTOR = {
            button: "div[role='button']",//
            feeds_all: "a[href='https://www.facebook.com/?filter=all&sk=h_chr']",
            feeds_friend: "a[href='/?filter=friends&sk=h_chr']",
            feeds_group: "a[href='/?filter=groups&sk=h_chr']",
            feeds_page: "a[href='/?filter=groups&sk=h_chr']",
            feed_article: "div[aria-describedby]",//
            main_container: "div[role='main']",//
            tablist: 'div[aria-orientation="horizontal"][role="tablist"]',//
            dialog: "div[role='dialog']",//
            textbox: "div[role='textbox']",//
            div__expandBtn: "div[aria-expanded='false'][role='button']",//
            input__file: "input[type='file']",
            input__text: "input[type='text']",
            input__textarea: "textarea",
            input__location: "input[role='combobox'][type='text']",
            ul__listbox: "ul[role='listbox']",
            li__listbox__option: "li[role='option']",
            label__listbox: "label[aria-haspopup='listbox'][role='combobox']",
            div__listbox: "div[role='listbox']",
            div__listbox__option: "div[role='option']",
            div__checkbox__false: "div[role='checkbox'][aria-checked='false']",
            loadingState: "div[data-visualcompletion='loading-state']",
            div__hashpopup__menu: "div[aria-haspopup='menu'][role='button'][aria-expanded='false']",
            div__popup__menu: "div[role='menu']",
            div__popup__menu__item: "div[role='menuitem']"
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
            await this.page.waitForSelector("div[role='dialog']", { timeout: 15000 });
            this.ARIA_LABEL.close = this.pageLanguage === "vi" ? "đóng" : "close";
            const dialogs = await this.page.$$("div[role='dialog']");
            for (let dialog of dialogs) {
                if (!await this.isElementInteractable(dialog)) { continue; };
                await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 1000 + 3000)));
                await this.page.waitForSelector(this.SELECTOR.button);
                const buttons = await this.page.$$(this.SELECTOR.button);
                for (let button of buttons) {
                    const isCloseBtn = await button.evaluate((elm, ariaLabel) => {
                        const label = elm.getAttribute("aria-label");
                        if (label && label.toLowerCase() === ariaLabel.toLowerCase()) return true;
                        return false;
                    }, this.ARIA_LABEL.close);
                    if (isCloseBtn) {
                        await button.click();
                        return true;
                    };
                };
                return false;
            };
        } catch (error) {
            if (error.name === 'TimeoutError') {
                console.error("Dialog not found.");
                return false;
            } else {
                console.error(error);
                return false;
            }
        };
    };

    async handleLeavePageDialog() {
        this.ARIA_LABEL.dialog__leave__page = this.pageLanguage === "vi" ? "rời khỏi trang?" : "leave page?";
        this.ARIA_LABEL.dialog__leave__page__leaveBtn = this.pageLanguage === "vi" ? "rời khỏi trang" : "leave page";
        this.ARIA_LABEL.close_button = this.pageLanguage === "vi" ? "đóng" : "close";
        try {
            // await this.page.waitForSelector(this.SELECTOR.dialog);
            const dialogs = await this.page.$$(this.SELECTOR.dialog);
            for (let dialog of dialogs) {
                const dialogLabel = await dialog.evaluate(elm => elm.getAttribute("aria-label"));
                const _dialogLabel = dialogLabel && dialogLabel.trim().toLowerCase();
                if (_dialogLabel === this.ARIA_LABEL.dialog__leave__page.trim().toLowerCase()) {
                    await dialog.waitForSelector(this.SELECTOR.button);
                    const buttons = await dialog.$$(this.SELECTOR.button);
                    for (let button of buttons) {
                        const buttonLabel = await button.evaluate(elm => elm.getAttribute("aria-label"));
                        const isDisabled = await button.evaluate(elm => elm.getAttribute("aria-disabled"));
                        if (isDisabled) { continue; };
                        const _buttonLabel = buttonLabel && buttonLabel.trim().toLowerCase();
                        if (_buttonLabel === this.ARIA_LABEL.dialog__leave__page__leaveBtn.trim().toLowerCase()) {
                            await this.delay();
                            await button.click();
                            console.log("Click: ", { _buttonLabel });
                            return true;
                        } else { continue; };
                    };
                } else { continue; };
            };
            return true;
        } catch (error) {
            console.error("ERROR [handleLeavePageDialog]: ", error);
            return false;
        }
    }

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

    async handleInteractLike(articleElm, reaction) {
        this.ARIA_LABEL.button_like = this.pageLanguage === "vi" ? "thích" : "like";
        this.REACTIONS = ["like", "love", "care", "haha", "wow", "sad", "angry",];
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
                    await this.scrollToElement(buttonElm);
                    await this.delay(500, 1000);
                    await buttonElm.hover();
                    const reactionsDialog = await this.getReactionsDialog();
                    if (!reactionsDialog) { return false; };
                    if (typeof reaction === "string") {
                        const buttonIndex = this.REACTIONS.findIndex(r => r.toLowerCase() === reaction.toLowerCase());
                        await reactionsDialog.waitForSelector(this.SELECTOR.button);
                        const _buttons = await reactionsDialog.$$(this.SELECTOR.button);
                        if (buttonIndex > 0 && buttonIndex < _buttons.length) {
                            await this.delay(1000, 3000);
                            await _buttons[buttonIndex].click();
                            console.log(`Clicked [${reaction}]`);
                            await this.delay(2000, 3000);
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

    async handleInteractComment(articleElm, comment) {
        this.ARIA_LABEL.button_comment = this.pageLanguage === "vi" ? "viết bình luận" : "Leave a comment";
        this.ARIA_LABEL.submit_comment = this.pageLanguage === "vi" ? "bình luận" : "comment";
        try {
            await articleElm.waitForSelector(this.SELECTOR.button, { timeout: 60000 });
            let buttons = await articleElm.$$(this.SELECTOR.button);
            for (let button of buttons) {
                const isComment = await button.evaluate((elm, ariaLabel) => {
                    const label = elm.getAttribute("aria-label");
                    if (label && label.toLowerCase() === ariaLabel.toLowerCase()) return true;
                    return false;
                }, this.ARIA_LABEL.button_comment);
                if (isComment) {
                    await this.scrollToElement(button);
                    await button.click();
                    await this.delay(500, 2000);
                    if (await this.handleCloseVisibleDialog()) { return false; };
                    await articleElm.waitForSelector(this.SELECTOR.textbox);
                    const textBox = await articleElm.$(this.SELECTOR.textbox);
                    await textBox.focus();
                    await textBox.type(comment);
                };
            };
            await articleElm.waitForSelector(this.SELECTOR.button, { timeout: 60000 });
            buttons = await articleElm.$$(this.SELECTOR.button);
            for (let button of buttons) {
                const isSubmit = await button.evaluate((elm, ariaLabel) => {
                    const label = elm.getAttribute("aria-label");
                    if (label && label.toLowerCase() === ariaLabel.toLowerCase()) return label;
                    return false;
                }, this.ARIA_LABEL.submit_comment);
                if (isSubmit) {
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

    async handleInteractShare(articleElm, share) {

    }

    async handleFeeds(duration = 300000, reactions, comments, share) {
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
                                await this.scrollToElement(articles[count]);
                                await this.delay(1000, 3000);
                                if (Math.random() < 0.2) {
                                    if (reactions.length > 0) {
                                        const isLiked = await this.handleInteractLike(articles[count], reactions[reactions.length - 1]);
                                        isLiked && reactions.pop();
                                    };
                                    if (comments.length > 0) {
                                        const isCommented = await this.handleInteractComment(articles[count], comments[comments.length - 1]);
                                        isCommented && comments.pop();
                                    };
                                    if (share.length > 0) {
                                        //share
                                    };
                                };
                                count += 1;
                            };
                        };
                    };
                };
            };
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

}

module.exports = Facebook;


//_ this.ARIA_LABEL.button__close = this.pageLanguage === "vi" ? "đóng" : "close";
//_ this.ARIA_LABEL.dialog__leave__page = this.pageLanguage === "vi" ? "rời khỏi trang?" : "leave page?";
//_ this.ARIA_LABEL.dialog__leave__page__leaveBtn = this.pageLanguage === "vi" ? "rời khỏi trang" : "leave page";

//_ this.ARIA_LABEL.dialog__reactions = this.pageLanguage === "vi" ? "cảm xúc" : "reactions";

//_ this.ARIA_LABEL.button__like = this.pageLanguage === "vi" ? "thích" : "like";
//_ this.ARIA_LABEL.button__comment = this.pageLanguage === "vi" ? "viết bình luận" : "Leave a comment";
/// this.ARIA_LABEL.button__submit_comment = this.pageLanguage === "vi" ? "bình luận" : "comment";
//_ this.ARIA_LABEL.feeds_container = this.pageLanguage === "vi" ? "bảng feed" : "feeds";
// this.ARIA_LABEL.group__post__openDialogButton = this.pageLanguage === "vi" ? "dòng thời gian" : "timeline";
//_ this.ARIA_LABEL.group__post__openDialogButton = this.pageLanguage === "vi" ? "trang cá nhân" : "profile";
//_ this.ARIA_LABEL.group__post__dialogName = this.pageLanguage === "vi" ? "tạo bài niêm yết mới" : "create new listing";
// this.ARIA_LABEL.next__button = this.pageLanguage === "vi" ? "tiếp" : "create new listing";
// this.ARIA_LABEL.post_button = this.pageLanguage === "vi" ? "đăng" : "post";
// this.ARIA_LABEL.group__post__dialogName = this.pageLanguage === "vi" ? "tạo bài viết" : "create post";
// this.ARIA_LABEL.pokes = this.pageLanguage === "vi" ? "chọc" : "poke";
// this.ARIA_LABEL.pokes = this.pageLanguage === "vi" ? "chọc" : "poke";
// this.ARIA_LABEL.re_pokes = this.pageLanguage === "vi" ? "chọc lại" : "poke back";

// this.ARIA_LABEL.video_play = this.pageLanguage === "vi" ? "phát" : "play";
// this.ARIA_LABEL.video_pause = this.pageLanguage === "vi" ? "tạm dừng" : "pause";
// this.ARIA_LABEL.button_comment = this.pageLanguage === "vi" ? "viết bình luận" : "Leave a comment";
// this.ARIA_LABEL.video_viewer = this.pageLanguage === "vi" ? "trình xem video" : "video viewer";
// this.ARIA_LABEL.submit_comment = this.pageLanguage === "vi" ? "bình luận" : "comment";
// this.ARIA_LABEL.close_button = this.pageLanguage === "vi" ? "đóng" : "close";
// this.ARIA_LABEL.profile__setting = this.pageLanguage === "vi" ? "xem thêm tùy chọn trong phần cài đặt trang cá nhân" : "profile settings see more options";
// this.ARIA_LABEL.dialog__invite__friend = this.pageLanguage === "vi" ? "mời bạn bè" : "invite friends";