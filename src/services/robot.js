// robot.js
const path = require("path");
const fs = require("fs");
const initRobotModel = require("../model/robot");
const { handleGetUser } = require("./user");
const { handleListSetting } = require("./setting");
const convertObj = require("../utils/convertObj");
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
            convertObj(robotInteractConfigPayload);
            for (let userId of userIds) {
                const userData = await handleGetUser(userId);
                const user = userData.data;
                const settingData = await handleListSetting();
                const setting = settingData.data;
                const optionsData = await prepareOptionPuppeteer(setting.isMobile, user, setting.proxy);
                if (!optionsData) {
                    reject({
                        statusCode: 500,
                        message: ""
                    });
                };
                const fbInteract = new FacebookInteract(optionsData.data, robotInteractConfigPayload);
                await fbInteract.controller();
            };
            resolve({
                statusCode: 200,
                message: "success",
            });
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