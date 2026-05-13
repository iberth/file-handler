const { expect } = require('chai')
const nock = require('nock')
const { getFiles, getFile } = require('../src/clients/secret.client')

const BASE_URL = 'https://echo-serv.tbxnet.com'
const AUTH = 'Bearer aSuperSecretKey'

describe('secretClient.getFiles', () => {
  afterEach(() => nock.cleanAll())

  it('calls the correct endpoint with the auth header', async () => {
    nock(BASE_URL)
      .get('/v1/secret/files')
      .matchHeader('authorization', AUTH)
      .reply(200, { files: ['file1.csv', 'file2.csv'] })

    const result = await getFiles()

    expect(result).to.deep.equal({ files: ['file1.csv', 'file2.csv'] })
  })

  it('throws when the response is not ok', async () => {
    nock(BASE_URL).get('/v1/secret/files').reply(500)

    try {
      await getFiles()
      expect.fail('Expected error to be thrown')
    } catch (err) {
      expect(err.message).to.include('500')
    }
  })
})

describe('secretClient.getFile', () => {
  afterEach(() => nock.cleanAll())

  it('calls the correct endpoint with the auth header and returns text', async () => {
    const csvContent = 'file,text,number,hex\nfile1.csv,RgTya,64075909,70ad29aacf0b690b0467fe2b2767f765'

    nock(BASE_URL)
      .get('/v1/secret/file/file1.csv')
      .matchHeader('authorization', AUTH)
      .reply(200, csvContent)

    const result = await getFile('file1.csv')

    expect(result).to.equal(csvContent)
  })

  it('returns null when the response is not ok', async () => {
    nock(BASE_URL).get('/v1/secret/file/file1.csv').reply(404)

    const result = await getFile('file1.csv')

    expect(result).to.be.null
  })

  it('encodes special characters in the file name', async () => {
    nock(BASE_URL)
      .get('/v1/secret/file/my%20file.csv')
      .reply(200, 'file,text,number,hex\n')

    const result = await getFile('my file.csv')

    expect(result).to.equal('file,text,number,hex\n')
  })
})
