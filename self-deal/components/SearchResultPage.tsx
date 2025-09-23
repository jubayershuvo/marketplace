"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Star } from "lucide-react";
import Link from "next/link";

// Dummy gigs data with freelancer info
const gigs = [
  {
    id: 1,
    title: "Build a full-stack MERN web application",
    price: 15000,
    img: "https://source.unsplash.com/400x300/?code,developer",
    freelancer: {
      name: "John Doe",
      avatar: "https://i.pravatar.cc/150?img=7",
      location: "Dhaka, Bangladesh",
      rating: 4.9,
      reviews: 120,
    },
  },
  {
    id: 2,
    title: "Design a modern UI/UX for your website",
    price: 10000,
    img: "https://source.unsplash.com/400x300/?design,uiux",
    freelancer: {
      name: "Sarah Lee",
      avatar: "https://i.pravatar.cc/150?img=5",
      location: "New York, USA",
      rating: 4.8,
      reviews: 95,
    },
  },
  {
    id: 3,
    title: "Create a scalable Node.js backend API",
    price: 12000,
    img: "https://source.unsplash.com/400x300/?backend,nodejs",
    freelancer: {
      name: "David Wilson",
      avatar: "https://i.pravatar.cc/150?img=10",
      location: "London, UK",
      rating: 4.7,
      reviews: 80,
    },
  },
];

export default function SearchResultPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Filter gigs by title or freelancer name
  const filtered = gigs.filter(
    (g) =>
      g.title.toLowerCase().includes(query.toLowerCase()) ||
      g.freelancer.name.toLowerCase().includes(query.toLowerCase())
  );

  const formatBDT = (amount: number) => `৳${amount.toLocaleString("en-BD")}`;

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300 text-gray-900 dark:text-gray-100">
      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center gap-4">
        <input
          type="text"
          placeholder="Search gigs or freelancers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:w-96 px-4 py-3 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-400 dark:placeholder-gray-500 transition"
        />
        <Link
          href={`/search?q=${searchQuery}`}
          className="px-6 py-3 rounded-full bg-green-600 text-white font-semibold shadow hover:bg-green-700 transition"
        >
          Search
        </Link>
      </div>

      {/* Show query */}
      {query && (
        <div className="max-w-7xl mx-auto px-4 py-2 text-gray-700 dark:text-gray-300">
          Showing results for: <span className="font-semibold">{query}</span>
        </div>
      )}

      {/* Search Results */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <h2 className="text-2xl font-bold mb-6">
          {filtered.length} Gig{filtered.length !== 1 ? "s" : ""} Found
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((g) => (
            <div
              key={g.id}
              className="rounded-2xl shadow bg-white dark:bg-gray-800 hover:shadow-lg transition overflow-hidden flex flex-col"
            >
              {/* Gig Image */}
              <img
                src={g.img}
                alt={g.title}
                className="w-full h-48 object-cover"
              />

              {/* Gig Info */}
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={g.freelancer.avatar}
                    alt={g.freelancer.name}
                    className="w-12 h-12 rounded-full border border-gray-200 dark:border-gray-700"
                  />
                  <div>
                    <p className="font-semibold">{g.freelancer.name}</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      {g.freelancer.location}
                    </p>
                  </div>
                </div>

                <h3 className="font-bold text-lg line-clamp-2 mb-2">{g.title}</h3>

                <div className="flex items-center gap-1 mt-1 text-yellow-500">
                  {Array.from({ length: Math.round(g.freelancer.rating) }).map(
                    (_, i) => (
                      <Star key={i} size={14} className="fill-yellow-500" />
                    )
                  )}
                  <span className="ml-1 text-gray-600 dark:text-gray-400 text-sm">
                    {g.freelancer.rating} ({g.freelancer.reviews})
                  </span>
                </div>

                <div className="mt-auto flex justify-between items-center pt-4">
                  <span className="text-green-600 font-semibold text-lg">
                    Starting at {formatBDT(g.price)}
                  </span>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                    View Gig
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="mt-6 text-gray-600 dark:text-gray-400 text-center">
            No gigs found for &quot;{query}&quot;
          </p>
        )}
      </main>
    </div>
  );
}
