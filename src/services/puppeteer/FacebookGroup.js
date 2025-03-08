const path = require("path");
const FacebookController = require("./Facebook");

class FacebookGroup extends FacebookController {
    constructor(options, groupOptions) {
        super(options);
        this.postGroupOptions = groupOptions.postGroup;
        this.postContent = this.postGroupOptions.content;
        this.postContent.images = this.postContent.images.map(img => img.trim());
    };
    async controller() {

        await this.initBrowser();
        // if (!await this.checkLogin()) { return false; }
        return;
        await this.postGroup();

        // await this.cleanup();
    };
    async postGroup() {
        await this.page.goto(`https://www.facebook.com/groups/${this.postGroupOptions.groupId}`);
        // await this.page.evaluate(() => {
        //     window.scrollTo({
        //         top: 0,
        //         left: 0,
        //         behavior: 'smooth',
        //     });
        // });
        await new Promise(resolve => setTimeout(resolve, 3000));

        const pageLanguage = await this.page.evaluate(() => {
            return document.documentElement.lang;
        });
        this.pageLanguage = pageLanguage;
        if (this.pageLanguage.trim() !== "vi" && this.pageLanguage.trim() !== "en") {
            console.error("Please switch the language to English or Vietnamese");
            return false;
        };
        this.ARIA_LABEL.group__post__openDialogButton = this.pageLanguage === "vi" ? "dòng thời gian" : "timeline";
        this.ARIA_LABEL.group__post__dialogName = this.pageLanguage === "vi" ? "tạo bài niêm yết mới" : "create new listing";
        this.ARIA_LABEL.next__button = this.pageLanguage === "vi" ? "tiếp" : "create new listing";
        this.ARIA_LABEL.post_button = this.pageLanguage === "vi" ? "đăng" : "post";

        try {
            await this.page.waitForSelector(this.SELECTOR.main_container);
            const mainElm = await this.page.$(this.SELECTOR.main_container);
            await mainElm.waitForSelector(this.SELECTOR.tablist);
            const tabListElm = await mainElm.$(this.SELECTOR.tablist);
            await tabListElm.waitForSelector("a");
            const linkElms = await tabListElm.$$("a");
            const hrefs = await Promise.all(linkElms.map(async elm => await elm.evaluate(_elm => _elm.href)));
            const isMarketplaceGroup = hrefs.find(href => href.includes("buy_sell_discussion"));

            if (isMarketplaceGroup && this.postGroupOptions.isMarketplace) {
                console.log("[marketplace]");

                //delay
                if (!await this.clickOpenDialogButton()) { return false; };
                const dialog = await this.prepareNewListingDialog();
                if (!dialog) { return false; };
                if (! await this.fillNewListingDialog(dialog)) { return false; };

                if (this.postGroupOptions.shareAnotherGroup.isSelected) {
                    await this.shareAnotherGroup(dialog);
                }


            } else if (!isMarketplaceGroup && !this.postGroupOptions.isMarketplace) {
                // error
                //discussion
                console.log("discussion");
                this.ARIA_LABEL.group__post__openDialogButton = this.pageLanguage === "vi" ? "trang cá nhân" : "profile";
                this.ARIA_LABEL.group__post__dialogName = this.pageLanguage === "vi" ? "tạo bài viết" : "create post";
                await this.clickOpenDialogButton();

            } else {
                console.error(`Group with ID: ${this.postGroupOptions.groupId} is not marketplace group.`);
                return false;
            };
        } catch (err) {
            console.error(err);
        };
    };

    async clickOpenDialogButton() {
        try {
            const mainElm = await this.page.waitForSelector(this.SELECTOR.main_container);
            const linkElm = await this.waitElementWithAttributeValue(mainElm, "a", "aria-label", this.ARIA_LABEL.group__post__openDialogButton);
            const block1Handle = await linkElm.evaluateHandle(elm => elm.closest('.html-div'));
            const openDialogBtnElm = await block1Handle.$(this.SELECTOR.button);
            if (!openDialogBtnElm) return false;
            await openDialogBtnElm.click();
            return true;
        } catch (error) {
            console.error("ERROR [clickOpenDialogButton]: ", error);
            return false;
        };
    };

