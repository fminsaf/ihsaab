import { Outlet } from "react-router";

const AuthLayout = () => {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-10">
      <h1 className="text-3xl font-bold">Ihsaab</h1>

      <Outlet />
    </div>
  );
};

export default AuthLayout;
