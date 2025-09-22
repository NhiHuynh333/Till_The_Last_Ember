let matchImg, fireImg, particleImg;
let particles = [];
let maxParticles = 25;
let collected = 0;

let bgParticles = [];
let bgLayer;

let state = "collecting";  // collecting → fadeout → matches → matchesToOverlay → perlinOverlay → overlayFade → reveal
let fadeAlpha = 255;
let matchesAlpha = 0;

let matches = [];
let currentLit = 0;
let dragging = false;
let dragPos;

let animatingFlame = false;
let flameAnim = { start: null, end: null, progress: 0 };

let flowParticles = [];
let flowDir;
let overlayAlpha = 255;

let particleTexture;
let particleSystems = [];
let smokeActive = false;

let raindrops = [];
let ripples = [];

let showDayOne = true;

let candleImg;

let candle;

let coverImg;
let overlayStage1Active = true;
let overlayStage1Alpha = 255;
let startFade = false;

let stoneImg;

let col = [];
let charSize = 20;  // kích thước font cho matrix rain

let lightImg;
let input; 
let lightParticles = [];

let typingMode = false;   // false = đang hiển thị thoại, true = người chơi nhập chữ
let inputBuffer = "";     // lưu text người chơi đang gõ
let maxMessages = 3;
let sentMessages = 0;

let backspaceHeld = false;   // cờ check giữ phím
let backspaceDelay = 5;      // số frame giữa mỗi lần xoá
let backspaceCounter = 0;

let stoneScale = 0.45;     // scale ban đầu nhỏ
let stoneScaleMax = 0.75;  // giới hạn tối đa
let stoneBaseScale = stoneScale;

// --- biến pulse ---
let pulseStrength = 0.08;  // biên độ đập ban đầu
let pulseDecay = 0.95;  // tốc độ giảm sau mỗi frame
let pulseSpeed = 0.25;  // tốc độ đập

let lightMaxRatio = 0.5;  
let lightMinRatio = 0.07;  

let stoneHeartImg;
let stoneHeartScale = 0.75;
let stoneHeartStartTime = 0;
let showHeart = false;        // có hiển thị heart không
let textParticles = [];
let heartExploded = false;

let heartImg;

// ==== Fire globals ====
let fireElemLength = 6;
let elemOpacity = 200;
let fireLines = [];
let fireWidth, fireHeight;
let nbColors = 255;
let palette = [];
let fireAlpha = 0;

let heartClicked = false;

let stage3done = false;
let stage3fade = 255;

let stars = [];
let speed = 10; // chỉnh tốc độ sao bay

let scrollPos = 0;
let scrollMax;

let overlayRipples = [];

let chatDisabled = false;

let bgMusic;
let musicMuted = false;

// ----------------- Dialogues -----------------
let dialogues = {
  collecting: [
    "Just when it felt like everything was over, the flame sparked back to life.",
    "Tiny fading embers gathered together",
    "… and once again, it burned bright."
  ],
  matches: [
    "When the light nearly slipped away, a new keeper caught its glow.",
    "Each spark reached out, kindling another path.",
    "…until, at last, they rose as one, and let their fire grow."
  ],
  perlinOverlay: [
    "But now, here comes the wind."
  ],
  reveal: [
    "… no more light.",
    "Will we fall to dust?",
    "Or rise into another life?"
  ],
  stage2candle: [
    "Beneath the veil of falling rain,",
    "The flame still flickers, yet in vain,",
    "Till all is lost, no light remains."
  ],
  stage3stone: [
    "While the vision burns, the heart turns stone,",
    "What voices recall it to rise, in this fleeting world alone?",
  ],
  stage3heart: [
    "At last, through trials we endure,",
    "The cherished wish has come secure."
  ],
  stage3done: [
    "As time comes, all our days pass,",
    "we drift into night’s silent mass.",
    "Still, our legacy shall last."
  ]
};

let currentDialogue = 0;
let chatboxVisible = true;

function preload() {
  matchImg = loadImage("assets/MATCHLIGHT.png", () => {}, () => { matchImg = null; });
  fireImg = loadImage("assets/FIRE.gif", () => {}, () => { fireImg = null; });
  particleTexture = loadImage("assets/particle_texture.png");
  candleImg = loadImage("assets/CANDLE.png", () => {}, () => { candleImg = null; });
  coverImg = loadImage("assets/COVER.png");
  stoneImg = loadImage("assets/STONE.png");
  lightImg = loadImage("assets/LIGHT.png"); 
  stoneHeartImg = loadImage("assets/STONE_HEART.png");
  heartImg = loadImage("assets/HEART.png");
  bgMusic = loadSound('assets/a-promise-in-the-rain-389249.mp3');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  bgMusic.loop();
  bgMusic.setVolume(0.5);
  scrollMax = height * 3;
  imageMode(CENTER);

  // khởi tạo particle cho perlin overlay
  for (let i = 0; i < 800; i++) {
    flowParticles.push(createVector(random(width), random(height)));
    
  }
for (let i = 0; i < 800; i++) {
  stars[i] = new Star();
}

  const offsetX = 100;
  const boxW = 300;
  const boxH = 50;
  const spacing = 10;
  const totalHeight = boxH * 3 + spacing * 2;
  const startY = (height - totalHeight) / 2;

  stage1 = new StageBox01(offsetX, startY, boxW, boxH, "STAGE 01");
  stage2 = new StageBox02(offsetX, startY + boxH + spacing, boxW, boxH, "STAGE 02");
  stage3 = new StageBox03(offsetX, startY + (boxH + spacing) * 2, boxW, boxH, "STAGE 03");

  bgLayer = createGraphics(windowWidth, windowHeight);
  bgLayer.noStroke();

  for (let i = 0; i < 200; i++) {
    bgParticles.push(new BgParticle());
  }
}

function mouseWheel(event) {
  if (state === "stage3done") {
    scrollPos += event.delta;
    scrollPos = constrain(scrollPos, 0, scrollMax);
  }
}

//------------------- Change State -----------------
function changeState(newState) {
  state = newState;
  currentDialogue = 0;   // reset thoại mỗi khi đổi state

  if (newState === "fadeout") {
  fadeAlpha = 255;}

  if (newState === "stage2start") {
    raindrops = [];
    ripples = [];
    for (let i = 0; i < 150; i++) {
      raindrops.push(new RainDrop());
    }
  }

  if (newState === "stage2candle") {
    candle = new Candle(width / 2, height * 0.7, candleImg, fireImg);
  }

  if (newState === "stage3stone") {
    col = [];
    textSize(charSize);
    for (let x = 0; x < floor(width / charSize); x++) {
      col[x] = new Column(x);
    }
  }

  if (newState === "stage3heart") {
  stoneHeartStartTime = millis();   // gán thời gian bắt đầu
  showHeart = true;
  heartToText = false;
  heartExploded = false;
  textParticles = [];
  fireAlpha = 0;        // reset opacity lửa
  initFireSystem();     // ✅ KHỞI TẠO LỬA
}

if (newState === "stage3done") {
  stage3fade = 255;   // bắt đầu fade-out từ full sáng
}
}