    async prepareNewListingDialog() {
        try {
            const dialog = await this.waitElementWithAttributeValue(this.page, "div", "aria-label", this.ARIA_LABEL.group__post__dialogName);
            if (!dialog) { return false; }
            const buttonInDialogs = await this.waitElements(dialog, this.SELECTOR.button);
            await buttonInDialogs[1].click();
            const expandBtn = await dialog.waitForSelector(this.SELECTOR.div__expandBtn);
            await expandBtn.click();
            const dialogLabel = await dialog.evaluate(elm => elm.getAttribute("aria-label"));
            console.log("Dialog label: ", dialogLabel);
            return dialog;
        } catch (error) {
            console.error("ERROR [prepareNewListingDialog]: ", error);
            return false;
        }
    }

    async fillNewListingDialog(dialog) {
        const fillLocation = async (dialog, count = 0) => {
            try {
                const locationElm = await dialog.waitForSelector(this.SELECTOR.input__location);
                await this.delay();
                await locationElm.focus();
                if (process.platform === "darwin") {
                    await this.delay();
                    await this.page.keyboard.down('Meta');
                    await this.page.keyboard.press('a');
                    await this.page.keyboard.up('Meta');
                    await this.delay();
                    await this.page.keyboard.press('Backspace');
                } else {
                    await this.delay();
                    await this.page.keyboard.down('Control');
                    await this.page.keyboard.press('a');
                    await this.page.keyboard.up('Control');
                    await this.delay();
                    await this.page.keyboard.press('Backspace');
                }
                await this.delay();
                await locationElm.type(this.postContent.location);
                const listbox = await this.page.waitForSelector(this.SELECTOR.ul__listbox);
                const option = await listbox.waitForSelector(this.SELECTOR.li__listbox__option);
                await this.delay();
                await option.click();
                return true;
            } catch (error) {
                console.log("ERROR [fill location]: ", error);
                const _label = await dialog.evaluate(elm => elm.getAttribute("aria-label"));
                await this.closeAnonymousDialogs(_label);
                if (count > 10) return false;
                return await fillLocation(dialog, count + 1);
            };
        };
        const fillTitleAndPrice = async (dialog, count = 0) => {
            try {
                const inputElms = await this.waitElements(dialog, this.SELECTOR.input__text);
                await this.delay();
                await inputElms[0].focus();
                await this.delay();
                await inputElms[0].type(this.postContent.text.header);
                // await this.typeToElement(inputElms[0], this.postContent.text.header);
                await this.delay();
                await inputElms[1].focus();
                await this.delay();
                await inputElms[1].type("0");
                // await this.typeToElement(inputElms[1], "0");
                return true;
            } catch (error) {
                console.log("ERROR [fillTitleAndPrice]: ", error);
                const _label = await dialog.evaluate(elm => elm.getAttribute("aria-label"));
                await this.closeAnonymousDialogs(_label);
                if (count > 10) return false;
                return await fillTitleAndPrice(dialog, count + 1);
            };
        };
        const fillDescription = async (dialog, count = 0) => {
            try {
                // input__textarea
                const description = await this.page.waitForSelector(this.SELECTOR.input__textarea);
                await this.delay();
                await description.focus();
                await description.type(this.postContent.text.body);
                // await this.typeToElement(description, this.postContent.text.body);
                return true;
            } catch (error) {
                console.log("ERROR [fillDescription]: ", error);
                const _label = await dialog.evaluate(elm => elm.getAttribute("aria-label"));
                await this.closeAnonymousDialogs(_label);
                if (count > 10) return false;
                return await fillDescription(dialog, count + 1);
            };
        };
        const fillCondition = async (dialog, count = 0) => {
            try {
                // label__listbox
                const condition = await dialog.waitForSelector(this.SELECTOR.label__listbox);
                await this.delay();
                await condition.click();
                const conditionPopup = await this.page.waitForSelector(this.SELECTOR.div__listbox);
                const optionPopup = await conditionPopup.waitForSelector(this.SELECTOR.div__listbox__option);
                await this.delay();
                await optionPopup.click();
                return true;
            } catch (error) {
                console.log("ERROR [fillCondition]: ", error);
                const _label = await dialog.evaluate(elm => elm.getAttribute("aria-label"));
                await this.closeAnonymousDialogs(_label);
                if (count > 10) return false;
                return await fillCondition(dialog, count + 1);
            };
        };
        const fillImages = async (dialog, count = 0) => {
            try {
                const imageInput = await dialog.waitForSelector(this.SELECTOR.input__file);
                await imageInput.uploadFile(...this.postContent.images);
                return true;
            } catch (error) {
                console.log("ERROR [fillImages]: ", error);
                const _label = await dialog.evaluate(elm => elm.getAttribute("aria-label"));
                await this.closeAnonymousDialogs(_label);
                if (count > 10) return false;
                return await fillImages(dialog, count + 1);
            };
        };
        const waitImageLoaded = async (dialog, count = 0) => {
            try {
                if (count > 60) return false;
                const loadings = await dialog.$$(this.SELECTOR.loadingState);
                if (loadings.length > 0) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    return waitImageLoaded(dialog, count + 1);
                } else { return true; };
            } catch (error) {
                console.log("ERROR [waitImageLoaded]: ", error);
                return false;
            };
        };
        const clickNext = async (dialog, count = 0) => {
            try {
                const buttons = await dialog.$$(this.SELECTOR.button);
                const nextButton = buttons[buttons.length - 1];
                const isDisabled = await nextButton.evaluate(elm => elm.getAttribute("aria-disabled"));
                if (isDisabled) { return false; };
                await nextButton.click();
                return true;
            } catch (error) {
                console.log("ERROR [clickNext]: ", error);
                const _label = await dialog.evaluate(elm => elm.getAttribute("aria-label"));
                await this.closeAnonymousDialogs(_label);
                if (count > 10) return false;
                return await clickNext(dialog, count + 1);
            };
        };

