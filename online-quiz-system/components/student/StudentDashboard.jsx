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

    // Full-screen exam mode - no sidebar
    if (activePage === 'take-exam' && activeExamId) {
        return <TakeExam examId={activeExamId} onFinish={finishExam} />;
    }

    return (
        <div className="app-layout">
            <Sidebar activePage={activePage} setActivePage={setActivePage} role="student" />
            <main className="main-content">
                {activePage === 'results' ? (
                    <StudentResults />
                ) : (
                    <StudentExams onStartExam={startExam} />
                )}
            </main>
        </div>
    );
}
