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
import { useState, type SubmitEvent } from "react";
import { toast } from "../../components/ui/toast";
import supabase from "../../lib/supabase";

const SignUpPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignUp = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password) {
      toast.add({
        description: "Please fill in both email and password fields.",
        type: "error",
      });
      return;
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      toast.add({
        description: error.message,
        type: "error",
      });
      return;
    }

    toast.add({
      description: "Check your inbox and confirm your email",
      type: "success",
    });

    return;
  };
  return (
    <>
      <h2 className="text-5xl font-extrabold">Create account</h2>

      <form className="w-full max-w-sm" onSubmit={handleSignUp}>
        <FieldSet>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
              />
              <FieldDescription>
                This is the email you will use to sign in to your account.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
              <FieldDescription>
                Must be at least 8 characters long.
              </FieldDescription>
            </Field>
          </FieldGroup>
          <Field orientation="responsive">
            <Button type="submit">Submit</Button>
          </Field>

          <Link
            to="/auth/sign-in"
            className="text-center text-sm underline hover:no-underline"
          >
            Already have an account? Sign in
          </Link>
        </FieldSet>
      </form>
    </>
  );
};

export default SignUpPage;
