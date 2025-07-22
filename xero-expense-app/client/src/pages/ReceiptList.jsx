import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from 'react-query'
import { FileText, CheckCircle, Clock, AlertCircle, Eye } from 'lucide-react'
import api from '../services/api'

const ReceiptList = () => {
  const navigate = useNavigate()
  const [selectedReceipt, setSelectedReceipt] = useState(null)

  const { data: receipts, isLoading, error } = useQuery(
    'receipts',
    async () => {
      const response = await api.get('/api/receipts/user/1') // TODO: Get user ID from auth context
      return response.data.receipts
    }
  )

  const getStatusIcon = (status) => {
    switch (status) {
      case 'matched':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'processing':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'matched':
        return 'Matched'
      case 'processing':
        return 'Processing'
      case 'failed':
        return 'Failed'
      case 'manual_review_required':
        return 'Manual Review'
      default:
        return 'Pending'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'matched':
        return 'bg-green-100 text-green-800'
      case 'processing':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'manual_review_required':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading receipts</h3>
          <p className="mt-1 text-sm text-gray-500">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Receipts
            </h1>
            <button
              onClick={() => navigate('/upload')}
              className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
            >
              Upload New Receipt
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {receipts?.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No receipts</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by uploading your first receipt.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => navigate('/upload')}
                  className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
                >
                  Upload Receipt
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {receipts?.map((receipt) => (
                  <li key={receipt.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            {getStatusIcon(receipt.match_status)}
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center">
                              <p className="text-sm font-medium text-gray-900">
                                {receipt.file_name}
                              </p>
                              <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(receipt.match_status)}`}>
                                {getStatusText(receipt.match_status)}
                              </span>
                            </div>
                            <div className="mt-1 flex items-center text-sm text-gray-500">
                              <p>
                                Uploaded {new Date(receipt.upload_timestamp).toLocaleDateString()}
                              </p>
                            </div>
                            {receipt.extracted_data && (
                              <div className="mt-2 text-sm text-gray-500">
                                <p>Merchant: {receipt.extracted_data.merchantName}</p>
                                <p>Amount: ${receipt.extracted_data.total}</p>
                                <p>Date: {new Date(receipt.extracted_data.date).toLocaleDateString()}</p>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedReceipt(receipt)}
                            className="text-primary-600 hover:text-primary-500"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>

      {/* Receipt Detail Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Receipt Details
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">File Name</label>
                  <p className="text-sm text-gray-900">{selectedReceipt.file_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <p className="text-sm text-gray-900">{getStatusText(selectedReceipt.match_status)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Upload Date</label>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedReceipt.upload_timestamp).toLocaleString()}
                  </p>
                </div>
                {selectedReceipt.extracted_data && (
                  <>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Merchant</label>
                      <p className="text-sm text-gray-900">{selectedReceipt.extracted_data.merchantName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Amount</label>
                      <p className="text-sm text-gray-900">${selectedReceipt.extracted_data.total}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Date</label>
                      <p className="text-sm text-gray-900">
                        {new Date(selectedReceipt.extracted_data.date).toLocaleDateString()}
                      </p>
                    </div>
                  </>
                )}
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReceiptList
