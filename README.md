# AnkiViewer

[https://andrew2020wit.github.io/anki-viewer/](https://andrew2020wit.github.io/anki-viewer/)

## Viewer

It uses [Anki-Connect](https://git.sr.ht/~foosoft/anki-connect/) to search some notes, display them;
and it can "answer" selected cards with 'easy' or 'again'.

Mixed answer - selected - 'again', not selected - 'easy'.

It's created for certain anki deck structure, so you may not see card properly for other deck.

The correct card structure:

[src/app/interfaces/card-fields.interface.ts](src/app/interfaces/card-fields.interface.ts)

## Learn

It's similar to normal anki learning, but uses custom interface.

At the moment your deck name must be "cald" (todo - use url query for deck name), and cards must be the same structure.
