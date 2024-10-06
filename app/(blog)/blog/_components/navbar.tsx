import Link from "next/link";

export function Navbar() {
  return (
    <nav className="shadow-md ">
      <div className="container mx-auto px-4">
        <div className="flex bg-white justify-between items-center py-4">
          <Link href="/" className="text-xl font-bold text-white text-gray-800">
            <div className="text-black">My Blog</div>
          </Link>
          <ul className="flex text-black space-x-4">
            <li>
              <Link href="/blog" className="text-black hover:text-gray-800">
                Blog
              </Link>
            </li>
            <li>
              <Link href="/login" className="text-black hover:text-gray-800">
                Login
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
