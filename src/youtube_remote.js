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

async function execClickQuery(selector)
{
    let tab = await getFirstYoutubeTab();

    document.getElementById("youtube-playing").textContent = tab.title;
    var nextCode = `
        var buttonsSelected = document.querySelectorAll('.${selector}.ytp-button');
        if (buttonsSelected.length > 1) {
            buttonsSelected[1].click();
        } else {
            buttonsSelected[0].click();
        }
    `
    var test = browser.tabs.executeScript(tab.id, {
        code: nextCode
    });
    test.then(succeedQuery, errorQuery);
}

// Search video button
async function searchQuery()
{
    let tab = await getFirstYoutubeTab();

    // Display the loading spinner
    document.querySelector("#list-loader").className += " visible";

    // Clean the list
    document.querySelector("#video-list").innerHTML = "";
    document.getElementById("youtube-playing").textContent = tab.title;
    let search = document.getElementById("youtube-search").value;

    // Send the "I" key if needed
    let nextCode = `
        if (document.querySelector("ytd-miniplayer").getAttribute("active") === null) {
            document.dispatchEvent(new KeyboardEvent("keydown", { keyCode: 73 }))
        }
    `
    let es = browser.tabs.executeScript(tab.id, {
        code: nextCode
    });
    es.then(() => {
        // Exec search
        setTimeout(() => {
            let nextCode = 'document.querySelector("input#search").value = "'+search+'"; document.querySelector("#search-icon-legacy").click()'
            let es = browser.tabs.executeScript(tab.id, {
                code: nextCode
            });
            es.then(() => {
                retrieveVideos(tab)
            }, errorQuery);
        }, 1000)
    }, errorQuery);
}

function retrieveVideos(tab) {
    // Retrieve list of results from YT
    let nextCode = `
        domVideos = document.querySelectorAll("ytd-item-section-renderer div#contents ytd-video-renderer");
        results = Array.prototype.slice.call(domVideos).map((x) => {
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

    setTimeout(() => {
        let es = browser.tabs.executeScript(tab.id, {
            code: nextCode,
            runAt: "document_idle",
        });
        es.then(
            (result) => {
                displayVideos(result[0])
            },
            errorQuery
        );
    }, 1500) // 1500 => Dépend de la vitesse du réseau de l'utilisateur ; il faut trouver un moyen de savoir quand les images et au moins 5 résultats sont chargés
}

function displayVideos(videos) {
    if (videos.length < 1) {
        document.querySelector('#video-list').innerHTML = 'No results';
    } else {
        // Hide the loading spinner
        document.querySelector("#list-loader").className = document.querySelector("#list-loader").className.replace('visible', '');

        for (let videoYT of videos) {
            let video = document.createElement('li');
            video.setAttribute('data-value', videoYT.url);
            video.setAttribute('class', 'youtube-url list-group-item list-group-item-action');

            // Video thumbnail
            let thumbnail = document.createElement('div');
            thumbnail.className = 'thumbnail';
            let thumbnailImg = document.createElement('img');
            thumbnailImg.src = videoYT.thumbnail;
            thumbnail.appendChild(thumbnailImg);
            video.appendChild(thumbnail);

            // Metadata
            let metadata = document.createElement('div');
            metadata.className = 'metadata';
            video.appendChild(metadata);

                // Content
                let content = document.createElement('div');
                content.className = 'content';
                metadata.appendChild(content);

                    // Video title
                    let title = document.createElement('div');
                    title.className = 'title';
                    title.innerHTML = videoYT.title;
                    content.appendChild(title);

                    // Video author
                    let author = document.createElement('div');
                    author.className = 'subtitle'
                    author.innerHTML = videoYT.author;
                    content.appendChild(author);

                /*
                // Footer
                let footer = document.createElement('div');
                footer.className = 'footer';
                metadata.appendChild(footer);

                    // Video views
                    let views = document.createElement('div');
                    views.className = 'info'
                    views.innerHTML = `${videoYT.views}<i class="material-icons">remove_red_eye</i>`;
                    footer.appendChild(views);
                */

            document.querySelector('#video-list').appendChild(video);
            
            video.addEventListener('click', loadVideo)
        }
    }
}

async function loadVideo(event) {
    let target = event.currentTarget

    let tab = await getFirstYoutubeTab();

    var nextCode = "document.querySelector(\"a[href='" + target.getAttribute("data-value").substr(youtube.length-1) + "']\").click()";
    var es = browser.tabs.executeScript(tab.id, {
        code: nextCode
    });
    es.then(succeedQuery, errorQuery);
}

document.addEventListener('DOMContentLoaded', async function () {
    let tab = await getFirstYoutubeTab();
    document.getElementById("youtube-playing").innerHTML = tab.title;
});

// For action on the tab
document.addEventListener("click", async (e) => {
    if (e.target.classList.contains("play")) {
        execClickQuery("ytp-play-button");
    } else if (e.target.classList.contains("next")) {
        execClickQuery("ytp-next-button");
    }
});

// For video search
document.getElementById('youtube-search').addEventListener("keydown", (e) => {
    if (e.key == "Enter") {
        searchQuery();
    }
});

// Action succeed
function succeedQuery(success) { }

// Action fail
function errorQuery(error) {
    console.log(`Error: ${error}`);
}
