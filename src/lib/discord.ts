import fetch from 'node-fetch'
import dotenv from 'dotenv'
dotenv.config()

const webhookUrl = process.env.DISCO_WEBHOOK || ''

export async function sendDiscord(content: string) {
  try {
    const body = {
      content,
      username: 'Skeet Notifier',
    }
    const res = await fetch(webhookUrl, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    })
    console.log(`Discord result status: ${res.status}`)
  } catch (e) {
    console.log({ e })
  }
}
