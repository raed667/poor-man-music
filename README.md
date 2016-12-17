# Poor Man's Music

Desktop music streaming application, built with [electron](http://electron.atom.io/).

It works exactly like Spotify: 

* Search for a song, an album or an artist 
* Select a song 
* Play
* Download it locally if you wish
* ???
* Don't pay a single dime

## Screenshot

![Screenshot](https://github.com/RaedsLab/poor-man-music/blob/master/pmmScreenshot.png)


## How to use it?

0. Make sure that you have Node installed
1. Clone or download this repository
2. Run `npm update` inside the directory to install the dependencies
3. Run `npm start`


### Is this magic ?

No this is Electron, Node, Chromium, V8, and a [russian music server](http://pleer.net).



## Todo

List of things that would be nice to have:

- [ ] When last song is played, load more songs (JS)
- [ ] Have a dynamic typehead (instead of poor static) (JS & APIs)
- [ ] Better typehead style (CSS & JS)
- [ ] Better `audio` player style (CSS)
- [ ] Create user playlist (database)
- [x] Download MP3 files locally (fileSystem)
- [ ] Serve local MP3 file if found (fileSystem)

#### License

MIT
