function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-12 text-center">
        <h1 className="text-3xl font-bold text-slate-900">XCS Writer Demo</h1>
        <p className="text-slate-600">
          Project scaffolding is in place. Phrase/icon selection and the{' '}
          <code className="rounded bg-slate-200 px-1 py-0.5">.xcs</code> export flow are coming in
          the next stages — see{' '}
          <a
            href="https://github.com/RichardMcQuiston01/unofficial-xcs-writer-demo/blob/dev/ROADMAP.md"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-indigo-600 hover:underline"
          >
            ROADMAP.md
          </a>
          .
        </p>
      </div>
    </div>
  )
}

export default App
