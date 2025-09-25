import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Shield, Globe, ArrowLeft, TrendingUp } from "lucide-react";
import { Helmet } from "react-helmet-async";

const Auth: React.FC = () => {
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPwd, setShowPwd] = React.useState(false);
  const mode = searchParams.get("mode") || "signin";

  React.useEffect(() => {
    document.title = mode === "signup" ? "Register Account | MoH" : "Sign In | MoH";
  }, [mode]);

  // Redirect authenticated users to dashboard
  React.useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const onSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    const { error } = await signIn(email, password);
    if (error) {
      toast({ title: "Sign in failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Welcome back", description: "Signed in successfully" });
      navigate("/");
    }
  };

  const onSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    const { error } = await signUp(email, password);
    if (error) {
      toast({ title: "Registration failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Account created", description: "Check your email to confirm your account." });
      navigate("/register");
    }
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <Helmet>
        <title>{mode === "signup" ? "Register Account | MoH" : "Sign In | MoH"}</title>
        <meta name="description" content={mode === "signup" ? "Register for MoH Forecasting Platform" : "Sign in to MoH Forecasting Platform"} />
      </Helmet>

      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 hero-gradient rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Forlab+</h1>
          <p className="text-muted-foreground">Ministry of Health</p>
        </div>

        {/* Auth Card */}
        <Card className="surface">
          <CardContent className="p-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">
                {mode === "signup" ? "Create Account" : "Sign In"}
              </h2>
              <p className="text-muted-foreground text-sm">
                {mode === "signup" 
                  ? "Register your facility to access the platform"
                  : "Enter your credentials to access your dashboard"
                }
              </p>
            </div>

            <form onSubmit={mode === "signup" ? onSignUp : onSignIn} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <Input 
                  name="email" 
                  type="email" 
                  placeholder="your.name@moh.gov.et" 
                  required 
                  className="h-11"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <div className="relative">
                  <Input 
                    name="password" 
                    type={showPwd ? "text" : "password"} 
                    placeholder="••••••••" 
                    required
                    minLength={mode === "signup" ? 6 : undefined}
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-muted-foreground hover:text-foreground"
                  >
                    {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full h-11 hero-gradient">
                {mode === "signup" ? "Create Account" : "Sign In"}
              </Button>
            </form>

            {/* Footer actions */}
            <div className="mt-6 space-y-4">
              {mode === "signin" && (
                <div className="text-center">
                  <Link to="#" className="text-sm text-blue-600 hover:underline">
                    Forgot your password?
                  </Link>
                </div>
              )}

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <select className="bg-transparent text-muted-foreground">
                    <option>English</option>
                    <option>አማርኛ</option>
                  </select>
                </div>
                
                {mode === "signup" ? (
                  <Link to="/auth" className="text-blue-600 hover:underline">
                    Already have an account?
                  </Link>
                ) : (
                  <Link to="/role-registration" className="text-blue-600 hover:underline">
                    Create account
                  </Link>
                )}
              </div>

              {/* Security badge */}
              <div className="pt-4 border-t">
                <Badge variant="secondary" className="w-full justify-center py-2">
                  <Shield className="w-3 h-3 mr-2" />
                  Encrypted & MoH cloud hosted
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back to landing */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
};

export default Auth;