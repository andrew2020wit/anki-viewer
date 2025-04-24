# AnkiViewer

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

By default, your deck name must be "cald" (todo - use url query for deck name), and cards must be the same structure.
You can change it in settings.

### Sound

To use sound you have to use http-server for audio-files.

You can use: [http-server](https://github.com/http-party/http-server/tree/master)

Set url in settings like: http://127.0.0.1:8085/

("/" - in the end!)

### Hot keys

[hotkeys](src/app/utils/hot-keys.ts)
