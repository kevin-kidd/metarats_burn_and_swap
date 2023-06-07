import { type NextPage } from "next";
import Head from "next/head";
import { ConnectCard } from "../components/ConnectCard";
import HeroText from "../../public/hero_text.webp";
import background from "../../public/background.webp";
import Image from "next/image";
import { useWalletStore } from "../stores/walletStore";
import { SwapCard } from "../components/SwapCard";
import loadingAnimation from "../../public/loading.webp";
import { useEffect, useState } from "react";
import { Transition } from "@headlessui/react";
import { Stat } from "../components/Stat";
import { Footer } from "../components/Footer";

const Home: NextPage = () => {
  const client = useWalletStore((state) => state.client);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    // Wait 2 seconds then setIsLoading to false
    setTimeout(() => {
      setIsLoading(false);
    }, 2250);
  }, []);
  return (
    <>
      <Head>
        <title>MetaRats Burn & Swap</title>
        <meta name="description" content="MetaRats Burn & Swap" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Transition
        show={isLoading}
        enter="transition-opacity duration-75"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-150"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="absolute top-0 left-0 z-50 flex h-screen w-screen items-center justify-center bg-black object-cover">
          <Image
            src={loadingAnimation}
            height="250"
            width="250"
            alt="..."
            className="h-32 w-auto"
          />
        </div>
      </Transition>

      <main className="relative flex h-full min-h-screen flex-col items-center bg-opacity-5">
        <Stat />
        <Image
          src={background}
          className="absolute top-0 left-0 -z-10 h-full w-full object-cover brightness-50"
          alt=""
        />
        <div className="container flex h-[80vh] flex-col items-center gap-4 px-4 py-16">
          <Image
            src={HeroText}
            alt="MetaRats Burn & Swap"
            className="w-full sm:w-1/2"
          />
          <div className="flex h-full flex-col items-center justify-center gap-8">
            {client.value ? <SwapCard /> : <ConnectCard />}
          </div>
        </div>
        <Footer />
      </main>
    </>
  );
};

export default Home;
