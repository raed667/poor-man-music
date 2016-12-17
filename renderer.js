const fetch = require('node-fetch');
const cheerio = require('cheerio');
const albumArt = require('album-art');
const request = require('request');
const fs = require('fs');
const userHome = require('user-home');

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

const suggestions = ["3 doors down", "kryptonite", "30 seconds to mars", "311", "amber", "the academy is...", "almost here", "adema", "giving in", "afi", "girl's not grey", "sing the sorrow", "alien ant farm", "smooth criminal", "alkaline trio", "radio", "maybe i'll catch fire", "from here to infirmary", "the all-american rejects", "my paper heart", "swing, swing", "the all-american rejcts", "amazing transparent man", "edit/undo", "anberlin", "the apex theory", "bullshed", "apossibly", "aphex twin", "cock/ver10", "drukqs", "armor for sleep", "dream to make believe", "as tall as lions", "at the drive-in", "one armed scissor", "relationship of command", "atreyu", "right side of the bed", "ben folds", "bitches ain't shit", "rockin' the suburbs", "ben kweller", "rockin' the suburbs", "wasted & ready", "sha sha", "benny benassi", "satisfaction (isak original mix)", "blink 182", "what's my age again?", "all the small things", "adam's song", "the party song", "anthem part two", "first date", "stay together for the kids", "family reunion", "enema of the state", "take off your pants and jacket", "blue meanies", "grandma shampoo", "box car racer", "i feel so", "brand new", "jude law and a semester abroad", "the quiet things that no one ever knows", "sic transit gloria... glory fades", "your favorite weapon", "deja entendu", "breaking pangaea", "colors on the inside", "bright eyes", "lover i don't have to love", "take it easy (love nothing)", "fevers and mirrors", "i'm wide awake, it's morning", "bush", "comedown", "glycerine", "machinehead", "swallowed", "the chemicals between us", "warm machine", "letting the cables sleep", "sixteen stone", "razorblade suitcase", "the science of things", "golden state", "the calling", "wherever you will go", "chevelle", "send the pain below", "closure", "the red", "wonder what's next", "cold", "no one", "end of the world", "gone away", "stupid girl", "collective soul", "cool hand luke", "the fires of life", "copeland", "beneath medicine tree", "counting crows", "crazy town", "butterfly", "revolving door", "creed", "higher", "with arms wide open", "human clay", "the crystal method", "(can't you) trip like i do feat. filter", "name of the game", "cursive", "art is hard", "the recluse", "daniel bedingfield", "gotta get thru this", "dashboard confessional", "screaming infidelities", "the places you have come to fear the most", "hands down", "so impossible", "vindicated", "the places you have come to fear the most", "so impossible ep", "a mark, a mission, a brand, a scar", "deathcab for cutie", "the new year", "the sound of settling", "transatlanticism", "deftones", "back to school (mini maggit)", "digital bath", "knife party", "white pony", "dillinger escape plan", "disturbed", "the early november", "emery", "fall out boy", "fenix tx", "finch", "finger eleven", "from first to last", "further seems forever", "glassjaw", "goldfinger", "good charlotte", "gorillaz", "clint eastwood", "green day", "hawthorne heights", "hellogoodbye", "hey mercedes", "hoobastank", "incubus", "jack’s mannequin", "jimmy eat world", "the juliana theory", "less than jake", "local h", "lucky boys confusion", "mae", "mars volta", "matchbook romance", "metric", "mewithoutyou", "ministry of sound", "trance nation deeper", "mxpx", "motion city soundtrack", "muse", "my chemical romance", "new found glory", "nofx", "offspring", "our lady peace", "somewhere out there", "innocent", "gravity", "paul oakenfold", "ready steady go", "zoo york", "bunkka", "pedro the lion", "foregone conclusions", "control", "achilles’ heel", "p.o.d.", "southtown", "alive", "youth of the nation", "boom", "the fundamental elements of southtown", "satellite", "postal service", "such great heights", "the district sleeps alone tonight", "we will become silhouettes", "give up", "powerman 5000", "when worlds collide", "puddle of mudd", "control", "blurry", "she hates me", "rammstein", "du hast", "saves the day", "at your funeral", "freakish", "stay what you are", "silverchair", "tomorrow", "ana's song (open fire)", "miss you love", "silverstein", "smashed into pieces", "giving up", "smile in your sleep", "my heroine", "when broken is easily fixed", "discovering the waterfront", "simple plan", "i’d do anything", "i’m just a kid", "perfect", "no pads, no helmets... just balls", "smashing pumpkins", "today", "disarm", "tonight, tonight", "zero", "bullet with butterfly wings", "1979", "siamese dream", "mellon collie and the infinite sadness", "snow patrol", "run", "chasing cars", "something corporate", "i woke up in a car", "if you c jordan", "hurricane", "leaving through the window", "staind", "mudshovel", "outside", "it’s been awhile", "the starting line", "the best of me", "up &amp; go", "say it like you mean it", "story of the year", "until the day i die", "page avenue", "straylight run", "existentialism on prom night", "sum 41", "fat lip", "in too deep", "sunny day real estate", "faces in disguise", "system of a down", "chop suey!", "toxicity", "aerials", "toxicity", "taking back sunday", "makedamnsure", "a decade under the influence", "cute without the ‘e’", "you’re so last summer", "tell all your friends", "third eye blind", "third eye blind", "thrice", "all that’s left", "the artist in the ambulance", "the artist in the ambulance", "thursday", "understanding in a car crash", "cross out the eyes", "paris in flames", "for the workforce, drowning", "signals over the air", "war all the time", "full collapse", "war all the time", "twothirtyeight", "modern day prayer", "underoath", "a boy brushed red living in black and white", "they’re only chasing safety", "the union underground", "turn me on “mr. deadman”", "south texas deathride", "killing the fly", "unwritten law", "seein’ red", "the used", "the taste of ink", "buried myself alive", "blue and yellow", "the used", "weezer", "hash pipe", "island in the sun", "the blue album", "the working title", "never forever", "yellowcard", "october nights", "ocean avenue", "ocean avenue"];

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
    const matchArray = findMatches(this.value, suggestions);

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
}


function download(e) {
    const file_id = e.currentTarget.dataset.file_id;
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

///////
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