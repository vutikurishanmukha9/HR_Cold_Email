
import React, { useState, useRef, useEffect, DragEvent } from 'react';
import { EmailTemplate } from '../types';

interface EmailComposerProps {
    initialTemplate: EmailTemplate;
    onCompose: (template: EmailTemplate) => void;
    onBack: () => void;
    recipients?: any[];
}

const personalizationTags = ['{fullName}', '{companyName}', '{jobTitle}'];
const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024; // 10MB per attachment
const MAX_SUBJECT_LENGTH = 200;

const EmailComposer: React.FC<EmailComposerProps> = ({ initialTemplate, onCompose, onBack }) => {
    const [subject, setSubject] = useState(initialTemplate.subject);
    const [body, setBody] = useState(initialTemplate.body);
    const [attachments, setAttachments] = useState<File[]>(initialTemplate.attachments || []);
    const editorRef = useRef<HTMLDivElement>(null);
    const [showPlaceholder, setShowPlaceholder] = useState(false);
    const [isDraggingAttachment, setIsDraggingAttachment] = useState(false);
    const [attachmentError, setAttachmentError] = useState<string | null>(null);

    useEffect(() => {
        // Sync state to the editor's DOM, but only if they are different.
        // This is key to prevent cursor jumps during user input.
        if (editorRef.current && body !== editorRef.current.innerHTML) {
            editorRef.current.innerHTML = body;
        }
        // Also, ensure placeholder is correctly shown/hidden based on content.
        if (editorRef.current) {
            setShowPlaceholder(!editorRef.current.innerText.trim() && !editorRef.current.innerHTML.includes('<img'));
        }
    }, [body]);

    const processFiles = (files: FileList) => {
        setAttachmentError(null);
        if (files && files.length > 0) {
            const validFiles: File[] = [];
            const invalidFiles: string[] = [];

            Array.from(files).forEach(file => {
                if (file.size > MAX_ATTACHMENT_SIZE) {
                    invalidFiles.push(`${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
                } else {
                    validFiles.push(file);
                }
            });

            if (invalidFiles.length > 0) {
                setAttachmentError(`The following files exceed the 10MB limit: ${invalidFiles.join(', ')}`);
            }

            if (validFiles.length > 0) {
                setAttachments(prev => [...prev, ...validFiles]);
            }
        }
    };

    const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            processFiles(e.target.files);
        }
        e.target.value = ''; // Reset file input
    };

    const removeAttachment = (fileName: string) => {
        setAttachments(prev => prev.filter(file => file.name !== fileName));
        setAttachmentError(null);
    };

    const handleBodyChange = (e: React.FormEvent<HTMLDivElement>) => {
        const editor = e.currentTarget;
        if (body !== editor.innerHTML) {
            setBody(editor.innerHTML);
        }
    };

    const handleFormat = (command: string, value?: string) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
        if (editorRef.current) {
            setBody(editorRef.current.innerHTML);
        }
    };

    const handleLink = () => {
        const url = prompt('Enter the URL:');
        if (url) {
            handleFormat('createLink', url);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.ctrlKey) {
            if (e.key === 'z') {
                e.preventDefault();
                handleFormat('undo');
            } else if (e.key === 'y') {
                e.preventDefault();
                handleFormat('redo');
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (subject.trim() && body.trim()) {
            onCompose({ subject, body, attachments });
        }
    };

    const handleAttachmentDragEnter = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingAttachment(true);
    };
    const handleAttachmentDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingAttachment(false);
    };
    const handleAttachmentDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };
    const handleAttachmentDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingAttachment(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFiles(e.dataTransfer.files);
            e.dataTransfer.clearData();
        }
    };

    const ToolbarButton: React.FC<{ onClick: () => void; children: React.ReactNode, title: string }> = ({ onClick, children, title }) => (
        <button type="button" title={title} onClick={onClick} onMouseDown={(e) => e.preventDefault()} className="p-2 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            {children}
        </button>
    );

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-700 text-center">Step 3: Compose Your Email</h2>
            <p className="text-center text-gray-500 mt-2">Craft your message. Use personalization tags and add any necessary attachments.</p>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
                            <input
                                id="subject"
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="An interesting opportunity at {companyName}"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                                maxLength={MAX_SUBJECT_LENGTH}
                            />
                            <p className="mt-1 text-xs text-gray-500 text-right">{subject.length}/{MAX_SUBJECT_LENGTH} characters</p>
                        </div>
                        <div>
                            <label htmlFor="body" className="block text-sm font-medium text-gray-700">Email Body</label>
                            <div className="mt-1 border border-gray-300 rounded-md shadow-sm">
                                <div className="flex items-center flex-wrap space-x-1 p-2 bg-gray-50 border-b border-gray-300 rounded-t-md">
                                    <ToolbarButton title="Undo (Ctrl+Z)" onClick={() => handleFormat('undo')}>
                                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 15l-3-3m0 0l3-3m-3 3h8a5 5 0 000-10H9"></path></svg>
                                    </ToolbarButton>
                                    <ToolbarButton title="Redo (Ctrl+Y)" onClick={() => handleFormat('redo')}>
                                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 15l3-3m0 0l-3-3m3 3H5a5 5 0 000 10h6"></path></svg>
                                    </ToolbarButton>
                                    <div className="h-5 w-px bg-gray-300 mx-1"></div>
                                    <ToolbarButton title="Bold" onClick={() => handleFormat('bold')}>
                                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5h6M11 5v14M11 5C8.239 5 6 7.239 6 10s2.239 5 5 5h1"></path></svg>
                                    </ToolbarButton>
                                    <ToolbarButton title="Italic" onClick={() => handleFormat('italic')}>
                                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m4-16l-8 16"></path></svg>
                                    </ToolbarButton>
                                    <ToolbarButton title="Unordered List" onClick={() => handleFormat('insertUnorderedList')}>
                                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                                    </ToolbarButton>
                                    <ToolbarButton title="Ordered List" onClick={() => handleFormat('insertOrderedList')}>
                                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16M4 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"></path></svg>
                                    </ToolbarButton>
                                    <ToolbarButton title="Insert Link" onClick={handleLink}>
                                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656-5.656l-4-4a4 4 0 00-5.656 0l-1.464 1.464"></path></svg>
                                    </ToolbarButton>
                                </div>
                                <div className="relative">
                                    {showPlaceholder && (
                                        <div
                                            aria-hidden="true"
                                            className="absolute top-2 left-3 text-gray-400 pointer-events-none select-none whitespace-pre-wrap"
                                        >
                                            {`Hi {fullName},\n\nI came across your profile as a {jobTitle} at {companyName} and was very impressed.\n\n...`}
                                        </div>
                                    )}
                                    <div
                                        id="body"
                                        ref={editorRef}
                                        contentEditable={true}
                                        onInput={handleBodyChange}
                                        onKeyDown={handleKeyDown}
                                        className="block w-full px-3 py-2 min-h-[250px] focus:outline-none sm:text-sm"
                                    />
                                </div>
                            </div>
                            <p className="mt-1 text-xs text-gray-500 text-right">
                                {editorRef.current ? editorRef.current.innerText.trim().split(/\s+/).filter(w => w.length > 0).length : 0} words
                            </p>
                        </div>
                    </form>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Attachments</label>
                            {attachmentError && <p className="text-sm text-red-600 mt-1">{attachmentError}</p>}
                            <div
                                className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${isDraggingAttachment ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'} border-dashed rounded-md transition-colors duration-200`}
                                onDragEnter={handleAttachmentDragEnter}
                                onDragLeave={handleAttachmentDragLeave}
                                onDragOver={handleAttachmentDragOver}
                                onDrop={handleAttachmentDrop}
                            >
                                <div className="space-y-1 text-center">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <div className="flex text-sm text-gray-600">
                                        <label htmlFor="attachment-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                                            <span>Upload files</span>
                                            <input id="attachment-upload" name="attachment-upload" type="file" className="sr-only" multiple onChange={handleAttachmentChange} />
                                        </label>
                                        <p className="pl-1">or drag and drop</p>
                                    </div>
                                    <p className="text-xs text-gray-500">Resumes, certifications, etc.</p>
                                </div>
                            </div>
                        </div>
                        {attachments.length > 0 && (
                            <div>
                                <h4 className="text-sm font-medium text-gray-700">Attached files:</h4>
                                <ul className="mt-2 border border-gray-200 rounded-md divide-y divide-gray-200">
                                    {attachments.map((file, index) => (
                                        <li key={index} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                                            <div className="w-0 flex-1 flex items-center">
                                                <svg className="flex-shrink-0 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                    <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a3 3 0 006 0V7a1 1 0 112 0v4a5 5 0 01-10 0V7a5 5 0 0110 0v4a1 1 0 11-2 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                                                </svg>
                                                <span className="ml-2 flex-1 w-0 truncate">{file.name}</span>
                                            </div>
                                            <div className="ml-4 flex-shrink-0">
                                                <button onClick={() => removeAttachment(file.name)} className="font-medium text-indigo-600 hover:text-indigo-500">Remove</button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                <aside>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-800">Personalization Tags</h4>
                        <p className="text-sm text-gray-500 mt-1">Click to copy a tag and paste it into your subject or body.</p>
                        <ul className="mt-4 space-y-2">
                            {personalizationTags.map(tag => (
                                <li key={tag}>
                                    <button
                                        onClick={() => navigator.clipboard.writeText(tag)}
                                        className="w-full text-left px-3 py-2 text-sm text-indigo-700 bg-indigo-100 rounded-md hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        {tag}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </aside>
            </div>

            <div className="mt-8 flex justify-between">
                <button
                    type="button"
                    onClick={onBack}
                    className="py-2 px-6 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Back
                </button>
                <button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={!subject.trim() || !body.trim()}
                    className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                    Save & Continue
                </button>
            </div>
        </div>
    );
};

export default EmailComposer;