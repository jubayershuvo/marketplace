"use client";
import { useEffect, useState } from "react";
import { MapPin, Star, Edit2, Save, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/lib/hooks";
import Loading from "./Loading";
import axios from "axios";

// Type definitions
interface Gig {
  _id: string;
  title: string;
  images: string[];
  price: number;
}

interface Review {
  _id: string;
  client: string;
  img: string;
  rating: number;
  text: string;
}

interface BaseProfile {
  _id: string;
  firstName: string;
  lastName: string;
  avatar: string;
  location: string;
  userType: "freelancer" | "client";
  createdAt: string;
}

interface FreelancerProfile extends BaseProfile {
  displayName?: string;
  description?: string;
  skills?: string[];
  rating?: number;
  completedOrders?: number;
  responseTime?: string;
  gigs?: Gig[];
  reviews?: Review[];
}

interface ClientProfile extends BaseProfile {
  companyName?: string;
  companyDescription?: string;
  spent?: number;
}

type Profile = FreelancerProfile | ClientProfile;

// Type guards
function isFreelancer(profile: Profile): profile is FreelancerProfile {
  return profile.userType === "freelancer";
}

function isClient(profile: Profile): profile is ClientProfile {
  return profile.userType === "client";
}

// Helper type for array fields
type ArrayField<T> = {
  [K in keyof T]: T[K] extends string[] ? K : never;
}[keyof T];

type ProfileArrayField = ArrayField<Profile>;

// Union of all editable fields across all profile types
type EditableField =
  | keyof BaseProfile
  | keyof FreelancerProfile
  | keyof ClientProfile;

// Exclude non-editable fields
type ExcludedFields =
  | "_id"
  | "userType"
  | "gigs"
  | "reviews"
  | "rating"
  | "completedOrders"
  | "responseTime"
  | "spent";
type AllowedEditableField = Exclude<EditableField, ExcludedFields>;

export default function Profile({ id }: { id: string }) {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<Profile>({
    _id: "",
    firstName: "",
    lastName: "",
    avatar: "",
    location: "",
    userType: "freelancer",
    createdAt: "",
  });
  const [editForm, setEditForm] = useState<Profile>(profile);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Hooks
  const { user } = useAppSelector((state) => state.userAuth);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    if (user?._id === id || user.username === id) {
      router.push("/profile");
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          id ? `/api/get-profile?id=${id}` : "/api/get-profile",
          { withCredentials: true }
        );
        const data = response.data;
        const userData = data.user;
        setProfile(userData);
        setEditForm(userData);
      } catch (error: unknown) {
        console.error("Error fetching data:", error);

        if (error && typeof error === "object" && "response" in error) {
          const err = error as { response?: { status?: number } };
          if (err.response?.status === 401) {
            router.push("/login");
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router, user._id, user?.username]);

  if (!mounted) {
    return null;
  }

  if (loading) {
    return <Loading />;
  }

  const getYear = (dateString: string) => {
    const date = new Date(dateString);
    return date.getFullYear();
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await axios.put("/api/users/update", editForm, {
        withCredentials: true,
      });

      if (response.status !== 200) {
        throw new Error("Failed to update profile");
      }

      const result = response.data;

      if (result.success) {
        setProfile(response.data.user);
        setIsEditing(false);
        console.log("Profile updated successfully");
      } else {
        throw new Error(result.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditForm(profile);
    setIsEditing(false);
  };

  const handleArrayAdd = (field: ProfileArrayField, value: string) => {
    if (value.trim()) {
      setEditForm((prev) => {
        const currentArray = (prev[field] as string[]) || [];
        return {
          ...prev,
          [field]: [...currentArray, value.trim()],
        };
      });
    }
  };

  const handleArrayRemove = (field: ProfileArrayField, index: number) => {
    setEditForm((prev) => {
      const currentArray = (prev[field] as string[]) || [];
      return {
        ...prev,
        [field]: currentArray.filter((_, i) => i !== index),
      };
    });
  };

  const handleInputChange = (field: AllowedEditableField, value: string) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const canEdit = user && profile._id === user._id;

  return (
    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen transition-colors duration-300">
      {/* Profile Header */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          <img
            src={profile.avatar || "/api/placeholder/128/128"}
            alt={`${profile.firstName} ${profile.lastName}`}
            className="w-32 h-32 rounded-full border-4 border-green-600"
          />
          <div className="flex-1 text-center md:text-left">
            {isEditing ? (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editForm.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                    className="flex-1 px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    placeholder="First Name"
                  />
                  <input
                    type="text"
                    value={editForm.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                    className="flex-1 px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    placeholder="Last Name"
                  />
                </div>

                {isFreelancer(editForm) ? (
                  <input
                    type="text"
                    value={editForm.displayName || ""}
                    onChange={(e) =>
                      handleInputChange("displayName", e.target.value)
                    }
                    className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    placeholder="Professional Title"
                  />
                ) : (
                  <input
                    type="text"
                    value={isClient(editForm) ? editForm.companyName || "" : ""}
                    onChange={(e) =>
                      handleInputChange("companyName", e.target.value)
                    }
                    className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    placeholder="Company Name"
                  />
                )}

                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) =>
                    handleInputChange("location", e.target.value)
                  }
                  className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  placeholder="Location"
                />

                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                  >
                    <Save size={16} /> Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center gap-2"
                  >
                    <X size={16} /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-3xl font-bold">
                  {profile.firstName} {profile.lastName}
                </h2>
                <p className="text-green-600 font-semibold">
                  {isFreelancer(profile)
                    ? profile.displayName ||
                      `${profile.firstName} ${profile.lastName}`
                    : profile.companyName ||
                      `${profile.firstName} ${profile.lastName}`}
                </p>

                {isFreelancer(profile) && (
                  <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                    <Star
                      className="text-yellow-500 fill-yellow-500"
                      size={18}
                    />
                    <span>
                      {profile.rating || 0} ({profile.reviews?.length || 0}{" "}
                      reviews)
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-center md:justify-start gap-2 mt-2 text-gray-600 dark:text-gray-400 md:text-center">
                  <MapPin size={16} /> {profile.location}
                </div>
                {canEdit && (
                  <div className="flex items-center justify-center md:justify-start gap-2 mt-2 text-gray-600 dark:text-gray-400 md:text-center">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                      <Edit2 size={16} /> Edit Profile
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 text-center border-t dark:border-gray-800">
        {isFreelancer(profile) ? (
          <>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 shadow">
              <p className="text-2xl font-bold text-green-600">
                {profile.completedOrders || 0}
              </p>
              <p className="capitalize text-sm text-gray-600 dark:text-gray-400">
                completed
              </p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 shadow">
              <p className="text-2xl font-bold text-green-600">5</p>
              <p className="capitalize text-sm text-gray-600 dark:text-gray-400">
                pending
              </p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 shadow">
              <p className="text-2xl font-bold text-green-600">2</p>
              <p className="capitalize text-sm text-gray-600 dark:text-gray-400">
                canceled
              </p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 shadow">
              <p className="text-2xl font-bold text-green-600">
                {profile.gigs?.length || 0}
              </p>
              <p className="capitalize text-sm text-gray-600 dark:text-gray-400">
                gigs
              </p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 shadow">
              <p className="text-2xl font-bold text-green-600">
                {profile.responseTime || "N/A"}
              </p>
              <p className="capitalize text-sm text-gray-600 dark:text-gray-400">
                response time
              </p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 shadow">
              <p className="text-2xl font-bold text-green-600">
                {getYear(profile.createdAt)}
              </p>
              <p className="capitalize text-sm text-gray-600 dark:text-gray-400">
                member since
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 shadow">
              <p className="text-2xl font-bold text-green-600">
                {isClient(profile) ? profile.spent || 0 : 0}
              </p>
              <p className="capitalize text-sm text-gray-600 dark:text-gray-400">
                total spent
              </p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 shadow">
              <p className="text-2xl font-bold text-green-600">12</p>
              <p className="capitalize text-sm text-gray-600 dark:text-gray-400">
                active projects
              </p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 shadow">
              <p className="text-2xl font-bold text-green-600">4.8</p>
              <p className="capitalize text-sm text-gray-600 dark:text-gray-400">
                avg rating
              </p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 shadow">
              <p className="text-2xl font-bold text-green-600">8</p>
              <p className="capitalize text-sm text-gray-600 dark:text-gray-400">
                completed
              </p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 shadow">
              <p className="text-2xl font-bold text-green-600">
                {getYear(profile.createdAt)}
              </p>
              <p className="capitalize text-sm text-gray-600 dark:text-gray-400">
                member since
              </p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 shadow">
              <p className="text-2xl font-bold text-green-600">15</p>
              <p className="capitalize text-sm text-gray-600 dark:text-gray-400">
                reviews given
              </p>
            </div>
          </>
        )}
      </section>

      {/* About */}
      <section className="max-w-6xl mx-auto px-4 py-6 border-t dark:border-gray-800">
        <h3 className="text-xl font-bold mb-3">
          {isFreelancer(profile) ? "About Me" : "About Company"}
        </h3>
        {isEditing ? (
          <textarea
            value={
              isFreelancer(editForm)
                ? editForm.description || ""
                : isClient(editForm)
                ? editForm.companyDescription || ""
                : ""
            }
            onChange={(e) =>
              handleInputChange(
                (isFreelancer(editForm)
                  ? "description"
                  : "companyDescription") as AllowedEditableField,
                e.target.value
              )
            }
            className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 h-32 resize-none"
            placeholder={
              isFreelancer(editForm)
                ? "Tell clients about yourself..."
                : "Describe your company..."
            }
          />
        ) : (
          <p className="text-gray-600 dark:text-gray-400">
            {isFreelancer(profile)
              ? profile.description || "No description provided."
              : isClient(profile)
              ? profile.companyDescription || "No company description provided."
              : "No description provided."}
          </p>
        )}
      </section>

      {/* Skills - Only for Freelancers */}
      {isFreelancer(profile) && (
        <section className="max-w-6xl mx-auto px-4 py-6 border-t dark:border-gray-800">
          <h3 className="text-xl font-bold mb-3">Skills</h3>
          {isEditing ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {isFreelancer(editForm) &&
                  editForm.skills?.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm flex items-center gap-2"
                    >
                      {skill}
                      <button
                        onClick={() =>
                          handleArrayRemove(
                            "skills" as ProfileArrayField,
                            index
                          )
                        }
                        className="text-red-500 hover:text-red-700"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
              </div>
              <input
                type="text"
                placeholder="Add a skill (press Enter)"
                className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleArrayAdd(
                      "skills" as ProfileArrayField,
                      e.currentTarget.value
                    );
                    e.currentTarget.value = "";
                  }
                }}
              />
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {isFreelancer(profile) &&
                profile.skills?.map((skill, i) => (
                  <span
                    key={i}
                    className="px-4 py-2 rounded-full border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
                  >
                    {skill}
                  </span>
                ))}
              {isFreelancer(profile) &&
                (!profile.skills || profile.skills.length === 0) && (
                  <p className="text-gray-600 dark:text-gray-400">
                    No skills added yet.
                  </p>
                )}
            </div>
          )}
        </section>
      )}

      {/* Gigs - Only for Freelancers */}
      {isFreelancer(profile) && profile.gigs && profile.gigs.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-6 border-t dark:border-gray-800">
          <h3 className="text-xl font-bold mb-3">My Gigs</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {profile.gigs.map((gig) => (
              <div
                key={gig._id}
                className="rounded-xl overflow-hidden shadow hover:shadow-lg bg-white dark:bg-gray-800"
              >
                <img
                  src={gig.images[0] || "/api/placeholder/300/160"}
                  alt={gig.title}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4">
                  <h4 className="font-bold">{gig.title}</h4>
                  <p className="text-green-600 font-semibold mt-2">
                    ৳ {gig.price.toLocaleString()}
                  </p>
                  <button className="mt-3 w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    Order Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Reviews - Only for Freelancers */}
      {isFreelancer(profile) &&
        profile.reviews &&
        profile.reviews.length > 0 && (
          <section className="max-w-6xl mx-auto px-4 py-6 border-t dark:border-gray-800">
            <h3 className="text-xl font-bold mb-3">Client Reviews</h3>
            <div className="space-y-6">
              {profile.reviews.map((r) => (
                <div
                  key={r._id}
                  className="p-6 rounded-xl bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 shadow"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={r.img}
                      alt={r.client}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <h4 className="font-bold">{r.client}</h4>
                      <div className="flex items-center gap-1 text-yellow-500">
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star key={i} size={16} className="fill-yellow-500" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-gray-600 dark:text-gray-400">
                    {r.text}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
    </div>
  );
}
