
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

module.exports = convertObj;