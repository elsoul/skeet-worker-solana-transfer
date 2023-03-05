import { v2 } from '@google-cloud/tasks'
import fetch from 'node-fetch'
import { SolanaTransferResponseParam } from '../types/api/SolanaTransferParam'

const { CloudTasksClient } = v2
const project = process.env.SKEET_GCP_PROJECT_ID || 'skeet-framework'
const location = process.env.SKEET_TASK_REGION || 'europe-west1'
const API_URL = process.env.SKEET_API_URL || ''
const API_DEV_URL = 'http://localhost:4000/graphql'

export enum GraphQLMethod {
  query = 'query',
  mutation = 'mutation',
}

export const createCloudTask = async (
  queue: string,
  mutationName: string,
  params: SolanaTransferResponseParam
) => {
  const body = await genGraphqlRequest(mutationName, params)
  const client = new CloudTasksClient()
  async function createTask() {
    const parent = client.queuePath(project, location, queue)
    const task = {
      httpRequest: {
        headers: {
          'Content-Type': 'application/json',
        },
        httpMethod: 'POST',
        url: API_URL,
        body,
      },
    }

    console.log('Sending task:')

    // Send create task request.
    const request = { parent: parent, task: task }
    //@ts-ignore
    const [response] = client.createTask(request)
    const name = response.name
    console.log(`Created task ${name}`)
  }

  createTask()
}

export const genGraphqlRequest = async (
  mutationName: string,
  params: SolanaTransferResponseParam
) => {
  let queryArray: Array<string> = []
  for (const [key, value] of Object.entries(params)) {
    const str =
      typeof value === 'string' ? `${key}: "${value}"` : `${key}: ${value}`
    queryArray.push(str)
  }
  const strArgs = queryArray.join(' ')

  return JSON.stringify({
    query: `mutation { ${mutationName}(${strArgs})}`,
    variables: {},
  })
}

export const sendPost = async (
  mutationName: string,
  params: SolanaTransferResponseParam
) => {
  try {
    const body = await genGraphqlRequest(mutationName, params)
    const response = await fetch(API_DEV_URL, {
      method: 'POST',
      body,
      headers: { 'Content-Type': 'application/json' },
    })
    return response
  } catch (e) {
    console.log({ e })
    throw new Error('sendPost failed:')
  }
}
