//setting.js
const settingServices = require("../services/setting");

const listSetting = () => settingServices.handleListSetting();
const updateSetting = (settings) => settingServices.handleUpdateSetting(settings);

module.exports = {
    listSetting,
    updateSetting,
};