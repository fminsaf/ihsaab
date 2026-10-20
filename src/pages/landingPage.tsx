import { Link } from "react-router";

const LandingPage = () => {
  return (
    <header className="flex items-center justify-between border-b p-3">
      <div>
        <h1 className="text-4xl font-extrabold">Ihsaab</h1>
      </div>

      <Link
        to="/auth/sign-up"
        className="bg-card text-card-foreground rounded-full px-4 py-3 duration-300 hover:scale-105"
      >
        Start using for free
      </Link>
    </header>
  );
};

export default LandingPage;
