const chai = require('chai')
const chaiHttp = require('chai-http')
const nock = require('nock')
const app = require('../src/app')

chai.use(chaiHttp)
const { expect } = chai

const BASE_URL = 'https://echo-serv.tbxnet.com'

const VALID_CSV =
  'file,text,number,hex\nfile1.csv,RgTya,64075909,70ad29aacf0b690b0467fe2b2767f765\nfile1.csv,AtjW,6,d33a8ca5d36d3106219f66f939774cf5'

const mockDefaultFiles = () => {
  nock(BASE_URL)
    .get('/v1/secret/files')
    .reply(200, { files: ['file1.csv'] })
  nock(BASE_URL).get('/v1/secret/file/file1.csv').reply(200, VALID_CSV)
}

describe('GET /files/data', () => {
  afterEach(() => nock.cleanAll())

  it('returns 200 with application/json content type', async () => {
    mockDefaultFiles()

    const res = await chai.request(app).get('/files/data')

    expect(res).to.have.status(200)
    expect(res).to.be.json
  })

  it('response body is an array', async () => {
    mockDefaultFiles()

    const res = await chai.request(app).get('/files/data')

    expect(res.body).to.be.an('array')
  })

  it('each element has file (string) and lines (array) properties', async () => {
    mockDefaultFiles()

    const res = await chai.request(app).get('/files/data')

    expect(res.body).to.have.length.greaterThan(0)
    res.body.forEach((entry) => {
      expect(entry).to.have.property('file').that.is.a('string')
      expect(entry).to.have.property('lines').that.is.an('array')
    })
  })

  it('each line has text (string), number (integer), hex (string) properties', async () => {
    mockDefaultFiles()

    const res = await chai.request(app).get('/files/data')

    res.body.forEach((entry) => {
      entry.lines.forEach((line) => {
        expect(line).to.have.property('text').that.is.a('string')
        expect(line).to.have.property('number').that.is.a('number')
        expect(Number.isInteger(line.number)).to.equal(true)
        expect(line).to.have.property('hex').that.is.a('string')
      })
    })
  })

  it('filters by fileName query param', async () => {
    nock(BASE_URL)
      .get('/v1/secret/files')
      .reply(200, { files: ['file1.csv', 'file2.csv'] })
    nock(BASE_URL).get('/v1/secret/file/file1.csv').reply(200, VALID_CSV)

    const res = await chai.request(app).get('/files/data?fileName=file1.csv')

    expect(res).to.have.status(200)
    expect(res.body).to.have.length(1)
    expect(res.body[0].file).to.equal('file1.csv')
  })

  it('returns empty array when fileName does not match any file', async () => {
    nock(BASE_URL)
      .get('/v1/secret/files')
      .reply(200, { files: ['file1.csv'] })

    const res = await chai
      .request(app)
      .get('/files/data?fileName=nonexistent.csv')

    expect(res).to.have.status(200)
    expect(res.body).to.deep.equal([])
  })

  it('returns 500 when external API file list fails', async () => {
    nock(BASE_URL).get('/v1/secret/files').reply(500)

    const res = await chai.request(app).get('/files/data')

    expect(res).to.have.status(500)
    expect(res.body).to.have.property('error')
  })

  it('skips files that fail to download, still returns others', async () => {
    nock(BASE_URL)
      .get('/v1/secret/files')
      .reply(200, { files: ['file1.csv', 'broken.csv'] })
    nock(BASE_URL).get('/v1/secret/file/file1.csv').reply(200, VALID_CSV)
    nock(BASE_URL).get('/v1/secret/file/broken.csv').reply(404)

    const res = await chai.request(app).get('/files/data')

    expect(res).to.have.status(200)
    expect(res.body).to.have.length(1)
    expect(res.body[0].file).to.equal('file1.csv')
  })
})

describe('GET /files/list', () => {
  afterEach(() => nock.cleanAll())

  it('returns 200 with { files: [...] }', async () => {
    nock(BASE_URL)
      .get('/v1/secret/files')
      .reply(200, { files: ['file1.csv', 'file2.csv'] })

    const res = await chai.request(app).get('/files/list')

    expect(res).to.have.status(200)
    expect(res.body).to.have.property('files').that.is.an('array')
    expect(res.body.files).to.deep.equal(['file1.csv', 'file2.csv'])
  })

  it('returns 500 when external API fails', async () => {
    nock(BASE_URL).get('/v1/secret/files').reply(503)

    const res = await chai.request(app).get('/files/list')

    expect(res).to.have.status(500)
  })
})