        if (! await fillTitleAndPrice(dialog)) { return false; };
        await this.delay();
        if (! await fillDescription(dialog)) { return false; };
        await this.delay();
        if (! await fillCondition(dialog)) { return false; };
        await this.delay();
        if (! await fillLocation(dialog)) { return false; };
        await this.delay();
        if (! await fillImages(dialog)) { return false; };
        await this.delay();
        if (! await waitImageLoaded(dialog)) { return false; };
        if (! await clickNext(dialog)) { return false; };
        return true;
    }
    // this.ARIA_LABEL.next__button
    // this.ARIA_LABEL.post_button
    async shareAnotherGroup(dialog) {
        const waitPostButton = async (dialog, count = 0) => {
            try {
                // Lấy tất cả các button từ dialog dựa trên selector
                const buttons = await dialog.$$(this.SELECTOR.button);
                let postButton = null;

                // Duyệt qua các button để tìm postButton theo aria-label
                for (const button of buttons) {
                    const label = await button.evaluate(elm => elm.getAttribute("aria-label"));
                    if (label && label.trim().toLowerCase().includes(this.ARIA_LABEL.post_button)) {
                        postButton = button;
                        break;
                    }
                }

                if (!postButton) {
                    if (count > 30) {
                        console.error("ERROR [shareAnotherGroup]: postButton not found");
                        return false;
                    }
                    else {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        return waitPostButton(dialog, count + 1);

                    };
                }

                // Kiểm tra xem postButton có visible hay không
                const isVisible = await postButton.evaluate(elm => {
                    const computedStyle = window.getComputedStyle(elm);
                    const isHiddenByStyle =
                        computedStyle.display === 'none' ||
                        computedStyle.visibility === 'hidden' ||
                        elm.offsetWidth === 0 ||
                        elm.offsetHeight === 0;
                    const isHiddenByAria = elm.closest('[aria-hidden="true"]');
                    return !isHiddenByStyle && !isHiddenByAria;
                });

                if (!isVisible) {
                    if (count > 30) {
                        console.error("ERROR [shareAnotherGroup]: postButton not visible");
                        return false;
                    }
                    else {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        return waitPostButton(dialog, count + 1);

                    };
                };
                return postButton;
            } catch (error) {
                console.error("ERROR [shareAnotherGroup]: ", error);
                return false;
            }
        };
        try {
            // await new Promise(resolve => setTimeout(resolve, 2000));

            const isPostButtonDisplay = await waitPostButton(dialog);
            const checkboxHandle = await dialog.evaluateHandle((dialog, selector) => {
                const nodeList = dialog.querySelectorAll(selector);
                const elms = Array.from(nodeList);
                const checkbox = elms.filter(elm => {
                    const computedStyle = window.getComputedStyle(elm);
                    const isHiddenByStyle = computedStyle['display'] === 'none' || computedStyle['visibility'] === 'hidden' || elm.offsetWidth === 0 || elm.offsetHeight === 0;
                    const isHiddenByAria = elm.closest('[aria-hidden="true"]');
                    if (!isHiddenByAria && !isHiddenByStyle) { return true; }
                });
                return checkbox;
            }, this.SELECTOR.div__checkbox__false);
            const elementHandles = [];
            const properties = await checkboxHandle.getProperties();
            for (const property of properties.values()) {
                const element = property.asElement();
                if (element) elementHandles.push(element);
            };

            if (this.postGroupOptions.shareAnotherGroup.keywords.length > 0) {
                for (let elm of elementHandles) {
                    const textContent = await elm.evaluate(_elm => _elm.textContent);
                    const isIncludes = this.postGroupOptions.shareAnotherGroup.keywords.some(keyword => textContent.includes(keyword));
                    if (isIncludes) {
                        await elm.click();
                    };
                }
            } else {
                for (let elm of elementHandles) {
                    await elm.click();
                }
            };
            await isPostButtonDisplay.click();
        } catch (error) {
            console.log("ERROR [shareAnotherGroup]: ", error);
            return false;
        }
    }

    async closeAnonymousDialogs(label) {
        try {
            const dialogs = await this.page.$$(this.SELECTOR.dialog);
            while (dialogs.length > 0) {
                const dialog = dialogs.pop();
                const _label = await dialog.evaluate(elm => elm.getAttribute("aria-label"));
                if (_label.toLowerCase().includes(label.toLowerCase())) { return true; }
                else {
                    const closeBtn = await this.waitElementWithAttributeValue(dialog, "div", "aria-label", "close");
                    if (!closeBtn) { return false; };
                    await closeBtn.click();
                };
            };
            return false;
        } catch (error) {
            console.error("ERROR [closeAnonymousDialogs]: ", error);
            return false;
        };
    };

    async waitElementWithAttributeValue(containerElm, htmlTagName, attribute, value, count = 0) {
        try {
            const elms = await containerElm.$$(`${htmlTagName}[${attribute}]`);
            for (let elm of elms) {
                const attributeValue = await elm.evaluate((_elm, attribute) => _elm.getAttribute(attribute), attribute);
                if (attributeValue && attributeValue.toLowerCase().includes(value.toLowerCase())) { return elm; };
            };
            await new Promise(resolve => setTimeout(resolve, 1000));
            if (count > 30) {
                console.error("ERROR [waitElementWithAttributeValue]: not found elm");
                return false;
            }
            else { return await this.waitElementWithAttributeValue(containerElm, htmlTagName, attribute, value, count + 1); };
        } catch (error) {
            console.error("ERROR [waitElementWithAttributeValue]: ", error);
            return false;
        };
    };

    async waitElements(containerElm, selector, elementCount = 2, count = 0) {
        try {
            const elms = await containerElm.$$(selector);
            if (elms.length < elementCount) {
                if (count > 30) { return false; };
                await new Promise(resolve => setTimeout(resolve, 1000));
                return await this.waitElements(containerElm, selector, elementCount, count + 1);
            } else { return elms; };
        } catch (error) {
            console.error("ERROR [waitElements]: ", error);
            return false;
        }
    };

}

module.exports = FacebookGroup;