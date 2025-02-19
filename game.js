console.log("🎮 game.js is running!");

/* 🚀 Ensure AudioContext Starts */
document.addEventListener('click', async () => {
    if (Tone.context.state !== 'running') {
        await Tone.start();
        console.log("🎵 AudioContext started!");
    }
}, { once: true });

/* 🎵 Game Variables */
let gameActive = false;
let currentNotes = [];
let correctInterval = "";
let score = 0;
let userPlayedNotes = [];

/* ✅ Define Global Note Map (C2 - E5) */
window.fullNoteMap = {
    "C2": "C2.wav", "C#2": "Cs2.wav", "D2": "D2.wav", "D#2": "Ds2.wav", "E2": "E2.wav",
    "F2": "F2.wav", "F#2": "Fs2.wav", "G2": "G2.wav", "G#2": "Gs2.wav", "A2": "A2.wav", "A#2": "As2.wav", "B2": "B2.wav",
    "C3": "C3.wav", "C#3": "Cs3.wav", "D3": "D3.wav", "D#3": "Ds3.wav", "E3": "E3.wav",
    "F3": "F3.wav", "F#3": "Fs3.wav", "G3": "G3.wav", "G#3": "Gs3.wav", "A3": "A3.wav", "A#3": "As3.wav", "B3": "B3.wav",
    "C4": "C4.wav", "C#4": "Cs4.wav", "D4": "D4.wav", "D#4": "Ds4.wav", "E4": "E4.wav",
    "F4": "F4.wav", "F#4": "Fs4.wav", "G4": "G4.wav", "G#4": "Gs4.wav", "A4": "A4.wav", "A#4": "As4.wav", "B4": "B4.wav",
    "C5": "C5.wav", "C#5": "Cs5.wav", "D5": "D5.wav", "D#5": "Ds5.wav", "E5": "E5.wav"
};

/* ✅ Play a Note in Game Mode */
function playGameNote(note) {
    let mappedNote = window.fullNoteMap[note];
    if (!mappedNote) {
        console.error(`❌ No mapping found for note: ${note}`);
        return;
    }

    console.log(`🎶 Playing Game Note: ${mappedNote}`);
    
    let audio = new Audio(`piano/${mappedNote}`); // ✅ Ensure path is correct
    audio.play().catch(error => console.error("❌ Audio Playback Error:", error));
}

/* 🎛️ Get UI Elements */
const scoreDisplay = document.getElementById("score");
const popupMessage = document.getElementById("popup-message");
const popupText = document.getElementById("popup-text");
const nextLevelBtn = document.getElementById("next-level");
const exitGameBtn = document.getElementById("exit-game");
const retryBtn = document.getElementById("retry");
const startGamePopup = document.getElementById("start-game-popup");
const startGameBtn = document.getElementById("start-game-btn");
const gameInstruction = document.getElementById("game-instruction");
const baseNoteText = document.getElementById("base-note-text");

/* 🎼 Possible Intervals */
const intervals = {
    "Minor Second": 1, "Major Second": 2, "Minor Third": 3, "Major Third": 4,
    "Perfect Fourth": 5, "Tritone": 6, "Perfect Fifth": 7, "Minor Sixth": 8,
    "Major Sixth": 9, "Minor Seventh": 10, "Major Seventh": 11, "Octave": 12
};

/* 🎮 Function to Start the Game */
function startGame() {
    console.log("🎵 Starting Interval Guessing Game...");
    
    gameActive = true;  // ✅ Ensure game is active
    score = 0;
    scoreDisplay.textContent = score;

    if (startGamePopup) {
        startGamePopup.classList.add("hidden");  // ✅ Hide popup
        console.log("✅ Start Game Popup Hidden");
    }

    playNewInterval();
}

/* 🎵 Convert Note to MIDI Number */
function getMIDINumber(note) {
    if (!note) {
        console.error("❌ getMIDINumber received undefined note!");
        return null;
    }

    const midiMap = {
        "C": 0, "C#": 1, "D": 2, "D#": 3, "E": 4,
        "F": 5, "F#": 6, "G": 7, "G#": 8, "A": 9,
        "A#": 10, "B": 11
    };

    // ✅ Convert "C-high" into standard MIDI format
    if (note.includes("-high")) {
        note = note.replace("-high", "5");  // Convert "C-high" -> "C5"
    }

    let cleanNote = note.replace(/\d+/g, ""); // Remove octave number
    let octaveMatch = note.match(/\d+/);
    let octave = octaveMatch ? parseInt(octaveMatch[0]) : 4; // Default octave = 4

    if (!(cleanNote in midiMap)) {
        console.error(`❌ Unknown note: ${note}`);
        return null;
    }

    return midiMap[cleanNote] + (octave * 12);
}



