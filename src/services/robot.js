// robot.js
const path = require("path");
const fs = require("fs");
const initRobotModel = require("../model/robot");
const { handleGetUser } = require("./user");
const { handleListSetting } = require("./setting");
const getProxy = require("../utils/getProxy");
const prepareOptionPuppeteer = require("../utils/prepareOptionPuppeteer");
const FacebookInteract = require("./puppeteer/FacebookInteract");

const robotConfigPath = path.resolve(__dirname, "..", "db", "robots.json");
if (!fs.existsSync(robotConfigPath)) { fs.writeFileSync(robotConfigPath, JSON.stringify(initRobotModel()), { encoding: "utf8" }) };

const handleGetRobotInteractConfig = () => {
    return new Promise((resolve, reject) => {
        try {
            const rawRobotDB = fs.readFileSync(robotConfigPath, { encoding: "utf8" });
            const robotDB = JSON.parse(rawRobotDB);
            const robotInteractDB = robotDB.interact;
            resolve({
                data: robotInteractDB,
                message: "Successfully retrieved data from the database [users]",
                statusCode: 200,
            });
        } catch (err) {
            reject({
                statusCode: 500,
                message: err.toString,
            });
        };
    });
};
const handleUpdateRobotInteractConfig = (robotInteractConfigPayload) => {
    return new Promise((resolve, reject) => {
        try {
            const rawRobotDB = fs.readFileSync(robotConfigPath, { encoding: "utf8" });
            const robotDB = JSON.parse(rawRobotDB);
            const newRobotDB = {
                ...robotDB,
                interact: robotInteractConfigPayload
            }
            fs.writeFileSync(robotConfigPath, JSON.stringify(newRobotDB), { encoding: "utf8" });
            resolve({
                data: null,
                message: `Successfully updated robot interact config`,
                statusCode: 200,
            })
        } catch (err) {
            reject({
                statusCode: 500,
                message: err.toString(),
            });
        };
    });
};
const handleRunRobotInteract = (userIds, robotInteractConfigPayload) => {
    return new Promise(async (resolve, reject) => {
        try {
            for (let userId of userIds) {
                const userData = await handleGetUser(userId);
                const user = userData.data;
                const settingData = await handleListSetting();
                const setting = settingData.data;
                let proxy;
                try {
                    proxy = await getProxy(setting.proxy);
                } catch (err) {
                    if (err.status === 101) {
                        const regex = /\d+/g;
                        const result = data.message.match(regex);
                        await new Promise(resolve => setTimeout(resolve, parseInt(result[0]) * 1000));
                        proxy = await getProxy(setting.proxy);
                    } else {
                        reject({
                            statusCode: 500,
                            message: "Token has expired"
                        })
                    }
                };
                const optionsData = await prepareOptionPuppeteer(setting.isMobile, user, setting.proxy);
                const fbInteract = new FacebookInteract(optionsData.data, robotInteractConfigPayload);
                if (robotInteractConfigPayload.likeAndComment.isSelected) {
                    if (robotInteractConfigPayload.likeAndComment.friend.isSelected) {
                        await fbInteract.controller();
                    };
                };
                resolve({
                    statusCode: 200,
                    message: "success",
                })

                // try {

                //     // optionsData = await prepareOptionPuppeteer(setting.isMobile, user, "171.236.167.14:36254:XQrxWn:PeGKEE");
                // } catch (err) {
                //     // handle
                //     console.error(err.data);
                //     // break;
                // }
            };
            console.log("Finished")
        } catch (err) {
            reject({
                statusCode: 500,
                message: err.toString(),
            });
        };
    });
};

module.exports = {
    handleGetRobotInteractConfig,
    handleUpdateRobotInteractConfig,
    handleRunRobotInteract,
};