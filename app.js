// Check if Web MIDI is supported
if (navigator.requestMIDIAccess) {
    // Request access to MIDI devices
    navigator.requestMIDIAccess()
        .then(function(midiAccess) {
            // Get the first available MIDI input device
            var inputs = midiAccess.inputs.values();
            var input = inputs.next();

            if (input.done) {
                console.error("No MIDI input devices available.");
                return;
            }

            input = input.value;
            console.log('input:', input)

            // Check if the input device is available
            if (!input) {
                console.error("MIDI input device is undefined.");
                return;
            }

            // Listen for MIDI messages from the input device
            input.onmidimessage = function(event) {
                // Log MIDI messages to the console (for demonstration)
                console.log("MIDI Message received:", event.data);
                
                // Here you can handle MIDI messages as needed
                // For example, you could trigger sounds or control parameters
            };
        })
        .catch(function(err) {
            // Handle any errors
            console.error("MIDI access request failed:", err);
        });
} else {
    // Web MIDI not supported
    console.error("Web MIDI is not supported in this browser.");
}
