import request from 'supertest'
import { expressServer } from '../src/index'

afterAll(async () => {
  expressServer.close()
})

describe('Hello world', () => {
  test('GET', (done) => {
    request(expressServer)
      .get('/')
      .then((res) => {
        expect(res.statusCode).toBe(200)
        expect(res.body.status).toBe('Running Skeet Worker Server')
        done()
      })
      .catch((err) => {
        done(err)
      })
  })

  test('GET with param', (done) => {
    const id = 1
    request(expressServer)
      .get('/')
      .query({ id })
      .then((res) => {
        expect(res.statusCode).toBe(200)
        expect(res.text).toBe(`Hi! ${id}`)
        done()
      })
      .catch((err) => {
        done(err)
      })
  })
})
