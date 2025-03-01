// user.js
const uuid = require("uuid");
const UserAgent = require("user-agents");
const userId = uuid.v4();
const mobileAgent = new UserAgent({ deviceCategory: "mobile", platform: "iPhone" });
const desktopAgent = new UserAgent({ deviceCategory: "desktop", platform: "MacIntel" });

const user = {
    info: {
        id: userId,
        username: undefined,
        uid: undefined,
        password: undefined,
        twoFA: undefined,
        email: undefined,
        emailPassword: undefined,
        phoneNumber: undefined,
        birthDay: undefined,
        gender: undefined,
        avatar: undefined,
        group: undefined,
        type: undefined,
        note: undefined,
        status: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    browser: {
        name: userId,
        mobile: {
            userAgent: mobileAgent.toString(),
            screenHeight: mobileAgent.data.screenHeight,
            screenWidth: mobileAgent.data.screenWidth,
            viewportHeight: mobileAgent.data.viewportHeight,
            viewportWidth: mobileAgent.data.viewportWidth,
        },
        desktop: {
            userAgent: desktopAgent.toString(),
            screenHeight: desktopAgent.data.screenHeight,
            screenWidth: desktopAgent.data.screenWidth,
            viewportHeight: desktopAgent.data.viewportHeight,
            viewportWidth: desktopAgent.data.viewportWidth,
        },
    },
    actions: {
        isSelected: false,
    }
};

module.exports = user;
