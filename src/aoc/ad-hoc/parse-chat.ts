import fs from 'fs'
import path from 'path'
import { v4 as uuidV4 } from 'uuid'

interface ChatRequest {
  timestamp?: number
  message?: {
    text?: string
  }
}

interface ChatSession {
  version?: number
  sessionId?: string
  creationDate?: number
  isImported?: boolean
  lastMessageDate?: number
  customTitle?: string
  requests?: ChatRequest[]
}

const getReferencedFsPathsFromJson = (input: Object) => {
  const result: Set<string> = new Set()

  const recurse = (obj: any) => {
    if (typeof obj !== 'object' || obj === null) return

    if ('fsPath' in obj) {
      result.add(obj.fsPath)
    }

    for (const value of Object.values(obj)) {
      recurse(value)
    }
  }

  recurse(input)
  return [...result]
}

const getAllUniqueJSONPaths = (input: Object) => {
  const result: Set<string> = new Set() // Use a Set to avoid duplicates

  const recurse = (obj: any, stack: string[]) => {
    if (typeof obj !== 'object' || obj === null) return

    for (const [key, value] of Object.entries(obj)) {
      stack.push(Number.isNaN(Number.parseInt(key)) ? `.${key}` : `[]`)
      result.add(stack.join(''))
      recurse(value, stack)
      stack.pop()
    }
  }

  recurse(input, [])
  return [...result].sort()
}

const JsonTests = (jsonData: ChatSession[]) => {
  const outputAllUniqueJSONPaths = (result: Array<string>) => {
    result.forEach(path => {
      console.log(path)
    })
  }

  const result = getAllUniqueJSONPaths(jsonData)
  outputAllUniqueJSONPaths(result)

  const outputJSONPaths = (result: Array<string>) => {
    result.forEach(path => {
      console.log(path)
    })
  }

  const result1 = getAllMatchingJSONPaths(jsonData, 'uri')
  outputJSONPaths(result1)

  const outputRefs = (result: Array<string>) => {
    result.forEach(ref => {
      console.log(ref)
    })
  }

  const result2 = getReferencedFsPathsFromJson(jsonData)
  outputRefs(result2)

  // jsonData[0].requests[0].contentReferences[0].reference.uri.fsPath //?
}

const getAllMatchingJSONPaths = (input: Object, key: string) => {
  const result: Set<string> = new Set()

  const recurse = (obj: any, stack: string[]) => {
    if (typeof obj !== 'object' || obj === null) return

    if (key in obj) {
      result.add(stack.join('') + '.' + key)
    }

    for (const [key, value] of Object.entries(obj)) {
      stack.push(Number.isNaN(Number.parseInt(key)) ? `.${key}` : `[]`)
      recurse(value, stack)
      stack.pop()
    }
  }

  recurse(input, [])
  return [...result].sort()
}

const sessionName = (sessionData: ChatSession): string => {
  // Try to get custom title first
  if (sessionData?.customTitle?.trim()) {
    return sessionData.customTitle.trim()
  }

  // Get first message text as fallback
  const firstMessageText = sessionData?.requests?.[0]?.message?.text
  if (!firstMessageText) {
    return 'unnamed-session'
  }

  // Process the text to create a title
  return (
    firstMessageText
      .split(/[.!?]/)[0] // Split on sentence endings and take first part
      .split(' ')
      .reduce((acc, word) => {
        if (acc.length <= 50) {
          return acc + (acc ? ' ' : '') + word
        }
        return acc
      }, '')
      .trim() || 'unnamed-session'
  )
}

const listRefsBySession = (chatSessions: ChatSession[]) => {
  const sessionsWithNames = chatSessions.map(session => [session, sessionName(session)] as const)

  sessionsWithNames
    .sort(([, nameA], [, nameB]) => nameA.localeCompare(nameB))
    .forEach(([session, name]) => {
      console.log(`Session: "${name}"`)
      getReferencedFsPathsFromJson(session)
        .sort((a, b) => a.localeCompare(b))
        .forEach(ref => console.log(`  ${ref}`))
    })
}

const listSessionsByRef = (chatSessions: ChatSession[]) => {
  const sessionsWithNames = chatSessions.map(session => [session, sessionName(session)] as const)

  const refsMap = sessionsWithNames
    // Sort sessions once, before building the map
    .sort(([, nameA], [, nameB]) => nameA.localeCompare(nameB))
    .reduce((map, [session]) => {
      getReferencedFsPathsFromJson(session).forEach(ref => {
        map.set(ref, [...(map.get(ref) || []), [session, sessionName(session)]] as const)
      })
      return map
    }, new Map<string, readonly [ChatSession, string][]>())

  // Only refs need sorting now, sessions are already in order
  Array.from(refsMap.entries())
    .sort(([refA], [refB]) => refA.localeCompare(refB))
    .forEach(([ref, sessions]) => {
      console.log(`Ref: ${ref}`)
      sessions.forEach(([, name]) => console.log(`  Session: "${name}"`))
    })
}

