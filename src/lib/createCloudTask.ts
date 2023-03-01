import { v2 } from '@google-cloud/tasks'
import { ResponseParam } from './tokenTransfer'

const { CloudTasksClient } = v2
const project = process.env.SKEET_GCP_PROJECT_ID || 'skeet-framework'
const location = process.env.SKEET_GCP_REGION || 'europe-west1'
const API_URL =
  process.env.NODE_ENV === 'production'
    ? process.env.SKEET_API_URL
    : 'http://localhost:4000/graphql'

export const createCloudTask = async (
  queue: string,
  mutationName: string,
  params: ResponseParam
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
  params: ResponseParam
) => {
  let queryArray: Array<string> = []
  for (const [key, value] of Object.entries(params)) {
    const str =
      typeof value === 'string' ? `${key}: "${value}"` : `${key}: ${value}`
    queryArray.push(str)
  }
  const strArgs = queryArray.join(' ')

  return JSON.stringify({
    query: `mutation { ${mutationName}(${strArgs}) { id }}`,
    variables: {},
  })
}
