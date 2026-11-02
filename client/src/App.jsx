import { useEffect, useState } from "react";
import {
  Search, ShoppingBag, Heart, UserRound, ArrowRight, Plus, Minus,
  X, CheckCircle, ArrowLeft, Eye, EyeOff, ChevronLeft, ChevronRight,
  Bot, Send, Sparkles, GitCompare, Truck, ShieldCheck, Package,
  BookOpen, ClipboardList, Pencil, Trash2
} from "lucide-react";
import API from "./api/axios";
import "./App.css";

const categories = [
  { name: "All Items", icon: "🛍️" },
  { name: "Textbooks", icon: "📚" },
  { name: "Calculators", icon: "🧮" },
  { name: "Lab Coats", icon: "🥼" },
  { name: "Electronics", icon: "🎧" },
  { name: "Stationery", icon: "✏️" },
  { name: "Story Books", icon: "📖" },
  { name: "Lab Equipment", icon: "🔬" },
  { name: "Project Materials", icon: "🎨" },
  { name: "Other", icon: "🎒" }
];

const conditions = ["New", "Like New", "Good", "Acceptable"];

const banners = [
  {
    tag: "CAMPUSCART STUDENT DEALS",
    title: <>Everything you need.<br /><em>For less.</em></>,
    description: "Discover affordable textbooks, gadgets and everyday college essentials from fellow students.",
    button: "Explore products",
    image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1000",
    color: "lavender"
  },
  {
    tag: "SMARTER STUDENT SHOPPING",
    title: <>Your next find.<br /><em>Is waiting.</em></>,
    description: "Find great student essentials at prices that make sense. Buy, sell and save with CAMPUSCART.",
    button: "Shop now",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1000",
    color: "orange"
  },
  {
    tag: "GREAT FINDS. GREAT PRICES.",
    title: <>Study more.<br /><em>Spend less.</em></>,
    description: "Give pre-loved items a new home and make your student budget go further.",
    button: "Browse collection",
    image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1000",
    color: "blue"
  }
];

const money = amount =>
  `₹${Number(amount || 0).toLocaleString("en-IN")}`;

const emptyAddress = {
  fullName: "",
  phone: "",
  street: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India"
};

const emptySellerForm = {
  title: "",
  description: "",
  price: "",
  category: "Textbooks",
  condition: "Good",
  imageUrl: ""
};

const readSavedItems = key => {
  try {
    const saved = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
};
// GET ACCOUNT-SPECIFIC WISHLIST STORAGE KEY
const getWishlistStorageKey = (tokenValue) => {
  if (!tokenValue) return "campuscartWishlist_guest";

  try {
    const payloadPart = tokenValue.split(".")[1];
    const normalized = payloadPart
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const payload = JSON.parse(atob(normalized));

    const userId =
      payload.userId || payload.id || payload._id;

    return userId
      ? `campuscartWishlist_${userId}`
      : "campuscartWishlist_guest";
  } catch {
    return "campuscartWishlist_guest";
  }
};

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Items");
  const [bannerIndex, setBannerIndex] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [myListingProducts, setMyListingProducts] = useState([]);

  const [cart, setCart] = useState(() =>
    readSavedItems("campuscartCart")
  );

  const [wishlistKey, setWishlistKey] = useState(
  () =>
    getWishlistStorageKey(
      localStorage.getItem("campuscartToken") || ""
    )
);

const [favorites, setFavorites] = useState(
  () =>
    readSavedItems(
      getWishlistStorageKey(
        localStorage.getItem("campuscartToken") || ""
      )
    )
);

  const [showCart, setShowCart] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);

  // AUTHENTICATION
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  

  const [authData, setAuthData] = useState({
    fullName: "",
    email: "",
    password: "",
    otp: ""
  });

  const [otpStep, setOtpStep] = useState(false);
  const [authMessage, setAuthMessage] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // FORGOT PASSWORD
  const [forgotStep, setForgotStep] = useState(0);

  const [forgotData, setForgotData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [token, setToken] = useState(
    localStorage.getItem("campuscartToken") || ""
  );

  const [toast, setToast] = useState("");

  // PROFILE
  const [showProfile, setShowProfile] = useState(false);
  const [profileData, setProfileData] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("campuscartUser") || "{}"
      );
    } catch {
      return {};
    }
  });

  // SELLER DASHBOARD
  const [showSellerDashboard, setShowSellerDashboard] = useState(false);
  const [sellerForm, setSellerForm] = useState(emptySellerForm);
  const [editingProductId, setEditingProductId] = useState(null);
  const [sellerLoading, setSellerLoading] = useState(false);
  const [sellerError, setSellerError] = useState("");
  const [sellerSuccess, setSellerSuccess] = useState("");

  // CHECKOUT AND ORDERS
  const [showCheckout, setShowCheckout] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState(emptyAddress);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [myOrders, setMyOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  // CAMPUS AI
  const [showAI, setShowAI] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [aiMessages, setAiMessages] = useState([
    {
      role: "assistant",
      text: "Hi! I'm CAMPUS AI. 👋 I can help you find products, recommend student essentials and compare products. What are you looking for?"
    }
  ]);

  // KEEP CART AND WISHLIST SAVED
  useEffect(() => {
    localStorage.setItem("campuscartCart", JSON.stringify(cart));
  }, [cart]);

  // LOAD WISHLIST WHEN ACCOUNT CHANGES
useEffect(() => {
  const nextWishlistKey = getWishlistStorageKey(token);

  setWishlistKey(nextWishlistKey);
  setFavorites(readSavedItems(nextWishlistKey));
}, [token]);

// SAVE WISHLIST FOR CURRENT ACCOUNT
useEffect(() => {
  localStorage.setItem(
    wishlistKey,
    JSON.stringify(favorites)
  );
}, [favorites, wishlistKey]);

  // ADD AUTHORIZATION HEADER TO PROTECTED REQUESTS
  useEffect(() => {
    if (token) {
      API.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete API.defaults.headers.common.Authorization;
    }
  }, [token]);

  // PRODUCT DETAIL BACK BUTTON
  useEffect(() => {
    if (!selectedProduct) return;

    window.history.pushState(
      { campuscartProduct: true },
      "",
      window.location.pathname
    );

    const handleBack = () => setSelectedProduct(null);

    window.addEventListener("popstate", handleBack);

    return () => {
      window.removeEventListener("popstate", handleBack);
    };
  }, [selectedProduct]);

  

  useEffect(() => {
    const timer = setInterval(() => {
      setBannerIndex(current => (current + 1) % banners.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => setToast(""), 3000);

    return () => clearTimeout(timer);
  }, [toast]);

  const getUserId = () => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.userId || payload.id || payload._id || "";
    } catch {
      return "";
    }
  };

  const normalizeProduct = p => ({
    ...p,
    id: p._id || p.id,
    name: p.title || p.name,
    image: p.images?.[0] || p.image || ""
  });

  // LOAD PRODUCTS
  const loadProducts = async () => {
    try {
      setLoading(true);

      const response = await API.get("/products");
      const list = response.data.products || [];

      setProducts(list.map(normalizeProduct));
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load products. Please check your server."
      );
    } finally {
      setLoading(false);
    }
  };
  const saveProfile = (e) => {
  e.preventDefault();

  try {
    const existingUser = JSON.parse(
      localStorage.getItem("campuscartUser") || "{}"
    );

    const updatedUser = {
      ...existingUser,
      ...profileData
    };

    localStorage.setItem(
      "campuscartUser",
      JSON.stringify(updatedUser)
    );

    setProfileData(updatedUser);
    alert("Profile updated successfully!");
    setShowProfile(false);
  } catch (error) {
    console.error("Profile update error:", error);
    alert("Unable to update profile. Please try again.");
  }
};

  const loadMyListings = async () => {
  try {
    if (!token) {
      setMyListingProducts([]);
      return;
    }

    const response = await API.get("/products/my-listings");

    setMyListingProducts(
      (response.data.products || []).map(normalizeProduct)
    );
  } catch (err) {
    console.error("Unable to load seller listings:", err);
  }
};
useEffect(() => {
  loadProducts();
}, []);

