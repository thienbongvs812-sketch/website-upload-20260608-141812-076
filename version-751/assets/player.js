(function () {
  function initializePlayer(playerId, sourceUrl) {
    var root = document.querySelector('[data-player-id="' + playerId + '"]');
    if (!root) {
      return;
    }
    var video = root.querySelector("video");
    var startButton = root.querySelector(".player-start");
    var poster = root.querySelector(".player-poster");
    var attached = false;

    function attachSource() {
      if (attached || !video) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
      } else {
        video.src = sourceUrl;
      }
    }

    function beginPlayback() {
      if (!video) {
        return;
      }
      attachSource();
      root.classList.add("is-playing");
      video.controls = true;
      var playResult = video.play();
      if (playResult && typeof playResult.catch === "function") {
        playResult.catch(function () {
          root.classList.remove("is-playing");
        });
      }
    }

    if (startButton) {
      startButton.addEventListener("click", beginPlayback);
    }
    if (poster) {
      poster.addEventListener("click", beginPlayback);
    }
    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          beginPlayback();
        }
      });
    }
  }

  window.initializePlayer = initializePlayer;
})();
