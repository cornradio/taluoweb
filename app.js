import TAROT_CARDS from './tarot-data.js';

const drawBtn = document.getElementById('draw-btn');
const resetBtn = document.getElementById('reset-btn');
const cardDisplay = document.getElementById('card-display');

// AI Section elements
const aiSection = document.getElementById('ai-section');
const aiPromptText = document.getElementById('ai-prompt-text');
const copyBtn = document.getElementById('copy-btn');

// Current drawing session state
let currentDraw = [];

// Shuffle Modal Elements
const shuffleBtn = document.getElementById('shuffle-btn');
const shuffleModal = document.getElementById('shuffle-modal');
const shuffleCanvas = document.getElementById('shuffle-canvas');
const closeShuffleBtn = document.getElementById('close-shuffle-btn');
const seedDisplay = document.getElementById('current-seed-val');

let userSeed = 0;
let isDrawing = false;
let ctx = shuffleCanvas.getContext('2d');


/**
 * Perform the drawing of 3 random cards
 */
function performDraw() {
    // Clear display
    cardDisplay.innerHTML = '';

    // Create sub-containers
    const cardsLine = document.createElement('div');
    cardsLine.className = 'cards-line';
    const infoSection = document.createElement('div');
    infoSection.className = 'info-section';

    // Seeded Shuffle mixing with Time
    const finalSeed = Date.now() + userSeed;
    
    // Simple seeded random generator
    const seededRandom = () => {
        // Use a simple sine-based hash for random-like distribution based on seed
        const x = Math.sin(finalSeed + Math.random()) * 10000;
        return x - Math.floor(x);
    };

    const shuffled = [...TAROT_CARDS].sort(() => 0.5 - seededRandom());
    const selected = shuffled.slice(0, 3);
    
    currentDraw = selected.map(card => {
        const isUpright = seededRandom() > 0.5;
        return { ...card, isUpright: isUpright };
    });

    currentDraw.forEach((card, index) => {
        // --- 顶部小图片部分 ---
        const cardWrapper = document.createElement('div');
        cardWrapper.className = 'card-wrapper-mini';
        cardWrapper.style.animationDelay = `${index * 0.15}s`;

        // 打乱一点：随机微量旋转和垂直偏移
        const randomRot = (Math.random() * 6) - 3; // -3 to 3 deg
        const randomY = (Math.random() * 15) - 7.5; // -7.5 to 7.5 px
        cardWrapper.style.transform = `rotate(${randomRot}deg) translateY(${randomY}px)`;

        const cardInner = document.createElement('div');
        cardInner.className = 'card mini';

        const cardBack = document.createElement('div');
        cardBack.className = 'card-face card-back';
        const cardFront = document.createElement('div');
        cardFront.className = 'card-face card-front';

        // --- 反光层 (Glare) ---
        const glareFront = document.createElement('div');
        glareFront.className = 'card-glare';
        const glareBack = document.createElement('div');
        glareBack.className = 'card-glare';

        const img = document.createElement('img');
        img.src = `cards/${card.id}.jpg`;
        img.className = 'card-img';
        if (!card.isUpright) img.classList.add('reversed');

        cardFront.appendChild(img);
        cardFront.appendChild(glareFront);
        cardBack.appendChild(glareBack);

        cardInner.appendChild(cardBack);
        cardInner.appendChild(cardFront);

        // --- 3D 悬浮跟随效果 & 反光控制 ---
        cardInner.addEventListener('mousemove', (e) => {
            const rect = cardInner.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            // 计算倾斜角度
            const rotateX = ((y - centerY) / centerY) * -15;
            const rotateY = ((x - centerX) / centerX) * 15;

            const isDrawn = cardInner.classList.contains('is-drawn');
            const baseRotateY = isDrawn ? 180 : 0;

            // 实时响应鼠标
            cardInner.style.transition = 'transform 0.1s ease';
            cardInner.style.transform = `rotateX(${rotateX}deg) rotateY(${baseRotateY + rotateY}deg) scale(1.05)`;

            // 反光位置计算
            const glareX = (x / rect.width) * 100;
            const glareY = (y / rect.height) * 100;
            const targetGlare = isDrawn ? glareFront : glareBack;
            // 为获得更强的光感，使用更高透明度的白色，并略微扩大半径
            targetGlare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0) 75%)`;
            targetGlare.style.opacity = '1';
        });

        cardInner.addEventListener('mouseleave', () => {
            const isDrawn = cardInner.classList.contains('is-drawn');
            const baseRotateY = isDrawn ? 180 : 0;
            cardInner.style.transition = 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)';
            cardInner.style.transform = `rotateX(0deg) rotateY(${baseRotateY}deg) scale(1)`;

            glareFront.style.opacity = '0';
            glareBack.style.opacity = '0';
        });

        cardWrapper.appendChild(cardInner);
        cardsLine.appendChild(cardWrapper);

        // --- 下方文字详情部分 ---
        const infoDiv = document.createElement('div');
        infoDiv.className = 'card-info-summary';
        infoDiv.style.animationDelay = `${1.5 + index * 0.3}s`;

        const cardTitle = document.createElement('div');
        cardTitle.className = 'card-label';
        const labels = ['第一张', '第二张', '第三张'];
        cardTitle.textContent = labels[index];

        const name = document.createElement('div');
        name.className = 'card-name';
        name.textContent = `${card.name} (${card.isUpright ? '正位' : '逆位'})`;

        const meaning = document.createElement('div');
        meaning.className = 'card-meaning-large';
        meaning.textContent = card.isUpright ? card.meaning_upright : card.meaning_reversed;

        infoDiv.appendChild(cardTitle);
        infoDiv.appendChild(name);
        infoDiv.appendChild(meaning);
        infoSection.appendChild(infoDiv);

        // Flip on click or auto flip
        setTimeout(() => {
            cardInner.classList.add('is-drawn');
            infoDiv.classList.add('visible');
        }, 800 + (index * 400));
    });

    cardDisplay.appendChild(cardsLine);
    cardDisplay.appendChild(infoSection);

    drawBtn.disabled = true;
    drawBtn.textContent = '卜卦已定';
    drawBtn.style.opacity = '0.5';
    shuffleBtn.style.display = 'none';

    // Generate AI Prompt
    generateAiPrompt();
    aiSection.style.display = 'block';
}

// --- Shuffle Modal & Canvas Implementation ---
let fadeInterval;

function initCanvas() {
    ctx.strokeStyle = '#c9a063';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#c9a063';
    
    // 启动淡化效果：制造灵动流动的气息
    if (fadeInterval) cancelAnimationFrame(fadeInterval);
    function fade() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.08)'; // 每次循环叠加一层极薄的黑色
        ctx.fillRect(0, 0, shuffleCanvas.width, shuffleCanvas.height);
        fadeInterval = requestAnimationFrame(fade);
    }
    fade();
}

shuffleCanvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    const rect = shuffleCanvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
});

window.addEventListener('mouseup', () => isDrawing = false);

shuffleCanvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    const rect = shuffleCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();

    // 灵值产生逻辑：采用异或与位移，产生混沌不可预测的数值感
    const noise = Math.floor(x * y * Math.random() * 100);
    userSeed = (userSeed ^ noise) >>> 0; 
    
    // 显示为 16 进制大写，看起来更像某种能量代码
    seedDisplay.textContent = '0x' + userSeed.toString(16).toUpperCase().padStart(8, '0');
});

shuffleBtn.addEventListener('click', () => {
    shuffleModal.style.display = 'flex';
    initCanvas();
});

closeShuffleBtn.addEventListener('click', () => {
    shuffleModal.style.display = 'none';
    if (fadeInterval) cancelAnimationFrame(fadeInterval);
    shuffleBtn.textContent = '灵觉已注入';
    shuffleBtn.style.opacity = '0.7';
});

function generateAiPrompt() {
    let prompt = "你好，我刚在塔罗牌阵中随机抽取了三张牌，请作为一名资深的塔罗占卜师帮我深度解读一下：\n\n";
    const labels = ["第一张", "第二张", "第三张"];

    currentDraw.forEach((card, index) => {
        const orientation = card.isUpright ? "正位" : "逆位";
        prompt += `${labels[index]}：${card.name} (${orientation})\n`;
    });

    prompt += "\n根据这三张牌的组合，你能给我提供一些直觉性的解读和建议吗？谢谢！";
    aiPromptText.value = prompt;
}

function resetDraw() {
    cardDisplay.innerHTML = '<div class="placeholder">静心思考，准备好了请点击下方按钮...</div>';
    drawBtn.disabled = false;
    drawBtn.textContent = '开启占卜 (抽取三张)';
    drawBtn.style.opacity = '1';
    shuffleBtn.style.display = 'inline-block';
    shuffleBtn.textContent = '仪式洗牌';
    shuffleBtn.style.opacity = '1';
    currentDraw = [];
    userSeed = 0;
    seedDisplay.textContent = '0';
    if (ctx) ctx.clearRect(0, 0, shuffleCanvas.width, shuffleCanvas.height);
    aiSection.style.display = 'none';
    aiPromptText.value = '';
}

// Initial state
resetDraw();

// Event listeners
drawBtn.addEventListener('click', performDraw);
resetBtn.addEventListener('click', resetDraw);

copyBtn.addEventListener('click', () => {
    aiPromptText.select();
    document.execCommand('copy');
    const originalText = copyBtn.textContent;
    copyBtn.textContent = '已复制！';
    setTimeout(() => {
        copyBtn.textContent = originalText;
    }, 2000);
});
