import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="absolute bottom-4 hidden sm:flex">
      <span className="font-semibold text-white">
        Made with ♥ by{" "}
        <Link
          href="https://github.com/kevinakidd"
          className="font-bold text-light-teal-blue"
        >
          KevinK
        </Link>
      </span>
    </footer>
  );
};
