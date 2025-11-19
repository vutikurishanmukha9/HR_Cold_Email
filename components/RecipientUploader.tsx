import React, { useState, useCallback, DragEvent } from 'react';
import { Recipient } from '../types';

interface RecipientUploaderProps {
  onUpload: (recipients: Recipient[]) => void;
  onBack: () => void;
}

// Augment the global Window interface for the xlsx library
declare global {
  interface Window {
    XLSX: any;
  }
}

const findValue = (row: any, potentialKeys: string[]): string => {
  const rowKeys = Object.keys(row);
  for (const pKey of potentialKeys) {
    const foundKey = rowKeys.find(rKey => rKey.trim().toLowerCase() === pKey.trim().toLowerCase());
    if (foundKey && row[foundKey] != null) {
      return String(row[foundKey]).trim();
    }
  }
  return '';
};


const RecipientUploader: React.FC<RecipientUploaderProps> = ({ onUpload, onBack }) => {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const processFile = useCallback((file: File) => {
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError(`File size exceeds 5MB limit. Please use a smaller file.`);
      setLoading(false);
      return;
    }

    setLoading(true);
    setFileName(file.name);
    setError(null);
    setWarning(null);
    setRecipients([]);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = window.XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = window.XLSX.utils.sheet_to_json(worksheet);

        const parsedRecipients: Recipient[] = json.map((row: any): Recipient => ({
          fullName: findValue(row, ['Full name', 'Name', 'Last name']),
          email: findValue(row, ['Email address', 'Email']),
          companyName: findValue(row, ['Company/organization name', 'Company', 'Organization']),
          jobTitle: findValue(row, ['Job title/designation', 'Job Title', 'Title', 'Designation']),
        })).filter((r: Recipient) => r.fullName && r.email && r.companyName);

        if (parsedRecipients.length === 0) {
          setError('No valid recipients found. Ensure your Excel file has columns for Name (e.g., "Full name"), Email (e.g., "Email address"), and Company (e.g., "Company").');
        } else {
          // Check for duplicate emails
          const emailSet = new Set<string>();
          const duplicates: string[] = [];
          parsedRecipients.forEach(r => {
            const email = r.email.toLowerCase();
            if (emailSet.has(email)) {
              duplicates.push(email);
            } else {
              emailSet.add(email);
            }
          });

          if (duplicates.length > 0) {
            setWarning(`Found ${duplicates.length} duplicate email(s). Only the first occurrence of each will be used.`);
          }

          // Remove duplicates, keeping first occurrence
          const uniqueRecipients = parsedRecipients.filter((r, index, self) =>
            index === self.findIndex(t => t.email.toLowerCase() === r.email.toLowerCase())
          );

          setRecipients(uniqueRecipients);
        }
      } catch (err) {
        setError('Failed to parse the Excel file. Please ensure it is a valid .xlsx or .xls file.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    reader.onerror = () => {
      setError('Failed to read the file.');
      setLoading(false);
    };
    reader.readAsBinaryString(file);
  }, [MAX_FILE_SIZE]);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      processFile(file);
    } else {
      setError('Please drop a valid Excel file (.xlsx or .xls).');
    }
  };


  const handleSubmit = () => {
    if (recipients.length > 0) {
      onUpload(recipients);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-700 text-center">Step 2: Upload Recipient List</h2>
      <p className="text-center text-gray-500 mt-2">Drag and drop or select an Excel file (.xlsx, .xls) with your contacts.</p>

      <div
        className={`mt-8 flex justify-center px-6 pt-5 pb-6 border-2 ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'} border-dashed rounded-md transition-colors duration-200`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="space-y-1 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="flex text-sm text-gray-600">
            <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
              <span>{fileName ? `File: ${fileName}` : 'Upload a file'}</span>
              <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".xlsx, .xls" />
            </label>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs text-gray-500">XLSX, XLS files only</p>
        </div>
      </div>


      {loading && <p className="text-center mt-4 text-gray-600">Parsing file...</p>}
      {error && <p className="text-center text-red-600 mt-4">{error}</p>}
      {warning && <p className="text-center text-yellow-600 mt-4">{warning}</p>}

      {recipients.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900">{recipients.length} recipients found:</h3>
          <div className="mt-4 overflow-auto max-h-64 border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Title</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recipients.slice(0, 10).map((recipient, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{recipient.fullName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{recipient.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{recipient.companyName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{recipient.jobTitle || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {recipients.length > 10 && <p className="text-sm text-gray-500 mt-2">Showing first 10 of {recipients.length} recipients.</p>}
        </div>
      )}

      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="py-2 px-6 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={recipients.length === 0}
          className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          Save & Continue
        </button>
      </div>
    </div>
  );
};

export default RecipientUploader;