// Youtube remote javascript code - @thibsc

let youtube = 'https://www.youtube.com/';

function openYoutubeTab()
{
    browser.tabs.create({
        url: youtube,
        active: false
    });
}

// Play/Pause button
function playPauseQuery(tabs)
{
    if (tabs.length > 0){
        // Take the first
        let tab = tabs[0];
        document.getElementById("youtube-tab").textContent = tab.title;
        var playPauseCode = "document.getElementsByClassName('ytp-play-button ytp-button')[0].click();"
        var test = browser.tabs.executeScript(tab.id, {
            code: playPauseCode
        });
        test.then(succeedQuery, errorQuery);
    } else {
        openYoutubeTab();
    }
}

// Next play button
function nextQuery(tabs)
{
    if (tabs.length > 0){
        // Take the first
        let tab = tabs[0];
        document.getElementById("youtube-tab").textContent = tab.title;
        var nextCode = "document.getElementsByClassName('ytp-next-button ytp-button')[0].click();"
        var test = browser.tabs.executeScript(tab.id, {
            code: nextCode
        });
        test.then(succeedQuery, errorQuery);
    } else {
        openYoutubeTab();
    }
}

// Search movie button
function searchQuery(tabs)
{
    if (tabs.length > 0){
        // Display the loading spinner
        document.querySelector("#list-loader").className += " visible";
        // Clean the list
        document.getElementById("video-list").innerHTML = "";
        // Take the first tab
        let tab = tabs[0];
        document.getElementById("youtube-tab").textContent = tab.title;
        var search = document.getElementById("youtube-search").value;
        var nextCode = "window.location.href = '" + youtube + "results?search_query=" + search.split(" ").join('+') + "'";
        var es = browser.tabs.executeScript(tab.id, {
            code: nextCode
        });
        es.then(succeedQuery, errorQuery);
    } else {
        openYoutubeTab();
    }
}

// Action succeed
function succeedQuery(success)
{
    //document.getElementById("scriptStatus").style.background = "green";
}

// Action fail
function errorQuery(error)
{
    //document.getElementById("scriptStatus").style.background = "darkred";
}

document.addEventListener('DOMContentLoaded', function () {
    // Init popup
    var gettingYoutubeTab = browser.tabs.query({
        title: "*YouTube"
    }).then((tabs) => {
        document.getElementById("youtube-tab").textContent = tabs[0].title;
    });
});

// For action on the tab
document.addEventListener("click", (e) => {
    if (e.target.classList.contains("play")) {
        // Play / Pause current movie
        var gettingYoutubeTab = browser.tabs.query({
            title: "*YouTube"
        });
        gettingYoutubeTab.then(playPauseQuery, errorQuery);
    } else if (e.target.classList.contains("next")) {
        // Run the next movie
        var gettingYoutubeTab = browser.tabs.query({
            title: "*YouTube"
        });
        gettingYoutubeTab.then(nextQuery, errorQuery);
    } else if (e.target.classList.contains("youtube-url")) {
        // Start a movie
        var gettingYoutubeTab = browser.tabs.query({
            title: "*YouTube"
        }).then((tabs) => {
            var nextCode = "document.querySelector(\"a[href='" + e.target.getAttribute("data-value").substr(youtube.length-1) + "']\").click()";
            var es = browser.tabs.executeScript(tabs[0].id, {
                code: nextCode
            });
            es.then(succeedQuery, errorQuery);
        });
    }
});

// For video search
document.getElementById('youtube-search').addEventListener("keydown", (e) => {
    // document.getElementById("youtube-tab").textContent = e.key;
    if (e.key == 'Enter'){
        var gettingYoutubeTab = browser.tabs.query({
            title: "*YouTube"
        });
        gettingYoutubeTab.then(searchQuery, errorQuery);
    }
});

// Getting message from youtube_getter.js
function handleMessage(request, sender, sendResponse) {
    // Hide the loading spinner
    document.querySelector("#list-loader").className -= " visible";
    // Remove last search titles
    document.querySelector("#video-list").innerHTML = "";
    if (jsonObj && jsonObj.length > 0) {
        var jsonObj = JSON.parse(request);
        for (var title in jsonObj) {
            var video = document.createElement('li');
            var videoTitle = document.createTextNode(title);
            video.setAttribute('data-value', jsonObj[title]);
            video.setAttribute('class', 'youtube-url list-group-item list-group-item-action');
            video.appendChild(videoTitle);
            document.querySelector("#video-list").appendChild(video);
        }
    } else {
        document.querySelector("#video-list").innerHTML = "No results";
    }
    //console.log("Message from the content script: " + request.greeting);
    sendResponse({response: "Message received"});
}

browser.runtime.onMessage.addListener(handleMessage);
