window.open("./input.html", "input", "width=600, height=600, resizable=yes, scrollbars=yes");

const inputText = document.getElementById('inputText');
const sendButton = document.getElementById('sendButton');

let sentenceArray = [];

sendButton.addEventListener("click", () => {
    let sentence = inputText.value.trim();

    if(sentence !== "") {
        sentenceArray.push(sentence);
        inputText.value = "";
        console.log(sentenceArray);
    }
});


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



