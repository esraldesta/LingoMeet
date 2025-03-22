import "./App.css";
import { ThemeProvider } from "./components/theme-provider";
import Home from "@/pages/Home";
import Layout from "./pages/Layout";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import Settings from "./pages/Settings";
import Support from "./pages/Support";
import NotFound from "./pages/NotFound";
import Call from "@/pages/Call";
import { ConnectionManager } from "@/components/ConnectionManager";
import { GroupProvider } from "@/context/GroupContext";
import { Providers } from "./providers";
import { FloatingWindow } from "./components/call/floating-window";
import SignIn from "./pages/SignIn";

function App() {
  return (
    <>
      <Providers>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <GroupProvider>
            <AnimatePresence mode="wait">
              <BrowserRouter>
                <FloatingWindow />
                <Routes>
                  <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/group/:id" element={<Call />} />
                    <Route path="/conn" element={<ConnectionManager />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/support" element={<Support />} />
                    <Route path="/sign-in" element={<SignIn />} />
                    {/* <Route path="/register" element={<Register />} /> */}
                    <Route path="*" element={<NotFound />} />
                  </Route>
                </Routes>
              </BrowserRouter>
            </AnimatePresence>
          </GroupProvider>
        </ThemeProvider>
      </Providers>
    </>
  );
}

export default App;
