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
        textarea.style.height = 112 + "px"; // set default height
        whizMotion();
    }
});

function whizMotion() {
    let scale = 1;
    whiz.style.width = UI.offsetWidth + "px";
    whiz.style.height = UI.offsetHeight + "px";

    whiz.style.display = "block";

    let whizInterval = setInterval(() => {
        whiz.style.transform = `translateX(-50%) translateY(-50%) scale(${scale -= 0.002})`;
        whiz.style.top = whiz.offsetTop - 1 + "px";

        if(whiz.offsetTop === 0) {
            setTimeout(() => {
                whiz.style.display = "none";
                clearInterval(whizInterval);

                scale = 1;
                whiz.style.transform = `scale(${1})`;
                whiz.style.left = 50 + "%";
                whiz.style.top = 48 + "%"
                whiz.style.width = UI.offsetWidth + "px";
                whiz.style.height = UI.offsetHeight + "px";
            }, 500);
        }
    }, 0.1);
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



