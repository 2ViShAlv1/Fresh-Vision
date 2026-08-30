import { useCallback, useEffect, useRef, useState } from 'react'
import NavBar from './components/NavBar'
import Hero from './components/Hero'
import Dropzone from './components/Dropzone'
import ResultPanel from './components/ResultPanel'
import { Coverage, Faq, Footer, HowItWorks } from './components/Sections'
import { checkHealth, fetchClasses, predict } from './lib/api'

export default function App() {
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [health, setHealth] = useState({ state: 'loading', message: '' })
  const [classes, setClasses] = useState(null)

  const analyzeRef = useRef(null)
  const abortRef = useRef(null)
  const objectUrlRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    checkHealth()
      .then(() => {
        if (cancelled) return
        setHealth({ state: 'ready', message: 'Models loaded' })
        return fetchClasses().then((data) => !cancelled && setClasses(data))
      })
      .catch((err) => {
        if (!cancelled) setHealth({ state: 'error', message: err.message })
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Revoke the previous object URL whenever the selection changes or unmounts.
  useEffect(() => () => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    abortRef.current?.abort()
  }, [])

  const setSelection = useCallback((nextFile) => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    const url = URL.createObjectURL(nextFile)
    objectUrlRef.current = url
    setFile(nextFile)
    setPreviewUrl(url)
    setResult(null)
    setError(null)
  }, [])

  const clearSelection = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    objectUrlRef.current = null
    setFile(null)
    setPreviewUrl(null)
    setResult(null)
    setError(null)
    setLoading(false)
  }, [])

  const runAnalysis = useCallback(
    async (target) => {
      const subject = target || file
      if (!subject) return
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      setLoading(true)
      setError(null)
      setResult(null)
      try {
        const data = await predict(subject, controller.signal)
        if (controller.signal.aborted) return
        setResult(data)
      } catch (err) {
        if (err.name === 'AbortError') return
        setError(err.message || 'Something went wrong while analyzing the image.')
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    },
    [file],
  )

  // Auto-run as soon as a valid image is chosen.
  const handleFile = useCallback(
    (nextFile) => {
      setSelection(nextFile)
      runAnalysis(nextFile)
    },
    [runAnalysis, setSelection],
  )

  const scrollToAnalyzer = () => {
    analyzeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="app">
      <NavBar health={health} />
      <main>
        <Hero onCta={scrollToAnalyzer} />

        <section className="section analyzer" id="analyze" ref={analyzeRef}>
          <div className="section__head section__head--left">
            <span className="eyebrow">Analyzer</span>
            <h2>Upload · analyze · decide</h2>
            <p>Drop an image below. Analysis starts automatically and takes about a second.</p>
          </div>

          {health.state === 'error' ? (
            <div className="banner banner--error">
              <strong>Backend unreachable.</strong>
              <span>{health.message} — start the API with <code>uvicorn backend.main:app --port 8010</code>.</span>
            </div>
          ) : null}

          <div className="analyzer__grid">
            <div className="card card--upload">
              <Dropzone
                onFile={handleFile}
                onClear={clearSelection}
                disabled={loading}
                file={file}
                previewUrl={previewUrl}
              />
              <button
                className="btn btn--primary btn--block"
                onClick={() => runAnalysis()}
                disabled={!file || loading}
              >
                {loading ? 'Analyzing…' : result ? 'Re-run analysis' : 'Analyze image'}
              </button>
            </div>

            <div className="card card--result">
              <ResultPanel
                result={result}
                loading={loading}
                error={error}
                onRetry={file ? () => runAnalysis() : null}
              />
            </div>
          </div>
        </section>

        <HowItWorks />
        <Coverage classes={classes} />
        <Faq />
      </main>
      <Footer />
    </div>
  )
}
