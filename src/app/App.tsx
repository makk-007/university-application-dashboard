import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { CycleProvider } from "./context/CycleContext";
import { UndoableDeleteProvider } from "./context/UndoableDeleteContext";
import { Toaster } from "./components/ui/sonner";
import { ErrorBoundary } from "./components/ErrorBoundary";

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <CycleProvider>
            <UndoableDeleteProvider>
              <RouterProvider router={router} />
              <Toaster richColors closeButton />
            </UndoableDeleteProvider>
          </CycleProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
