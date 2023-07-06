// create an audio object
var audio = document.getElementById("audio")

// get the button element
var button = document.getElementById("music-button");

// set initial state of audio
var isPlaying = false;
var count = 0;

// add a click event listener to the button
function playMusic() {
    if (count == 0) {
        count = 1;
        audio.pause();
    } else {
        count = 0;
        audio.play();
    }
}
