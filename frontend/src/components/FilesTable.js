import React, { useEffect } from 'react'
import { Table, Spinner, Alert } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { fetchFilesData } from '../store/slices/filesSlice'
import FileFilter from './FileFilter'

const FilesTable = ({ files }) => {
  return (
    <>
      <FileFilter />
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>File Name</th>
            <th>Text</th>
            <th>Number</th>
            <th>Hex</th>
          </tr>
        </thead>
        <tbody>
          {files.map((item, idx) => (
            <tr key={idx}>
              <td>{item.file}</td>
              <td>{item.text}</td>
              <td>{item.number}</td>
              <td>{item.hex}</td>
            </tr>
          ))}

          {!files.length && (
            <tr>
              <td colSpan={4}>No files found.</td>
            </tr>
          )}
        </tbody>
      </Table>
    </>
  )
}

export default FilesTable
