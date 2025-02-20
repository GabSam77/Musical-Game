document.addEventListener('click', async () => {
    if (Tone.context.state !== 'running') {
        await Tone.start();
    }
}, { once: true });  // Runs only once


console.log("🚀 sound.js is running!");

let currentOctave = 3; // Default starting octave

// Function to generate dynamic sample URLs
function generateSampleURLs(octave) {
    console.log(`🎼 generateSampleURLs() called with Octave: ${octave}`);
    let urls = {
        [`A${octave}`]: `A${octave}.wav`,
        [`A#${octave}`]: `As${octave}.wav`,
        [`B${octave}`]: `B${octave}.wav`,
        [`C${octave}`]: `C${octave}.wav`,
        [`C#${octave}`]: `Cs${octave}.wav`,
        [`D${octave}`]: `D${octave}.wav`,
        [`D#${octave}`]: `Ds${octave}.wav`,
        [`E${octave}`]: `E${octave}.wav`,
        [`F${octave}`]: `F${octave}.wav`,
        [`F#${octave}`]: `Fs${octave}.wav`,
        [`G${octave}`]: `G${octave}.wav`,
        [`G#${octave}`]: `Gs${octave}.wav`,
        [`C${octave + 1}`]: `C${octave + 1}.wav`,
        [`C#${octave + 1}`]: `Cs${octave + 1}.wav`,
        [`D${octave + 1}`]: `D${octave + 1}.wav`,
        [`D#${octave + 1}`]: `Ds${octave + 1}.wav`,
        [`E${octave + 1}`]: `E${octave + 1}.wav`,
    };
    return urls;
}

let analyser = Tone.context.createAnalyser();
analyser.fftSize = 256;
let bufferLength = analyser.frequencyBinCount;
let dataArray = new Uint8Array(bufferLength);

let sampler;
function initializeSampler() {    
    sampler = new Tone.Sampler({
        urls: generateSampleURLs(currentOctave),
        release: 1,
        baseUrl: "./piano/",
        onload: () => {
            console.log("✅ Samples successfully loaded.");
        }
    }).toDestination();
    sampler.connect(analyser);
}

// Call it at the start
initializeSampler();

function updateSampler() {
    console.log("🔄 Updating Sampler...");

    sampler = new Tone.Sampler({
        urls: generateSampleURLs(currentOctave),
        release: 1,
        baseUrl: "./piano/",
        onload: () => {
            console.log(`🎼 Samples updated to Octave ${currentOctave}`);
        }
    }).toDestination();
}


// Function to generate dynamic noteMap
function generateNoteMap(octave) {
    return {
        "A": `A${octave}`,
        "A#": `A#${octave}`,
        "B": `B${octave}`,
        "C": `C${octave}`,
        "C#": `C#${octave}`,
        "D": `D${octave}`,
        "D#": `D#${octave}`,
        "E": `E${octave}`,
        "F": `F${octave}`,
        "F#": `F#${octave}`,
        "G": `G${octave}`,
        "G#": `G#${octave}`,
        "C-high": `C${octave + 1}`,
        "C#-high": `C#${octave + 1}`,
        "D-high": `D${octave + 1}`,
        "D#-high": `D#${octave + 1}`,
        "E-high": `E${octave + 1}`,
    };
}

// Initialize noteMap
window.noteMap = generateNoteMap(currentOctave);

// Function to update noteMap when transposing
function updateNoteMap() {
    window.noteMap = generateNoteMap(currentOctave);
}

// Function to transpose the octave dynamically
function transposeOctave(amount) {
    currentOctave += amount;
    updateNoteMap();
    updateSampler();
    updateOctaveDisplay();
}

function updateOctaveDisplay() {
    const octaveText = document.getElementById("current-octave-text");
    if (octaveText) {
        octaveText.textContent = currentOctave;
        console.log(`🎵 Updated Octave Display: ${currentOctave}`);
    } else {
        console.warn("⚠️ Octave display element not found in DOM.");
    }
}

