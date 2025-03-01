// robot.js
const robotServices = require("../services/robot");

const getRobotConfig = () => robotServices.handleGetRobotConfig();
const updateRobotConfig = (robotConfig) => robotServices.handleUpdateRobotConfig(robotConfig);
const runInteract = (user, robotConfig) => robotServices.handleRunInteract(user, robotConfig);

module.exports = {
    getRobotConfig,
    updateRobotConfig,
    runInteract,
}