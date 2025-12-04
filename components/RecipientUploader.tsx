import React, { useState, useCallback, DragEvent } from 'react';
import { Recipient } from '../types';

interface RecipientUploaderProps {
  onUpload: (recipients: Recipient[]) => void;
  onBack: () => void;
}

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

  const MAX_FILE_SIZE = 5 * 1024 * 1024;

  const processFile = useCallback((file: File) => {
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
          setError('No valid recipients found. Ensure your file has Name, Email, and Company columns.');
        } else {
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
            setWarning(`Found ${duplicates.length} duplicate email(s). Only the first occurrence will be used.`);
          }

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
    if (file) processFile(file);
  }, [processFile]);

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); };
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
    if (recipients.length > 0) onUpload(recipients);
  };

  return (
    <div className="max-w-4xl mx-auto fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
          style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
          <svg className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Upload Recipients</h2>
        <p className="text-gray-400">Drag and drop or select an Excel file with your contacts</p>
      </div>

      {/* Drop Zone */}
      <div
        className={`relative p-8 rounded-2xl text-center cursor-pointer transition-all duration-300 ${isDragging ? 'scale-105' : ''}`}
        style={{
          background: isDragging ? 'rgba(102, 126, 234, 0.1)' : 'rgba(255,255,255,0.02)',
          border: isDragging ? '2px dashed #667eea' : '2px dashed rgba(255,255,255,0.1)',
        }}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-upload')?.click()}
      >
        <div className="flex flex-col items-center gap-4">
          {loading ? (
            <div className="w-12 h-12 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)' }}>
              <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
          )}

          <div>
            <p className="text-white font-medium mb-1">
              {fileName ? `📄 ${fileName}` : 'Drop your Excel file here'}
            </p>
            <p className="text-gray-500 text-sm">or click to browse • XLSX, XLS up to 5MB</p>
          </div>

          <input id="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".xlsx,.xls" />
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mt-4 p-4 rounded-xl" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
          <p className="text-red-400 text-sm flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        </div>
      )}

      {warning && (
        <div className="mt-4 p-4 rounded-xl" style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
          <p className="text-amber-400 text-sm flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {warning}
          </p>
        </div>
      )}

      {/* Recipients Table */}
      {recipients.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="badge badge-success">{recipients.length}</span>
              Recipients Found
            </h3>
          </div>

          <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="max-h-64 overflow-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Company</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Title</th>
                  </tr>
                </thead>
                <tbody>
                  {recipients.slice(0, 10).map((recipient, index) => (
                    <tr key={index} className="border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                      <td className="px-4 py-3 text-sm text-white font-medium">{recipient.fullName}</td>
                      <td className="px-4 py-3 text-sm text-gray-400">{recipient.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-400">{recipient.companyName}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{recipient.jobTitle || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {recipients.length > 10 && (
            <p className="text-sm text-gray-500 mt-2 text-center">Showing first 10 of {recipients.length} recipients</p>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:bg-white/10"
          style={{ border: '1px solid rgba(255,255,255,0.1)', color: '#a0aec0' }}
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={recipients.length === 0}
          className="px-8 py-3 rounded-xl font-semibold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: recipients.length === 0 ? 'none' : '0 4px 20px rgba(102, 126, 234, 0.4)'
          }}
        >
          Continue →
        </button>
      </div>
    </div>
  );
};

export default RecipientUploader;