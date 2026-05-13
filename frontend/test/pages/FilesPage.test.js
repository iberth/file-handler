import React from 'react'
import { render, screen, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import filesReducer from '../../src/store/slices/filesSlice'
import FilesPage from '../../src/pages/FilesPage'

const makeFetchMock = ({
  dataResponse = [],
  listResponse = { files: [] },
  dataOk = true,
} = {}) =>
  jest.fn((url) => {
    if (url && url.includes('/files/list')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(listResponse),
      })
    }

    return Promise.resolve({
      ok: dataOk,
      json: () => Promise.resolve(dataResponse),
    })
  })

const renderWithStore = (fetchMock, preloadedState = {}) => {
  global.fetch = fetchMock

  const store = configureStore({
    reducer: { files: filesReducer },
    preloadedState: {
      files: {
        rows: [],
        fileList: [],
        loading: false,
        error: null,
        selectedFile: null,
        ...preloadedState,
      },
    },
  })

  return render(
    <Provider store={store}>
      <FilesPage />
    </Provider>,
  )
}

describe('FilesPage', () => {
  it('shows a spinner while data is loading', async () => {
    // /files/list resolves immediately (FileFilter), /files/data never resolves (keeps spinner)
    const fetchMock = jest.fn((url) => {
      if (url && url.includes('/files/list')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ files: [] }),
        })
      }
      return new Promise(() => {})
    })

    await act(async () => {
      renderWithStore(fetchMock)
    })

    expect(document.querySelector('.spinner-border')).toBeInTheDocument()
  })

  it('shows an error alert when the request fails', async () => {
    await act(async () => {
      renderWithStore(makeFetchMock({ dataOk: false }))
    })

    expect(screen.getByText(/Error loading data/)).toBeInTheDocument()
  })

  it('renders the table when data loads successfully', async () => {
    const dataResponse = [
      {
        file: 'file1.csv',
        lines: [
          {
            text: 'Hello',
            number: 42,
            hex: 'abcdef1234567890abcdef1234567890',
          },
        ],
      },
    ]

    await act(async () => {
      renderWithStore(makeFetchMock({ dataResponse }))
    })

    expect(screen.getByText('File Name')).toBeInTheDocument()
    expect(screen.getByText('file1.csv')).toBeInTheDocument()
    expect(screen.getByText('Hello')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('renders a "No files found." row when fetch returns no data', async () => {
    await act(async () => {
      renderWithStore(makeFetchMock())
    })

    expect(screen.getByText('File Name')).toBeInTheDocument()
    expect(screen.getByText('No files found.')).toBeInTheDocument()
  })

  it('dispatches fetchFilesData on mount', async () => {
    const fetchMock = makeFetchMock()

    await act(async () => {
      renderWithStore(fetchMock)
    })
    const dataCalls = fetchMock.mock.calls.filter(([url]) =>
      url.includes('/files/data'),
    )

    expect(dataCalls.length).toBeGreaterThan(0)
  })
})
