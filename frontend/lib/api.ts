import { config } from './config'

export type HealthResponse = {
  status: string
  timestamp: string
  uptime: number
}

export async function checkHealth(): Promise<HealthResponse> {
  const response = await fetch(`${config.apiUrl}/health`, {
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`Health check failed (${response.status})`)
  }

  return response.json()
}
