import { Request, Response } from 'express'
const skeetEnv = process.env.NODE_ENV || 'development'

export const root = (req: Request, res: Response) => {
  if (req.query.id) {
    return res.status(200).send(`Hi! ${req.query.id}`)
  }

  res.status(200).json({ status: 'Running Skeet Worker Server', env: skeetEnv })
}
