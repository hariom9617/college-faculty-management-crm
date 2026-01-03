import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Mail,
  Lock,
  User,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const roles: { value: UserRole; label: string; description: string }[] = [
  { value: "faculty", label: "Faculty", description: "Submit lecture reports" },
  { value: "hod", label: "HOD", description: "Review department reports" },
  { value: "registrar", label: "Registrar", description: "View all reports" },
];

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("faculty");
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const success = await login(email, password, selectedRole);

    if (success) {
      toast({
        title: "Welcome back!",
        description: `Logged in as ${selectedRole}`,
      });
      navigate(`/${selectedRole}`);
    } else {
      toast({
        title: "Login failed",
        description: "No user found with this role. Please check the database.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage: "url('/login-bg.jpeg')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/40 to-black/20" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-24 left-24 w-72 h-72 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="absolute bottom-24 right-24 w-96 h-96 rounded-full bg-cyan-400/10 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-40 rounded-2xl p-3">
              <img src="/RU-Logo.png" alt="RU Logo" className="w-full object-contain"/>
            </div>
            <div>
              <h1 className="font-serif text-4xl font-bold">
                Renaissance University
              </h1>
              <p className="text-white/70">Faculty Management System</p>
            </div>
          </div>

          <div className="space-y-6 max-w-md">
            <h2 className="text-3xl font-serif leading-tight">
              Streamline your academic operations
            </h2>
            <p className="text-lg text-white/80 leading-relaxed">
              Manage lecture reports, track completion rates, and maintain
              academic records with ease.
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-20 h-0 rounded-xl flex items-center justify-center">
              <img src="/RU-Logo.png" alt="RU Logo" className="w-full object-contain"/>
            </div>
            <h1 className="font-serif text-2xl font-bold text-foreground">
              Renaissance University
            </h1>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-serif font-bold text-foreground">
              Welcome Back
            </h2>
            <p className="text-muted-foreground mt-2">
              Sign in to access your dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Select Role</Label>
              <div className="grid grid-cols-3 gap-3">
                {roles.map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setSelectedRole(role.value)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                      selectedRole === role.value
                        ? "border-secondary bg-secondary/5 shadow-glow"
                        : "border-border hover:border-secondary/50"
                    }`}
                  >
                    <div className="flex items-center justify-center mb-2">
                      <User
                        className={`w-6 h-6 ${
                          selectedRole === role.value
                            ? "text-secondary"
                            : "text-muted-foreground"
                        }`}
                      />
                    </div>
                    <p
                      className={`text-sm font-medium text-center ${
                        selectedRole === role.value
                          ? "text-secondary"
                          : "text-foreground"
                      }`}
                    >
                      {role.label}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11 h-12"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 h-12"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Use your email and select your role to login
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}