// ----------------- State Machine trong draw -----------------
function draw() {
  background(20);

  // --- background particle ---
  bgLayer.clear();
  for (let p of bgParticles) {
    p.update();
    p.show(bgLayer);
  }
  image(bgLayer, width/2, height/2);

  // --- state machine ---
  if (state === "collecting") {
    drawCollectingScene();
    if (collected >= maxParticles) changeState("fadeout");
  }
  else if (state === "fadeout") {
    drawCollectingScene(fadeAlpha);
    fadeAlpha -= 5;
    if (fadeAlpha <= 0) {
      changeState("matches");
      matchesAlpha = 0;
      currentLit = 0;
    }
  }
  else if (state === "matches") {
    drawMatchesRow(true); // que diêm + lửa
    if (currentLit >= 4) {
      changeState("matchesToOverlay"); // 🔹 fade
      overlayAlpha = 0;
    }
  }
  else if (state === "matchesToOverlay") {
    drawMatchesRow(true);
    overlayAlpha += 10;
    fill(17, overlayAlpha);
    rect(0, 0, width, height);

    drawPerlinOverlay(overlayAlpha);
    drawOverlayText(overlayAlpha);

    if (overlayAlpha >= 255) {
      changeState("perlinOverlay");
    }
  }
  else if (state === "perlinOverlay") {
    background("#111");
    drawPerlinOverlay(255);
    drawOverlayText(255);
  }
  else if (state === "overlayFade") {
    background("#111");
    drawPerlinOverlay(overlayAlpha);
    drawOverlayText(overlayAlpha);
    overlayAlpha -= 10;
    if (overlayAlpha <= 0) {
      changeState("reveal");
    }
  }
  else if (state === "reveal") {
    drawMatchesRow(false);
  }
  else if (state === "stage2start") {
    background(20);
    for (let drop of raindrops) {
      drop.update();
      drop.show();
    }
    for (let i = ripples.length - 1; i >= 0; i--) {
      ripples[i].update();
      ripples[i].show();
      if (ripples[i].finished()) {
        ripples.splice(i, 1);
      }
    }
  } 
  else if (state === "stage2candle") {
    background(20);
    if (candle) {
      candle.display();
      candle.checkRainHit(raindrops);
    }
    for (let drop of raindrops) {
      drop.update();
      drop.show();
    }
    for (let i = ripples.length - 1; i >= 0; i--) {
      ripples[i].update();
      ripples[i].show();
      if (ripples[i].finished()) {
        ripples.splice(i, 1);
      }
    }
    if (candle) candle.display();
  }
  
  else if (state === "stage3stone") {
  background(0);

  for (let x = 0; x < col.length; x++) {
    col[x].jump();
    col[x].show();
  }

  if (stoneImg) {
  push();
  translate(width*5.2/10, height/2);

  // tính scale animation
  let pulseOffset = sin(frameCount * pulseSpeed) * pulseStrength;
  stoneScale = stoneBaseScale + pulseOffset;

  // giảm dần biên độ pulse
  pulseStrength *= pulseDecay;

  scale(stoneScale);
  image(stoneImg, 0, 0);
  pop();
}
  }

// 🔥 trong stage3heart chỉ vẽ hiệu ứng, KHÔNG check stage3done nữa
else if (state === "stage3heart") {
  background(0);
  let elapsed = millis() - stoneHeartStartTime;

  // Matrix
  for (let x = 0; x < col.length; x++) {
    col[x].jump();
    col[x].show();
  }  

    // Fire sau heart (delay 3s)
  if (fireImg && elapsed > 3000) {
    push();
    translate(width * 4.8 / 10, height / 2);
    scale(0.5);
    imageMode(CENTER);
    tint(255, fireAlpha * 0.7);   // chỉ cần fireAlpha
    image(fireImg, 0, 0);
    pop();

    if (fireAlpha < 255) fireAlpha += 5;
  }

  // Heart nền
  if (heartImg) {
    let baseScale = 0.75;
    let heartScale = baseScale;
    if (elapsed > 1000) {
      let pulse = sin(frameCount * 0.08) * 0.02;
      heartScale = baseScale + pulse;
    }
    push();
    translate(width * 5.2 / 10, height / 2);
    scale(heartScale);
    imageMode(CENTER);
    image(heartImg, 0, 0);
    pop();
  }

  // Text particles
  for (let i = textParticles.length - 1; i >= 0; i--) {
    textParticles[i].update();
    textParticles[i].show();
    if (textParticles[i].isFinished()) {
      textParticles.splice(i, 1);
    }
  }

  // Heart explode
  if (showHeart) {
    push();
    translate(width * 5.2 / 10, height / 2);
    scale(stoneHeartScale);
    imageMode(CENTER);
    image(stoneHeartImg, 0, 0);
    pop();

    if (elapsed > 1000 && !heartExploded) {
      heartExploded = true;
      showHeart = false;
      generateHeartParticles(stoneHeartImg, width*5.2/10, height/2, stoneHeartScale);
    }
  }

  // Fire dưới
  if (elapsed > 1000) {
    drawFireAtBottom();
    if (fireAlpha < 255) fireAlpha += 5;
  }
}

//--- stage3done ---
else if (state === "stage3done") {
  background(0);

  // Starfield background
  push();
  translate(width / 2, height / 2);
  for (let s of stars) {
    s.update();
    s.show();
  }
  pop();

  // progress 0 → 1 theo scroll
  let progress = constrain(scrollPos / scrollMax, 0, 1);

  // --- Match ---
  if (matchImg) {
    let matchProgress = constrain(
      map(scrollPos, height * 2.8, height * 3.2, 0, 1),
      0,
      1
    );

    let matchX = width / 2;

    // scale dựa trên màn hình (ví dụ ảnh cao bằng 80% chiều cao màn hình)
    let targetHeight = height * 0.8;
    let matchScale = targetHeight / matchImg.height;

    // Đặt đáy trên của que diêm đúng giữa màn hình
    let matchY = height / 2 + (matchImg.height * matchScale) / 2;

    push();
    translate(matchX, matchY);
    scale(matchScale);
    imageMode(CENTER);
    tint(255, 255 * matchProgress);
    image(matchImg, 0, 0);
    pop();
  }

  // --- Heart + Fire ---
  let fireStartX = width * 4.8 / 10;
  let heartStartX = width * 5.2 / 10;
  let startY = height / 2;

  // end position riêng
  let fireEndX = width * 0.5;   // ví dụ hơi lệch trái
  let fireEndY = height * 5.2 / 10;

  let heartEndX = width * 0.51;  // ví dụ hơi lệch phải
  let heartEndY = height * 5.4 / 10;

  // interpolate theo progress
  let fireX = lerp(fireStartX, fireEndX, progress);
  let fireY = lerp(startY, fireEndY, progress);

  let heartX = lerp(heartStartX, heartEndX, progress);
  let heartY = lerp(startY, heartEndY, progress);

  // FIRE
  let fireScale = lerp(1.0, 0.7, progress);
  if (fireImg) {
    push();
    translate(fireX, fireY);
    scale(0.5 * fireScale);
    imageMode(CENTER);
    tint(255, fireAlpha * 0.7);
    image(fireImg, 0, 0);
    pop();
  }

  // HEART
  let heartScale = lerp(1.0, 0.5, progress);
  if (heartImg) {
    push();
    translate(heartX, heartY);
    scale(0.75 * heartScale);
    imageMode(CENTER);
    image(heartImg, 0, 0);
    pop();
  }

  // --- Text transition ---
  push();
  textFont('Righteous');
  textAlign(CENTER, CENTER);
  textSize(300);
  let textScale = 0.5;   // 🔹 giữ scale 0.5
  translate(width / 2, height / 6);
  scale(textScale);

  // helper fade
  const textFadeAlpha = (pos, range) => {
    return constrain(map(scrollPos, pos - range, pos + range, 0, 1), 0, 1);
  };

  // Câu 1 (fade out khi tới 100vh)
  let a1 = 1 - textFadeAlpha(height * 1.0, 400);
  fill(80, 255 * a1);
  noStroke();
  text("and though we FADE,", 0, 0);

  // Câu 2 (fade in từ 100vh → fade out trước 200vh)
  let a2 = textFadeAlpha(height * 1.0, 400) * (1 - textFadeAlpha(height * 2.0, 400));
  fill(80, 255 * a2);
  text("our story RESOUNDS,", 0, 0);

  // Câu 3 (fade in từ 200vh)
  let a3 = textFadeAlpha(height * 2.0, 400);
  fill(80, 255 * a3);
  text("NEVER DECAYED", 0, 0);

  pop();

  // --- Tick Stage 3 fade in theo progress ---
  stage3.setTickAlpha(progress * 255);
}

  // --- chữ trên mỗi state... ---
  if (state !== "stage3done") {
  push();
  textFont('Righteous');
  textAlign(CENTER, CENTER);

  let txt;
if (showDayOne) {
  txt = "DAY ONE";
} else if (state === "stage3stone") {
  txt = "BUT then...";
} else if (state === "stage3heart") {
  txt = heartClicked ? "we'll MAKE IT" : "ONE DAY";  // 👈 đổi khi click
} else {
  txt = "we may FAIL";
}

  textSize(300);
  let scaleFactor = 0.7;
  translate(width / 2, height / 6);
  scale(scaleFactor);
  fill(80);
  noStroke();
  text(txt, 0, 0);
  pop();}

  // --- stage box ---
  stage1.display();
  stage2.display();
  stage3.display();

  // --- tiến độ ---
push();
fill(255);
textFont('Archivo');
noStroke();
textSize(14);
textAlign(LEFT);
const textX = stage3.x;
const textY = stage3.y + stage3.h + 25;

// lấy dialogues hiện tại
let dialogueSet = dialogues[state] || [];
let total = dialogueSet.length;
let current = min(currentDialogue + 1, total); // +1 vì currentDialogue bắt đầu từ 0

text(`TEXT READ: ${current}/${total}`, textX, textY);

// chuyển trạng thái ongoing → done nếu stage3done và đọc hết
let statusText = "Stage ongoing.";
if (state === "stage3done" && current >= total) {
  statusText = "Stage done.";
}
text(statusText, textX, textY + 20);
pop();

  // --- chatbox ---
if (chatboxVisible) {
  drawChatbox(); // vẫn vẽ box, khung input, cursor, ...
  
  // chỉ show dialogue nếu chưa đạt maxMessages và đang ở stage3stone
  if (!(state === "stage3stone" && sentMessages >= maxMessages)) {
    push();
    textAlign(LEFT, CENTER);
    textSize(20);
    fill(255);
    noStroke();

    pop();
  }
}

  // --- overlay stage1 ---
if (overlayStage1Active) {
  // nền bán trong suốt
  fill(17, overlayStage1Alpha);
  noStroke();
  rect(0, 0, width, height);

  // --- update + hiển thị ripple ---
  for (let i = overlayRipples.length - 1; i >= 0; i--) {
    overlayRipples[i].update();
    overlayRipples[i].show();
    if (overlayRipples[i].finished()) overlayRipples.splice(i, 1);
  }

  // --- cover image ---
  let aspect = coverImg.height / coverImg.width;
  let scaleFactor = 0.5;    
  let newW = width * scaleFactor;
  let newH = newW * aspect;

  tint(255, overlayStage1Alpha);
  image(coverImg, width/2, height/2, newW, newH);
  noTint();

  // --- text nhấp nháy ---
  let blinkAlpha = map(sin(frameCount * 0.1), -1, 1, 150, 255);
  blinkAlpha = min(blinkAlpha, overlayStage1Alpha);
  fill(255, blinkAlpha);
  textAlign(CENTER, CENTER);
  textSize(32);
  text("Press SPACE to start", width / 2, height * 5 / 6);

  // --- thông báo nhạc ---
  fill(255, overlayStage1Alpha);
  textSize(18);
  text("Press M to mute/unmute the music", width / 2, height * 5 / 6 + 40);

  // --- fade out khi nhấn SPACE ---
  if (startFade) {
    if (overlayStage1Alpha > 0) overlayStage1Alpha -= 8;
    else overlayStage1Active = false;
  }
}

// --- backspace hold (luôn chạy nếu đang nhập) ---
if (typingMode && backspaceHeld) {
  backspaceCounter++;

  // cho delay ngắn ban đầu (~20 frame = 0.3s ở 60fps)
  if (backspaceCounter > 20) {
    // sau delay thì xoá đều đặn
    if (frameCount % 2 === 0 && inputBuffer.length > 0) {
      inputBuffer = inputBuffer.slice(0, -1);
    }
  }
}

// --- update & hiển thị light particles ---
for (let i = lightParticles.length - 1; i >= 0; i--) {
  lightParticles[i].update();
  lightParticles[i].show();
  if (lightParticles[i].isFinished()) {
    lightParticles.splice(i, 1);
  }
}
}

