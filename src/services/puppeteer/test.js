const FacebookInteract = require("./FacebookInteract");

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
    "likeAndComment": {
        "isSelected": true,
        "friend": {
            "isSelected": true,
            "isOnline": false,
            "like": {
                "isSelected": false,
                "value": []
            },
            "comment": {
                "isSelected": false,
                "value": []
            },
            "poke": {
                "isSelected": false,
                "value": 0
            },
            "rePoke": {
                "isSelected": false,
                "value": 0
            }
        },
        "newsFeed": {
            "isSelected": false,
            "value": "",
            "like": {
                "isSelected": false,
                "value": []
            },
            "share": {
                "isSelected": false,
                "value": 0
            },
            "comment": {
                "isSelected": false,
                "value": []
            }
        },
        "watch": {
            "isSelected": false,
            "value": 0,
            "like": {
                "isSelected": false,
                "value": []
            },
            "share": {
                "isSelected": false,
                "value": 0
            },
            "comment": {
                "isSelected": false,
                "value": []
            }
        },
        "group": {
            "isSelected": false,
            "value": 0,
            "like": {
                "isSelected": false,
                "value": []
            },
            "share": {
                "isSelected": false,
                "value": 0
            },
            "comment": {
                "isSelected": false,
                "value": []
            }
        },
        "page": {
            "isSelected": false,
            "value": 0,
            "like": {
                "isSelected": false,
                "value": []
            },
            "share": {
                "isSelected": false,
                "value": 0
            },
            "comment": {
                "isSelected": false,
                "value": []
            },
            "invite": {
                "isSelected": false,
                "value": 0,
                "url": ""
            }
        },
        "marketplace": {
            "isSelected": false,
            "value": 0
        },
        "notification": {
            "isSelected": false,
            "value": 0
        },
        "search": {
            "isSelected": false,
            "value": 0
        }
    }
})

const setting = JSON.parse(jsonString)

const fbInteract = new FacebookInteract(optionsData, setting);
fbInteract.controller();
