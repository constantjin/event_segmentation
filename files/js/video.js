$(() => {
    const socket = io.connect("http://" + document.domain + ":" + location.port);

    isPlayingState = false;
    const video = document.getElementById("video");

    video.oncanplaythrough = () => {
        if (isPlayingState) return;
        isPlayingState = true;
        video.play();
        
        socket.emit("videoPlaying");
        console.log("# DEBUG: Video is now playing.");
    }

    window.onclick = () => {
        video.pause();
        isPlayingState = false;
        console.log("# DEBUG: Video is now paused.");
        
        let sceneTime = video.currentTime;
        socket.emit("videoPaused", `${sceneTime}`);
        socket.on("videoCommand", (command) => {
            if (command == "startRating") {
                console.log("# DEBUG: Rating is now starting.");
                const ratingWindow = window.open("/engaged", "Engaged rating", "width=" + screen.availWidth + 
                                                                               ",height=" + screen.availHeight);
                ratingWindow.moveTo(0, 0);
            } else if (command == "resumeVideo") {
                video.play();
                isPlayingState = true;
                console.log("# DEBUG: Video is now playing.");
                socket.emit("videoPlaying");
            }
        });
    }

    video.onended = () => {
        isPlayingState = false;
        video.pause();
        let endTime = video.currentTime;
        socket.emit("videoEnded", `${endTime}`);
        console.log("# DEBUG: Moving to Final rating.");
        setTimeout(() => {
            window.location.href = "/engaged";
        }, 1000);
    }
});