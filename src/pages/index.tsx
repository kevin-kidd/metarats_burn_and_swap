import { type NextPage } from "next";
import Head from "next/head";
import { ConnectCard } from "../components/ConnectCard";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>MetaRats Burn & Swap</title>
        <meta name="description" content="MetaRats Burn & Swap" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <ConnectCard />
        </div>
      </main>
    </>
  );
};

export default Home;
