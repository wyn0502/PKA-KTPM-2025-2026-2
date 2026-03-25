'use client';

import { useState } from 'react';
import Sidebar from '../Sidebar';
import AdminHome from './AdminHome';
import SubjectsPage from './SubjectsPage';
import StudentsPage from './StudentsPage';
import QuestionsPage from './QuestionsPage';
import ExamsPage from './ExamsPage';
import GroupsPage from './GroupsPage';
import AdminResultsPage from './AdminResultsPage';
import ExamMonitor from './ExamMonitor';
import SystemSettingsPage from './SystemSettingsPage';
import StudentDashboard from '../student/StudentDashboard';

export default function AdminDashboard() {
    const [activePage, setActivePage] = useState('dashboard');
    const [monitorExamId, setMonitorExamId] = useState(null);
    const [previewMode, setPreviewMode] = useState(false);

    const handleMonitorExam = (examId) => {
        setMonitorExamId(examId);
        setActivePage('monitor');
    };

    const handleBackFromMonitor = () => {
        setMonitorExamId(null);
        setActivePage('exams');
    };

    if (previewMode) {
        return <StudentDashboard previewMode={true} onExitPreview={() => setPreviewMode(false)} />;
    }

    const renderPage = () => {
        switch (activePage) {
            case 'dashboard': return <AdminHome />;
            case 'subjects': return <SubjectsPage />;
            case 'students': return <StudentsPage />;
            case 'questions': return <QuestionsPage />;
            case 'exams': return <ExamsPage onMonitorExam={handleMonitorExam} />;
            case 'groups': return <GroupsPage />;
            case 'results': return <AdminResultsPage />;
            case 'monitor': return <ExamMonitor examId={monitorExamId} onBack={handleBackFromMonitor} />;
            case 'settings': return <SystemSettingsPage />;
            default: return <AdminHome />;
        }
    };

    return (
        <div className="app-layout">
            <Sidebar activePage={activePage} setActivePage={setActivePage} role="admin" onPreviewMode={() => setPreviewMode(true)} />
            <main className="main-content">
                {renderPage()}
            </main>
        </div>
    );
}
