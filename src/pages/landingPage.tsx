import { Link } from "react-router";
import { useAuth } from "../auth/authProvider";

const LandingPage = () => {
  const { user } = useAuth();
  return (
    <header className="flex items-center justify-between border-b p-3">
      <div>
        <h1 className="text-4xl font-extrabold">Ihsaab</h1>
      </div>

      <Link
        to={user ? "/create-business" : "/auth/sign-up"}
        className="bg-card text-card-foreground rounded-full px-4 py-3 duration-300 hover:scale-105"
      >
        {user ? "Create a new business" : "Get started"}
      </Link>
    </header>
  );
};

export default LandingPage;
