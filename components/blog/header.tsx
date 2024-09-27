import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-white text-black py-4 mb-6">
      <div className="container mx-auto px-6 sm:px-8 lg:px-12 flex items-center justify-between">
        <div className="text-2xl font-bold">My Blog</div>
      </div>
    </header>
  );
}
