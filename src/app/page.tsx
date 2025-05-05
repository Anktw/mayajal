import { TaskManager } from "@/components/TaskManager"
import { ModeToggle } from "@/components/mode-toggle"
export default function Home() {
  return (
    <div className="min-h-screen py-8">
      <TaskManager />
      <ModeToggle/>
    </div>
  )
}

