// robot.js
const robotServices = require("../services/robot");

const getRobotInteractConfig = () => robotServices.handleGetRobotInteractConfig();
const updateRobotInteractConfig = (robotInteractConfigPayload) => robotServices.handleUpdateRobotInteractConfig(robotInteractConfigPayload);
const runRobotInteract = (user, robotInteractConfigPayload) => robotServices.handleRunRobotInteract(user, robotInteractConfigPayload);

module.exports = {
    getRobotInteractConfig,
    updateRobotInteractConfig,
    runRobotInteract,
}