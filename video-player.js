import {youtubeId} from './study.js';

let apiPromise;

function youtubeAPI() {
  if (window.YT?.Player) return Promise.resolve(window.YT);

  if (!apiPromise) {
    apiPromise = new Promise((resolve, reject) => {
      const prior = window.onYouTubeIframeAPIReady;

      const timeout = setTimeout(() => {
        apiPromise = null;
        reject(new Error(
          'YouTube took too long to load. Return to the topic and retry.'
        ));
      }, 20000);

      window.onYouTubeIframeAPIReady = () => {
        clearTimeout(timeout);
        prior?.();
        resolve(window.YT);
      };

      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';

      script.onerror = () => {
        clearTimeout(timeout);
        apiPromise = null;
        reject(new Error(
          'YouTube could not load. Check your connection and retry.'
        ));
      };

      document.head.appendChild(script);
    });
  }

  return apiPromise;
}

export function createVideoPlayer({
  onSeconds,
  onError,
  onBack,
  onPDF
}) {
  let player;
  let dock;
  let interval;
  let nodeId;
  let links = [];
  let last = 0;
  let pending = 0;
  let playing = false;
  let generation = 0;
  let ready = false;
  let captionsOn = false;
  let captionLoadPending = false;

  function flush() {
    if (pending <= 0 || !nodeId) return;

    const seconds = pending;
    pending = 0;

    try {
      onSeconds(nodeId, seconds);
    } catch (error) {
      pending += seconds;
      onError(error.message);
    }
  }

  function tick() {
    const now = performance.now();

    if (playing && !document.hidden) {
      const delta = (now - last) / 1000;
      if (delta > 0 && delta < 3) pending += delta;
    }

    last = now;
    if (pending >= 10) flush();
  }

  function stop() {
    tick();
    playing = false;
    flush();
  }

  function close() {
    stop();
    generation++;
    clearInterval(interval);
    player?.destroy();
    player = null;
    ready = false;
    captionLoadPending = false;
    dock?.remove();
    dock = null;
    document.body.classList.remove('watching');
  }

  function playButton() {
    if (!dock) return;

    const button = dock.querySelector('[data-v="play"]');
    button.textContent = playing ? 'Ⅱ' : '▶';
    button.setAttribute(
      'aria-label',
      playing ? 'Pause video' : 'Play video'
    );
  }

  function captionButton() {
    const button = dock?.querySelector('[data-v="captions"]');
    if (!button) return;

    const supported =
      ready &&
      typeof player?.loadModule === 'function' &&
      typeof player?.unloadModule === 'function' &&
      typeof player?.getOptions === 'function';

    button.disabled = !supported;
    button.textContent = 'CC';
    button.setAttribute('aria-pressed', String(captionsOn));

    button.setAttribute(
      'aria-label',
      supported
        ? captionsOn
          ? 'Turn captions off'
          : 'Turn captions on'
        : 'Caption switching unavailable'
    );

    button.title = supported
      ? captionsOn
        ? 'Captions ON (when available) — click to turn OFF'
        : 'Captions OFF — click to turn ON'
      : 'This YouTube player does not support caption switching';

    button.style.fontSize = '12px';
    button.style.fontWeight = '600';
    button.style.textDecoration = captionsOn ? 'underline' : 'none';
  }

  function applyCaptions() {
    captionButton();

    if (
      !ready ||
      typeof player?.getOptions !== 'function' ||
      typeof player?.loadModule !== 'function' ||
      typeof player?.unloadModule !== 'function'
    ) {
      return;
    }

    try {
      const loaded = player.getOptions().includes('captions');

      // These module commands are supported by some YouTube players;
      // they are not a guaranteed public caption-visibility API.
      if (captionsOn && !loaded && !captionLoadPending) {
        captionLoadPending = true;
        player.loadModule('captions');
      } else if (!captionsOn && loaded) {
        player.unloadModule('captions');
      }
    } catch {
      const button = dock?.querySelector('[data-v="captions"]');

      if (button) {
        button.disabled = true;
        button.title =
          'Caption switching is not available for this player.';
      }
    }
  }

  async function open(n) {
    close();

    nodeId = n.id;
    links = n.links.filter(
      link => link.type === 'youtube' && youtubeId(link.url)
    );

    const host = document.querySelector('#study-player-host');
    if (!host) throw new Error('Open the study screen first.');

    dock = document.createElement('section');
    dock.className = 'video-dock';
    dock.setAttribute('aria-label', 'Study video player');

    dock.innerHTML = `
      <div class="video-frame">
        <div id="study-youtube"></div>
        <div
          class="video-chooser"
          hidden
          aria-label="Choose a video"
        ></div>
      </div>

      <div
        class="video-controls"
        role="toolbar"
        aria-label="Video and notes controls"
      >
        <button data-v="back" aria-label="Back to topic">←</button>

        <button
          class="seek-control"
          data-v="rewind"
          aria-label="30 seconds back"
        >↶30</button>

        <button data-v="play" aria-label="Play video">▶</button>

        <button
          class="seek-control"
          data-v="forward"
          aria-label="30 seconds forward"
        >30↷</button>

        <select aria-label="Playback speed">
          <option value="1">1×</option>
        </select>

        <button
          data-v="captions"
          aria-label="Turn captions on"
          aria-pressed="false"
          disabled
        >CC</button>

        <button
          data-v="choose"
          aria-label="Choose video"
          aria-expanded="false"
        >☷</button>

        <button data-v="pdf" aria-label="Export notes PDF">⇩</button>
      </div>

      <p class="video-status" role="status">Loading YouTube…</p>
    `;

    host.appendChild(dock);
    document.body.classList.add('watching');

    const chooser = dock.querySelector('.video-chooser');
    const choose = dock.querySelector('[data-v="choose"]');

    function hideChooser() {
      chooser.hidden = true;
      choose.setAttribute('aria-expanded', 'false');
    }

    links.forEach((link, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = link.label || `Video ${index + 1}`;

      button.onclick = () => {
        if (!ready) return;

        stop();
        captionLoadPending = false;
        player.loadVideoById(youtubeId(link.url));
        hideChooser();
      };

      chooser.appendChild(button);
    });

    dock.querySelector('[data-v="back"]').onclick = onBack;
    dock.querySelector('[data-v="pdf"]').onclick = onPDF;

    dock.querySelector('[data-v="captions"]').onclick = () => {
      if (!ready) return;

      captionsOn = !captionsOn;
      captionLoadPending = false;
      applyCaptions();
    };

    choose.onclick = () => {
      chooser.hidden = !chooser.hidden;
      choose.setAttribute('aria-expanded', String(!chooser.hidden));
    };

    dock.querySelector('[data-v="play"]').onclick = () => {
      if (!ready) return;

      if (playing) player.pauseVideo();
      else player.playVideo();
    };

    for (const [action, seconds] of [
      ['rewind', -30],
      ['forward', 30]
    ]) {
      dock.querySelector(`[data-v="${action}"]`).onclick = () => {
        if (!ready) return;

        player.seekTo(
          Math.max(0, (player.getCurrentTime() || 0) + seconds),
          true
        );
      };
    }

    const speed = dock.querySelector('select');

    speed.onchange = () => {
      if (ready) player.setPlaybackRate(Number(speed.value));
    };

    function enable(enabled) {
      const controls = dock.querySelectorAll(
        '[data-v="play"],[data-v="rewind"],' +
        '[data-v="forward"],[data-v="choose"],select'
      );

      for (const control of controls) {
        control.disabled = !enabled;
      }
    }

    enable(false);

    function message(text) {
      dock.querySelector('.video-status').textContent = text;
    }

    function empty(text) {
      const frame = dock.querySelector('#study-youtube');

      if (frame) {
        frame.className = 'video-empty';
        frame.textContent = text;
      }
    }

    if (!links.length) {
      message('No video added. Notes are available.');
      empty(
        'No YouTube video yet. Add a YouTube link in the topic’s ' +
        'Notes & Links. Your notes are available below.'
      );
      return;
    }

    const gen = generation;

    try {
      const YT = await youtubeAPI();
      if (gen !== generation) return;

      player = new YT.Player('study-youtube', {
        videoId: youtubeId(links[0].url),
        width: '100%',
        height: '100%',

        playerVars: {
          controls: 0,
          disablekb: 1,
          fs: 0,
          playsinline: 1,
          rel: 0,
          origin: location.origin
        },

        events: {
          onReady: event => {
            if (gen !== generation) return;

            player = event.target;
            ready = true;
            enable(true);

            message(
              'Video controls below. Study time counts only ' +
              'during visible playback.'
            );

            speed.replaceChildren(
              ...player.getAvailablePlaybackRates().map(rate => {
                const option = document.createElement('option');
                option.value = rate;
                option.textContent = rate + '×';
                option.selected = rate === 1;
                return option;
              })
            );

            applyCaptions();
            player.playVideo();
          },

          onStateChange: event => {
            if (gen !== generation) return;

            tick();
            playing = event.data === 1;
            last = performance.now();
            playButton();

            if (event.data === -1 || event.data === 5) {
              captionLoadPending = false;
            }

            if (event.data === 1 || event.data === 5) {
              applyCaptions();
            }

            if (!playing) flush();
          },

          onApiChange: () => {
            if (gen === generation) applyCaptions();
          },

          onError: () => {
            if (gen !== generation) return;

            stop();
            playButton();

            onError(
              'This video cannot play here. Choose another video ' +
              'or open its original link from Notes & Links.'
            );

            message(
              'Video unavailable. Choose another video ' +
              'or use the original link.'
            );
          }
        }
      });

      last = performance.now();
      interval = setInterval(tick, 1000);
    } catch (error) {
      if (gen === generation) {
        message(error.message);
        empty(error.message);
        onError(error.message);
      }
    }
  }

  window.addEventListener('pagehide', stop);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stop();
      if (ready) player?.pauseVideo();
      playButton();
    }

    last = performance.now();
  });

  return {open, close, flush};
}
