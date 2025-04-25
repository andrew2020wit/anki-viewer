# AnkiViewer

This is a simple front-end for Anki via [Anki-Connect](https://git.sr.ht/~foosoft/anki-connect/)

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
