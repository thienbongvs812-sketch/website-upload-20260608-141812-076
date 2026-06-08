function initMoviePlayer(streamUrl) {
    var video = document.getElementById("movie-player");
    var trigger = document.getElementById("player-trigger");
    var loaded = false;
    var hlsInstance = null;

    if (!video || !trigger || !streamUrl) {
        return;
    }

    function startPlayback() {
        trigger.classList.add("is-hidden");
        video.controls = true;

        if (!loaded) {
            loaded = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                video.play().catch(function () {});
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    maxBufferLength: 30
                });

                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
            } else {
                video.src = streamUrl;
                video.play().catch(function () {});
            }
        } else {
            video.play().catch(function () {});
        }
    }

    trigger.addEventListener("click", startPlayback);

    video.addEventListener("click", function () {
        if (video.paused) {
            startPlayback();
        }
    });

    window.addEventListener("pagehide", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
