import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const ELLIPTIC_API_KEY = process.env.ELLIPTIC_API_KEY || ''
const ELLIPTIC_API_SECRET = process.env.ELLIPTIC_API_SECRET || ''
const ELLIPTIC_BASE_URL = 'https://aml-api.elliptic.co'

interface ScreeningResult {
  address: string
  riskScore: number
  riskLevel: 'low' | 'medium' | 'high' | 'extreme'
  isBlocked: boolean
  details: string[]
  checkedAt: number
}

// In-memory cache to avoid repeated API calls
const screeningCache = new Map<string, { result: ScreeningResult; expiresAt: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

function generateEllipticSignature(method: string, path: string, body: string): string {
  const timestamp = Date.now().toString()
  const message = `${timestamp}${method}${path}${body}`
  const signature = crypto.createHmac('sha256', ELLIPTIC_API_SECRET).update(message).digest('hex')
  return `${timestamp}:${signature}`
}

async function screenAddressWithElliptic(address: string): Promise<ScreeningResult> {
  const path = '/v2/wallet/synchronous'
  const body = JSON.stringify({
    subject: {
      asset: 'holistic',
      blockchain: 'holistic',
      type: 'address',
      hash: address,
    },
    type: 'wallet_exposure',
  })

  const signature = generateEllipticSignature('POST', path, body)

  const response = await fetch(`${ELLIPTIC_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-access-key': ELLIPTIC_API_KEY,
      'x-access-sign': signature.split(':')[1],
      'x-access-timestamp': signature.split(':')[0],
    },
    body,
  })

  if (!response.ok) {
    const errText = await response.text().catch(() => 'Unknown error')
    throw new Error(`Elliptic API error: ${response.status} - ${errText}`)
  }

  const data = await response.json()

  const riskScore = data.risk_score ?? 0
  const riskLevel: ScreeningResult['riskLevel'] =
    riskScore >= 8 ? 'extreme' :
    riskScore >= 6 ? 'high' :
    riskScore >= 3 ? 'medium' : 'low'

  const details: string[] = []
  if (data.cluster_entities?.length > 0) {
    details.push(`Associated with: ${data.cluster_entities.map((e: any) => e.name).join(', ')}`)
  }
  if (data.labels?.length > 0) {
    details.push(`Labels: ${data.labels.join(', ')}`)
  }

  return {
    address: address.toLowerCase(),
    riskScore,
    riskLevel,
    isBlocked: riskScore >= 7,
    details,
    checkedAt: Date.now(),
  }
}

// Fallback screening when no API keys configured
function fallbackScreening(address: string): ScreeningResult {
  const knownBlockedPrefixes = ['0x000000000000000000000000000000000000dead']
  const isKnownBlocked = knownBlockedPrefixes.some(p => address.toLowerCase().startsWith(p))

  return {
    address: address.toLowerCase(),
    riskScore: isKnownBlocked ? 10 : 0,
    riskLevel: isKnownBlocked ? 'extreme' : 'low',
    isBlocked: isKnownBlocked,
    details: ELLIPTIC_API_KEY ? [] : ['Screening in demo mode (no API keys configured)'],
    checkedAt: Date.now(),
  }
}

export async function POST(req: NextRequest) {
  try {
    const { address } = await req.json()

    if (!address || typeof address !== 'string' || !address.startsWith('0x') || address.length !== 42 || !/^0x[0-9a-fA-F]{40}$/.test(address)) {
      return NextResponse.json({ error: 'Invalid address format. Expected 0x + 40 hex chars.' }, { status: 400 })
    }

    const normalizedAddress = address.toLowerCase()

    // Check cache
    const cached = screeningCache.get(normalizedAddress)
    if (cached && cached.expiresAt > Date.now()) {
      return NextResponse.json({ ...cached.result, cached: true })
    }

    let result: ScreeningResult

    if (ELLIPTIC_API_KEY && ELLIPTIC_API_SECRET) {
      result = await screenAddressWithElliptic(normalizedAddress)
    } else {
      result = fallbackScreening(normalizedAddress)
    }

    // Cache result
    screeningCache.set(normalizedAddress, {
      result,
      expiresAt: Date.now() + CACHE_TTL,
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Compliance screening error:', error)
    return NextResponse.json(
      {
        error: 'Screening failed',
        message: error?.message || 'Unknown error',
        address: '',
        riskScore: -1,
        riskLevel: 'low' as const,
        isBlocked: false,
        details: ['Screening temporarily unavailable'],
        checkedAt: Date.now(),
      },
      { status: 500 }
    )
  }
}
