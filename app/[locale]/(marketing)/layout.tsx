export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 md:px-6">
        {children}
      </div>
    </div>
  )
} 