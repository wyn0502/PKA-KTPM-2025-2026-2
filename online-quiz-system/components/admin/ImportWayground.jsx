'use client';

import { useState, useRef } from 'react';
import { demoApi } from '@/lib/supabase';
import {
    Upload, FileJson, CheckCircle2, AlertCircle, X,
    FileUp, Download, Eye, Trash2
} from 'lucide-react';

export default function ImportWayground({ subjects, onImported, onClose }) {
    const [jsonData, setJsonData] = useState(null);
    const [fileName, setFileName] = useState('');
    const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
    const [difficulty, setDifficulty] = useState('medium');
    const [importing, setImporting] = useState(false);
    const [result, setResult] = useState(null);
    const [preview, setPreview] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.name.endsWith('.json')) {
            setResult({ type: 'error', message: 'Vui lòng chọn file .json' });
            return;
        }

        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                if (!Array.isArray(data)) {
                    setResult({ type: 'error', message: 'File JSON phải chứa một mảng câu hỏi' });
                    return;
                }

                // Validate Wayground format
                const valid = data.every(item =>
                    item.question && item.options && typeof item.options === 'object'
                );

                if (!valid) {
                    setResult({ type: 'error', message: 'Định dạng JSON không đúng với Wayground. Mỗi câu hỏi cần có: question, options, correctAnswer' });
                    return;
                }

                setJsonData(data);
                setResult({ type: 'success', message: `Đọc được ${data.length} câu hỏi từ file` });
            } catch (err) {
                setResult({ type: 'error', message: 'File JSON không hợp lệ: ' + err.message });
            }
        };
        reader.readAsText(file);
    };

    const handlePaste = () => {
        navigator.clipboard.readText().then(text => {
            try {
                const data = JSON.parse(text);
                if (!Array.isArray(data)) {
                    setResult({ type: 'error', message: 'Dữ liệu phải là một mảng câu hỏi' });
                    return;
                }
                setJsonData(data);
                setFileName('clipboard');
                setResult({ type: 'success', message: `Đọc được ${data.length} câu hỏi từ clipboard` });
            } catch (err) {
                setResult({ type: 'error', message: 'Dữ liệu clipboard không phải JSON hợp lệ' });
            }
        }).catch(() => {
            setResult({ type: 'error', message: 'Không thể đọc clipboard. Hãy dùng file thay thế.' });
        });
    };

    const handleImport = () => {
        if (!jsonData || !subjectId) return;
        setImporting(true);

        try {
            let importedCount = 0;

            jsonData.forEach(item => {
                // Convert Wayground format to our format
                const optionEntries = Object.entries(item.options);
                const answers = optionEntries.map(([label, content]) => ({
                    content: content,
                    is_correct: item.correctAnswer === label,
                }));

                demoApi.addQuestion({
                    content: item.question,
                    subject_id: subjectId,
                    difficulty: difficulty,
                    answers: answers,
                });

                importedCount++;
            });

            setResult({
                type: 'success',
                message: `✅ Đã import thành công ${importedCount} câu hỏi!`
            });

            setTimeout(() => {
                onImported();
            }, 1500);
        } catch (err) {
            setResult({ type: 'error', message: 'Lỗi khi import: ' + err.message });
        } finally {
            setImporting(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Upload size={22} style={{ color: 'var(--primary-light)' }} />
                        Import từ Wayground
                    </h2>
                    <button className="modal-close" onClick={onClose}><X size={20} /></button>
                </div>

                <div className="modal-body">
                    {/* Step 1: Select file */}
                    <div style={{
                        border: '2px dashed var(--border-light)',
                        borderRadius: 'var(--radius-md)',
                        padding: '32px 24px',
                        textAlign: 'center',
                        marginBottom: 24,
                        cursor: 'pointer',
                        transition: 'var(--transition)',
                        background: jsonData ? 'rgba(16,185,129,0.05)' : 'var(--bg-input)',
                    }}
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--primary)'; }}
                        onDragLeave={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; }}
                        onDrop={e => {
                            e.preventDefault();
                            e.currentTarget.style.borderColor = 'var(--border-light)';
                            const file = e.dataTransfer.files[0];
                            if (file) {
                                const input = fileInputRef.current;
                                const dt = new DataTransfer();
                                dt.items.add(file);
                                input.files = dt.files;
                                handleFileSelect({ target: input });
                            }
                        }}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".json"
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                        />
                        {jsonData ? (
                            <>
                                <CheckCircle2 size={40} style={{ color: 'var(--success)', marginBottom: 12 }} />
                                <p style={{ fontWeight: 600, color: 'var(--text-heading)', marginBottom: 4 }}>
                                    {fileName}
                                </p>
                                <p style={{ color: 'var(--success)', fontSize: '0.9rem' }}>
                                    {jsonData.length} câu hỏi sẵn sàng import
                                </p>
                            </>
                        ) : (
                            <>
                                <FileJson size={40} style={{ color: 'var(--primary-light)', marginBottom: 12 }} />
                                <p style={{ fontWeight: 600, color: 'var(--text-heading)', marginBottom: 4 }}>
                                    Kéo thả file JSON vào đây
                                </p>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 16 }}>
                                    hoặc click để chọn file từ máy tính
                                </p>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                                    <button className="btn btn-primary btn-sm" onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                                        <FileUp size={16} /> Chọn file JSON
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Status message */}
                    {result && (
                        <div className={`alert ${result.type === 'error' ? 'alert-error' : 'alert-success'}`} style={{ marginBottom: 20 }}>
                            {result.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                            <span>{result.message}</span>
                        </div>
                    )}

                    {/* Step 2: Select subject and difficulty */}
                    {jsonData && (
                        <>
                            <div className="form-row" style={{ marginBottom: 16 }}>
                                <div className="form-group">
                                    <label className="form-label">Môn học</label>
                                    <select className="form-select" value={subjectId} onChange={e => setSubjectId(e.target.value)}>
                                        <option value="">Chọn môn học...</option>
                                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Độ khó (áp dụng cho tất cả)</label>
                                    <select className="form-select" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                                        <option value="easy">Dễ</option>
                                        <option value="medium">Trung bình</option>
                                        <option value="hard">Khó</option>
                                    </select>
                                </div>
                            </div>

                            {/* Preview toggle */}
                            <div style={{ marginBottom: 16 }}>
                                <button className="btn btn-secondary btn-sm" onClick={() => setPreview(!preview)}>
                                    <Eye size={16} /> {preview ? 'Ẩn preview' : `Xem trước ${jsonData.length} câu hỏi`}
                                </button>
                            </div>

                            {preview && (
                                <div style={{
                                    maxHeight: 300, overflowY: 'auto',
                                    border: '1px solid var(--border)', borderRadius: 'var(--radius)',
                                    marginBottom: 16,
                                }}>
                                    {jsonData.map((item, index) => (
                                        <div key={index} style={{
                                            padding: '12px 16px',
                                            borderBottom: index < jsonData.length - 1 ? '1px solid var(--border)' : 'none',
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                                                <span style={{
                                                    fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary-light)',
                                                    background: 'rgba(99,102,241,0.1)', padding: '2px 8px',
                                                    borderRadius: 'var(--radius-full)', flexShrink: 0,
                                                }}>
                                                    {item.id || index + 1}
                                                </span>
                                                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{item.question}</span>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, paddingLeft: 36 }}>
                                                {Object.entries(item.options).map(([label, content]) => (
                                                    <div key={label} style={{
                                                        fontSize: '0.8rem', padding: '3px 8px', borderRadius: 4,
                                                        background: item.correctAnswer === label ? 'rgba(16,185,129,0.08)' : 'transparent',
                                                        color: item.correctAnswer === label ? 'var(--success)' : 'var(--text-muted)',
                                                        display: 'flex', alignItems: 'center', gap: 4,
                                                    }}>
                                                        {item.correctAnswer === label ? <CheckCircle2 size={12} /> : null}
                                                        <strong>{label}.</strong> {content}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* Info */}
                    <div style={{
                        background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)',
                        borderRadius: 'var(--radius)', padding: '12px 16px', fontSize: '0.82rem',
                        color: 'var(--info)', display: 'flex', alignItems: 'flex-start', gap: 10,
                    }}>
                        <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                        <div>
                            <strong>Định dạng Wayground JSON:</strong> Sử dụng Chrome Extension "Wayground Quiz Scraper"
                            để cào dữ liệu từ wayground.com, sau đó import file JSON vào đây.
                            <br />
                            Mỗi câu hỏi gồm: <code style={{ background: 'rgba(0,0,0,0.2)', padding: '1px 4px', borderRadius: 3 }}>
                                question, options (A/B/C/D), correctAnswer
                            </code>
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Hủy</button>
                    <button
                        className="btn btn-primary"
                        disabled={!jsonData || !subjectId || importing}
                        onClick={handleImport}
                    >
                        {importing ? 'Đang import...' : (
                            <><Upload size={18} /> Import {jsonData ? jsonData.length : 0} câu hỏi</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