useEffect(() => {
  if (token) {
    loadMyListings();
  } else {
    setMyListingProducts([]);
  }
}, [token]);

  // PRODUCT DETAILS
  const openProductDetails = async product => {
    setSelectedProduct(normalizeProduct(product));
    setDetailsLoading(true);

    try {
      const productId = product.id || product._id;
      const response = await API.get(`/products/${productId}`);
      const p = response.data.product || response.data;

      setSelectedProduct(normalizeProduct(p));
    } catch (err) {
      setToast(
        err.response?.data?.message ||
        "Unable to load complete product details."
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory =
      category === "All Items" || product.category === category;

    const searchText = search.toLowerCase();

    const matchesSearch =
      product.name?.toLowerCase().includes(searchText) ||
      product.description?.toLowerCase().includes(searchText) ||
      product.category?.toLowerCase().includes(searchText);

    return matchesCategory && matchesSearch;
  });

  // MY LISTINGS
  const myListings = myListingProducts;

  const addToCart = product => {
    const sellerId = product.seller?._id || product.seller;

    if (token && sellerId?.toString() === getUserId()) {
      setToast("You cannot add your own product to your cart.");
      return;
    }

    if (product.status === "Sold") {
      setToast("This product has already been sold.");
      return;
    }

    setCart(current => {
      const found = current.find(item => item.id === product.id);

      if (found) {
        setToast("This item is already in your cart.");
        return current;
      }

      return [...current, { ...product, quantity: 1 }];
    });

    setToast(`${product.name} added to your cart!`);
  };

  const changeQuantity = (id, amount) => {
    setCart(current =>
      current
        .map(item =>
          item.id === id
            ? { ...item, quantity: item.quantity + amount }
            : item
        )
        .filter(item => item.quantity > 0)
    );
  };

  const toggleFavorite = product => {
    const alreadySaved = favorites.includes(product.id);

    setFavorites(current =>
      alreadySaved
        ? current.filter(id => id !== product.id)
        : [...current, product.id]
    );

    setToast(
      alreadySaved ? "Removed from wishlist" : "Added to wishlist!"
    );
  };

  const cartTotal = cart.reduce(
    (total, item) => total + Number(item.price) * item.quantity,
    0
  );

  // AUTHENTICATION
  const submitAuth = async event => {
    event.preventDefault();

    setAuthError("");
    setAuthMessage("");
    setAuthLoading(true);

    try {
      if (authMode === "signup" && !otpStep) {
        await API.post("/auth/register", {
          fullName: authData.fullName,
          email: authData.email,
          password: authData.password
        });

        setOtpStep(true);
        setAuthMessage(
          "OTP sent to your email. Please verify your account."
        );
      } else if (authMode === "signup" && otpStep) {
        await API.post("/auth/verify-otp", {
          email: authData.email,
          otp: authData.otp
        });

        setAuthMessage(
          "Account verified successfully! You can now sign in."
        );

        setAuthMode("login");
        setOtpStep(false);

        setAuthData(old => ({
          ...old,
          password: "",
          otp: ""
        }));
      } else {
        const response = await API.post("/auth/login", {
          email: authData.email,
          password: authData.password
        });

        const receivedToken =
          response.data.token ||
          response.data.accessToken ||
          response.data.data?.token;

        if (!receivedToken) {
          throw new Error(
            "Login response did not contain an authentication token."
          );
        }

        const user =
          response.data.user ||
          response.data.data?.user ||
          {};

        const savedUser = {
          fullName: user.fullName || authData.email.split("@")[0],
          email: user.email || authData.email
        };

        localStorage.setItem(
          "campuscartUser",
          JSON.stringify(savedUser)
        );

        localStorage.setItem("campuscartToken", receivedToken);

        setProfileData(savedUser);
        setToken(receivedToken);
        setShowAuth(false);

        setAuthData({
          fullName: "",
          email: "",
          password: "",
          otp: ""
        });

        setToast("Welcome to CAMPUSCART!");
      }
    } catch (err) {
      setAuthError(
        err.response?.data?.message ||
        err.message ||
        "Something went wrong."
      );
    } finally {
      setAuthLoading(false);
    }
  };

  // FORGOT PASSWORD HANDLER
  // FORGOT PASSWORD HANDLER
const submitForgotPassword = async event => {
  event.preventDefault();

  setAuthError("");
  setAuthMessage("");
  setAuthLoading(true);

  try {
    // STEP 1: SEND RESET OTP
    if (forgotStep === 0) {
      await API.post("/auth/forgot-password", {
        email: forgotData.email
      });

      setForgotStep(1);
      setAuthMessage("Password reset OTP sent to your email.");
    }

    // STEP 2: VERIFY RESET OTP
    else if (forgotStep === 1) {
      await API.post("/auth/verify-reset-otp", {
        email: forgotData.email,
        otp: forgotData.otp
      });

      setForgotStep(2);
      setAuthMessage(
        "OTP verified successfully. Set your new password."
      );
    }

    // STEP 3: RESET PASSWORD
    else if (forgotStep === 2) {
      if (
        forgotData.newPassword !== forgotData.confirmPassword
      ) {
        setAuthError("Passwords do not match.");
        return;
      }

      await API.post("/auth/reset-password", {
        email: forgotData.email,
        otp: forgotData.otp,
        newPassword: forgotData.newPassword
      });

      setAuthMode("login");
      setForgotStep(0);

      setAuthData({
        fullName: "",
        email: forgotData.email,
        password: "",
        otp: ""
      });

      setForgotData({
        email: "",
        otp: "",
        newPassword: "",
        confirmPassword: ""
      });

      // RESET PASSWORD VISIBILITY
      setShowForgotPassword(false);
      setShowConfirmPassword(false);

      setAuthMessage(
        "Password reset successfully! You can now log in with your new password."
      );
    }
  } catch (err) {
    setAuthError(
      err.response?.data?.message ||
      err.message ||
      "Password reset failed. Please try again."
    );
  } finally {
    setAuthLoading(false);
  }
};

const logout = () => {
  localStorage.removeItem("campuscartToken");
  setToken("");
  setShowProfile(false);
  setShowSellerDashboard(false);
  setToast("You have been signed out.");
};

const openProducts = () => {
  document.getElementById("products")?.scrollIntoView({
    behavior: "smooth"
  });
};

  // SELLER DASHBOARD
  const openSellerDashboard = async () => {
    if (!token) {
      setAuthMode("login");
      setShowAuth(true);
      setToast("Please sign in to start selling.");
      return;
    }

    setSellerError("");
    setSellerSuccess("");
    setEditingProductId(null);
    setSellerForm(emptySellerForm);
    setShowSellerDashboard(true);

    await loadProducts();
  };

  const handleSellerFormChange = event => {
    const { name, value } = event.target;

    setSellerForm(current => ({
      ...current,
      [name]: value
    }));
  };

  const submitListing = async event => {
    event.preventDefault();

    setSellerError("");
    setSellerSuccess("");

    if (!token) {
      setSellerError("Please sign in again.");
      return;
    }

    if (
      !sellerForm.title.trim() ||
      !sellerForm.description.trim() ||
      !sellerForm.price ||
      Number(sellerForm.price) < 1
    ) {
      setSellerError("Please fill all required fields correctly.");
      return;
    }

    setSellerLoading(true);

    try {
      const productData = {
        title: sellerForm.title.trim(),
        description: sellerForm.description.trim(),
        price: Number(sellerForm.price),
        category: sellerForm.category,
        condition: sellerForm.condition,
        images: sellerForm.imageUrl.trim()
          ? [sellerForm.imageUrl.trim()]
          : []
      };

      if (editingProductId) {
        await API.put(
          `/products/${editingProductId}`,
          productData
        );

        setSellerSuccess("Product updated successfully!");
        setToast("Your product has been updated.");
      } else {
        await API.post("/products", productData);

        setSellerSuccess("Product listed successfully!");
        setToast("Your product has been added!");
      }

      setSellerForm(emptySellerForm);
      setEditingProductId(null);

      await loadProducts();
    } catch (err) {
      setSellerError(
        err.response?.data?.message ||
        err.message ||
        "Unable to save your product."
      );
    } finally {
      setSellerLoading(false);
    }
  };

  const editListing = product => {
    setEditingProductId(product.id);

    setSellerForm({
      title: product.title || product.name || "",
      description: product.description || "",
      price: product.price || "",
      category: product.category || "Textbooks",
      condition: product.condition || "Good",
      imageUrl: product.images?.[0] || product.image || ""
    });

    setSellerError("");
    setSellerSuccess("");

    document.getElementById("seller-form")?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  };

  const cancelEdit = () => {
    setEditingProductId(null);
    setSellerForm(emptySellerForm);
    setSellerError("");
    setSellerSuccess("");
  };

  const deleteListing = async product => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"?`
    );

    if (!confirmed) return;

    try {
      await API.delete(`/products/${product.id}`);

      setProducts(current =>
        current.filter(item => item.id !== product.id)
      );

      setSellerSuccess("Product deleted successfully.");
      setToast("Your listing has been deleted.");
    } catch (err) {
      setSellerError(
        err.response?.data?.message ||
        "Unable to delete this product."
      );
    }
  };

  // CHECKOUT
  const startCheckout = () => {
    if (!token) {
      setShowCart(false);
      setAuthMode("login");
      setShowAuth(true);
      setToast("Please sign in before checkout.");
      return;
    }

    if (cart.length === 0) {
      setToast("Your cart is empty.");
      return;
    }

    setShowCart(false);
    setCheckoutError("");
    setOrderSuccess(null);
    setShowCheckout(true);
  };

  const placeOrder = async event => {
    event.preventDefault();

    setCheckoutError("");

    if (!token) {
      setCheckoutError("Please sign in again to continue.");
      return;
    }

    if (cart.length === 0) {
      setCheckoutError("Your cart is empty.");
      return;
    }

    setCheckoutLoading(true);

    try {
      const orderItems = cart.map(item => ({
        product: item.id,
        quantity: item.quantity
      }));

      const response = await API.post("/orders/place", {
        items: orderItems,
        deliveryAddress,
        paymentMethod
      });

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Order could not be placed."
        );
      }

      setOrderSuccess(response.data.order);
      setCart([]);
      setDeliveryAddress(emptyAddress);
      setPaymentMethod("COD");

      await loadProducts();
    } catch (err) {
      setCheckoutError(
        err.response?.data?.message ||
        err.message ||
        "Unable to place your order. Please try again."
      );
    } finally {
      setCheckoutLoading(false);
    }
  };

  // MY ORDERS
  const fetchMyOrders = async () => {
    if (!token) {
      setToast("Please sign in to view your orders.");
      return;
    }

    setShowOrders(true);
    setOrdersLoading(true);

    try {
      const response = await API.get("/orders/my-orders");
      setMyOrders(response.data.orders || []);
    } catch (err) {
      setToast(
        err.response?.data?.message ||
        "Unable to load your orders."
      );
    } finally {
      setOrdersLoading(false);
    }
  };

  // CAMPUS AI
  const askAI = () => {
    const question = aiInput.trim();

    if (!question) return;

    const q = question.toLowerCase();

    setAiMessages(current => [
      ...current,
      { role: "user", text: question }
    ]);

    let results = [];
    let answer = "";

    const budgetMatch = q.match(
      /(?:under|below|within|budget of|less than|₹)\s*₹?\s*(\d+)/
    );

    const budget = budgetMatch ? Number(budgetMatch[1]) : null;

    if (q.includes("calculator")) {
      results = products.filter(
        p => p.category?.toLowerCase() === "calculators"
      );

      if (budget !== null) {
        results = results.filter(
          p => Number(p.price) <= budget
        );
      }

      results.sort(
        (a, b) => Number(a.price) - Number(b.price)
      );

      answer = results.length
        ? `I found ${results.length} calculator option(s) ${
            budget !== null
              ? `within your ₹${budget} budget`
              : "available"
          }. Here are your options:`
        : budget !== null
          ? `I couldn't find a calculator within ₹${budget}. Try increasing your budget.`
          : "I couldn't find any calculators right now.";
    } else if (
      q.includes("compare") ||
      q.includes("difference") ||
      q.includes("better")
    ) {
      results = products.slice(0, 4);

      answer = results.length
        ? "Here are some available products. Open their details to compare prices and descriptions."
        : "There are no products available to compare yet.";
    } else if (
      q.includes("book") ||
      q.includes("textbook")
    ) {
      results = products.filter(p =>
        ["textbooks", "story books"].includes(
          p.category?.toLowerCase()
        )
      );

      answer = results.length
        ? "Here are the books currently available:"
        : "I couldn't find any books right now.";
    } else {
      results = products.filter(p =>
        `${p.name} ${p.category} ${p.description || ""}`
          .toLowerCase()
          .includes(q)
      );

      answer = results.length
        ? "I found these products matching your request:"
        : "I couldn't find an exact match. Try searching by product name or category.";
    }

    setAiMessages(current => [
      ...current,
      {
        role: "assistant",
        text: answer,
        products: results.slice(0, 5)
      }
    ]);

    setAiInput("");
  };

  const activeBanner = banners[bannerIndex];

  return (
    <div className="app">
      <div className="top-strip">
        YOUR CAMPUS. YOUR MARKETPLACE. GREAT DEALS EVERY DAY.
      </div>

      {/* HEADER */}
      <header className="main-header">
        <a href="#" className="brand">
          CAMPUS<span>CART</span>
          <small>THE STUDENT MARKETPLACE</small>
        </a>

        <nav className="main-nav">
          <a href="#">Home</a>
          <a href="#categories">Categories</a>
          <a href="#products">Shop</a>
          <a href="#sell">Sell with us</a>
        </nav>

        <div className="header-search">
          <Search size={18} />

          <input
            value={search}
            onChange={e => {
              setSearch(e.target.value);

              document.getElementById("products")?.scrollIntoView({
                behavior: "smooth"
              });
            }}
            placeholder="Search books, calculators, stationery..."
          />

          {search && (
            <button
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="header-actions">
          {token && (
            <>
              <button
                className="header-icon-with-label"
                onClick={fetchMyOrders}
              >
                <span className="nav-icon">
                  <ClipboardList size={21} />
                </span>
                <small>Orders</small>
              </button>

              <button
                className="header-icon-with-label"
                onClick={() => {
  if (!token) {
    setAuthMode("login");
    setShowAuth(true);
  } else {
    setShowProfile(true);
  }
}}
              >
                <span className="nav-icon">
                  <UserRound size={21} />
                </span>
                <small>Profile</small>
              </button>

              <button
                className="header-icon-with-label"
                onClick={openSellerDashboard}
              >
                <span className="nav-icon">
                  <Package size={21} />
                </span>
                <small>My Listings</small>
              </button>
            </>
          )}

          <button
            className="header-icon-with-label"
            onClick={() => setShowWishlist(true)}
          >
            <span className="nav-icon">
              <Heart size={21} />

              {favorites.length > 0 && (
                <span className="counter">
                  {favorites.length}
                </span>
              )}
            </span>
            <small>Wishlist</small>
          </button>

          <button
            className="header-icon-with-label"
            onClick={() => setShowCart(true)}
          >
            <span className="nav-icon">
              <ShoppingBag size={21} />

              {cart.length > 0 && (
                <span className="counter">
                  {cart.reduce((n, p) => n + p.quantity, 0)}
                </span>
              )}
            </span>
            <small>Cart</small>
          </button>

          {token ? (
            <button className="sign-in" onClick={logout}>
              Sign out
            </button>
          ) : (
            <button
              className="sign-in"
              onClick={() => {
                setAuthMode("login");
                setShowAuth(true);
                setAuthError("");
                setAuthMessage("");
                setForgotStep(0);
              }}
            >
              <UserRound size={16} /> Sign in
            </button>
          )}
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className={`hero-slider ${activeBanner.color}`}>
          <div className="hero-copy">
            <div className="hero-eyebrow">
              {activeBanner.tag}
            </div>

            <h1>{activeBanner.title}</h1>
            <p>{activeBanner.description}</p>

            <button className="hero-cta" onClick={openProducts}>
              {activeBanner.button}
              <ArrowRight size={17} />
            </button>

            <div className="slider-controls">
              <button
                onClick={() =>
                  setBannerIndex(
                    (bannerIndex + banners.length - 1) %
                    banners.length
                  )
                }
              >
                <ChevronLeft size={17} />
              </button>

              <button
                onClick={() =>
                  setBannerIndex(
                    (bannerIndex + 1) % banners.length
                  )
                }
              >
                <ChevronRight size={17} />
              </button>

              <span>
                0{bannerIndex + 1} / 0{banners.length}
              </span>

              <div className="slider-dots">
                {banners.map((banner, index) => (
                  <button
                    key={banner.tag}
                    className={index === bannerIndex ? "active" : ""}
                    onClick={() => setBannerIndex(index)}
                    aria-label={`Show banner ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <img
              src={activeBanner.image}
              alt="Student shopping collection"
            />

            <div className="hero-floating">
              <b>SMART STUDENT FINDS</b>
              <span>More value. Less spending.</span>
            </div>
          </div>
        </section>

        {/* BENEFITS */}
        <section className="benefit-row">
          <div>
            <Truck />
            <span>
              <strong>Student-friendly prices</strong>
              <small>Shop within your budget</small>
            </span>
          </div>

          <div>
            <ShieldCheck />
            <span>
              <strong>Student marketplace</strong>
              <small>Buy and sell with ease</small>
            </span>
          </div>

          <div>
            <Package />
            <span>
              <strong>Give items a new life</strong>
              <small>Reuse, save and share</small>
            </span>
          </div>
        </section>

        {/* CATEGORIES */}
        <section className="category-section" id="categories">
          <div className="section-title">
            <div>
              <div className="section-kicker">
                EXPLORE THE COLLECTION
              </div>
              <h2>
                Shop by <em>category</em>
              </h2>
            </div>

            <button
              onClick={() => {
                setCategory("All Items");
                openProducts();
              }}
            >
              View all products
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="category-chips">
            {categories.map(item => (
              <button
                key={item.name}
                className={category === item.name ? "active" : ""}
                onClick={() => {
                  setCategory(item.name);
                  openProducts();
                }}
              >
                <span>{item.icon}</span>
                {item.name}
                <ArrowRight size={15} />
              </button>
            ))}
          </div>
        </section>

        {/* PRODUCTS */}
        <section className="shop-section" id="products">
          <div className="section-title">
            <div>
              <div className="section-kicker">
                THE CAMPUSCART COLLECTION
              </div>
              <h2>
                Find your next <em>favourite</em>
              </h2>
            </div>

            <span className="product-count">
              {filteredProducts.length} products
            </span>
          </div>

          <div className="filter-row">
            <div className="category-tabs">
              {categories.map(item => (
                <button
                  key={item.name}
                  className={category === item.name ? "selected" : ""}
                  onClick={() => setCategory(item.name)}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="status-box">Loading products...</div>
          ) : error ? (
            <div className="status-box">
              <h3>Couldn't load products</h3>
              <p>{error}</p>
              <button className="solid-button" onClick={loadProducts}>
                Try again
              </button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="status-box">
              <h3>No products found</h3>
              <p>Try another search or category.</p>
              <button
                className="solid-button"
                onClick={() => {
                  setSearch("");
                  setCategory("All Items");
                }}
              >
                Show all products
              </button>
            </div>
          ) : (
            <div className="product-grid">
              {filteredProducts.map(product => (
                <article
                  className="product-card"
                  key={product.id}
                  onClick={() => openProductDetails(product)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="product-photo">
                    <button
                      className="product-image-button"
                      onClick={e => {
                        e.stopPropagation();
                        openProductDetails(product);
                      }}
                    >
                      {product.image ? (
                        <img src={product.image} alt={product.name} />
                      ) : (
                        <div className="no-photo">
                          <BookOpen size={35} />
                          <span>Product image</span>
                        </div>
                      )}
                    </button>

                    <span className="condition-tag">
                      {product.condition || "Pre-loved"}
                    </span>

                    <button
                      className={`wish-button ${
                        favorites.includes(product.id) ? "liked" : ""
                      }`}
                      onClick={e => {
                        e.stopPropagation();
                        toggleFavorite(product);
                      }}
                      aria-label="Add to wishlist"
                    >
                      <Heart
                        size={18}
                        fill={
                          favorites.includes(product.id)
                            ? "currentColor"
                            : "none"
                        }
                      />
                    </button>
                  </div>

                  <div className="product-card-info">
                    <div className="product-category">
                      {product.category}
                    </div>

                    <button
                      className="product-name"
                      onClick={e => {
                        e.stopPropagation();
                        openProductDetails(product);
                      }}
                    >
                      {product.name}
                    </button>

                    <div className="product-card-footer">
                      <strong>{money(product.price)}</strong>

                      <button
                        onClick={e => {
                          e.stopPropagation();
                          addToCart(product);
                        }}
                      >
                        <Plus size={15} /> Add
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* SELL BANNER */}
        <section className="sell-banner" id="sell">
          <div>
            <div className="section-kicker">
              HAVE SOMETHING TO SELL?
            </div>

            <h2>
              Turn your unused items<br />
              into someone else's great find.
            </h2>

            <p>
              List your student essentials and connect with buyers.
            </p>
          </div>

          <button
            className="solid-button"
            onClick={openSellerDashboard}
          >
            Start selling
            <ArrowRight size={17} />
          </button>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="site-footer">
        <a href="#" className="brand">
          CAMPUS<span>CART</span>
        </a>

        <small>
          Made for students. Built for smarter shopping.
        </small>

        <span>© 2026 CAMPUSCART</span>
      </footer>

      {/* PRODUCT DETAILS */}
      {selectedProduct && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 2000,
            background: "#fff",
            overflowY: "auto",
            padding: "25px 4%"
          }}
        >
          <button
            onClick={() => setSelectedProduct(null)}
            style={{
              position: "absolute",
              top: 20,
              left: 25,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8
            }}
          >
            <ArrowLeft size={23} />
            Back to products
          </button>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "40px",
              maxWidth: "1400px",
              margin: "65px auto 35px",
              alignItems: "start"
            }}
          >
            <div
              style={{
                background: "#f5f6f6",
                padding: "25px",
                borderRadius: "12px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "400px"
              }}
            >
              {selectedProduct.image ? (
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  style={{
                    width: "100%",
                    maxHeight: "650px",
                    objectFit: "contain"
                  }}
                />
              ) : (
                <BookOpen size={100} />
              )}
            </div>

            <div style={{ padding: "15px 10px" }}>
              <div className="product-category">
                {selectedProduct.category}
              </div>

              <h1 style={{ fontSize: 30, margin: "20px 0" }}>
                {selectedProduct.name}
              </h1>

              <p style={{ color: "#777", marginBottom: 20 }}>
                Condition: {selectedProduct.condition || "Pre-loved"}
              </p>

              <h1 style={{ fontSize: 32, marginBottom: 25 }}>
                {money(selectedProduct.price)}
              </h1>

              <hr />

              <h3 style={{ marginTop: 20 }}>Product description</h3>

              <p
                style={{
                  color: "#666",
                  lineHeight: 1.8,
                  marginTop: 15
                }}
              >
                {selectedProduct.description ||
                  "A useful student essential available on CAMPUSCART."}
              </p>

              <hr style={{ margin: "25px 0" }} />

              <div
                style={{
                  display: "flex",
                  gap: 15,
                  alignItems: "center"
                }}
              >
                <UserRound size={25} color="#008b95" />

                <div>
                  <strong>
                    {selectedProduct.seller?.fullName ||
                      "CAMPUSCART Seller"}
                  </strong>
                  <p style={{ color: "#777", marginTop: 5 }}>Seller</p>
                </div>
              </div>

              {detailsLoading && <p>Loading product details...</p>}

              <button
                className="details-add"
                style={{
                  width: "100%",
                  marginTop: 30,
                  padding: 17,
                  cursor: "pointer"
                }}
                onClick={() => addToCart(selectedProduct)}
              >
                <ShoppingBag size={19} />
                Add to cart
              </button>

              <button
                className="details-wish"
                style={{
                  width: "100%",
                  marginTop: 12,
                  padding: 17,
                  cursor: "pointer"
                }}
                onClick={() => toggleFavorite(selectedProduct)}
              >
                <Heart size={19} />
                Add to wishlist
              </button>

              <div style={{ marginTop: 30, color: "#777" }}>
                <p>✓ Student-friendly prices</p>
                <p>✓ Buy and sell student essentials</p>
                <p>✓ Shop with CAMPUSCART</p>
              </div>
            </div>
          </div>
        </div>
      )}

      
{/* PROFILE MODAL */}
{showProfile && (
  <div
    className="modal-backdrop"
    onClick={() => setShowProfile(false)}
  >
    <div
      className="auth-modal"
      style={{
        width: "min(550px, 95vw)",
        maxHeight: "90vh",
        overflowY: "auto",
        textAlign: "left"
      }}
      onClick={e => e.stopPropagation()}
    >
      <button
        className="modal-close"
        onClick={() => setShowProfile(false)}
      >
        <X />
      </button>

      <div className="auth-brand">
        CAMPUS<span>CART</span>
      </div>

      <h2>My Profile</h2>
      <p>View and update your personal details.</p>

      <form onSubmit={saveProfile}>
        <label>Full Name</label>
        <input
          required
          value={profileData.fullName || ""}
          onChange={e =>
            setProfileData(current => ({
              ...current,
              fullName: e.target.value
            }))
          }
          placeholder="Your full name"
        />

        <label>Email Address</label>
        <input
          type="email"
          required
          value={profileData.email || ""}
          onChange={e =>
            setProfileData(current => ({
              ...current,
              email: e.target.value
            }))
          }
          placeholder="Your email"
        />

        <label>Phone Number</label>
        <input
          type="tel"
          value={profileData.phone || ""}
          onChange={e =>
            setProfileData(current => ({
              ...current,
              phone: e.target.value
            }))
          }
          placeholder="Your phone number"
        />

        <label>House / Street Address</label>
        <input
          value={profileData.street || ""}
          onChange={e =>
            setProfileData(current => ({
              ...current,
              street: e.target.value
            }))
          }
          placeholder="House number and street"
        />

        <label>City</label>
        <input
          value={profileData.city || ""}
          onChange={e =>
            setProfileData(current => ({
              ...current,
              city: e.target.value
            }))
          }
          placeholder="Your city"
        />

        <label>State</label>
        <input
          value={profileData.state || ""}
          onChange={e =>
            setProfileData(current => ({
              ...current,
              state: e.target.value
            }))
          }
          placeholder="Your state"
        />

        <label>PIN Code</label>
        <input
          value={profileData.postalCode || ""}
          onChange={e =>
            setProfileData(current => ({
              ...current,
              postalCode: e.target.value
            }))
          }
          placeholder="Your PIN code"
        />

        <button
          className="auth-submit"
          type="submit"
          style={{ marginTop: 20 }}
        >
          Save Changes
        </button>
      </form>

      <p style={{ fontSize: 12, color: "#888", marginTop: 12 }}>
        Profile details are currently saved on this device.
      </p>
    </div>
  </div>
)}


      {/* SELLER DASHBOARD */}
      {showSellerDashboard && (
        <div
          className="modal-backdrop"
          onClick={() => {
            if (!sellerLoading) {
              setShowSellerDashboard(false);
              cancelEdit();
            }
          }}
        >
          <div
            className="auth-modal"
            style={{
              width: "min(850px, 96vw)",
              maxWidth: 850,
              maxHeight: "92vh",
              overflowY: "auto",
              textAlign: "left"
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => {
                if (!sellerLoading) {
                  setShowSellerDashboard(false);
                  cancelEdit();
                }
              }}
            >
              <X />
            </button>

            <div className="auth-brand">
              CAMPUS<span>CART</span>
            </div>

            <h2>Seller Dashboard</h2>
            <p>Manage your products and create new listings.</p>

            {/* ADD / EDIT PRODUCT FORM */}
            <div
              id="seller-form"
              style={{
                background: "#f7f7fa",
                borderRadius: 12,
                padding: 20,
                marginTop: 22
              }}
            >
              <h3 style={{ marginBottom: 15 }}>
                {editingProductId ? "Edit your product" : "Add a new product"}
              </h3>

              <form onSubmit={submitListing}>
                <label>Product title *</label>
                <input
                  name="title"
                  required
                  value={sellerForm.title}
                  onChange={handleSellerFormChange}
                  placeholder="Example: Engineering Mathematics Textbook"
                />

                <label>Description *</label>
                <textarea
                  name="description"
                  required
                  rows={4}
                  value={sellerForm.description}
                  onChange={handleSellerFormChange}
                  placeholder="Describe your product..."
                />

                <label>Price (₹) *</label>
                <input
                  name="price"
                  type="number"
                  min="1"
                  required
                  value={sellerForm.price}
                  onChange={handleSellerFormChange}
                  placeholder="Enter product price"
                />

                <label>Category *</label>
                <select
                  name="category"
                  required
                  value={sellerForm.category}
                  onChange={handleSellerFormChange}
                >
                  {categories
                    .filter(item => item.name !== "All Items")
                    .map(item => (
                      <option key={item.name} value={item.name}>
                        {item.name}
                      </option>
                    ))}
                </select>

                <label>Product condition *</label>
                <select
                  name="condition"
                  required
                  value={sellerForm.condition}
                  onChange={handleSellerFormChange}
                >
                  {conditions.map(item => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>

                <label>Product image URL (optional)</label>
                <input
                  name="imageUrl"
                  type="url"
                  value={sellerForm.imageUrl}
                  onChange={handleSellerFormChange}
                  placeholder="https://example.com/product-image.jpg"
                />

                {sellerForm.imageUrl && (
                  <div style={{ margin: "12px 0" }}>
                    <p style={{ fontSize: 13, marginBottom: 8 }}>
                      Image preview
                    </p>
                    <img
                      src={sellerForm.imageUrl}
                      alt="Product preview"
                      onError={e => {
                        e.currentTarget.style.display = "none";
                      }}
                      style={{
                        width: 120,
                        height: 120,
                        objectFit: "cover",
                        borderRadius: 8
                      }}
                    />
                  </div>
                )}

                {sellerError && (
                  <div className="auth-error">{sellerError}</div>
                )}

                {sellerSuccess && (
                  <div className="auth-success">{sellerSuccess}</div>
                )}

                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    marginTop: 18,
                    flexWrap: "wrap"
                  }}
                >
                  <button
                    className="auth-submit"
                    type="submit"
                    disabled={sellerLoading}
                    style={{ flex: 1, margin: 0 }}
                  >
                    {sellerLoading
                      ? "Please wait..."
                      : editingProductId
                        ? "Update product"
                        : "Publish product"}
                  </button>

                  {editingProductId && (
                    <button
                      type="button"
                      className="solid-button"
                      onClick={cancelEdit}
                      disabled={sellerLoading}
                    >
                      Cancel edit
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* MY LISTINGS */}
            <div style={{ marginTop: 28 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 10,
                  flexWrap: "wrap"
                }}
              >
                <h3>My Listings</h3>

                <button
  className="solid-button"
  onClick={loadMyListings}
  disabled={loading}
>
  Refresh
</button>
              </div>

              <p style={{ color: "#777", margin: "8px 0 16px" }}>
                {myListings.length} listing(s) found.
              </p>

              {myListings.length === 0 ? (
                <div className="empty-cart">
                  <Package size={40} />
                  <h3>No listings found</h3>
                  <p>
                    Add your first product using the form above.
                  </p>
                </div>
              ) : (
                <div style={{ display: "grid", gap: 14 }}>
                  {myListings.map(product => (
                    <div
                      key={product.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        border: "1px solid #e5e5e5",
                        borderRadius: 10,
                        padding: 12,
                        flexWrap: "wrap"
                      }}
                    >
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          style={{
                            width: 85,
                            height: 85,
                            objectFit: "cover",
                            borderRadius: 8
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 85,
                            height: 85,
                            display: "grid",
                            placeItems: "center",
                            background: "#f0f0f0",
                            borderRadius: 8
                          }}
                        >
                          <Package size={30} />
                        </div>
                      )}

                      <div style={{ flex: 1, minWidth: 150 }}>
                        <strong>{product.name}</strong>

                        <p style={{ color: "#777", marginTop: 5 }}>
                          {product.category} · {product.condition}
                        </p>

                        <strong
                          style={{
                            display: "block",
                            marginTop: 5
                          }}
                        >
                          {money(product.price)}
                        </strong>

                        <small
                          style={{
                            color:
                              product.status === "Sold"
                                ? "#c0392b"
                                : "#16834a"
                          }}
                        >
                          {product.status || "Available"}
                        </small>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          flexWrap: "wrap"
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => editListing(product)}
                          title="Edit product"
                          style={{
                            border: "1px solid #ddd",
                            background: "#fff",
                            borderRadius: 7,
                            padding: 9,
                            cursor: "pointer"
                          }}
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteListing(product)}
                          title="Delete product"
                          style={{
                            border: "1px solid #f0cccc",
                            color: "#c0392b",
                            background: "#fff",
                            borderRadius: 7,
                            padding: 9,
                            cursor: "pointer"
                          }}
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <p
                style={{
                  fontSize: 12,
                  color: "#888",
                  marginTop: 15,
                  lineHeight: 1.5
                }}
              >
                Note: Your current GET /products endpoint returns only
                Available products. Sold listings will not appear in this
                dashboard until the backend provides a seller-specific
                listings endpoint.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* WISHLIST */}
      {showWishlist && (
        <div
          className="drawer-backdrop"
          onClick={() => setShowWishlist(false)}
        >
          <aside
            className="cart-drawer"
            onClick={e => e.stopPropagation()}
          >
            <div className="drawer-heading">
              <h2>My Wishlist ({favorites.length})</h2>
              <button onClick={() => setShowWishlist(false)}>
                <X />
              </button>
            </div>

            {favorites.length === 0 ? (
              <div className="empty-cart">
                <Heart size={42} />
                <h3>Your wishlist is empty</h3>
                <p>Save products you love and find them here.</p>
                <button
                  className="solid-button"
                  onClick={() => setShowWishlist(false)}
                >
                  Continue shopping
                </button>
              </div>
            ) : (
              favorites.map(id => {
                const product = products.find(p => p.id === id);

                if (!product) return null;

                return (
                  <div className="cart-line" key={product.id}>
                    {product.image ? (
                      <img src={product.image} alt={product.name} />
                    ) : (
                      <div className="cart-no-image">
                        <BookOpen />
                      </div>
                    )}

                    <div className="cart-line-info">
                      <strong>{product.name}</strong>
                      <span>{money(product.price)}</span>

                      <button
                        onClick={() => {
                          setShowWishlist(false);
                          openProductDetails(product);
                        }}
                      >
                        View product
                      </button>

                      <button onClick={() => toggleFavorite(product)}>
                        Remove from wishlist
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </aside>
        </div>
      )}

      {/* CART */}
      {showCart && (
        <div
          className="drawer-backdrop"
          onClick={() => setShowCart(false)}
        >
          <aside
            className="cart-drawer"
            onClick={e => e.stopPropagation()}
          >
            <div className="drawer-heading">
              <h2>Your shopping bag ({cart.length})</h2>
              <button onClick={() => setShowCart(false)}>
                <X />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="empty-cart">
                <ShoppingBag size={42} />
                <h3>Your cart is waiting</h3>
                <p>
                  Discover something useful for your campus life.
                </p>
                <button
                  className="solid-button"
                  onClick={() => setShowCart(false)}
                >
                  Continue shopping
                </button>
              </div>
            ) : (
              <>
                {cart.map(item => (
                  <div className="cart-line" key={item.id}>
                    {item.image ? (
                      <img src={item.image} alt={item.name} />
                    ) : (
                      <div className="cart-no-image">
                        <BookOpen />
                      </div>
                    )}

                    <div className="cart-line-info">
                      <strong>{item.name}</strong>
                      <span>{money(item.price)}</span>

                      <div className="quantity-controls">
                        <button
                          onClick={() => changeQuantity(item.id, -1)}
                        >
                          <Minus size={13} />
                        </button>

                        {item.quantity}

                        <button
                          onClick={() => changeQuantity(item.id, 1)}
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="cart-total">
                  <strong>Total</strong>
                  <strong>{money(cartTotal)}</strong>
                </div>

                <button
                  className="solid-button checkout-button"
                  onClick={startCheckout}
                >
                  Proceed to checkout
                  <ArrowRight size={17} />
                </button>
              </>
            )}
          </aside>
        </div>
      )}

      {/* CHECKOUT */}
      {showCheckout && (
        <div
          className="modal-backdrop"
          onClick={() => {
            if (!checkoutLoading) setShowCheckout(false);
          }}
        >
          <div
            className="auth-modal"
            style={{
              width: "min(650px, 95vw)",
              maxHeight: "90vh",
              overflowY: "auto",
              textAlign: "left"
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => {
                if (!checkoutLoading) setShowCheckout(false);
              }}
            >
              <X />
            </button>

            {orderSuccess ? (
              <div style={{ textAlign: "center", padding: "25px 5px" }}>
                <CheckCircle
                  size={65}
                  color="#16a36a"
                  style={{ margin: "0 auto 15px" }}
                />

                <h2>Order placed successfully!</h2>

                <p style={{ margin: "15px 0", color: "#666" }}>
                  Thank you for shopping with CAMPUSCART.
                </p>

                <div
                  style={{
                    background: "#f5f6f8",
                    padding: 18,
                    borderRadius: 10,
                    margin: "20px 0",
                    textAlign: "left"
                  }}
                >
                  <p>
                    <strong>Order ID:</strong> {orderSuccess._id}
                  </p>
                  <p>
                    <strong>Total:</strong>{" "}
                    {money(orderSuccess.totalAmount)}
                  </p>
                  <p>
                    <strong>Payment:</strong>{" "}
                    {orderSuccess.paymentMethod}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    {orderSuccess.orderStatus}
                  </p>
                </div>

                {orderSuccess.paymentMethod === "ONLINE" && (
                  <p style={{ color: "#a66a00", fontSize: 13 }}>
                    Demo mode: no real payment was collected. A payment
                    gateway must be connected before accepting online
                    payments.
                  </p>
                )}

                <button
                  className="auth-submit"
                  style={{ marginTop: 20 }}
                  onClick={() => {
                    setShowCheckout(false);
                    setOrderSuccess(null);
                  }}
                >
                  Continue shopping
                </button>

                <button
                  className="solid-button"
                  style={{ width: "100%", marginTop: 12 }}
                  onClick={() => {
                    setShowCheckout(false);
                    setOrderSuccess(null);
                    fetchMyOrders();
                  }}
                >
                  View my orders
                </button>
              </div>
            ) : (
              <>
                <div className="auth-brand">
                  CAMPUS<span>CART</span>
                </div>

                <h2>Checkout</h2>
                <p>
                  Enter your delivery details to place your order.
                </p>

                <form onSubmit={placeOrder}>
                  <h3 style={{ margin: "22px 0 12px" }}>
                    Delivery address
                  </h3>

                  <label>Full name</label>
                  <input
                    required
                    value={deliveryAddress.fullName}
                    onChange={e =>
                      setDeliveryAddress({
                        ...deliveryAddress,
                        fullName: e.target.value
                      })
                    }
                    placeholder="Enter receiver's full name"
                  />

                  <label>Phone number</label>
                  <input
                    required
                    type="tel"
                    pattern="[0-9]{10}"
                    title="Enter a valid 10-digit phone number"
                    value={deliveryAddress.phone}
                    onChange={e =>
                      setDeliveryAddress({
                        ...deliveryAddress,
                        phone: e.target.value
                      })
                    }
                    placeholder="10-digit mobile number"
                  />

                  <label>Street address</label>
                  <textarea
                    required
                    value={deliveryAddress.street}
                    onChange={e =>
                      setDeliveryAddress({
                        ...deliveryAddress,
                        street: e.target.value
                      })
                    }
                    placeholder="House number, street, area"
                    rows={3}
                  />

                  <label>City</label>
                  <input
                    required
                    value={deliveryAddress.city}
                    onChange={e =>
                      setDeliveryAddress({
                        ...deliveryAddress,
                        city: e.target.value
                      })
                    }
                    placeholder="City"
                  />

                  <label>State</label>
                  <input
                    required
                    value={deliveryAddress.state}
                    onChange={e =>
                      setDeliveryAddress({
                        ...deliveryAddress,
                        state: e.target.value
                      })
                    }
                    placeholder="State"
                  />

                  <label>Postal code</label>
                  <input
                    required
                    pattern="[0-9]{6}"
                    title="Enter a valid 6-digit postal code"
                    value={deliveryAddress.postalCode}
                    onChange={e =>
                      setDeliveryAddress({
                        ...deliveryAddress,
                        postalCode: e.target.value
                      })
                    }
                    placeholder="6-digit PIN code"
                  />

                  <h3 style={{ margin: "24px 0 12px" }}>
                    Payment method
                  </h3>

                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: 13,
                      border: "1px solid #ddd",
                      borderRadius: 8,
                      marginBottom: 10,
                      cursor: "pointer"
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={paymentMethod === "COD"}
                      onChange={() => setPaymentMethod("COD")}
                    />
                    <span>
                      <strong>Cash on Delivery</strong>
                      <small style={{ display: "block", color: "#777" }}>
                        Pay when your order is delivered.
                      </small>
                    </span>
                  </label>

                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: 13,
                      border: "1px solid #ddd",
                      borderRadius: 8,
                      marginBottom: 10,
                      cursor: "pointer"
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="ONLINE"
                      checked={paymentMethod === "ONLINE"}
                      onChange={() => setPaymentMethod("ONLINE")}
                    />
                    <span>
                      <strong>Online Payment (Demo)</strong>
                      <small style={{ display: "block", color: "#777" }}>
                        Test/demo order only. No real payment is collected.
                      </small>
                    </span>
                  </label>

                  <div
                    style={{
                      background: "#f5f6f8",
                      padding: 16,
                      borderRadius: 8,
                      margin: "20px 0"
                    }}
                  >
                    <h3>Order summary</h3>

                    {cart.map(item => (
                      <div
                        key={item.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 10,
                          marginTop: 10
                        }}
                      >
                        <span>
                          {item.name} × {item.quantity}
                        </span>
                        <strong>
                          {money(item.price * item.quantity)}
                        </strong>
                      </div>
                    ))}

                    <hr style={{ margin: "14px 0" }} />

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 18
                      }}
                    >
                      <strong>Total</strong>
                      <strong>{money(cartTotal)}</strong>
                    </div>
                  </div>

                  {checkoutError && (
                    <div className="auth-error">{checkoutError}</div>
                  )}

                  <button
                    className="auth-submit"
                    type="submit"
                    disabled={checkoutLoading}
                  >
                    {checkoutLoading
                      ? "Placing your order..."
                      : `Place order · ${money(cartTotal)}`}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* MY ORDERS */}
      {showOrders && (
        <div
          className="drawer-backdrop"
          onClick={() => setShowOrders(false)}
        >
          <aside
            className="cart-drawer"
            onClick={e => e.stopPropagation()}
          >
            <div className="drawer-heading">
              <h2>My Orders</h2>
              <button onClick={() => setShowOrders(false)}>
                <X />
              </button>
            </div>

            {ordersLoading ? (
              <div className="empty-cart">Loading your orders...</div>
            ) : myOrders.length === 0 ? (
              <div className="empty-cart">
                <Package size={42} />
                <h3>No orders yet</h3>
                <p>Your placed orders will appear here.</p>
                <button
                  className="solid-button"
                  onClick={() => setShowOrders(false)}
                >
                  Continue shopping
                </button>
              </div>
            ) : (
              myOrders.map(order => (
                <div
                  key={order._id}
                  style={{
                    border: "1px solid #e5e5e5",
                    borderRadius: 10,
                    padding: 15,
                    marginBottom: 15
                  }}
                >
                  <strong>Order #{order._id.slice(-8)}</strong>

                  <p style={{ marginTop: 7 }}>
                    {new Date(order.createdAt).toLocaleDateString("en-IN")}
                  </p>

                  {order.items?.map((item, index) => (
                    <div
                      key={item._id || index}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 10,
                        marginTop: 10
                      }}
                    >
                      <span>
                        {item.title} × {item.quantity}
                      </span>
                      <strong>
                        {money(item.price * item.quantity)}
                      </strong>
                    </div>
                  ))}

                  <hr style={{ margin: "12px 0" }} />

                  <p>
                    <strong>Total: {money(order.totalAmount)}</strong>
                  </p>
                  <p>Payment: {order.paymentMethod}</p>
                  <p>Payment status: {order.paymentStatus}</p>
                  <p>Order status: {order.orderStatus}</p>
                </div>
              ))
            )}
          </aside>
        </div>
      )}

      {/* SIGN IN / SIGN UP / OTP / FORGOT PASSWORD */}
      {showAuth && (
        <div
          className="modal-backdrop"
          onClick={() => {
            if (!authLoading) setShowAuth(false);
          }}
        >
          <div
            className="auth-modal"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => {
                if (!authLoading) setShowAuth(false);
              }}
            >
              <X />
            </button>

            <div className="auth-brand">
              CAMPUS<span>CART</span>
            </div>

            <h2>
              {authMode === "forgot"
                ? forgotStep === 0
                  ? "Forgot Password?"
                  : forgotStep === 1
                    ? "Verify Reset OTP"
                    : "Create New Password"
                : otpStep
                  ? "Verify your email"
                  : authMode === "login"
                    ? "Welcome back!"
                    : "Create your account"}
            </h2>

            <p>
              {authMode === "forgot"
                ? forgotStep === 0
                  ? "Enter your registered email address to receive a reset OTP."
                  : forgotStep === 1
                    ? "Enter the OTP sent to your email address."
                    : "Choose a strong new password for your account."
                : otpStep
                  ? "Enter the OTP sent to your email address."
                  : "Sign in to shop smarter with CAMPUSCART."}
            </p>

            {/* FORGOT PASSWORD FORM */}
            {authMode === "forgot" ? (
              <form onSubmit={submitForgotPassword}>
                {forgotStep === 0 && (
                  <>
                    <label>Email address</label>

                    <input
                      required
                      type="email"
                      value={forgotData.email}
                      onChange={e =>
                        setForgotData({
                          ...forgotData,
                          email: e.target.value
                        })
                      }
                      placeholder="you@example.com"
                    />
                  </>
                )}

                {forgotStep === 1 && (
                  <>
                    <label>Registered email</label>

                    <input
                      type="email"
                      value={forgotData.email}
                      readOnly
                    />

                    <label>Reset OTP</label>

                    <input
                      required
                      value={forgotData.otp}
                      onChange={e =>
                        setForgotData({
                          ...forgotData,
                          otp: e.target.value
                        })
                      }
                      placeholder="Enter your reset OTP"
                    />
                  </>
                )}

                {forgotStep === 2 && (
  <>
    <label>New password</label>

    <div className="password-field">
      <input
        required
        type={showForgotPassword ? "text" : "password"}
        minLength={8}
        value={forgotData.newPassword}
        onChange={e =>
          setForgotData({
            ...forgotData,
            newPassword: e.target.value
          })
        }
        placeholder="Enter new password"
      />

      <button
        type="button"
        onClick={() => setShowForgotPassword(!showForgotPassword)}
      >
        {showForgotPassword ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>

    <label>Confirm new password</label>

    <div className="password-field">
      <input
        required
        type={showConfirmPassword ? "text" : "password"}
        minLength={8}
        value={forgotData.confirmPassword}
        onChange={e =>
          setForgotData({
            ...forgotData,
            confirmPassword: e.target.value
          })
        }
        placeholder="Confirm new password"
      />

      <button
        type="button"
        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
      >
        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  </>
)}

                <button
                  className="auth-submit"
                  type="submit"
                  disabled={authLoading}
                >
                  {authLoading
                    ? "Please wait..."
                    : forgotStep === 0
                      ? "Send Reset OTP"
                      : forgotStep === 1
                        ? "Verify OTP"
                        : "Reset Password"}
                </button>
              </form>
            ) : (
              /* EXISTING LOGIN AND SIGNUP FORM */
              <form onSubmit={submitAuth}>
                {authMode === "signup" && !otpStep && (
                  <>
                    <label>Full name</label>

                    <input
                      required
                      value={authData.fullName}
                      onChange={e =>
                        setAuthData({
                          ...authData,
                          fullName: e.target.value
                        })
                      }
                      placeholder="Enter your full name"
                    />
                  </>
                )}

                {!otpStep && (
                  <>
                    <label>Email address</label>

                    <input
                      required
                      type="email"
                      value={authData.email}
                      onChange={e =>
                        setAuthData({
                          ...authData,
                          email: e.target.value
                        })
                      }
                      placeholder="you@example.com"
                    />

                    <label>Password</label>

                    <div className="password-field">
                      <input
                        required
                        type={showPassword ? "text" : "password"}
                        value={authData.password}
                        onChange={e =>
                          setAuthData({
                            ...authData,
                            password: e.target.value
                          })
                        }
                        placeholder="Enter your password"
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword
                          ? <EyeOff size={18} />
                          : <Eye size={18} />}
                      </button>
                    </div>

                    {authMode === "login" && (
                      <div
                        style={{
                          textAlign: "right",
                          margin: "5px 0 15px"
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setAuthMode("forgot");
                            setForgotStep(0);

                            setForgotData({
                              email: authData.email,
                              otp: "",
                              newPassword: "",
                              confirmPassword: ""
                            });

                            setAuthError("");
                            setAuthMessage("");
                          }}
                          style={{
                            border: "none",
                            background: "transparent",
                            color: "#5145cd",
                            fontWeight: 600,
                            cursor: "pointer",
                            fontSize: 13
                          }}
                        >
                          Forgot password?
                        </button>
                      </div>
                    )}
                  </>
                )}

                {otpStep && (
                  <>
                    <label>Email OTP</label>

                    <input
                      required
                      value={authData.otp}
                      onChange={e =>
                        setAuthData({
                          ...authData,
                          otp: e.target.value
                        })
                      }
                      placeholder="Enter OTP"
                    />
                  </>
                )}

                <button
                  className="auth-submit"
                  type="submit"
                  disabled={authLoading}
                >
                  {authLoading
                    ? "Please wait..."
                    : otpStep
                      ? "Verify OTP"
                      : authMode === "login"
                        ? "Sign in"
                        : "Create account"}
                </button>
              </form>
            )}

            {authError && (
              <div className="auth-error">{authError}</div>
            )}

            {authMessage && (
              <div className="auth-success">{authMessage}</div>
            )}

            {authMode === "forgot" ? (
              <div className="auth-switch">
                Remembered your password?{" "}
                <button
                  onClick={() => {
                    setAuthMode("login");
                    setForgotStep(0);
                    setAuthError("");
                    setAuthMessage("");
                  }}
                >
                  Back to login
                </button>
              </div>
            ) : !otpStep && (
              <div className="auth-switch">
                {authMode === "login"
                  ? "New to CAMPUSCART? "
                  : "Already have an account? "}

                <button
                  onClick={() => {
                    setAuthMode(
                      authMode === "login" ? "signup" : "login"
                    );
                    setAuthError("");
                    setAuthMessage("");
                  }}
                >
                  {authMode === "login"
                    ? "Create account"
                    : "Sign in"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CAMPUS AI */}
      <button
        className="ai-floating-button"
        onClick={() => setShowAI(!showAI)}
      >
        {showAI ? <X size={22} /> : <Bot size={23} />}
        <span>{showAI ? "Close AI" : "CAMPUS AI"}</span>
      </button>

      {showAI && (
        <div className="ai-panel">
          <div className="ai-header">
            <div className="ai-heading-icon">
              <Sparkles size={22} />
            </div>

            <div>
              <strong>CAMPUS AI</strong>
              <small>Your smart shopping assistant</small>
            </div>

            <button onClick={() => setShowAI(false)}>
              <X size={20} />
            </button>
          </div>

          <div className="ai-welcome">
            <Sparkles size={17} />
            Ask me to recommend or compare student products!
          </div>

          <div className="ai-messages">
            {aiMessages.map((message, index) => (
              <div
                key={index}
                className={`ai-message ${message.role}`}
              >
                {message.role === "assistant" && <Bot size={17} />}

                <div className="ai-message-content">
                  <p>{message.text}</p>

                  {message.products?.map(product => (
                    <button
                      key={product.id}
                      className="ai-product-result"
                      onClick={() => {
                        setShowAI(false);
                        openProductDetails(product);
                      }}
                    >
                      {product.image && (
                        <img src={product.image} alt={product.name} />
                      )}

                      <span>
                        <strong>{product.name}</strong>
                        <small>
                          {product.category} · {product.condition}
                        </small>
                        <b>{money(product.price)}</b>
                        <small>View product details →</small>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="ai-suggestions">
            <button
              onClick={() =>
                setAiInput("Compare the available products")
              }
            >
              <GitCompare size={14} />
              Compare products
            </button>

            <button
              onClick={() => setAiInput("Recommend some textbooks")}
            >
              <BookOpen size={14} />
              Find textbooks
            </button>
          </div>

          <form
            className="ai-input-area"
            onSubmit={e => {
              e.preventDefault();
              askAI();
            }}
          >
            <input
              value={aiInput}
              onChange={e => setAiInput(e.target.value)}
              placeholder="Ask CAMPUS AI anything..."
            />

            <button type="submit" disabled={!aiInput.trim()}>
              <Send size={18} />
            </button>
          </form>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div className="toast">
          <CheckCircle size={19} />
          <span>{toast}</span>
          <button onClick={() => setToast("")}>
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

export default App;