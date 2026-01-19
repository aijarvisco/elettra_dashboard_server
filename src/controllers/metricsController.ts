import type { Request, Response } from 'express'
import { getMetricsSummary, getMetricsTimeline } from '../services/metricsService.js'

export async function getSummary(req: Request, res: Response): Promise<void> {
  try {
    const summary = await getMetricsSummary()
    res.json(summary)
  } catch (error) {
    console.error('Error fetching metrics summary:', error)
    res.status(500).json({ error: 'Failed to fetch metrics summary', code: '500' })
  }
}

export async function getTimeline(req: Request, res: Response): Promise<void> {
  try {
    const timeline = await getMetricsTimeline()
    res.json(timeline)
  } catch (error) {
    console.error('Error fetching metrics timeline:', error)
    res.status(500).json({ error: 'Failed to fetch metrics timeline', code: '500' })
  }
}
