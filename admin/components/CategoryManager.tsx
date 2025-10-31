"use client";
import { useState, useEffect } from "react";
import { Trash2, Edit, Plus, X, Save, Users, Package, Tag, Activity } from "lucide-react";

interface SubCategory {
  value: string;
  label: string;
}

interface Category {
  _id: string;
  value: string;
  label: string;
  subcategories: SubCategory[];
}

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Category creation state
  const [newCategory, setNewCategory] = useState({
    label: "",
  });
  const [newCategorySubs, setNewCategorySubs] = useState([""]);

  // Subcategory addition state
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [newSubcategories, setNewSubcategories] = useState([""]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategory.label) {
      alert("Please fill in the category label");
      return;
    }

    // Filter out empty subcategories - send as simple strings
    const cleanedSubs = newCategorySubs.filter((s) => s.trim() !== "");

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: newCategory.label,
          subcategories: cleanedSubs, // Send as string array
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCategories([data.data, ...categories]);
        setNewCategory({ label: "" });
        setNewCategorySubs([""]);
        alert("Category created successfully!");
      } else {
        alert(data.error || "Failed to create category");
      }
    } catch (error) {
      alert("Failed to create category");
    }
  };

  const handleAddSubcategories = async () => {
    if (!selectedCategoryId) {
      alert("Please select a category");
      return;
    }

    const cleanedSubs = newSubcategories.filter((s) => s.trim() !== "");
    if (cleanedSubs.length === 0) {
      alert("Please add at least one subcategory");
      return;
    }

    try {
      const category = categories.find((c) => c._id === selectedCategoryId);
      if (!category) return;

      // Get existing subcategories and combine with new ones
      const existingSubs = category.subcategories;
      const updatedSubs = [...existingSubs, ...cleanedSubs.map(label => ({ value: label.toLowerCase().replace(/\s+/g, '-'), label }))];

      const res = await fetch(`/api/categories/${selectedCategoryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          value: category.value,
          label: category.label,
          subcategories: updatedSubs, // Send as SubCategory array
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCategories(
          categories.map((c) => (c._id === selectedCategoryId ? data.data : c))
        );
        setNewSubcategories([""]);
        alert("Subcategories added successfully!");
      } else {
        alert(data.error || "Failed to add subcategories");
      }
    } catch (error) {
      alert("Failed to add subcategories");
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      const category = categories.find((c) => c._id === id);
      if (!category) return;

      const res = await fetch(`/api/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          value: category.value,
          label: category.label,
          subcategories: category.subcategories, // Send as SubCategory array
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCategories(categories.map((c) => (c._id === id ? data.data : c)));
        setEditingId(null);
        alert("Category updated successfully!");
      } else {
        alert(data.error || "Failed to update category");
      }
    } catch (error) {
      alert("Failed to update category");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (data.success) {
        setCategories(categories.filter((c) => c._id !== id));
        alert("Category deleted successfully!");
      } else {
        alert(data.error || "Failed to delete category");
      }
    } catch (error) {
      alert("Failed to delete category");
    }
  };

  const updateCategory = (id: string, field: keyof Category, value: string | SubCategory[]) => {
    setCategories(
      categories.map((c) => (c._id === id ? { ...c, [field]: value } : c))
    );
  };

  const addSubcategoryField = (id: string) => {
    const category = categories.find((c) => c._id === id);
    if (!category) return;
    
    updateCategory(id, "subcategories", [
      ...category.subcategories,
      { value: "", label: "" },
    ]);
  };

  const updateSubcategory = (id: string, index: number, field: keyof SubCategory, value: string) => {
    const category = categories.find((c) => c._id === id);
    if (!category) return;
    
    const newSubs = [...category.subcategories];
    newSubs[index] = { ...newSubs[index], [field]: value };
    
    // Auto-generate value from label if label is being updated
    if (field === 'label') {
      newSubs[index].value = value.toLowerCase().replace(/\s+/g, '-');
    }
    
    updateCategory(id, "subcategories", newSubs);
  };

  const removeSubcategory = (id: string, index: number) => {
    const category = categories.find((c) => c._id === id);
    if (!category) return;
    updateCategory(
      id,
      "subcategories",
      category.subcategories.filter((_, i) => i !== index)
    );
  };

  const addNewCategorySubField = () => {
    setNewCategorySubs([...newCategorySubs, ""]);
  };

  const updateNewCategorySub = (index: number, value: string) => {
    const updated = [...newCategorySubs];
    updated[index] = value;
    setNewCategorySubs(updated);
  };

  const removeNewCategorySub = (index: number) => {
    setNewCategorySubs(newCategorySubs.filter((_, i) => i !== index));
  };

  const addNewSubField = () => {
    setNewSubcategories([...newSubcategories, ""]);
  };

  const updateNewSub = (index: number, value: string) => {
    const updated = [...newSubcategories];
    updated[index] = value;
    setNewSubcategories(updated);
  };

  const removeNewSub = (index: number) => {
    setNewSubcategories(newSubcategories.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Activity className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>
    );
  }

  // Stats cards for categories
  const stats = [
    {
      title: 'Total Categories',
      value: categories.length,
      icon: Package,
      color: 'from-blue-500 to-cyan-500',
      change: 'All categories'
    },
    {
      title: 'Total Subcategories',
      value: categories.reduce((sum, cat) => sum + cat.subcategories.length, 0),
      icon: Tag,
      color: 'from-purple-500 to-pink-500',
      change: 'Across all categories'
    },
    {
      title: 'Categories with Subs',
      value: categories.filter(cat => cat.subcategories.length > 0).length,
      icon: Users,
      color: 'from-green-500 to-emerald-500',
      change: 'Has subcategories'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            Category Management
          </h1>
          <p className="text-purple-300">Manage your platform categories and subcategories</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-purple-400/50 transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-green-400 text-sm font-semibold">{stat.change}</span>
              </div>
              <h3 className="text-purple-300 text-sm font-medium mb-1">{stat.title}</h3>
              <p className="text-3xl font-bold text-white">{stat.value.toLocaleString()}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Area 1: Create New Category */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-purple-400/50 transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500">
                <Plus className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Create New Category
                </h2>
                <p className="text-purple-300 text-sm">Add a new main category with subcategories</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-purple-300">
                  Category Label{" "}
                  <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={newCategory.label}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, label: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/5 border border-purple-500/30 rounded-xl focus:border-purple-400 focus:outline-none text-white placeholder-purple-300"
                  placeholder="e.g., Programming & Tech"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-purple-300">
                    Subcategories (Optional)
                  </label>
                  <button
                    onClick={addNewCategorySubField}
                    className="text-blue-400 hover:text-blue-300 text-sm font-semibold transition-colors flex items-center gap-1"
                  >
                    <Plus size={16} />
                    Add Subcategory
                  </button>
                </div>
                {newCategorySubs.map((sub, idx) => (
                  <div key={idx} className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={sub}
                      onChange={(e) => updateNewCategorySub(idx, e.target.value)}
                      className="flex-1 px-4 py-3 bg-white/5 border border-purple-500/30 rounded-xl focus:border-purple-400 focus:outline-none text-white placeholder-purple-300"
                      placeholder="e.g., Web Development"
                    />
                    {newCategorySubs.length > 1 && (
                      <button
                        onClick={() => removeNewCategorySub(idx)}
                        className="text-red-400 hover:text-red-300 p-3 transition-colors hover:bg-white/5 rounded-xl"
                        title="Remove subcategory"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={handleCreateCategory}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-4 rounded-xl hover:from-purple-600 hover:to-pink-600 font-semibold transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-purple-500/25"
              >
                <Plus size={20} />
                Create Category
              </button>
            </div>
          </div>

          {/* Area 2: Add Subcategories */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-green-400/50 transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500">
                <Plus className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Add Subcategories
                </h2>
                <p className="text-purple-300 text-sm">Add subcategories to existing categories</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-purple-300">
                  Select Category{" "}
                  <span className="text-red-400">*</span>
                </label>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-purple-500/30 rounded-xl focus:border-purple-400 focus:outline-none text-white"
                >
                  <option value="" className="bg-slate-800">-- Choose a category --</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id} className="bg-slate-800">
                      {cat.label} ({cat.subcategories.length} subcategories)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-purple-300">
                    Subcategories to Add
                  </label>
                  <button
                    onClick={addNewSubField}
                    className="text-green-400 hover:text-green-300 text-sm font-semibold transition-colors flex items-center gap-1"
                  >
                    <Plus size={16} />
                    Add Field
                  </button>
                </div>
                {newSubcategories.map((sub, idx) => (
                  <div key={idx} className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={sub}
                      onChange={(e) => updateNewSub(idx, e.target.value)}
                      className="flex-1 px-4 py-3 bg-white/5 border border-purple-500/30 rounded-xl focus:border-purple-400 focus:outline-none text-white placeholder-purple-300"
                      placeholder="e.g., Web Development"
                    />
                    {newSubcategories.length > 1 && (
                      <button
                        onClick={() => removeNewSub(idx)}
                        className="text-red-400 hover:text-red-300 p-3 transition-colors hover:bg-white/5 rounded-xl"
                        title="Remove field"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={handleAddSubcategories}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-xl hover:from-green-600 hover:to-emerald-600 font-semibold transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-green-500/25"
              >
                <Plus size={20} />
                Add Subcategories
              </button>
            </div>
          </div>
        </div>

        {/* Area 3: Category Manager */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">
                Category Manager
              </h2>
              <p className="text-purple-300">Manage existing categories and subcategories</p>
            </div>
            <div className="text-purple-300 text-sm">
              {categories.length} total categories
            </div>
          </div>

          {categories.length === 0 ? (
            <div className="text-center py-12 text-purple-300">
              <div className="mb-4">
                <Package className="w-16 h-16 mx-auto text-purple-400 opacity-50" />
              </div>
              <p className="text-lg mb-2">No categories yet</p>
              <p className="text-sm">Create your first category above!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {categories.map((category) => (
                <div
                  key={category._id}
                  className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-purple-400/30 transition-all duration-300"
                >
                  {editingId === category._id ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2 text-purple-300">
                            Label
                          </label>
                          <input
                            type="text"
                            value={category.label}
                            onChange={(e) =>
                              updateCategory(
                                category._id,
                                "label",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 bg-white/5 border border-purple-500/30 rounded-lg focus:border-purple-400 focus:outline-none text-white"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2 text-purple-300">
                            Value (Auto-generated)
                          </p>
                          <div className="w-full px-3 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-purple-300">
                            {category.value}
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-purple-300">
                            Subcategories
                          </label>
                          <button
                            onClick={() => addSubcategoryField(category._id)}
                            className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors flex items-center gap-1"
                          >
                            <Plus size={16} />
                            Add Subcategory
                          </button>
                        </div>
                        {category.subcategories.length === 0 ? (
                          <p className="text-purple-300 text-sm mb-2">
                            No subcategories yet
                          </p>
                        ) : (
                          category.subcategories.map((sub, idx) => (
                            <div key={idx} className="space-y-2 mb-4 p-4 bg-white/5 rounded-xl border border-purple-500/20">
                              <div className="flex gap-2">
                                <div className="flex-1">
                                  <label className="block text-xs font-medium mb-1 text-purple-300">
                                    Subcategory Label
                                  </label>
                                  <input
                                    type="text"
                                    value={sub.label}
                                    onChange={(e) => updateSubcategory(category._id, idx, 'label', e.target.value)}
                                    className="w-full px-3 py-2 bg-white/5 border border-purple-500/30 rounded-lg focus:border-purple-400 focus:outline-none text-white"
                                  />
                                </div>
                                <button
                                  onClick={() => removeSubcategory(category._id, idx)}
                                  className="text-red-400 hover:text-red-300 p-2 transition-colors hover:bg-white/5 rounded-lg self-end"
                                  title="Remove subcategory"
                                >
                                  <X size={18} />
                                </button>
                              </div>
                              <div>
                                <label className="block text-xs font-medium mb-1 text-purple-300">
                                  Value (Auto-generated)
                                </label>
                                <input
                                  type="text"
                                  value={sub.value}
                                  onChange={(e) => updateSubcategory(category._id, idx, 'value', e.target.value)}
                                  className="w-full px-3 py-2 bg-white/10 border border-purple-500/30 rounded-lg focus:border-purple-400 focus:outline-none text-purple-300"
                                />
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="flex gap-3 pt-4">
                        <button
                          onClick={() => handleUpdate(category._id)}
                          className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300 flex-1 justify-center shadow-lg hover:shadow-green-500/25"
                        >
                          <Save size={16} />
                          Save Changes
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-6 py-3 border border-purple-500/30 rounded-lg hover:bg-white/5 text-purple-300 transition-colors flex-1"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-2">
                            {category.label}
                          </h3>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-purple-300">
                              Value: <code className="bg-white/10 px-2 py-1 rounded text-purple-200">{category.value}</code>
                            </span>
                            <span className="text-purple-400">
                              {category.subcategories.length} subcategory(ies)
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingId(category._id)}
                            className="text-blue-400 hover:text-blue-300 p-3 hover:bg-white/5 rounded-xl transition-colors"
                            title="Edit"
                          >
                            <Edit size={20} />
                          </button>
                          <button
                            onClick={() => handleDelete(category._id)}
                            className="text-red-400 hover:text-red-300 p-3 hover:bg-white/5 rounded-xl transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>

                      {category.subcategories.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-3 text-sm text-purple-300">
                            Subcategories:
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {category.subcategories.map((sub, idx) => (
                              <div
                                key={idx}
                                className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 p-3 rounded-xl"
                              >
                                <div className="text-sm font-medium text-purple-200">{sub.label}</div>
                                <div className="text-xs text-purple-300 mt-1">Value: {sub.value}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}