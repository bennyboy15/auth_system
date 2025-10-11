import FloatingShape from "./components/FloatingShape.jsx"
import {Routes,Route, Navigate} from "react-router-dom"
import SignupPage from "./pages/SignupPage.jsx"
import LoginPage from "./pages/LoginPage.jsx"
import VerifyEmailPage from "./pages/VerifyEmailPage.jsx"
import HomePage from "./pages/HomePage.jsx"
import { Toaster } from "react-hot-toast"
import { useAuthStore } from "./store/authStore.js"
import { useEffect } from "react"
import LoadingSpinner from "./components/LoadingSpinner.jsx"
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx"
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx"

// Protect routes that need authentication to access
function ProtectedRoute({children}) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace/>
  }

  if (!user.isVerified) {
    return <Navigate to="/verify-email" replace/>
  }

  return children;
};

// Redirect already authenticated users to the HOME page
function RedirectAuthenticatedUser({children}) {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user.isVerified) {
    return <Navigate to="/" replace/>
  }
  return children;
};

function App() {

  const { isCheckingAuth, checkAuth, isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    checkAuth();
    console.log(isAuthenticated);
    console.log(user);
  },[checkAuth])

  if (isCheckingAuth) return <LoadingSpinner/>

  return (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 flex items-center justify-center relative overflow-hidden">
      <FloatingShape color="bg-green-500" size="w-64 h-64" top="-5%" left="10%" delay={0}/>
      <FloatingShape color="bg-emerald-500" size="w-48 h-48" top="70%" left="80%" delay={5}/>
      <FloatingShape color="bg-lime-500" size="w-32 h-32" top="40%" left="-10%" delay={2}/>

      <Routes>
        <Route path='/' element={<ProtectedRoute><HomePage/></ProtectedRoute>}/>
        <Route path='/signup' element={<RedirectAuthenticatedUser><SignupPage/></RedirectAuthenticatedUser>}/>
        <Route path='/login' element={<RedirectAuthenticatedUser><LoginPage/></RedirectAuthenticatedUser>}/>
        <Route path='/verify-email' element={<VerifyEmailPage/>}/>
        <Route path='/forgot-password' element={<RedirectAuthenticatedUser><ForgotPasswordPage/></RedirectAuthenticatedUser>}/>
        <Route path='/reset-password/:token' element={<RedirectAuthenticatedUser><ResetPasswordPage/></RedirectAuthenticatedUser>}/>
      </Routes>
      <Toaster/>
    </div>
  )

}

export default App
