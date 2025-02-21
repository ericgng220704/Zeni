import Logo from "@/components/Logo";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <section className="hidden w-1/2 justify-center bg-black p-10 lg:flex xl:w-2/5">
        <div className="flex max-h-[800px] max-w-[480px] flex-col justify-center  space-y-4">
          <Logo Clsname="text-white" />
          <div className="space-y-5 text-gray-50">
            <h1 className="text-2xl font-semibold">
              Your money, your journey, your Zeni
            </h1>
            <p className="text-sm text-gray-300">
              Track your expenses, achieve your goals. Zeni makes managing your
              finances easy, efficient, and stress-free.
            </p>
          </div>

          <Image src={"/auth-image.jpg"} alt="Zeni" height={700} width={700} />
        </div>
      </section>

      <section className="flex flex-1 flex-col items-center lg:bg-white bg-black p-4 py-10 lg:justify-center lg:p-10 lg:py-0">
        <div className="mb-16 flex items-center justify-center flex-col lg:hidden">
          <Logo Clsname="text-6xl text-white" />
          <div className="space-y-5 text-center">
            <h1 className="text-xl font-semibold text-gray-50">
              Your money, your journey, your Zeni
            </h1>
            <p className="text-sm text-center text-gray-300">
              Track your expenses, achieve your goals. Zeni makes managing your
              finances easy, efficient, and stress-free.
            </p>
          </div>
        </div>

        {children}
        <Image
          src={"/auth-image.jpg"}
          alt="Zeni"
          height={400}
          width={400}
          className="-mt-48 lg:hidden"
        />
      </section>
    </div>
  );
}
