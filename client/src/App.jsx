import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router";

import Form from "./components/Form/Form";
import Home from "./components/Home/Home";
import Navbar from "./components/Navbar/Navbar";
import Spinner from "./components/ui/Spinner";
import Toaster from "./components/ui/Toaster";

const Auth = lazy(() => import("./components/Auth/Auth"));

const App = () => (
  <>
    <Navbar />
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <Suspense fallback={<Spinner className="mx-auto mt-24 size-6" />}>
        <Routes>
          <Route index element={<Home />} />
          <Route path="auth" element={<Auth />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </main>
    <Form />
    <Toaster />
  </>
);

export default App;