let lastRippleTime = 0;

function mouseMoved() {
  if (overlayStage1Active) {
    // chỉ tạo ripple mỗi 80ms → giảm dày
    if (millis() - lastRippleTime > 20) {
      overlayRipples.push(new OverlayRipple(mouseX, mouseY));
      lastRippleTime = millis();
    }
  }
}

//------------------- Blinking Text -----------------
function drawBlinkingText(txt, x, y, size = 18, alignX = CENTER, alignY = CENTER) {
  push();
  textAlign(alignX, alignY);
  textSize(size);
  textFont("Archivo");
  // tính alpha dao động 80–255
  let blinkAlpha = map(sin(frameCount * 0.07), -1, 1, 80, 255);
  fill(200, blinkAlpha);
  text(txt, x, y);
}

// ----------------- Biến cho typing effect -----------------
let typedChars = 0;
let typingSpeed = 2; // số frame mỗi ký tự (tốc độ gõ)

// ----------------- Trong drawChatbox -----------------
function drawChatbox() {
  let boxW = width * 0.55;
  let boxH = height / 7;
  let boxX = (width - boxW) / 2;
  let boxY = height - boxH - 40;

  // Khung chatbox
  fill("#111111de");
  stroke("#ffffffb2");
  strokeWeight(2);
  rect(boxX, boxY, boxW, boxH, 0); 

  noStroke();
  fill(255);
  textFont("Special Elite");
  textSize(22);
  textAlign(CENTER, CENTER);
  let padding = 20;

  if (typingMode) {
    // Chế độ người chơi nhập
    text("> " + inputBuffer, boxX + padding, boxY + padding, boxW - padding*2, boxH - padding*2);
  } else {
    // Chế độ thoại
    let showDialogue = !(state === "stage3stone" && sentMessages >= maxMessages);

    if (showDialogue) {
      let dialogueSet = dialogues[state] || [];
      let textToShow = dialogueSet[currentDialogue] || "";

      // cắt chuỗi theo số ký tự đã gõ
      let visibleText = textToShow.substring(0, typedChars);
      text(visibleText, boxX + padding, boxY + padding, boxW - padding*2, boxH - padding*2);

      // hiệu ứng typing
      if (frameCount % typingSpeed === 0 && typedChars < textToShow.length) {
        typedChars++;
      }

      // chỉ hiện hint khi thoại chạy xong
      if (typedChars >= textToShow.length) {
        drawBlinkingText("Press U to read on", boxX + boxW - 15, boxY + boxH - 10, 18, RIGHT, BOTTOM);
      }
    }
  }

  // Hint góc trên trái cho mỗi state
  if (!typingMode) {
    if (state === "collecting") {
      drawBlinkingText("Click to light the flame", boxX + 15, boxY + 10, 18, LEFT, TOP);
    } 
    else if (state === "matches") {
      drawBlinkingText("Pass the flame to light them all", boxX + 15, boxY + 10, 18, LEFT, TOP);
    } 
    else if (state === "perlinOverlay") {
      drawBlinkingText("Press SPACE to stop the wind", boxX + 15, boxY + 10, 18, LEFT, TOP);
    }
    else if (state === "reveal") {
      drawBlinkingText("Press → to next stage", boxX + 15, boxY + 10, 18, LEFT, TOP);
    }
    else if (state === "stage2candle") {
      if (candle && !candle.isExtinguished()) {
        drawBlinkingText("Drag the candle to keep it from the rain", boxX + 15, boxY + 10, 18, LEFT, TOP);
      } else {
        drawBlinkingText("Press → to next stage", boxX + 15, boxY + 10, 18, LEFT, TOP);
      }
    }
    else if (state === "stage3stone") {
      if (sentMessages < maxMessages) {
        drawBlinkingText("Send messages to wake up the heart", boxX + 15, boxY + 10, 18, LEFT, TOP);
      } else {
        drawBlinkingText("Press SPACE to reveal its true form", boxX + 15, boxY + 10, 18, LEFT, TOP);
      }
    }
    else if (state === "stage3heart") {
      if (!heartClicked) {
        drawBlinkingText("Click on the heart", boxX + 15, boxY + 10, 18, LEFT, TOP);
      } else {
        drawBlinkingText("Press SPACE to continue", boxX + 15, boxY + 10, 18, LEFT, TOP);
      }
    }
  }
}


