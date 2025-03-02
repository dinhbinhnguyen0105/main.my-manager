// robot.js
const { ipcMain } = require("electron");
const robotControllers = require("../controllers/robot");

const robotRoutes = () => {
    ipcMain.handle("/robot/interact", (res, req) => new Promise((resolve, reject) => {
        robotControllers.getRobotInteractConfig()
            .then(res => resolve(res))
            .catch(err => reject(err));
    }));
    ipcMain.handle("/robot/interact/update", (res, robotInteractConfigPayload) => new Promise((resolve, reject) => {
        robotControllers.updateRobotInteractConfig(robotInteractConfigPayload)
            .then(res => resolve(res))
            .catch(err => reject(err));
    }));
    ipcMain.handle("/robot/interact/run", (res, req) => new Promise((resolve, reject) => {
        robotControllers.runRobotInteract(req.userIds, req.robotInteractConfig)
            .then(res => resolve(res))
            .catch(err => reject(err));
    }));
};
// user, robotInteractConfigPayload
module.exports = robotRoutes;
