"use client";
import { ProfileData } from "@/types/Profile";
import { MapPin, Star } from "lucide-react";

// All Data in one JSON
const data:ProfileData = {
  profile: {
    name: "John Doe",
    title: "Full-Stack MERN Developer",
    img: "https://i.pravatar.cc/150?img=7",
    location: "Dhaka, Bangladesh",
    rating: 4.9,
    reviews: 120,
    bio: "I am a passionate MERN Stack Developer with 3+ years of experience building scalable web apps. Skilled in React, Next.js, Node.js, and MongoDB.",
    skills: ["React", "Next.js", "Node.js", "MongoDB", "Tailwind", "TypeScript"],
    stats: {
      completed: 85,
      pending: 5,
      canceled: 2,
      gigs: 6,
      responseTime: "1 hour",
      memberSince: "2021",
    },
  },
  gigs: [
    {
      id: 1,
      title: "I will build a responsive MERN stack website",
      price: 25000,
      img: "https://www.rlogical.com/wp-content/uploads/2020/12/MERN.webp",
    },
    {
      id: 2,
      title: "I will create a professional portfolio website",
      price: 15000,
      img: "https://marketplace.canva.com/EAFwckKNjDE/2/0/800w/canva-black-white-grayscale-portfolio-presentation-CFoKUfCMgq0.jpg",
    },
    {
      id: 3,
      title: "I will develop a secure REST API with Node.js",
      price: 20000,
      img: "https://assets.toptal.io/images?url=https%3A%2F%2Fbs-uploads.toptal.io%2Fblackfish-uploads%2Fcomponents%2Fblog_post_page%2F4085508%2Fcover_image%2Fregular_1708x683%2Fcover-secure-rest-api-in-nodejs-80fb5c435d64e62d270b46dc5618d74e.png",
    },
  ],
  portfolio: [
    {
      id: 1,
      title: "E-commerce Website",
      img: "https://cdn.dribbble.com/userupload/23744972/file/original-f09ad4491cf30c1628e68083ad7d12ad.jpg?format=webp&resize=400x300&vertical=center",
    },
    {
      id: 2,
      title: "Social Media App",
      img: "https://img.freepik.com/free-photo/social-media-marketing-concept-marketing-with-applications_23-2150063163.jpg?t=st=1758088931~exp=1758092531~hmac=db959c36ece40f1dc77b2ee2d14c5975b90788e647bc8c59b89b85e50f42671e&w=1480",
    },
    {
      id: 3,
      title: "Portfolio Website",
      img: "https://repository-images.githubusercontent.com/279903174/e6d970ed-8a4d-42fa-9f16-0b7efc34fb95",
    },
  ],
  reviews: [
    {
      id: 1,
      client: "Sarah Lee",
      img: "https://i.pravatar.cc/100?img=12",
      rating: 5,
      text: "Amazing developer! Delivered everything before deadline and exceeded expectations.",
    },
    {
      id: 2,
      client: "David Wilson",
      img: "https://i.pravatar.cc/100?img=14",
      rating: 5,
      text: "Great communication, very professional and skilled.",
    },
  ],
};

export default function Profile() {
  const { profile, gigs, portfolio, reviews } = data;

  return (
    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen transition-colors duration-300">

      {/* Profile Header */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          <img
            src={profile.img}
            alt={profile.name}
            className="w-32 h-32 rounded-full border-4 border-green-600"
          />
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl font-bold">{profile.name}</h2>
            <p className="text-green-600 font-semibold">{profile.title}</p>
            <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
              <Star className="text-yellow-500 fill-yellow-500" size={18} />
              <span>{profile.rating} ({profile.reviews} reviews)</span>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-2 mt-2 text-gray-600 dark:text-gray-400">
              <MapPin size={16} /> {profile.location}
            </div>
            <button className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              Hire Me
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 text-center border-t dark:border-gray-800">
        {Object.entries(profile.stats).map(([key, value], i) => (
          <div key={i} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 shadow">
            <p className="text-2xl font-bold text-green-600">{value}</p>
            <p className="capitalize text-sm text-gray-600 dark:text-gray-400">{key}</p>
          </div>
        ))}
      </section>

      {/* About */}
      <section className="max-w-6xl mx-auto px-4 py-6 border-t dark:border-gray-800">
        <h3 className="text-xl font-bold mb-3">About Me</h3>
        <p className="text-gray-600 dark:text-gray-400">{profile.bio}</p>
      </section>

      {/* Skills */}
      <section className="max-w-6xl mx-auto px-4 py-6 border-t dark:border-gray-800">
        <h3 className="text-xl font-bold mb-3">Skills</h3>
        <div className="flex flex-wrap gap-3">
          {profile.skills.map((skill, i) => (
            <span key={i} className="px-4 py-2 rounded-full border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm">
              {skill}
            </span>
          ))}
        </div>
      </section>

      {/* Gigs */}
      <section className="max-w-6xl mx-auto px-4 py-6 border-t dark:border-gray-800">
        <h3 className="text-xl font-bold mb-3">My Gigs</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {gigs.map((gig) => (
            <div key={gig.id} className="rounded-xl overflow-hidden shadow hover:shadow-lg bg-white dark:bg-gray-800">
              <img src={gig.img} alt={gig.title} className="w-full h-40 object-cover" />
              <div className="p-4">
                <h4 className="font-bold">{gig.title}</h4>
                <p className="text-green-600 font-semibold mt-2">৳ {gig.price.toLocaleString()}</p>
                <button className="mt-3 w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  Order Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Portfolio */}
      <section className="max-w-6xl mx-auto px-4 py-6 border-t dark:border-gray-800">
        <h3 className="text-xl font-bold mb-3">Portfolio</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {portfolio.map((p) => (
            <div key={p.id} className="rounded-xl overflow-hidden shadow hover:shadow-lg bg-white dark:bg-gray-800">
              <img src={p.img} alt={p.title} className="w-full h-40 object-cover" />
              <div className="p-4">
                <h4 className="font-bold">{p.title}</h4>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Reviews */}
      <section className="max-w-6xl mx-auto px-4 py-6 border-t dark:border-gray-800">
        <h3 className="text-xl font-bold mb-3">Client Reviews</h3>
        <div className="space-y-6">
          {reviews.map((r) => (
            <div key={r.id} className="p-6 rounded-xl bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 shadow">
              <div className="flex items-center gap-4">
                <img src={r.img} alt={r.client} className="w-12 h-12 rounded-full" />
                <div>
                  <h4 className="font-bold">{r.client}</h4>
                  <div className="flex items-center gap-1 text-yellow-500">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} size={16} className="fill-yellow-500" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="mt-3 text-gray-600 dark:text-gray-400">{r.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
