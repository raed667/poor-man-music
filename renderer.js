const fetch = require('node-fetch');
const cheerio = require('cheerio');
const albumArt = require('album-art');
const request = require('request');
const fs = require('fs');
const os = require('os');

const searchInput = document.querySelector('#searchInput');
const songsList = document.querySelector('#songsList');
const player = document.querySelector('#player');
const playerSource = document.querySelector('#mp3Source');
const titlePlaying = document.querySelector('#titlePlaying');
const btnMore = document.querySelector('#btnMore');
const artCover = document.querySelector('#artCover');
const suggestionsList = document.querySelector('.suggestions');
const progressBar = document.querySelector('.progress-bar');
const progressContainer = document.querySelector('.progress');
const downloadMessage = document.querySelector('#downloadMessage');

const MUSIC_DIR = "Music";

const songs = [];
let currentlyPlaying,
    tableElement,
    page = 1;

downloadMessage.addEventListener('click', e => {
    downloadMessage.style.display = "none";
    progressContainer.style.display = "none";
});

searchInput.addEventListener('keyup', displayMatches);

searchInput.addEventListener('keyup', getSongs);

player.addEventListener('ended', () => {
    titlePlaying.innerHTML = "";

    // play next song
    let nextIndex = -1, i;
    for (i = 0; i < songs.length; i++) {
        if (currentlyPlaying.file_id === songs[i].file_id) {
            // check if last song => @todo load more
            nextIndex = ++i;
            break;
        }
    }
    if (nextIndex < songs.length) {
        const songsItems = Array.from(document.querySelectorAll('.songItem'));
        songsItems.forEach(song => {
            if (song.dataset.file_id === songs[nextIndex].file_id) {
                song.classList.add('hl');
            } else {
                song.classList.remove('hl');
            }
        });
        songs[nextIndex].play();
    }
});

player.addEventListener('pause', () => {
    // @todo : click to resume
});

btnMore.addEventListener('click', function () {
    page++;
    getSongs();
});

class Song {
    constructor(file_id, duration, singer, song, link) {
        this.file_id = file_id;
        this.duration = this.prettyPrintTime(duration);
        this.singer = singer;
        this.song = song;
        this.link = link;
    }

    /**
     *
     * @param time
     * @returns {string}
     */
    prettyPrintTime(time) {
        return (time - (time %= 60)) / 60 + (9 < time ? ':' : ':0') + time;
    }

    download() {
        const url = `http://pleer.net/site_api/files/get_url?action=download&id=${this.link}`;
        try {
            fetch(url)
                .then(blob => blob.json())
                .then(response => {
                    if (response.success === true && response.residue_type === "tracks") {
                        const userHome = os.homedir();
                        if (!fs.existsSync(`${userHome}/${MUSIC_DIR}`)) {
                            fs.mkdirSync(`${userHome}/${MUSIC_DIR}`);
                        }
                        // Show progress bar
                        progressContainer.style.display = "block";
                        downloadFile(response.track_link, `${userHome}/${MUSIC_DIR}/${this.song}-${this.singer}.mp3`);
                    }
                });
        } catch (ex) {
        }
    }

    play() {
        const url = `http://pleer.net/site_api/files/get_url?action=download&id=${this.link}`;
        try {
            fetch(url)
                .then(blob => blob.json())
                .then(response => {
                    if (response.success === true && response.residue_type === "tracks") {
                        playerSource.src = response.track_link;
                        player.load();
                        player.play();

                        titlePlaying.innerHTML = `${this.song} - ${this.singer}`;
                        document.title = `${this.song} ${this.singer}` + " - Poor Man's Music";
                        try {
                            const singer = this.singer;
                            albumArt(this.singer, this.song, 'large', function (err, artUrl) {
                                if (artUrl !== "") {
                                    artCover.src = artUrl;
                                } else {
                                    albumArt(singer, null, 'large', function (err, artUrl) {
                                        artCover.src = artUrl || 'img/no_album.jpg';
                                    });
                                }
                                artCover.classList.remove('hidden');
                            });
                        } catch (ex) {
                            console.log("Error getting the Artwork");
                        }
                    }
                });
        } catch (ex) {
            titlePlaying.innerHTML = "Something went wrong.."
        }
    }
}