/* 🎵 Function to Play a Random Interval */
function playNewInterval() {
    userPlayedNotes = [];

    console.log("🔄 Running playNewInterval()");

    const allNotes = Object.keys(window.fullNoteMap);
    if (allNotes.length === 0) {
        console.error("❌ No available notes to select!");
        return;
    }

    // ✅ Select a base note randomly
    const baseIndex = Math.floor(Math.random() * allNotes.length);
    const baseNote = allNotes[baseIndex];

    console.log(`🎶 Selected Base Note: ${baseNote}`);

    let intervalSteps = Object.values(intervals);
    let randomIntervalStep = intervalSteps[Math.floor(Math.random() * intervalSteps.length)];

    let ascending = Math.random() < 0.5;
    let baseMIDI = getMIDINumber(baseNote);
    if (baseMIDI === null) return;

    let targetMIDI = ascending ? baseMIDI + randomIntervalStep : baseMIDI - randomIntervalStep;

    // ✅ Find the closest valid note
    let targetNote = allNotes.find(n => getMIDINumber(n) === targetMIDI);

    if (!targetNote) {
        console.warn("⚠️ No valid target note found.");
        return;
    }

    currentNotes = [baseNote, targetNote];
    correctInterval = Object.keys(intervals).find(key => intervals[key] === randomIntervalStep);

    console.log(`🎼 Playing interval: ${baseNote} → ${targetNote} (${correctInterval}, ${ascending ? "Ascending" : "Descending"})`);

    applyColor(baseNote);
    baseNoteText.textContent = `${baseNote}`;
    gameInstruction.textContent = `🎵 First Note: ${baseNote} (Play it first!)`;

    setTimeout(() => {
        console.log(`🎶 Playing Base Note: ${baseNote}`);
        playGameNote(baseNote);
    }, 500);
    
    setTimeout(() => {
        console.log(`🎶 Playing Target Note: ${targetNote}`);
        playGameNote(targetNote);
        gameInstruction.textContent = "🎵 Now play the second note!";
    }, 1500);
}

document.addEventListener("mousedown", (event) => {
    console.log("🖱 Mouse click detected!");

    let target = event.target;

    if (target.classList.contains("key")) {
        let clickedNote = target.getAttribute("data-note");
        console.log(`🖱 Clicked Note: ${clickedNote}`);

        if (!clickedNote) return;

        checkUserInput(clickedNote);
        playGameNote(clickedNote);  // ✅ Ensure sound plays when clicking
    }
});

document.addEventListener("keydown", (event) => {
    console.log(`🎹 Key Pressed: ${event.key}`);

    const keyToNoteMap = {
        "a": "C4", "w": "C#4", "s": "D4", "e": "D#4", "d": "E4",
        "f": "F4", "t": "F#4", "g": "G4", "y": "G#4", "h": "A4",
        "u": "A#4", "j": "B4", "k": "C5", "o": "C#5",
        "l": "D5", "p": "D#5", ";": "E5"
    };

    let pressedNote = keyToNoteMap[event.key];

    if (pressedNote) {
        console.log(`🎹 Mapped Key to Note: ${pressedNote}`);

        checkUserInput(pressedNote);  
        playGameNote(pressedNote);  // ✅ Ensure the sound plays on key press
    }
});

/* 🎯 Function to Check User Input */
function checkUserInput(note) {
    if (!gameActive) return;

    userPlayedNotes.push(note);
    applyColor(note);

    console.log(`🎹 User Input: ${note}`);
    console.log(`🔎 Checking if note exists in fullNoteMap:`, window.fullNoteMap[note] ? "✅ Found" : "❌ Not Found");

    let midiNumber = getMIDINumber(note);
    console.log(`🎵 Converted to MIDI: ${midiNumber}`);


    if (userPlayedNotes.length === 2) {
        let [userBase, userTarget] = userPlayedNotes;
        let baseMIDI = getMIDINumber(userBase);
        let targetMIDI = getMIDINumber(userTarget);

        if (baseMIDI === null || targetMIDI === null) {
            console.warn("⚠️ One or both notes not found in MIDI mapping!");
            return;
        }

        let userInterval = Math.abs(targetMIDI - baseMIDI);
        let correctIntervalSteps = Math.abs(getMIDINumber(currentNotes[1]) - getMIDINumber(currentNotes[0]));

        console.log(`🎵 User played: ${userBase} → ${userTarget} (${userInterval} semitones)`);
        console.log(`🎯 Correct interval: ${correctInterval} (${correctIntervalSteps} semitones)`);

        // ✅ Check if the user played the correct interval (allowing different octaves)
        if (userInterval === correctIntervalSteps) {
            score += 10;
            showPopupMessage(`✅ Correct! Your Score: ${score}`, true);
        } else {
            score = 0;
            showPopupMessage(`❌ Wrong! Score Reset to 0`, false, true);
        }

        scoreDisplay.textContent = score;
        userPlayedNotes = []; // Reset input for next round
    }
}


function showPopupMessage(message, correct, showRetry = false) {
    console.log(`📢 showPopupMessage called with: ${message}`);
    
    // Debugging: Check if popup elements exist
    if (!popupMessage || !popupText || !nextLevelBtn || !retryBtn) {
        console.error("❌ Popup elements are missing!");
        return;
    }

    popupText.textContent = message;
    popupMessage.classList.remove("hidden");

    if (correct) {
        console.log("✅ Correct Answer - Showing Next Level Button");
        nextLevelBtn.classList.remove("hidden");
        retryBtn.classList.add("hidden");
    } else {
        console.log("❌ Wrong Answer - Showing Retry Button");
        nextLevelBtn.classList.add("hidden");
        retryBtn.classList.remove("hidden");
    }
}




/* 🎛️ Event Listeners */
startGameBtn.addEventListener("click", startGame);
nextLevelBtn.addEventListener("click", () => {
    popupMessage.classList.add("hidden");
    playNewInterval();
});
retryBtn.addEventListener("click", () => location.reload());
exitGameBtn.addEventListener("click", () => window.location.href = "index.html");

/* 🎮 Show Start Game Popup on Load */
window.onload = () => {
    if (startGamePopup) startGamePopup.classList.remove("hidden");
};

console.log("✅ Interval Guessing Game Setup Complete!");
