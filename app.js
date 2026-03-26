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
    
    // Pick 3 random cards
    const shuffled = [...TAROT_CARDS].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);
    
    currentDraw = selected.map(card => {
        const isUpright = Math.random() > 0.5;
        return { ...card, isUpright: isUpright };
    });

    currentDraw.forEach((card, index) => {
        // --- 顶部小图片部分 ---
        const cardWrapper = document.createElement('div');
        cardWrapper.className = 'card-wrapper-mini';
        cardWrapper.style.animationDelay = `${index * 0.15}s`;
        
        const cardInner = document.createElement('div');
        cardInner.className = 'card mini';
        
        const cardBack = document.createElement('div');
        cardBack.className = 'card-face card-back';
        const cardFront = document.createElement('div');
        cardFront.className = 'card-face card-front';
        
        const img = document.createElement('img');
        img.src = `cards/${card.id}.jpg`;
        img.className = 'card-img';
        if (!card.isUpright) img.classList.add('reversed');
        
        cardFront.appendChild(img);
        cardInner.appendChild(cardBack);
        cardInner.appendChild(cardFront);
        
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

    // Generate AI Prompt
    generateAiPrompt();
    aiSection.style.display = 'block';
}

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
    currentDraw = [];
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
