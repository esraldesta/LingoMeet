import "./App.css";
import { ThemeProvider } from "./components/theme-provider";
import Home from "./pages/Home";
import Layout from "./pages/Layout";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
// import ProtectedRoute from "./components/ProtectedRoute";
import Signin from "./pages/Signin";
import Logout from "./pages/Logout";
import { AnimatePresence } from "framer-motion";

import Settings from "./pages/Settings";
import Support from "./pages/Support";
import NotFound from "./pages/NotFound";
import Call from "./pages/Call";
// import { ConnectionState } from './components/ConnectionState';
import { ConnectionManager } from './components/ConnectionManager';
import { GroupProvider } from "./context/GroupContext";
// import { Events } from "./components/Events";
// import { MyForm } from './components/MyForm';
function App() {

  return (
    <>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <AuthProvider>
          <GroupProvider>
          <AnimatePresence mode="wait">
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="/home" element={<Home />} />
                  <Route path="/call/:id" element={<Call />} />
                  <Route path="/signin" element={<Signin />} />
                  <Route path="/signout" element={<Logout />} />
                  <Route path="/conn" element={<ConnectionManager />} />
                  {/* <Route
                    path="/equbes"
                    element={
                      <ProtectedRoute>
                        <ListEqubes />
                      </ProtectedRoute>
                    }
                  /> */}

                  <Route path="/settings" element={<Settings />} />
                  <Route path="/support" element={<Support />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </AnimatePresence>
          </GroupProvider>
        </AuthProvider>
      </ThemeProvider>
    </>
  );
}

export default App;
