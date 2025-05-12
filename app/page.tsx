import NetworkDiagram from "@/components/network-diagram"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <header className="border-b bg-background px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Network Configuration Manager</h1>
        </div>
      </header>
      <div className="flex-1">
        <NetworkDiagram />
      </div>
    </main>
  )
}
