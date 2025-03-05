const path = require("path");
const FacebookController = require("./Facebook");

class FacebookGroup extends FacebookController {
    constructor(options, groupOptions) {
        super(options);
        this.postGroupOptions = groupOptions.postGroup;
    };
    async controller() {
        await this.initBrowser();
        // if (!await this.checkLogin()) { return false; }

        await this.postGroup();
    };
    async postGroup() {
        await this.page.goto(`https://www.facebook.com/groups/${this.postGroupOptions.groupId}`);

        const pageLanguage = await this.page.evaluate(() => {
            return document.documentElement.lang;
        });
        this.pageLanguage = pageLanguage;
        if (this.pageLanguage.trim() !== "vi" && this.pageLanguage.trim() !== "en") {
            console.error("Please switch the language to English or Vietnamese");
            return false;
        };

        this.SELECTOR.tablist = 'div[aria-orientation="horizontal"][role="tablist"]';
        this.ARIA_LABEL.create_listing_dialog = this.pageLanguage === "vi" ? "tạo bài niêm yết mới" : "create new listing";

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
                //marketplace
                console.log("marketplace: ", this.page.url());
                this.ARIA_LABEL.timeline = this.pageLanguage === "vi" ? "dòng thời gian" : "timeline";
                const waitForTimeLine = async (count = 0) => {
                    try {
                        const linkElms = await mainElm.$$("a");
                        for (let linkElm of linkElms) {
                            const label = await linkElm.evaluate(elm => elm.getAttribute("aria-label"));
                            if (label && label.toLowerCase().includes(this.ARIA_LABEL.timeline)) { return linkElm; };
                        }
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        if (count > 30) { return false; }
                        else { return await waitForTimeLine(count + 1); };
                    } catch (error) {
                        console.error(error);
                        return false;
                    }
                };

                const waitForCreateListingDialog = async (count = 0) => {
                    try {
                        const dialogs = await this.page.$$(this.SELECTOR.dialog);
                        for (let dialog of dialogs) {
                            const label = await dialog.evaluate(elm => elm.getAttribute("aria-label"));
                            if (label && label.toLowerCase().includes(this.ARIA_LABEL.create_listing_dialog)) { return dialog; };
                        };
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        if (count > 30) { return false; }
                        else { return await waitForCreateListingDialog(count + 1); };
                    } catch (error) {
                        console.error(error);
                        return false;
                    };
                };

                const waitForButtonInCreateListingDialog = async (dialog, buttonCount = 2, count = 0) => {
                    try {
                        const buttons = await dialog.$$(this.SELECTOR.button);
                        if (buttons.length < 2) {
                            await new Promise(resolve => setTimeout(resolve, 1000));
                            return await waitForButtonInCreateListingDialog(dialog, buttonCount, count + 1);
                        } else {
                            return
                        }
                    } catch (error) {
                        console.error(error);
                        return false;
                    }
                }

                const timelineElm = await waitForTimeLine();
                const block1Handle = await timelineElm.evaluateHandle(elm => elm.closest('.html-div'));
                const openDialogBtnElm = await block1Handle.$(this.SELECTOR.button);
                await openDialogBtnElm.click();
                const createListingDialog = await waitForCreateListingDialog();



            } else if (!isMarketplaceGroup && !this.postGroupOptions.isMarketplace) {
                //discussion
                console.log("discussion");
                this.ARIA_LABEL.profile = this.pageLanguage === "vi" ? "trang cá nhân" : "profile";
            } else {
                console.error(`Group with ID: ${this.postGroupOptions.groupId} is not marketplace group.`);
                return false;
            };

            // const profileUrlElm = await this.waitForElement(mainElm);
            // const containerElm = await profileUrlElm.evaluate((elm, selector) => elm.closest(selector), this.SELECTOR.div_block);
            // const buttonElm = await containerElm.$(this.SELECTOR.button);
            // await buttonElm.click();
        } catch (err) {
            console.error(err);
        }


        // > <aria-label="Trang cá nhân" || aria-label="Profile"  => discussion, aria-label="Dòng thời gian của DinhBinh Nguyen" || aria-label="DinhBinh Nguyen's Timeline" => buy_sell>
        // > <.html-div>
        // > [role="button"]
        // >aria-label="Create new listing" dialog || aria-label="Create post", aria-label="Tạo bài niêm yết mới" ||aria-label="Tạo bài viết"

        // aria-label="Sell Something"
    }



    async handleClickElement(callback, count = 0) {
        // callback = elm.click()
        try {
            callback();
        } catch (error) {
            if (
                error.message.includes('Node is either not visible or not an HTMLElement') ||
                error.message.includes('Element is not attached to the DOM')
            ) {
                console.error('Element not found or not visible:', error);
                return false;
            } else {
                console.error('Error clicking element:', error);

            }
        }
    };
}

module.exports = FacebookGroup;