import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Try from './pages/Try'
import SignUp from './pages/SignUp'
import Login from './pages/Login'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/try" element={<Layout><Try /></Layout>} />
        <Route path="/sign-up" element={<Layout><SignUp /></Layout>} />
        <Route path="/login" element={<Layout><Login /></Layout>} />
        {/* Add other routes as needed */}
      </Routes>
    </Router>
  )
}

export default App
