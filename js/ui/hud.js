// js/ui/hud.js
'use strict';

/**
 * HUD — all DOM stat updates go through here.
 * Nothing else should touch HUD elements directly.
 */
const HUD = (() => {

  let _toastTimer = null;

  // ── Gold ──────────────────────────────────────────────
  function addGold(v) {
    State.gold += v;
    document.getElementById('hgold').textContent = State.gold;
    _refreshTowerButtons();
  }

  // ── Lives ─────────────────────────────────────────────
  function addLives(v) {
    State.lives = Math.max(0, State.lives + v);
    const el    = document.getElementById('hlives');
    el.textContent = State.lives;
    el.className   = 'sv hp' + (State.lives <= 4 ? ' low' : '');
    if (State.lives <= 0) gameOver();
  }

  // ── Score ─────────────────────────────────────────────
  function addScore(v) {
    State.score += v;
    const s = State.score;
    document.getElementById('hscore').textContent = s > 999 ? Math.floor(s / 1000) + 'k' : s;
  }

  // ── XP / Rank ─────────────────────────────────────────
  function addXP(v) {
    State.xp += v;
    const need = XP_TABLE[State.rank] || 9999;
    if (State.xp >= need && State.rank < 10) {
      State.xp  -= need;
      State.rank++;
      document.getElementById('xpl').textContent = RANKS[State.rank - 1];
      SFX.rankUp();
      toast('RANK ' + RANKS[State.rank - 1], 'ok');
      _unlockTowers();
    }
    const next = XP_TABLE[State.rank] || 9999;
    document.getElementById('xpf').style.width = Math.min(100, (State.xp / next) * 100) + '%';
    document.getElementById('xpv').textContent  = State.xp + '/' + next;
  }

  // ── Tower button states ───────────────────────────────
  function _refreshTowerButtons() {
    document.querySelectorAll('.tb:not(.lk)').forEach(b => {
      b.style.opacity = State.gold >= TOWER_DEFS[b.dataset.t].cost ? '1' : '.38';
    });
  }

  function _unlockTowers() {
    document.querySelectorAll('.tb.lk').forEach(b => {
      if (State.rank >= parseInt(b.dataset.ul)) {
        b.classList.remove('lk');
        toast(TOWER_DEFS[b.dataset.t].name.toUpperCase() + ' UNLOCKED', 'ok');
      }
    });
  }

  // ── Toast notification ────────────────────────────────
  function toast(msg, type = 'err') {
    const el      = document.getElementById('toast');
    el.textContent = msg;
    el.className   = 'show ' + type;
    clearTimeout(_toastTimer);
    _toastTimer = setTimeout(() => el.className = '', 2000);
  }

  // ── Initial HUD sync from state ───────────────────────
  function syncFromState() {
    document.getElementById('hgold').textContent  = State.gold;
    document.getElementById('hlives').textContent = State.lives;
    document.getElementById('hwave').textContent  = '0/' + State.mapCfg.waves;
    document.getElementById('hscore').textContent = '0';
    document.getElementById('xpl').textContent    = RANKS[0];
    document.getElementById('xpf').style.width    = '0%';
    document.getElementById('xpv').textContent    = '0/' + XP_TABLE[1];
    document.getElementById('wi').innerHTML        = 'Next: ' + wavePreviewHTML(1, State.waveDefs, State.mapCfg);
    _refreshTowerButtons();
  }

  return { addGold, addLives, addScore, addXP, toast, syncFromState };
})();
