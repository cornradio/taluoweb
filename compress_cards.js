const fs = require('fs');
const path = require('path');
// 需要执行 npm install sharp 来安装依赖
try {
    var sharp = require('sharp');
} catch (e) {
    console.error("错误：未找到 sharp 库。请先在命令行运行: npm install sharp");
    process.exit(1);
}

const inputFolder = path.join(__dirname, 'cards');
const outputFolder = path.join(__dirname, 'cards_compressed');

// 确保输出目录存在
if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder);
}

console.log('--- 开始批量压缩塔罗牌图片 ---');

fs.readdir(inputFolder, (err, files) => {
    if (err) {
        console.error('无法读取 cards 目录:', err);
        return;
    }

    // 过滤出图片格式文件
    const imageFiles = files.filter(file => /\.(jpg|jpeg|png)$/i.test(file));
    
    if (imageFiles.length === 0) {
        console.warn('在 cards/ 目录中没发现图片文件。');
        return;
    }

    let completed = 0;

    imageFiles.forEach(file => {
        const inputPath = path.join(inputFolder, file);
        const outputPath = path.join(outputFolder, file);

        sharp(inputPath)
            .resize(600) // 将宽度调整为600px，高度自动等比缩放
            .jpeg({ quality: 80, mozjpeg: true }) // 80%质量
            .toFile(outputPath)
            .then(() => {
                completed++;
                console.log(`[成功] 已压缩: ${file} (${completed}/${imageFiles.length})`);
                
                if (completed === imageFiles.length) {
                    console.log('\n--- 恭喜！所有图片已压缩至 cards_compressed/ 目录 ---');
                }
            })
            .catch(err => {
                console.error(`[错误] 处理文件 ${file} 时出错:`, err);
            });
    });
});
