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
            "isSelected": false,
            "isOnline": false,
            "like": {
                "isSelected": true,
                "value": ["like", "like", "love"]
            },
            "comment": {
                "isSelected": true,
                "value": ["♥️♥️♥️", "❤️❤️❤️"]
            },
            "poke": {
                "isSelected": true,
                "value": 2
            },
            "rePoke": {
                "isSelected": true,
                "value": 2
            }
        },
        "newsFeed": {
            "isSelected": false,
            "value": "300000",
            "like": {
                "isSelected": true,
                "value": ["like", "like", "love"]
            },
            "share": {
                "isSelected": false,
                "value": 0
            },
            "comment": {
                "isSelected": true,
                "value": ["♥️♥️♥️", "❤️❤️❤️"]
            }
        },
        "watch": {
            "isSelected": false,
            "value": "300000",
            "like": {
                "isSelected": true,
                "value": ["like", "like", "love"]
            },
            "share": {
                "isSelected": false,
                "value": 0
            },
            "comment": {
                "isSelected": true,
                "value": ["♥️♥️♥️", "❤️❤️❤️"]
            }
        },
        "group": {
            "isSelected": false,
            "value": "300000",
            "like": {
                "isSelected": true,
                "value": ["like", "like", "love"]
            },
            "share": {
                "isSelected": false,
                "value": 0
            },
            "comment": {
                "isSelected": true,
                "value": ["♥️♥️♥️", "❤️❤️❤️"]
            }
        },
        "page": {
            "isSelected": false,
            "value": "1",
            "like": {
                "isSelected": false,
                "value": ["like", "like", "love"]
            },
            "share": {
                "isSelected": false,
                "value": 0
            },
            "comment": {
                "isSelected": false,
                "value": ["♥️♥️♥️", "❤️❤️❤️"]
            },
            "invite": {
                "isSelected": true,
                "value": 3,
                "url": "https://www.facebook.com/kb.readlestate"
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
