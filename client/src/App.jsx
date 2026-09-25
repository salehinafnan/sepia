import { Suspense, lazy, useLayoutEffect } from "react";
import { Link, Navigate, Route, Routes, useLocation } from "react-router";

import Form from "./components/Form/Form";
import Home from "./components/Home/Home";
import Navbar from "./components/Navbar/Navbar";
import Spinner from "./components/ui/Spinner";
import Toaster from "./components/ui/Toaster";

const Auth = lazy(() => import("./components/Auth/Auth"));
const Privacy = lazy(() => import("./components/Privacy/Privacy"));

const App = () => {
  const { pathname } = useLocation();

  // The router doesn't reset scrolling, so start each page at the top.
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <Suspense fallback={<Spinner className="mx-auto mt-24 size-6" />}>
          <Routes>
            <Route index element={<Home />} />
            <Route path="auth" element={<Auth />} />
            <Route path="privacy" element={<Privacy />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      <footer className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="border-t border-stone-200 py-6 text-sm text-stone-500 dark:border-stone-800 dark:text-stone-400">
          <Link
            to="/privacy"
            className="rounded outline-offset-4 hover:text-stone-900 focus-visible:outline-2 focus-visible:outline-sepia-500 dark:hover:text-stone-100"
          >
            Privacy
          </Link>
        </div>
      </footer>
      <Form />
      <Toaster />
    </>
  );
};

export default App;
