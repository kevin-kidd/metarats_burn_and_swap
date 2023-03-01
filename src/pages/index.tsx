import { type NextPage } from "next";
import Head from "next/head";
import { ConnectCard } from "../components/ConnectCard";
import HeroText from "../../public/hero_text.webp";
import background from "../../public/background.webp";
import Image from "next/image";
import { useWalletStore } from "../stores/walletStore";
import { SwapCard } from "../components/SwapCard";

const Home: NextPage = () => {
  const client = useWalletStore((state) => state.client);
  return (
    <>
      <Head>
        <title>MetaRats Burn & Swap</title>
        <meta name="description" content="MetaRats Burn & Swap" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="relative flex min-h-screen flex-col items-center bg-opacity-5 pt-[5%]">
        <Image
          src={background}
          className="absolute top-0 left-0 -z-10 h-full w-full object-cover brightness-50"
          alt=""
        />
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <Image src={HeroText} alt="MetaRats Burn & Swap" className="w-1/2" />
          {client.value ? <SwapCard /> : <ConnectCard />}
        </div>
      </main>
    </>
  );
};

export default Home;
