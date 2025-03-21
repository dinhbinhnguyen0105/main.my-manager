// user.js
// const uuid = require("uuid");
const { v4: uuidv4 } = require('uuid');
const UserAgent = require("user-agents");

const initUserModel = () => {
    const userId = uuidv4();
    const mobileAgent = new UserAgent({ deviceCategory: "mobile", platform: "iPhone" });
    const desktopAgent = new UserAgent({
        deviceCategory: "desktop",
        platform: "MacIntel",
        viewportWidth: { min: 1280 }
    });

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

    return user;
}
module.exports = initUserModel;