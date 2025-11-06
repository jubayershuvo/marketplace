"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Star,
  Share2,
  MessageCircle,
  Shield,
  Clock,
  RefreshCw,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  MapPin,
  ThumbsUp,
  Flag,
  X,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Loading from "./Loading";
import { useAppSelector } from "@/lib/hooks";

// -------- Types --------
interface Language {
  name: string;
  level: string;
}

interface Freelancer {
  _id: string;
  displayName: string;
  username: string;
  avatar: string;
  location: string;
  rating: number;
  reviewsCount: number;
  ordersCount: number;
  responseTime: string;
  lastDelivery: string;
  memberSince: string;
  level: string;
  bio: string;
  skills: string[];
  languages: Language[];
  education: string[];
  certifications: string[];
  createdAt: string;
}

interface Review {
  _id: string;
  user: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string; // e.g. "1 week ago"
  helpful: number;
}

interface FAQ {
  _id: string;
  question: string;
  answer: string;
}

interface Gig {
  _id: string;
  id: number;
  title: string;
  price: number;
  originalPrice?: number;
  images: string[];
  video?: string;
  badge?: string;
  description: string;
  features: string[];
  deliveryTime: string;
  revisions: string;
  category: string;
  subcategory: string;
  pendingOrders: number;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  freelancer: Freelancer;
  reviews: Review[];
  faq: FAQ[];
  isLiked: boolean;
}

