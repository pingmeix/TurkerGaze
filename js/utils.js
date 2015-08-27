// facial landmark tracking instruction
var statusMsg = {
    "detecting": "Detecting face... Move your head a bit if it's not responding.",
    "rotateface": "Your face is tilted. Please rotate your head/camera.",
    "turnface": "You are not facing forward. Please turn your head/camera.",
    "clickrestart": "To correct facial landmarks, adjust posture or click [restart].",
    "toofar": "You are too far away. Please move closer to your screen.",
    "tooclose": "You are too close. Please move back from the screen.",
    "toodark": "Please make sure your face is well lit from the front."
};

// general instruction
var instrMsg = {
    "fail2loadimg":"Sorry, it failed to load game data, please return the HIT.",
    // "startmemtest":"Part 6/6: Relax, you can move your head now. Next, you will see 15 photos: 3 you have already seen and 12 new ones. Pigs are hidding behind the 3 photos. Find the pigs by clicking on them.",
    "timeout":"You did not hit the pig in time. Please read the instructions and tips to see how to improve your aim. </br> Click the [restart] button to try again or press the [esc] key to leave full screen mode (and then you can return the HIT).",
    "moletimeout":"You did not hit the moles in time. Please read the instructions and tips to see how to improve your aim. </br> Click the [restart] button to try again or press the [esc] key to leave full screen mode (and then you can return the HIT).",
    "nohit": "Currently there are no more tasks for you to work on, please return this HIT and come back later.",
    "loadfont": "Game is loading, please wait ...",
    "loadbird": "LOADING ANGRY BIRDS...",
    "loadicon": "LOADING ICONS...",
    "loadimg": "LOADING HIT IMAGES...",
    "loadpig": "LOADING EVIL PIGS...",
    "webbrowser": "Please open this webpage by the Chrome web browser.",
    "copylink": "Please copy this link by clicking the button below and then open the link in the Chrome web browser.",
    "camaccess": "Please allow access to your camera.",
    "refreshcamaccess": "Please change the camera setting and reload the page.",
    "fullscreen": "Please keep your browser in fullscreen mode.",
    "quitnwaitdata2server": "You can quit fullscreen, but <span style='color: #FF0000'>DO NOT CLOSE THE TAB !!</span></br>Please relax and wait for data being sent.",
    "waitdata2server": "<span style='color: #FF0000'>DO NOT CLOSE THE TAB !!</span></br>Please relax and wait for data being sent",
    "finishngo": "Thanks for your work!</br></br>Please return to the Amazon Mechanical Turk website and submit your HIT.",
    "finishqt": "Please close this window and return to the Amazon Mechanical Turk website to submit your qualification test.",
    "keepstill": "Please keep your head still during the task.",
    "losttrack": "Face tracking lost.",
    "headmove": "Large head movement detected.",
    "restartwork": "Please click the button below to continue working on this HIT.",
    "calibrationstart": "You will see 9 calibration points.",
    "computertooslow": "The speed of your computer doesn't meet our requirement, please return the HIT.",
    "cameranotsupport":"Sorry that ANGRY GAZE game is not supported in your browser, please return the HIT.",
    "passtest" : "Congratulations! </br> Your computer set-up passed our test.</br> You can close this tab now.",
    "failtest" : "Sorry, your web camera does not meet the requirement of this task.",
    "computertooslow": "The speed of your computer doesn't meet our requirement."
}

// show instruction message
var showInstrMsg = function(message, id, w, h){
    $(id).html(message);
    displayElm2Center(id, w, h);
}

// center an element and display, [w,h]: size of the window
var displayElm2Center = function(id, w, h){
    var l = (w - $(id).width())/2;
    var t = (h - $(id).height())/2;
    $(id).css({left: l, top: t});
    $(id).show();
}