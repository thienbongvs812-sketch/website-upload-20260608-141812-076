(function () {
    window.startMoviePlayback = function (options) {
        var video = document.getElementById(options.videoId || "movie-player");
        var button = document.getElementById(options.buttonId || "play-action");
        var layer = document.getElementById(options.layerId || "play-layer");
        var source = options.source;
        var hlsInstance = null;
        var prepared = false;

        function prepare() {
            if (!video || !source || prepared) {
                return;
            }
            prepared = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function play() {
            prepare();
            if (layer) {
                layer.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    if (layer) {
                        layer.classList.remove("is-hidden");
                    }
                });
            }
        }

        if (button) {
            button.addEventListener("click", play);
        }
        if (layer) {
            layer.addEventListener("click", play);
        }
        if (video) {
            video.addEventListener("click", function () {
                if (video.paused) {
                    play();
                }
            });
            video.addEventListener("play", function () {
                if (layer) {
                    layer.classList.add("is-hidden");
                }
            });
        }
        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };
})();