function playNote(note) {
    const mappedNote = window.noteMap[note];

    if (!sampler || !sampler.loaded) {
        console.warn("⚠️ Sampler not yet loaded, can't play:", mappedNote);
        return;
    }

    if (mappedNote) {
        sampler.triggerAttack(mappedNote);

        // ✅ Call the visualization function (Now properly defined)
        if (window.onNotePlayed) {
            window.onNotePlayed(mappedNote);
        }
    } else {
        console.warn(`⚠️ No sample found for ${mappedNote}`);
    }
}



// Function to stop a note using the sampler
function stopNote(note) {
    const mappedNote = window.noteMap[note]; // Dynamically mapped note
    if (mappedNote && sampler._buffers.has(mappedNote)) {
        sampler.triggerRelease(mappedNote);
    }
}

window.audioAnalyser = analyser;

// Function to get notes from triangle coordinates
function getNotesFromTriangle(triangle) {
    const coordinates = triangle.getAttribute('points').split(' ').map(coord => coord.trim());
    const notes = coordinates.map(coord => {
        const [x, y] = coord.split(',').map(Number); // Convert to numbers
        return window.coordinateToNote?.[`${x},${y}`]; // Access global mapping
    }).filter(note => note); // Filter out undefined values

    if (notes.length === 0) {
        console.warn(`No notes found for the triangle: ${triangle.getAttribute('points')}`);
    }

    return notes;
}

// Event listeners for playing and stopping notes
document.addEventListener('mousedown', (event) => {
    const target = event.target;

    // Check if a triangle (polygon) is clicked
    if (target.tagName === 'polygon') {
        const notes = getNotesFromTriangle(target); // Get notes for the triangle

        // Play all notes in the triangle
        notes.forEach(note => {
            playNote(note);
        });
    }

    // Check if a node (circle) is clicked
    const nodeGroup = target.closest('g[data-note]');
    if (nodeGroup) {
        const note = nodeGroup.getAttribute('data-note');
        playNote(note);
    }

    // Check if a keyboard key is clicked
    if (target.classList.contains('key')) {
        const note = target.getAttribute('data-note');
        playNote(note);
    }
});

// Stop all notes when mouse is released
document.addEventListener('mouseup', () => {
    sampler.releaseAll(); // Stop all currently playing notes
});

document.addEventListener("DOMContentLoaded", () => {
    updateOctaveDisplay();
    // Get buttons
    const octaveDownBtn = document.getElementById("octave-down");
    const octaveUpBtn = document.getElementById("octave-up");

    if (octaveDownBtn && octaveUpBtn) {
        // Event Listeners for transpose buttons with limit between 2 and 4
        octaveDownBtn.addEventListener("click", () => {
            if (currentOctave > 2) { // Prevents transposing below C2
                transposeOctave(-1);
            } else {
                console.warn("⚠️ Minimum Octave Reached (C2)");
            }
        });

        octaveUpBtn.addEventListener("click", () => {
            if (currentOctave < 4) { // Prevents transposing above C4
                transposeOctave(1);
            } else {
                console.warn("⚠️ Maximum Octave Reached (C4)");
            }
        });

        console.log("✅ Octave buttons are set up!");
    } else {
        console.warn("⚠️ Octave buttons not found in DOM.");
    }
});

document.addEventListener("keydown", (event) => {
    if (event.repeat) return; // Prevents holding the key from spamming

    if (event.key.toLowerCase() === "z") {
        if (currentOctave > 2) {
            transposeOctave(-1);
        } else {
            console.warn("⚠️ Minimum Octave Reached (C2)");
        }
    } 
    else if (event.key.toLowerCase() === "x") {
        if (currentOctave < 4) {
            transposeOctave(1);
        } else {
            console.warn("⚠️ Maximum Octave Reached (C4)");
        }
    }
});
