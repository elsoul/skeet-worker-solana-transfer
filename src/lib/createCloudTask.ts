import { v2 } from '@google-cloud/tasks'
import fetch from 'node-fetch'
import { SkeetSolanaTransferResponse } from '@/types/api/SkeetSolanaTransferTypes'
import encodeBase64 from '@/utils/base64'

const { CloudTasksClient } = v2
const project = process.env.SKEET_GCP_PROJECT_ID || 'skeet-framework'
const location = process.env.SKEET_GCP_TASK_REGION || 'europe-west1'
const API_ENDPOINT_URL = process.env.SKEET_API_ENDPOINT_URL || ''
const API_DEV_URL = 'http://host.docker.internal:4000/graphql'
const DEFAULT_RETURN_MUTATION_NAME = 'saveSkeetSolanaTransfer'
export const createCloudTask = async (
  queue: string,
  params: SkeetSolanaTransferResponse
) => {
  try {
    const graphql = await genGraphqlRequest(params)
    const body = await encodeBase64(graphql)
    const client = new CloudTasksClient()
    async function createTask() {
      const parent = client.queuePath(project, location, queue)
      const task = {
        httpRequest: {
          headers: {
            'Content-Type': 'application/json',
          },
          httpMethod: 'POST',
          url: API_ENDPOINT_URL,
          body,
        },
      }

      console.log(`Sending task: ${queue}`)

      // Send create task request.
      const request = { parent: parent, task: task }
      //@ts-ignore
      const [response] = await client.createTask(request)
      const name = response.name
      console.log(`Created task ${name}`)
    }

    createTask()
  } catch (error) {
    console.log(`createCloudTask: ${error}`)
  }
}

export const genGraphqlRequest = async (
  params: SkeetSolanaTransferResponse
) => {
  let queryArray: Array<string> = []
  for (const [key, value] of Object.entries(params)) {
    const str =
      typeof value === 'string' ? `${key}: "${value}"` : `${key}: ${value}`
    queryArray.push(str)
  }
  const strArgs = queryArray.join(' ')

  return JSON.stringify({
    query: `mutation { ${DEFAULT_RETURN_MUTATION_NAME}(${strArgs})}`,
    variables: {},
  })
}

export const sendPost = async (params: SkeetSolanaTransferResponse) => {
  try {
    const body = await genGraphqlRequest(params)
    const response = await fetch(API_DEV_URL, {
      method: 'POST',
      body,
      headers: { 'Content-Type': 'application/json' },
    })
    return response
  } catch (e) {
    console.log({ e })
    throw new Error(`sendPost failed: ${e}`)
  }
}