// ----------------- Key Typed -----------------
function keyTyped() {
  if (typingMode) {
    // --- chế độ nhập ---
    if (keyCode === ENTER) {
      if (inputBuffer.trim() !== "" && sentMessages < maxMessages) {
        lightParticles.push(new LightParticle(width / 2, height / 2));
        sentMessages++;
        inputBuffer = "";

        if (sentMessages >= maxMessages) {
          typingMode = false;
          // 👉 có thể chuyển sang state tiếp theo ở đây
        }
      }
    } else if (keyCode !== BACKSPACE) {
      // không xử lý backspace ở đây nữa
      inputBuffer += key;
    }
    return;
  }

  // --- chế độ thoại ---
  if (key === 'u' || key === 'U') {
    let dialogueSet = dialogues[state] || [];

    if (currentDialogue < dialogueSet.length - 1) {
      // vẫn còn thoại → next
      currentDialogue++;
      typedChars = 0;
    } else {
      // hết thoại stage3stone → bật chế độ nhập
      if (state === "stage3stone") {
        typingMode = true;
        inputBuffer = "";
      }
    }
  }
}

// ----------------- Matches Row -----------------
function drawMatchesRow(withFlame = true) {
  matchesAlpha = min(matchesAlpha + 5, 255);

  let numMatches = 5;
  let gap = width / 8;
  let matchH = height * 0.7 * 0.6;
  let matchW = matchImg ? matchImg.width * (matchH / matchImg.height) : matchH * 0.2;
  let y = height - matchH/2;
  let totalWidth = (numMatches - 1) * gap;
  let startX = width/2 - totalWidth/2;

  matches = [];
  push();
  tint(255, matchesAlpha);
  for (let i = 0; i < numMatches; i++) {
    let x = startX + i * gap;
    if (matchImg) image(matchImg, x, y, matchW, matchH);
    else {
      fill(200, 150, 100, matchesAlpha);
      rectMode(CENTER);
      rect(x, y, matchW, matchH);
    }
    matches.push({x: x, y: y - matchH * 0.45, h: matchH, w: matchW});
  }
  pop();

  if (withFlame) {
    for (let i = 0; i <= currentLit; i++) {
      drawFlame(matches[i].x, matches[i].y, matches[i].h);
    }
  }
  // nếu SPACE đã nhấn → bật smoke system cho mỗi que
  if (smokeActive) {
    let dx = map(mouseX, 0, width, -0.2, 0.2);
    let wind = createVector(dx, 0);

    for (let i = 0; i < particleSystems.length; i++) {
      let ps = particleSystems[i];
      ps.origin.set(matches[i].x, matches[i].y - matches[i].h * 0.04); // cập nhật origin
      ps.applyForce(wind);
      ps.run();
      for (let k = 0; k < 2; k++) {
        ps.addParticle();
      }
    }
  }

  if (dragging && dragPos) {
    drawFlame(dragPos.x, dragPos.y, matches[0].h);
  }

  if (animatingFlame) {
    flameAnim.progress += 0.05;
    if (flameAnim.progress >= 1) {
      animatingFlame = false;
      currentLit++;

      // nếu muốn ẩn chatbox khi thắp đủ 5 (tùy logic của bạn)
      if (currentLit >= 5) {
        chatboxVisible = false;
      }
    } else {
      let x = lerp(flameAnim.start.x, flameAnim.end.x, flameAnim.progress);
      let y = lerp(flameAnim.start.y, flameAnim.end.y, flameAnim.progress);
      drawFlame(x, y, matches[0].h);
    }
  }
}

