import HeaderCompGuest from "./navbar"
import { TaskManagerGuest } from "./TaskManager"
export default function HomePageGuest() {
  return (
    <div className="min-h-screen py-8">
      <HeaderCompGuest/>
      <TaskManagerGuest />
    </div>
  )
}