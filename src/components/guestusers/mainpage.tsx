import { TaskManagerGuest } from "./TaskManager"

export default function HomePageGuest() {
  return (
    <div className="min-h-screen bg-black">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
      
      {/* Main container */}
      <div className="relative">
        {/* Header */}
        <div className="pt-24 pb-16 px-6">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">
              LockedIn
            </h1>
          </div>
        </div>

        {/* Task Manager Container */}
        <div className="px-6 pb-24">
          <div className="max-w-6xl mx-auto">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg backdrop-blur-sm">
              <TaskManagerGuest />
            </div>
          </div>
        </div>
      </div>

      {/* Subtle bottom fade */}
      <div className="fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"></div>
    </div>
  )
}