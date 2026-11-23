/* All six one-shots ship with the booth. See assets/sfx/SOURCES.txt. */
(() => {
  const clips = {
    turn:  { file: "eleven-robotic-arm-clicks-trimmed.mp3", volume: .60, rate: 1.35 },
    jam:   { file: "notification-failure-thud.wav", volume: .50 },
    nudge: { file: "foley-plastic-touch.wav", volume: .32 },
    drop:  { file: "pop-medium-in.wav", volume: .26 },
    open:  { file: "pop-medium-out.wav", volume: .33 },
    gold:  { file: "notification-success-clear.wav", volume: .48 },
  };
  // Double-clicked HTML can play local media, while XHR for file: URLs
  // is restricted by browsers. Howler handles first-gesture audio unlock.
  const localFile = location.protocol === "file:";
  const players = Object.fromEntries(Object.entries(clips).map(([cue, clip]) => [
    cue, new Howl({ src: ["assets/sfx/" + clip.file], html5: localFile,
      volume: clip.volume, rate: clip.rate ?? 1, preload: true }),
  ]));
  let muted = false;
  window.BoothAudio = {
    setMuted(value) {
      muted = value;
      Howler.mute(value);
      if (value) Howler.stop();
    },
    play(cue) {
      if (!muted) players[cue].play();
    },
  };
})();
