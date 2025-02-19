// keyboard note mapping
const keyToNoteMap = {
    'a': 'C',
    'w': 'C#',
    's': 'D',
    'e': 'D#',
    'd': 'E',
    'f': 'F',
    't': 'F#',
    'g': 'G',
    'y': 'G#',
    'h': 'A',
    'u': 'A#',
    'j': 'B',
    'k': 'C-high',
    'o': 'C#-high',
    'l': 'D-high',
    'p': 'D#-high',
    ';': 'E-high',
};

// active keys
const activeKeys = new Set();

// play note
function playNoteByKeyboard(key) {
    const note = keyToNoteMap[key.toLowerCase()]; // Convert key to note
    if (!note || activeKeys.has(key)) return; // Prevent repeated triggers

    activeKeys.add(key);
    playNote(note); // Play sound

    // ✅ Apply color to both keyboard and Tonnetz
    applyColor(note);
    applyColor(note.replace("-high", "")); // Map -high notes to base notes for Tonnetz

    console.log(`🎹 playNoteByKeyboard() triggered applyColor() for: ${note}`);
}

// stop note
function stopNoteByKeyboard(key) {
    const note = keyToNoteMap[key.toLowerCase()];
    if (!note || !activeKeys.has(key)) return;

    activeKeys.delete(key);
    stopNote(note); // Stop sound

    // ✅ Reset color for both keyboard and Tonnetz
    resetColors();
}

// highlight piano and nodes
function highlightKeyAndNode(note) {
    // piano
    const keys = document.querySelectorAll(`.key[data-note="${note}"]`);
    keys.forEach((key) => {
        key.style.backgroundColor = noteColors[note] || '#ddd';
    });

    // nodes
    if (tonnetzNodes[note]) {
        tonnetzNodes[note].forEach((node) => {
            const circle = node.querySelector('circle');
            if (circle) {
                circle.style.fill = noteColors[note] || '#ddd';
            }
        });
    }
}

// unhighlight piano and nodes
function unhighlightKeyAndNode(note) {
    // piano
    const keys = document.querySelectorAll(`.key[data-note="${note}"]`);
    keys.forEach((key) => {
        key.style.backgroundColor = '';
    });

    // nodes
    if (tonnetzNodes[note]) {
        tonnetzNodes[note].forEach((node) => {
            const circle = node.querySelector('circle');
            if (circle) {
                circle.style.fill = 'white';
            }
        });
    }
}

// event listeners
document.addEventListener('keydown', (event) => {
    if (!event.repeat) {
        playNoteByKeyboard(event.key);
    }
});

document.addEventListener('keyup', (event) => {
    stopNoteByKeyboard(event.key);
});

// ✅ Ensure Touch Support for Visual Keyboard Keys
document.querySelectorAll('.key').forEach(key => {
    const note = key.getAttribute('data-note');

    function handleKeyTouchStart(event) {
        event.preventDefault(); // Prevent accidental scrolling
        console.log(`🎹 Key touched: ${note}`);
        playNote(note);
        applyColor(note);
    }

    function handleKeyTouchEnd() {
        stopNote(note);
        resetColors();
    }

    // ✅ Attach touch events to keyboard keys
    key.addEventListener('touchstart', handleKeyTouchStart);
    key.addEventListener('touchend', handleKeyTouchEnd);
});

// ✅ Ensure Touch Support for Laptop Keyboard Input
document.addEventListener('touchstart', (event) => {
    const keyElement = event.target.closest('.key');
    if (keyElement) {
        const note = keyElement.getAttribute('data-note');
        playNoteByKeyboard(note);
    }
});

document.addEventListener('touchend', (event) => {
    const keyElement = event.target.closest('.key');
    if (keyElement) {
        const note = keyElement.getAttribute('data-note');
        stopNoteByKeyboard(note);
    }
});

