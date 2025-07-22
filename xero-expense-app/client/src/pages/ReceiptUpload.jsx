import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { Upload, X, CheckCircle } from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

const ReceiptUpload = () => {
  const [uploading, setUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const navigate = useNavigate()

  const onDrop = useCallback(async (acceptedFiles) => {
    setUploading(true)
    
    for (const file of acceptedFiles) {
      try {
        const formData = new FormData()
        formData.append('receipt', file)
        formData.append('userId', localStorage.getItem('userId') || '1') // TODO: Get from auth context

        const response = await api.post('/api/receipts/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })

        setUploadedFiles(prev => [...prev, {
          name: file.name,
          status: 'uploaded',
          id: response.data.receiptId
        }])

        toast.success(`${file.name} uploaded successfully!`)
      } catch (error) {
        console.error('Upload error:', error)
        setUploadedFiles(prev => [...prev, {
          name: file.name,
          status: 'error',
          error: error.response?.data?.error || 'Upload failed'
        }])
        toast.error(`${file.name} upload failed`)
      }
    }
    
    setUploading(false)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf']
    },
    multiple: true
  })

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Upload Receipts
            </h1>
            <button
              onClick={() => navigate('/')}
              className="text-gray-500 hover:text-gray-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Upload Area */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-300 hover:border-primary-400'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <p className="text-lg font-medium text-gray-900">
                  {isDragActive
                    ? 'Drop the files here...'
                    : 'Drag & drop receipts here, or click to select files'
                  }
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  Supports JPG, PNG, and PDF files up to 10MB
                </p>
              </div>
            </div>
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Processing Receipts...
              </h3>
              <div className="space-y-3">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center space-x-3">
                      {file.status === 'uploaded' ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : file.status === 'error' ? (
                        <X className="h-5 w-5 text-red-500" />
                      ) : (
                        <div className="h-5 w-5 border-2 border-gray-300 rounded-full animate-spin"></div>
                      )}
                      <span className="text-sm font-medium text-gray-900">
                        {file.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {file.status === 'uploaded' && (
                        <span className="text-sm text-green-600">Uploaded</span>
                      )}
                      {file.status === 'error' && (
                        <span className="text-sm text-red-600">{file.error}</span>
                      )}
                      <button
                        onClick={() => removeFile(index)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-blue-900 mb-2">
              How it works
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Upload your receipt images or PDFs</li>
              <li>• Our OCR system will extract key information</li>
              <li>• We'll automatically match receipts to your Xero transactions</li>
              <li>• Receipts will be attached to the corresponding transactions</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ReceiptUpload
