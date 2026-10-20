const LandingPage = () => {
  return (
    <div className="mx-auto max-w-7xl p-3">
      <header className="flex items-center justify-between border-b p-5">
        <div>
          <h1 className="text-4xl font-extrabold">Ihsaab</h1>
        </div>

        <a
          href="/auth/sign-up"
          className="bg-card text-card-foreground rounded-full px-4 py-3 duration-300 hover:scale-105"
        >
          Start using for free
        </a>
      </header>
    </div>
  );
};

export default LandingPage;
