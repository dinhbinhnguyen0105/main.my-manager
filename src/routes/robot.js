// robot.js
const { ipcMain } = require("electron");
const robotControllers = require("../controllers/robot");


const convertObj = (obj) => {
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                // Nếu giá trị là một object, gọi đệ quy
                convertObj(obj[key]);
            } else if (typeof obj[key] === 'string') {
                // Nếu giá trị là một chuỗi, thử chuyển đổi
                try {
                    const parsed = JSON.parse(obj[key]);
                    if (Array.isArray(parsed)) {
                        // Nếu chuyển đổi thành công và là mảng, gán lại giá trị
                        obj[key] = parsed;
                    }
                } catch (e) {
                    // Nếu không thể chuyển đổi, bỏ qua
                }
            }
        }
    }
}

const robotRoutes = () => {
    ipcMain.handle("/robot/interact", (res, req) => new Promise((resolve, reject) => {
        robotControllers.getRobotInteractConfig()
            .then(res => resolve(res))
            .catch(err => reject(err));
    }));
    ipcMain.handle("/robot/interact/update", (res, robotInteractConfigPayload) => {
        convertObj(robotInteractConfigPayload);
        return new Promise((resolve, reject) => {
            robotControllers.updateRobotInteractConfig(robotInteractConfigPayload)
                .then(res => resolve(res))
                .catch(err => reject(err));
        })
    });
    ipcMain.handle("/robot/interact/run", (res, req) => {
        convertObj(req.robotInteractConfig);
        return new Promise((resolve, reject) => {
            robotControllers.runRobotInteract(req.userIds, req.robotInteractConfig)
                .then(res => resolve(res))
                .catch(err => reject(err));
        })
    });
};
// user, robotInteractConfigPayload
module.exports = robotRoutes;
