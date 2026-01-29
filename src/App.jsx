import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import ProjectGanttTaskReact from './pages/ProjectGanttTaskReact'


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <ProjectGanttTaskReact />
    </>
  )
}

export default App
