import { useState, useCallback } from 'react'
import './App.css'
import Navbar from './components/Navbar'
import Notification from './components/Notification'
import HomePage from './components/HomePage'
import LoadingPage from './components/LoadingPage'
import BgVisual from './components/BgVisual'
import ResultPage from './components/ResultPage'
import ResultDetails from './components/ResultDetails'

import { useAnalysis } from './hooks/useAnalysis'
import { MOCK_RESULT } from './data/testResult'

function App() {
  const [page, setPage] = useState('home')

  const [noti, setNoti] = useState({ msg: null, type: 'info' })

  const showNoti = useCallback((msg, type = 'info') => {
    setNoti({ msg, type })
  }, [])

  const closeNoti = useCallback(() => {
    setNoti({ msg: null, type: 'info' })
  }, [])

  const { error, result, analyze } = useAnalysis()

  async function handleGenerate(gene, variant, medication, alleles) {
    setPage('loading')
    const analysisResult = await analyze(gene, variant, medication, alleles)

    if (analysisResult){
      if (analysisResult.in_training_data === false) {
        setPage('home')
        showNoti('This combination was not found in the training data. No result available.', 'error')
      } else {
        setPage('result')
      }
    } else {
      setPage('home')
      showNoti(error || 'Try again', 'error')
    }
  }

  function BackButton({ label, target }) {
    return (
      <button 
        onClick={() => setPage(target)}
        style={{
          background: "transparent",
          border: "1px solid var(--cyan)",
          fontFamily: "var(--font-mono)",
          fontSize: 16,
          color: "var(--text-color)",
          padding: '6px 16px',
          borderRadius: 5,
          cursor: "pointer"
        }}>
          {label}
      </button>
    )
  }

  return (
   <>
      <Navbar action={
        page === 'result' ? <BackButton label="New run" target="home" />:
        page === 'detail' ? <BackButton label="Back" target="result" />:
        undefined
      }/>

      <BgVisual />

      {page === 'home' && (
        <HomePage
          onGenerate={handleGenerate}
          showNoti={showNoti} />
      )}

      {page === 'loading' && (
        <LoadingPage />
      )}

      {page === 'result' && result && (
        <ResultPage
          result={result}
          onNavigate={setPage}/>
      )}

      {page === 'detail' && result && (
        <ResultDetails 
          result={result}
          onBack={() => setPage('result')}/>
      )}

      <Notification
        msg={noti.msg}
        type={noti.type}
        onClose={closeNoti}
      />
    </>
  )
}

export default App
