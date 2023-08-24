import fs from 'fs'

// Synchronously read our data file
const input = fs.readFileSync('assets/aoc/2022/aoc2022-d2.txt', 'utf8')

const shapeScore = new Map()
shapeScore.set('R', 1) // Rock
shapeScore.set('P', 2) // Paper
shapeScore.set('S', 3) // Scissors

const predictionKey = new Map()
predictionKey.set('A', 'R') // Rock
predictionKey.set('B', 'P') // Paper
predictionKey.set('C', 'S') // Scissors

const responseKey = new Map()
responseKey.set('X', 'R') // Rock
responseKey.set('Y', 'P') // Paper
responseKey.set('Z', 'S') // Scissors

const winRules = new Set()
// rule format is 'XY' where X defeats Y if 'XY' is in the set
winRules.add('RS')
winRules.add('SP')
winRules.add('PR')

enum RoundOutcome {
  WIN = 6,
  LOSE = 0,
  DRAW = 3,
}

const roundOutcome = (opponentsPlay: string, yourPlay: string): RoundOutcome => {
  if (opponentsPlay === yourPlay) {
    return RoundOutcome.DRAW
  }
  if (winRules.has(yourPlay + opponentsPlay)) {
    return RoundOutcome.WIN
  }
  return RoundOutcome.LOSE
}

const roundScore = (opponentsPlay: string, yourPlay: string): number => {
  return shapeScore.get(yourPlay) + roundOutcome(opponentsPlay, yourPlay)
}

const guideRoundScore = (predictionCode: string, responseCode: string): number =>
  roundScore(predictionKey.get(predictionCode), responseKey.get(responseCode))

let test = guideRoundScore('A', 'Y')
test += guideRoundScore('B', 'X')
test += guideRoundScore('C', 'Z')
test

const sumStrategyGuide = (guide: string) => {
  let sum = 0
  guide.split('\n').forEach(guideRound => {
    const [predictionCode, responseCode] = guideRound.split(' ')
    sum += guideRoundScore(predictionCode, responseCode)
  })
  return sum
}

console.log('Total Score:', sumStrategyGuide(input))

//
