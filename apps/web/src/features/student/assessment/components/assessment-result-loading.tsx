function AssessmentResultLoading() {
  return (
    <main
      className="grid min-h-[calc(100svh-4rem)] place-items-center px-4 py-12"
      aria-labelledby="assessment-calculation-title"
    >
      <div className="max-w-xl text-center" role="status" aria-live="polite">
        <div className="relative mx-auto size-32 sm:size-36" aria-hidden="true">
          <span className="absolute inset-0 rounded-full border-[10px] border-primary-fixed" />
          <span className="absolute inset-0 animate-spin rounded-full border-[10px] border-transparent border-r-primary border-t-primary motion-reduce:animate-none" />
          <span className="absolute inset-5 animate-[spin_1.4s_linear_infinite_reverse] rounded-full border-[6px] border-transparent border-b-secondary-container border-l-secondary-container motion-reduce:animate-none" />
          <span className="absolute inset-[2.65rem] rounded-full bg-card shadow-[var(--shadow-card)] sm:inset-12" />
        </div>

        <p className="mt-8 text-xs font-bold uppercase tracking-[0.16em] text-primary">
          Assessment complete
        </p>
        <h1
          id="assessment-calculation-title"
          className="mt-3 font-display text-3xl font-bold tracking-[-0.035em] sm:text-4xl"
        >
          Calculating your programme matches
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-muted-foreground">
          We are scoring your recorded RIASEC responses and comparing them with the currently eligible TCC programmes.
        </p>
        <p className="mt-3 text-sm font-medium text-foreground">
          My Matches will open when your result is ready.
        </p>
      </div>
    </main>
  )
}

export { AssessmentResultLoading }