const fileNameFromSessionName = (sessionName: string) => {
  return sessionName
    .replace(/ /g, '-')
    .replace(/[^a-zA-Z0-9-]/g, '')
    .toLowerCase()
}

const logAsList = (iterable: Iterable<string>) => {
  for (const item of iterable) {
    console.log(item)
  }
}

const testNames = (jsonData: ChatSession[]) => {
  const sessionNames = (jsonData: any) => {
    return jsonData.map(sessionName).sort()
  }
  logAsList(sessionNames(jsonData))

  const fileNames = (jsonData: any) => {
    return jsonData.map(sessionName).map(fileNameFromSessionName).sort()
  }
  logAsList(fileNames(jsonData))
}

const splitAndSaveSessions = (jsonData: ChatSession[], outputDir: string): void => {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  jsonData.forEach((session, index) => {
    const name = sessionName(session)
    const fileName = fileNameFromSessionName(name) || `session-${index}`

    // Create unique filename
    let filePath = path.join(outputDir, `${fileName}.json`)
    let counter = 1
    while (fs.existsSync(filePath)) {
      filePath = path.join(outputDir, `${fileName}-${counter}.json`)
      counter++
    }

    // Write enhanced session to file
    fs.writeFileSync(filePath, JSON.stringify(session, null, 2), 'utf8')

    console.log(`Saved session to: ${filePath}`)
  })
}

const generateSessionMetadata = (session: ChatSession, fallbackTime: number): ChatSession => {
  const requests = session.requests || []
  const timestamps = requests.map(req => req.timestamp).filter((t): t is number => t !== undefined)

  const metadata: Partial<ChatSession> = {
    sessionId: session.sessionId || uuidV4(),
    creationDate: timestamps[0] || fallbackTime,
    lastMessageDate: timestamps[timestamps.length - 1] || fallbackTime,
  }

  // Let existing session properties take precedence over generated metadata
  return {
    ...metadata,
    ...session,
  }
}

// Are we running in Quokka?
const isQuokka = process.argv[1].includes('wallabyjs.quokka') //?
// const isQuokka = process.env.QUOKKA === 'true' //?
// const isQuokka = 'true'

const getInputData = async (inputFilePath?: string): Promise<[string, number]> => {
  // Check if data is being piped in
  if (!isQuokka && !process.stdin.isTTY) {
    const chunks: Buffer[] = []
    for await (const chunk of process.stdin) {
      chunks.push(Buffer.from(chunk))
    }
    return [Buffer.concat(chunks).toString('utf8'), Date.now()]
  }

  // No pipe, read from file
  if (!inputFilePath) {
    throw new Error('No input file specified and no data piped to stdin')
  }
  const stats = fs.statSync(inputFilePath)
  return [fs.readFileSync(inputFilePath, 'utf8'), stats.mtimeMs]
}

const main = async () => {
  // cspell:words jonat
  const inputFilePath = `/mnt/c/Users/jonat/projects/my-windows-scripts/chats-desktop-bin.json`
  // const inputFilePath = `/mnt/c/Users/jonat/projects/my-windows-scripts/chat (new).json`
  // const inputFilePath = `/home/jonathan/projects/practice/coding-challenges-in-ts/src/aoc/ad-hoc/chat.json`

  try {
    process.argv //?

    const [rawInput, fallbackTime] = await getInputData(process.argv[9] || inputFilePath)
    const jsonData = JSON.parse(rawInput)

    // JsonTests(jsonData)
    console.log('---')

    listRefsBySession(jsonData)
    console.log('---')

    listSessionsByRef(jsonData)
    console.log('---')

    testNames(jsonData)
    console.log('---')

    const outputDir = process.argv[2] || './chat-sessions'

    const enhancedData = jsonData.map((session: ChatSession) =>
      generateSessionMetadata(session, fallbackTime)
    )

    // Generate output files only if not running in Quokka
    if (!isQuokka) {
      splitAndSaveSessions(enhancedData, outputDir)
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error:', error.message)
    } else {
      console.error('An unexpected error occurred:', String(error))
    }
    process.exit(1)
  }
}

;(async () => {
  await main()
})()
