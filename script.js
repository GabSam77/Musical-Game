const svg = document.getElementById('tonnetz-grid');

const rows = [
    ["A", "F#", "D#", "C", "A", "F#", "D#", "C", "A", "F#", "D#", "C"],
    ["D", "B", "G#", "F", "D", "B", "G#", "F", "D", "B", "G#", "F"],
    ["A#", "G", "E", "C#", "A#", "G", "E", "C#", "A#", "G", "E", "C#"],
    ["D#", "C", "A", "F#", "D#", "C", "A", "F#", "D#", "C", "A", "F#"],
    ["B", "G#", "F", "D", "B", "G#", "F", "D", "B", "G#", "F", "D"],
    ["E", "C#", "A#", "G", "E", "C#", "A#", "G", "E", "C#", "A#", "G"],
    ["C", "A", "F#", "D#", "C", "A", "F#", "D#", "C", "A", "F#", "D#"],
    ["F", "D", "B", "G#", "F", "D", "B", "G#", "F", "D", "B", "G#"],
    ["C#", "A#", "G", "E", "C#", "A#", "G", "E", "C#", "A#", "G", "E"],
    ["F#", "D#", "C", "A", "F#", "D#", "C", "A", "F#", "D#", "C", "A"],
    ["D", "B", "G#", "F", "D", "B", "G#", "F", "D", "B", "G#", "F"],
    ["G", "E", "C#", "A#", "G", "E", "C#", "A#", "G", "E", "C#", "A#"],
];

const nodeRadius = 20;
const triangleWidth = 100;
const triangleHeight = 70;

const pastelColors = [
    "#ffd1dc", "#c5e1a5", "#b2dfdb", "#f8bbd0", "#ffe082", "#b3e5fc",
    "#d1c4e9", "#ffab91", "#a5d6a7", "#b39ddb", "#80cbc4", "#ffcc80"
];

const noteColors = {};
const tonnetzNodes = {}; // Map of note to its nodes on the grid
const coordinateToNote = {}; // Map coordinates to their notes
window.coordinateToNote = coordinateToNote;

// Assign each note a color and initialize storage
const uniqueNotes = new Set(rows.flat());
Array.from(uniqueNotes).forEach((note, index) => {
    noteColors[note] = pastelColors[index % pastelColors.length];
    tonnetzNodes[note] = [];
});

// Generate triangles and nodes
rows.forEach((row, rowIndex) => {
    row.forEach((note, colIndex) => {
        const x = colIndex * triangleWidth + (rowIndex % 2 === 1 ? triangleWidth / 2 : 0);
        const y = rowIndex * triangleHeight;

        // Map coordinates to notes
        coordinateToNote[`${x},${y}`] = note;

        // Add triangles
        if (rowIndex < rows.length - 1 && colIndex < row.length - 1) {
            const xRight = x + triangleWidth;
            const xDownRight = x + triangleWidth / 2;
            const yDown = y + triangleHeight;

            // Upper triangle
            svg.appendChild(createTriangle(x, y, xRight, y, xDownRight, yDown));

            // Lower triangle
            if (colIndex > 0) {
                const xDownLeft = x - triangleWidth / 2;
                svg.appendChild(createTriangle(x, y, xDownLeft, yDown, xDownRight, yDown));
            }
        }

        
        
        // Add circular nodes
        const node = createNode(x, y, note);
        svg.appendChild(node);
        tonnetzNodes[note].push(node);
    });
});

// Function to create lines forming triangles
function createTriangle(x1, y1, x2, y2, x3, y3) {
    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute('points', `${x1},${y1} ${x2},${y2} ${x3},${y3}`);
    polygon.setAttribute('fill', 'transparent');
    polygon.setAttribute('stroke', '#333'); // Dark grey border
    polygon.setAttribute('stroke-width', '2'); // Visible thickness
    polygon.style.cursor = 'pointer';

    polygon.addEventListener('mousedown', () => {
        const notes = [
            coordinateToNote[`${x1},${y1}`],
            coordinateToNote[`${x2},${y2}`],
            coordinateToNote[`${x3},${y3}`]
        ];

        notes.forEach(note => {
            applyColor(note);
            //playNote(note); // Play each note
        });
    });

    polygon.addEventListener('mouseup', resetColors);

    return polygon;
}

// Function to create circular nodes
function createNode(x, y, note) {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('transform', `translate(${x}, ${y})`);
    group.setAttribute('data-note', note);
    group.style.cursor = "pointer";

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('class', 'node');
    circle.setAttribute('cx', 0);
    circle.setAttribute('cy', 0);
    circle.setAttribute('r', nodeRadius);
    circle.setAttribute('stroke', '#aaa');
    circle.setAttribute('stroke-width', '1');
    circle.setAttribute('fill', 'white')

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('class', 'note-label');
    text.setAttribute('x', 0);
    text.setAttribute('y', 4);
    text.textContent = note;

    group.addEventListener('mousedown', () => {
        console.log(`Node clicked: ${note}`);
        applyColor(note);
    });
    group.addEventListener('mouseup', resetColors);
    
    group.appendChild(circle);
    group.appendChild(text);
    return group;
}

// Add keyboard key event listeners
document.querySelectorAll('.key').forEach(key => {
    const note = key.getAttribute('data-note');
    key.addEventListener('mousedown', () => {
        applyColor(note);
    });
    key.addEventListener('mouseup', resetColors);
});


// Apply color to nodes and keys
function applyColor(note) {
    const color = noteColors[note];

    // Update Tonnetz nodes
    if (tonnetzNodes[note]) {
        tonnetzNodes[note].forEach(node => {
            const circle = node.querySelector('circle');
            // console.log(`Applying color to circle for note: ${note}`, circle);
            if (circle) {
                circle.setAttribute('fill', color); // Apply fill color
                console.log('Circle fill attribute:', circle.getAttribute('fill')); // Log the actual value
            } else {
                console.log('not found')
            }
        });
    }

    const keys = document.querySelectorAll(`.key[data-note="${note}"]`);
    keys.forEach(key => {
        key.style.backgroundColor = color;
    });
}

// Reset all colors
function resetColors() {
    Object.keys(tonnetzNodes).forEach(note => {
        tonnetzNodes[note].forEach(node => {
            const circle = node.querySelector('circle');
            circle.setAttribute('fill', 'white');
        });

        const keys = document.querySelectorAll(`.key[data-note="${note}"]`);
        keys.forEach(key => {
            key.style.backgroundColor = '';
        });
    });
}