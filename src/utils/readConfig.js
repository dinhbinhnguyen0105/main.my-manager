const fs = require('fs');
const path = require('path');

function readConfigs(configName, prefix = '') {
    try {
        const filePath = path.resolve(__dirname, "..", "configs", configName);
        const data = fs.readFileSync(filePath, 'utf8');
        const lines = data.split('\n');
        const values = [];

        lines.forEach(line => {
            if (prefix === '' || line.startsWith(prefix)) { // Kiểm tra tiền tố
                const parts = line.split('=');
                if (parts.length === 2) {
                    const value = parts[1].trim();
                    values.push(value);
                }
            }
        });

        return values;
    } catch (err) {
        console.error('Lỗi khi đọc file:', err);
        return [];
    }
}

module.exports = readConfigs;

// Sử dụng hàm với tiền tố
// const fileName = "puppeteer.txt";
// const prefix = 'EXECUTABLE_PATH';
// const extractedValues = readConfigs(fileName, prefix);

// if (extractedValues.length > 0) {
//     extractedValues.forEach(value => console.log(value));
// } else {
//     console.log("Không tìm thấy giá trị hoặc lỗi khi đọc file.");
// }