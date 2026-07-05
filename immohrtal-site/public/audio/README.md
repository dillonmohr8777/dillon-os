# Drop album audio here

Put MP3s in this folder, e.g.

```
public/audio/01-signal.mp3
public/audio/02-dance-with-the-delusional.mp3
```

Then point each track's `src` at the file in `src/content/album.ts`:

```ts
{ title: 'Signal', note: 'intro', src: '/audio/01-signal.mp3' }
```

That's it — the play buttons, sticky player, and live visualizer
all light up automatically once a track has a `src`.
