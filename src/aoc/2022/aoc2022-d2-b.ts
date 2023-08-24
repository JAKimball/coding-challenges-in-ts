import fs from 'fs'

// Synchronously read our data file
const input = fs.readFileSync('assets/aoc/2022/aoc2022-d2.txt', 'utf8')

enum RoundOutcome {
  WIN = 6,
  LOSE = 0,
  DRAW = 3,
}

const shapeScore = new Map()
shapeScore.set('R', 1) // Rock
shapeScore.set('P', 2) // Paper
shapeScore.set('S', 3) // Scissors

const predictionKey = new Map()
predictionKey.set('A', 'R') // Rock
predictionKey.set('B', 'P') // Paper
predictionKey.set('C', 'S') // Scissors

const responseKey = new Map()
responseKey.set('X', RoundOutcome.LOSE)
responseKey.set('Y', RoundOutcome.DRAW)
responseKey.set('Z', RoundOutcome.WIN)

const playForOutcome = (opponentsPlay: string, outcome: RoundOutcome) => {
  if (outcome === RoundOutcome.DRAW) {
    return opponentsPlay
  }
  switch (opponentsPlay) {
    case 'R':
      return outcome === RoundOutcome.WIN ? 'P' : 'S'
    case 'P':
      return outcome === RoundOutcome.WIN ? 'S' : 'R'
    case 'S':
      return outcome === RoundOutcome.WIN ? 'R' : 'P'
  }
}

const roundScore = (opponentsPlay: string, roundOutcome: RoundOutcome): number => {
  return shapeScore.get(playForOutcome(opponentsPlay, roundOutcome)) + roundOutcome
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
