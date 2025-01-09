import { PitchDetector } from "https://esm.sh/pitchy@4";

var cursorIndex = 0;
var cursorDirection = 1;
var clarityThreshold = 0.9;
var notes = ["c", "c#", "d", "d#", "e", "f", "f#", "g", "g#", "a", "a#", "b"];
var darkTheme = true;

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

    document.querySelector(".green-field")
    .style["background-color"] = colors["green"];

    document.querySelector("svg")
    .style["fill"] = colors["bar"];
}

function useLightTheme() {
    useColors({
        "bar": "#000000",
        "screen": "#ececec",
        "cursor": "#f2630a",
        "green": "#59de59"
    });
}

function useDarkTheme() {
    useColors({
        "bar": "#d2d2d2",
        "screen": "#1a1a1a",
        "cursor": "#f2630a",
        "green": "#008800"
    });
}

function getChords(i) {
    console.log(i);
    return {
        "l": notes.at((i-1) % notes.length), 
        "m": notes.at(i % notes.length), 
        "r": notes.at((i+1) % notes.length)
    };
}

function getChordIndex(chord) {
    return notes.indexOf(chord);
}

function getOctave(i, refOctave) {
    return refOctave + Math.floor(i / notes.length);
}

function findChord(freq) {
    let referenceFreq = 440; // frequency of A4
    let referenceNote = "a";
    let referenceIndex = getChordIndex(referenceNote);
    let referenceOctave = 4;

    let semitones = Math.round(12 * Math.log(freq / referenceFreq) / Math.LN2);
    let index = referenceIndex + semitones;
    let chords = getChords(index);
    let octave = getOctave(index, referenceOctave);

    let freqL = Math.pow(2, ((semitones-1) / 12)) * referenceFreq;
    let freqR = Math.pow(2, ((semitones+1) / 12)) * referenceFreq;

    console.log("s:", semitones);
    console.log(freqL, freqR);
    return {"chords": chords, "octave": octave, "fL": freqL, "fR": freqR};
}

function updatePitch(analyserNode, detector, input, sampleRate) {
    analyserNode.getFloatTimeDomainData(input);
    const [pitch, clarity] = detector.findPitch(input, sampleRate);
    
    // Update something to display pitch etc...
    if (clarity > clarityThreshold) {
        let {chords, octave, fL, fR} = findChord(pitch);
        console.log(chords);
        document.querySelector(".left-chord").textContent = chords["l"].toUpperCase();
        document.querySelector(".middle-chord").textContent = chords["m"].toUpperCase();
        document.querySelector(".right-chord").textContent = chords["r"].toUpperCase();
        document.querySelector(".freq").textContent = `${Math.round(pitch * 10) / 10}Hz`;

        let newCursorIndex = 100 * (pitch - fL) / (fR - fL);
        setCursor(newCursorIndex);

        console.log(`pitch: ${Math.round(pitch * 10) / 10}Hz, clarity: ${Math.round(clarity * 100)}`);
    }

    window.setTimeout(
        () => updatePitch(analyserNode, detector, input, sampleRate),
        50
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

window.onresize = () => {
    console.log(cursorIndex);
    setCursor(cursorIndex);
};

document.querySelector(".theme-change").addEventListener("click", () => {
    console.log("Oh no!")
    darkTheme = !darkTheme;
    if (darkTheme) {
        useDarkTheme();
    } else {
        useLightTheme();
    }
});

// TODO: If in green-field for ~1sn glow and play sound.

/* Main */
useDarkTheme();
// setInterval(() => {
//     let c = cursorIndex;
//     c = c + cursorDirection;
//     setCursor(c);
//     if (c > 100) cursorDirection = -1;
//     if (c < 0) cursorDirection = 1;
// }, 10); // To test cursor movement...