// ----------------- Overlay -----------------
function drawPerlinOverlay(alpha = 255) {
  push();
  noStroke();
  blendMode(ADD);

  for (let p of flowParticles) {
    // noise angle dao động (wavy)
    let angle = noise(p.x * 0.002, p.y * 0.002, frameCount * 0.002) * TWO_PI;

    // vector chính: sang phải (tăng tốc)
    let baseVel = createVector(2.5, 0);

    // vector dao động (tăng nhẹ)
    let waveVel = p5.Vector.fromAngle(angle).mult(1.0);

    // cộng vận tốc
    let v = baseVel.add(waveVel);
    p.add(v);

    // wrap quanh màn hình
    if (p.x > width) p.x = 0;
    if (p.y < 0) p.y = height;
    if (p.y > height) p.y = 0;

    // opacity ngẫu nhiên nhưng chớp chậm hơn
    let n = noise(p.x * 0.005, p.y * 0.005, frameCount * 0.005);
    let a = map(n, 0, 1, 40, 120) * (alpha / 255);

    // size dao động
    let size = map(noise(p.x * 0.008, p.y * 0.008, frameCount * 0.003), 0, 1, 4, 9);

    // vẽ hạt màu vàng pastel nhạt
    fill(255, a);
    ellipse(p.x, p.y, size);
  }

  blendMode(BLEND);
  pop();
}

function drawOverlayText(alpha = 255) {
  push();
  fill(255, alpha);
  textFont("Archivo");
  textSize(24);
  textAlign(CENTER, CENTER);
  text("", width/2, height - 105);
  pop();
}

// --- Key Events ---
function keyPressed() {
  console.log('keyPressed', { key, keyCode, state, typingMode, sentMessages });
  if (typingMode) {
    if (keyCode === ENTER) {
      if (inputBuffer.trim() !== "" && sentMessages < maxMessages) {
        // 👉 spawn LightParticle bay tới stone
        lightParticles.push(new LightParticle(width * 5.2 / 10, height / 2));

        sentMessages++;
        inputBuffer = "";

        if (sentMessages >= maxMessages) {
        typingMode = false;
        if (state === "stage3stone") {
          chatDisabled = true; // chỉ stage3stone mới tắt dialogue
        }
      }}
      
    } else if (keyCode === BACKSPACE) {
      if (inputBuffer.length > 0) {
        inputBuffer = inputBuffer.slice(0, -1);
      }
      backspaceHeld = true;
      backspaceCounter = 0;
    }
    return;
  }

  // --- các phím khác khi không ở typingMode ---
  if (key === " ") {
    startFade = true;
  }

  if (state === "perlinOverlay" && key === " ") {
    changeState("overlayFade");
    smokeActive = true;
    particleSystems = [];
    for (let m of matches) {
      let origin = createVector(m.x, m.y - m.h * 0.05);
      particleSystems.push(new ParticleSystem(0, origin, particleTexture));
    }
  }

  if (state === "reveal" && keyCode === RIGHT_ARROW) {
    stage1.setCompleted(true);
    matches = [];
    particleSystems = [];
    smokeActive = false;
    bgParticles = [];
    raindrops = [];
    ripples = [];
    for (let i = 0; i < 150; i++) raindrops.push(new RainDrop());
    changeState("stage2candle");
    showDayOne = false;
  }

  if (state === "stage2candle" && keyCode === RIGHT_ARROW) {
    if (candle && candle.isExtinguished()) {
      candle = null;
      raindrops = [];
      ripples = [];
      stage2.setCompleted(true);
      changeState("stage3stone");
    }
  }

  if (state === "stage3stone" && key === " ") {
    if (sentMessages >= maxMessages) {
      changeState("stage3heart");
      // không cần set stoneHeartStartTime/showHeart ở đây nếu changeState lo rồi
    } else {
      console.log('Cannot go to stage3heart: sentMessages', sentMessages, 'need', maxMessages);
    }
  }

if (state === "stage3heart" && key === " ") {
  if (heartClicked) {
    changeState("stage3done");
  } else {
    console.log("⚠️ You must click the heart first!");
  }
}

  if (key === ' ' && overlayStage1Active) {
    startFade = true;

    // chỉ bắt đầu nhạc lần đầu
    if (!bgMusic.isPlaying() && !musicMuted) {
      bgMusic.loop();
      bgMusic.setVolume(0.5);
    }
  }

  // toggle mute bằng M
  if (key === 'm' || key === 'M') {
    if (bgMusic.isPlaying()) {
      bgMusic.pause();
      musicMuted = true;
    } else {
      bgMusic.loop();
      bgMusic.setVolume(0.5);
      musicMuted = false;
    }
  }
}

function keyReleased() {
  if (keyCode === BACKSPACE) {
    backspaceHeld = false;
  }
}


// ----------------- Collecting Scene -----------------
function drawCollectingScene(alpha = 255) {
  push();
  tint(255, alpha);

  let matchH = height * 1;
  let matchW = matchImg ? matchImg.width * (matchH / matchImg.height) : matchH * 0.2;
  let cx = width / 2;
  let cy = height / 2 + matchH * 0.5;

  if (matchImg) {
    image(matchImg, cx, cy, matchW, matchH);
  } else {
    fill(200, 150, 100, alpha);
    rectMode(CENTER);
    rect(cx, cy, matchW, matchH);
  }

  let fireScale = map(collected, 0, maxParticles, 0.6, 0.8, true);
  if (collected > 0) {
    let ratio = fireImg ? fireImg.width / fireImg.height : 0.5;
    const FLAME_HEIGHT_RATIO = 0.6;
    let h = matchH * FLAME_HEIGHT_RATIO * fireScale;
    let w = h * ratio;
    push();
    translate(cx, cy - matchH * 0.26);
    imageMode(CENTER);
    if (fireImg) {
      tint(255, 178 * (alpha/255));
      image(fireImg, 0, -h/2, w, h);
    } else {
      fill(255, 150, 0, 150 * (alpha/255));
      ellipse(0, -h / 2, matchW * 0.4, h);
    }
    pop();
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    p.update(cx, cy, matchH);
    push();
    tint(255, alpha);
    p.show();
    pop();
    if (p.finished()) {
      collected++;
      particles.splice(i, 1);
    }
  }

  pop();
}

