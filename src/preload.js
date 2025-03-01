// preload.js
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPIs", {
    listUser: () => ipcRenderer.invoke("/user"),
    getUser: (id) => ipcRenderer.invoke("/user/info", id),
    createUser: (user) => ipcRenderer.invoke("/user/create", user),
    updateUser: (user) => ipcRenderer.invoke("/user/update", user),
    deleteUser: (id) => ipcRenderer.invoke("/user/delete", id),
    launchUser: (id) => ipcRenderer.invoke("/user/launch", id),

    getRobotConfig: () => ipcRenderer.invoke("/robot"),
    updateRobotConfig: (robotConfig) => ipcRenderer.invoke("/robot/update", robotConfig),
    runInteract: (user, robotConfig) => ipcRenderer.invoke("/robot/run-interact", user, robotConfig),

    getSetting: () => ipcRenderer.invoke("/setting"),
    updateSetting: (settings) => ipcRenderer.invoke("/setting/update", settings),
});