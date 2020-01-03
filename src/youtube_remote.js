// Youtube remote javascript code - @thibsc

let youtube = 'https://www.youtube.com/';

async function openYoutubeTab()
{
    return browser.tabs
                .create({
                    url: youtube,
                    active: false
                })
                .then((tab) => {
                    return tab
                }, errorQuery);
}

function getFirstYoutubeTab() {
    let tab_yt = browser.tabs
                .query({
                    title: "*YouTube"
                })
                .then(async (tabs) => {
                    let tab = null
                    if (tabs.length > 0) {
                        tab = tabs[0]
                    } else {
                        tab = await openYoutubeTab()
                    }
                    return tab
                }, errorQuery);
    return tab_yt
}

// Play/Pause button
async function playPauseQuery()
{    
    let tab = await getFirstYoutubeTab();
    console.log(tab)
    document.getElementById("youtube-playing").textContent = tab.title;
    var playPauseCode = "document.getElementsByClassName('ytp-play-button ytp-button')[0].click();"
    var test = browser.tabs.executeScript(tab.id, {
        code: playPauseCode
    });
    test.then(succeedQuery, errorQuery);
}

// Next play button
async function nextQuery()
{
    let tab = await getFirstYoutubeTab();

    document.getElementById("youtube-playing").textContent = tab.title;
    var nextCode = "document.getElementsByClassName('ytp-next-button ytp-button')[0].click();"
    var test = browser.tabs.executeScript(tab.id, {
        code: nextCode
    });
    test.then(succeedQuery, errorQuery);
}

// Search movie button
async function searchQuery()
{
    let tab = await getFirstYoutubeTab();

    // Display the loading spinner
    document.querySelector("#list-loader").className += " visible";

    // Clean the list
    document.getElementById("video-list").innerHTML = "";
    document.getElementById("youtube-playing").textContent = tab.title;
    let search = document.getElementById("youtube-search").value;

    // var nextCode = "window.location.href = \"" + youtube + "results?search_query=" + search.split(" ").join('+') + "\"";
    let nextCode = 'document.querySelector("input#search").value = "'+search+'"; document.querySelector("#search-icon-legacy").click()'
    let es = browser.tabs.executeScript(tab.id, {
        code: nextCode
    });
    es.then(() => {
        retrieveMovies(tab)
    }, (error) => {
        console.log(`Error: ${error}`);
    });
}

function retrieveMovies(tab) {
    // Hide the loading spinner
    document.querySelector("#list-loader").className = document.querySelector("#list-loader").className.replace('visible', '');

    // Remove last search titles
    document.querySelector("#video-list").innerHTML = "";

    // Retrieve list of results from YT
    let nextCode = `
        domMovies = document.querySelectorAll("ytd-item-section-renderer div#contents ytd-video-renderer");
        results = Array.prototype.slice.call(domMovies).map((x) => {
            return {
                url: x.querySelector("#video-title").href,
                title: x.querySelector("#video-title").title,
                author: x.querySelector("#channel-name #text").title,
                thumbnail: x.querySelector("#thumbnail #img").src,
                views: x.querySelector("#metadata #metadata-line span").innerHTML.replace("vues", ""),
            }
        });
        results.slice(0, 5);
    `;

    // setTimeout(() => {
        let es = browser.tabs.executeScript(tab.id, {
            code: nextCode,
            // allFrames: true
            runAt: "document_idle",
        });
        es.then((result) => {
            displayMovies(tab, result[0])
        }, (error) => {
            console.log(`Error: ${error}`);
        });
    // }, 1000)
}

function displayMovies(tab, movies) {
    if (movies.length < 1) {
        document.querySelector('#video-list').innerHTML = 'No results';
    } else {
        for (let movie of movies) {
            let video = document.createElement('li');
            video.setAttribute('data-value', movie.title);
            video.setAttribute('class', 'youtube-url list-group-item list-group-item-action');

            // Video thumbnail
            let thumbnail = document.createElement('div');
            thumbnail.className = 'thumbnail';
            let thumbnailImg = document.createElement('img');
            thumbnailImg.src = movie.thumbnail;
            thumbnail.appendChild(thumbnailImg);
            video.appendChild(thumbnail);

            // Video title
            let title = document.createElement('h2');
            title.innerHTML = movie.title;
            video.appendChild(title);

            // Video author
            let author = document.createElement('div');
            author.className = 'author'
            author.innerHTML = movie.author;
            video.appendChild(author);

            // Video views
            let views = document.createElement('div');
            views.className = 'views'
            views.innerHTML = `${movie.views}<i class="material-icons">remove_red_eye</i>`;
            video.appendChild(views);

            document.querySelector('#video-list').appendChild(video);
        }
    }
}

document.addEventListener('DOMContentLoaded', function () {
    // Init popup
    browser.tabs
        .query({
            title: "*YouTube"
        })
        .then((tabs) => {
            document.getElementById("youtube-playing").innerHTML = tabs[0].title;
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
    searchQuery()
});

// Getting message from youtube_getter.js
/*function handleMessage(request, sender, sendResponse) {
    // Hide the loading spinner
    document.querySelector("#list-loader").className = document.querySelector("#list-loader").className.replace('visible', '');
    // Remove last search titles
    document.querySelector("#video-list").innerHTML = "";
    let jsonObj = JSON.parse(request);
    if (Object.keys(jsonObj).length < 1) {
        document.querySelector("#video-list").innerHTML = "No results";
    } else {
        for (let title in jsonObj) {
            let video = document.createElement('li');
            let videoTitle = document.createTextNode(title);
            video.setAttribute('data-value', jsonObj[title]);
            video.setAttribute('class', 'youtube-url list-group-item list-group-item-action');
            video.appendChild(videoTitle);
            document.querySelector("#video-list").appendChild(video);
        }
    }
    //console.log("Message from the content script: " + request.greeting);
    sendResponse({response: "Message received"});
}
*/

// Action succeed
function succeedQuery(success)
{
    // document.getElementById("scriptStatus").style.background = "green";
}

// Action fail
function errorQuery(error)
{
    // document.getElementById("scriptStatus").style.background = "darkred";
}


// browser.runtime.onMessage.addListener(handleMessage);
// browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
//     alert(request)
// });
