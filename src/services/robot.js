// robot.js
const path = require("path");
const fs = require("fs");

const dbPath = path.resolve(__dirname, "..", "db", "robots.json");
if (!fs.existsSync(dbPath)) { fs.writeFileSync(dbPath, JSON.stringify([]), { encoding: "utf8" }) };

const handleGetRobotConfig = () => {
    return new Promise((resolve, reject) => {
        try {

        } catch (err) {
            reject({
                statusCode: 500,
                message: "",
            });
        };
    });
};
const handleUpdateRobotConfig = (robotConfig) => {
    return new Promise((resolve, reject) => {
        try {

        } catch (err) {
            reject({
                statusCode: 500,
                message: "",
            });
        };
    });
};
const handleRunInteract = (user, robotConfig) => {
    return new Promise((resolve, reject) => {
        try {

        } catch (err) {
            reject({
                statusCode: 500,
                message: "",
            });
        };
    });
};

module.exports = {
    handleGetRobotConfig,
    handleUpdateRobotConfig,
    handleRunInteract,
};