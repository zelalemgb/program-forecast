import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

const Auth: React.FC = () => {
  const { signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showPwd, setShowPwd] = React.useState(false);

  React.useEffect(() => {
    document.title = "Sign in or create an account";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Login or register to access your forecasts and manage uploads.");
  }, []);

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


  return (
    <main className="min-h-screen bg-background">
      <header className="container py-10">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Account</h1>
        <p className="text-muted-foreground mt-2">Sign in or create an account to manage your forecast data.</p>
      </header>
      <section className="container pb-10">
        <Card className="max-w-md mx-auto surface">
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
            <CardDescription>Continue with your email</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup" disabled>
                  <span>Sign Up</span>
                  <Badge variant="secondary" className="ml-2">Soon</Badge>
                </TabsTrigger>
              </TabsList>
              <TabsContent value="signin" className="mt-4">
                <form onSubmit={onSignIn} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-sm">Email</label>
                    <Input name="email" type="email" placeholder="you@example.com" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm">Password</label>
                    <div className="relative">
                      <Input name="password" type={showPwd ? "text" : "password"} placeholder="••••••••" required />
                      <button
                        type="button"
                        onClick={() => setShowPwd((v) => !v)}
                        aria-label={showPwd ? "Hide password" : "Show password"}
                        className="absolute inset-y-0 right-0 px-3 flex items-center text-muted-foreground hover:text-foreground"
                      >
                        {showPwd ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full">Sign In</Button>
                </form>
              </TabsContent>
              <TabsContent value="signup" className="mt-4">
                <div className="rounded-md border p-3 text-sm text-muted-foreground">
                  Registration is temporarily disabled. Coming soon.
                </div>
              </TabsContent>
            </Tabs>
            <div className="text-xs text-muted-foreground mt-4">
              By continuing you agree to our terms. <Link to="/" className="underline">Back to dashboard</Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default Auth;
