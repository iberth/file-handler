import React from 'react'
import { render, screen, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import filesReducer from '../../src/store/slices/filesSlice'
import FilesTable from '../../src/components/FilesTable'

// FileFilter inside FilesTable dispatches fetchFileList on mount — mock fetch to avoid act() warnings
beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({ ok: true, json: () => Promise.resolve({ files: [] }) }),
  )
})

const renderWithStore = (files = [], preloadedState = {}) => {
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
      <FilesTable files={files} />
    </Provider>,
  )
}

describe('FilesTable', () => {
  it('renders table headers', async () => {
    await act(async () => {
      renderWithStore()
    })

    expect(screen.getByText('File Name')).toBeInTheDocument()
    expect(screen.getByText('Text')).toBeInTheDocument()
    expect(screen.getByText('Number')).toBeInTheDocument()
    expect(screen.getByText('Hex')).toBeInTheDocument()
  })

  it('renders a "No files found." row when files is empty', async () => {
    await act(async () => {
      renderWithStore([])
    })

    expect(screen.getByText('No files found.')).toBeInTheDocument()
  })

  it('renders a row for each file entry', async () => {
    const files = [
      {
        file: 'file1.csv',
        text: 'Hello',
        number: 42,
        hex: 'abcdef1234567890abcdef1234567890',
      },
      {
        file: 'file2.csv',
        text: 'World',
        number: 99,
        hex: '1234567890abcdef1234567890abcdef',
      },
    ]

    await act(async () => {
      renderWithStore(files)
    })

    expect(screen.getByText('file1.csv')).toBeInTheDocument()
    expect(screen.getByText('Hello')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
    expect(
      screen.getByText('abcdef1234567890abcdef1234567890'),
    ).toBeInTheDocument()
    expect(screen.getByText('file2.csv')).toBeInTheDocument()
    expect(screen.getByText('World')).toBeInTheDocument()
    expect(screen.getByText('99')).toBeInTheDocument()
  })

  it('renders only the matching number of data rows', async () => {
    const files = [
      {
        file: 'test.csv',
        text: 'abc',
        number: 1,
        hex: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      },
    ]

    await act(async () => {
      renderWithStore(files)
    })

    expect(screen.getByText('test.csv')).toBeInTheDocument()
    expect(screen.queryByText('No files found.')).not.toBeInTheDocument()

    const rows = document.querySelectorAll('tbody tr')

    expect(rows).toHaveLength(1)
  })
})
