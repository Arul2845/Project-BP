// ============================================================
// PREETY'S 21st BIRTHDAY WEBSITE — app.js
// ============================================================

// ── Globals ──────────────────────────────────────────────────
const pages = ['home', 'memories', 'gallery', 'letter'];
let currentPage = '';
let musicPlaying = false;
let candlesBlown = false;
let audioContext = null;
let micStream = null;
let micAnalyser = null;
let micSource = null;

// 🔒 Passcode Lock Screen Globals
let isUnlocked = false;
let passcodeBuffer = "";
let pendingDestination = "";
const PASSCODE = "120322";

// ── On DOM Ready ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  initCursor();
  spawnPetals();
  await loadPages();
});

// ── Load Page HTML Files Dynamically ──────────────────────────
async function loadPages() {
  const pagesToLoad = ['home', 'memories', 'gallery', 'letter'];
  const mainStories = document.getElementById('mainStories');
  const bottomNav = document.getElementById('bottomNav');

  if (!mainStories || !bottomNav) return;

  const loadPromises = pagesToLoad.map(async (pageName) => {
    try {
      const response = await fetch(`pages/${pageName}.html`);
      if (!response.ok) throw new Error(`Failed to load ${pageName}.html`);
      const htmlText = await response.text();
      return { name: pageName, html: htmlText };
    } catch (err) {
      console.error(`Error loading page ${pageName}:`, err);
      // Fallback content in case of fetch failure
      return {
        name: pageName,
        html: `<section class="page" id="page-${pageName}">
                 <div class="section-header">
                   <h2 class="section-title">Failed to load ${pageName}</h2>
                   <p class="section-sub">Please make sure you are running the project using a local web server (like npm run dev).</p>
                 </div>
               </section>`
      };
    }
  });

  const results = await Promise.all(loadPromises);

  results.forEach(result => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = result.html.trim();
    const pageElement = tempDiv.firstElementChild;
    if (pageElement) {
      mainStories.insertBefore(pageElement, bottomNav);
    }
  });
}


