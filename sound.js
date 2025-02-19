
console.log("samples.js is loading...");

// Check if noteMap already exists
if (window.noteMap) {
    console.warn("⚠️ window.noteMap already exists!", window.noteMap);
} else {
    console.warn("❌ window.noteMap DOES NOT EXIST before setting it.");
}

// Tone.js Sampler Setup for Piano Sound
const sampler = new Tone.Sampler({
    urls: {
        "A3": "A3.wav",
        "A#3": "As3.wav",
        "B3": "B3.wav",
        "C3": "C3.wav",
        "C#3": "Cs3.wav",
        "D3": "D3.wav",
        "D#3": "Ds3.wav",
        "E3": "E3.wav",
        "F3": "F3.wav",
        "F#3": "Fs3.wav",
        "G3": "G3.wav",
        "G#3": "Gs3.wav",
        "C4": "C4.wav",
        "C#4": "Cs4.wav",
        "D4": "D4.wav",
        "D#4": "Ds4.wav",
        "E4": "E4.wav",
    },
    release: 1,
    baseUrl: "./piano/", // Relative path to the piano folder
    onload: () => {
        console.log("Samples loaded.");
    },
}).toDestination();

// Map plain note names to their corresponding notes with octaves
window.noteMap = {
    "A": "A3",
    "A#": "A#3",
    "B": "B3",
    "C": "C3",
    "C#": "C#3",
    "D": "D3",
    "D#": "D#3",
    "E": "E3",
    "F": "F3",
    "F#": "F#3",
    "G": "G3",
    "G#": "G#3",
    "C-high": "C4",
    "C#-high": "C#4",
    "D-high": "D4",
    "D#-high": "D#4",
    "E-high": "E4",
};

// Log immediately after setting it
console.log("✅ window.noteMap set:", window.noteMap);

// Check again after everything
setTimeout(() => {
    console.log("✅ Final window.noteMap check:", window.noteMap);
}, 1000);

// Helper function to map notes to include octaves
function mapNoteToOctave(note) {
    return noteMap[note] || null; // Return the mapped note or null if not found
}

// Function to play a note using the sampler
function playNote(note) {
    const mappedNote = mapNoteToOctave(note); // Map the note to include the octave
    if (mappedNote) {
        sampler.triggerAttack(mappedNote);
    } else {
        console.warn(`Note "${note}" not found in noteMap.`);
    }
}

// Function to stop a note using the sampler
function stopNote(note) {
    const mappedNote = mapNoteToOctave(note); // Map the note to include the octave
    if (mappedNote) {
        sampler.triggerRelease(mappedNote);
    }
}

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

// Debugging for the `coordinateToNote` mapping
if (!window.coordinateToNote || Object.keys(window.coordinateToNote).length === 0) {
    console.error(
        "coordinateToNote mapping is not defined or empty."
    );
} else {
    console.log("coordinateToNote mapping loaded successfully.");
}
console.log("✅ noteMap at the end of samples.js:", window.noteMap);

