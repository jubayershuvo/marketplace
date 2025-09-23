import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-10 grid md:grid-cols-4 gap-8">
        {/* About */}
        <div>
          <h2 className="font-bold text-lg mb-3">WorkHub</h2>
          <p className="text-sm">
            Your marketplace for freelancers and businesses. Connect, hire, and
            work smarter.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h2 className="font-bold mb-3">Quick Links</h2>
          <ul className="space-y-2">
            <li>
              <Link href="/gigs" className="hover:text-green-600">
                Browse Gigs
              </Link>
            </li>
            <li>
              <Link href="/freelancers" className="hover:text-green-600">
                Find Freelancers
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-green-600">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-green-600">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h2 className="font-bold mb-3">Support</h2>
          <ul className="space-y-2">
            <li>
              <Link href="/help" className="hover:text-green-600">
                Help Center
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-green-600">
                Terms & Conditions
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-green-600">
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h2 className="font-bold mb-3">Stay Updated</h2>
          <form className="flex gap-2">
            <input
              type="email"
              placeholder="Your email"
              className="w-full border px-3 py-2 rounded-md dark:bg-gray-800 dark:border-gray-700"
            />
            <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
              Subscribe
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 text-center py-4 text-sm">
        © {new Date().getFullYear()} WorkHub. All rights reserved.
      </div>
    </footer>
  );
}
