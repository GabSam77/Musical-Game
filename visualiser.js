console.log("🎨 Visualizer.js is running!");


// 🎛 Global Variables
let canvas, ctx, animationFrame;
let visualizerEnabled = true; // Toggle State
let lastPlayedColor = "#b3e5fc"; // Default color

// ✅ Use `window.noteColors` from script copy.js
if (!window.noteColors) {
    console.error("❌ `noteColors` is not defined! Ensure script copy.js is loaded first.");
}

// 📏 Adjust Canvas Size & Keep it Centered While Scrolling
function adjustCanvasSize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// 📊 Start the Visualizer (Correct Colors)
function startVisualization() {
    if (!visualizerEnabled || !window.audioAnalyser) return;
    
    let analyser = window.audioAnalyser;
    let bufferLength = analyser.frequencyBinCount;
    let dataArray = new Uint8Array(bufferLength);

    canvas = document.getElementById("visualizer");
    ctx = canvas.getContext("2d");

    // ✅ Keep the visualizer **in the background & centered while scrolling**
    canvas.style.position = "fixed"; 
    canvas.style.top = "50%"; 
    canvas.style.left = "50%"; 
    canvas.style.transform = "translate(-50%, -50%)"; 
    canvas.style.width = "100vw"; 
    canvas.style.height = "100vh"; 
    canvas.style.zIndex = "-2"; 
    canvas.style.pointerEvents = "none";


    adjustCanvasSize(); // Call function to set proper size

    function draw() {
        if (!visualizerEnabled) return;
    
        analyser.getByteFrequencyData(dataArray);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        let barWidth = (canvas.width / bufferLength) * 2.5;
        let barHeight;
        let x = 0;
    
        for (let i = 0; i < bufferLength; i++) {
            barHeight = dataArray[i] / 2;
    
            ctx.fillStyle = lastPlayedColor || "#b3e5fc"; // ✅ Use last played color (from piano/Tonnetz)
            ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
            x += barWidth + 1;
        }
    
        animationFrame = requestAnimationFrame(draw);
    }
    
    draw();
}

// ❌ Stop the Visualization
function stopVisualization() {
    cancelAnimationFrame(animationFrame);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function onNotePlayed(note) {
    // ✅ Strip the octave number (F#3 → F#)
    const baseNote = note.replace(/[0-9]/g, ""); 

    if (!window.noteColors || !window.noteColors[baseNote]) {
        console.warn(`❌ No color assigned to: ${note} (base: ${baseNote})`);
        return;
    }

    lastPlayedColor = window.noteColors[baseNote]; // ✅ Use correct color

    startVisualization(); // Restart visualization on note play
}


// 🚀 Initialize Everything on Page Load
document.addEventListener("DOMContentLoaded", () => {
    startVisualization();
    adjustCanvasSize();
});

// Ensure it resizes dynamically
window.addEventListener("resize", adjustCanvasSize);

// Expose onNotePlayed globally
window.onNotePlayed = onNotePlayed;
