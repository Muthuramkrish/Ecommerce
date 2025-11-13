import React, { useState, useEffect, useMemo } from "react";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Package,
  Users,
  Truck,
  Search,
  MapPin,
  Building2,
  Edit2,
} from "lucide-react";
import { fetchAllProducts } from "../api/client";
import {
  createBulkOrder,
  getCompanyAddresses,
  saveCompanyAddress,
  deleteCompanyAddress,
  isAuthenticated,
} from "../api/user.js";

const BulkOrderForm = ({ onBack, onOrderCreated }) => {
  const [products, setProducts] = useState([]);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [showAddressSelector, setShowAddressSelector] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    district: "",
    state: "Tamil Nadu",
    zipCode: "",
    orderType: "electrical",
    specialRequirements: "",
    items: [
      {
        productName: "",
        productId: "",
        quantity: "",
        unitPrice: "",
        totalPrice: "",
        searchQuery: "",
        showDropdown: false,
        quantityError: "",
      },
    ],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [saveAddressChecked, setSaveAddressChecked] = useState(false);

  const indianStates = useMemo(
    () => [
      "Andhra Pradesh",
      "Arunachal Pradesh",
      "Assam",
      "Bihar",
      "Chhattisgarh",
      "Goa",
      "Gujarat",
      "Haryana",
      "Himachal Pradesh",
      "Jharkhand",
      "Karnataka",
      "Kerala",
      "Madhya Pradesh",
      "Maharashtra",
      "Manipur",
      "Meghalaya",
      "Mizoram",
      "Nagaland",
      "Odisha",
      "Punjab",
      "Rajasthan",
      "Sikkim",
      "Tamil Nadu",
      "Telangana",
      "Tripura",
      "Uttar Pradesh",
      "Uttarakhand",
      "West Bengal",
      "Andaman and Nicobar Islands",
      "Chandigarh",
      "Dadra and Nagar Haveli and Daman and Diu",
      "Delhi",
      "Jammu and Kashmir",
      "Ladakh",
      "Lakshadweep",
      "Puducherry",
    ],
    []
  );

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        console.log("📄 Loading products for bulk order form...");

        const productsData = await fetchAllProducts();

        if (!productsData || !Array.isArray(productsData)) {
          console.error("❌ Invalid products data received:", productsData);
          setProducts([]);
          return;
        }

        console.log(`📦 Received ${productsData.length} products from API`);

        const mapped = productsData
          .map((p) => {
            const productId =
              p?.identifiers?.productId ||
              p?._id ||
              p?.id ||
              p?.productId ||
              "";

            if (!productId || productId.trim() === "") {
              return null;
            }

            const title =
              p?.characteristics?.title ||
              p?.title ||
              p?.["product-title"] ||
              "Untitled Product";

            const price =
              p?.pricing?.basePrice || p?.price || p?.["new-price"] || 0;

            const taxRate = p?.pricing?.taxRate ?? null;

            const image =
              p?.characteristics?.images?.primary?.[0] ||
              p?.imageUrl ||
              p?.["image-url"] ||
              "";

            const category =
              p?.anchor?.subcategory ||
              p?.anchor?.category ||
              p?.category ||
              "General";

            const collection = p?.collection || p?.anchor?.collection || "";

            const stock = p?.inventory?.availableQuantity;

            return {
              id: productId,
              title: title,
              price: parseFloat(price) || 0,
              taxRate: taxRate,
              image: image,
              category: category,
              collection: collection,
              stock: stock != null ? stock : 999999,
              rawData: p,
            };
          })
          .filter((product) => {
            if (product === null) return false;

            if (product.stock !== 999999 && product.stock < 10) {
              console.log(
                `⚠️ Excluding product "${product.title}" - Stock: ${product.stock} (< 10)`
              );
              return false;
            }

            return true;
          });

        console.log(
          `✅ Mapped ${mapped.length} valid products (with stock >= 10)`
        );

        if (mapped.length === 0) {
          console.error("❌ No valid products after mapping!");
        } else {
          console.log("📋 Sample product:", mapped[0]);
        }

        setProducts(mapped);

        // ✅ LOAD COMPANY ADDRESSES IF AUTHENTICATED
        if (isAuthenticated()) {
          try {
            console.log("🔍 Fetching company addresses...");
            const addressesResponse = await getCompanyAddresses();

            console.log("📥 Address response:", addressesResponse);

            // ✅ Check both possible response structures
            const addresses =
              addressesResponse.companyAddresses ||
              addressesResponse.addresses ||
              [];

            console.log(`🏢 Found ${addresses.length} company addresses`);

            setSavedAddresses(addresses);

            // ✅ Auto-select default address or first address
            if (addresses.length === 0) {
              console.log("ℹ️ No saved addresses, showing form");
              setShowAddressForm(true);
            } else {
              console.log("✅ Addresses loaded, selecting default or first");
              const defaultAddr = addresses.find((addr) => addr.isDefault);
              if (defaultAddr) {
                console.log(
                  "✅ Using default address:",
                  defaultAddr.companyName
                );
                setSelectedAddressId(defaultAddr._id);
                populateFormFromAddress(defaultAddr);
              } else if (addresses.length > 0) {
                console.log(
                  "✅ Using first address:",
                  addresses[0].companyName
                );
                const firstAddr = addresses[0];
                setSelectedAddressId(firstAddr._id);
                populateFormFromAddress(firstAddr);
              }
              setShowAddressForm(false);
            }
          } catch (error) {
            console.error("❌ Error loading company addresses:", error);
            console.error("Error details:", error.message);
            setShowAddressForm(true);
          }
        } else {
          console.log("ℹ️ User not authenticated, showing form");
          setShowAddressForm(true);
        }
      } catch (error) {
        console.error("❌ Error loading data:", error);
        setProducts([]);
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    console.log("🔍 State Debug:", {
      isAuth: isAuthenticated(),
      savedAddressesCount: savedAddresses.length,
      showAddressForm: showAddressForm,
      selectedAddressId: selectedAddressId,
      addresses: savedAddresses,
    });
  }, [savedAddresses, showAddressForm, selectedAddressId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".product-search-container")) {
        setFormData((prev) => ({
          ...prev,
          items: prev.items.map((item) => ({ ...item, showDropdown: false })),
        }));
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    let timeoutId;
    if (formData.zipCode && formData.zipCode.length === 6) {
      timeoutId = setTimeout(async () => {
        try {
          const res = await fetch(
            `https://api.postalpincode.in/pincode/${formData.zipCode}`
          );
          const data = await res.json();
          const info = Array.isArray(data) ? data[0] : null;
          if (
            info &&
            info.Status === "Success" &&
            Array.isArray(info.PostOffice) &&
            info.PostOffice.length > 0
          ) {
            const offices = info.PostOffice;
            const mainSO =
              offices.find(
                (o) =>
                  o.BranchType === "Sub Office" &&
                  o.DeliveryStatus === "Delivery"
              ) ||
              offices.find((o) => o.BranchType === "Sub Office") ||
              offices[0];
            const detectedCity =
              (mainSO && (mainSO.Block || mainSO.Name || mainSO.District)) ||
              "";
            const detectedDistrict = (mainSO && mainSO.District) || "";
            setFormData((prev) => ({
              ...prev,
              city: detectedCity || prev.city,
              district: detectedDistrict || prev.district,
            }));
            setFormErrors((prev) => ({ ...prev, zipCode: "" }));
          } else {
            setFormErrors((prev) => ({
              ...prev,
              zipCode: "Could not resolve city from PIN code",
            }));
          }
        } catch (err) {
          setFormErrors((prev) => ({
            ...prev,
            zipCode: "Failed to lookup PIN code",
          }));
        }
      }, 400);
    }
    return () => clearTimeout(timeoutId);
  }, [formData.zipCode]);

  const handleInputChange = (e) => {
    const { name } = e.target;
    let { value } = e.target;
    if (name === "phone") {
      value = (value || "").replace(/\D/g, "").slice(0, 10);
    }
    if (name === "zipCode") {
      value = (value || "").replace(/\D/g, "").slice(0, 6);
    }
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];

    if (field === "quantity") {
      newItems[index][field] = value;

      // Find the selected product to get stock info
      const selected = products.find((p) => p.id === newItems[index].productId);
      const stock = selected?.stock;

      const parsed = parseInt(value, 10);
      let error = "";

      if (value === "") {
        error = "Quantity is required";
      } else if (isNaN(parsed)) {
        error = "Enter a valid number";
      } else if (parsed < 10) {
        error = "Minimum quantity is 10";
      } else if (stock != null && stock !== 999999 && parsed > stock) {
        // Only show stock error if stock is defined and not the default high number
        error = `Only ${stock} available in stock`;
      }

      newItems[index].quantityError = error;
    } else if (field === "unitPrice") {
      const currentItem = newItems[index];
      // Don't allow manual price change if product is selected from dropdown
      if (currentItem.productId) {
        console.warn("⚠️ Cannot change unit price for selected product");
        return;
      }
      newItems[index][field] = value;
    } else {
      newItems[index][field] = value;
    }

    // Recalculate total price
    if (field === "quantity" || field === "unitPrice") {
      const quantityStr =
        field === "quantity" ? value : newItems[index].quantity;
      const unitPriceStr =
        field === "unitPrice" ? value : newItems[index].unitPrice;

      const q = parseFloat(quantityStr);
      const u = parseFloat(unitPriceStr);

      newItems[index].totalPrice =
        isFinite(q) && isFinite(u) ? (q * u).toFixed(2) : "";
    }

    setFormData((prev) => ({
      ...prev,
      items: newItems,
    }));
  };

  // Helper function to populate form from address:
  const populateFormFromAddress = (address) => {
    setFormData((prev) => ({
      ...prev,
      companyName: address.companyName || "",
      contactPerson: address.contactPerson || "",
      email: address.email || "",
      phone: address.phone || "",
      address: address.address || "",
      city: address.city || "",
      district: address.district || "",
      state: address.state || "Tamil Nadu",
      zipCode: address.zipCode || "",
    }));
  };

  // Handler for address selection:
  const handleAddressSelect = (addressId) => {
    setSelectedAddressId(addressId);
    const selected = savedAddresses.find((addr) => addr._id === addressId);
    if (selected) {
      populateFormFromAddress(selected);
    }
  };

  // Handler for creating new address:
  const handleAddNewAddress = () => {
    setSelectedAddressId(null);
    setFormData((prev) => ({
      ...prev,
      companyName: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      district: "",
      state: "Tamil Nadu",
      zipCode: "",
    }));
    setShowAddressForm(true);
  };

  // Handler for deleting address:
  const handleDeleteAddress = async (addressId) => {
    if (!confirm("Are you sure you want to delete this address?")) return;

    try {
      const response = await deleteCompanyAddress(addressId);
      if (response.companyAddresses) {
        const permanentAddresses = response.companyAddresses.filter(
          (addr) => !addr.isTemporary
        );
        setSavedAddresses(permanentAddresses);

        if (selectedAddressId === addressId) {
          setSelectedAddressId(null);

          if (permanentAddresses.length === 0) {
            setShowAddressForm(true);
            setFormData((prev) => ({
              ...prev,
              companyName: "",
              contactPerson: "",
              email: "",
              phone: "",
              address: "",
              city: "",
              district: "",
              zipCode: "",
            }));
          } else {
            const firstAddr = permanentAddresses[0];
            setSelectedAddressId(firstAddr._id);
            populateFormFromAddress(firstAddr);
          }
        }
      }
      alert("Address deleted successfully!");
    } catch (error) {
      console.error("Failed to delete address:", error);
      alert(`Failed to delete address: ${error.message}`);
    }
  };

  const handleEditAddress = (addressId) => {
    setSelectedAddressId(addressId);
    const selected = savedAddresses.find((addr) => addr._id === addressId);
    if (selected) {
      populateFormFromAddress(selected);
      setSaveAddressChecked(true); // Enable save mode for editing
    }
    setShowAddressForm(true);
  };

  const handleProductSearch = (index, searchQuery) => {
    const newItems = [...formData.items];
    newItems[index].searchQuery = searchQuery;
    newItems[index].showDropdown = searchQuery.length > 0;

    setFormData((prev) => ({
      ...prev,
      items: newItems,
    }));
  };

  const handleProductSelect = (index, product) => {
    console.log(`✅ Product selected at index ${index}:`, product.title);

    const newItems = [...formData.items];

    // Set product details
    newItems[index].productName = product.title;
    newItems[index].productId = product.id;
    newItems[index].unitPrice = product.price.toString();
    newItems[index].searchQuery = product.title;
    newItems[index].showDropdown = false;

    // Set default quantity if empty
    if (!newItems[index].quantity) {
      newItems[index].quantity = "10";
    }

    // Validate quantity against stock
    const parsed = parseInt(newItems[index].quantity, 10);
    let error = "";

    if (isNaN(parsed) || parsed < 10) {
      error = "Minimum quantity is 10";
    } else if (product.stock !== 999999 && parsed > product.stock) {
      // Only check stock if it's not the default high number
      error = `Only ${product.stock} available in stock`;
    }

    newItems[index].quantityError = error;

    // Calculate total price
    if (newItems[index].quantity) {
      const quantity = parseFloat(newItems[index].quantity);
      const unitPrice = parseFloat(product.price);
      newItems[index].totalPrice = (quantity * unitPrice).toFixed(2);
    }

    setFormData((prev) => ({
      ...prev,
      items: newItems,
    }));

    console.log(`💰 Total price calculated: ₹${newItems[index].totalPrice}`);
  };

  const getFilteredProducts = (searchQuery, currentIndex) => {
    if (!searchQuery || searchQuery.length < 2) {
      return [];
    }

    const query = searchQuery.toLowerCase().trim();

    // Get IDs of already selected products (except current item)
    const selectedProductIds = formData.items
      .filter((item, idx) => item.productId && idx !== currentIndex)
      .map((item) => item.productId);

    const filtered = products.filter((product) => {
      // Skip if already selected in another item
      if (selectedProductIds.includes(product.id)) {
        return false;
      }

      // Search in title
      const titleMatch = product.title.toLowerCase().includes(query);

      // Search in category
      const categoryMatch = product.category.toLowerCase().includes(query);

      // Search in collection if available
      const collectionMatch = product.collection
        ? product.collection.toLowerCase().includes(query)
        : false;

      return titleMatch || categoryMatch || collectionMatch;
    });

    console.log(
      `🔍 Search "${searchQuery}": Found ${filtered.length} products`
    );

    return filtered.slice(0, 10); // Return max 10 results
  };

  const collectionTaxRates = {
    cables: 0,
    fans: 0,
    heaters: 0,
    lighting: 0,
    lights: 0,
    switches: 0,
  };

  const getItemTaxRatePercent = (product) => {
    if (!product) return 18;
    const explicitRate = product?.taxRate;
    if (explicitRate != null && !isNaN(Number(explicitRate)))
      return Number(explicitRate);
    const subcategory = (product?.category || "").toString().toLowerCase();
    const byCollection = collectionTaxRates[subcategory];
    if (byCollection != null && !isNaN(Number(byCollection)))
      return Number(byCollection);
    return 18;
  };

  const calculateBreakdown = () => {
    const subtotal = formData.items.reduce((total, item) => {
      const line = parseFloat(item.totalPrice) || 0;
      return total + line;
    }, 0);

    const tax = formData.items.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity);
      const unitPrice = parseFloat(item.unitPrice);
      if (!isFinite(quantity) || !isFinite(unitPrice)) return sum;
      const product = products.find((p) => p.id === item.productId);
      const ratePercent = getItemTaxRatePercent(product);
      const linePrice = quantity * unitPrice;
      return sum + linePrice * (ratePercent / 100);
    }, 0);

    const total = subtotal + tax;
    const roundedTotal = Math.round(total);
    return { subtotal, tax, total, roundedTotal };
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          productName: "",
          productId: "",
          quantity: "",
          unitPrice: "",
          totalPrice: "",
          searchQuery: "",
          showDropdown: false,
          quantityError: "",
        },
      ],
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      setFormData((prev) => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index),
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    const phoneRegex = /^\d{10}$/;
    const zipRegex = /^\d{6}$/;

    if (!formData.companyName.trim())
      errors.companyName = "Company name is required";
    if (!formData.contactPerson.trim())
      errors.contactPerson = "Contact person is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    else if (!emailRegex.test(formData.email))
      errors.email = "Enter a valid email";
    if (!formData.phone.trim()) errors.phone = "Phone number is required";
    else if (!phoneRegex.test(formData.phone))
      errors.phone = "Enter a valid phone number";
    if (!formData.address.trim()) errors.address = "Street address is required";
    if (!formData.city.trim()) errors.city = "City is required";
    if (!formData.district.trim()) errors.district = "District is required";
    if (!formData.state.trim()) errors.state = "State/Province is required";
    if (!formData.zipCode.trim())
      errors.zipCode = "ZIP/Postal code is required";
    else if (!zipRegex.test(formData.zipCode))
      errors.zipCode = "Enter a valid ZIP/Postal code";

    if (!formData.items.length) {
      errors.items = "Add at least one product item";
    } else {
      formData.items.forEach((item, index) => {
        if (!item.productId) {
          errors[`item_${index}_product`] = "Please select a product";
        }
        const qty = parseInt(item.quantity, 10);
        if (!item.quantity) {
          errors[`item_${index}_quantity`] = "Quantity is required";
        } else if (isNaN(qty) || qty < 10) {
          errors[`item_${index}_quantity`] = "Minimum quantity is 10";
        }
      });
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const isValid = validateForm();
    if (!isValid) {
      setIsSubmitting(false);
      return;
    }

    try {
      if (!isAuthenticated()) {
        alert("Please log in to submit a bulk order.");
        setIsSubmitting(false);
        return;
      }

      let companyAddressId = null;

      // ✅ FIX: Check if user selected an existing saved address
      if (selectedAddressId && !showAddressForm) {
        // Use the selected existing address
        companyAddressId = selectedAddressId;
        console.log("✅ Using existing address:", companyAddressId);
      }
      // Only create new address if user is filling the form
      else if (showAddressForm) {
        // Save address if checkbox is checked
        if (saveAddressChecked) {
          try {
            const addressData = {
              label: "company",
              companyName: formData.companyName,
              contactPerson: formData.contactPerson,
              email: formData.email,
              phone: formData.phone,
              address: formData.address,
              city: formData.city,
              district: formData.district,
              state: formData.state,
              zipCode: formData.zipCode,
              isDefault: false,
              isTemporary: false, // Permanent address
            };

            console.log("💾 Saving permanent address:", addressData);

            const addressResponse = await saveCompanyAddress(addressData);

            if (
              addressResponse.success &&
              addressResponse.companyAddresses &&
              addressResponse.companyAddresses.length > 0
            ) {
              // Get the last added address (the one we just saved)
              const savedAddress =
                addressResponse.companyAddresses[
                  addressResponse.companyAddresses.length - 1
                ];
              companyAddressId = savedAddress._id;
              console.log("✅ Address saved with ID:", companyAddressId);
            }
          } catch (error) {
            console.error("Error saving address:", error);
            // Continue with order creation using temporary address
          }
        }

        // If address wasn't saved or save failed, create a temporary address
        if (!companyAddressId) {
          try {
            const tempAddressData = {
              label: "company",
              companyName: formData.companyName,
              contactPerson: formData.contactPerson,
              email: formData.email,
              phone: formData.phone,
              address: formData.address,
              city: formData.city,
              district: formData.district,
              state: formData.state,
              zipCode: formData.zipCode,
              isDefault: false,
              isTemporary: true, // Temporary address for this order
            };

            console.log("📝 Creating temporary address:", tempAddressData);

            const tempAddressResponse = await saveCompanyAddress(
              tempAddressData
            );

            if (
              tempAddressResponse.success &&
              tempAddressResponse.companyAddresses &&
              tempAddressResponse.companyAddresses.length > 0
            ) {
              const tempAddress =
                tempAddressResponse.companyAddresses[
                  tempAddressResponse.companyAddresses.length - 1
                ];
              companyAddressId = tempAddress._id;
              console.log(
                "✅ Temporary address created with ID:",
                companyAddressId
              );
            }
          } catch (error) {
            console.error("Error creating temporary address:", error);
            alert("Failed to process address. Please try again.");
            setIsSubmitting(false);
            return;
          }
        }
      }

      // Validate that we have an address ID
      if (!companyAddressId) {
        alert("Failed to save address. Please try again.");
        setIsSubmitting(false);
        return;
      }

      const { subtotal, tax, total, roundedTotal } = calculateBreakdown();

      const bulkOrderData = {
        companyAddressId: companyAddressId, // Send address ID reference
        email: formData.email, // Send email separately
        items: formData.items.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: parseInt(item.quantity, 10),
          unitPrice: parseFloat(item.unitPrice),
          totalPrice: parseFloat(item.totalPrice),
          taxRate: getItemTaxRatePercent(
            products.find((p) => p.id === item.productId)
          ),
        })),
        orderType: formData.orderType,
        specialRequirements: formData.specialRequirements,
        orderSummary: {
          subtotal: parseFloat(subtotal.toFixed(2)),
          tax: parseFloat(tax.toFixed(2)),
          total: parseFloat(total.toFixed(2)),
          roundedTotal: parseFloat(roundedTotal.toFixed(2)),
        },
      };

      console.log("📦 Submitting bulk order:", bulkOrderData);
      console.log("🏢 Company Address ID:", companyAddressId);
      console.log("📧 Email:", formData.email);

      const response = await createBulkOrder(bulkOrderData);

      console.log("📬 Bulk order response:", response);

      if (response.success) {
        setIsSubmitting(false);
        alert(
          `Bulk order submitted successfully! Your bulk order ID is: ${response.bulkOrderId}. We will contact you within 24 hours with pricing and delivery options.`
        );

        // Reset form
        setFormData({
          companyName: "",
          contactPerson: "",
          email: "",
          phone: "",
          address: "",
          city: "",
          district: "",
          state: "Tamil Nadu",
          zipCode: "",
          orderType: "electrical",
          specialRequirements: "",
          items: [
            {
              productName: "",
              productId: "",
              quantity: "",
              unitPrice: "",
              totalPrice: "",
              searchQuery: "",
              showDropdown: false,
              quantityError: "",
            },
          ],
        });
        setSaveAddressChecked(false);
        setSelectedAddressId(null);
        setShowAddressForm(false);

        // Reload saved addresses
        try {
          const addressesResponse = await getCompanyAddresses();
          const addresses =
            addressesResponse.companyAddresses ||
            addressesResponse.addresses ||
            [];
          setSavedAddresses(addresses);
        } catch (error) {
          console.error("Error reloading addresses:", error);
        }

        // Call the callback to refresh orders list
        if (onOrderCreated) {
          onOrderCreated();
        }
      } else {
        throw new Error(response.message || "Failed to submit bulk order");
      }
    } catch (error) {
      console.error("Bulk order submission error:", error);
      setIsSubmitting(false);

      // Show user-friendly error message
      const errorMessage = error.message || "An unexpected error occurred";
      alert(`Error submitting bulk order: ${errorMessage}`);
    }
  };

  useEffect(() => {
    console.log("📊 Current products state:", {
      totalProducts: products.length,
      sampleProducts: products.slice(0, 3).map((p) => ({
        id: p.id,
        title: p.title,
        price: p.price,
        stock: p.stock,
      })),
    });
  }, [products]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16">
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-all duration-500 text-sm md:text-base hover:scale-110 group bg-white/50 backdrop-blur-sm rounded-xl px-4 py-2 hover:bg-white/80 hover:shadow-lg border border-gray-200/50 hover:border-gray-300"
            >
              <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 mr-2 group-hover:-translate-x-1 group-hover:scale-110 transition-all duration-300" />
              <span className="hidden sm:inline font-medium">Back</span>
            </button>

            <h1 className="text-base md:text-lg font-semibold text-gray-900 text-center flex-1">
              Create Bulk Order
            </h1>
            <div className="w-24"></div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="mb-8">
          <div className="text-center">
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Submit your bulk order request for electrical products. Our team
              will review and get back to you with competitive pricing and
              delivery options.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
            <Package className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Bulk Pricing
            </h3>
            <p className="text-gray-600">
              Get special discounted rates for large quantity orders
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
            <Truck className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Fast Delivery
            </h3>
            <p className="text-gray-600">
              Priority shipping and logistics support for bulk orders
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
            <Users className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Dedicated Support
            </h3>
            <p className="text-gray-600">
              Personal account manager for your bulk order needs
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
            <h2 className="text-xl font-semibold text-white">
              Order Information
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Saved Addresses Section */}
            {isAuthenticated() && savedAddresses.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    <h3 className="text-sm font-semibold text-blue-900">
                      Saved Company Addresses
                    </h3>
                  </div>
                  {!showAddressForm && (
                    <button
                      type="button"
                      onClick={handleAddNewAddress}
                      className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add New
                    </button>
                  )}
                </div>

                {!showAddressForm && (
                  <div className="space-y-3">
                    {savedAddresses.map((addr) => (
                      <div
                        key={addr._id}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedAddressId === addr._id
                            ? "border-blue-600 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                        onClick={() => handleAddressSelect(addr._id)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-gray-900">
                                {addr.companyName}
                              </span>
                              {addr.isDefault && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              {addr.contactPerson} • {addr.phone}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              {addr.address}, {addr.city}, {addr.district},{" "}
                              {addr.state} - {addr.zipCode}
                            </p>
                          </div>
                          <div className="flex gap-2 ml-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditAddress(addr._id);
                              }}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              title="Edit address"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteAddress(addr._id);
                              }}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="Delete address"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {showAddressForm && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Company Information
                  </h3>
                  {isAuthenticated() && savedAddresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddressForm(false);
                        const defaultAddr = savedAddresses.find(
                          (addr) => addr.isDefault
                        );
                        const addrToSelect = defaultAddr || savedAddresses[0];
                        if (addrToSelect) {
                          setSelectedAddressId(addrToSelect._id);
                          populateFormFromAddress(addrToSelect);
                        }
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                {/* Rest of the form fields remain the same */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter company name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Person *
                    </label>
                    <input
                      type="text"
                      name="contactPerson"
                      value={formData.contactPerson}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter contact person name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter email address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter street address"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${
                        formErrors.city
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-blue-500"
                      }`}
                      placeholder="Enter city"
                    />
                    {formErrors.city && (
                      <p className="mt-1 text-xs text-red-600">
                        {formErrors.city}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      District *
                    </label>
                    <input
                      type="text"
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${
                        formErrors.district
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-blue-500"
                      }`}
                      placeholder="Enter district"
                    />
                    {formErrors.district && (
                      <p className="mt-1 text-xs text-red-600">
                        {formErrors.district}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State/Province *
                    </label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${
                        formErrors.state
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-blue-500"
                      }`}
                    >
                      {indianStates.map((state) => (
                        <option
                          key={state}
                          value={state}
                          disabled={state !== "Tamil Nadu"}
                        >
                          {state}
                        </option>
                      ))}
                    </select>
                    {formErrors.state && (
                      <p className="mt-1 text-xs text-red-600">
                        {formErrors.state}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP/Postal Code *
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      required
                      inputMode="numeric"
                      maxLength={6}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${
                        formErrors.zipCode
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-blue-500"
                      }`}
                      placeholder="Enter ZIP code"
                    />
                    {formErrors.zipCode && (
                      <p className="mt-1 text-xs text-red-600">
                        {formErrors.zipCode}
                      </p>
                    )}
                  </div>
                </div>

                {/* Save Address Checkbox */}
                {isAuthenticated() && (
                  <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
                    <input
                      type="checkbox"
                      id="saveAddress"
                      checked={saveAddressChecked}
                      onChange={(e) => setSaveAddressChecked(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor="saveAddress"
                      className="text-sm text-gray-700 cursor-pointer"
                    >
                      Save this address for future bulk orders
                    </label>
                  </div>
                )}
              </>
            )}

            <div className="border-t pt-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Product Items
                </h3>
              </div>

              {formData.items.map((item, index) => (
                <div key={index}>
                  <div className="border border-gray-200 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="relative product-search-container">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Product Name *
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={item.searchQuery}
                            onChange={(e) =>
                              handleProductSearch(index, e.target.value)
                            }
                            required
                            className={`w-full px-3 py-2 pr-8 border rounded-lg focus:ring-2 focus:border-transparent ${
                              formErrors[`item_${index}_product`]
                                ? "border-red-500 focus:ring-red-500"
                                : "border-gray-300 focus:ring-blue-500"
                            }`}
                            placeholder="Search for products..."
                          />
                          <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />

                          {item.showDropdown && (
                            <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-300 rounded-lg shadow-xl max-h-64 overflow-y-auto mt-1 border-t-2 border-t-blue-500">
                              {(() => {
                                const filteredProducts = getFilteredProducts(
                                  item.searchQuery,
                                  index
                                );

                                if (filteredProducts.length > 0) {
                                  return (
                                    <>
                                      <div className="sticky top-0 bg-gray-50 px-3 py-2 border-b border-gray-200 text-xs text-gray-600 font-medium">
                                        {filteredProducts.length} product
                                        {filteredProducts.length !== 1
                                          ? "s"
                                          : ""}{" "}
                                        found
                                      </div>
                                      {filteredProducts.map((product) => (
                                        <div
                                          key={product.id}
                                          onClick={() =>
                                            handleProductSelect(index, product)
                                          }
                                          className="flex items-center p-4 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-all duration-300 hover:scale-[1.02] hover:shadow-md"
                                        >
                                          <img
                                            src={
                                              product.image ||
                                              "https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=100"
                                            }
                                            alt={product.title}
                                            className="w-12 h-12 object-cover rounded-lg mr-3 border border-gray-200"
                                            onError={(e) => {
                                              e.target.src =
                                                "https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=100";
                                            }}
                                          />
                                          <div className="flex-1 min-w-0 pr-3">
                                            <div className="font-medium text-gray-900 text-sm truncate">
                                              {product.title}
                                            </div>
                                            <div className="text-gray-500 text-xs mt-1">
                                              {product.category}
                                              {product.stock !== 999999 && (
                                                <span className="ml-2 text-green-600">
                                                  • Stock: {product.stock}
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                          <div className="flex-shrink-0 text-right">
                                            <div className="bg-green-100 text-green-800 font-bold text-sm px-3 py-1 rounded-full">
                                              ₹{product.price.toLocaleString()}
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </>
                                  );
                                } else {
                                  return (
                                    <div className="p-4 text-gray-500 text-center">
                                      <Search className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                                      <div className="text-sm">
                                        No products found
                                      </div>
                                      <div className="text-xs text-gray-400 mt-1">
                                        Try searching with different keywords
                                      </div>
                                      {products.length === 0 && (
                                        <div className="text-xs text-red-500 mt-2">
                                          ⚠️ Products not loaded. Please refresh
                                          the page.
                                        </div>
                                      )}
                                    </div>
                                  );
                                }
                              })()}
                            </div>
                          )}
                        </div>

                        {item.productName && (
                          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-blue-800 font-medium text-sm">
                                  Selected:{" "}
                                </span>
                                <span className="text-blue-600 text-sm">
                                  {item.productName}
                                </span>
                              </div>
                              {item.unitPrice && (
                                <div className="bg-green-100 text-green-800 font-semibold text-xs px-2 py-1 rounded">
                                  ₹{parseFloat(item.unitPrice).toLocaleString()}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        <input
                          type="hidden"
                          value={item.productName}
                          required
                        />
                        {formErrors[`item_${index}_product`] && (
                          <p className="mt-1 text-xs text-red-600">
                            {formErrors[`item_${index}_product`]}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Quantity *
                        </label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(index, "quantity", e.target.value)
                          }
                          required
                          step="1"
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
                            item.quantityError ||
                            formErrors[`item_${index}_quantity`]
                              ? "border-red-500 focus:ring-red-500"
                              : "border-gray-300 focus:ring-blue-500"
                          }`}
                          placeholder="Qty"
                        />
                        {(item.quantityError ||
                          formErrors[`item_${index}_quantity`]) && (
                          <p className="mt-1 text-xs text-red-600">
                            {item.quantityError ||
                              formErrors[`item_${index}_quantity`]}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Unit Price (₹){" "}
                          {item.productId && (
                            <span className="text-green-600 text-xs">
                              (Auto-filled)
                            </span>
                          )}
                        </label>
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) =>
                            handleItemChange(index, "unitPrice", e.target.value)
                          }
                          step="0.01"
                          min="0"
                          readOnly={!!item.productId}
                          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            item.productId
                              ? "bg-green-50 cursor-not-allowed"
                              : ""
                          }`}
                          placeholder="0.00"
                        />
                      </div>

                      <div className="flex flex-col">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Total Price (₹)
                          </label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={item.totalPrice}
                              readOnly
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                              placeholder="0.00"
                            />
                            {formData.items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeItem(index)}
                                className="px-3 py-2 text-red-600 hover:text-red-800 transition-all duration-300 flex-shrink-0 hover:scale-110 hover:bg-red-50 rounded-lg group/btn"
                              >
                                <Trash2 className="w-5 h-5 group-hover/btn:animate-bounce" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {index === formData.items.length - 1 && (
                    <div className="flex justify-center mb-6">
                      <button
                        type="button"
                        onClick={addItem}
                        className="flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-500 font-bold hover:scale-110 hover:shadow-2xl group relative overflow-hidden"
                      >
                        <Plus className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                        <span className="relative z-10">Add Next Item</span>
                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="border-t pt-6">
              {(() => {
                const { subtotal, tax, total, roundedTotal } =
                  calculateBreakdown();
                const roundOff = roundedTotal - total;
                return (
                  <div className="flex justify-end">
                    <div className="text-right">
                      <div className="text-gray-700 text-sm">
                        Subtotal: ₹{subtotal.toFixed(2)}
                      </div>
                      <div className="text-gray-700 text-sm">
                        Tax: ₹{tax.toFixed(2)}
                      </div>
                      <div className="text-gray-700 text-sm">
                        Round Off: ₹{roundOff.toFixed(2)}
                      </div>
                      <div className="text-2xl font-bold text-gray-900 mt-1">
                        Grand Total : ₹{roundedTotal.toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="border-t pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-2xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 hover:shadow-2xl group relative overflow-hidden"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    <span className="relative z-10">Submitting...</span>
                  </div>
                ) : (
                  <>
                    <span className="relative z-10">
                      Submit Bulk Order Request
                    </span>
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                  </>
                )}
              </button>
              <p className="text-center text-sm text-gray-600 mt-3">
                We'll review your request and contact you within 24 hours with
                pricing and delivery options.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BulkOrderForm;
