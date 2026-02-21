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

export default function AdminDashboard() {
    const [activePage, setActivePage] = useState('dashboard');

    const renderPage = () => {
        switch (activePage) {
            case 'dashboard': return <AdminHome />;
            case 'subjects': return <SubjectsPage />;
            case 'students': return <StudentsPage />;
            case 'questions': return <QuestionsPage />;
            case 'exams': return <ExamsPage />;
            case 'groups': return <GroupsPage />;
            case 'results': return <AdminResultsPage />;
            default: return <AdminHome />;
        }
    };

    return (
        <div className="app-layout">
            <Sidebar activePage={activePage} setActivePage={setActivePage} role="admin" />
            <main className="main-content">
                {renderPage()}
            </main>
        </div>
    );
}
