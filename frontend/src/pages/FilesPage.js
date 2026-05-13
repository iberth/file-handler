import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Spinner, Alert } from 'react-bootstrap'

import FilesTable from '../components/FilesTable'
import { fetchFilesData } from '../store/slices/filesSlice'

const FilesPage = () => {
  const dispatch = useDispatch()
  const { rows, loading, error } = useSelector((state) => state.files)

  useEffect(() => {
    dispatch(fetchFilesData(null))
  }, [dispatch])

  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    )
  }

  return error ? (
    <Alert variant="danger">Error loading data: {error}</Alert>
  ) : (
    <FilesTable files={rows} />
  )
}

export default FilesPage
