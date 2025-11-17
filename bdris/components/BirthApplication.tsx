"use client";

import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";

// Mock data for countries and nationalities
const countriesList = [
  {
    id: "1",
    nameBn: "বাংলাদেশ",
    nameEn: "BANGLADESH",
    geoId: "0",
    targetGeoOrder: 0,
  },
  {
    id: "7380",
    nameBn: "আলজেরিয়া",
    nameEn: "ALGERIA",
    geoId: "10",
    targetGeoOrder: 0,
  },
  {
    id: "5726",
    nameBn: "অস্ট্রেলিয়া",
    nameEn: "AUSTRALIA",
    geoId: "10",
    targetGeoOrder: 0,
  },
];

const nationalityOptions = [
  { value: "", labelBn: "---নির্বাচন করুন---", labelEn: "---Select---" },
  { value: "-1", labelBn: "অজানা", labelEn: "Unknown" },
  { value: "1", labelBn: "বাংলাদেশী", labelEn: "Bangladeshi" },
  { value: "2", labelBn: "মালয়েশিয়া", labelEn: "Malaysian" },
];

// Types
interface GeoLocation {
  id: string;
  nameBn: string;
  nameEn: string;
  geoLevelId?: number;
  targetGeoOrder?: number;
  geoId?: string;
}

interface Address {
  country: string;
  geoId: string;
  division: string;
  divisionName: string;
  district: string;
  districtName: string;
  cityCorpCantOrUpazila: string;
  upazilaName: string;
  paurasavaOrUnion: string;
  unionName: string;
  postOfc: string;
  postOfcEn: string;
  vilAreaTownBn: string;
  vilAreaTownEn: string;
  houseRoadBn: string;
  houseRoadEn: string;
  ward: string;
  wardName: string;
}

interface GeoSelectorProps {
  onApply: (address: Address) => void;
  initial?: Partial<Address>;
  label?: string;
  required?: boolean;
  validateOnNext?: boolean;
  buttonText?: string;
}

interface LoadingState {
  division: boolean;
  district: boolean;
  upazila: boolean;
  union: boolean;
  ward: boolean;
}

interface OptionsState {
  division: GeoLocation[];
  district: GeoLocation[];
  upazila: GeoLocation[];
  union: GeoLocation[];
  ward: GeoLocation[];
}

interface GeoResponse {
  geoObject: GeoLocation[];
}

