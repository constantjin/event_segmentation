$(() => {
    let vadScores = new Map();
    let prevRatingSpans = new Map();
    let ratingSpans = document.querySelectorAll(".scale span");

    ratingSpans.forEach((ratingSpan) => {
        ratingSpan.onclick = () => {
            let ratingQuestion = ratingSpan.parentElement.id;
            let ratingScore = ratingSpan.textContent;

            // if RatingScore is changed, reset highlighting.
            let prevRatingScore = vadScores.get(ratingQuestion);
            if (typeof prevRatingScore !== "undefined" && prevRatingScore !== ratingScore) {
                let prevRatingSpan = prevRatingSpans.get(ratingQuestion);
                prevRatingSpan.style.backgroundColor = "white";
            }
            vadScores.set(ratingQuestion, ratingScore);
            ratingSpan.style.backgroundColor = "yellow";
            prevRatingSpans.set(ratingQuestion, ratingSpan);

            // Check all ratingQuestions are marked
            if (vadScores.has("valence") && vadScores.has("arousal") && vadScores.has("dominance")) {
                let vadData = {valence : vadScores.get("valence"), arousal : vadScores.get("arousal"), dominance : vadScores.get("dominance")};
                $.get("/vad_rating", vadData, (response) => {
                    if (response === "close") {
                        console.log("# DEBUG: Rating finishes.")
                        window.close();
                    } else if (response === "finish") {
                        window.location.href = "/fixation";
                    }
                });
            }
        };
    });
});