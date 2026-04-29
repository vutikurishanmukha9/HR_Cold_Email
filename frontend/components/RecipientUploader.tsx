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

// Helper to sanitize header strings to camelCase (e.g. "First Name" -> "firstName")
const sanitizeKey = (key: string): string => {
  const cleaned = key.replace(/[^a-zA-Z0-9]/g, ' ').trim();
  return cleaned.split(/\s+/).map((word, index) => {
    if (index === 0) return word.toLowerCase();
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join('');
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

        const parsedRecipients: Recipient[] = json.map((row: any): Recipient => {
          // Find the email using common patterns before sanitization
          const email = findValue(row, ['Email address', 'Email', 'E-mail', 'Contact Email']);
          
          const sanitizedRow: Record<string, any> = {};
          Object.keys(row).forEach(key => {
            const camelKey = sanitizeKey(key);
            if (camelKey) {
              sanitizedRow[camelKey] = String(row[key]).trim();
            }
          });

          return {
            ...sanitizedRow,
            email: email || sanitizedRow.email || '' // explicitly map the email property
          };
        }).filter((r: Recipient) => r.email); // Only require email to be valid

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
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv'))) {
      processFile(file);
    } else {
      setError('Please drop a valid file (.xlsx, .xls, .csv).');
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
          style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(20, 184, 166, 0.15))', border: '1px solid rgba(20, 184, 166, 0.25)' }}>
          <svg className="w-7 h-7" style={{ color: '#34d399' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: '#f1f5f9' }}>Upload Recipients</h2>
        <p style={{ color: '#94a3b8', fontSize: '0.9375rem' }}>Drag and drop or select an Excel file with your contacts</p>
      </div>

      {/* Drop Zone */}
      <div
        className={`relative p-8 rounded-2xl text-center cursor-pointer transition-all duration-300 ${isDragging ? 'scale-105' : ''}`}
        style={{
          background: isDragging ? 'rgba(20, 184, 166, 0.08)' : 'rgba(148, 163, 184, 0.03)',
          border: isDragging ? '2px dashed #14b8a6' : '2px dashed rgba(148, 163, 184, 0.15)',
        }}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-upload')?.click()}
      >
        <div className="flex flex-col items-center gap-4">
          {loading ? (
            <div className="w-12 h-12 border-3 rounded-full animate-spin" style={{ borderColor: '#14b8a6', borderTopColor: 'transparent' }} />
          ) : (
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.15), rgba(16, 185, 129, 0.15))' }}>
              <svg className="w-8 h-8" style={{ color: '#34d399' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
          )}

          <div>
            <p className="font-medium mb-1" style={{ color: '#f1f5f9' }}>
              {fileName ? `📄 ${fileName}` : 'Drop your CSV or Excel file here'}
            </p>
            <p className="text-sm" style={{ color: '#64748b' }}>or click to browse • CSV, XLSX, XLS up to 5MB</p>
          </div>

          <input id="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".xlsx,.xls,.csv" />
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mt-4 p-4 rounded-xl" style={{ background: 'rgba(244, 63, 94, 0.08)', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
          <p className="text-sm flex items-center gap-2" style={{ color: '#fb7185' }}>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        </div>
      )}

      {warning && (
        <div className="mt-4 p-4 rounded-xl" style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
          <p className="text-sm flex items-center gap-2" style={{ color: '#fbbf24' }}>
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

          <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(148, 163, 184, 0.03)', border: '1px solid rgba(148, 163, 184, 0.12)' }}>
            <div className="max-h-64 overflow-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: 'rgba(148, 163, 184, 0.06)' }}>
                    {Object.keys(recipients[0] || {}).slice(0, 5).map((key) => (
                      <th key={key} className="px-4 py-3 text-left text-[10px] font-semibold uppercase" style={{ color: '#64748b', letterSpacing: '0.08em' }}>
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recipients.slice(0, 10).map((recipient, index) => (
                    <tr key={index} className="border-t" style={{ borderColor: 'rgba(148, 163, 184, 0.08)' }}>
                      {Object.keys(recipients[0] || {}).slice(0, 5).map((key) => (
                        <td key={key} className="px-4 py-3 text-sm" style={{ color: key === 'email' ? '#94a3b8' : '#f1f5f9' }}>
                          {recipient[key] || '—'}
                        </td>
                      ))}
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
          className="px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300"
          style={{ border: '1px solid rgba(148, 163, 184, 0.15)', color: '#94a3b8' }}
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={recipients.length === 0}
          className="px-8 py-3 rounded-xl font-semibold text-white text-sm transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)',
            boxShadow: recipients.length === 0 ? 'none' : '0 4px 20px rgba(20, 184, 166, 0.35)'
          }}
        >
          Continue →
        </button>
      </div>
    </div>
  );
};

export default RecipientUploader;