// ----------------- Draw Flame -----------------
function drawFlame(x, y, matchH) {
  let fireScale = 0.7;
  let ratio = fireImg ? fireImg.width / fireImg.height : 0.5;
  const FLAME_HEIGHT_RATIO = 0.6;
  let h = matchH * FLAME_HEIGHT_RATIO * fireScale;
  let w = h * ratio;

  push();
  imageMode(CENTER);
  if (fireImg) {
    tint(255, 178);
    image(fireImg, x, y, w, h);
    noTint();
  } else {
    drawingContext.shadowBlur = 40;
    drawingContext.shadowColor = color(0, 150, 255);
    noStroke();
    fill(0, 200, 255, 200);
    ellipse(x, y, w*0.5, h);
    drawingContext.shadowBlur = 0;
  }
  pop();
}

// ----------------- Mouse Events -----------------
function mousePressed() {
   if (overlayStage1Active) {
    return false;  // chặn mọi click
  }
  if (state === "matches") {
    let flamePos = matches[currentLit];
    if (dist(mouseX, mouseY, flamePos.x, flamePos.y) < 50) {
      dragging = true;
      dragPos = createVector(mouseX, mouseY);
    }
  } else if (state === "collecting" && collected < maxParticles) {
    particles.push(new Particle(mouseX, mouseY));
  }
  if (state === "stage2candle" && candle) {
    candle.checkPressed(mouseX, mouseY);
  }
  
  if (state === "stage3heart" && heartImg) {
    let elapsed = millis() - stoneHeartStartTime;

    // vị trí + scale hiện tại của heart
    let baseScale = 0.75;
    let heartScale = baseScale;
    if (elapsed > 1000) {
      let pulse = sin(frameCount * 0.08) * 0.02;
      heartScale = baseScale + pulse;
    }

    // toạ độ vẽ trái tim
    let hx = width * 5.2 / 10;
    let hy = height / 2;

    // kiểm tra click trúng bounding box (xấp xỉ)
    let hw = heartImg.width * heartScale / 2;  // nửa chiều rộng
    let hh = heartImg.height * heartScale / 2; // nửa chiều cao

    if (mouseX > hx - hw && mouseX < hx + hw &&
        mouseY > hy - hh && mouseY < hy + hh) {
      heartClicked = true;
    }
  }
}


function mouseDragged() {
  if (dragging) {
    dragPos.x = mouseX;
    dragPos.y = mouseY;
  }
  if (state === "stage2candle" && candle) {
    candle.drag(mouseX, mouseY);
}
}

function mouseReleased() {
  if (dragging) {
    dragging = false;
    if (currentLit < matches.length - 1) {
      let next = matches[currentLit + 1];
      if (dist(mouseX, mouseY, next.x, next.y) < 60) {
        animatingFlame = true;
        flameAnim = {
          start: createVector(matches[currentLit].x, matches[currentLit].y),
          end: createVector(next.x, next.y),
          progress: 0
        };
      }
    }
    if (state === "stage2candle" && candle) {
    candle.release();
  }
  }}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  bgLayer = createGraphics(windowWidth, windowHeight);

  // tính lại vị trí stage box để căn giữa dọc
  const offsetX = 100;
  const boxW = 300;
  const boxH = 50;
  const spacing = 10;
  const totalHeight = boxH * 3 + spacing * 2;
  const startY = (height - totalHeight) / 2;

  stage1.x = offsetX;
  stage1.y = startY;

  stage2.x = offsetX;
  stage2.y = startY + boxH + spacing;

  stage3.x = offsetX;
  stage3.y = startY + (boxH + spacing) * 2;
}

// ----------------- Background Particle -----------------
class BgParticle {
  constructor() {
    this.pos = createVector(random(width), random(height));
    this.r = random(3, 7);
    this.alpha = random(100, 200);
    this.baseAlpha = this.alpha;
    this.speed = random(0.2, 0.8);
    this.flickerSpeed = random(0.02, 0.05);
    this.angle = random(TWO_PI);
  }
  update() {
    this.pos.y += this.speed;
    if (this.pos.y > height) {
      this.pos.y = 0;
      this.pos.x = random(width);
    }
    this.angle += this.flickerSpeed;
    this.alpha = this.baseAlpha + sin(this.angle) * 80;
  }
  show(pg) {
    pg.fill(255, 255, 200, this.alpha * 0.5);
    pg.ellipse(this.pos.x, this.pos.y, this.r, this.r);
  }
}

// ----------------- Foreground Particle -----------------
class Particle {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.alpha = 255;
    this.size = random(height * 0.003, height * 0.015);
  }
  update(cx, cy, matchH) {
    let target = createVector(cx, cy - matchH * 0.35);
    let dir = p5.Vector.sub(target, this.pos);
    dir.setMag(3.5);
    this.vel.lerp(dir, 0.2);
    this.pos.add(this.vel);

    if (this.pos.dist(target) < 25) {
      this.alpha -= 25;
    }
  }
  show() {
    push();
    noStroke();
    drawingContext.shadowBlur = 25;
    drawingContext.shadowColor = color(255, 180, 50);
    let flicker = random(0.85, 1.15);
    for (let r = 8; r > 0; r--) {
      let alpha = (this.alpha / (r * 6)) * flicker;
      if (r > 4) fill(255, 125, 0, alpha);
      else fill(255, 200, 50, alpha);
      ellipse(this.pos.x, this.pos.y, this.size * r);
    }
    fill(255, 220, 100, this.alpha * flicker);
    ellipse(this.pos.x, this.pos.y, this.size, this.size);
    drawingContext.shadowBlur = 0;
    pop();
  }
  finished() {
    return this.alpha <= 0;
  }
}

// ----------------- Particle System (Smoke) -----------------
class PSParticle {
  constructor(pos, tex) {
    this.texture = tex;
    this.reset(pos);
  }

  reset(pos) {
    this.acc = createVector(0, 0);
    this.vel = createVector(random(-0.6, 0.6), random(-2, -0.7)); 
    this.pos = pos.copy();
    this.lifespan = 140; // sống vừa phải
    this.size = random(22, 30);
    this.active = true;
  }

  applyForce(force) {
    this.acc.add(force);
  }

  run() {
    if (!this.active) return;
    this.update();
    this.display();
  }

  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
    this.lifespan -= 2.8;

    if (this.lifespan <= 0) {
      this.active = false; // thay vì splice → đánh dấu chết
    }
  }

  display() {
    // Opacity full khi mới sinh, mờ dần khi gần hết
    let alpha = map(this.lifespan, 0, 140, 0, 255);
    tint(255, alpha); 
    image(this.texture, this.pos.x, this.pos.y, this.size, this.size);
    noTint();
  }

  isDead() {
    return !this.active;
  }
}

