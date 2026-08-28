import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Import Feature Modules (To be created)
import AcademicAssistance from '../components/features/AcademicAssistance';
import CampusNav from '../components/features/CampusNav';
import Transport from '../components/features/Transport';
import ExamTimetable from '../components/features/ExamTimetable';
import NoticeBoard from '../components/features/NoticeBoard';
import FacultyLocator from '../components/features/FacultyLocator';
import FeedbackCenter from '../components/features/FeedbackCenter';
import InquiryCenter from '../components/features/InquiryCenter';
import LostFound from '../components/features/LostFound';
import RegistrarHub from '../components/features/RegistrarHub';

export const FeatureContext = React.createContext<{
  setCustomBack: (handler: (() => void) | null) => void;
}>({
  setCustomBack: () => {},
});

export default function FeaturePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useAuth();
  
  const [customBack, setCustomBack] = useState<(() => void) | null>(null);

  if (!profile) return null;

  const renderFeature = () => {
    switch (id) {
      case 'academic': return <AcademicAssistance />;
      case 'campus-nav': return <CampusNav />;
      case 'transport': return <Transport />;
      case 'exam': return <ExamTimetable />;
      case 'announcements': return <NoticeBoard />;
      case 'faculty': return <FacultyLocator />;
      case 'feedback': return <FeedbackCenter />;
      case 'inquiry': return <InquiryCenter />;
      case 'lost-found': return <LostFound />;
      case 'registrar': return <RegistrarHub />;
      default: return <div>Feature not found</div>;
    }
  };

  const handleBack = () => {
    if (customBack) {
      customBack();
    } else {
      navigate('/home');
    }
  };

  return (
    <FeatureContext.Provider value={{ setCustomBack }}>
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
        <header className="bg-white border-b border-slate-200 px-8 py-6 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleBack}
              className="p-3 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 active:scale-95 transition-all"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-800 capitalize">{id?.replace('-', ' ')}</h1>
              <p className="text-slate-500 text-sm font-medium">OWL Kiosk Service</p>
            </div>
          </div>

          <button 
            onClick={() => navigate('/home')}
            className="px-6 py-3 bg-blue-600 text-white rounded-2xl flex items-center gap-3 font-bold shadow-lg shadow-blue-100 active:scale-95 transition-all"
          >
            <Home className="w-5 h-5" />
            Return Home
          </button>
        </header>

        <main className="flex-1 p-8">
          <div className="w-full max-w-7xl mx-auto h-full">
            {renderFeature()}
          </div>
        </main>
      </div>
    </FeatureContext.Provider>
  );
}
