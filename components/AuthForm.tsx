import SignIn from "./SignIn";

export default async function AuthForm() {
  return (
    <div className="min-w-[400px] sm:min-w-[500px] mb-48">
      <h1 className="text-4xl text-center lg:text-5xl font-bold mb-6">
        Sign In
      </h1>

      <div className="flex items-center justify-center w-full">
        <SignIn />
      </div>
    </div>
  );
}
