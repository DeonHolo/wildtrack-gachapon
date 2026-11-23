/* The cabinet uses one 560 × 500 coordinate system. The glass, crank and
   pickup tray have separate layers so the same sticker can travel through it. */
(() => {
  const mount = document.querySelector("#machine");
  const catalog = [
    { key: "trophy", description: "Wildcat holding a trophy", color: "red" },
    { key: "point", description: "Wildcat pointing ahead", color: "teal" },
    { key: "goodjob", description: "Wildcat giving a thumbs-up", color: "apricot" },
    { key: "wave", description: "Wildcat waving", color: "red" },
    { key: "golden", description: "Opaque golden capsule", color: "golden" },
    { key: "pdf", description: "Wildcat holding a paper", color: "sky" },
    { key: "search", description: "Wildcat with a magnifying glass", color: "teal" },
  ];
  function shell(key) {
    if (key === "golden") return `<span class="ball-backing"></span>
      <span class="ball-top"></span><span class="ball-bottom"></span>
      <span class="gold-medal" aria-hidden="true"></span>`;
    return `
    <span class="ball-backing"></span>
    <img data-mascot="${key}" src="assets/${key}.png" alt="" draggable="false">
    <span class="ball-top"></span><span class="ball-bottom"></span>`;
  }

  // Rear capsules sit a little higher and have smaller shells.
  const pile = [
    { x: 10, y: 37, size: 25, tilt: -14 },
    { x: 38, y: 43, size: 25, tilt: 11 },
    { x: 65, y: 34, size: 25, tilt: -7 },
    { x: -1, y: -3, size: 28, tilt: -12 },
    { x: 25, y: -1, size: 26, tilt: 10 },
    { x: 49, y: -4, size: 27, tilt: -9 },
    { x: 75, y: -5, size: 27, tilt: 11 },
  ];
  const balls = pile.map(({ x, y, size, tilt }, index) => `
    <span class="ball-slot" style="left:${x}%;bottom:${y}%;width:${size}%;--tilt:${tilt}deg;--lag:${index * 13}ms">
      <span class="bowl-ball capsule" data-pose="${catalog[index].key}" data-color="${catalog[index].color}">${shell(catalog[index].key)}</span>
    </span>`).join("");

  mount.innerHTML = `
    <div class="cabinet">
      <svg class="enamel" viewBox="0 0 560 500" aria-hidden="true">
        <defs>
          <linearGradient id="lacquer" x1="0" y1="0" x2=".83" y2="1" gradientUnits="objectBoundingBox">
            <stop stop-color="#f55b63"/><stop offset=".13" stop-color="#db394d"/><stop offset=".55" stop-color="#ae1f3a"/><stop offset="1" stop-color="#74142d"/>
          </linearGradient>
          <linearGradient id="red-edge" x2="0" y2="1"><stop stop-color="#fb6670"/><stop offset=".42" stop-color="#be2740"/><stop offset="1" stop-color="#83192f"/></linearGradient>
          <linearGradient id="gold-edge" x2=".13" y2="1"><stop stop-color="#fff0a1"/><stop offset=".22" stop-color="#ffd259"/><stop offset=".64" stop-color="#ffbb29"/><stop offset="1" stop-color="#d87915"/></linearGradient>
          <linearGradient id="cream-edge" x2=".05" y2="1"><stop stop-color="#fffce4"/><stop offset=".5" stop-color="#ffe3a2"/><stop offset="1" stop-color="#e8ac5d"/></linearGradient>
          <linearGradient id="glass-back" x1="0" y1="0" x2=".7" y2="1"><stop stop-color="#ebafa0"/><stop offset=".42" stop-color="#e6a092"/><stop offset="1" stop-color="#b36368"/></linearGradient>
          <linearGradient id="bay-dark" x1=".1" y1="0" x2=".55" y2="1"><stop stop-color="#3b1522"/><stop offset=".6" stop-color="#572134"/><stop offset="1" stop-color="#783144"/></linearGradient>
          <radialGradient id="dial-gold" cx=".34" cy=".28" r=".86"><stop stop-color="#ffdb59"/><stop offset=".65" stop-color="#ffc137"/><stop offset="1" stop-color="#e4931b"/></radialGradient>
        </defs>
        <g stroke="#57182a" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
          <!-- Short rubber feet and the thick enamel plinth. -->
          <path d="M70 449h65l-5 27q-1 8-10 8H85q-10 0-12-8zM425 449h65l-3 26q-1 9-12 9h-35q-10 0-12-8z" fill="#603238"/>
          <path d="M78 474q24 7 47 0m312 0q23 7 44 0" stroke="#9b5b50" stroke-width="3"/>
          <!-- The back of the empty glass chamber. The animated pile sits above this. -->
          <path d="M104 85Q84 115 72 157 57 203 56 266q0 15 21 19h406q22-4 21-20-2-57-17-108-12-42-33-72Z" fill="url(#glass-back)"/>
          <path d="M108 97q-33 57-39 144m377-144q33 58 43 140" fill="none" stroke="#fbd6c1" stroke-width="8" opacity=".68"/>
          <path d="M78 246q197 24 405-5l3 31H72z" fill="#97535e" stroke="none" opacity=".7"/>
          <!-- Rounded crown and the cream enamel marquee. -->
          <path d="M80 94q5-31 25-48 18-16 61-17 4-22 24-22 21-1 40 13 50-7 101-1 21-14 40-12 18 0 25 22 48 1 64 21 16 16 21 44-41 11-82 4-122-10-234 1-44 4-85-5Z" fill="url(#lacquer)"/>
          <path d="M89 82q11-27 32-36 12-4 29-5" fill="none" stroke="#ff8890" stroke-width="6"/>
          <path d="M96 73q8-14 17-18" fill="none" stroke="#fff5e8" stroke-width="7"/>
          <path d="M436 44q23 7 31 27" fill="none" stroke="#f67680" stroke-width="5"/>
          <path d="M81 91q197-24 398 0l-1 10q-199-20-395 0z" fill="url(#cream-edge)" stroke-width="3"/>
          <path d="M157 50q-6-21 5-30 10-10 29-7l23 8-10 39-30 9q-12 0-17-19Zm246 0q6-21-5-30-10-10-29-7l-23 8 10 39 30 9q12 0 17-19Z" fill="#ba2942" stroke-width="3"/>
          <path d="m170 35 16 9m-18 5 16 2m206-16-16 9m18 5-16 2" fill="none" stroke="#ffc53d" stroke-width="6"/>
          <path d="M195 21q86-17 171 0 11 2 14 16 4 18-5 30-4 6-15 5-78-9-158 0-12 1-17-8-7-12-3-28 3-12 13-15Z" fill="url(#cream-edge)"/>
          <path d="M193 35q4-7 12-9 78-12 146-2" fill="none" stroke="#fffbed" stroke-width="4"/>
          <text x="281" y="55" text-anchor="middle" stroke="none" fill="#781c32" font-family="Bricolage,Arial,sans-serif" font-size="31" font-weight="800" letter-spacing="-1.6">WildTrack</text>
          <!-- A molded cabinet, complete with asymmetric enamel highlights. -->
          <path d="M66 264q-22 3-32 27-10 23-10 68v58q1 37 22 47 12 8 41 10 195 9 386-1 35-3 49-15 13-13 14-47v-58q-1-43-12-63-10-20-32-26z" fill="url(#lacquer)"/>
          <path d="M45 437q10 20 51 22 194 8 377-1 29-2 41-11-6 17-37 19-212 13-394 1-31-3-38-30Z" fill="#8e1c36" stroke="none"/>
          <path d="M39 389q-1-80 21-90 9-6 25-6" fill="none" stroke="#f3606f" stroke-width="7"/>
          <path d="M49 320q5-17 15-20" fill="none" stroke="#fff0de" stroke-width="8"/>
          <path d="M505 302q10 5 14 18" fill="none" stroke="#fa8286" stroke-width="6"/>
          <path d="M52 441q2 9 12 11m428-5 12-5" fill="none" stroke="#ed5c68" stroke-width="4"/>
          <!-- Stationary dial and the engraved direction arrow. -->
          <circle cx="160" cy="371" r="73" fill="#951e39"/>
          <circle cx="160" cy="369" r="67" fill="url(#gold-edge)" stroke-width="3.5"/>
          <circle cx="160" cy="369" r="60" fill="url(#dial-gold)" stroke="#cc8520" stroke-width="2"/>
          <path d="M106 346q12-34 47-37" fill="none" stroke="#fff1a8" stroke-width="4.5"/>
          <path d="M138 334q21-13 43-3l-1-7 13 13-19 2 4-5q-20-7-40 0Z" fill="#a96519" stroke="none"/>
          <circle cx="160" cy="369" r="16" fill="#cb7b1e" stroke-width="3"/>
          <!-- The chute is an opening under the lip, cut into the body. -->
          <path d="M279 433v-41q1-48 24-69 23-24 62-24 38 0 63 24 22 22 23 62v49q-83 15-172-1Z" fill="url(#red-edge)" stroke-width="4.5"/>
          <path d="M291 426v-37q1-39 22-59 20-18 52-18t52 18q20 19 21 56v41z" fill="url(#bay-dark)" stroke-width="3.5"/>
          <path d="M298 365q5-25 24-37 17-11 39-12" fill="none" stroke="#f26874" stroke-width="4"/>
          <!-- Countertop fittings. -->
          <g fill="#e68a73" stroke="#8f3843" stroke-width="1.8">
            <circle cx="62" cy="325" r="4"/><circle cx="500" cy="325" r="4"/>
            <path d="m60 327 4-4m434 4 4-4"/>
          </g>
          <g stroke="#792139" stroke-width="4"><path d="M460 394h29m-29 8h24m-24 8h18"/></g>
        </g>
      </svg>
      <div class="hopper-pile" aria-hidden="true">${balls}</div>
      <div class="glass-glint" aria-hidden="true"><i></i></div>
      <button type="button" class="dial-action" id="crank" aria-label="Turn the crank">
        <svg viewBox="0 0 156 156" aria-hidden="true">
          <g class="spindle"><g transform="rotate(-19 78 78)" stroke-linejoin="round">
            <path d="M29 66h96q14 0 14 14v6q0 14-14 14H29q-13 0-13-14v-6q0-14 13-14Z" fill="#b76717" stroke="#8f5519" stroke-width="3"/>
            <path d="M29 61h94q14 0 14 13v6q0 13-14 13H29q-13 0-13-13v-6q0-13 13-13Z" fill="url(#gold-edge)" stroke="#9e621b" stroke-width="3"/>
            <path d="M23 74q0-6 8-7h83" stroke="#fff4a5" stroke-width="4" fill="none" stroke-linecap="round"/>
            <circle cx="78" cy="78" r="23" fill="#e19a25" stroke="#ac651a" stroke-width="3"/>
            <circle cx="78" cy="75" r="20" fill="url(#dial-gold)" stroke="#f8b936" stroke-width="2"/>
            <path d="M66 69q4-8 12-8" stroke="#fff1a2" stroke-width="3.5" fill="none" stroke-linecap="round"/>
            <path d="M116 86h7q8 0 9-7" stroke="#dc9123" stroke-width="3" fill="none" stroke-linecap="round"/>
          </g></g>
        </svg>
      </button>
      <div class="chute-window" aria-hidden="true">
        <div class="drop-carrier"><div class="rolling-ball"><div id="drawn-capsule" class="capsule" data-color="gold">${shell("wave")}</div></div></div>
      </div>
      <svg class="glazing" viewBox="0 0 560 500" aria-hidden="true">
        <g fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path d="M96 104q-24 43-33 93" stroke="#ffefd9" stroke-width="7" opacity=".62"/>
          <path d="M105 105q-14 13-22 38 10 2 20-1 7-21 20-36Z" fill="#fff9ee" opacity=".79"/>
          <path d="m85 153-8 23" stroke="#fff6e8" stroke-width="6" opacity=".67"/>
          <path d="M445 106q18 15 26 43" stroke="#fff7e4" stroke-width="9" opacity=".82"/>
          <path d="M485 183q8 28 10 61" stroke="#ffebd9" stroke-width="4" opacity=".78"/>
          <path d="M63 262q213 8 433-1 10 2 13 12l2 9q0 8-10 9-216 11-439 0-11 0-11-8l3-11q3-8 9-10Z" stroke="#622034" stroke-width="4" fill="url(#cream-edge)"/>
          <path d="M66 270q203 8 422 0" stroke="#fff9dd" stroke-width="5"/>
          <path d="M278 434q0-10 12-13 72 7 143-2 14-1 17 10l2 9q1 9-11 12-75 12-152 2-10-2-10-8Z" stroke="#722139" stroke-width="3" fill="url(#red-edge)"/>
          <path d="M291 426q65 8 144-2" stroke="#ff9192" stroke-width="4"/>
        </g>
      </svg>
      <button type="button" class="bay-action" id="chute" aria-label="Nudge the stuck capsule" disabled><i class="jam-mark" aria-hidden="true"></i></button>
      <span class="empty-face" aria-hidden="true"><i></i><i></i></span>
    </div>`;

  // Only the six physical designs appear in the lineup and on the choice screen.
  const stickers = catalog.filter((item) => item.key !== "golden");
  document.querySelector(".sticker-strip").innerHTML = stickers.map((item) =>
    `<img src="assets/${item.key}.png" width="52" height="48" alt="${item.description}" draggable="false">`
  ).join("");
  document.querySelector("#choices").innerHTML = stickers.map((item) =>
    `<button type="button" data-choice="${item.key}" aria-label="Choose the ${item.description.toLowerCase()} sticker">
      <img src="assets/${item.key}.png" alt="" draggable="false"></button>`
  ).join("");
  window.BoothMachine = {
    catalog,
    fillCapsule(node, item) {
      node.dataset.pose = item.key;
      node.dataset.color = item.color;
      node.innerHTML = shell(item.key);
    },
  };
})();
