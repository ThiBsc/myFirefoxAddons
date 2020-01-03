// Search video getter
// Use when search from the firefox addon
/*
function handleResponse(message)
{
    console.log(`Message from the background script: ${message.response}`);
}

function handleError(error)
{
    console.log(`Error: ${error}`);
}

if (document.getElementsByClassName('ytp-play-button ytp-button')[0] != null){
    document.getElementsByClassName('ytp-play-button ytp-button')[0].click();
} else {
    var videos = document.getElementsByClassName('yt-simple-endpoint style-scope ytd-video-renderer');

    var jsonData = {};
    Array.prototype.slice.call(videos).forEach(element => jsonData[element.title] = element.href);

    //console.log(videos);

    var sending = browser.runtime.sendMessage(JSON.stringify(jsonData));
    sending.then(handleResponse, handleError);
}*/

// while (true) {
//     browser.runtime.sendMessage(JSON.stringify("test"));
// }
