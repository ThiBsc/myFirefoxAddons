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
        // Display a loading spinner
        /**
         *  <div class="d-flex justify-content-center">
                <div class="spinner-grow text-warning justify-content-center" style="width: 3rem; height: 3rem;" role="status">
                <span class="sr-only">Loading...</span>
                </div>
            </div>
         */
        document.getElementById("video-list").innerHTML = "";
        var div1 = document.createElement('div');
        div1.setAttribute('class', 'd-flex justify-content-center');
        var div2 = document.createElement('div');
        div2.setAttribute('class', 'spinner-grow text-warning justify-content-center');
        div2.setAttribute('style', 'width: 3rem; height: 3rem;');
        div2.setAttribute('role', 'status');
        var span = document.createElement('span');
        span.setAttribute('class', 'sr-only');
        span.appendChild(document.createTextNode('Loading...'));
        div1.appendChild(div2);
        div1.appendChild(span);
        document.getElementById("video-list").appendChild(div1);
        // Take the first
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
    // Remove last search titles
    document.getElementById("video-list").innerHTML = "";
    var jsonObj = JSON.parse(request);
    for (var title in jsonObj){
        var video = document.createElement('button');
        var videoTitle = document.createTextNode(title);
        video.setAttribute('data-value', jsonObj[title]);
        video.setAttribute('class', 'youtube-url list-group-item list-group-item-action');
        video.appendChild(videoTitle);
        document.getElementById("video-list").appendChild(video);
    }
    //console.log("Message from the content script: " + request.greeting);
    sendResponse({response: "Message received"});
}

browser.runtime.onMessage.addListener(handleMessage);
