//setting.js
const { ipcMain } = require("electron");
const settingControllers = require("../controllers/setting");

const settingRoutes = () => {
    ipcMain.handle("/setting", (res, req) => {
        return new Promise((resolve, reject) => {
            settingControllers.listSetting()
                .then(res => resolve(res))
                .catch(err => reject(err));
        });
    });
    ipcMain.handle("/setting/update", (res, req) => {
        return new Promise((resolve, reject) => {
            settingControllers.updateSetting(req)
                .then(res => resolve(res))
                .catch(err => reject(err));
        });
    });
};


module.exports = settingRoutes;