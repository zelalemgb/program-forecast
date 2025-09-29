import Landing from "./Landing";
import PublicLanding from "./PublicLanding";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const Index = () => {
  const { isAuthenticated, loading } = useCurrentUser();
  
  // Show loading state while user data is being fetched
  if (loading) {
    return (
      <main className="container py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>
      </main>
    );
  }
  
  return isAuthenticated ? <Landing /> : <PublicLanding />;
};

export default Index;
