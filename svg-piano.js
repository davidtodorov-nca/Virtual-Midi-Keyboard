const whiteKeyWidth = 80;
const pianoHeight = 400;

const naturalNotes = ["C", "D", "E", "F", "G", "A", "B"];
const naturalNotesSharps = ["C", "D", "F", "G", "A"];
const naturalNotesFlats = ["D", "E", "G", "A", "B"];

const range = ["C2", "C7"];

const app = {
    setupPiano() {
        const piano = document.querySelector("#piano");
        const allNaturalNotes = this.getAllNaturalNotes(range);
        const pianoWidth = allNaturalNotes.length * whiteKeyWidth;

        const SVG = this.createMainSVG(pianoWidth, pianoHeight);
       
        // Add white keys
        let whiteKeyPositionX = 0;

        allNaturalNotes.forEach((noteName) => {
            const whiteKeyTextGroup = utils.createSVGElement("g");
            const whiteKey = this.createKey({ className: "white-key", width: whiteKeyWidth, height: pianoHeight });
            const text = utils.createSVGElement("text");
            
            utils.addTextContent(text, noteName);
            utils.setAttributes(whiteKeyTextGroup, {"width": whiteKeyWidth});
            utils.setAttributes(text, {
                "x": whiteKeyPositionX + whiteKeyWidth / 2,
                "y": 380,
                "text-anchor": "middle"
            });
            utils.setAttributes(whiteKey, {
                "x": whiteKeyPositionX,
                "data-note-name": noteName,
                "rx": "15",
                "ry": "15"
            });

            text.classList.add("white-key-text");
            whiteKeyTextGroup.appendChild(whiteKey);
            whiteKeyTextGroup.appendChild(text);
            SVG.appendChild(whiteKeyTextGroup);
            
            // Increment spacing between keys
            whiteKeyPositionX += whiteKeyWidth;
        });
        // Add black keys
        let blackKeyPositionX = 60;
        allNaturalNotes.forEach((naturalNote, index, array) => {
            // If last iteration of keys, do not add black key
            if (index === array.length - 1) {
                return;
            }

            const blackKeyTextGroup = utils.createSVGElement("g");
            const blackKey = this.createKey( { className : "black-key", width: whiteKeyWidth / 2, height: pianoHeight / 1.6 });
            const flatNameText = utils.createSVGElement("text");
            const sharpNameText = utils.createSVGElement("text");

            utils.setAttributes(blackKeyTextGroup, { "width": whiteKeyWidth / 2});


            for (let i = 0; i < naturalNotesSharps.length; i++) {
                let naturalSharpNoteName = naturalNotesSharps[i];
                let naturalFlatNoteName = naturalNotesFlats[i];
                
                if (naturalSharpNoteName === naturalNote[0]) {
                    
                    utils.setAttributes(blackKey, {
                        "x": blackKeyPositionX,
                        "data-sharp-name": `${ naturalSharpNoteName }#${ naturalNote[1]}`,
                        "data-flat-name": `${ naturalFlatNoteName }b${ naturalNote[1]}`,
                        "rx": "8",
                        "ry": "8"
                    });

                    utils.setAttributes(sharpNameText, {
                        "text-anchor": "middle",
                        'y': 215,
                        "x": blackKeyPositionX + (whiteKeyWidth / 4)
                    });

                    utils.setAttributes(flatNameText, {
                        "text-anchor": "middle",
                        'y': 235,
                        "x": blackKeyPositionX + (whiteKeyWidth / 4)
                    });

                    utils.addTextContent(sharpNameText, `${ naturalSharpNoteName}♯`);
                    utils.addTextContent(flatNameText, `${ naturalFlatNoteName}♭`);

                    flatNameText.classList.add("black-key-text");
                    sharpNameText.classList.add("black-key-text");

                    // Add double spacing between D# and A#
                    if (naturalSharpNoteName === "D" || naturalSharpNoteName === "A") {
                        blackKeyPositionX += whiteKeyWidth * 2;
                    } else {
                        blackKeyPositionX += whiteKeyWidth;
                    }
                    
                    blackKeyTextGroup.appendChild(blackKey);
                    blackKeyTextGroup.appendChild(flatNameText);
                    blackKeyTextGroup.appendChild(sharpNameText);
                }
                
            }
            SVG.appendChild(blackKeyTextGroup);
        });
         // Add main SVG to piano div
         piano.appendChild(SVG);

        // Add event listeners for mouse clicks on piano keys
        document.querySelectorAll('.key').forEach(key => {
            key.addEventListener('mousedown', event => {
                const noteName = event.target.dataset.noteName || event.target.dataset.sharpName || event.target.dataset.flatName;
                this.displayNotes([noteName]);
            });
            key.addEventListener('mouseup', event => {
                const noteName = event.target.dataset.noteName || event.target.dataset.sharpName || event.target.dataset.flatName;
                this.clearNotes([noteName]);
            });
        });

        // Add event listener for keyboard events
        document.addEventListener('keydown', event => {
            const key = event.key.toUpperCase();
            const noteName = this.getNoteNameFromKeyPressed(key);
            if (noteName) {
                this.displayNotes([noteName]);
                var output = WebMidi.outputs[0];
                var channel = output.channels[1];
                channel.playNote(noteName);        
            }
        });
        // Add event listener for keyboard events
        document.addEventListener('keyup', event => {
            const key = event.key.toUpperCase();
            const noteName = this.getNoteNameFromKeyPressed(key);
            if (noteName) {
                this.clearNotes([noteName]);
            }
        });
    },
    createOctave(octaveNumber) {
        const octave = utils.createSVGElement("g");
        octave.classList.add("octave");
        octave.setAttribute("transform", `translate(${octaveNumber * octaveWidth}, 0)`);
        return octave;
    },
    createKey({ className, width, height }) {
        const key = utils.createSVGElement("rect");
        key.classList.add(className, "key");
        utils.setAttributes(key, {
            "width": width,
            "height": height
        });
        return key;
    },
    getAllNaturalNotes([firstNote, lastNote]) {
        // Assign octave number, notes and positions to variables
        const firstNoteName = firstNote[0];
        const firstOctaveNumber = parseInt(firstNote[1]);

        const lastNoteName = lastNote[0];
        const lastOctaveNumber = parseInt(lastNote[1]);

        const firstNotePosition = naturalNotes.indexOf(firstNoteName);
        const lastNotePosition = naturalNotes.indexOf(lastNoteName);

        const allNaturalNotes = [];

        for (let octaveNumber = firstOctaveNumber; octaveNumber <= lastOctaveNumber; octaveNumber++) {
            // Handle first octave
            if (octaveNumber === firstOctaveNumber) {
                naturalNotes.slice(firstNotePosition).forEach((noteName) => {
                    allNaturalNotes.push(noteName + octaveNumber);
                });

                // Handle last octave
            } else if (octaveNumber === lastOctaveNumber) {
                naturalNotes.slice(0, lastNotePosition + 1).forEach((noteName) => {
                    allNaturalNotes.push(noteName + octaveNumber);
                });

            } else {
                naturalNotes.forEach((noteName) => {
                    allNaturalNotes.push(noteName + octaveNumber);
                });
            }
        }
        return allNaturalNotes;
    },
    createMainSVG(pianoWidth, pianoHeight) {
        const svg = utils.createSVGElement("svg");

        utils.setAttributes(svg, {
            "width": "100%",
            "version": "1.1",
            "xmlns": "http://www.w3.org/2000/svg",
            "xmlns:xlink": "http://www.w3.org/1999/xlink",
            "viewBox": `0 0 ${pianoWidth} ${pianoHeight}`
        });

        return svg;
    },
    displayNotes(notes) {
        console.log('displaying notes:', notes)
        const pianoKeys = document.querySelectorAll(".key");
        notes.forEach(noteName => {
            pianoKeys.forEach(key => {
                const naturalName = key.dataset.noteName;
                const sharpName = key.dataset.sharpName;
                const flatName = key.dataset.flatName;
    
                if (naturalName === noteName || sharpName === noteName || flatName === noteName) {
                    setTimeout(() => {
                        key.classList.add("show");
                    }, 0); // Adding a minimal delay
                }
            });
        });
    },
    clearNotes(notes) {
        console.log('clearing notes:', notes)
        const pianoKeys = document.querySelectorAll(".key");
        notes.forEach(noteName => {
            pianoKeys.forEach(key => {
                const naturalName = key.dataset.noteName;
                const sharpName = key.dataset.sharpName;
                const flatName = key.dataset.flatName;
    
                if (naturalName === noteName || sharpName === noteName || flatName === noteName) {
                    setTimeout(() => {
                        key.classList.remove("show");
                    }, 0); // Adding a minimal delay
                }
            });
        });
    },
    getNoteNameFromKeyPressed(key) {
        // Define mapping of keys to note names
        const keyMap = {
            'A': 'C4',
            'W': 'C#4',
            'S': 'D4',
            'E': 'D#4',
            'D': 'E4',
            'F': 'F4',
            'T': 'F#4',
            'G': 'G4',
            'Y': 'G#4',
            'H': 'A4',
            'U': 'A#4',
            'J': 'B4',
        };
        return keyMap[key];
    },
    // Function triggered when WEBMIDI.js is ready
    onEnabled() {

        if (WebMidi.inputs.length < 1) {
        document.body.innerHTML+= "No device detected.";
        } else {
        WebMidi.inputs.forEach((device, index) => {
            // document.body.innerHTML+= `${index}: ${device.name} <br>`;
        });
        }
        
        const mySynth = WebMidi.inputs[0];
        // const mySynth = WebMidi.getInputByName("TYPE NAME HERE!")
        
        mySynth.channels[1].addListener("noteon", e => {
            var noteName = e.note.name+(e.note.accidental ? e.note.accidental : "")+e.note.octave
            app.displayNotes([noteName]);
        });
    
        mySynth.channels[1].addListener("noteoff", e => {
            var noteName = e.note.name+(e.note.accidental ? e.note.accidental : "")+e.note.octave
            app.clearNotes([noteName]);
        });
  }
}

const utils = {
    createSVGElement(el) {
        const element = document.createElementNS("http://www.w3.org/2000/svg", el);
        return element;
    },
    setAttributes(el, attrs) {
        for (let key in attrs) {
            el.setAttribute(key, attrs[key]);
        }
    },
    addTextContent(el, content) {
        el.textContent = content;
    },
    removeClassFromNodeCollection(nodeCollection, classToRemove) {
        nodeCollection.forEach(node => {
            if (node.classList.contains(classToRemove)) {
                node.classList.remove(classToRemove);
            }
        });
    },
}

app.setupPiano();

WebMidi
.enable()
.then(app.onEnabled)
.catch(err => alert(err));
