import { useState, type SubmitEvent } from "react";
import { Link } from "react-router";
import { Button } from "../../components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "../../components/ui/field";
import { Input } from "../../components/ui/input";
import { toast } from "../../components/ui/toast";
import supabase from "../../lib/supabase";
import { Eye, EyeOff, UserPlus, Loader2 } from "lucide-react";

const SignUpPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignUp = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password) {
      toast.add({
        description: "Please fill in both email and password fields.",
        type: "error",
      });
      return;
    }

    if (password.length < 8) {
      toast.add({
        description: "Password must be at least 8 characters long.",
        type: "error",
      });
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    setIsSubmitting(false);

    if (error) {
      toast.add({
        description: error.message,
        type: "error",
      });
      return;
    }

    toast.add({
      description: "Account created! Check your inbox to verify your email.",
      type: "success",
    });
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Create an account
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Start doing accounting without doing accounting in minutes.
        </p>
      </div>

      <form onSubmit={handleSignUp}>
        <FieldSet>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="founder@business.com"
              />
              <FieldDescription>
                We'll use this email for your login and audit alerts
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              <FieldDescription>
                Must be at least 8 characters long
              </FieldDescription>
            </Field>
          </FieldGroup>

          <div className="pt-2">
            <Button
              type="submit"
              size="default"
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <UserPlus className="size-4" />
                  <span>Create Account</span>
                </>
              )}
            </Button>
          </div>

          <div className="mt-4 text-center">
            <Link
              to="/auth/sign-in"
              className="text-xs text-muted-foreground underline-offset-4 hover:underline hover:text-foreground"
            >
              Already have an account? <span className="font-semibold text-foreground">Sign in</span>
            </Link>
          </div>
        </FieldSet>
      </form>
    </div>
  );
};

export default SignUpPage;