// ── Custom Cursor with Trail ──────────────────────────────────
function initCursor() {
  const cursor = document.getElementById('cursor');
  if (!cursor) return;
  let mx = -100, my = -100, cx = -100, cy = -100;
  let hasMoved = false;
  let isTouch = false;

  // Prevent showing custom heart cursor on mobile touch actions
  window.addEventListener('touchstart', () => {
    isTouch = true;
    cursor.style.opacity = '0';
  }, { passive: true });

  document.addEventListener('mousemove', e => {
    if (isTouch) return; // ignore touch pointer emulation
    mx = e.clientX;
    my = e.clientY;

    if (!hasMoved) {
      hasMoved = true;
      cursor.style.opacity = '1'; // Make visible only when mouse actually moves
    }

    // Spawn particle sparks as the mouse moves
    if (Math.random() < 0.22) {
      createCursorSpark(e.clientX, e.clientY);
    }
  });

  function animateCursor() {
    cx += (mx - cx) * 0.15;
    cy += (my - cy) * 0.15;
    cursor.style.left = cx + 'px';
    cursor.style.top = cy + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  document.addEventListener('mousedown', () => {
    if (isTouch) return;
    cursor.style.transform = 'translate(-50%,-50%) scale(1.4)';
    for (let i = 0; i < 5; i++) {
      createCursorSpark(mx, my, true);
    }
  });

  document.addEventListener('mouseup', () => {
    if (isTouch) return;
    cursor.style.transform = 'translate(-50%,-50%) scale(1)';
  });
}

function createCursorSpark(x, y, isClick = false) {
  const spark = document.createElement('span');
  spark.className = 'cursor-spark';

  const particles = ['💖', '✨', '🌸', '🌸', '✨'];
  spark.textContent = particles[Math.floor(Math.random() * particles.length)];

  const angle = Math.random() * Math.PI * 2;
  const distance = isClick ? 22 + Math.random() * 45 : 5 + Math.random() * 15;
  const tx = Math.cos(angle) * distance;
  const ty = Math.sin(angle) * distance - (isClick ? 30 : 50);

  spark.style.cssText = `
    position: fixed;
    left: ${x}px;
    top: ${y}px;
    font-size: ${isClick ? 10 + Math.random() * 8 : 7 + Math.random() * 6}px;
    pointer-events: none;
    z-index: 9999;
    opacity: 0.9;
    transform: translate(-50%, -50%);
    transition: transform 1.2s cubic-bezier(0.1, 0.8, 0.3, 1), opacity 1.2s ease-out;
  `;

  document.body.appendChild(spark);

  requestAnimationFrame(() => {
    spark.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0)`;
    spark.style.opacity = '0';
  });

  setTimeout(() => spark.remove(), 1250);
}

// ── Floating Petals ───────────────────────────────────────────
function spawnPetals() {
  const container = document.getElementById('globalPetals');
  if (!container) return;
  const petalEmojis = ['🌸', '🌷', '🌺', '✿', '❀', '🌹'];
  for (let i = 0; i < 28; i++) {
    const p = document.createElement('span');
    p.className = 'petal';
    p.textContent = petalEmojis[Math.floor(Math.random() * petalEmojis.length)];
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      font-size: ${12 + Math.random() * 16}px;
      animation-duration: ${8 + Math.random() * 12}s;
      animation-delay: ${-Math.random() * 15}s;
      opacity: ${0.4 + Math.random() * 0.5};
    `;
    container.appendChild(p);
  }
}

// ── Interactive Cinematic Sound Synthesizer ─────────────────
function playCinematicSound(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();

    if (type === 'chime') {
      // Warm golden opening chime
      const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      freqs.forEach((f, idx) => {
        setTimeout(() => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, ctx.currentTime);

          gain.gain.setValueAtTime(0.2, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start();
          osc.stop(ctx.currentTime + 1.5);
        }, idx * 120);
      });
    } else if (type === 'magic') {
      // Mystical ascending sweep for blowing candles
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50, 1318.51];
      notes.forEach((noteFreq, idx) => {
        setTimeout(() => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(noteFreq, ctx.currentTime);

          gain.gain.setValueAtTime(0.15, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start();
          osc.stop(ctx.currentTime + 1.2);
        }, idx * 80);
      });
    }
  } catch (err) {
    console.log("Audio synthesis blocked or unsupported:", err);
  }
}

// ── STEP 1: Gift Box Opening Interaction ─────────────────────
function openGiftBox() {
  const boxWrap = document.getElementById('giftBoxWrap');
  if (!boxWrap || boxWrap.classList.contains('untied')) return;

  boxWrap.classList.add('untied');
  playCinematicSound('chime');

  // Create simple burst particles on gift opening
  createIntroExplosionParticles();

  setTimeout(() => {
    // Transition to Step 2 (Birthday Cake)
    document.getElementById('step-gift').classList.remove('active');
    document.getElementById('step-cake').classList.add('active');
  }, 1200);
}

