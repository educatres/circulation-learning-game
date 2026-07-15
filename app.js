const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

// 分頁
$$('.tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    $$('.tab').forEach((item) => item.classList.remove('active'));
    $$('.panel').forEach((panel) => panel.classList.remove('active-panel'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.target).classList.add('active-panel');
    window.scrollTo({ top: 260, behavior: 'smooth' });
  });
});

// 概念動畫
const particles = $$('.particle');
$('#playBtn').addEventListener('click', () => particles.forEach((p) => p.classList.add('playing')));
$('#pauseBtn').addEventListener('click', () => particles.forEach((p) => p.style.animationPlayState = 'paused'));
$('#playBtn').addEventListener('click', () => particles.forEach((p) => p.style.animationPlayState = 'running'));
$('#resetBtn').addEventListener('click', () => {
  particles.forEach((p) => {
    p.classList.remove('playing');
    p.style.animationPlayState = 'running';
    void p.offsetWidth;
  });
});

// 建立細胞點
function createCells(containerId, count = 42) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  for (let i = 0; i < count; i += 1) {
    const dot = document.createElement('span');
    dot.className = 'cell-dot';
    container.appendChild(dot);
  }
}
createCells('humanCells');
createCells('insectCells');

const sizeSlider = $('#sizeSlider');
const activitySlider = $('#activitySlider');
const oxygenSlider = $('#oxygenSlider');
const activityLabels = { 1: '休息', 2: '行走', 3: '劇烈運動' };

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function toleranceLabel(score) {
  if (score >= 82) return '高';
  if (score >= 58) return '中等';
  return '低';
}

function updateCellMap(containerId, efficiency, reverse = false) {
  const dots = [...document.querySelectorAll(`#${containerId} .cell-dot`)];
  const hypoxiaRatio = clamp((100 - efficiency) / 100, 0, 1);
  const dangerCount = Math.round(dots.length * hypoxiaRatio * 0.55);
  const warningCount = Math.round(dots.length * hypoxiaRatio * 0.45);
  dots.forEach((dot, index) => {
    dot.className = 'cell-dot';
    const rank = reverse ? dots.length - index - 1 : index;
    if (rank < dangerCount) dot.classList.add('danger');
    else if (rank < dangerCount + warningCount) dot.classList.add('warning');
  });
}

function updateLab() {
  const size = Number(sizeSlider.value);
  const activity = Number(activitySlider.value);
  const oxygen = Number(oxygenSlider.value);

  $('#sizeValue').textContent = `${size} 公分`;
  $('#activityValue').textContent = activityLabels[activity];
  $('#oxygenValue').textContent = `${oxygen}%`;

  // 教學模型：人類因閉鎖式循環較能支撐較長運輸距離；昆蟲受氣管距離影響更明顯。
  const oxygenFactor = (oxygen - 10) / 25;
  const humanEfficiency = clamp(96 - size * 0.08 - (activity - 1) * 8 + oxygenFactor * 10, 25, 100);
  const insectEfficiency = clamp(102 - Math.pow(size, 1.17) * 0.62 - (activity - 1) * 13 + oxygenFactor * 18, 5, 100);

  const humanTime = 1.1 + size * 0.018 + activity * 0.22;
  const insectTime = 0.7 + Math.pow(size, 1.08) * 0.055 + activity * 0.32;
  const humanHypoxia = clamp(100 - humanEfficiency, 0, 100);
  const insectHypoxia = clamp(100 - insectEfficiency, 0, 100);

  $('#humanEfficiency').textContent = `${Math.round(humanEfficiency)}%`;
  $('#insectEfficiency').textContent = `${Math.round(insectEfficiency)}%`;
  $('#humanMeter').style.width = `${humanEfficiency}%`;
  $('#insectMeter').style.width = `${insectEfficiency}%`;
  $('#humanTime').textContent = `${humanTime.toFixed(1)} 秒`;
  $('#insectTime').textContent = `${insectTime.toFixed(1)} 秒`;
  $('#humanHypoxia').textContent = `${Math.round(humanHypoxia)}%`;
  $('#insectHypoxia').textContent = `${Math.round(insectHypoxia)}%`;
  $('#humanTolerance').textContent = toleranceLabel(humanEfficiency);
  $('#insectTolerance').textContent = toleranceLabel(insectEfficiency);

  $('#humanMessage').textContent = humanEfficiency > 75
    ? '心臟與血管能調整流量，供氧仍相對穩定。'
    : '體型與活動需求增加，心臟必須產生更高輸出。';
  $('#insectMessage').textContent = insectEfficiency > 75
    ? '氣管可直接把氧氣送到細胞附近，適合目前條件。'
    : '體型變大或活動增強後，深層細胞較容易缺氧。';

  updateCellMap('humanCells', humanEfficiency, false);
  updateCellMap('insectCells', insectEfficiency, true);
}

