window.open("./input.html", "input", "width=600, height=600, resizable=yes, scrollbars=yes");

const UI = document.getElementById("UI");
const textarea = document.getElementById("textarea");
const sendButton = document.getElementById("sendButton");

const whiz = document.getElementById("whiz");

let sentenceArray = [];

textarea.addEventListener("input", () => {
    let lineNum = Math.floor(textarea.scrollHeight / 90); // 90 is line-height
    textarea.style.height = 112 + ((lineNum - 1) * 90) + "px"; // 90 is line-height
});

sendButton.addEventListener("click", () => {
    let sentence = textarea.value.trim();

    if(sentence !== "") {
        sentenceArray.push(sentence);
        textarea.value = "";
        console.log(sentenceArray);
        console.log(UI.offsetHeight);
        whizMotion();
        textarea.style.height = 112 + "px"; // set default height
    }
});

function whizMotion() {
    let scale = 1;
    whiz.style.width = UI.offsetWidth + "px";
    whiz.style.height = UI.offsetHeight + "px";
    whiz.style.display = "block";
    textarea.style.transition = "0.7s";

    setTimeout(() => {
        let scale = 1;
        function animate() {
            scale -= 0.014;
            whiz.style.transform = `translateX(-50%) translateY(-50%) scale(${scale})`;
            whiz.style.top = whiz.offsetTop - 6 + "px";

            if(whiz.offsetTop <= 0) {
                whiz.style.display = "none";
                scale = 1;
                whiz.style.transform = `translateX(-50%) translateY(-50%) scale(1)`;
                whiz.style.top = "48%";
                whiz.style.width = UI.offsetWidth + "px";
                whiz.style.height = UI.offsetHeight + "px";
                textarea.style.transition = "0s";
                return;
            }
            requestAnimationFrame(animate);
        }
        requestAnimationFrame(animate);
    }, 150);
}


/*
function openPopup() {
    const popup = window.open(
        "./input.html",
        "input",
        "width=600, height=600, resizable=yes, scrollbars=yes"
    );

    if (!popup || popup.closed || typeof popup.closed == 'undefined') {
        alert("팝업 차단이 설정되어 있습니다.");
    }
}
*/



