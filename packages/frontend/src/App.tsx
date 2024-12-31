import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Try from './pages/Try'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/try" element={<Layout><Try /></Layout>} />
        {/* Add other routes as needed */}
      </Routes>
    </Router>
  )
}

export default App
