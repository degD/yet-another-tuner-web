import { PitchDetector } from "https://esm.sh/pitchy@4";

var cursorIndex = 0;
var cursorDirection = 1;
var clarityThreshold = 0.80;
var notes = ["c", "c#", "d", "d#", "e", "f", "f#", "g", "g#", "a", "a#", "b"];
var darkTheme = true;
var array = []
var cursorLock = false;

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
    if (!cursorLock) {
        document.querySelector(".cursor").style["margin-left"] = `${newCursorX - cursorWidth/2}px`;
    }
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

    let octaveLeft = chords["l"] === "b" ? octave-1 : octave;
    let octaveRight = chords["r"] === "c" ? octave+1 : octave;

    console.log("s:", semitones);
    console.log(freqL, freqR);
    return {"chords": chords, "octave": octave, "fL": freqL, "fR": freqR, "oL": octaveLeft, "oR": octaveRight};
}

function updatePitch(analyserNode, detector, input, sampleRate) {
    analyserNode.getFloatTimeDomainData(input);
    const [pitch, clarity] = detector.findPitch(input, sampleRate);
    
    // Update something to display pitch etc...
    if (clarity > clarityThreshold) {
        let {chords, octave, fL, fR, oL, oR} = findChord(pitch);
        console.log(chords);

        if (!cursorLock) {
            document.querySelector(".left-chord").innerHTML = `<div>${chords["l"].toUpperCase()}<sub>${oL}</sub></div>`;
            document.querySelector(".middle-chord").innerHTML = `<div>${chords["m"].toUpperCase()}<sub>${octave}</sub></div>`;
            document.querySelector(".right-chord").innerHTML = `<div>${chords["r"].toUpperCase()}<sub>${oR}</sub></div>`;
            document.querySelector(".freq").textContent = `${Math.round(pitch * 10) / 10}Hz`;
        }
        
        let newCursorIndex = 100 * (pitch - fL) / (fR - fL);
        setCursor(newCursorIndex);

        console.log(`pitch: ${Math.round(pitch * 10) / 10}Hz, clarity: ${Math.round(clarity * 100)}`);
        array.push(pitch)
        console.log(array)
    }

    window.setTimeout(
        () => updatePitch(analyserNode, detector, input, sampleRate),
        20
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

// Play a tone when cursor stays in the green field for 2 seconds
let enteredGreen = false;
let enteredGreenTime = Date.now();
let tonePlayed = false;
const tonePath = "audio.wav";
const toneAudioElement = new Audio(tonePath);
setInterval(() => {
    if (Math.abs(cursorIndex - 50) <= 2) {
        if (enteredGreen == false) {
            enteredGreen = true;
            enteredGreenTime = Date.now();
        } else if ((Date.now() - enteredGreenTime) > 2000  && !tonePlayed) {
            cursorLock = true;
            toneAudioElement.play();
            tonePlayed = true;
            document.querySelector(".green-field").style["filter"] = "brightness(2)";
            setTimeout(() => document.querySelector(".green-field").style["filter"] = "brightness(1)", 2000);
        }
    } else {
        enteredGreen = false;
        tonePlayed = false;
        toneAudioElement.addEventListener("ended", () => cursorLock = false);
    }
    console.log(enteredGreen, enteredGreenTime);
}, 100);


/* Main */
useDarkTheme();
// setInterval(() => {
//     let c = cursorIndex;
//     c = c + cursorDirection;
//     setCursor(c);
//     if (c > 100) cursorDirection = -1;
//     if (c < 0) cursorDirection = 1;
// }, 10); // To test cursor movement...
