import { useEffect } from "react";
import Landing from "./Landing";
import { runBootstrapSuperAdminOnce } from "@/utils/bootstrapSuperAdmin";

const Index = () => {
  useEffect(() => {
    runBootstrapSuperAdminOnce();
  }, []);
  return <Landing />;
};

export default Index;
