(function(){
  "use strict";

  // totally not ripped :cat2: :black_cat: switcher 
  var theBigHtmlDoc = document.documentElement;
  var darkSideSwitch = document.getElementById('theme-toggle');
  var switchTextThingy = document.getElementById('theme-label');

  function doesUserLikeDarkStuff() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function applyMyFavoriteVibe(vibeCheck) {
    theBigHtmlDoc.setAttribute('data-theme', vibeCheck);
    darkSideSwitch.setAttribute('aria-pressed', vibeCheck === 'dark' ? 'true' : 'false');
    switchTextThingy.textContent = vibeCheck === 'dark' ? 'Light mode' : 'Dark mode';
    try { localStorage.setItem('primeparen-theme', vibeCheck); } catch(e){}
  }

  var savedVibe = null;
  try { savedVibe = localStorage.getItem('primeparen-theme'); } catch(e){}
  applyMyFavoriteVibe(savedVibe || (doesUserLikeDarkStuff() ? 'dark' : 'light'));

  darkSideSwitch.addEventListener('click', function(){
    var currentVibe = theBigHtmlDoc.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    applyMyFavoriteVibe(currentVibe === 'dark' ? 'light' : 'dark');
  });

  // basically to tell goober how to do calculations so chrome doesn't complain
  var mathBrainWorkerCode = `"use strict";
  var primeNuggets = [];
  var howFarWeSieved = 1;

  function feedTheSieveMoreNumbers(limit) {
    limit = Math.max(limit, 1000);
    if (limit <= howFarWeSieved) return;
    var sieveOfEratosthenes = new Uint8Array(limit + 1);
    sieveOfEratosthenes.fill(1);
    sieveOfEratosthenes[0] = 0; sieveOfEratosthenes[1] = 0;
    for (var i = 2; i * i <= limit; i++) {
      if (sieveOfEratosthenes[i]) {
        for (var j = i * i; j <= limit; j += i) sieveOfEratosthenes[j] = 0;
      }
    }
    var foundPrimes = [];
    for (var k = 2; k <= limit; k++) if (sieveOfEratosthenes[k]) foundPrimes.push(k);
    primeNuggets = foundPrimes;
    howFarWeSieved = limit;
  }
  feedTheSieveMoreNumbers(1 << 16);

  function isThisPrimeBro(n) {
    if (n < 2) return false;
    if (n < 4) return true;
    if (n % 2 === 0) return false;
    var r = Math.floor(Math.sqrt(n));
    if (r > howFarWeSieved) feedTheSieveMoreNumbers(Math.min(r + 1000, 20000000));
    for (var i = 0; i < primeNuggets.length; i++) {
      var p = primeNuggets[i];
      if (p > r) break;
      if (n % p === 0) return false;
    }
    return true;
  }

  function chopIntoPrimeChunks(n) {
    if (!Number.isInteger(n) || n < 1) throw new Error("Hey, n needs to be a positive whole number!");
    var legoBlocks = [];
    var m = n;
    if (m === 1) return legoBlocks;
    var r0 = Math.floor(Math.sqrt(m)) + 1;
    if (r0 > howFarWeSieved) feedTheSieveMoreNumbers(Math.min(r0 + 1000, 20000000));
    for (var i = 0; i < primeNuggets.length; i++) {
      var p = primeNuggets[i];
      if (p * p > m) break;
      if (m % p === 0) {
        var count = 0;
        while (m % p === 0) { m /= p; count++; }
        legoBlocks.push({ p: p, e: count });
      }
    }
    if (m > 1) legoBlocks.push({ p: m, e: 1 });
    return legoBlocks;
  }

  function countPrimesUpTo(n) {
    if (n < 2) return 0;
    var r = Math.floor(Math.sqrt(n));
    var V = [];
    for (var i = 1; i <= r; i++) V.push(Math.floor(n / i));
    var last = V[V.length - 1];
    for (var v = last - 1; v >= 1; v--) V.push(v);

    var S = new Map();
    for (var vi = 0; vi < V.length; vi++) S.set(V[vi], V[vi] - 1);

    for (var p = 2; p <= r; p++) {
      var Sp = S.get(p);
      var Sp1 = S.get(p - 1);
      if (Sp === Sp1) continue;
      var sp = Sp1;
      var p2 = p * p;
      for (var idx = 0; idx < V.length; idx++) {
        var vv = V[idx];
        if (vv < p2) break;
        var vip = Math.floor(vv / p);
        S.set(vv, S.get(vv) - (S.get(vip) - sp));
      }
    }
    return S.get(n);
  }

  function findSegmentedPrimes(lo, hi) {
    lo = Math.max(2, lo);
    if (hi < lo) return [];
    var size = hi - lo + 1;
    var composite = new Uint8Array(size);
    var r = Math.floor(Math.sqrt(hi)) + 1;
    if (r > howFarWeSieved) feedTheSieveMoreNumbers(Math.min(r + 1000, 20000000));
    for (var i = 0; i < primeNuggets.length; i++) {
      var p = primeNuggets[i];
      if (p * p > hi) break;
      var start = Math.max(p * p, Math.ceil(lo / p) * p);
      for (var j = start; j <= hi; j += p) composite[j - lo] = 1;
    }
    var out = [];
    for (var vv = hi; vv >= lo; vv--) {
      if (!composite[vv - lo] && vv >= 2) out.push(vv);
    }
    return out;
  }

  function getTheNthPrimeNumber(k) {
    if (!Number.isInteger(k) || k < 1) throw new Error("k must be a positive integer buddy");
    if (k <= 200000) {
      var bound = k < 6 ? 15 : Math.ceil(k * (Math.log(k) + Math.log(Math.log(k)))) + 10;
      feedTheSieveMoreNumbers(bound);
      while (primeNuggets.length < k) {
        bound = Math.ceil(bound * 1.3) + 10;
        feedTheSieveMoreNumbers(bound);
      }
      return primeNuggets[k - 1];
    }
    var lnk = Math.log(k), lnlnk = Math.log(lnk);
    var x0 = Math.max(Math.ceil(k * (lnk + lnlnk - 1 + (lnlnk - 2) / lnk)), 15) + 200;
    var pi0 = countPrimesUpTo(x0);
    var safetyCounter = 0;
    while (pi0 < k && safetyCounter < 20) { x0 = Math.ceil(x0 * 1.15) + 100; pi0 = countPrimesUpTo(x0); safetyCounter++; }
    var diff = pi0 - k, windowHi = x0, skipped = 0, windowSize = Math.max(2000, Math.ceil((diff + 50) * 25));
    var safetyCounter2 = 0;
    while (safetyCounter2 < 30) {
      var windowLo = Math.max(2, windowHi - windowSize + 1);
      var primes = findSegmentedPrimes(windowLo, windowHi);
      for (var i = 0; i < primes.length; i++) {
        if (skipped === diff) return primes[i];
        skipped++;
      }
      if (windowLo <= 2) break;
      windowHi = windowLo - 1; windowSize = Math.ceil(windowSize * 1.5); safetyCounter2++;
    }
    throw new Error("Oops, we ran out of search window for that huge prime!");
  }

  var memoizedReps = new Map();
  var memoizedIndices = new Map();

  function turnIntoParentheses(n) {
    if (memoizedReps.has(n)) return memoizedReps.get(n);
    var resultString = n === 1 ? "" : chopIntoPrimeChunks(n).reduce((acc, f) => acc + wrapIndexInParens(countPrimesUpTo(f.p)).repeat(f.e), "");
    memoizedReps.set(n, resultString);
    return resultString;
  }

  function wrapIndexInParens(k) {
    if (memoizedIndices.has(k)) return memoizedIndices.get(k);
    var wrapped = "(" + turnIntoParentheses(k) + ")";
    memoizedIndices.set(k, wrapped);
    return wrapped;
  }

  function encodeToParens(n) {
    if (!Number.isInteger(n) || n < 1) throw new Error("Give me a valid whole number please!");
    return turnIntoParentheses(n);
  }

  function grabTopLevelGroups(s) {
    var parenthesisGroups = [], depth = 0, startingSpot = 0;
    for (var i = 0; i < s.length; i++) {
      var char = s[i];
      if (char === "(") { if (depth === 0) startingSpot = i; depth++; }
      else if (char === ")") {
        depth--;
        if (depth < 0) throw new Error("Uh oh, mismatched parenthesis right here: " + i);
        if (depth === 0) parenthesisGroups.push(s.slice(startingSpot, i + 1));
      } else {
        throw new Error("Wait, what is this character? " + i);
      }
    }
    if (depth !== 0) throw new Error("Hey! You forgot a closing parenthesis somewhere!");
    return parenthesisGroups;
  }

  function decodeFromParens(s) {
    s = (s || "").trim();
    if (s === "") return 1;
    if (!/^[()]*$/.test(s)) throw new Error("Only parentheses allowed here my friend!");
    return grabTopLevelGroups(s).reduce((acc, group) => acc * getTheNthPrimeNumber(decodeFromParens(group.slice(1, -1))), 1);
  }

  function getFactorSummary(n) {
    if (n === 1) return "1 (none)";
    return chopIntoPrimeChunks(n).map(f => f.e > 1 ? f.p + "^" + f.e : String(f.p)).join(" × ");
  }

  // Listen to messages from the main UI script
  self.onmessage = function (incomingMessage) {
    var dataPacket = incomingMessage.data;
    try {
      if (dataPacket.type === "encode") {
        var numericInput = Number(dataPacket.payload.n);
        if (!Number.isFinite(numericInput) || !Number.isInteger(numericInput) || numericInput < 1) throw new Error("Enter a positive whole number please.");
        if (numericInput > 999999999999) throw new Error("That number is way too big for this little browser window!");
        self.postMessage({ id: dataPacket.id, ok: true, result: encodeToParens(numericInput), isPrimeFlag: numericInput > 1 && isThisPrimeBro(numericInput), factorSummary: getFactorSummary(numericInput) });
      } else if (dataPacket.type === "decode") {
        var decodedNumber = decodeFromParens(String(dataPacket.payload.s));
        self.postMessage({ id: dataPacket.id, ok: true, result: decodedNumber, isPrimeFlag: decodedNumber > 1 && isThisPrimeBro(decodedNumber), factorSummary: getFactorSummary(decodedNumber) });
      }
    } catch (err) {
      self.postMessage({ id: dataPacket.id, ok: false, error: err.message || String(err) });
    }
  };`;

  // Spin up the worker helper in the background
  var backgroundMathWorker = new Worker(URL.createObjectURL(new Blob([mathBrainWorkerCode], { type: 'application/javascript' })));
  var waitingLineForWorker = new Map();
  var ticketNumber = 0;

  backgroundMathWorker.onmessage = function(event) {
    var responsePacket = event.data;
    var callbackFunction = waitingLineForWorker.get(responsePacket.id);
    if (callbackFunction) {
      waitingLineForWorker.delete(responsePacket.id);
      callbackFunction(responsePacket);
    }
  };

  // Helper to colorize parentheses in rainbow depths
  function paintRainbowParentheses(parenthesisString) {
    var paintedHtml = '', currentDepth = 0, colorPaletteSize = 6;
    for (var i = 0; i < parenthesisString.length; i++) {
      var char = parenthesisString[i];
      if (char === '(') {
        paintedHtml += '<span style="color:var(--d' + (currentDepth % colorPaletteSize) + ')">(</span>';
        currentDepth++;
      } else if (char === ')') {
        currentDepth = Math.max(0, currentDepth - 1);
        paintedHtml += '<span style="color:var(--d' + (currentDepth % colorPaletteSize) + ')">)</span>';
      }
    }
    return paintedHtml;
  }

  function calculateMaxNestingDepth(parenthesisString) {
    var depth = 0, deepestSoFar = 0;
    for (var i = 0; i < parenthesisString.length; i++) {
      if (parenthesisString[i] === '(') { depth++; deepestSoFar = Math.max(deepestSoFar, depth); }
      else if (parenthesisString[i] === ')') depth--;
    }
    return deepestSoFar;
  }

  // UI stuff(I fucking hate this)
  var userInputField = document.getElementById('main-input');
  var convertButton = document.getElementById('convert-btn');
  var clearButton = document.getElementById('clear-btn');
  var copyButton = document.getElementById('copy-btn');
  var statusMessageBox = document.getElementById('status-region');
  var resultBoxDisplay = document.getElementById('result-display');
  var modePillIndicator = document.getElementById('mode-pill');
  var statsContainer = document.getElementById('stats-row');
  var statLengthSpan = document.getElementById('stat-length');
  var statDepthSpan = document.getElementById('stat-depth');
  var statFactorsSpan = document.getElementById('stat-factors');

  var savedResultForClipboard = '';

  function figureOutWhatUserTyped(rawText) {
    var trimmed = rawText.trim();
    if (trimmed === '') return null;
    if (/^[0-9]+$/.test(trimmed)) return 'encode';
    if (/^[()]+$/.test(trimmed)) return 'decode';
    return 'invalid';
  }

  function updateStatusMessage(message, category) {
    statusMessageBox.textContent = message || '';
    statusMessageBox.setAttribute('data-kind', category || '');
  }

  function updateModeBadge(detectedMode) {
    if (detectedMode === 'encode') {
      modePillIndicator.textContent = 'number → ( )';
      modePillIndicator.dataset.empty = 'false';
    } else if (detectedMode === 'decode') {
      modePillIndicator.textContent = '( ) → number';
      modePillIndicator.dataset.empty = 'false';
    } else {
      modePillIndicator.textContent = 'waiting for input';
      modePillIndicator.dataset.empty = 'true';
    }
  }

  function showFriendlyPlaceholder(text) {
    resultBoxDisplay.className = 'result placeholder';
    resultBoxDisplay.textContent = text;
    statsContainer.hidden = true;
    copyButton.disabled = true;
    savedResultForClipboard = '';
  }

  function triggerTheMagicConversion() {
    var userTypedValue = userInputField.value;
    var detectedMode = figureOutWhatUserTyped(userTypedValue);
    updateModeBadge(detectedMode === 'invalid' ? null : detectedMode);

    if (detectedMode === null) {
      showFriendlyPlaceholder('Enter a number or a parenthesis string above, then press Convert.');
      updateStatusMessage('', '');
      return;
    }
    if (detectedMode === 'invalid') {
      showFriendlyPlaceholder('Waiting for a valid number or parenthesis string…');
      updateStatusMessage('Oops! Use only digits (0-9) or parenthesis characters ( and ).', 'error');
      return;
    }

    convertButton.disabled = true;
    var myTicket = ++ticketNumber;

    waitingLineForWorker.set(myTicket, function(response) {
      convertButton.disabled = false;
      if (!response.ok) {
        showFriendlyPlaceholder('Hmm, couldn’t convert that.');
        updateStatusMessage(response.error || 'Something went wrong.', 'error');
        return;
      }

      var finalAnswerString = String(response.result);
      resultBoxDisplay.className = 'result';

      if (detectedMode === 'encode') {
        var primeBadgeHtml = response.isPrimeFlag ? '<span class="prime-badge">prime</span>' : '';
        resultBoxDisplay.innerHTML = (finalAnswerString === '' ? '<span class="mono">(empty string — this is 1)</span>' : paintRainbowParentheses(finalAnswerString)) + primeBadgeHtml;
        savedResultForClipboard = finalAnswerString;
      } else {
        resultBoxDisplay.textContent = finalAnswerString;
        savedResultForClipboard = finalAnswerString;
      }

      statLengthSpan.textContent = userTypedValue.trim().length;
      statDepthSpan.textContent = calculateMaxNestingDepth(userTypedValue.trim());
      statFactorsSpan.textContent = response.factorSummary || '—';
      statsContainer.hidden = false;
      copyButton.disabled = false;
      updateStatusMessage(detectedMode === 'encode' ? 'Converted successfully!' : 'Decoded successfully!', 'ok');
    });

    backgroundMathWorker.postMessage({
      id: myTicket,
      type: detectedMode,
      payload: detectedMode === 'encode' ? { n: userTypedValue.trim() } : { s: userTypedValue.trim() }
    });
  }

  userInputField.addEventListener('input', triggerTheMagicConversion);
  userInputField.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') triggerTheMagicConversion();
  });
  convertButton.addEventListener('click', triggerTheMagicConversion);

  clearButton.addEventListener('click', function() {
    userInputField.value = '';
    updateModeBadge(null);
    showFriendlyPlaceholder('Enter a number or a parenthesis string above, then press Convert.');
    updateStatusMessage('', '');
    userInputField.focus();
  });

  copyButton.addEventListener('click', function() {
    if (!savedResultForClipboard) return;
    navigator.clipboard.writeText(savedResultForClipboard).then(function() {
      updateStatusMessage('Copied to clipboard!', 'ok');
    }).catch(function() {
      updateStatusMessage('Failed to copy.', 'error');
    });
  });

  // Quick example preset buttons handler
  document.querySelectorAll('[data-ex]').forEach(function(presetButton) {
    presetButton.addEventListener('click', function() {
      userInputField.value = presetButton.getAttribute('data-ex');
      userInputField.focus();
      triggerTheMagicConversion();
    });
  });

  // I added calculator as I am lazy to open the calculator app
  function spawnLittleCalculatorBeast(containerElement, mountLocationId) {
    var templateNode = document.getElementById('calc-template');
    containerElement.appendChild(templateNode.content.cloneNode(true));

    var expressionScreen = containerElement.querySelector('[data-calc="expr"]');
    var valueScreen = containerElement.querySelector('[data-calc="value"]');
    var sendToConverterButton = containerElement.querySelector('[data-calc="use"]');

    var storedNumber = null;
    var waitingOperation = null;
    var activeInputString = '0';
    var justPressedEquals = false;

    function tidyUpNumber(numberVal) {
      if (!isFinite(numberVal)) return 'Error';
      if (Math.abs(numberVal) >= 1e15) return numberVal.toExponential(6);
      return String(Math.round(numberVal * 1e9) / 1e9);
    }

    function refreshCalculatorScreen() {
      valueScreen.textContent = activeInputString;
      expressionScreen.textContent = (storedNumber !== null ? tidyUpNumber(storedNumber) + ' ' + (waitingOperation || '') : '') || ' ';
      var parsedNum = Number(activeInputString);
      sendToConverterButton.disabled = !(/^[0-9]+$/.test(activeInputString) && parsedNum >= 1 && parsedNum <= 999999999999);
    }

    containerElement.querySelectorAll('.kp-btn').forEach(function(keyButton) {
      keyButton.addEventListener('click', function() {
        var keyAction = keyButton.getAttribute('data-k');

        if (/^[0-9.]$/.test(keyAction)) {
          if (justPressedEquals) { activeInputString = '0'; justPressedEquals = false; }
          activeInputString = (activeInputString === '0' && keyAction !== '.') ? keyAction : activeInputString + keyAction;
        } else if (keyAction === 'clear') {
          storedNumber = null; waitingOperation = null; activeInputString = '0'; justPressedEquals = false;
        } else if (keyAction === 'back') {
          if (!justPressedEquals) activeInputString = activeInputString.length > 1 ? activeInputString.slice(0, -1) : '0';
        } else if (keyAction === '=') {
          if (storedNumber !== null && waitingOperation) {
            activeInputString = tidyUpNumber(eval(storedNumber + waitingOperation + Number(activeInputString)));
            storedNumber = null; waitingOperation = null;
          }
          justPressedEquals = true;
        } else {
          storedNumber = Number(activeInputString);
          waitingOperation = keyAction === '%' ? '*' : keyAction;
          if (keyAction === '%') activeInputString = tidyUpNumber(storedNumber / 100);
          justPressedEquals = true;
        }
        refreshCalculatorScreen();
      });
    });

    sendToConverterButton.addEventListener('click', function() {
      userInputField.value = activeInputString;
      updateModeBadge('encode');
      triggerTheMagicConversion();
      if (mountLocationId === 'calc-root-mobile') {
        var mobileDrawer = document.querySelector('.calc-drawer');
        if (mobileDrawer) mobileDrawer.removeAttribute('open');
      }
      userInputField.focus();
    });

    refreshCalculatorScreen();
  }
  // just for mobile stuff
  spawnLittleCalculatorBeast(document.getElementById('calc-root'), 'calc-root');
  spawnLittleCalculatorBeast(document.getElementById('calc-root-mobile'), 'calc-root-mobile');
})();
