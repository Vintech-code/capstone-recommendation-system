import logo from '@/assets/logo.png'

function SiteFooter() {
  return (
    <footer className="border-t border-outline-variant/30 bg-muted py-12">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-10">
        <div className="grid gap-10 md:grid-cols-3 md:gap-12">
          <div>
            <img
              src={logo}
              alt="Academic guidance system"
              className="h-11 w-auto object-contain"
            />
            <p className="mt-5 max-w-sm text-sm leading-6 text-muted-foreground">
              Guiding Tagoloan Community College students toward academic and
              career paths through interest-based course recommendations.
            </p>
          </div>

          <section aria-labelledby="institutional-footer-title">
            <h2
              id="institutional-footer-title"
              className="font-label text-xs font-medium uppercase tracking-[0.14em] text-primary"
            >
              Institutional
            </h2>
            <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
              <li>About TCC</li>
              <li>Admissions</li>
              <li>Student Services</li>
            </ul>
          </section>

          <section aria-labelledby="support-footer-title">
            <h2
              id="support-footer-title"
              className="font-label text-xs font-medium uppercase tracking-[0.14em] text-primary"
            >
              Support
            </h2>
            <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
              <li>Technical Help</li>
              <li>Privacy Policy</li>
              <li>Contact Counselor</li>
            </ul>
          </section>
        </div>

        <p className="mt-12 border-t border-outline-variant/30 pt-8 text-center font-label text-xs text-muted-foreground">
          &copy; 2026 Tagoloan Community College. Empowering the community through
          quality education.
        </p>
      </div>
    </footer>
  )
}

export { SiteFooter }