class ParticleSystem {
  constructor(num, origin, tex) {
    this.origin = origin.copy();
    this.particles = [];
    this.texture = tex;
    this.poolSize = 50; // giới hạn tối đa
    for (let i = 0; i < this.poolSize; i++) {
      this.particles.push(new PSParticle(this.origin, this.texture));
      this.particles[i].active = false; // ban đầu inactive
    }
  }

  addParticle() {
    if (frameCount % 2 !== 0) return; // spawn vừa phải

    // Tìm 1 hạt chết để tái sử dụng
    for (let p of this.particles) {
      if (!p.active) {
        p.reset(this.origin);
        break;
      }
    }
  }

  applyForce(f) {
    for (let p of this.particles) {
      if (p.active) p.applyForce(f);
    }
  }

  run() {
    for (let p of this.particles) {
      if (p.active) p.run();
    }
  }
}
// ----------------- Rain & Ripple -----------------
class RainDrop {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = random(width);
    this.y = random(-height, 0);
    this.speed = random(5, 10);
    this.len = random(10, 20);
  }

  update() {
    this.y += this.speed;
  if (this.y > height) {
  if (ripples.length < 20) {
    let rx = random(width);
    let ry = random(height * 4/7, height);
    ripples.push(new Ripple(rx, ry));
  }
  this.reset();
}
  }

  show() {
    stroke(180, 200, 255, 180);
    strokeWeight(2);
    line(this.x, this.y, this.x, this.y + this.len);
  }
}

class Ripple {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.r = 5;
    this.alpha = 200;
  }

  update() {
    this.r += 1.5;         // lan rộng
    this.alpha -= 3;       // mờ dần
  }

  show() {
    noFill();
    stroke(200, 200, 255, this.alpha);
    strokeWeight(2);
    ellipse(this.x, this.y, this.r * 2);
  }

  finished() {
    return this.alpha <= 0;
  }
}

// ----------------- Candle (Stage 2) -----------------
class Candle {
  constructor(x, y, img, fireImg) {
    this.x = x;
    this.y = y;
    this.img = img;
    this.fireImg = fireImg;
    this.w = width * 0.12; 
    this.h = this.w * (img.height / img.width);
    this.dragging = false;
    this.offsetX = 0;
    this.offsetY = 0;

    // 🔹 biến mới cho lửa
    this.flameScale = 1.2;     // tỉ lệ lửa ban đầu
    this.hitCount = 0;         // số lần mưa rơi trúng
    this.flameAlive = true;    // còn lửa hay đã tắt
  }

  display() {
  imageMode(CENTER);
  if (this.img) {
    image(this.img, this.x, this.y, this.w, this.h);
  }

  if (this.fireImg && this.flameAlive) {
    let fw = this.w * 0.6 * this.flameScale;
    let fh = this.h * 0.6 * this.flameScale;

    let baseY = this.y - this.h / 2 + this.h * 0.3; // đáy cố định
    let fireX = this.x + this.w * 0.02;
    let fireY = baseY - fh / 2;                     // tính ngược từ đáy

    tint(255, 178);
    image(this.fireImg, fireX, fireY, fw, fh);
    noTint();
  }
}


  // 🔹 gọi mỗi frame để check mưa rơi trúng
  checkRainHit(raindrops) {
  if (!this.flameAlive) return;

  for (let drop of raindrops) {
    let fw = this.w * 0.6 * this.flameScale;
    let fh = this.h * 0.6 * this.flameScale;

    let baseY = this.y - this.h / 2 + this.h * 0.3; // cùng offset như display()
    let fireX = this.x + this.w * 0.03;
    let fireY = baseY - fh / 2;

    if (
      drop.x > fireX - fw/2 &&
      drop.x < fireX + fw/2 &&
      drop.y > fireY - fh/2 &&
      drop.y < fireY + fh/2
    ) {
      this.hitCount++;
      this.flameScale *= 0.95;
      drop.y = height + 10;
      if (this.hitCount >= 20) {
        this.flameAlive = false;
      }
    }
  }
}


  checkPressed(mx, my) {
    if (
      mx > this.x - this.w / 2 &&
      mx < this.x + this.w / 2 &&
      my > this.y - this.h / 2 &&
      my < this.y + this.h / 2
    ) {
      this.dragging = true;
      this.offsetX = this.x - mx;
      this.offsetY = this.y - my;
    }
  }

    drag(mx, my) {
    if (this.dragging) {
      this.x = mx + this.offsetX;
      this.y = my + this.offsetY;
    }
  }

  release() {
    this.dragging = false;
  }

  // kiểm tra nến đã tắt hẳn chưa
  isExtinguished() {
    return !this.flameAlive;
  }
}

class Char {
  constructor() {
    this.changeChar();
    this.speed = floor(random([0,0,0,0,0,0,0,0,0,10,15,20]));
    this.value = this.randomLatin();
  }

  randomLatin() {
    let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    return chars.charAt(floor(random(chars.length)));
  }

  changeChar() {
    if (frameCount % this.speed == 0) {
      this.value = this.randomLatin();
    }
  }
}

class Column {
  constructor(x) {
    this.x = x;
    this.string = [];
    this.string[0] = new Char();
    this.speed = int(random(4,6));
    this.size = int(random(10,30));
  }

  jump() {
    if (frameCount % this.speed == 0) {
      this.string.push(new Char());
    }
  }

  show() {
    for (let y = 0; y < this.string.length - 1; y++) {
      fill(180, map(y, this.string.length - this.size, this.string.length, 0, 255)); // xám mờ dần
      text(this.string[y].value, this.x * charSize + (width % charSize) / 2 , (y+1) * charSize);
      this.string[y].changeChar();
    }
    fill(220); // sáng hơn ở đầu chuỗi
    text(this.string[this.string.length - 1].value, this.x * charSize + (width % charSize) / 2, (this.string.length) * charSize);

    if (this.string.length - this.size > height/charSize) {
      this.string = [];
      this.string[0] = new Char();
      this.speed = int(random(4,6));
      this.size = int(random(10,20));
    }
  }
}

class LightParticle {
  constructor(targetX, targetY) {
    this.start = createVector(width / 2, height); // từ giữa cạnh dưới
    this.pos = this.start.copy();
    this.target = createVector(targetX, targetY);
    this.vel = p5.Vector.sub(this.target, this.start).setMag(5); // bay lên theo hướng target
    this.reached = false;
  }

  update() {
  if (!this.reached) {
    this.pos.add(this.vel);

    let d = dist(this.pos.x, this.pos.y, this.target.x, this.target.y);

    // tính size fluid dựa trên ratio màn hình
    let maxSize = height * lightMaxRatio;
    let minSize = height * lightMinRatio;
    this.size = map(d, 0, height, minSize, maxSize);

    // --- khi LIGHT chạm stone ---
if (d < 30) {
  this.reached = true;
  // tăng base scale (không vượt max)
  stoneBaseScale = min(stoneBaseScale + 0.1, stoneScaleMax);
  // kích hoạt pulse
  pulseStrength = 0.08;  // biên độ đập ban đầu
}
  }
  } 

