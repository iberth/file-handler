import React, { useEffect } from 'react'
import { Form } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchFileList,
  fetchFilesData,
  setSelectedFile,
} from '../store/slices/filesSlice'

const FileFilter = () => {
  const dispatch = useDispatch()
  const fileList = useSelector((state) => state.files.fileList)
  const selectedFile = useSelector((state) => state.files.selectedFile)

  useEffect(() => {
    dispatch(fetchFileList())
  }, [dispatch])

  const handleChange = (e) => {
    e.preventDefault()

    const value = e.target.value || null

    dispatch(setSelectedFile(value))
    dispatch(fetchFilesData(value))
  }

  return (
    <Form.Select
      className="mb-3"
      style={{ maxWidth: '300px' }}
      value={selectedFile || ''}
      onChange={handleChange}
    >
      <option value="">All files</option>
      {fileList.map((file) => (
        <option key={file} value={file}>
          {file}
        </option>
      ))}
    </Form.Select>
  )
}

export default FileFilter
