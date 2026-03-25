'use client';

import { useState } from 'react';
import Sidebar from '../Sidebar';
import StudentExams from './StudentExams';
import StudentResults from './StudentResults';
import TakeExam from './TakeExam';

export default function StudentDashboard({ previewMode = false, onExitPreview }) {
    const [activePage, setActivePage] = useState('exams');
    const [activeExamId, setActiveExamId] = useState(null);

    const startExam = (examId) => {
        setActiveExamId(examId);
        setActivePage('take-exam');
    };

    const finishExam = () => {
        setActiveExamId(null);
        setActivePage('results');
    };

    // Full-screen exam mode - no sidebar
    if (activePage === 'take-exam' && activeExamId) {
        return <TakeExam examId={activeExamId} onFinish={finishExam} previewMode={previewMode} />;
    }

    return (
        <>
        {previewMode && (
            <div style={{
                position:'fixed', top:0, left:0, right:0, zIndex:1000,
                background:'var(--warning)', color:'#000',
                padding:'10px 20px', display:'flex', alignItems:'center', justifyContent:'space-between',
                fontSize:'0.85rem', fontWeight:600,
            }}>
                <span>👁 Chế độ xem với tư cách Sinh viên — Dữ liệu sẽ không được lưu</span>
                <button onClick={onExitPreview} style={{background:'rgba(0,0,0,0.2)', border:'none', borderRadius:6, padding:'4px 12px', cursor:'pointer', fontWeight:700, fontSize:'0.85rem'}}>
                    ✕ Thoát chế độ xem
                </button>
            </div>
        )}
        <div className="app-layout" style={previewMode ? {paddingTop: 42} : {}}>
            <Sidebar activePage={activePage} setActivePage={setActivePage} role="student" />
            <main className="main-content">
                {activePage === 'results' ? (
                    <StudentResults />
                ) : (
                    <StudentExams onStartExam={startExam} />
                )}
            </main>
        </div>
        </>
    );
}
