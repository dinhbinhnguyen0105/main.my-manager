// preload.js
const { contextBridge, ipcRenderer } = require("electron");



contextBridge.exposeInMainWorld("electronAPIs", {
    listUser: () => ipcRenderer.invoke("/user"),
    getUser: (id) => ipcRenderer.invoke("/user/info", id),
    createUser: (user) => ipcRenderer.invoke("/user/create", user),
    updateUser: (user) => ipcRenderer.invoke("/user/update", user),
    deleteUser: (id) => ipcRenderer.invoke("/user/delete", id),
    launchUser: (payload) => ipcRenderer.invoke("/user/launch", payload),

    getRobotInteractConfig: () => ipcRenderer.invoke("/robot/interact"),
    updateRobotInteractConfig: (robotInteractConfigPayload) => ipcRenderer.invoke("/robot/interact/update", robotInteractConfigPayload),
    runRobotInteract: (userIds, robotInteractConfig) => ipcRenderer.invoke("/robot/interact/run", { userIds, robotInteractConfig }),

    getSetting: () => ipcRenderer.invoke("/setting"),
    updateSetting: (settings) => ipcRenderer.invoke("/setting/update", settings),
});