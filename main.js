import { PitchDetector } from "https://esm.sh/pitchy@4";

var cursorIndex = 0;
var cursorDirection = 1;

/**
 * Move the cursor from left bar (0) to right bar (100). 
 * Numbers out of the bounds will be processed as 0 or 100. 
 * @param {number} i An integer [0, 100]
 */
function setCursor(i) {
    let rect = document.querySelector(".left-bar").getBoundingClientRect();
    let leftEnd = rect.left + (rect.right - rect.left)/2;
    let rightEnd = window.innerWidth - leftEnd;

    let cursorRect = document.querySelector(".cursor").getBoundingClientRect();
    let cursorWidth = cursorRect.right - cursorRect.left;

    if (i > 100) i = 100;
    if (i < 0) i = 0;

    let newCursorX = i * (rightEnd - leftEnd) / 100 + leftEnd;
    document.querySelector(".cursor").style["margin-left"] = `${newCursorX - cursorWidth/2}px`;
    cursorIndex = i;
}

function useColors(colors) {
    let chords = document.querySelectorAll(".chord");
    [...chords].forEach(element => {
        element.style["color"] = colors["bar"];
    });
    let bars = document.querySelectorAll(".bar");
    [...bars].forEach(element => {
        element.style["background-color"] = colors["bar"];
    });
    document.querySelector(".horizontal-line")
    .style["background-color"] = colors["bar"];

    document.querySelector("body")
    .style["background-color"] = colors["screen"];

    document.querySelector(".cursor")
    .style["background-color"] = colors["cursor"];
}

function useLightTheme() {
    useColors({
        "bar": "#000000",
        "screen": "#ececec",
        "cursor": "#f2630a"
    });
}

function useDarkTheme() {
    useColors({
        "bar": "#d2d2d2",
        "screen": "#1a1a1a",
        "cursor": "#f2630a"
    });
}

function updatePitch(analyserNode, detector, input, sampleRate) {
    console.log(sampleRate);
    analyserNode.getFloatTimeDomainData(input);
    const [pitch, clarity] = detector.findPitch(input, sampleRate);
    
    // Update something to display pitch etc...
    console.log(`pitch: ${Math.round(pitch * 10) / 10}Hz, clarity: ${Math.round(clarity * 100)}`);
    
    window.setTimeout(
        () => updatePitch(analyserNode, detector, input, sampleRate),
        100
    );
}

document.addEventListener("DOMContentLoaded", () => {
    const audioContext = new window.AudioContext();
    const analyserNode = audioContext.createAnalyser();

    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        audioContext.createMediaStreamSource(stream).connect(analyserNode);
        const detector = PitchDetector.forFloat32Array(analyserNode.fftSize);
        detector.minVolumeDecibels = -10;
        const input = new Float32Array(detector.inputLength);
        updatePitch(analyserNode, detector, input, audioContext.sampleRate);
    });
});

/* Main */
useDarkTheme();
setInterval(() => {
    let c = cursorIndex;
    c = c + cursorDirection;
    setCursor(c);
    if (c > 100) cursorDirection = -1;
    if (c < 0) cursorDirection = 1;
}, 10); // To test cursor movement...