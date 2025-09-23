"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  Upload,
  Plus,
  X,
  DollarSign,
  Clock,
  RefreshCw,
  Tag,
  FileText,
  Image as ImageIcon,
  Video,
  Award,
  HelpCircle,
  Save,
  Eye,
  ChevronDown,
  Star,
  Loader2,
  Check,
  AlertCircle,
} from "lucide-react";
import { useAppSelector } from "@/lib/hooks";
import { useRouter } from "next/navigation";

interface GigFormData {
  title: string;
  price: string;
  originalPrice?: string;
  images: string[];
  video?: string;
  badge?: string;
  description: string;
  features: string[];
  deliveryTime: string;
  revisions: string;
  category: string;
  subcategory: string;
  tags: string[];
  faq: Array<{ question: string; answer: string }>;
}

const CreateGigPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const { isLoggedIn, user } = useAppSelector((state) => state.userAuth);
  const router = useRouter();

  const [formData, setFormData] = useState<GigFormData>({
    title: "",
    images: [],
    price: "",
    originalPrice: "",
    video: "",
    description: "",
    features: [""],
    deliveryTime: "3 days",
    revisions: "1",
    category: "",
    subcategory: "",
    tags: [],
    faq: [{ question: "", answer: "" }],
  });

  const categories = [
    {
      value: "programming-tech",
      label: "Programming & Tech",
      subcategories: [
        "Web Development",
        "Mobile Apps",
        "Desktop Applications",
        "Chatbots",
      ],
    },
    {
      value: "NID",
      label: "NID",
      subcategories: ["Make NID", "ReIssue NID", "Update NID", "Fix NID"],
    },
    {
      value: "graphics-design",
      label: "Graphics & Design",
      subcategories: [
        "Logo Design",
        "Web Design",
        "Print Design",
        "Illustration",
      ],
    },
    {
      value: "digital-marketing",
      label: "Digital Marketing",
      subcategories: [
        "SEO",
        "Social Media",
        "Content Marketing",
        "Email Marketing",
      ],
    },
    {
      value: "writing-translation",
      label: "Writing & Translation",
      subcategories: [
        "Content Writing",
        "Copywriting",
        "Translation",
        "Proofreading",
      ],
    },
    {
      value: "video-animation",
      label: "Video & Animation",
      subcategories: [
        "Video Editing",
        "Animation",
        "3D Modeling",
        "Motion Graphics",
      ],
    },
  ];

  const deliveryOptions = [
    "1 day",
    "2 days",
    "3 days",
    "1 week",
    "2 weeks",
    "1 month",
  ];
  const revisionOptions = ["1", "2", "3", "5", "Unlimited"];

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
    } else if (!user.displayName) {
      router.push("/complete-profile");
    }
  }, []);

  const handleInputChange = <K extends keyof GigFormData>(
    field: K,
    value: GigFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSubmitStatus("idle");
    setErrorMessage("");
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData((prev) => ({ ...prev, features: newFeatures }));
  };

  const addFeature = () => {
    setFormData((prev) => ({ ...prev, features: [...prev.features, ""] }));
  };

  const removeFeature = (index: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, features: newFeatures }));
  };

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && e.currentTarget.value.trim()) {
      e.preventDefault();
      const newTag = e.currentTarget.value.trim();
      if (!formData.tags.includes(newTag) && formData.tags.length < 10) {
        setFormData((prev) => ({ ...prev, tags: [...prev.tags, newTag] }));
      }
      e.currentTarget.value = "";
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleFAQChange = (
    index: number,
    field: "question" | "answer",
    value: string
  ) => {
    const newFAQ = [...formData.faq];
    newFAQ[index] = { ...newFAQ[index], [field]: value };
    setFormData((prev) => ({ ...prev, faq: newFAQ }));
  };

  const addFAQ = () => {
    setFormData((prev) => ({
      ...prev,
      faq: [...prev.faq, { question: "", answer: "" }],
    }));
  };

  const removeFAQ = (index: number) => {
    const newFAQ = formData.faq.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, faq: newFAQ }));
  };

  // File handling functions
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles = Array.from(files).slice(0, 5 - selectedFiles.length);
    const validFiles = newFiles.filter((file) => {
      const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      const maxSize = 5 * 1024 * 1024; // 5MB
      return validTypes.includes(file.type) && file.size <= maxSize;
    });

    if (validFiles.length !== newFiles.length) {
      alert(
        "Some files were rejected. Please ensure files are images (JPEG, PNG, GIF, WebP) and under 5MB."
      );
    }

    setSelectedFiles((prev) => [...prev, ...validFiles]);

    // Create previews
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImagePreviews((prev) => [...prev, e.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // Upload images to a service (placeholder function)
  const uploadImages = async (files: File[]): Promise<string[]> => {
    // In a real application, you would upload to a service like Cloudinary, AWS S3, etc.
    // For demo purposes, we'll create mock URLs
    return files.map(
      (file, index) =>
        `https://example.com/images/${Date.now()}-${index}-${file.name}`
    );
  };

  const steps = [
    { id: 1, title: "Overview", icon: FileText },
    { id: 2, title: "Pricing & Delivery", icon: DollarSign },
    { id: 3, title: "Description & FAQ", icon: HelpCircle },
    { id: 4, title: "Gallery", icon: ImageIcon },
  ];

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = currentStep === step.id;
        const isCompleted = currentStep > step.id;

        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              {/* Step circle */}
              <div
                className={`
                w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200
                ${
                  isActive
                    ? "bg-green-500 text-white shadow-lg"
                    : isCompleted
                    ? "bg-green-400 text-white"
                    : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                }
              `}
              >
                <Icon size={20} />
              </div>

              {/* Step label */}
              <span
                className={`
                mt-2 text-sm font-medium
                ${
                  isActive
                    ? "text-green-500"
                    : "text-gray-500 dark:text-gray-400"
                }
              `}
              >
                {step.title}
              </span>
            </div>

            {/* Step connector */}
            {index < steps.length - 1 && (
              <div
                className={`
                flex-1 h-0.5 mx-4 mt-6
                ${isCompleted ? "bg-green-400" : "bg-gray-200 dark:bg-gray-700"}
              `}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      {/* Gig Title */}
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
          Gig Title *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => handleInputChange("title", e.target.value)}
          placeholder="I will do something I'm really good at"
          className="
          w-full px-4 py-3 rounded-lg border transition-colors
          bg-white border-gray-300 text-gray-900 placeholder-gray-500
          focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20
          dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400
        "
          maxLength={120}
        />
        <div className="text-xs mt-1 text-gray-500 dark:text-gray-400">
          {formData.title.length}/120
        </div>
      </div>

      {/* Category + Subcategory */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Category *
          </label>
          <div className="relative">
            <select
              value={formData.category}
              onChange={(e) => {
                handleInputChange("category", e.target.value);
                handleInputChange("subcategory", ""); // Reset subcategory
              }}
              className="
              w-full px-4 py-3 rounded-lg border appearance-none transition-colors
              bg-white border-gray-300 text-gray-900
              focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20
              dark:bg-gray-800 dark:border-gray-600 dark:text-white
            "
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Subcategory *
          </label>
          <div className="relative">
            <select
              value={formData.subcategory}
              onChange={(e) => handleInputChange("subcategory", e.target.value)}
              disabled={!formData.category}
              className="
              w-full px-4 py-3 rounded-lg border appearance-none transition-colors
              bg-white border-gray-300 text-gray-900
              focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20
              disabled:bg-gray-50 disabled:cursor-not-allowed
              dark:bg-gray-800 dark:border-gray-600 dark:text-white
              dark:disabled:bg-gray-700
            "
            >
              <option value="">Select a subcategory</option>
              {formData.category &&
                categories
                  .find((cat) => cat.value === formData.category)
                  ?.subcategories.map((subcat) => (
                    <option key={subcat} value={subcat}>
                      {subcat}
                    </option>
                  ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
          Tags (Max 10)
        </label>
        <input
          type="text"
          onKeyDown={handleTagInput}
          placeholder="Press Enter to add tags (e.g., web design, logo, branding)"
          disabled={formData.tags.length >= 10}
          className="
          w-full px-4 py-3 rounded-lg border transition-colors
          bg-white border-gray-300 text-gray-900 placeholder-gray-500
          focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20
          disabled:bg-gray-50 disabled:cursor-not-allowed
          dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400
          dark:disabled:bg-gray-700
        "
        />
        {formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className="
                inline-flex items-center px-3 py-1 rounded-full text-sm
                bg-gray-100 text-gray-700
                dark:bg-gray-700 dark:text-gray-300
              "
              >
                <Tag size={12} className="mr-1" />
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="ml-2 hover:text-red-500 transition-colors"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Price *
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />

            <input
              type="number"
              value={formData?.price}
              onChange={(e) => handleInputChange("price", e.target.value)}
              min={5}
              step={5}
              className="w-full pl-10 pr-4 py-3 rounded-lg border transition-colors bg-white border-gray-300 text-gray-900 focus:border-green-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
            />
          </div>
          <div className="text-xs mt-1 text-gray-500 dark:text-gray-400">
            Minimum $5
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Original Price (Optional)
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              value={formData?.originalPrice}
              onChange={(e) =>
                handleInputChange(
                  "originalPrice",
                  e.target.value ? e.target.value : undefined
                )
              }
              className="w-full pl-10 pr-4 py-3 rounded-lg border transition-colors bg-white border-gray-300 text-gray-900 focus:border-green-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
            />
          </div>
          <div className="text-xs mt-1 text-gray-500 dark:text-gray-400">
            Shows discount badge
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Delivery Time *
          </label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={formData.deliveryTime}
              onChange={(e) =>
                handleInputChange("deliveryTime", e.target.value)
              }
              className="w-full pl-10 pr-10 py-3 rounded-lg border appearance-none transition-colors bg-white border-gray-300 text-gray-900 focus:border-green-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
            >
              {deliveryOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Revisions *
          </label>
          <div className="relative">
            <RefreshCw className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={formData.revisions}
              onChange={(e) => handleInputChange("revisions", e.target.value)}
              className="w-full pl-10 pr-10 py-3 rounded-lg border appearance-none transition-colors bg-white border-gray-300 text-gray-900 focus:border-green-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
            >
              {revisionOptions.map((option) => (
                <option key={option} value={option}>
                  {option}{" "}
                  {option === "Unlimited"
                    ? ""
                    : "revision" + (option === "1" ? "" : "s")}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
          What you&apos;ll get
        </label>
        <div className="space-y-3">
          {formData.features.map((feature, index) => (
            <div key={index} className="flex gap-3">
              <input
                type="text"
                value={feature}
                onChange={(e) => handleFeatureChange(index, e.target.value)}
                placeholder="e.g., Logo transparency, Vector file, Printable file"
                className="flex-1 px-4 py-3 rounded-lg border transition-colors bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-green-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
              />
              {formData.features.length > 1 && (
                <button
                  onClick={() => removeFeature(index)}
                  className="px-3 py-3 rounded-lg border transition-colors hover:bg-red-50 hover:border-red-300 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:border-red-600 dark:hover:text-red-400"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addFeature}
            className="flex items-center justify-center w-full py-3 rounded-lg border-2 border-dashed transition-colors border-gray-300 text-gray-500 hover:border-green-500 hover:text-green-600 dark:border-gray-600 dark:text-gray-400 dark:hover:border-green-500 dark:hover:text-green-400"
          >
            <Plus size={20} className="mr-2" />
            Add feature
          </button>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
          Description *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          placeholder="Describe your service in detail. What makes it unique? What will the buyer get exactly?"
          rows={6}
          maxLength={5000}
          className="w-full px-4 py-3 rounded-lg border transition-colors resize-none bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-green-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
        />
        <div className="text-xs mt-1 text-gray-500 dark:text-gray-400">
          {formData.description.length}/5000
        </div>
      </div>


      <div>
        <label className="block text-sm font-medium mb-4 text-gray-700 dark:text-gray-300">
          Frequently Asked Questions
        </label>
        <div className="space-y-4">
          {formData.faq.map((item, index) => (
            <div
              key={index}
              className="p-4 rounded-lg border bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-600"
            >
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  FAQ #{index + 1}
                </span>
                {formData.faq.length > 1 && (
                  <button
                    onClick={() => removeFAQ(index)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              <div className="space-y-3">
                <input
                  type="text"
                  value={item.question}
                  onChange={(e) =>
                    handleFAQChange(index, "question", e.target.value)
                  }
                  placeholder="What's your question?"
                  className="w-full px-3 py-2 rounded-lg border transition-colors bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500/20"
                />
                <textarea
                  value={item.answer}
                  onChange={(e) =>
                    handleFAQChange(index, "answer", e.target.value)
                  }
                  placeholder="Provide a clear and helpful answer..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border transition-colors resize-none bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500/20"
                />
              </div>
            </div>
          ))}
          <button
            onClick={addFAQ}
            className="flex items-center justify-center w-full py-3 rounded-lg border-2 border-dashed transition-colors border-gray-300 text-gray-500 hover:border-green-500 hover:text-green-600 dark:border-gray-600 dark:text-gray-400 dark:hover:border-green-500 dark:hover:text-green-400"
          >
            <Plus size={20} className="mr-2" />
            Add FAQ
          </button>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-4 text-gray-700 dark:text-gray-300">
          Gig Images (Max 5 images)
        </label>

        {/* File Input (Hidden) */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Upload Area */}
        <div
          onClick={triggerFileSelect}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer border-gray-300 bg-gray-50 hover:border-green-500 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-green-500 dark:hover:bg-gray-700 ${
            selectedFiles.length >= 5 ? "pointer-events-none opacity-50" : ""
          }`}
        >
          <Upload className="mx-auto mb-4 w-12 h-12 text-gray-400 dark:text-gray-400" />
          <h3 className="text-lg font-medium mb-2 text-gray-700 dark:text-gray-300">
            {selectedFiles.length >= 5
              ? "Maximum files selected"
              : "Upload Gig Images"}
          </h3>
          <p className="text-sm mb-4 text-gray-500 dark:text-gray-400">
            {selectedFiles.length >= 5
              ? "You can upload up to 5 images maximum"
              : "Click to browse or drag and drop images here (Max 5 images, 5MB each)"}
          </p>
          {selectedFiles.length < 5 && (
            <button
              type="button"
              className="px-6 py-2 rounded-lg border transition-colors bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              <ImageIcon className="inline-block mr-2 w-4 h-4" />
              Choose Files ({selectedFiles.length}/5)
            </button>
          )}
        </div>

        {/* Image Previews */}
        {imagePreviews.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
              Selected Images ({imagePreviews.length}/5)
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(index);
                    }}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <X size={12} />
                  </button>
                  <div className="absolute bottom-1 left-1 px-2 py-0.5 rounded text-xs bg-white/80 text-gray-900 dark:bg-gray-900/80 dark:text-white">
                    {index === 0 ? "Main" : `#${index + 1}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-xs mt-2 text-gray-500 dark:text-gray-400">
          Recommended: 1280x720px. Supported formats: JPEG, PNG, GIF, WebP. Max
          5MB per image.
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-4 text-gray-700 dark:text-gray-300">
          Gig Video (Optional)
        </label>
        <div className="relative">
          <Video className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="url"
            value={formData.video}
            onChange={(e) => handleInputChange("video", e.target.value)}
            placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
            className="w-full pl-10 pr-4 py-3 rounded-lg border transition-colors bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-green-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
          />
        </div>
        <div className="text-xs mt-2 text-gray-500 dark:text-gray-400">
          Add a video to showcase your service and get more orders
        </div>
      </div>

      <div className="p-6 rounded-lg border bg-blue-50 border-blue-200 dark:bg-gray-800 dark:border-gray-600">
        <div className="flex items-start">
          <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-blue-100 dark:bg-blue-900">
            <Star className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="ml-4">
            <h4 className="font-medium text-blue-800 dark:text-gray-200">
              Pro Tip
            </h4>
            <p className="text-sm mt-1 text-blue-700 dark:text-gray-400">
              High-quality images and videos can increase your gig conversion
              rate by up to 40%. Make sure your first image clearly shows what
              you&apos;re offering!
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    try {
      // Validate form before submission
      const validationErrors = validateForm();
      if (validationErrors.length > 0) {
        setErrorMessage(validationErrors.join(", "));
        setSubmitStatus("error");
        setIsSubmitting(false);
        return;
      }

      // Upload images first (if any)
      let imageUrls: string[] = [];
      if (selectedFiles.length > 0) {
        try {
          imageUrls = await uploadImages(selectedFiles);
        } catch (uploadError) {
          console.error("Image upload failed:", uploadError);
          setErrorMessage("Failed to upload images. Please try again.");
          setSubmitStatus("error");
          setIsSubmitting(false);
          return;
        }
      }

      // Prepare form data for submission
      const submitData = {
        ...formData,
        images: imageUrls,
        // Filter out empty features and FAQs
        features: formData.features.filter((f) => f.trim().length > 0),
        faq: formData.faq.filter((f) => f.question.trim() && f.answer.trim()),
      };

      // Submit to API
      const response = await fetch("/api/create-new-gig", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      setSubmitStatus("success");

      // Reset form after successful submission
      setTimeout(() => {
        resetForm();
        router.push(`/gig?id=${data.gig._id}`);
      }, 1000);
    } catch (error) {
      console.error("Error creating gig:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to create gig. Please try again."
      );
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateForm = () => {
    const errors: string[] = [];

    if (!formData.title.trim()) errors.push("Title is required");
    if (!formData.category) errors.push("Category is required");
    if (!formData.subcategory) errors.push("Subcategory is required");
    if (!formData.price) errors.push("Price must be at least $5");
    if (!formData.deliveryTime) errors.push("Delivery time is required");
    if (!formData.revisions) errors.push("Revisions are required");
    if (!formData.description.trim()) errors.push("Description is required");
    if (formData.features.filter((f) => f.trim()).length === 0)
      errors.push("At least one feature is required");

    return errors;
  };

  const resetForm = () => {
    setFormData({
      title: "",
      price: "",
      originalPrice: undefined,
      images: [],
      video: "",
      badge: "",
      description: "",
      features: [""],
      deliveryTime: "3 days",
      revisions: "1",
      category: "",
      subcategory: "",
      tags: [],
      faq: [{ question: "", answer: "" }],
    });
    setSelectedFiles([]);
    setImagePreviews([]);
    setCurrentStep(1);
  };

  const canGoNext = () => {
    switch (currentStep) {
      case 1:
        return formData.title && formData.category && formData.subcategory;
      case 2:
        return (
          formData.price &&
          formData.deliveryTime &&
          formData.revisions &&
          formData.features.some((f) => f.trim())
        );
      case 3:
        return formData.description.trim().length > 0;
      case 4:
        return true; // Images are optional
      default:
        return false;
    }
  };

  const isFormValid = () => {
    return (
      formData.title &&
      formData.category &&
      formData.subcategory &&
      formData.price &&
      formData.deliveryTime &&
      formData.revisions &&
      formData.description.trim() &&
      formData.features.some((f) => f.trim())
    );
  };

  return (
    <div className="min-h-screen transition-colors duration-200 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="border-b bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Create a New Gig
            </h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {renderStepIndicator()}

        {/* Success/Error Messages */}
        {submitStatus === "success" && (
          <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200">
            <div className="flex items-center">
              <Check className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-green-800 font-medium">
                Gig created successfully! Redirecting...
              </span>
            </div>
          </div>
        )}

        {submitStatus === "error" && errorMessage && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <span className="text-red-800 font-medium">
                Error: {errorMessage}
              </span>
            </div>
          </div>
        )}

        <div className="rounded-xl shadow-sm border bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-8">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 rounded-b-xl">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className={`
            px-6 py-2 rounded-lg border transition-colors
            ${
              currentStep === 1
                ? "opacity-50 cursor-not-allowed"
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
            }
          `}
            >
              Previous
            </button>

            <div className="flex items-center gap-4">
              {currentStep < 4 ? (
                <button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  disabled={!canGoNext()}
                  className={`
                px-8 py-2 rounded-lg transition-colors font-medium
                ${
                  canGoNext()
                    ? "bg-green-500 text-white hover:bg-green-600 shadow-lg"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }
              `}
                >
                  Continue
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!isFormValid() || isSubmitting}
                  className={`
                flex items-center px-8 py-2 rounded-lg transition-colors font-medium
                ${
                  isFormValid() && !isSubmitting
                    ? "bg-green-500 text-white hover:bg-green-600 shadow-lg"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }
              `}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save size={16} className="mr-2" />
                      Publish Gig
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Progress Summary */}
        <div className="mt-6 p-4 rounded-lg bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Step {currentStep} of 4
            </span>
            <div className="flex items-center gap-4">
              <span
                className={`flex items-center ${
                  formData.title
                    ? "text-green-500"
                    : "text-gray-400 dark:text-gray-500"
                }`}
              >
                {formData.title ? "✓" : "○"} Title
              </span>
              <span
                className={`flex items-center ${
                  formData.category
                    ? "text-green-500"
                    : "text-gray-400 dark:text-gray-500"
                }`}
              >
                {formData.category ? "✓" : "○"} Category
              </span>
              <span
                className={`flex items-center ${
                  formData.price
                    ? "text-green-500"
                    : "text-gray-400 dark:text-gray-500"
                }`}
              >
                {formData.price ? "✓" : "○"} Pricing
              </span>
              <span
                className={`flex items-center ${
                  formData.description
                    ? "text-green-500"
                    : "text-gray-400 dark:text-gray-500"
                }`}
              >
                {formData.description ? "✓" : "○"} Description
              </span>
            </div>
          </div>
          <div className="mt-2 h-2 rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-2 bg-green-500 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateGigPage;
