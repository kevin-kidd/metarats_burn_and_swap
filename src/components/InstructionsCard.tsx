import classNames from "classnames";

export const InstructionsCard = () => {
  return (
    <div
      className={classNames(
        "rounded-md border-2 border-teal-blue bg-dark-blue/80 backdrop-blur",
        "flex w-full max-w-md flex-col items-center justify-center gap-3 px-6 py-4 text-white"
      )}
    >
      <h2 className="text-2xl font-semibold">Instructions</h2>
      <ul className="list-decimal px-4">
        <li>Ensure you are connected to the wallet containing your MetaRats</li>
        <li>
          Click *Begin Swapping* and accept the Keplr popup to burn your Rats
        </li>
        <li>
          Wait for your MetaRats to burn and your newly minted MetaRats on
          Stargaze will appear shortly after.
        </li>
      </ul>
    </div>
  );
};
