import "./App.css";

import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import RequireAuth from "./components/auth/RequireAuth";

import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import Home from "./pages/Home";

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Routes>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          <Route element={<RequireAuth />}>
            <Route path="/" element={<Home />} />
          </Route>
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
