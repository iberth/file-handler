import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const API_URL = process.env.API_URL || 'http://localhost:3001'

export const fetchFilesData = createAsyncThunk(
  'files/fetchData',
  async (fileName) => {
    const url = fileName
      ? `${API_URL}/files/data?fileName=${encodeURIComponent(fileName)}`
      : `${API_URL}/files/data`

    const res = await fetch(url)

    if (!res.ok) throw new Error(`API error: ${res.status}`)

    const data = await res.json()

    return data.flatMap((entry) =>
      entry.lines.map((line) => ({ file: entry.file, ...line })),
    )
  },
)

export const fetchFileList = createAsyncThunk('files/fetchList', async () => {
  const res = await fetch(`${API_URL}/files/list`)

  if (!res.ok) throw new Error(`API error: ${res.status}`)

  const data = await res.json()

  return data.files
})

const filesSlice = createSlice({
  name: 'files',
  initialState: {
    rows: [],
    fileList: [],
    loading: false,
    error: null,
    selectedFile: null,
  },
  reducers: {
    setSelectedFile: (state, action) => {
      state.selectedFile = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFilesData.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchFilesData.fulfilled, (state, action) => {
        state.loading = false
        state.rows = action.payload
      })
      .addCase(fetchFilesData.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      .addCase(fetchFileList.fulfilled, (state, action) => {
        state.fileList = action.payload
      })
  },
})

export const { setSelectedFile } = filesSlice.actions
export default filesSlice.reducer
