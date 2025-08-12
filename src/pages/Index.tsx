import { useEffect } from "react";
import Landing from "./Landing";
import PublicLanding from "./PublicLanding";
import { runBootstrapSuperAdminOnce } from "@/utils/bootstrapSuperAdmin";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const { user } = useAuth();
  useEffect(() => {
    if (user) runBootstrapSuperAdminOnce();
  }, [user]);
  return user ? <Landing /> : <PublicLanding />;
};

export default Index;