const ViewGigPage = ({ id }: { id: string }) => {
  const [gig, setGig] = useState<Gig | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showContactForm, setShowContactForm] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const { user } = useAppSelector((state) => state.userAuth);
  const [domain, setDomain] = useState("");

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: gig?.title,
          text: "Check out this gig on SelfDeal!",
          url: domain + `/gig/${gig?._id}`,
        })
        .catch((error) => console.error("Error sharing", error));
    } else if (
      typeof navigator !== "undefined" &&
      typeof navigator.clipboard !== "undefined"
    ) {
      // Fallback for browsers that do not support the Web Share API
      navigator.clipboard
        ?.writeText(domain + `/gig/${gig?._id}`)
        .then(() => {
          alert("Gig URL copied to clipboard!");
        })
        .catch((error) => console.error("Error copying to clipboard", error));
    } else {
      alert("Sorry, copying to clipboard is not supported on this device.");
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      setDomain(window.location.origin);
    }
  }, []);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      if (!id) {
        router.push("/");
        return;
      }

      try {
        setLoading(true);
        // Fetch gig data
        const gigRes = await axios.get(`/api/gig?id=${id}`);
        setGig(gigRes.data.gig);
      } catch (error) {
        console.error("Failed to fetch gig:", error);
        setGig(null);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id, router]);

  if (loading) {
    return <Loading />;
  }

  if (!gig) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600 dark:text-gray-400">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Gig not found</h2>
          <p>The gig you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </div>
    );
  }

  const formatBDT = (amount: number) => `৳${amount.toLocaleString("en-BD")}`;
  const isFreelancer = user?.userType === "freelancer";

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % gig.images.length);
  };

  const prevImage = () => {
    setSelectedImageIndex(
      (prev) => (prev - 1 + gig.images.length) % gig.images.length
    );
  };

  const sinceFrom = (): string => {
    const date = new Date(gig.freelancer.createdAt);
    const dateOptions: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Intl.DateTimeFormat("en-US", dateOptions)
      .format(date)
      .replace(/\s/g, " "); // Fix date formatting
  };

  const handleBuyNow = () => {
    if (isFreelancer) {
      return; // Prevent freelancers from ordering
    }
    // Handle buy now logic here
    router.push(`/payment?id=${gig._id}`);
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
      {/* Breadcrumb */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="text-sm flex text-gray-500 dark:text-gray-400">
            <div className="hover:text-green-600 dark:hover:text-green-400">
              Home
            </div>
            <span className="mx-2">/</span>
            <div className="hover:text-green-600 dark:hover:text-green-400">
              {gig.category}
            </div>
            <span className="mx-2">/</span>
            <span className="text-gray-900 dark:text-gray-100">
              {gig.subcategory}
            </span>
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
              <div className="relative">
                <img
                  src={gig.images[selectedImageIndex]}
                  alt={gig.title}
                  className="w-full h-96 object-cover"
                />
                {gig.badge && (
                  <div className="absolute top-4 left-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {gig.badge}
                  </div>
                )}
                <div className="absolute top-4 right-4 flex space-x-2">
                  <button
                    onClick={handleShare}
                    className="p-2 rounded-full bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white transition-colors"
                  >
                    <Share2 size={20} />
                  </button>
                </div>

                {/* Navigation arrows */}
                {gig.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {gig.images.length > 1 && (
                <div className="p-4 flex space-x-3 overflow-x-auto">
                  {gig.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                        selectedImageIndex === index
                          ? "border-green-500"
                          : "border-gray-200 dark:border-gray-600"
                      }`}
                    >
                      <img
                        src={image}
                        alt={`Gallery ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Gig Details */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {gig.title}
                  </h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="font-medium">
                        {gig.freelancer.rating}
                      </span>
                      {gig.freelancer.reviewsCount > 0 && (
                        <span>({gig.freelancer.reviewsCount} reviews)</span>
                      )}
                    </div>
                    <span>•</span>
                    <span>{gig.pendingOrders || 0} orders in queue</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    {gig.originalPrice && (
                      <span className="text-gray-400 dark:text-gray-500 line-through">
                        {formatBDT(gig.originalPrice)}
                      </span>
                    )}
                    <span className="text-2xl font-bold text-green-600">
                      {formatBDT(gig.price)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Starting at
                  </p>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {gig.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/search?tag=${tag}`}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                <nav className="-mb-px flex space-x-8">
                  {[
                    { id: "overview", label: "Overview" },
                    { id: "reviews", label: `Reviews (${gig.reviews.length})` },
                    { id: "faq", label: "FAQ" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? "border-green-500 text-green-600 dark:text-green-400"
                          : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="space-y-6">
                {activeTab === "overview" && (
                  <>
                    <div>
                      <h3 className="text-lg font-semibold mb-3">
                        About this gig
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        {gig.description}
                      </p>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {gig.features.map((feature, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-2"
                          >
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-center">
                        <Clock className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {gig.deliveryTime}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Delivery Time
                        </p>
                      </div>
                      <div className="text-center">
                        <RefreshCw className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {gig.revisions}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Revisions
                        </p>
                      </div>
                      <div className="text-center">
                        <Shield className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          Money Back
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Guarantee
                        </p>
                      </div>
                      <div className="text-center">
                        <CheckCircle className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          Quality
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Assured
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {activeTab === "reviews" && (
                  <div className="space-y-6">
                    {gig.reviews.map((review) => (
                      <div
                        key={review._id}
                        className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0"
                      >
                        <div className="flex items-start space-x-4">
                          <img
                            src={review.avatar}
                            alt={review.user}
                            className="w-12 h-12 rounded-full"
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                {review.user}
                              </h4>
                              <div className="flex items-center">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < review.rating
                                        ? "text-yellow-400 fill-current"
                                        : "text-gray-300 dark:text-gray-600"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {review.date}
                              </span>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 mb-3">
                              {review.comment}
                            </p>
                            <button className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                              <ThumbsUp className="w-4 h-4" />
                              <span>Helpful ({review.helpful})</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "faq" && (
                  <div className="space-y-4">
                    {gig.faq.map((item, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                      >
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                          {item.question}
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300">
                          {item.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing Packages */}
            <div className="bg-white relative dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <div className="flex"></div>
              </div>

              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {formatBDT(gig.price)}
                  </div>
                  <div className="flex items-center justify-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{gig.deliveryTime}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <RefreshCw className="w-4 h-4" />
                      <span>{gig.revisions} revisions</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {gig.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Freelancer restriction notice */}
                {isFreelancer && (
                  <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span className="text-sm text-amber-700 dark:text-amber-300">
                        Freelancers cannot place orders
                      </span>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {!isFreelancer ? (
                    <button
                      onClick={handleBuyNow}
                      className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
                    >
                      Order Now ({formatBDT(gig.price)})
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full py-3 bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 font-semibold rounded-lg cursor-not-allowed"
                    >
                      Order Now ({formatBDT(gig.price)})
                    </button>
                  )}
  
                </div>

                <div className="mt-4 text-center">
                  <button className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 flex items-center space-x-1 mx-auto">
                    <Flag className="w-4 h-4" />
                    <span>Report this Gig</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Seller Info */}
            <div className="bg-white relative dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="relative">
                  <img
                    src={gig.freelancer.avatar}
                    alt={gig.freelancer.displayName}
                    className="w-16 h-16 rounded-full"
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                    {gig.freelancer.displayName}
                  </h3>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    {gig.freelancer.level}
                  </p>
                  <div className="flex items-center space-x-1 mt-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">
                      {gig.freelancer.rating}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      ({gig.freelancer.reviewsCount})
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">From</span>
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-3 h-3" />
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {gig.freelancer.location}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">
                    Member since
                  </span>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {sinceFrom()}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">
                    Avg. response time
                  </span>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {gig.freelancer.responseTime}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">
                    Last delivery
                  </span>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {gig.freelancer.lastDelivery}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <Link
                  href={`/profile/${gig.freelancer._id}`}
                  className="block w-full py-2 text-center border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium rounded-lg transition-colors"
                >
                  View Profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>


      {/* Mobile Bottom Action Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 z-50">
        <div className="flex items-center justify-between">
          <div className="w-1/2 text-left">
            <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {formatBDT(gig.price)}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {gig.title} Package
            </div>
          </div>
          <div className="flex space-x-2">
            {!isFreelancer ? (
              <button
                onClick={handleBuyNow}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
              >
                Order Now
              </button>
            ) : (
              <button
                disabled
                className="px-6 py-3 bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 font-semibold rounded-lg cursor-not-allowed"
              >
                Order Now
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Spacing */}
      <div className="lg:hidden h-32"></div>
    </div>
  );
};

export default ViewGigPage;
