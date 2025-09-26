import Landing from "./Landing";
import PublicLanding from "./PublicLanding";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const { user } = useAuth();
  return user ? <Landing /> : <PublicLanding />;
};

export default Index;
