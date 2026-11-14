const PageWrapper = ({ children }) => (
  <main className="flex min-h-[calc(100vh-var(--header-height))] w-full min-w-0 flex-col p-2 sm:p-3">
    {children}
  </main>
)

export default PageWrapper
