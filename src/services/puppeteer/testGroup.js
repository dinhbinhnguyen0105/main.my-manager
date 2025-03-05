// testGroup.js
const FacebookGroup = require("./FacebookGroup");
const optionsData = {
    puppeteerOptions: {
        headless: false,
        userDataDir: '/Users/dinhbinh/Dev/electron-project/main.my-manager/browsers/813e40ed-a1b8-4fad-b839-9a1a0a66a569'
    },
    browserOptions: {
        isMobile: false,
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1.1 Safari/605.1.15',
        width: 1280,
        height: 707,
        deviceScaleFactor: 1.482005518081692,
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    },
    proxy: '171.236.167.14:36254:XQrxWn:PeGKEE'
}

const jsonString = JSON.stringify({
    "postGroup": {
        "groupId": "204935893609129",
        "content": {
            "text": {
                "header": "",
                "body": "",
            },
            "images": []
        },
        "isMarketplace": true,
        "shareAnotherGroup": true,
        "anotherGroupNameIncludes": []
    }
})

const setting = JSON.parse(jsonString);
const fbGroup = new FacebookGroup(optionsData, setting);
fbGroup.controller();