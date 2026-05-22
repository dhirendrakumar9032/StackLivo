import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/entities/auth/model/AuthContext";
import { ProjectsProvider } from "@/entities/project/model/ProjectsContext";

export default function AppProviders({ children }) {
  return (
    <AuthProvider>
      <ProjectsProvider>
        <BrowserRouter>{children}</BrowserRouter>
      </ProjectsProvider>
    </AuthProvider>
  );
}
