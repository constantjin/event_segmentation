$(() => {
    let totalEmotions = ["Anticipation", "Anger", "Disgust", "Fear", "Trust", "Joy", "Surprise", "Sad"];
    let selectedEmotions = [];
    let emotionPs = document.querySelectorAll(".emotion p");

    function deleteAnItem(list, item) {
        const index = list.indexOf(item);
        if (index !== -1) list.splice(index, 1);
    }

    emotionPs.forEach((emotionP) => {
        emotionP.onclick = () => {
            let emotion = emotionP.textContent;

            // Click the previously selected item -> remove from the selectedEmotions
            if (selectedEmotions.indexOf(emotion) !== -1) {
                deleteAnItem(selectedEmotions, emotion);
                let prevEmotionPIndex = totalEmotions.indexOf(emotion);
                let prevEmotionP = emotionPs[prevEmotionPIndex];
                prevEmotionP.style.backgroundColor = "white";
            } else {
                selectedEmotions.push(emotion);
                let currEmotionPIndex = totalEmotions.indexOf(emotion);
                let currEmotionP = emotionPs[currEmotionPIndex];
                currEmotionP.style.backgroundColor = "yellow";
            }

            if (selectedEmotions.length === 3) {
                $.get("/emotion_selected", {selections : selectedEmotions.toString()}, (response) => {
                    if (response == "next") {
                        console.log("# DEBUG: Move to next rating.")
                        window.location.href = "/vad";
                    }
                });
            }
        };
    });
});