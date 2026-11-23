(() => {
  const byId = (id) => document.getElementById(id);
  const game = byId("game");
  const action = byId("action");
  const crank = byId("crank");
  const chute = byId("chute");
  const drawn = byId("drawn-capsule");
  const balls = [...game.querySelectorAll(".bowl-ball")];
  const reveal = byId("reveal");
  const flight = byId("flight");
  const centerBall = byId("center-ball");
  const shell = byId("center-shell");
  const prize = byId("prize-art");
  const choices = byId("choices");
  const revealAction = byId("reveal-action");
  const heading = reveal.querySelector(".reveal-heading");
  const controls = reveal.querySelector(".reveal-actions");
  const operator = byId("operator");
  const sound = byId("sound");
  const fullscreen = byId("fullscreen");
  const { catalog, fillCapsule } = window.BoothMachine;
  const audio = window.BoothAudio;
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const gsap = window.gsap;
  const storagePrefix = "wildtrack-gachapon-";

  function readFlag(area, key) {
    try { return window[area].getItem(storagePrefix + key) === "1"; }
    catch { return false; }
  }
  function writeFlag(area, key, value) {
    try { window[area].setItem(storagePrefix + key, value ? "1" : "0"); }
    catch { /* A booth with storage disabled can still play this session. */ }
  }

  let hasPlayed = readFlag("sessionStorage", "pulled");
  let closed = readFlag("localStorage", "closed");
  let muted = readFlag("localStorage", "muted");
  let phase = "ready";
  let round = null;
  let timer;
  let impactTimer;
  let timeline;
  let keyboard = false;
  const screens = {
    ready: ["Ready to play", "Wildcat Gachapon", "Turn the crank for a Wildcat sticker.", "Turn the crank"],
    turning: ["Crank turning", "Here it comes!", "Follow your capsule.", "Turning…"],
    jammed: ["Capsule jam", "It’s stuck!", "The Wildcat wedged its capsule in the chute. Give it a nudge.", "Nudge the capsule"],
    nudging: ["Capsule loosening", "There it goes!", "The capsule is coming loose.", "Nudging…"],
    landing: ["Capsule dropping", "Here it comes!", "Watch the chute.", "Dropping…"],
    empty: ["Machine closed", "Out of stickers!", "Every Wildcat found a home. Thanks for playing!", ""],
  };

  function setPhase(next) {
    phase = next;
    game.dataset.phase = next;
  }

  function showCabinet(next) {
    setPhase(next);
    const [status, title, copy, label] = screens[next];
    byId("status-text").textContent = status;
    byId("display-title").textContent = title;
    byId("display-copy").textContent = copy;
    byId("action-label").textContent = label;
    action.hidden = !label;
    action.setAttribute("aria-disabled", String(next !== "ready" && next !== "jammed"));
    crank.disabled = next !== "ready";
    chute.disabled = next !== "jammed";
    byId("booth-settings").disabled = next === "turning" || next === "nudging" || next === "landing";
    byId("toggle-stock").textContent = closed ? "Reopen the machine" : "Mark stickers sold out";
    if (next === "jammed" || next === "empty" || next === "ready") {
      byId("announcement").textContent = title + ". " + copy;
      if (keyboard && !action.hidden && !operator.open) action.focus({ preventScroll: true });
    }
  }

  function waitForCabinet(next, ms, done) {
    clearTimeout(timer);
    showCabinet(next);
    timer = setTimeout(done, reducedMotion.matches ? 75 : ms);
  }

  function random() {
    if (window.crypto?.getRandomValues) return crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32;
    return Math.random();
  }

  function turn() {
    if (phase !== "ready" || closed) return;
    // One entry per physical design plus one solid-gold shell.
    const item = catalog[Math.floor(random() * catalog.length)];
    round = { item, jam: !hasPlayed || random() < .25 };
    hasPlayed = true;
    writeFlag("sessionStorage", "pulled", true);
    balls.find((ball) => ball.dataset.pose === item.key).classList.add("is-drawn");
    fillCapsule(drawn, item);
    audio.play("turn");
    waitForCabinet("turning", 900, () => {
      if (round.jam) {
        audio.play("jam");
        showCabinet("jammed");
      } else land();
    });
  }
  function nudge() {
    if (phase !== "jammed") return;
    audio.play("nudge");
    waitForCabinet("nudging", 400, land);
  }
  function land() {
    waitForCabinet("landing", 550, bringToCenter);
    // The shell reaches the tray halfway through its fall, before it bounces.
    impactTimer = setTimeout(() => { if (phase === "landing") audio.play("drop"); }, reducedMotion.matches ? 30 : 280);
  }

  function showReveal(next, title, hint, buttonLabel) {
    setPhase(next);
    reveal.dataset.scene = next;
    byId("reveal-title").textContent = title;
    byId("reveal-hint").textContent = hint;
    revealAction.querySelector("span").textContent = buttonLabel;
    revealAction.hidden = !buttonLabel;
    choices.hidden = next !== "choice";
    centerBall.disabled = next !== "sealed";
    centerBall.setAttribute("aria-disabled", String(centerBall.disabled));
    revealAction.disabled = next !== "sealed" && next !== "prize";
    if (next === "sealed" || next === "choice" || next === "prize") {
      byId("reveal-announcement").textContent = title + ". " + hint;
      const focus = next === "choice" ? choices.querySelector("button") :
        next === "sealed" ? centerBall : revealAction;
      focus.focus({ preventScroll: true });
    }
  }

  function bringToCenter() {
    const origin = drawn.getBoundingClientRect();
    const golden = round.item.key === "golden";
    fillCapsule(shell, round.item);
    prize.hidden = true;
    flight.hidden = false;
    const veil = reveal.querySelector(".reveal-veil");
    const halo = reveal.querySelector(".reveal-halo");
    reveal.dataset.kind = golden ? "golden" : "regular";
    const title = golden ? "Golden capsule!" : "Your capsule";
    const hint = "Tap the capsule to open it.";
    showReveal("arrival", title, hint, "Open capsule");
    reveal.showModal();
    const destination = reveal.querySelector(".reveal-center").getBoundingClientRect();
    const dx = origin.x + origin.width / 2 - (destination.x + destination.width / 2);
    const dy = origin.y + origin.height / 2 - (destination.y + destination.height / 2);
    gsap.set([flight, shell, prize, heading, controls, halo, veil], { clearProps: "transform,opacity,visibility" });
    timeline = gsap.timeline({ onComplete: () => showReveal("sealed", title, hint, "Open capsule") });
    if (reducedMotion.matches) {
      timeline.fromTo([veil, halo, flight, heading, controls], { opacity: 0 }, { opacity: 1, duration: .12 });
      return;
    }
    timeline.fromTo(flight, { x: dx, y: dy, scale: Math.min(1, origin.width / destination.width), rotation: 7 },
      { x: 0, y: 0, scale: 1, rotation: 0, duration: .67, ease: "back.out(1.14)" }, 0)
      .fromTo(veil, { opacity: 0 }, { opacity: 1, duration: .51 }, 0)
      .fromTo(halo, { opacity: 0 }, { opacity: 1, duration: .48 }, .19)
      .fromTo([heading, controls], { opacity: 0 }, { opacity: 1, duration: .22 }, .45);
  }

  function setPrize(item) {
    prize.src = "assets/" + item.key + ".png";
    prize.alt = item.description + " sticker";
  }

  function award() {
    flight.hidden = true;
    prize.hidden = false;
    showReveal("prize", "Your sticker!", "Show the booth crew to collect your sticker.", "Next player");
  }

  function openCapsule() {
    if (phase !== "sealed") return;
    const golden = round.item.key === "golden";
    showReveal("opening", byId("reveal-title").textContent, "", "");
    if (!golden) setPrize(round.item);
    const finish = () => {
      if (golden) {
        audio.play("gold");
        showReveal("choice", "Your pick!", "Choose the sticker you’d like to take home.", "");
      } else award();
    };
    timeline = gsap.timeline({ onComplete: finish });
    if (reducedMotion.matches) {
      audio.play("open");
      timeline.to(shell, { opacity: 0, duration: .1 });
      return;
    }
    const lid = shell.querySelector(".ball-top");
    const base = shell.querySelector(".ball-bottom");
    const middle = shell.querySelectorAll(".ball-backing, img, .gold-medal");
    const glints = reveal.querySelectorAll(".reveal-sparks i");
    timeline.to(shell, { rotation: -7, scale: .96, duration: .105, ease: "power2.in" })
      .to(shell, { rotation: 0, scale: 1, duration: .13, ease: "power2.out" })
      .call(() => audio.play("open"), [], .2)
      .to(middle, { opacity: 0, duration: .12 }, .19)
      .to(lid, { yPercent: -65, rotation: -13, duration: .38, ease: "power2.out" }, .2)
      .to(base, { yPercent: 53, rotation: 9, duration: .4, ease: "power2.out" }, .2)
      .to([lid, base], { opacity: 0, duration: .18 }, .42)
      .fromTo(glints, { scale: .4, opacity: 0 }, { scale: 1, opacity: 1, duration: .17, stagger: .025 }, .26)
      .to(glints, { scale: .75, opacity: 0, duration: .2 }, .52);
    if (!golden) {
      gsap.set(prize, { opacity: 0 });
      prize.hidden = false;
      timeline.fromTo(prize, { scale: .57, rotation: -5, opacity: 0 },
        { scale: 1, rotation: 0, opacity: 1, duration: .37, ease: "back.out(1.35)" }, .29);
    }
  }

  function reset() {
    clearTimeout(timer);
    clearTimeout(impactTimer);
    timeline?.kill();
    if (reveal.open) reveal.close();
    round = null;
    balls.forEach((ball) => ball.classList.remove("is-drawn"));
    byId("reveal-announcement").textContent = "";
    showCabinet(closed ? "empty" : "ready");
  }

  game.addEventListener("pointerdown", () => { keyboard = false; });
  game.addEventListener("keydown", () => { keyboard = true; });
  crank.addEventListener("click", turn);
  chute.addEventListener("click", nudge);
  action.addEventListener("click", () => {
    if (phase === "ready") turn();
    else if (phase === "jammed") nudge();
  });
  centerBall.addEventListener("click", openCapsule);
  revealAction.addEventListener("click", () => {
    if (phase === "sealed") openCapsule();
    else if (phase === "prize") reset();
  });
  choices.addEventListener("click", (event) => {
    const button = event.target.closest("[data-choice]");
    if (!button || phase !== "choice") return;
    setPrize(catalog.find((item) => item.key === button.dataset.choice));
    award();
  });
  reveal.addEventListener("cancel", (event) => {
    event.preventDefault();
    if (phase === "prize") reset();
  });
  byId("booth-settings").addEventListener("click", () => operator.showModal());
  byId("close-settings").addEventListener("click", () => operator.close());
  byId("toggle-stock").addEventListener("click", () => {
    closed = !closed;
    writeFlag("localStorage", "closed", closed);
    operator.close();
    reset();
  });

  function updateSound() {
    const label = muted ? "Sound off" : "Sound on";
    audio.setMuted(muted);
    sound.setAttribute("aria-pressed", String(!muted));
    sound.setAttribute("aria-label", label);
    sound.querySelector("[data-control-label]").textContent = label;
  }
  sound.addEventListener("click", () => {
    muted = !muted;
    writeFlag("localStorage", "muted", muted);
    updateSound();
    if (!muted) audio.play("nudge");
  });
  function updateFullscreen() {
    const active = document.fullscreenElement === game;
    const label = active ? "Exit full screen" : "Full screen";
    fullscreen.setAttribute("aria-pressed", String(active));
    fullscreen.setAttribute("aria-label", label);
    fullscreen.querySelector("[data-control-label]").textContent = label;
  }
  fullscreen.hidden = !document.fullscreenEnabled || !game.requestFullscreen;
  fullscreen.addEventListener("click", async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await game.requestFullscreen();
    } catch { byId("announcement").textContent = "This browser could not switch to full screen."; }
  });
  document.addEventListener("fullscreenchange", updateFullscreen);
  updateSound();
  updateFullscreen();
  reset();
})();
