// robot.js
const { ipcMain } = require("electron");
const robotControllers = require("../controllers/robot");

const robotRoutes = () => {
    ipcMain.handle("/robot", () => robotControllers.getRobotConfig());
    ipcMain.handle("/robot/update", (robotConfig) => robotControllers.updateRobotConfig(robotConfig));
    ipcMain.handle("/robot/run-interact", (user, robotConfig) => robotControllers.runInteract(user, robotConfig));
};

module.exports = robotRoutes;
