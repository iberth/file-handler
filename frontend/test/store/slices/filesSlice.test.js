import filesReducer, {
  setSelectedFile,
  fetchFilesData,
  fetchFileList,
} from '../../../src/store/slices/filesSlice'

const initialState = {
  rows: [],
  fileList: [],
  loading: false,
  error: null,
  selectedFile: null,
}

describe('filesSlice reducers', () => {
  it('returns the initial state', () => {
    expect(filesReducer(undefined, { type: '@@INIT' })).toEqual(initialState)
  })

  it('setSelectedFile updates selectedFile', () => {
    const state = filesReducer(initialState, setSelectedFile('file1.csv'))

    expect(state.selectedFile).toBe('file1.csv')
  })

  it('setSelectedFile can clear selectedFile to null', () => {
    const state = filesReducer(
      { ...initialState, selectedFile: 'file1.csv' },
      setSelectedFile(null),
    )

    expect(state.selectedFile).toBeNull()
  })

  it('fetchFilesData.pending sets loading to true and clears error', () => {
    const state = filesReducer(
      { ...initialState, error: 'old error' },
      fetchFilesData.pending(),
    )

    expect(state.loading).toBe(true)
    expect(state.error).toBeNull()
  })

  it('fetchFilesData.fulfilled sets rows and clears loading', () => {
    const rows = [
      { file: 'file1.csv', text: 'A', number: 1, hex: 'a'.repeat(32) },
    ]
    const state = filesReducer(initialState, fetchFilesData.fulfilled(rows))

    expect(state.loading).toBe(false)
    expect(state.rows).toEqual(rows)
  })

  it('fetchFilesData.rejected sets error and clears loading', () => {
    const action = {
      type: fetchFilesData.rejected.type,
      error: { message: 'API error' },
    }
    const state = filesReducer({ ...initialState, loading: true }, action)

    expect(state.loading).toBe(false)
    expect(state.error).toBe('API error')
  })

  it('fetchFileList.fulfilled sets fileList', () => {
    const files = ['file1.csv', 'file2.csv']
    const state = filesReducer(initialState, fetchFileList.fulfilled(files))

    expect(state.fileList).toEqual(files)
  })
})
