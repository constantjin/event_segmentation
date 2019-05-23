$(() => {
    let ratingSpans = document.querySelectorAll(".scale span");
    ratingSpans.forEach((ratingSpan) => {
        ratingSpan.onclick = () => {
            let ratingScore = ratingSpan.textContent;
            $.get("/engaged_rating", {engaged : ratingScore}, (response) => {
                if (response === "next") {
                    console.log("# DEBUG: Move to next rating.")
                    window.location.href = "/emotion";
                }
            });
        };
    });
});