// main.js
const path = require("path");
const { app, BrowserWindow } = require("electron");
const userRoutes = require("./routes/user");
const robotRoutes = require("./routes/robot");
const settingRoutes = require("./routes/setting");

const createMainWindow = () => {
    const window = new BrowserWindow({
        title: "My manager",
        width: 1200,
        height: 800,
        webPreferences: {
            // preload: "/Users/dinhbinh/Dev/electron-project/main.my-manager/src/preload.js",
            preload: path.resolve(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false,
            enableBlinkFeatures: "",
        },
    });
    window.loadURL("http://localhost:5173/");
    // window.loadFile(path.resolve(__dirname, "dist", "index.html"));
};

app.whenReady().then(() => {
    createMainWindow();
    app.on("activate", () => (BrowserWindow.getAllWindows().length === 0 && createMainWindow()));
    app.on("window-all-closed", () => process.platform !== "darwin" && app.quit());
    userRoutes();
    robotRoutes();
    settingRoutes();
});