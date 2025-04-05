
import './App.css'
import EditorLayout from './components/layout/EditorLayout'
import { AppProvider } from './contexts/AppProvider'

function App() {
  return (
    <AppProvider>
      <EditorLayout />
    </AppProvider>
  )
}

export default App
