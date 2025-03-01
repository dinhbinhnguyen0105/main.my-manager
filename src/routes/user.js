// users.js
const { ipcMain } = require("electron");
const userControllers = require("../controllers/user");

const userRoutes = () => {
    ipcMain.handle("/user", (res, req) => {
        return new Promise((resolve, reject) => {
            userControllers.listUser()
                .then(res => resolve(res))
                .catch(err => reject(err));
        });
    });
    ipcMain.handle("/user/info", (res, id) => {
        return new Promise((resolve, reject) => {
            userControllers.getUser(id)
                .then(res => resolve(res))
                .catch(err => reject(err));
        });
    });
    ipcMain.handle("/user/create", (res, user) => {
        return new Promise((resolve, reject) => {
            userControllers.createUser(user)
                .then(res => resolve(res))
                .catch(err => reject(err));
        });
    });
    ipcMain.handle("/user/update", (res, user) => {
        return new Promise((resolve, reject) => {
            userControllers.updateUser(user)
                .then(res => resolve(res))
                .catch(err => reject(err));
        });
    });
    ipcMain.handle("/user/delete", (res, id) => {
        return new Promise((resolve, reject) => {
            userControllers.deleteUser(id)
                .then(res => resolve(res))
                .catch(err => reject(err));
        });
    });
    ipcMain.handle("/user/launch", (res, id) => {
        return new Promise((resolve, reject) => {
            userControllers.launchUser(id)
                .then(res => resolve(res))
                .catch(err => reject(err));
        });
    });
};

module.exports = userRoutes;