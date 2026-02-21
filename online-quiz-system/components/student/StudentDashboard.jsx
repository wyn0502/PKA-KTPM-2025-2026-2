'use client';

import { useState } from 'react';
import Sidebar from '../Sidebar';
import StudentExams from './StudentExams';
import StudentResults from './StudentResults';
import TakeExam from './TakeExam';

export default function StudentDashboard() {
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

    const renderPage = () => {
        switch (activePage) {
            case 'exams': return <StudentExams onStartExam={startExam} />;
            case 'results': return <StudentResults />;
            case 'take-exam': return <TakeExam examId={activeExamId} onFinish={finishExam} />;
            default: return <StudentExams onStartExam={startExam} />;
        }
    };

    if (activePage === 'take-exam' && activeExamId) {
        return <TakeExam examId={activeExamId} onFinish={finishExam} />;
    }

    return (
        <div className="app-layout">
            <Sidebar activePage={activePage} setActivePage={setActivePage} role="student" />
            <main className="main-content">
                {renderPage()}
            </main>
        </div>
    );
}