[sizeSlider, activitySlider, oxygenSlider].forEach((slider) => slider.addEventListener('input', updateLab));
$('#randomScenarioBtn').addEventListener('click', () => {
  sizeSlider.value = Math.floor(Math.random() * 100) + 1;
  activitySlider.value = Math.floor(Math.random() * 3) + 1;
  oxygenSlider.value = Math.floor(Math.random() * 26) + 10;
  updateLab();
});
$('#labResetBtn').addEventListener('click', () => {
  sizeSlider.value = 20;
  activitySlider.value = 2;
  oxygenSlider.value = 21;
  updateLab();
});
updateLab();

// 路線挑戰
function setupRouteChallenge(config) {
  const container = document.getElementById(config.containerId);
  const feedback = document.getElementById(config.feedbackId);
  const progress = document.getElementById(config.progressId);
  let current = 0;

  function reset() {
    current = 0;
    container.querySelectorAll('button').forEach((btn) => btn.className = '');
    progress.style.width = '0%';
    feedback.textContent = config.startText;
  }

  container.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', () => {
      const selected = button.dataset.step;
      const expected = config.route[current];
      if (selected === expected) {
        button.classList.add('correct');
        button.disabled = true;
        current += 1;
        progress.style.width = `${(current / config.route.length) * 100}%`;
        if (current === config.route.length) {
          feedback.textContent = config.successText;
        } else {
          feedback.textContent = `正確！下一站是第 ${current + 1} 個構造。`;
        }
      } else {
        button.classList.add('wrong');
        setTimeout(() => button.classList.remove('wrong'), 500);
        feedback.textContent = selected === '背血管'
          ? '背血管推動血淋巴，但不是昆蟲氧氣的主要通道。'
          : `這一步不對。現在應該找「${expected}」。`;
      }
    });
  });
  document.getElementById(config.resetId).addEventListener('click', () => {
    container.querySelectorAll('button').forEach((btn) => { btn.disabled = false; });
    reset();
  });
  reset();
}

setupRouteChallenge({
  containerId: 'humanRouteButtons',
  feedbackId: 'humanRouteFeedback',
  progressId: 'humanRouteProgress',
  resetId: 'resetHumanRoute',
  route: ['肺', '心臟', '動脈', '微血管', '肌肉細胞'],
  startText: '請從氧氣進入人體的位置開始。',
  successText: '完成！氧氣經由血液循環抵達肌肉細胞。'
});

setupRouteChallenge({
  containerId: 'insectRouteButtons',
  feedbackId: 'insectRouteFeedback',
  progressId: 'insectRouteProgress',
  resetId: 'resetInsectRoute',
  route: ['氣門', '氣管', '微氣管', '細胞'],
  startText: '請從外界空氣進入昆蟲的位置開始。',
  successText: '完成！氧氣沿氣管系統直接到達細胞附近。'
});

// 巨型昆蟲設計
const giantSliders = [$('#tracheaSlider'), $('#spiracleSlider'), $('#pumpSlider')];
function updateGiantLab() {
  const trachea = Number($('#tracheaSlider').value);
  const spiracle = Number($('#spiracleSlider').value);
  const pump = Number($('#pumpSlider').value);
  const score = clamp(Math.round(trachea * 4.8 + spiracle * 3.8 + pump * 2.6), 0, 100);
  const spaceCost = Math.round(trachea * 5.5 + spiracle * 2.2);
  $('#giantScore').textContent = score;
  $('.score-ring').style.setProperty('--score', `${score}%`);
  $('#giantMessage').textContent = score >= 80
    ? '成功！這隻巨型昆蟲暫時能維持足夠供氧。'
    : score >= 55
      ? '接近成功，但深層細胞仍可能在劇烈活動時缺氧。'
      : '供氧不足。試著增加氣管粗細、氣門數量或泵動速度。';
  $('#spaceCost').textContent = `構造代價：強化氣管與氣門約占用 ${spaceCost}% 的模擬身體空間。生物構造必須在不同需求之間取捨。`;
}
giantSliders.forEach((slider) => slider.addEventListener('input', updateGiantLab));
updateGiantLab();