  show() {
    push();
    imageMode(CENTER);
    tint(255, 220);
    image(lightImg, this.pos.x, this.pos.y, this.size, this.size);
    pop();
  }

  isFinished() {
    return this.reached; // xoá khi đã tới nơi
  }
}

class TextParticle {
  constructor(ch, x, y) {
    this.ch = ch;
    this.pos = createVector(x, y);

    // vận tốc ban đầu -> bay lan xa hơn
    this.vel = p5.Vector.random2D().mult(random(2, 6));

    this.baseAlpha = random(150, 255); // opacity khởi tạo ngẫu nhiên
    this.alpha = this.baseAlpha;
    this.life = 0; // đếm tuổi hạt để tính dao động
  }

  update() {
    this.life++;

    // bay theo vận tốc chính
    this.pos.add(this.vel);

    // thêm dao động lượn sóng
    let wiggleX = sin(this.life * 0.2) * 1.5; // biên độ 1.5px
    let wiggleY = cos(this.life * 0.25) * 1.5;
    this.pos.add(wiggleX, wiggleY);

    // chậm mờ dần để sống lâu hơn
    this.pos.add(this.vel);
    this.alpha -= 1.2; // giảm dần (fade out)
  }

  show() {
    push();
    fill(255, this.alpha);
    noStroke();
    textSize(20);
    textAlign(CENTER, CENTER);
    text(this.ch, this.pos.x, this.pos.y);
    pop();
  }

  isFinished() {
    return this.alpha <= 0;
  }
}

function generateHeartParticles(img, cx, cy, scl) {
  img.loadPixels();
  let step = 10; // sampling mỗi 10px
  let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".split("");

  for (let y = 0; y < img.height; y += step) {
    for (let x = 0; x < img.width; x += step) {
      let idx = 4 * (y * img.width + x);
      let alpha = img.pixels[idx + 3];
      if (alpha > 100) { 
        let worldX = cx + (x - img.width/2) * scl;
        let worldY = cy + (y - img.height/2) * scl;

        let ch = random(chars); // ký tự ngẫu nhiên
        textParticles.push(new TextParticle(ch, worldX, worldY));
      }
    }
  }
}

// ----------------- Fire Effect -----------------
function initFireSystem() {
  fireWidth = int(width / fireElemLength);
  fireHeight = int((height * 0.5) / fireElemLength); // 🔥 cao 50% màn hình

  fireLines = [];
  for (let i = 0; i < fireHeight; i++) {
    fireLines[i] = [];
    for (let x = 0; x < fireWidth; x++) {
      fireLines[i][x] = 0;
    }
  }
  initializePalette();
}

function initializePalette() {
  for (let i = 0; i < nbColors; i++) {
  let val = exp(i / 10) - 1;
  let red   = map(val, 0, exp(7.5), 0, 17);
  let green = map(val, 0, exp(7.5), 0, 17);
  let blue  = map(val, 0, exp(7.5), 0, 17);

    if (green > 140) {  // ngưỡng sáng nhất thì trắng
      red = green = blue = 255;
    }
    if (red < 20 && green < 20 && blue < 20) {  // ngưỡng tối thì đen
      red = green = blue = 0;
    }
    palette[i] = color(red, green, blue);
  }
}


function initFireLine() {
  for (let x = 0; x < fireWidth; x++) {
    fireLines[fireHeight - 1][x] = random(0, nbColors);
    fireLines[fireHeight - 2][x] = random(0, nbColors);
    fireLines[fireHeight - 3][x] = random(0, 100);
  }
}

function fireGrow() {
  for (let y = fireHeight - 2; y >= 1; y--) {
    for (let x = 1; x < fireWidth - 1; x++) {
      let c1 = fireLines[y + 1][x];
      let c2 = fireLines[y][x - 1];
      let c3 = fireLines[y][x + 1];
      let c4 = fireLines[y - 1][x];
      let c5 = fireLines[y][x];
      let newCol = int((c1 + c2 + c3 + c4 + c5) / 5) - 1;
      fireLines[y - 1][x] = newCol;
    }
  }
}

function drawFireAtBottom() {
  initFireLine();
  fireGrow();

  blendMode(ADD); // ✨ sáng rực
  for (let y = fireHeight - 1; y > 0; y--) {
    for (let x = 0; x < fireWidth - 1; x++) {
      let idx = int(fireLines[y][x]);
      if (idx < 0) idx = 0;
      if (idx >= nbColors) idx = nbColors - 1;

      let col = palette[idx];

      // fade alpha dần lên trên (seamless)
      let fadeY = map(y, fireHeight - 1, 0, fireAlpha, 0); 
      col.setAlpha(fadeY);

      fill(col);
      noStroke();

      rect(
        int(x * fireElemLength),
        int(height - (fireHeight - y) * fireElemLength),
        fireElemLength,
        fireElemLength
      );
    }
  }
  blendMode(BLEND); // reset về mặc định
}
function Star() {
  this.x = random(-width, width);
  this.y = random(-height, height);
  this.z = random(width);
  this.pz = this.z;

  this.update = function() {
  // tốc độ điều khiển bằng chuột
  speed = map(mouseX, 0, width, 0, 50);

  this.z -= speed;
  if (this.z < 1) {
      this.z = width;
      this.x = random(-width, width);
      this.y = random(-height, height);
      this.pz = this.z;
    }
  };

  this.show = function() {
    fill(255);
    noStroke();

    let sx = map(this.x / this.z, 0, 1, 0, width);
    let sy = map(this.y / this.z, 0, 1, 0, height);

    let r = map(this.z, 0, width, 16, 0);
    ellipse(sx, sy, r, r);

    let px = map(this.x / this.pz, 0, 1, 0, width);
    let py = map(this.y / this.pz, 0, 1, 0, height);

    this.pz = this.z;

    stroke(255);
    line(px, py, sx, sy);
  };
}

// --- lớp ripple riêng cho overlayStage1 ---
class OverlayRipple {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.r = 10;          // bán kính bắt đầu
    this.maxR = 200;      // bán kính tối đa
    this.alpha = 180;     // độ mờ
    this.growth = random(1.5, 3); // tốc độ lan
    this.fade = random(2, 4);     // tốc độ mờ
  }

  update() {
    this.r += this.growth;
    this.alpha -= this.fade;
  }

  show() {
    noFill();
    stroke(255, this.alpha); // màu trắng
    strokeWeight(2);
    ellipse(this.x, this.y, this.r * 2);
  }

  finished() {
    return this.alpha <= 0 || this.r >= this.maxR;
  }
}