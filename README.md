# AnkiViewer

This is a special front-end for Anki via [Anki-Connect](https://git.sr.ht/~foosoft/anki-connect/)

It is designed to work with a large deck, based on a large dictionary.

The deck must have a special structure. You can work with two or three decks.

There are two modes: view and study.

View mode is designed to filter a large deck and highlight some entries for study.
Here you can also listen to the audio for the entire list of cards.

The learning mode is similar to Anki's regular mode, but customized to my preferences.

![1](/screenshots/1.png)

![2](/screenshots/2.png)

![3](/screenshots/3.png)

[https://andrew2020wit.github.io/anki-viewer/](https://andrew2020wit.github.io/anki-viewer/)

## Viewer

It uses [Anki-Connect](https://git.sr.ht/~foosoft/anki-connect/) to search some notes, display them;
and it can "answer" selected cards with 'easy' or 'again'.

Mixed answer: selected - 'again', not selected - 'easy'.

It's created for certain anki deck structure, so you may not see cards properly for other decks.

The correct card structure:

[src/app/interfaces/card-fields.interface.ts](src/app/interfaces/card-fields.interface.ts)

## Learn

It's similar to the normal anki learning, but uses a custom interface.

Deck name is taken from:

1. Url (/learn?deck=cald)
2. Settings
3. "cald"

### Sound

To use sound you have to use http-server for audio-files.

You can use: [http-server](https://github.com/http-party/http-server/tree/master)

Set url in settings like: http://127.0.0.1:8085/

("/" - in the end!)

1. install Node.js
2. install [http-server](https://github.com/http-party/http-server/tree/master)
3. optional: create folder `anki-files-for-http`, copy anki audio files
4. run `http-server C:\temp-progs\anki-files-for-http\ -p 8085 --cors`

### Hot keys

[hotkeys](src/app/utils/hot-keys.ts)
