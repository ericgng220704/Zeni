import Spline from "@splinetool/react-spline";

export default function ChatBot() {
  return (
    <main className="h-[400px] w-[210px] rounded-xl relative">
      {/* <Spline scene="https://prod.spline.design/Q7OTv5sL8nl9ws-x/scene.splinecode" /> */}
      <Spline
        scene="https://prod.spline.design/rQzFFoqq8tvh3g0Q/scene.splinecode"
        className="z-50 absolute -top-[4.25rem] -left-1 sm:-top-12 sm:left-[0.1rem]"
      />
    </main>
  );
}
