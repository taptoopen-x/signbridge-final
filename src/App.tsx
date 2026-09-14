import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import FloatingTestButton from './components/FloatingTestButton';
import TestASignModal from './components/TestASignModal';
import { ConversationProvider } from './context/ConversationContext';

import Landing from './pages/Landing';
import SignToText from './pages/SignToText';
import TextToSign from './pages/TextToSign';
import Conversation from './pages/Conversation';
import QuickPhrases from './pages/QuickPhrases';
import LearnISL from './pages/LearnISL';
import About from './pages/About';
import TrainingCenter from './pages/TrainingCenter';

export default function App() {
  const [testOpen, setTestOpen] = useState(false);

  return (
    <ConversationProvider>
      <div className="min-h-screen flex flex-col">

        <Navbar />

        <main className="flex-1 mx-auto w-full max-w-7xl px-4 md:px-6 pt-10">

          <Routes>

            <Route
              path="/"
              element={<Landing />}
            />

            <Route
              path="/sign-to-text"
              element={<SignToText />}
            />

            <Route
              path="/text-to-sign"
              element={<TextToSign />}
            />

            <Route
              path="/conversation"
              element={<Conversation />}
            />

            <Route
              path="/quick-phrases"
              element={<QuickPhrases />}
            />

            <Route
              path="/learn"
              element={<LearnISL />}
            />

            <Route
              path="/about"
              element={<About />}
            />

            {/* Private AI Training Center */}
            <Route
              path="/training"
              element={<TrainingCenter />}
            />

          </Routes>

        </main>

        <Footer />

        <FloatingTestButton
          onClick={() => setTestOpen(true)}
        />

        <TestASignModal
          open={testOpen}
          onClose={() => setTestOpen(false)}
        />

      </div>
    </ConversationProvider>
  );
}