function playSong(e) {

    if (e.target.classList.contains('btnDownload')) {
        download(e);
        return;
    }

    const song_id = e.target.parentNode.dataset.file_id;
    tableElement = e.target.parentNode;

    if (currentlyPlaying != null && song_id === currentlyPlaying.file_id) return; // if already playing the song

    const songsItems = Array.from(document.querySelectorAll('.hl'));
    songsItems.forEach(song => song.classList.remove('hl'));

    const song = songs.filter(song => (song.file_id === song_id));
    currentlyPlaying = song[0];
    tableElement.classList.add('hl');

    song[0].play();
}

function displaySongsInList() {

    songsList.innerHTML = "Loading...";
    const html = songs.map(song => {
        return `<tr class="songItem" data-file_id="${song.file_id}">
            <td>${song.song}</td>
            <td>${song.singer}</td>
            <td>${song.duration}</td>
            <td>
                <button class="btn btn-default">
                    <span data-file_id="${song.file_id}" class="icon icon-download btnDownload"></span>
                </button>
            </td>
       </tr>`;
    }).join('');
    songsList.innerHTML = html;

    const songsItems = Array.from(document.querySelectorAll('.songItem'));
    songsItems.forEach(song => song.addEventListener('click', playSong));
}

function getSongs(e) {
    if (e != undefined) {
        if (e.keyCode !== 13) {
            return;
        }
        page = 1; // reset page at start

        while (songs.length) {
            songs.pop();
        }
        artCover.classList.add('hidden');
    }

    suggestionsList.innerHTML = ""; // empty typehead list

    const query = searchInput.value;
    if (query < 2) {
        return;
    }

    fetch(encodeURI(`http://pleer.net/search?q=${query}&target=tracks&page=${page}`))
        .then(res => res.text()
        )
        .then(body => {
            $ = cheerio.load(body);
            const songsHTML = $('.scrolledPagination').find('li');

            songsHTML.map((key, value) => {
                songs.push(
                    new Song(
                        value.attribs.file_id,
                        value.attribs.duration,
                        value.attribs.singer,
                        value.attribs.song,
                        value.attribs.link)
                );
            });
            displaySongsInList();

            if (songs.length > 0) {
                btnMore.classList.remove('hidden');
            } else {
                btnMore.classList.add('hidden');
            }
        });
}


// Suggestions
function findMatches(wordToMatch, suggestions) {
    return suggestions.filter(suggestion => {
        // here we need to figure out if the city or state matches what was searched
        const regex = new RegExp(wordToMatch, 'gi');
        return suggestion.match(regex)
    });
}

function displayMatches() {
    if (this.value.length < 3) {
        return;
    }
    fetch(`https://suggestqueries.google.com/complete/search?client=firefox&q=${this.value}`)
        .then(blob => blob.json())
        .then(response => {
            const matchArray = findMatches(this.value, response[1]);
            const typeheadList = matchArray.map(suggestion => {
                const regex = new RegExp(this.value, 'gi');
                const sugesstionText = suggestion.replace(regex, `<span class="hl">${this.value}</span>`);
                return `<li data-suggestion="${suggestion}" class="suggestionElement"><span class="name">${sugesstionText}</span></li>`;
            });
            suggestionsList.innerHTML = typeheadList.slice(0, 5).join('');
            const suggestionsElements = Array.from(document.querySelectorAll('.suggestionElement'));
            suggestionsElements.forEach(element => {
                element.addEventListener('click', e => {
                    searchInput.value = e.currentTarget.dataset.suggestion;
                    suggestionsList.innerHTML = "";
                    getSongs({keyCode: 13});
                });
            });
        });
}

function download(e) {
    const {file_id} = e.currentTarget.dataset;
    if (e.target.parentNode.classList.contains('disabled')) {
        return;
    }

    e.target.parentNode.classList.add('disabled');
    songs.forEach(song => {
        if (song.file_id === file_id) {
            song.download();
        }
    });
}

function downloadFile(file_url, targetPath) {
    // Save variable to know progress
    let received_bytes = 0;
    let total_bytes = 0;

    const req = request({
        method: 'GET',
        uri: file_url
    });

    let out = fs.createWriteStream(targetPath);
    req.pipe(out);

    req.on('response', function (data) {
        // Change the total bytes value to get progress later.
        total_bytes = parseInt(data.headers['content-length']);
    });

    req.on('data', function (chunk) {
        // Update the received bytes
        received_bytes += chunk.length;

        showProgress(received_bytes, total_bytes);
    });

    req.on('end', function () {
        downloadMessage.style.display = "block";
        downloadMessage.innerHTML = "Downloaded";
    });
}

function showProgress(received, total) {
    let percentage = (received * 100) / total;
    progressBar.style.width = percentage + "%";
}