function createIntroExplosionParticles() {
  const container = document.getElementById('introParticles');
  if (!container) return;
  const colors = ['#E58AAE', '#D4A95F', '#5B2E48', '#FFF'];

  for (let i = 0; i < 40; i++) {
    const p = document.createElement('div');
    p.style.cssText = `
      position: absolute;
      width: ${6 + Math.random() * 8}px;
      height: ${6 + Math.random() * 8}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      border-radius: 50%;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none;
      z-index: 8;
      transition: transform 1.5s cubic-bezier(0.1, 0.8, 0.3, 1), opacity 1.5s ease-out;
    `;
    container.appendChild(p);

    const angle = Math.random() * Math.PI * 2;
    const distance = 80 + Math.random() * 200;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;

    requestAnimationFrame(() => {
      p.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0)`;
      p.style.opacity = '0';
    });

    setTimeout(() => p.remove(), 1600);
  }
}

// ── STEP 2: Birthday Cake & Microphone blowing logic ─────────
function enableMicrophoneBlow() {
  const btn = document.getElementById('micBtn');
  if (!btn || btn.classList.contains('active')) return;

  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      btn.classList.add('active');
      btn.innerHTML = `<span class="mic-icon">🎤</span><span class="mic-text">Mic Enabled. Blow now!</span>`;

      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      micAnalyser = audioContext.createAnalyser();
      micSource = audioContext.createMediaStreamSource(stream);

      micAnalyser.fftSize = 256;
      micSource.connect(micAnalyser);
      micStream = stream;

      detectBlowing();
    })
    .catch(err => {
      console.log("Microphone access denied:", err);
      alert("Microphone blocked. Simply tap the candles to blow them out!");
    });
}

function detectBlowing() {
  if (candlesBlown) return;

  const bufferLength = micAnalyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  micAnalyser.getByteFrequencyData(dataArray);

  // Calculate average volume in blowing frequency band (lower to mid range frequencies)
  let sum = 0;
  for (let i = 2; i < 15; i++) { // Target lower-middle frequency registers
    sum += dataArray[i];
  }
  const average = sum / 13;

  // If blow threshold is reached
  if (average > 75) {
    extinguishCandles();
  } else {
    requestAnimationFrame(detectBlowing);
  }
}

function manualBlowCandles() {
  extinguishCandles();
}

function extinguishCandles() {
  if (candlesBlown) return;
  candlesBlown = true;

  // Extinguish stream if active
  if (micStream) {
    micStream.getTracks().forEach(track => track.stop());
  }

  // Add extinguished status triggers
  document.querySelectorAll('.candle').forEach(c => {
    c.classList.add('extinguished');
  });

  // Chime music sweep
  playCinematicSound('magic');

  // Sparkles & cinematic fade transitions
  const burst = document.getElementById('lightBurst');
  if (burst) {
    setTimeout(() => {
      burst.classList.add('active');
    }, 600);
  }

  setTimeout(() => {
    // Fade reveal main Stories
    document.getElementById('introStage').classList.add('dissolve');
    document.getElementById('mainStories').classList.add('visible');

    // Auto initiate Page 1
    navigateTo('home');

    // Spawn active celebratory confetti
    launchConfetti();

    setTimeout(() => {
      document.getElementById('introStage').remove();
    }, 1500);
  }, 1600);
}

// ── Confetti Burst Stage Generator ────────────────────────────
function launchConfetti() {
  const container = document.getElementById('confettiStage');
  if (!container) return;
  const colors = ['#E58AAE', '#D4A95F', '#5B2E48', '#FAF0F4', '#FFF'];
  for (let i = 0; i < 90; i++) {
    const c = document.createElement('div');
    c.className = 'confetti-piece';
    c.style.cssText = `
      left: ${Math.random() * 100}%;
      top: ${-10 - Math.random() * 40}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      width: ${6 + Math.random() * 8}px;
      height: ${6 + Math.random() * 8}px;
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
      animation-delay: ${Math.random() * 2}s;
      animation-duration: ${2.5 + Math.random() * 2}s;
    `;
    container.appendChild(c);
  }
  setTimeout(() => container.innerHTML = '', 6000);
}

// ── Extra confetti for letter open ───────────────────────────
function burstConfetti() {
  const container = document.createElement('div');
  container.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9998;overflow:hidden;';
  document.body.appendChild(container);
  const colors = ['#E58AAE', '#D4A95F', '#5B2E48', '#FAF0F4'];
  for (let i = 0; i < 70; i++) {
    const c = document.createElement('div');
    c.className = 'confetti-piece';
    c.style.cssText = `
      left: ${Math.random() * 100}%;
      top: 30%;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      width: ${6 + Math.random() * 8}px;
      height: ${6 + Math.random() * 8}px;
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
      animation-delay: ${Math.random() * 0.5}s;
      animation-duration: ${2.2 + Math.random() * 1.5}s;
    `;
    container.appendChild(c);
  }
  setTimeout(() => container.remove(), 5000);
}

// ── Navigation ────────────────────────────────────────────────
function navigateTo(page) {
  if (page === currentPage) return;

  // 🔒 PASSCODE LOCK INTERCEPT
  if (page !== 'home' && !isUnlocked) {
    showLockScreen(page);
    return;
  }

  if (currentPage) {
    const prev = document.getElementById('page-' + currentPage);
    if (prev) prev.classList.remove('active');
  }

  const next = document.getElementById('page-' + page);
  if (next) {
    next.classList.add('active');
    next.scrollTop = 0;
  }

  currentPage = page;
  updateNavState(page);
  setTimeout(triggerScrollAnimations, 200);
}

function updateNavState(page) {
  document.querySelectorAll('.nav-pill').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.getElementById('nav-' + page);
  if (activeBtn) activeBtn.classList.add('active');

  document.querySelectorAll('.dot').forEach((dot, i) => {
    dot.classList.toggle('active', pages[i] === page);
  });
}

// ── Scroll Animations ─────────────────────────────────────────
function triggerScrollAnimations() {
  const activeEl = document.getElementById('page-' + currentPage);
  if (!activeEl) return;

  const animatable = activeEl.querySelectorAll('.reveal');
  animatable.forEach((el, i) => {
    setTimeout(() => el.classList.add('visible'), i * 140);
  });
}

// ── Gallery Upload & Expand Modal ─────────────────────────────
function triggerUpload(index) {
  const photo = document.getElementById('photo-' + index);
  if (photo && photo.classList.contains('loaded')) {
    // If photo is already uploaded, clicking expands it in modal!
    expandPhotoModal(photo.src, index);
  } else {
    // Trigger hidden file picker
    document.getElementById('upload-' + index).click();
  }
}

function handleUpload(event, index) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = document.getElementById('photo-' + index);
    const placeholder = document.getElementById('placeholder-' + index);
    if (img) {
      img.src = e.target.result;
      img.classList.add('loaded');
    }
    if (placeholder) {
      placeholder.style.display = 'none';
    }
  };
  reader.readAsDataURL(file);
}

function expandPhotoModal(src, index) {
  const modal = document.getElementById('photoModal');
  const modalImg = document.getElementById('modalImg');
  const modalQuote = document.getElementById('modalQuote');

  const quotes = [
    "\"In every picture, you are the most beautiful thing.\"",
    "\"That day changed everything in my world.\"",
    "\"Some paths are meant to cross twice, always.\"",
    "\"I still hear your laugh from that sweet afternoon.\"",
    "\"You are the memory I always return to.\"",
    "\"Every time I see this picture, I can't help but smile.\"",
    "\"Your happiness is the most beautiful thing I've ever seen.\"",
    "\"Some moments are captured by the camera, but lived forever in the heart.\"",
    "\"A perfect capture of a perfect person.\"",
    "\"No matter where life takes us, I'll always be glad you were in mine.\""
  ];

  if (!modal || !modalImg) return;
  modalImg.src = src;
  modalQuote.textContent = quotes[index] || "";
  modal.classList.add('open');
}

function closePhotoModal() {
  const modal = document.getElementById('photoModal');
  if (modal) modal.classList.remove('open');
}

// ── Envelope / Letter ─────────────────────────────────────────
let envelopeOpened = false;
function openLetter() {
  if (envelopeOpened) return;
  envelopeOpened = true;

  const flap = document.getElementById('envFrontFlap');
  const wrap = document.getElementById('envContainer');
  const letter = document.getElementById('letterSheet');
  const prompt = document.getElementById('tapPrompt');

  if (prompt) prompt.style.opacity = '0';
  if (flap) flap.classList.add('open');

  setTimeout(() => {
    if (wrap) wrap.classList.add('opened');
    if (letter) letter.classList.add('open');
    burstConfetti();
  }, 750);
}



// ── Keyboard nav ──────────────────────────────────────────────
document.addEventListener('keydown', (e) => {
  const idx = pages.indexOf(currentPage);
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
    if (idx < pages.length - 1) navigateTo(pages[idx + 1]);
  }
  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    if (idx > 0) navigateTo(pages[idx - 1]);
  }
});

// ── Touch/Swipe nav ───────────────────────────────────────────
let touchStartX = 0, touchStartY = 0;
document.addEventListener('touchstart', e => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });
document.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;
  if (Math.abs(dx) < 30 && Math.abs(dy) > 60) {
    return;
  }
  if (Math.abs(dx) > 60 && Math.abs(dy) < 40) {
    const idx = pages.indexOf(currentPage);
    if (dx < 0 && idx < pages.length - 1) navigateTo(pages[idx + 1]);
    if (dx > 0 && idx > 0) navigateTo(pages[idx - 1]);
  }
}, { passive: true });

// ── Passcode Lock Screen Overlay Interactions ────────────────
function showLockScreen(destination) {
  pendingDestination = destination;
  passcodeBuffer = "";
  updateLockDots();
  const screen = document.getElementById('lockScreen');
  if (screen) {
    screen.classList.remove('slide-away');
    screen.classList.add('show');
  }
}

function closeLockScreen() {
  const screen = document.getElementById('lockScreen');
  if (screen) {
    screen.classList.remove('show');
  }
  passcodeBuffer = "";
}

function pressKey(val) {
  if (val === 'C') {
    passcodeBuffer = "";
  } else if (val === 'delete') {
    passcodeBuffer = passcodeBuffer.slice(0, -1);
  } else {
    if (passcodeBuffer.length < 6) {
      passcodeBuffer += val;
    }
  }
  
  updateLockDots();
  
  if (passcodeBuffer.length === 6) {
    setTimeout(verifyPasscode, 220);
  }
}

function updateLockDots() {
  const dots = document.querySelectorAll('.lock-dot');
  dots.forEach((dot, idx) => {
    dot.classList.remove('active', 'correct', 'error');
    if (idx < passcodeBuffer.length) {
      dot.classList.add('active');
    }
  });
}

function verifyPasscode() {
  const icon = document.getElementById('lockIconWrap');
  const dots = document.getElementById('lockDots');
  const allDots = document.querySelectorAll('.lock-dot');
  
  if (passcodeBuffer === PASSCODE) {
    // Correct passcode! Mark dots green!
    allDots.forEach(dot => {
      dot.classList.remove('active');
      dot.classList.add('correct');
    });
    
    // Play lock unlock chime music sweep!
    playCinematicSound('magic');
    
    // Animate lock screen slide-down away
    setTimeout(() => {
      const screen = document.getElementById('lockScreen');
      if (screen) {
        screen.classList.remove('show');
        screen.classList.add('slide-away');
      }
      isUnlocked = true;
      
      // Transition immediately to the intended locked page
      if (pendingDestination) {
        navigateTo(pendingDestination);
      }
    }, 450);
    
  } else {
    // Incorrect passcode! Mark dots red and haptic shake container!
    allDots.forEach(dot => {
      dot.classList.remove('active');
      dot.classList.add('error');
    });
    
    if (icon) icon.classList.add('shake');
    if (dots) dots.classList.add('shake');
    
    setTimeout(() => {
      if (icon) icon.classList.remove('shake');
      if (dots) dots.classList.remove('shake');
      passcodeBuffer = "";
      updateLockDots();
    }, 750);
  }
}

// Intercept typing numbers on physical keyboard when lock screen is open
document.addEventListener('keydown', (e) => {
  const screen = document.getElementById('lockScreen');
  if (screen && screen.classList.contains('show')) {
    if (e.key >= '0' && e.key <= '9') {
      pressKey(e.key);
    } else if (e.key === 'Backspace') {
      pressKey('delete');
    } else if (e.key === 'Escape') {
      closeLockScreen();
    }
  }
});

