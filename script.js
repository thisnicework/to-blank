window.open("./input.html", "input", "width=600, height=600, resizable=yes, scrollbars=yes");

const textarea = document.getElementById('textarea');
const sendButton = document.getElementById('sendButton');

let sentenceArray = [];

textarea.addEventListener('input', () => {
    let lineNum = Math.floor(textarea.scrollHeight / 90); // 90 is line-height
    console.log(lineNum);
});

sendButton.addEventListener("click", () => {
    let sentence = textarea.value.trim();

    if(sentence !== "") {
        sentenceArray.push(sentence);
        textarea.value = "";
        console.log(sentenceArray);
    }
});

// setInterval(() => {
//     console.log(textareaHeight);
// }, 500);


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



