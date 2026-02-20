import { useState } from 'react'
import './App.css'

type Persona = 'experienced' | 'fresh-grad' | null

function App() {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [selectedPersona, setSelectedPersona] = useState<Persona>(null)
  const [openSection, setOpenSection] = useState<'profile' | 'applications' | 'interview' | null>(null)
  const [selectedItem, setSelectedItem] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {step === 1 ? (
        // STEP 1 — Welcome Screen
        <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center">
          <div className="w-full max-w-6xl mx-auto px-6 py-16 grid gap-10 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] items-center">
            {/* Left column - Text */}
            <div className="flex flex-col items-start">
              {/* Label */}
              <p className="inline-flex items-center rounded-full bg-white/80 px-4 py-1.5 text-sm font-medium text-slate-500 shadow-sm mb-6">
                MockMind · interview prep copilot
              </p>

              {/* Heading - Two lines */}
              <div className="space-y-2">
                <h1 className="text-5xl md:text-6xl font-semibold text-slate-900">
                  Welcome to
                </h1>
                <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-fuchsia-500">
                  MockMind
                </h1>
              </div>

              {/* Subtitle */}
              <p className="mt-8 text-xl md:text-2xl font-medium text-slate-700 max-w-xl leading-relaxed">
                Turn every interview into a prepared opportunity!!
              </p>

              {/* Body text */}
              <p className="mt-4 text-sm md:text-base text-slate-500 max-w-xl">
                AI-powered mock sessions tailored to your interview. Enter the company and role, and start preparing smarter.
              </p>

              {/* Next button */}
              <button
                onClick={() => setStep(2)}
                className="mt-8 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-500/30 hover:shadow-pink-500/40 transition"
              >
                Next
              </button>
            </div>

            {/* Right column - Robot */}
            <div className="flex justify-center md:justify-end">
              <div className="w-72 h-72 md:w-80 md:h-80 rounded-full bg-white flex items-center justify-center shadow-2xl shadow-pink-500/20 border border-slate-200">
                <img 
                  src="/robot1.gif" 
                  alt="MockMind Robot"
                  className="w-40 h-auto object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      ) : step === 2 ? (
        // STEP 2 — Persona Selection Screen
        <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center">
          <div className="max-w-4xl mx-auto px-6 py-16 w-full">
            <div className="space-y-10">
              {/* Heading */}
              <div className="text-center space-y-3">
                <h2 className="text-3xl md:text-4xl font-semibold text-slate-900">
                  Who are you today?
                </h2>
                <p className="text-slate-600 text-sm md:text-base text-center max-w-2xl mx-auto">
                  Select the persona that best describes your current situation to get personalized interview preparation.
                </p>
              </div>

              {/* Cards Container */}
              <div className="grid gap-6 md:grid-cols-2 mt-10">
                {/* Card 1 - Experienced Candidate */}
                <button
                  onClick={() => {
                    setSelectedPersona('experienced');
                    setStep(3);
                  }}
                  className={`cursor-pointer rounded-2xl border p-6 md:p-8 flex flex-col gap-2 shadow-sm hover:shadow-lg transition-transform duration-150 hover:-translate-y-1 text-left ${
                    selectedPersona === 'experienced'
                      ? 'border-pink-500 shadow-pink-500/30 bg-white'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <h3 className={`text-2xl md:text-3xl font-semibold ${
                    selectedPersona === 'experienced' ? 'text-pink-500' : 'text-slate-900'
                  }`}>
                    Exp. Candidate
                  </h3>
                  <p className="text-base md:text-lg text-slate-600 leading-relaxed">
                    3+ years of experience, switching or leveling up.
                  </p>
                </button>

                {/* Card 2 - Fresh Grad */}
                <button
                  onClick={() => {
                    setSelectedPersona('fresh-grad');
                    setStep(3);
                  }}
                  className={`cursor-pointer rounded-2xl border p-6 md:p-8 flex flex-col gap-2 shadow-sm hover:shadow-lg transition-transform duration-150 hover:-translate-y-1 text-left ${
                    selectedPersona === 'fresh-grad'
                      ? 'border-pink-500 shadow-pink-500/30 bg-white'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <h3 className={`text-2xl md:text-3xl font-semibold ${
                    selectedPersona === 'fresh-grad' ? 'text-pink-500' : 'text-slate-900'
                  }`}>
                    Fresh Grad
                  </h3>
                  <p className="text-base md:text-lg text-slate-600 leading-relaxed">
                    Student or recent graduate preparing for internships or first full-time role.
                  </p>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : step === 3 ? (
        // STEP 3 — Workspace Layout
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
          {/* TOP HEADER BAR */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white/95 backdrop-blur">
            <div className="text-lg font-semibold text-slate-900">
              MockMind workspace
            </div>
            <div>
              <span className="rounded-full border border-slate-300 px-4 py-1 text-sm text-slate-700 bg-white">
                {selectedPersona === 'experienced' 
                  ? 'Mode: Exp. Candidate' 
                  : selectedPersona === 'fresh-grad' 
                  ? 'Mode: Fresh Grad' 
                  : 'Mode: Not set'}
              </span>
            </div>
          </div>

          {/* MAIN AREA */}
          <div className="flex flex-1 overflow-hidden">
            {/* LEFT SIDEBAR */}
            <div className="w-72 border-r border-slate-200 bg-white flex flex-col">
              {/* Logo region */}
              <div className="p-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center shadow-lg shadow-pink-500/20">
                  <img 
                    src="/robot.png" 
                    alt="MockMind icon" 
                    className="w-8 h-8 object-contain"
                  />
                </div>
                <span className="font-semibold text-slate-900">MockMind</span>
              </div>

              {/* Navigation Groups */}
              <nav className="px-4 py-2 space-y-2 text-sm flex-1">
                {/* Group 1: Profile */}
                <div>
                  <button
                    onClick={() => setOpenSection(openSection === 'profile' ? null : 'profile')}
                    className="w-full text-left flex items-center justify-between px-3 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <span className="font-medium">Profile</span>
                    <span className={`transform transition-transform ${openSection === 'profile' ? 'rotate-90' : ''}`}>
                      &gt;
                    </span>
                  </button>
                  {openSection === 'profile' && (
                    <div className="pl-6 space-y-1 mt-1">
                      <button
                        onClick={() => setSelectedItem('profile-about')}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          selectedItem === 'profile-about'
                            ? 'bg-pink-500 text-white'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        About Me
                      </button>
                      <button
                        onClick={() => setSelectedItem('profile-resume')}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          selectedItem === 'profile-resume'
                            ? 'bg-pink-500 text-white'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        Resume
                      </button>
                    </div>
                  )}
                </div>

                {/* Group 2: Applications */}
                <div>
                  <button
                    onClick={() => setOpenSection(openSection === 'applications' ? null : 'applications')}
                    className="w-full text-left flex items-center justify-between px-3 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <span className="font-medium">Applications</span>
                    <span className={`transform transition-transform ${openSection === 'applications' ? 'rotate-90' : ''}`}>
                      &gt;
                    </span>
                  </button>
                  {openSection === 'applications' && (
                    <div className="pl-6 space-y-1 mt-1">
                      <button
                        onClick={() => setSelectedItem('applications-all')}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          selectedItem === 'applications-all'
                            ? 'bg-pink-500 text-white'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        All Applications
                      </button>
                      <button
                        onClick={() => setSelectedItem('applications-add')}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          selectedItem === 'applications-add'
                            ? 'bg-pink-500 text-white'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        Add Application
                      </button>
                    </div>
                  )}
                </div>

                {/* Group 3: Interview Prep */}
                <div>
                  <button
                    onClick={() => setOpenSection(openSection === 'interview' ? null : 'interview')}
                    className="w-full text-left flex items-center justify-between px-3 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <span className="font-medium">Interview Prep</span>
                    <span className={`transform transition-transform ${openSection === 'interview' ? 'rotate-90' : ''}`}>
                      &gt;
                    </span>
                  </button>
                  {openSection === 'interview' && (
                    <div className="pl-6 space-y-1 mt-1">
                      <button
                        onClick={() => setSelectedItem('interview-technical')}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          selectedItem === 'interview-technical'
                            ? 'bg-pink-500 text-white'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        Technical
                      </button>
                      <button
                        onClick={() => setSelectedItem('interview-coding')}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          selectedItem === 'interview-coding'
                            ? 'bg-pink-500 text-white'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        Coding
                      </button>
                      <button
                        onClick={() => setSelectedItem('interview-behavioural')}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          selectedItem === 'interview-behavioural'
                            ? 'bg-pink-500 text-white'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        Behavioural
                      </button>
                    </div>
                  )}
                </div>
              </nav>
            </div>

            {/* RIGHT CONTENT AREA */}
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
                {/* Heading */}
                <div>
                  <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-2">
                    Welcome to your MockMind workspace
                  </h2>
                  <p className="text-slate-600 text-sm">
                    This area will show profile, applications, and interview prep details based on what is selected in the sidebar.
                  </p>
                </div>

                {/* Selected Item Indicator */}
                {selectedItem && (
                  <p className="text-slate-600 text-sm">
                    You're viewing: {openSection} → {selectedItem.split('-')[1] || selectedItem}
                  </p>
                )}

                {/* Content Sections */}
                <div className="space-y-6">
                  {/* Section 1 */}
                  <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
                    <h3 className="font-medium text-slate-900 mb-2">
                      Finish setting up your profile
                    </h3>
                    <p className="text-slate-600 text-sm">
                      Complete your personal information and upload your resume to get started with personalized interview preparation.
                    </p>
                  </div>

                  {/* Section 2 */}
                  <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
                    <h3 className="font-medium text-slate-900 mb-2">
                      Applications overview (coming soon)
                    </h3>
                    <p className="text-slate-600 text-sm">
                      Track your job applications and manage company interviews in one place.
                    </p>
                  </div>

                  {/* Section 3 */}
                  <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
                    <h3 className="font-medium text-slate-900 mb-2">
                      Interview prep (handled by your teammates)
                    </h3>
                    <p className="text-slate-600 text-sm">
                      Access technical, coding, and behavioural interview preparation resources tailored to your selected persona.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default App
