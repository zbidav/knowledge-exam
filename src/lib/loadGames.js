// loadGames.js
// -----------------------------------------------------------------------------
// Discovers every game file under content/**/games/*.xml and parses it. Games
// live in a `games/` subfolder of each subject so the question loader can skip
// them (see loadDecks.js). Adding a game = adding a file; no code change.
// -----------------------------------------------------------------------------
import { parseGame } from './parseGames.js'

const rawFiles = import.meta.glob('/content/**/games/*.xml', {
  query: '?raw',
  import: 'default',
  eager: true,
})

function buildGames() {
  const games = []
  for (const [path, raw] of Object.entries(rawFiles)) {
    try {
      const game = parseGame(raw, path)
      const subjectFromPath = path.split('/')[2]
      games.push({ id: path, ...game, subject: game.subject || subjectFromPath })
    } catch (err) {
      console.error(err)
    }
  }
  return games
}

export const ALL_GAMES = buildGames()