// Address Selector Modal Component
const AddressSelectorModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onApply: (address: Address) => void;
  initial?: Partial<Address>;
  title: string;
}> = ({ isOpen, onClose, onApply, initial, title }) => {
  const [selected, setSelected] = useState({
    country: initial?.country || "-1",
    division: initial?.division || "-1",
    district: initial?.district || "-1",
    upazila: initial?.cityCorpCantOrUpazila || "-1",
    union: initial?.paurasavaOrUnion || "-1",
    ward: initial?.ward || "-1",
  });

  const [addressInputs, setAddressInputs] = useState({
    postOfc: initial?.postOfc || "",
    postOfcEn: initial?.postOfcEn || "",
    vilAreaTownBn: initial?.vilAreaTownBn || "",
    vilAreaTownEn: initial?.vilAreaTownEn || "",
    houseRoadBn: initial?.houseRoadBn || "",
    houseRoadEn: initial?.houseRoadEn || "",
  });

  const [loading, setLoading] = useState<LoadingState>({
    division: false,
    district: false,
    upazila: false,
    union: false,
    ward: false,
  });

  const [options, setOptions] = useState<OptionsState>({
    division: [],
    district: [],
    upazila: [],
    union: [],
    ward: [],
  });

  const [wardLabel, setWardLabel] = useState("ওয়ার্ড");
  const [showWardSection, setShowWardSection] = useState(false);

  const api = "/api/address?ajax=1";

  const refs = {
    country: useRef<HTMLSelectElement>(null),
    division: useRef<HTMLSelectElement>(null),
    district: useRef<HTMLSelectElement>(null),
    upazila: useRef<HTMLSelectElement>(null),
    union: useRef<HTMLSelectElement>(null),
    ward: useRef<HTMLSelectElement>(null),
  };

  const showLoading = (field: keyof LoadingState, visible: boolean) => {
    setLoading((prev) => ({ ...prev, [field]: visible }));
  };

  const clearSelects = (fields: (keyof OptionsState)[]) => {
    setOptions((prev) => {
      const newOptions = { ...prev };
      fields.forEach((field) => {
        newOptions[field] = [];
      });
      return newOptions;
    });
  };

  const buildUrl = (
    parentId: string,
    order: string,
    type: string,
    ward = false
  ) => {
    const wardParam = ward ? "&ward=true" : "";
    return `${api}&parent=${encodeURIComponent(
      parentId
    )}&geoGroup=birthPlace&geoOrder=${order}&geoType=${encodeURIComponent(
      type
    )}${wardParam}`;
  };

  const loadGeo = async (
    target: keyof OptionsState,
    parentId: string,
    order: string,
    type: string,
    ward = false
  ): Promise<GeoLocation[]> => {
    if (!parentId || parentId === "-1") return [];

    showLoading(target, true);
    const url = buildUrl(parentId, order, type, ward);

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data: GeoResponse = await response.json();
      const list = Array.isArray(data.geoObject) ? data.geoObject : [];

      const safeList = list.map((item) => ({
        ...item,
        nameBn: (item.nameBn || "").replace(/</g, "&lt;"),
        nameEn: (item.nameEn || "").replace(/</g, "&lt;"),
      }));

      setOptions((prev) => ({ ...prev, [target]: safeList }));

      if (target === "ward") {
        setShowWardSection(safeList.length > 0);
      }

      return safeList;
    } catch (error) {
      console.error("Error loading geo data:", error);
      toast.error("লোড করতে সমস্যা হয়েছে");

      if (target === "ward") {
        setShowWardSection(false);
      }

      return [];
    } finally {
      showLoading(target, false);
    }
  };

  const getParams = (ref: React.RefObject<HTMLSelectElement>) => {
    const selectElement = ref.current;
    if (!selectElement?.selectedOptions?.[0]) return null;

    const option = selectElement.selectedOptions[0];
    return {
      parentId: option.value,
      nextOrder: option.dataset.nextOrder ?? "",
      nextType: option.dataset.nextType ?? "",
      currentType: option.dataset.currentType ?? "",
    };
  };

  const handleAddressInputChange = (
    field: keyof typeof addressInputs,
    value: string
  ) => {
    setAddressInputs((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCountry = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelected((prev) => ({
      ...prev,
      country: value,
      division: "-1",
      district: "-1",
      upazila: "-1",
      union: "-1",
      ward: "-1",
    }));

    clearSelects(["division", "district", "upazila", "union", "ward"]);
    setShowWardSection(false);

    if (value === "1") {
      loadGeo("division", "1", "0", "0");
    }
  };

  const handleDivision = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelected((prev) => ({
      ...prev,
      division: value,
      district: "-1",
      upazila: "-1",
      union: "-1",
      ward: "-1",
    }));

    clearSelects(["district", "upazila", "union", "ward"]);
    setShowWardSection(false);

    if (!value || value === "-1") return;

    const params = getParams(
      refs.division as React.RefObject<HTMLSelectElement>
    );
    if (!params) return;

    loadGeo(
      "district",
      params.parentId,
      params.nextOrder || "1",
      params.nextType || "1"
    );
  };

  const handleDistrict = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelected((prev) => ({
      ...prev,
      district: value,
      upazila: "-1",
      union: "-1",
      ward: "-1",
    }));

    clearSelects(["upazila", "union", "ward"]);
    setShowWardSection(false);

    if (!value || value === "-1") return;

    const params = getParams(
      refs.district as React.RefObject<HTMLSelectElement>
    );
    if (!params) return;

    loadGeo(
      "upazila",
      params.parentId,
      params.nextOrder || "2",
      params.nextType || "2"
    );
  };

  const handleUpazila = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelected((prev) => ({
      ...prev,
      upazila: value,
      union: "-1",
      ward: "-1",
    }));

    clearSelects(["union", "ward"]);
    setShowWardSection(false);

    if (!value || value === "-1") return;

    const params = getParams(
      refs.upazila as React.RefObject<HTMLSelectElement>
    );
    if (!params) return;

    const upazilaId = params.parentId;
    showLoading("union", true);

    Promise.all([
      fetch(buildUrl(upazilaId, "3", "8"))
        .then((r) => r.json())
        .catch(() => ({ geoObject: [] })),
      fetch(buildUrl(upazilaId, "3", "7", true))
        .then((r) => r.json())
        .catch(() => ({ geoObject: [] })),
      fetch(buildUrl(upazilaId, "3", "3"))
        .then((r) => r.json())
        .catch(() => ({ geoObject: [] })),
    ])
      .then(([city, canton, union]) => {
        const allGeoLocations: GeoLocation[] = [];

        [city, canton, union].forEach((data) => {
          const list = (data as GeoResponse).geoObject || [];
          list.forEach((item) =>
            allGeoLocations.push({
              ...item,
              nameBn: (item.nameBn || "").replace(/</g, "&lt;"),
              nameEn: (item.nameEn || "").replace(/</g, "&lt;"),
            })
          );
        });

        setOptions((prev) => ({ ...prev, union: allGeoLocations }));
      })
      .catch((error) => {
        console.error("Error loading union data:", error);
        toast.error("ইউনিয়ন লোড করতে সমস্যা হয়েছে");
      })
      .finally(() => {
        showLoading("union", false);
      });
  };

  const handleUnion = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelected((prev) => ({
      ...prev,
      union: value,
      ward: "-1",
    }));

    clearSelects(["ward"]);
    setShowWardSection(false);

    if (!value || value === "-1") return;

    const params = getParams(refs.union as React.RefObject<HTMLSelectElement>);
    if (!params) return;

    const unionType = params.currentType;

    if (unionType === "7") {
      setWardLabel("ওয়ার্ড (ক্যান্টনমেন্ট)");
    } else if (unionType === "8") {
      setWardLabel("ওয়ার্ড (সিটি)");
    } else {
      setWardLabel("ওয়ার্ড");
    }

    let wardType = "5";
    if (unionType === "8") wardType = "9";
    else if (unionType === "7") wardType = "6";

    loadGeo("ward", params.parentId, "4", wardType, true);
  };

  const handleWard = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelected((prev) => ({ ...prev, ward: e.target.value }));
  };

  const buildAddress = (): Address | null => {
    const getCountry = () => {
      return (
        countriesList.find((country) => country.id === selected.country) || null
      );
    };

    const getGeoLocation = (field: keyof typeof selected) => {
      const id = selected[field];
      if (!id || id === "-1") return null;

      const list = options[field as keyof OptionsState] as GeoLocation[];
      return list.find((item) => item.id.toString() === id.toString()) ?? null;
    };

    const country = getCountry();
    if (!country || country.id === "-1") {
      toast.error("দয়া করে একটি দেশ নির্বাচন করুন");
      return null;
    }

    const division = getGeoLocation("division");
    const district = getGeoLocation("district");
    const upazila = getGeoLocation("upazila");
    const union = getGeoLocation("union");
    const ward = getGeoLocation("ward");

    if (country.id === "1") {
      if (!division || !district || !upazila || !union) {
        toast.error("দয়া করে সকল প্রয়োজনীয় ঠিকানা তথ্য নির্বাচন করুন");
        return null;
      }

      if (showWardSection && selected.ward && selected.ward !== "-1" && !ward) {
        toast.error("দয়া করে ওয়ার্ড নির্বাচন করুন");
        return null;
      }
    }

    if (country.id !== "1") {
      if (
        !addressInputs.vilAreaTownBn.trim() &&
        !addressInputs.vilAreaTownEn.trim()
      ) {
        toast.error("দয়া করে ঠিকানা লিখুন (বাংলা বা ইংরেজিতে)");
        return null;
      }
    }

    return {
      country: country.id,
      geoId: country.geoId || "0",
      division: division?.id || "-1",
      divisionName: division?.nameBn || "",
      district: district?.id || "-1",
      districtName: district?.nameBn || "",
      cityCorpCantOrUpazila: upazila?.id || "-1",
      upazilaName: upazila?.nameBn || "",
      paurasavaOrUnion: union?.id || "-1",
      unionName: union?.nameBn || "",
      postOfc: addressInputs.postOfc || "",
      postOfcEn: addressInputs.postOfcEn || "",
      vilAreaTownBn: addressInputs.vilAreaTownBn || "",
      vilAreaTownEn: addressInputs.vilAreaTownEn || "",
      houseRoadBn: addressInputs.houseRoadBn || "",
      houseRoadEn: addressInputs.houseRoadEn || "",
      ward: ward?.id ?? "-1",
      wardName: ward?.nameBn ?? "",
    };
  };

  const handleApply = () => {
    const address = buildAddress();
    if (address) {
      onApply(address);
      onClose();
    }
  };

  // Reset form when modal opens with initial values
  useEffect(() => {
    if (isOpen && initial) {
      setSelected({
        country: initial?.country || "-1",
        division: initial?.division || "-1",
        district: initial?.district || "-1",
        upazila: initial?.cityCorpCantOrUpazila || "-1",
        union: initial?.paurasavaOrUnion || "-1",
        ward: initial?.ward || "-1",
      });

      setAddressInputs({
        postOfc: initial?.postOfc || "",
        postOfcEn: initial?.postOfcEn || "",
        vilAreaTownBn: initial?.vilAreaTownBn || "",
        vilAreaTownEn: initial?.vilAreaTownEn || "",
        houseRoadBn: initial?.houseRoadBn || "",
        houseRoadEn: initial?.houseRoadEn || "",
      });

      // Load initial data if country is Bangladesh
      if (initial.country === "1") {
        loadGeo("division", "1", "0", "0");
      }
    }
  }, [isOpen, initial]);

  const renderSelect = (
    id: string,
    label: string,
    value: string,
    list: GeoLocation[],
    isLoading: boolean,
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void,
    ref?: React.RefObject<HTMLSelectElement>,
    includeMeta = true
  ) => (
    <div className="space-y-1">
      <label htmlFor={id} className="block font-medium text-gray-700">
        {label} <span className="text-red-500">*</span>
      </label>
      <select
        id={id}
        ref={ref}
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        disabled={isLoading}
      >
        <option value="-1">-- নির্বাচন করুন --</option>
        {list.map((item, index) => {
          if (!includeMeta) {
            return (
              <option key={`${id}-${item.id}-${index}`} value={item.id}>
                {item.nameBn}
              </option>
            );
          }

          const nextOrder = item.targetGeoOrder?.toString() ?? "";
          const nextType = item.geoLevelId?.toString() ?? "";
          const currentType = item.geoLevelId?.toString() ?? "";

          return (
            <option
              key={`${id}-${item.id}-${index}`}
              value={item.id}
              data-next-order={nextOrder}
              data-next-type={nextType}
              data-current-type={currentType}
            >
              {item.nameBn}
            </option>
          );
        })}
      </select>
      {isLoading && <p className="text-sm text-blue-600">লোড হচ্ছে...</p>}
    </div>
  );

  const renderAddressInputs = () => (
    <div className="space-y-4 mt-4 p-4 bg-gray-50 rounded-lg">
      <h4 className="font-semibold text-gray-800">অতিরিক্ত ঠিকানা তথ্য</h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-medium mb-1 text-gray-700">
            ডাকঘর (বাংলায়)
          </label>
          <input
            type="text"
            value={addressInputs.postOfc}
            onChange={(e) =>
              handleAddressInputChange("postOfc", e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="ডাকঘরের নাম বাংলায়"
          />
        </div>

        <div>
          <label className="block font-medium mb-1 text-gray-700">
            ডাকঘর (ইংরেজিতে)
          </label>
          <input
            type="text"
            value={addressInputs.postOfcEn}
            onChange={(e) =>
              handleAddressInputChange("postOfcEn", e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Post Office Name in English"
          />
        </div>

        <div>
          <label className="block font-medium mb-1 text-gray-700">
            গ্রাম / পাড়া / মহল্লা{" "}
            {selected.country !== "1" && (
              <span className="text-red-500">*</span>
            )}
          </label>
          <textarea
            value={addressInputs.vilAreaTownBn}
            onChange={(e) =>
              handleAddressInputChange("vilAreaTownBn", e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="গ্রাম/পাড়া/মহল্লার নাম বাংলায়"
            rows={3}
            required={selected.country !== "1"}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            গ্রাম / পাড়া / মহল্লা (ইংরেজি){" "}
            {selected.country !== "1" && (
              <span className="text-red-500">*</span>
            )}
          </label>
          <textarea
            value={addressInputs.vilAreaTownEn}
            onChange={(e) =>
              handleAddressInputChange("vilAreaTownEn", e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Village/Area/Town in English"
            rows={3}
            required={selected.country !== "1"}
          />
        </div>

        <div>
          <label className="block font-medium mb-1 text-gray-700">
            বাসা ও সড়ক (নাম, নম্বর)
          </label>
          <textarea
            value={addressInputs.houseRoadBn}
            onChange={(e) =>
              handleAddressInputChange("houseRoadBn", e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="বাসা ও সড়কের বিবরণ বাংলায়"
            rows={3}
          />
        </div>

        <div>
          <label className="block font-medium mb-1 text-gray-700">
            বাসা ও সড়ক (নাম, নম্বর) (ইংরেজি)
          </label>
          <textarea
            value={addressInputs.houseRoadEn}
            onChange={(e) =>
              handleAddressInputChange("houseRoadEn", e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="House and Road details in English"
            rows={3}
          />
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        </div>

        <div className="p-6 space-y-6">
          {renderSelect(
            "country",
            "দেশ",
            selected.country,
            countriesList,
            false,
            handleCountry,
            refs.country as React.RefObject<HTMLSelectElement>,
            false
          )}

          {selected.country === "1" && (
            <>
              {renderSelect(
                "division",
                "বিভাগ",
                selected.division,
                options.division,
                loading.division,
                handleDivision,
                refs.division as React.RefObject<HTMLSelectElement>,
              )}

              {selected.division &&
                selected.division !== "-1" &&
                renderSelect(
                  "district",
                  "জেলা",
                  selected.district,
                  options.district,
                  loading.district,
                  handleDistrict,
                  refs.district  as React.RefObject<HTMLSelectElement>,
                )}

              {selected.district &&
                selected.district !== "-1" &&
                renderSelect(
                  "upazila",
                  "উপজেলা/সিটি কর্পোরেশন",
                  selected.upazila,
                  options.upazila,
                  loading.upazila,
                  handleUpazila,
                  refs.upazila as React.RefObject<HTMLSelectElement>,
                )}

              {selected.upazila && selected.upazila !== "-1" && (
                <>
                  <label className="block font-medium text-gray-700">
                    ইউনিয়ন / পৌরসভা / ক্যান্টনমেন্ট{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="union"
                    ref={refs.union}
                    value={selected.union}
                    onChange={handleUnion}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={loading.union}
                  >
                    <option value="-1">-- নির্বাচন করুন --</option>
                    {options.union.map((location, index) => {
                      const nextOrder = "4";
                      let nextType = "5";
                      let currentType = "3";

                      if (location.geoLevelId === 8) {
                        nextType = "9";
                        currentType = "8";
                      } else if (location.geoLevelId === 7) {
                        nextType = "6";
                        currentType = "7";
                      }

                      return (
                        <option
                          key={`union-${location.id}-${index}`}
                          value={location.id}
                          data-next-order={nextOrder}
                          data-next-type={nextType}
                          data-current-type={currentType}
                        >
                          {location.nameBn}
                        </option>
                      );
                    })}
                  </select>
                  {loading.union && (
                    <p className="text-sm text-blue-600">লোড হচ্ছে...</p>
                  )}
                </>
              )}

              {showWardSection &&
                selected.union &&
                selected.union !== "-1" &&
                renderSelect(
                  "ward",
                  wardLabel,
                  selected.ward,
                  options.ward,
                  loading.ward,
                  handleWard,
                  refs.ward as React.RefObject<HTMLSelectElement>,
                  false
                )}
            </>
          )}

          {(selected.country === "1" ||
            (selected.country &&
              selected.country !== "1" &&
              selected.country !== "-1")) &&
            renderAddressInputs()}
        </div>

        <div className="p-6 border-t flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            বাতিল
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            প্রয়োগ করুন
          </button>
        </div>
      </div>
    </div>
  );
};

// Updated BDRISGeoSelector with Modal
const BDRISGeoSelector: React.FC<GeoSelectorProps> = ({
  onApply,
  initial,
  label = "ঠিকানা",
  required = true,
  validateOnNext = false,
  buttonText = "ঠিকানা নির্বাচন করুন",
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [hasValidAddress, setHasValidAddress] = useState(false);

  const handleApply = (address: Address) => {
    setSelectedAddress(address);
    onApply(address);
    setHasValidAddress(true);
  };

  const getAddressSummary = () => {
    if (!selectedAddress) return null;

    if (selectedAddress.country === "1") {
      // Bangladesh address
      const parts = [
        selectedAddress.vilAreaTownBn,
        selectedAddress.unionName,
        selectedAddress.upazilaName,
        selectedAddress.districtName,
        selectedAddress.divisionName,
      ].filter(Boolean);

      return parts.join(", ");
    } else {
      // Foreign address
      const country = countriesList.find(
        (c) => c.id === selectedAddress.country
      );
      return `${selectedAddress.vilAreaTownBn}, ${country?.nameBn || "বিদেশ"}`;
    }
  };

  // Only validate and apply when validateOnNext is true and we need to validate
  useEffect(() => {
    if (validateOnNext && !hasValidAddress) {
      toast.error("দয়া করে ঠিকানা নির্বাচন করুন");
    }
  }, [validateOnNext, hasValidAddress]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block font-semibold text-gray-800">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {hasValidAddress && (
          <span className="text-green-600 text-sm">
            ✓ ঠিকানা নির্বাচন করা হয়েছে
          </span>
        )}
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="w-full px-4 py-3 bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg text-blue-700 hover:bg-blue-100 hover:border-blue-400 transition-colors flex flex-col items-center justify-center"
        >
          <svg
            className="w-6 h-6 mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          <span className="font-medium">{buttonText}</span>
        </button>

        {selectedAddress && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">
              নির্বাচিত ঠিকানা:
            </h4>
            <p className="text-green-700 text-sm">{getAddressSummary()}</p>
            {selectedAddress.houseRoadBn && (
              <p className="text-green-600 text-sm mt-1">
                বাসা/সড়ক: {selectedAddress.houseRoadBn}
              </p>
            )}
            {selectedAddress.postOfc && (
              <p className="text-green-600 text-sm">
                ডাকঘর: {selectedAddress.postOfc}
              </p>
            )}
          </div>
        )}
      </div>

      <AddressSelectorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onApply={handleApply}
        initial={selectedAddress || initial}
        title={label}
      />
    </div>
  );
};

// Main Form Data Interface
interface PersonInfo {
  personFirstNameBn: string;
  personLastNameBn: string;
  personNameBn: string;
  personFirstNameEn: string;
  personLastNameEn: string;
  personNameEn: string;
  personBirthDate: string;
  thChild: string;
  gender: string;
  religion: string;
  religionOther: string;
  personNid: string;
}

interface ParentInfo {
  id: string;
  ubrn: string;
  personBirthDate: string;
  personNameBn: string;
  personNameEn: string;
  personNid: string;
  passportNumber: string;
  personNationality: string;
}

interface ApplicantInfo {
  name: string;
  nid: string;
  phone: string;
  email: string;
  relation: string;
}

interface FormData {
  officeAddressType: "BIRTHPLACE" | "PERMANENT" | "MISSION" | "";
  officeAddrCountry: string;
  officeAddrDivision: string;
  officeAddrDistrict: string;
  officeAddrUpazila: string;
  officeAddrUnion: string;
  officeAddrWard: string;
  officeAddrOffice: string;
  officeId: string;

  personInfoForBirth: PersonInfo;

  birthPlaceAddress: Address | null;

  father: ParentInfo;

  mother: ParentInfo;

  copyBirthPlaceToPermAddr: boolean;
  permAddrAddress: Address | null;

  applicant: ApplicantInfo;
}

interface BirthRegistrationFormProps {
  csrf: string;
  cookieString: string;
}

// File upload state for drag and drop
interface UploadingFile {
  file: File;
  fileTypeId: string;
  progress: number;
  isUploading: boolean;
}

// File type interface
interface FileType {
  id: string;
  name: string;
}

// Uploaded file interface
interface UploadedFile {
  id: string;
  name: string;
  url: string;
  attachmentTypeId: string;
  fileType?: string;
  size: number;
  uploadedId?: string;
  isUploading?: boolean;
  progress?: number;
  deleteUrl?: string;
  fileTypeId?: string;
  fileCategory?: string;
}

// Type-safe nested object update helpers
type NestedFormSection = PersonInfo | ParentInfo | ApplicantInfo;

const isPersonInfo = (obj: NestedFormSection): obj is PersonInfo => {
  return 'personFirstNameBn' in obj && 'personLastNameBn' in obj;
};

const isParentInfo = (obj: NestedFormSection): obj is ParentInfo => {
  return 'personNameBn' in obj && 'personNationality' in obj && 'ubrn' in obj;
};

const isApplicantInfo = (obj: NestedFormSection): obj is ApplicantInfo => {
  return 'name' in obj && 'phone' in obj && 'relation' in obj;
};

// Helper function to safely set nested object properties
const setNestedValue = <T extends NestedFormSection>(
  obj: T,
  field: keyof T,
  value: string
): T => {
  return {
    ...obj,
    [field]: value
  };
};

// Main Birth Registration Form Component
export default function BirthRegistrationForm({
  csrf,
  cookieString,
}: BirthRegistrationFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    officeAddressType: "",
    officeAddrCountry: "",
    officeAddrDivision: "",
    officeAddrDistrict: "",
    officeAddrUpazila: "",
    officeAddrUnion: "",
    officeAddrWard: "",
    officeAddrOffice: "",
    officeId: "",
    personInfoForBirth: {
      personFirstNameBn: "",
      personLastNameBn: "",
      personNameBn: "",
      personFirstNameEn: "",
      personLastNameEn: "",
      personNameEn: "",
      personBirthDate: "",
      thChild: "",
      gender: "",
      religion: "NOT_APPLICABLE",
      religionOther: "",
      personNid: "",
    },
    birthPlaceAddress: null,
    father: {
      id: "",
      ubrn: "",
      personBirthDate: "",
      personNameBn: "",
      personNameEn: "",
      personNid: "",
      passportNumber: "",
      personNationality: "",
    },
    mother: {
      id: "",
      ubrn: "",
      personBirthDate: "",
      personNameBn: "",
      personNameEn: "",
      personNid: "",
      passportNumber: "",
      personNationality: "",
    },
    copyBirthPlaceToPermAddr: false,
    permAddrAddress: null,
    applicant: {
      name: "",
      nid: "",
      phone: "",
      email: "",
      relation: "",
    },
  });
  
  console.log(cookieString);
  console.log(csrf);
  
  const [bdMissionChecked, setBdMissionChecked] = useState(false);
  const [age, setAge] = useState<{
    years: number;
    months: number;
    days: number;
  }>({ years: 0, months: 0, days: 0 });
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  // Drag and drop state
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validation triggers for geo selectors
  const [validateBirthPlace, setValidateBirthPlace] = useState(false);
  const [validatePermAddress, setValidatePermAddress] = useState(false);

  // Mock file types
  const fileTypes: FileType[] = [
    { id: "1", name: "জন্ম সনদ" },
    { id: "2", name: "জাতীয় পরিচয়পত্র" },
    { id: "3", name: "পাসপোর্ট" },
    { id: "4", name: "ছবি" },
  ];

  const handleInputChange = (
    field: keyof FormData,
    value: string | boolean | Address | null
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  function calculateAge(birthDateString: string): {
    years: number;
    months: number;
    days: number;
  } {
    const birthDate = new Date(birthDateString);
    const today = new Date();

    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    // Adjust days
    if (days < 0) {
      months--;
      const previousMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        0
      ).getDate();
      days += previousMonth;
    }

    // Adjust months
    if (months < 0) {
      years--;
      months += 12;
    }

    return { years, months, days };
  }

  const handleNestedInputChange = (
    section: keyof Pick<
      FormData,
      "personInfoForBirth" | "father" | "mother" | "applicant"
    >,
    field: string,
    value: string
  ) => {
    setFormData((prev) => {
      const currentSection = prev[section];
      
      // Type-safe update based on section type
      if (section === "personInfoForBirth" && isPersonInfo(currentSection)) {
        return {
          ...prev,
          [section]: setNestedValue(currentSection, field as keyof PersonInfo, value),
        };
      } else if ((section === "father" || section === "mother") && isParentInfo(currentSection)) {
        return {
          ...prev,
          [section]: setNestedValue(currentSection, field as keyof ParentInfo, value),
        };
      } else if (section === "applicant" && isApplicantInfo(currentSection)) {
        return {
          ...prev,
          [section]: setNestedValue(currentSection, field as keyof ApplicantInfo, value),
        };
      }
      
      return prev;
    });
  };

  const handleBirthPlaceAddress = (address: Address) => {
    setFormData((prev) => ({
      ...prev,
      birthPlaceAddress: address,
    }));
  };

  const handlePermAddrAddress = (address: Address) => {
    setFormData((prev) => ({
      ...prev,
      permAddrAddress: address,
    }));
  };

  const handleBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const birthDate = e.target.value;
    handleNestedInputChange("personInfoForBirth", "personBirthDate", birthDate);
    setAge(calculateAge(birthDate));
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    handleFilesSelection(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFilesSelection(files);
  };

  const handleFilesSelection = (files: File[]) => {
    const newUploadingFiles: UploadingFile[] = files.map((file) => ({
      file,
      fileTypeId: "-1",
      progress: 0,
      isUploading: false,
    }));

    setUploadingFiles((prev) => [...prev, ...newUploadingFiles]);
  };

  const updateUploadingFileType = (index: number, fileTypeId: string) => {
    setUploadingFiles((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, fileTypeId } : item))
    );
  };

  const handleFileUpload = async (index: number) => {
    const uploadingFile = uploadingFiles[index];
    if (!uploadingFile || uploadingFile.fileTypeId === "-1") {
      toast.error("দয়া করে ফাইল টাইপ নির্বাচন করুন");
      return;
    }

    // Update uploading state
    setUploadingFiles((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, isUploading: true, progress: 0 } : item
      )
    );

    // Simulate file upload
    try {
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        setUploadingFiles((prev) =>
          prev.map((item, idx) =>
            idx === index ? { ...item, progress } : item
          )
        );
      }

      // Create uploaded file entry
      const uploadedFile: UploadedFile = {
        id: `file-${Date.now()}-${index}`,
        name: uploadingFile.file.name,
        url: URL.createObjectURL(uploadingFile.file),
        attachmentTypeId: uploadingFile.fileTypeId,
        fileType: fileTypes.find((t) => t.id === uploadingFile.fileTypeId)
          ?.name,
        size: uploadingFile.file.size,
      };

      // Add to uploaded files
      setUploadedFiles((prev) => [...prev, uploadedFile]);

      // Remove from uploading files
      setUploadingFiles((prev) => prev.filter((_, idx) => idx !== index));

      toast.success("ফাইল সফলভাবে আপলোড হয়েছে");
    } catch (error) {
      toast.error("ফাইল আপলোড ব্যর্থ হয়েছে");
      setUploadingFiles((prev) =>
        prev.map((item, idx) =>
          idx === index ? { ...item, isUploading: false } : item
        )
      );
    }
  };

  const removeUploadingFile = (index: number) => {
    setUploadingFiles((prev) => prev.filter((_, idx) => idx !== index));
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      // Reset validation triggers
      setValidateBirthPlace(false);
      setValidatePermAddress(false);

      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    // Reset validation triggers
    setValidateBirthPlace(false);
    setValidatePermAddress(false);

    setCurrentStep((prev) => prev - 1);
  };

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1:
        if (!formData.officeAddressType) {
          toast.error("দয়া করে অফিসের ধরন নির্বাচন করুন");
          return false;
        }

        // Only validate office address fields if MISSION is selected
        if (formData.officeAddressType === "MISSION") {
          if (!formData.officeAddrCountry) {
            toast.error("দয়া করে দেশ নির্বাচন করুন");
            return false;
          }
          if (!formData.officeAddrOffice) {
            toast.error("দয়া করে অফিস নির্বাচন করুন");
            return false;
          }
        }

        // For BIRTHPLACE and PERMANENT, no need to validate office address fields
        return true;

      case 2:
        // Validate personal information
        if (
          !formData.personInfoForBirth.personFirstNameBn ||
          !formData.personInfoForBirth.personLastNameBn ||
          !formData.personInfoForBirth.personBirthDate ||
          !formData.personInfoForBirth.gender ||
          !formData.personInfoForBirth.thChild
        ) {
          toast.error("দয়া করে সকল প্রয়োজনীয় তথ্য প্রদান করুন");
          return false;
        }

        // Trigger validation for birth place address
        setValidateBirthPlace(true);

        // Wait a bit for the validation to complete, then check
        setTimeout(() => {
          if (!formData.birthPlaceAddress) {
            toast.error("দয়া করে জন্মস্থানের ঠিকানা সম্পূর্ণ করুন");
          }
        }, 100);

        return !!formData.birthPlaceAddress;

      case 3:
        if (
          !formData.father.personNameBn ||
          !formData.father.personNationality ||
          !formData.mother.personNameBn ||
          !formData.mother.personNationality
        ) {
          toast.error("দয়া করে পিতা-মাতার সকল প্রয়োজনীয় তথ্য প্রদান করুন");
          return false;
        }
        return true;

      case 4:
        if (!formData.copyBirthPlaceToPermAddr) {
          // Trigger validation for permanent address
          setValidatePermAddress(true);

          // Wait a bit for the validation to complete, then check
          setTimeout(() => {
            if (!formData.permAddrAddress) {
              toast.error("দয়া করে স্থায়ী ঠিকানা সম্পূর্ণ করুন");
            }
          }, 100);

          if (!formData.permAddrAddress) {
            return false;
          }
        }

        if (
          !formData.applicant.name ||
          !formData.applicant.phone ||
          !formData.applicant.relation
        ) {
          toast.error("দয়া করে আবেদনকারীর সকল প্রয়োজনীয় তথ্য প্রদান করুন");
          return false;
        }

        // Check if at least one file is uploaded
        if (uploadedFiles.length === 0) {
          toast.error("দয়া করে কমপক্ষে একটি ডকুমেন্ট আপলোড করুন");
          return false;
        }

        // Check if all files have file types selected
        const filesWithoutTypes = uploadedFiles.filter(
          (file) => !file.fileType
        );
        if (filesWithoutTypes.length > 0) {
          toast.error("দয়া করে সকল ফাইলের জন্য ফাইল টাইপ নির্বাচন করুন");
          return false;
        }

        // Check if all files are uploaded
        const pendingUploads = uploadedFiles.filter(
          (file) => !file.uploadedId && !file.isUploading
        );
        if (pendingUploads.length > 0) {
          toast.error("দয়া করে সকল ফাইল আপলোড সম্পন্ন করুন");
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateCurrentStep()) {
      return;
    }

    try {
      // Prepare final data according to your API structure
      const submissionData = {
        _csrf: csrf,
        officeAddressType: formData.officeAddressType,
        officeAddrCountry: formData.officeAddrCountry,
        officeAddrDivision: formData.birthPlaceAddress?.division || "-1",
        officeAddrDistrict: formData.birthPlaceAddress?.district || "-1",
        officeAddrCityCorpCantOrUpazila:
          formData.birthPlaceAddress?.cityCorpCantOrUpazila || "-1",
        officeAddrPaurasavaOrUnion:
          formData.birthPlaceAddress?.paurasavaOrUnion || "-1",
        officeAddrWard: formData.birthPlaceAddress?.ward || "-1",

        // Personal Information
        personInfoForBirth: {
          personFirstNameBn: formData.personInfoForBirth.personFirstNameBn,
          personLastNameBn: formData.personInfoForBirth.personLastNameBn,
          personNameBn:
            `${formData.personInfoForBirth.personFirstNameBn} ${formData.personInfoForBirth.personLastNameBn}`.trim(),
          personFirstNameEn: formData.personInfoForBirth.personFirstNameEn,
          personLastNameEn: formData.personInfoForBirth.personLastNameEn,
          personNameEn:
            `${formData.personInfoForBirth.personFirstNameEn} ${formData.personInfoForBirth.personLastNameEn}`.trim(),
          personBirthDate: formData.personInfoForBirth.personBirthDate
            .split("-")
            .reverse()
            .join("/"),
          thChild: formData.personInfoForBirth.thChild,
          gender: formData.personInfoForBirth.gender,
          religion: formData.personInfoForBirth.religion,
          religionOther: formData.personInfoForBirth.religionOther,
          personNid: formData.personInfoForBirth.personNid,

          // Parents information
          father: {
            personNameBn: formData.father.personNameBn,
            personNameEn: formData.father.personNameEn,
            personNationality: formData.father.personNationality,
            personNid: formData.father.personNid,
            passportNumber: formData.father.passportNumber,
            ubrn: formData.father.ubrn,
            personBirthDate: formData.father.personBirthDate,
          },
          mother: {
            personNameBn: formData.mother.personNameBn,
            personNameEn: formData.mother.personNameEn,
            personNationality: formData.mother.personNationality,
            personNid: formData.mother.personNid,
            passportNumber: formData.mother.passportNumber,
            ubrn: formData.mother.ubrn,
            personBirthDate: formData.mother.personBirthDate,
          },
        },

        // Birth Place Address
        birthPlaceCountry: formData.birthPlaceAddress?.country || "1",
        birthPlaceDiv: formData.birthPlaceAddress?.division || "-1",
        birthPlaceDist: formData.birthPlaceAddress?.district || "-1",
        birthPlaceCityCorpCantOrUpazila:
          formData.birthPlaceAddress?.cityCorpCantOrUpazila || "-1",
        birthPlacePaurasavaOrUnion:
          formData.birthPlaceAddress?.paurasavaOrUnion || "-1",
        birthPlaceWardInPaurasavaOrUnion:
          formData.birthPlaceAddress?.ward || "-1",
        birthPlaceVilAreaTownBn:
          formData.birthPlaceAddress?.vilAreaTownBn || "",
        birthPlaceVilAreaTownEn:
          formData.birthPlaceAddress?.vilAreaTownEn || "",
        birthPlacePostOfc: formData.birthPlaceAddress?.postOfc || "",
        birthPlacePostOfcEn: formData.birthPlaceAddress?.postOfcEn || "",
        birthPlaceHouseRoadBn: formData.birthPlaceAddress?.houseRoadBn || "",
        birthPlaceHouseRoadEn: formData.birthPlaceAddress?.houseRoadEn || "",

        // Permanent Address
        copyBirthPlaceToPermAddr: formData.copyBirthPlaceToPermAddr
          ? "yes"
          : "no",
        permAddrCountry: formData.copyBirthPlaceToPermAddr
          ? formData.birthPlaceAddress?.country
          : formData.permAddrAddress?.country || "1",
        permAddrDiv: formData.copyBirthPlaceToPermAddr
          ? formData.birthPlaceAddress?.division
          : formData.permAddrAddress?.division || "-1",
        permAddrDist: formData.copyBirthPlaceToPermAddr
          ? formData.birthPlaceAddress?.district
          : formData.permAddrAddress?.district || "-1",
        permAddrCityCorpCantOrUpazila: formData.copyBirthPlaceToPermAddr
          ? formData.birthPlaceAddress?.cityCorpCantOrUpazila
          : formData.permAddrAddress?.cityCorpCantOrUpazila || "-1",
        permAddrPaurasavaOrUnion: formData.copyBirthPlaceToPermAddr
          ? formData.birthPlaceAddress?.paurasavaOrUnion
          : formData.permAddrAddress?.paurasavaOrUnion || "-1",
        permAddrWardInPaurasavaOrUnion: formData.copyBirthPlaceToPermAddr
          ? formData.birthPlaceAddress?.ward
          : formData.permAddrAddress?.ward || "-1",

        // Applicant Information
        applicantName: formData.applicant.name,
        phone: formData.applicant.phone,
        email: formData.applicant.email,
        relationWithApplicant: formData.applicant.relation,

        // File attachments
        attachments: uploadedFiles.map((file) => ({
          id: file.uploadedId,
          name: file.name,
          type: file.fileType,
          category: file.fileCategory,
          size: file.size,
        })),

        // Other required fields
        declaration: "on",
        copyPermAddrToPrsntAddr: "yes",
        personImage: "",
      };

      console.log("Form submission data:", submissionData);

      // Send data to API
      const response = await fetch("/api/birth-registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieString,
        },
        body: JSON.stringify(submissionData),
      });

      if (response.ok) {
        toast.success("আবেদন সফলভাবে জমা দেওয়া হয়েছে!");
      } else {
        throw new Error("Submission failed");
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("আবেদন জমা দিতে সমস্যা হয়েছে");
    }
  };

  const stepTitles = [
    "অফিস নির্বাচন",
    "ব্যক্তির তথ্য",
    "পিতা-মাতার তথ্য",
    "ঠিকানা ও আবেদনকারী",
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">
            জন্ম নিবন্ধনের জন্য আবেদন
          </h1>
          <p className="text-gray-600 text-center">
            Birth Registration Application Form
          </p>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step
                      ? "bg-blue-600 text-white"
                      : "bg-gray-300 text-gray-600"
                  }`}
                >
                  {step}
                </div>
                {step < 4 && (
                  <div
                    className={`w-20 h-1 mx-2 ${
                      currentStep > step ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            {stepTitles.map((title, index) => (
              <span key={index} className="text-center flex-1">
                {title}
              </span>
            ))}
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-md p-6"
        >
          {/* Step 1: Office Selection */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  আপনি নিম্নলিখিত কোন ঠিকানায় জন্ম নিবন্ধনের আবেদন করতে চান?
                </h3>

                {bdMissionChecked === false && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <label className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="officeAddressType"
                        value="BIRTHPLACE"
                        checked={formData.officeAddressType === "BIRTHPLACE"}
                        onChange={(e) =>
                          handleInputChange("officeAddressType", e.target.value)
                        }
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">জন্মস্থান</span>
                    </label>

                    <label className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="officeAddressType"
                        value="PERMANENT"
                        checked={formData.officeAddressType === "PERMANENT"}
                        onChange={(e) =>
                          handleInputChange("officeAddressType", e.target.value)
                        }
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">স্থায়ী ঠিকানা</span>
                    </label>
                  </div>
                )}

                <label className="flex items-center space-x-3 mt-4">
                  <input
                    type="checkbox"
                    checked={bdMissionChecked}
                    onChange={(e) => {
                      setBdMissionChecked(e.target.checked);
                      if (e.target.checked) {
                        handleInputChange("officeAddressType", "MISSION");
                      } else {
                        handleInputChange("officeAddressType", "");
                      }
                    }}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">
                    আপনি যদি বাংলাদেশ দূতাবাসে জন্ম নিবন্ধন আবেদন করতে চান, তবে
                    এটি নির্বাচন করুন
                  </span>
                </label>
              </div>

              {bdMissionChecked && (
                <div className="border-t pt-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">
                    নিবন্ধন কার্যালয়ের ঠিকানা
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        দেশ <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.officeAddrCountry}
                        onChange={(e) =>
                          handleInputChange("officeAddrCountry", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required={bdMissionChecked}
                      >
                        <option value="">দেশ নির্বাচন করুন</option>
                        {countriesList.map((country) => (
                          <option key={country.id} value={country.id}>
                            {country.nameBn}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        অফিস <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.officeAddrOffice}
                        onChange={(e) =>
                          handleInputChange("officeAddrOffice", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-100"
                        readOnly
                        required={bdMissionChecked}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  পরবর্তী
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Personal Information */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  নিবন্ধনাধীন ব্যক্তির পরিচিতি
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      নামের প্রথম অংশ বাংলায়{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.personInfoForBirth.personFirstNameBn}
                      onChange={(e) =>
                        handleNestedInputChange(
                          "personInfoForBirth",
                          "personFirstNameBn",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="নামের প্রথম অংশ বাংলায়"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      নামের শেষ অংশ বাংলায়{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.personInfoForBirth.personLastNameBn}
                      onChange={(e) =>
                        handleNestedInputChange(
                          "personInfoForBirth",
                          "personLastNameBn",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="নামের শেষ অংশ বাংলায়"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      নামের প্রথম অংশ ইংরেজিতে{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.personInfoForBirth.personFirstNameEn}
                      onChange={(e) =>
                        handleNestedInputChange(
                          "personInfoForBirth",
                          "personFirstNameEn",
                          e.target.value.toUpperCase()
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="First Name in English"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      নামের শেষ অংশ ইংরেজিতে{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.personInfoForBirth.personLastNameEn}
                      onChange={(e) =>
                        handleNestedInputChange(
                          "personInfoForBirth",
                          "personLastNameEn",
                          e.target.value.toUpperCase()
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Last Name in English"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      জন্ম তারিখ (খ্রিক) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      max={new Date().toISOString().split("T")[0]}
                      value={formData.personInfoForBirth.personBirthDate}
                      onChange={handleBirthDateChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    {age &&
                      (age.years > 0 || age.months > 0 || age.days > 0) && (
                        <p className="text-sm text-green-600 mt-1">
                          বয়স: {age.years} বছর, {age.months} মাস, {age.days}{" "}
                          দিন
                        </p>
                      )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      পিতা ও মাতার কততম সন্তান{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.personInfoForBirth.thChild}
                      onChange={(e) =>
                        handleNestedInputChange(
                          "personInfoForBirth",
                          "thChild",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">---নির্বাচন করুন---</option>
                      {Array.from({ length: 20 }, (_, i) => i + 1).map(
                        (num) => (
                          <option key={num} value={num}>
                            {num}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      লিঙ্গ <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.personInfoForBirth.gender}
                      onChange={(e) =>
                        handleNestedInputChange(
                          "personInfoForBirth",
                          "gender",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">---নির্বাচন করুন---</option>
                      <option value="MALE">পুরুষ</option>
                      <option value="FEMALE">মহিলা</option>
                      <option value="THIRD_GENDER">তৃতীয় লিঙ্গ</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Birth Place Address - Now using modal */}
              <div className="border-t pt-6">
                <BDRISGeoSelector
                  onApply={handleBirthPlaceAddress}
                  initial={formData.birthPlaceAddress || undefined}
                  label="জন্মস্থানের ঠিকানা"
                  validateOnNext={validateBirthPlace}
                  buttonText="জন্মস্থানের ঠিকানা নির্বাচন করুন"
                />
              </div>

              <div className="flex justify-between pt-6">
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  পূর্ববর্তী
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  পরবর্তী
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Parents Information */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                পিতা-মাতার তথ্য
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Father's Information */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-700">পিতার তথ্য</h4>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      পিতার জন্ম নিবন্ধন নম্বর
                    </label>
                    <input
                      type="text"
                      value={formData.father.ubrn}
                      onChange={(e) =>
                        handleNestedInputChange(
                          "father",
                          "ubrn",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="জন্ম নিবন্ধন নম্বর"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      জন্ম তারিখ (খ্রিঃ)
                    </label>
                    <input
                      type="date"
                      value={formData.father.personBirthDate}
                      onChange={(e) =>
                        handleNestedInputChange(
                          "father",
                          "personBirthDate",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      পিতার নাম বাংলায় <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.father.personNameBn}
                      onChange={(e) =>
                        handleNestedInputChange(
                          "father",
                          "personNameBn",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="পিতার নাম বাংলায়"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      পিতার নাম ইংরেজিতে <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.father.personNameEn}
                      onChange={(e) =>
                        handleNestedInputChange(
                          "father",
                          "personNameEn",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Father's Name in English"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      পিতার জাতীয় পরিচয়পত্র নম্বর
                    </label>
                    <input
                      type="text"
                      value={formData.father.personNid}
                      onChange={(e) =>
                        handleNestedInputChange(
                          "father",
                          "personNid",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="জাতীয় পরিচয়পত্র নম্বর"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      পিতার জাতীয়তা <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.father.personNationality}
                      onChange={(e) =>
                        handleNestedInputChange(
                          "father",
                          "personNationality",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">---নির্বাচন করুন---</option>
                      {nationalityOptions.map((nationality) => (
                        <option
                          key={nationality.value}
                          value={nationality.value}
                        >
                          {nationality.labelBn}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      পিতার পাসপোর্ট নম্বর
                    </label>
                    <input
                      type="text"
                      value={formData.father.passportNumber}
                      onChange={(e) =>
                        handleNestedInputChange(
                          "father",
                          "passportNumber",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="বিদেশে অবস্থানের ক্ষেত্রে পাসপোর্ট নম্বর"
                    />
                  </div>
                </div>

                {/* Mother's Information */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-700">মাতার তথ্য</h4>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      মাতার জন্ম নিবন্ধন নম্বর
                    </label>
                    <input
                      type="text"
                      value={formData.mother.ubrn}
                      onChange={(e) =>
                        handleNestedInputChange(
                          "mother",
                          "ubrn",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="জন্ম নিবন্ধন নম্বর"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      জন্ম তারিখ (খ্রিঃ)
                    </label>
                    <input
                      type="date"
                      value={formData.mother.personBirthDate}
                      onChange={(e) =>
                        handleNestedInputChange(
                          "mother",
                          "personBirthDate",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      মাতার নাম বাংলায় <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.mother.personNameBn}
                      onChange={(e) =>
                        handleNestedInputChange(
                          "mother",
                          "personNameBn",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="মাতার নাম বাংলায়"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      মাতার নাম ইংরেজিতে <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.mother.personNameEn}
                      onChange={(e) =>
                        handleNestedInputChange(
                          "mother",
                          "personNameEn",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Mother's Name in English"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      মাতার জাতীয় পরিচয়পত্র নম্বর
                    </label>
                    <input
                      type="text"
                      value={formData.mother.personNid}
                      onChange={(e) =>
                        handleNestedInputChange(
                          "mother",
                          "personNid",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="জাতীয় পরিচয়পত্র নম্বর"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      মাতার জাতীয়তা <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.mother.personNationality}
                      onChange={(e) =>
                        handleNestedInputChange(
                          "mother",
                          "personNationality",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">---নির্বাচন করুন---</option>
                      {nationalityOptions.map((nationality) => (
                        <option
                          key={nationality.value}
                          value={nationality.value}
                        >
                          {nationality.labelBn}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      মাতার পাসপোর্ট নম্বর
                    </label>
                    <input
                      type="text"
                      value={formData.mother.passportNumber}
                      onChange={(e) =>
                        handleNestedInputChange(
                          "mother",
                          "passportNumber",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="বিদেশে অবস্থানের ক্ষেত্রে পাসপোর্ট নম্বর"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-6">
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  পূর্ববর্তী
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  পরবর্তী
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Address Information & File Upload */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                ঠিকানা ও আবেদনকারীর তথ্য
              </h3>

              <div className="space-y-6">
                {/* Permanent Address */}
                <div className="border-b pb-6">
                  <label className="flex items-center space-x-3 mb-4">
                    <input
                      type="checkbox"
                      checked={formData.copyBirthPlaceToPermAddr}
                      onChange={(e) =>
                        handleInputChange(
                          "copyBirthPlaceToPermAddr",
                          e.target.checked
                        )
                      }
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-700 font-medium">
                      জন্মস্থানের ঠিকানা ও স্থায়ী ঠিকানা একই
                    </span>
                  </label>

                  {!formData.copyBirthPlaceToPermAddr && (
                    <BDRISGeoSelector
                      onApply={handlePermAddrAddress}
                      initial={formData.permAddrAddress || undefined}
                      label="স্থায়ী ঠিকানা"
                      validateOnNext={validatePermAddress}
                      buttonText="স্থায়ী ঠিকানা নির্বাচন করুন"
                    />
                  )}
                </div>

                {/* File Upload Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    ফাইল আপলোড
                  </h3>
                  <p className="text-gray-600 mb-4">
                    শুধুমাত্র ইমেজ ফাইল (.jpg, .jpeg, .png) আপলোড করা যাবে।
                    (প্রতিটি ফাইলের জন্য সর্বোচ্চ ফাইল সাইজ 2 মেগা বাইট)
                  </p>

                  {/* Drag & Drop Area */}
                  <div
                    className={`mt-2 border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      isDragOver
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 bg-gray-50"
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <svg
                        className="w-12 h-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 48 48"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 14v20c0 4.418 7.163 8 16 8 1.381 0 2.721-.087 4-.252M8 14c0 4.418 7.163 8 16 8s16-3.582 16-8M8 14c0-4.418 7.163-8 16-8s16 3.582 16 8m0 0v14m0-4c0 4.418-7.163 8-16 8S8 28.418 8 24m32 10v6m0 0l-3-3m3 3l3-3"
                        />
                      </svg>
                      <div>
                        <p className="text-lg font-medium text-gray-700 mb-2">
                          ফাইল এখানে ড্রপ করুন
                        </p>
                        <p className="text-sm text-gray-500 mb-4">
                          অথবা ফাইল নির্বাচন করতে ক্লিক করুন
                        </p>
                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        multiple
                        accept="image/*,.pdf"
                        onChange={handleFileSelect}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        ফাইল নির্বাচন করুন
                      </button>
                      <p className="text-xs text-gray-500">
                        JPG, PNG, PDF ফাইল সমর্থিত • সর্বোচ্চ 2MB প্রতি ফাইল
                      </p>
                    </div>
                  </div>

                  {/* Uploading list */}
                  {uploadingFiles.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-medium text-gray-700 mb-3">
                        নির্বাচিত ফাইল ({uploadingFiles.length})
                      </h4>
                      <div className="space-y-3">
                        {uploadingFiles.map((item, idx) => (
                          <div
                            key={`uploading-${idx}`}
                            className="flex items-center gap-3 p-3 bg-white rounded-lg border"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-700 truncate">
                                {item.file.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {(item.file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                            <select
                              value={item.fileTypeId}
                              onChange={(e) =>
                                updateUploadingFileType(idx, e.target.value)
                              }
                              className="px-3 py-2 border rounded text-sm"
                            >
                              <option value="-1">---টাইপ নির্বাচন---</option>
                              {fileTypes.map((t) => (
                                <option key={`filetype-${t.id}`} value={t.id}>
                                  {t.name}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => handleFileUpload(idx)}
                              className="px-4 max-w-2/3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                            >
                              আপলোড
                            </button>
                            <button
                              type="button"
                              onClick={() => removeUploadingFile(idx)}
                              className="p-2 text-red-600 hover:text-red-800 transition-colors"
                              title="Remove file"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Uploaded list */}
                  {uploadedFiles.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-medium text-gray-700 mb-3">
                        আপলোডকৃত ফাইল ({uploadedFiles.length})
                      </h4>
                      <div className="space-y-2">
                        {uploadedFiles.map((f) => (
                          <div
                            key={`uploaded-${f.id}`}
                            className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
                          >
                            <div className="flex-1 min-w-0">
                              <a
                                href={f.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-700 hover:underline font-medium text-sm truncate block"
                              >
                                {f.name}
                              </a>
                              <p className="text-xs text-green-600">
                                {f.fileType}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setUploadedFiles((p) =>
                                  p.filter((x) => x.id !== f.id)
                                )
                              }
                              className="p-1 text-red-600 hover:text-red-800 transition-colors"
                              title="Delete file"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Applicant Information */}
                <div className="border-b pb-6">
                  <h4 className="font-semibold text-gray-800 mb-4">
                    আবেদনকারীর তথ্য
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        আবেদনকারীর নাম <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.applicant.name}
                        onChange={(e) =>
                          handleNestedInputChange(
                            "applicant",
                            "name",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="আবেদনকারীর নাম"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        জাতীয় পরিচয়পত্র নম্বর
                      </label>
                      <input
                        type="text"
                        value={formData.applicant.nid}
                        onChange={(e) =>
                          handleNestedInputChange(
                            "applicant",
                            "nid",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="জাতীয় পরিচয়পত্র নম্বর"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        মোবাইল নম্বর <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={formData.applicant.phone}
                        onChange={(e) =>
                          handleNestedInputChange(
                            "applicant",
                            "phone",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="মোবাইল নম্বর"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ইমেইল ঠিকানা
                      </label>
                      <input
                        type="email"
                        value={formData.applicant.email}
                        onChange={(e) =>
                          handleNestedInputChange(
                            "applicant",
                            "email",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="ইমেইল ঠিকানা"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        নিবন্ধনাধীন ব্যক্তির সাথে সম্পর্ক{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.applicant.relation}
                        onChange={(e) =>
                          handleNestedInputChange(
                            "applicant",
                            "relation",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">---সম্পর্ক নির্বাচন করুন---</option>
                        <option value="FATHER">পিতা</option>
                        <option value="MOTHER">মাতা</option>
                        <option value="GUARDIAN">অভিভাবক</option>
                        <option value="RELATIVE">আত্মীয়</option>
                        <option value="SELF">নিজে</option>
                        <option value="OTHER">অন্যান্য</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Upload Summary */}
                {uploadedFiles.length > 0 && (
                  <div className="border-b pb-6">
                    <h4 className="font-semibold text-gray-800 mb-4">
                      আপলোডকৃত ফাইল সমূহ
                    </h4>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-blue-800 text-sm mb-2">
                        মোট আপলোডকৃত ফাইল: {uploadedFiles.length}টি
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                        {uploadedFiles.map((file) => (
                          <div
                            key={file.id}
                            className="flex justify-between items-center"
                          >
                            <span className="text-gray-700">{file.name}</span>
                            <span
                              className={`px-2 py-1 rounded ${
                                file.uploadedId
                                  ? "bg-green-100 text-green-800"
                                  : file.isUploading
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {file.uploadedId
                                ? `আপলোডেড`
                                : file.isUploading
                                ? "আপলোড হচ্ছে..."
                                : "ফাইল টাইপ নির্বাচন করুন"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Terms and Conditions */}
                <div>
                  <label className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      required
                      className="text-blue-600 focus:ring-blue-500 mt-1"
                    />
                    <span className="text-gray-700 text-sm">
                      আমি ঘোষণা করছি যে, উপরে বর্ণিত সকল তথ্য সঠিক ও বস্তুনিষ্ঠ।
                      ভুল তথ্য প্রদানের জন্য আমি আইনত দায়ী থাকব।
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex justify-between pt-6 border-t">
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  পূর্ববর্তী
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  আবেদন জমা দিন
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}