const { expect } = require('chai')
const nock = require('nock')
const {
  parseCSV,
  getAllFilesData,
  getFileList,
} = require('../src/services/file.service')

const BASE_URL = 'https://echo-serv.tbxnet.com'
const AUTH = 'Bearer aSuperSecretKey'

describe('parseCSV', () => {
  it('parses a valid CSV correctly', () => {
    const csv =
      'file,text,number,hex\nfile1.csv,RgTya,64075909,70ad29aacf0b690b0467fe2b2767f765'
    const rows = parseCSV(csv, 'file1.csv')

    expect(rows).to.have.length(1)
    expect(rows[0]).to.deep.equal({
      text: 'RgTya',
      number: 64075909,
      hex: '70ad29aacf0b690b0467fe2b2767f765',
    })
  })

  it('skips the header row', () => {
    const csv = 'file,text,number,hex'
    const rows = parseCSV(csv, 'file1.csv')

    expect(rows).to.have.length(0)
  })

  it('returns empty array for header-only CSV', () => {
    const rows = parseCSV('file,text,number,hex\n', 'file1.csv')

    expect(rows).to.have.length(0)
  })

  it('skips rows with fewer than 4 columns', () => {
    const csv = 'file,text,number,hex\nfile1.csv,RgTya,64075909'
    const rows = parseCSV(csv, 'file1.csv')

    expect(rows).to.have.length(0)
  })

  it('skips rows where number is not an integer string', () => {
    const csv =
      'file,text,number,hex\nfile1.csv,text,abc,70ad29aacf0b690b0467fe2b2767f765'
    const rows = parseCSV(csv, 'file1.csv')

    expect(rows).to.have.length(0)
  })

  it('skips rows where number is a float string', () => {
    const csv =
      'file,text,number,hex\nfile1.csv,text,3.14,70ad29aacf0b690b0467fe2b2767f765'
    const rows = parseCSV(csv, 'file1.csv')

    expect(rows).to.have.length(0)
  })

  it('skips rows where hex is not 32 characters', () => {
    const csv = 'file,text,number,hex\nfile1.csv,text,42,tooshort'
    const rows = parseCSV(csv, 'file1.csv')

    expect(rows).to.have.length(0)
  })

  it('skips rows where hex contains non-hex characters', () => {
    const csv =
      'file,text,number,hex\nfile1.csv,text,42,gggggggggggggggggggggggggggggggg'
    const rows = parseCSV(csv, 'file1.csv')

    expect(rows).to.have.length(0)
  })

  it('skips blank lines', () => {
    const csv =
      'file,text,number,hex\n\nfile1.csv,RgTya,64075909,70ad29aacf0b690b0467fe2b2767f765\n\n'
    const rows = parseCSV(csv, 'file1.csv')

    expect(rows).to.have.length(1)
  })

  it('parses number as an integer, not a string', () => {
    const csv =
      'file,text,number,hex\nfile1.csv,text,100,70ad29aacf0b690b0467fe2b2767f765'
    const rows = parseCSV(csv, 'file1.csv')

    expect(rows[0].number).to.be.a('number')
    expect(rows[0].number).to.equal(100)
  })

  it('accepts lowercase hex', () => {
    const csv =
      'file,text,number,hex\nfile1.csv,text,1,abcdef1234567890abcdef1234567890'
    const rows = parseCSV(csv, 'file1.csv')

    expect(rows).to.have.length(1)
  })
})

describe('getFileList', () => {
  afterEach(() => nock.cleanAll())

  it('returns the list of files from the external API', async () => {
    nock(BASE_URL)
      .get('/v1/secret/files')
      .matchHeader('authorization', AUTH)
      .reply(200, { files: ['file1.csv', 'file2.csv'] })

    const { files } = await getFileList()

    expect(files).to.deep.equal(['file1.csv', 'file2.csv'])
  })

  it('throws when external API returns non-ok status', async () => {
    nock(BASE_URL).get('/v1/secret/files').reply(500)

    try {
      await getFileList()
      expect.fail('Expected error to be thrown')
    } catch (err) {
      expect(err.message).to.include('500')
    }
  })
})

describe('getAllFilesData', () => {
  afterEach(() => nock.cleanAll())

  it('returns correctly shaped data for a single valid file', async () => {
    nock(BASE_URL)
      .get('/v1/secret/files')
      .reply(200, { files: ['file1.csv'] })
    nock(BASE_URL)
      .get('/v1/secret/file/file1.csv')
      .reply(
        200,
        'file,text,number,hex\nfile1.csv,RgTya,64075909,70ad29aacf0b690b0467fe2b2767f765',
      )

    const result = await getAllFilesData(null)

    expect(result).to.have.length(1)
    expect(result[0].file).to.equal('file1.csv')
    expect(result[0].lines).to.have.length(1)
    expect(result[0].lines[0]).to.deep.equal({
      text: 'RgTya',
      number: 64075909,
      hex: '70ad29aacf0b690b0467fe2b2767f765',
    })
  })

  it('silently skips files that return a non-ok HTTP status', async () => {
    nock(BASE_URL)
      .get('/v1/secret/files')
      .reply(200, { files: ['file1.csv', 'file2.csv'] })
    nock(BASE_URL)
      .get('/v1/secret/file/file1.csv')
      .reply(
        200,
        'file,text,number,hex\nfile1.csv,RgTya,64075909,70ad29aacf0b690b0467fe2b2767f765',
      )
    nock(BASE_URL).get('/v1/secret/file/file2.csv').reply(404)

    const result = await getAllFilesData(null)

    expect(result).to.have.length(1)
    expect(result[0].file).to.equal('file1.csv')
  })

  it('filters to a specific file when filterName is provided', async () => {
    nock(BASE_URL)
      .get('/v1/secret/files')
      .reply(200, { files: ['file1.csv', 'file2.csv'] })
    nock(BASE_URL)
      .get('/v1/secret/file/file1.csv')
      .reply(
        200,
        'file,text,number,hex\nfile1.csv,RgTya,64075909,70ad29aacf0b690b0467fe2b2767f765',
      )

    const result = await getAllFilesData('file1.csv')

    expect(result).to.have.length(1)
    expect(result[0].file).to.equal('file1.csv')
  })

  it('excludes files with no valid rows from the output', async () => {
    nock(BASE_URL)
      .get('/v1/secret/files')
      .reply(200, { files: ['empty.csv'] })
    nock(BASE_URL)
      .get('/v1/secret/file/empty.csv')
      .reply(200, 'file,text,number,hex\n')

    const result = await getAllFilesData(null)

    expect(result).to.have.length(0)
  })

  it('returns empty array when filterName matches no files', async () => {
    nock(BASE_URL)
      .get('/v1/secret/files')
      .reply(200, { files: ['file1.csv'] })

    const result = await getAllFilesData('nonexistent.csv')

    expect(result).to.have.length(0)
  })

  it('returns data from multiple files', async () => {
    nock(BASE_URL)
      .get('/v1/secret/files')
      .reply(200, { files: ['file1.csv', 'file2.csv'] })
    nock(BASE_URL)
      .get('/v1/secret/file/file1.csv')
      .reply(
        200,
        'file,text,number,hex\nfile1.csv,AAA,1,aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      )
    nock(BASE_URL)
      .get('/v1/secret/file/file2.csv')
      .reply(
        200,
        'file,text,number,hex\nfile2.csv,BBB,2,bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      )

    const result = await getAllFilesData(null)
    const files = result.map((r) => r.file)

    expect(result).to.have.length(2)
    expect(files).to.include('file1.csv')
    expect(files).to.include('file2.csv')
  })
})
