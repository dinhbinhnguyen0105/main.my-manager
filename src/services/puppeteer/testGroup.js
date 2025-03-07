// testGroup.js
const FacebookGroup = require("./FacebookGroup");
const getProxy = require("../../utils/getProxy");
(async () => {
    const proxy = await getProxy('https://proxyxoay.shop/api/get.php?key=sQBwTdoTZdAbuwOXhTqGUA&&nhamang=random&&tinhthanh=0');

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

        // proxy: 'https://proxyxoay.shop/api/get.php?key=sQBwTdoTZdAbuwOXhTqGUA&&nhamang=random&&tinhthanh=0',
        proxy: proxy,
        // proxy: '171.236.167.14:36254:XQrxWn:PeGKEE'
    }

    const jsonString = JSON.stringify({
        "postGroup": {
            "groupId": "204935893609129",
            "content": {
                "text": {
                    "header": "CHO THUÊ NHÀ TRUNG TÂM PHƯỜNG 4",
                    "body": "Cho thuê nhà Phường 4\n- Gồm 1 trệt, 1 lầu - 1pk, 1 bếp, 3pn, 2wc (không NT)\n+ Nhà mới, sạch sẽ, gọn gàng, bancol thông thoáng\n+ Nhà ngay trung tâm, sạch sẽ, không nội thất, khu vực an ninh, gần tất cả các tiện ích xã hội, trường cao đẳng nghề\n+ Cọc 1 đóng 2\nGiá 7.2triệu/tháng\nLH: 0375 155 525\nID: RE.R.022825.57",
                },
                "images": [
                    "/Users/dinhbinh/Workspace/mymanager-v2/bin/db/products/real-estate/images/re.r.022825.57/re.r.022825.57_0.jpg",
                    "/Users/dinhbinh/Workspace/mymanager-v2/bin/db/products/real-estate/images/re.r.022825.57/re.r.022825.57_1.jpg",
                    "/Users/dinhbinh/Workspace/mymanager-v2/bin/db/products/real-estate/images/re.r.022825.57/re.r.022825.57_2.jpg",
                    "/Users/dinhbinh/Workspace/mymanager-v2/bin/db/products/real-estate/images/re.r.022825.57/re.r.022825.57_3.jpg",
                    "/Users/dinhbinh/Workspace/mymanager-v2/bin/db/products/real-estate/images/re.r.022825.57/re.r.022825.57_4.jpg",
                ],
                "location": "đà lạt",
            },
            "isMarketplace": true,
            "shareAnotherGroup": {
                "isSelected": true,
                "keywords": ["thuê", "sang"]
            }
        }
    })

    const setting = JSON.parse(jsonString);
    const fbGroup = new FacebookGroup(optionsData, setting);
    fbGroup.controller();
})();