// 測驗
const quizData = [
  {
    question: '昆蟲的氧氣主要透過哪一個系統送到細胞？',
    options: ['血淋巴', '氣管系統', '消化管', '外骨骼'],
    answer: 1,
    explanation: '昆蟲的氧氣主要由氣門進入，再沿氣管與微氣管送到細胞附近。'
  },
  {
    question: '人類的閉鎖式循環有什麼特徵？',
    options: ['血液主要在血管內流動', '血液直接流入體腔', '沒有心臟', '不需要肺'],
    answer: 0,
    explanation: '閉鎖式循環中，血液維持在血管系統內，能以較高壓力定向輸送。'
  },
  {
    question: '昆蟲的血淋巴最主要負責什麼？',
    options: ['只負責運送氧氣', '運送養分與代謝物等', '製造外骨骼', '讓氣門開啟'],
    answer: 1,
    explanation: '昆蟲血淋巴負責運送養分、代謝物、激素並參與防禦等功能。'
  },
  {
    question: '為什麼體型變大會增加昆蟲氣管系統的負擔？',
    options: ['氧氣移動距離增加', '氣門會全部消失', '血淋巴會變成固體', '外界氧氣一定變少'],
    answer: 0,
    explanation: '身體變大時，氧氣需要走更長距離才能到達深層細胞。'
  },
  {
    question: '下列哪一個敘述最正確？',
    options: ['開放式循環一定比較差', '所有昆蟲都完全一樣', '不同系統適合不同體型與生活方式', '大型動物都沒有循環系統'],
    answer: 2,
    explanation: '生物構造是演化與環境下的結果，不同循環與呼吸方式各有適合的條件。'
  }
];

function renderQuiz() {
  const form = $('#quizForm');
  form.innerHTML = quizData.map((item, qIndex) => `
    <article class="quiz-item" data-question="${qIndex}">
      <h3>${qIndex + 1}. ${item.question}</h3>
      <div class="quiz-options">
        ${item.options.map((option, oIndex) => `
          <label>
            <input type="radio" name="q${qIndex}" value="${oIndex}" />
            ${option}
          </label>
        `).join('')}
      </div>
      <p class="quiz-explanation" hidden></p>
    </article>
  `).join('');
}
renderQuiz();

$('#submitQuizBtn').addEventListener('click', () => {
  let score = 0;
  quizData.forEach((item, index) => {
    const card = document.querySelector(`[data-question="${index}"]`);
    const selected = document.querySelector(`input[name="q${index}"]:checked`);
    const explanation = card.querySelector('.quiz-explanation');
    card.classList.remove('correct', 'incorrect');
    explanation.hidden = false;
    explanation.textContent = item.explanation;
    if (selected && Number(selected.value) === item.answer) {
      score += 1;
      card.classList.add('correct');
    } else {
      card.classList.add('incorrect');
    }
  });
  const result = $('#quizResult');
  result.hidden = false;
  result.textContent = score === 5
    ? `你答對 ${score}/5 題！太棒了，你已掌握人類與昆蟲送氧方式的差異。`
    : `你答對 ${score}/5 題。查看每題解說，再回到前面的動畫或實驗室複習。`;
});

$('#resetQuizBtn').addEventListener('click', () => {
  renderQuiz();
  $('#quizResult').hidden = true;
});

// 教材導覽
const tourSteps = [
  { target: 'concept', title: '先看送氧路線', text: '播放動畫，比較人類靠血液送氧，以及昆蟲靠氣管系統送氧。' },
  { target: 'lab', title: '改變體型與環境', text: '拖曳三個滑桿，觀察體型、活動強度與氧氣濃度如何影響供氧。' },
  { target: 'challenge', title: '完成互動挑戰', text: '依照正確順序點擊構造，並試著設計一隻能維持供氧的巨型昆蟲。' },
  { target: 'quiz', title: '最後進行檢測', text: '完成五題小測驗，確認自己是否掌握核心概念。' }
];
let tourIndex = 0;
function showTourStep() {
  const step = tourSteps[tourIndex];
  $('#tourStepLabel').textContent = `導覽 ${tourIndex + 1}/${tourSteps.length}`;
  $('#tourTitle').textContent = step.title;
  $('#tourText').textContent = step.text;
  $('#tourNextBtn').textContent = tourIndex === tourSteps.length - 1 ? '開始學習' : '下一步';
}
$('#startTourBtn').addEventListener('click', () => {
  tourIndex = 0;
  $('#tourOverlay').hidden = false;
  showTourStep();
});
$('#tourCloseBtn').addEventListener('click', () => $('#tourOverlay').hidden = true);
$('#tourNextBtn').addEventListener('click', () => {
  const target = tourSteps[tourIndex].target;
  document.querySelector(`.tab[data-target="${target}"]`).click();
  if (tourIndex < tourSteps.length - 1) {
    tourIndex += 1;
    showTourStep();
  } else {
    $('#tourOverlay').hidden = true;
  }
});
