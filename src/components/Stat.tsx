import classNames from "classnames";
import { useTotalBurned } from "../hooks/useTotalBurned";

export const Stat = () => {
  const { data: totalBurned, isLoading, isError } = useTotalBurned();
  return (
    <div
      className={classNames(
        "absolute right-5 bottom-5 rounded-md border-2 border-teal-blue bg-dark-blue/80 backdrop-blur",
        "flex w-fit flex-row items-center justify-center gap-2 px-4 py-3 text-white"
      )}
    >
      <div className="text-xl font-bold text-light-teal-blue">
        {isLoading ? "..." : isError ? "?" : totalBurned}
      </div>
      <div className="text-lg font-bold">Swapped</div>
    </div>
  );
};
