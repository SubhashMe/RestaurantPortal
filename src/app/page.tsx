"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Menu, Bell, Search, User, LayoutDashboard, Home, 
  Settings, HelpCircle, Utensils, Grid, LogOut, X, ChevronRight,
  Mail, Phone, MapPin, Users, Clock, CheckCircle, Trash2, ShoppingCart,
  DollarSign, Download, Edit2, Save, ClipboardList, Calendar
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState(searchParams.get('menu') || "Home");
  const [userRole, setUserRole] = useState(searchParams.get('role') || "Customer"); // Default to Customer
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [newAnnouncement, setNewAnnouncement] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  
  const [menuLimit, setMenuLimit] = useState(12);
  const [adminOrdersLimit, setAdminOrdersLimit] = useState(10);
  const [customerOrdersLimit, setCustomerOrdersLimit] = useState(10);
  const [customerBookingsLimit, setCustomerBookingsLimit] = useState(10);
  const [bookingsLimit, setBookingsLimit] = useState(10);
  const [inquiriesLimit, setInquiriesLimit] = useState(10);
  const [usersLimit, setUsersLimit] = useState(10);
  
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [address, setAddress] = useState("123 Culinary Boulevard, Food District, FD 10024");
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [editProfile, setEditProfile] = useState({ name: '', phone: '' });
  const [passwordForm, setPasswordForm] = useState({ old: '', new: '', confirm: '' });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [tableBookings, setTableBookings] = useState<any[]>([]);
  const [contactInquiries, setContactInquiries] = useState<any[]>([]);
  const [adminOrders, setAdminOrders] = useState<any[]>([]);
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);
  const [loadingDashboardData, setLoadingDashboardData] = useState(false);
  const [loadingCustomerOrders, setLoadingCustomerOrders] = useState(false);
  const [customerBookings, setCustomerBookings] = useState<any[]>([]);
  const [loadingCustomerBookings, setLoadingCustomerBookings] = useState(false);

  const [categories, setCategories] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [contactMessage, setContactMessage] = useState("");
  const [contactForm, setContactForm] = useState({ firstName: "", lastName: "", email: "" });
  const [bookingForm, setBookingForm] = useState({ name: "", date: "", time: "", guests: 2 });
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [quantities, setQuantities] = useState<{[key: string]: number}>({});
  const [cart, setCart] = useState<any[]>([]);
  const [restaurantName, setRestaurantName] = useState("RestoPortal");
  const [restaurantUpiId, setRestaurantUpiId] = useState("restaurant@upi");
  
  // Cancel Order State
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("wrong_order");
  const [cancelReasonOther, setCancelReasonOther] = useState("");
  
  // Cancel Booking State
  const [showCancelBookingModal, setShowCancelBookingModal] = useState(false);
  const [cancelBookingId, setCancelBookingId] = useState<string | null>(null);
  const [cancelBookingReason, setCancelBookingReason] = useState("wrong_date");
  const [cancelBookingReasonOther, setCancelBookingReasonOther] = useState("");
  
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [newItemForm, setNewItemForm] = useState({ name: "", description: "", price: "", is_veg: true, image_url: "", category_id: "" });
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [showEditItemModal, setShowEditItemModal] = useState(false);
  const [editItemForm, setEditItemForm] = useState({ id: "", name: "", description: "", price: "", is_veg: true, image_url: "", category_id: "" });
  const [isEditingItem, setIsEditingItem] = useState(false);

  // Admin Add Category states
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [restaurantLogo, setRestaurantLogo] = useState("");
  const [restaurantTimings, setRestaurantTimings] = useState("10:00 AM - 11:00 PM");
  
  // Checkout states
  const [checkoutStep, setCheckoutStep] = useState(false);
  const [deliveryType, setDeliveryType] = useState('Dine-in');
  const [deliveryDetails, setDeliveryDetails] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  
  // Page Content Settings (Admin Editable)
  const [pageContent, setPageContent] = useState({
    homeTitle: "Build Your Digital Experience",
    homeSubtitle: "Explore a modern, responsive, and user-friendly platform designed to provide a smooth digital experience for managing your restaurant operations.",
    aboutTitle: "About RestoPortal",
    aboutText1: "Welcome to RestoPortal, your ultimate destination for managing restaurant operations and delivering exceptional culinary experiences. Our platform bridges the gap between passionate chefs, dedicated management, and food lovers.",
    aboutText2: "Founded in 2026, we believe that great food brings people together. Our mission is to provide an intuitive, seamless, and efficient digital environment where you can effortlessly browse menus, manage categories, and handle customer requests with precision.",
    contactEmail: "hello@restoportal.com",
    contactPhone: "+1 (555) 123-4567",
    contactAddress: "123 Culinary Boulevard, Food District, FD 10024"
  });

  const [editingField, setEditingField] = useState<string | null>(null);

  const renderEditable = (field: keyof typeof pageContent, Tag: any, className: string, multiline: boolean = false, isHeroTitle: boolean = false) => {
    const isEditing = editingField === field;
    const value = pageContent[field];

    if (isEditing) {
      return (
        <div className={`flex items-start gap-2 w-full mb-4 z-20 relative`}>
          {multiline ? (
            <textarea 
              value={value}
              onChange={(e) => setPageContent({ ...pageContent, [field]: e.target.value })}
              className="w-full p-3 bg-[#181a1f] text-amber-50 rounded-lg border-2 border-amber-500 focus:outline-none min-h-[120px] shadow-lg font-sans text-base"
            />
          ) : (
            <input 
              type="text"
              value={value}
              onChange={(e) => setPageContent({ ...pageContent, [field]: e.target.value })}
              className="w-full p-3 bg-[#181a1f] text-amber-50 rounded-lg border-2 border-amber-500 focus:outline-none shadow-lg font-sans text-base"
            />
          )}
          <button onClick={(e) => { e.preventDefault(); setEditingField(null); }} className="p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shrink-0 shadow-lg">
            <CheckCircle size={20} />
          </button>
        </div>
      );
    }

    return (
      <Tag className={`group flex items-start w-full ${className}`}>
        <span className="flex-1 w-full">
          {isHeroTitle ? (
            <>
              {value.split(' ').map((word, i, arr) => (
                i === arr.length - 1 ? <span key={i} className="text-blue-400"> {word}</span> : (i === 0 ? word : ' ' + word)
              ))}
            </>
          ) : (
            value
          )}
        </span>
        {(currentUser?.role?.toLowerCase() === 'admin' || userRole === 'Admin') && (
          <button 
            onClick={(e) => { e.preventDefault(); setEditingField(field); }} 
            className="md:opacity-0 group-hover:opacity-100 p-2 text-amber-500 hover:text-white bg-amber-900/40 hover:bg-blue-600 rounded-lg transition-all ml-4 shrink-0 shadow-sm"
            title="Edit content"
          >
            <Edit2 size={16} />
          </button>
        )}
      </Tag>
    );
  };

  useEffect(() => {
    const savedName = localStorage.getItem("restaurantName");
    if (savedName) setRestaurantName(savedName);
    const savedUpiId = localStorage.getItem("restaurantUpiId");
    if (savedUpiId) setRestaurantUpiId(savedUpiId);
    const savedLogo = localStorage.getItem("restaurantLogo");
    if (savedLogo) setRestaurantLogo(savedLogo);
    const savedTimings = localStorage.getItem("restaurantTimings");
    if (savedTimings) setRestaurantTimings(savedTimings);

    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }
    
    // Load page content
    const savedContent = localStorage.getItem("pageContent");
    if (savedContent) {
      try {
        setPageContent(JSON.parse(savedContent));
      } catch (e) {}
    }
    
    const savedActiveMenu = localStorage.getItem("activeMenu");
    if (savedActiveMenu) {
      setActiveMenu(savedActiveMenu);
    }
    
    setMounted(true);
  }, [menuLimit]); // Updated for pagination

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("activeMenu", activeMenu);
    }
  }, [activeMenu, mounted]);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleDeleteMenuItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this menu item?")) return;
    const { error } = await supabase.from('menu_items').delete().eq('id', id);
    if (!error) {
      setMenuItems(prev => prev.filter(item => item.id !== id));
      alert("Menu item deleted successfully!");
    } else {
      alert("Failed to delete menu item.");
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setIsAddingCategory(true);
    const { data, error } = await supabase.from('categories').insert([{ name: newCategoryName.trim() }]).select();
    setIsAddingCategory(false);
    if (!error && data) {
      setCategories(prev => [...prev, data[0]]);
      setShowAddCategoryModal(false);
      setNewCategoryName("");
      alert("Category added successfully!");
    } else {
      alert("Failed to add category.");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category? All items in it will also be deleted.")) return;
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (!error) {
      setCategories(prev => prev.filter(c => c.id !== id));
      setCategoryFilter("All");
      alert("Category deleted successfully!");
    } else {
      alert("Failed to delete category.");
    }
  };

  const handleAddMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemForm.name || !newItemForm.price || !newItemForm.category_id) return;
    setIsAddingItem(true);
    
    const { data, error } = await supabase.from('menu_items').insert([{
      name: newItemForm.name,
      description: newItemForm.description,
      price: parseFloat(newItemForm.price),
      is_veg: newItemForm.is_veg,
      image_url: newItemForm.image_url,
      category_id: newItemForm.category_id
    }]).select();

    setIsAddingItem(false);

    if (!error && data) {
      setMenuItems(prev => [...prev, data[0]]);
      setShowAddItemModal(false);
      setNewItemForm({ name: "", description: "", price: "", is_veg: true, image_url: "", category_id: "" });
      alert("Menu item added successfully!");
    } else {
      alert("Failed to add menu item.");
    }
  };

  const handleEditMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItemForm.id || !editItemForm.name || !editItemForm.price || !editItemForm.category_id) return;
    setIsEditingItem(true);
    
    const { data, error } = await supabase.from('menu_items').update({
      name: editItemForm.name,
      description: editItemForm.description,
      price: parseFloat(editItemForm.price),
      is_veg: editItemForm.is_veg,
      image_url: editItemForm.image_url,
      category_id: editItemForm.category_id
    }).eq('id', editItemForm.id).select();

    setIsEditingItem(false);

    if (error) {
      alert("Error updating item: " + error.message);
    } else if (data && data.length > 0) {
      setMenuItems(prev => prev.map(item => item.id === editItemForm.id ? data[0] : item));
      setShowEditItemModal(false);
      alert("Menu item updated successfully!");
    } else {
      alert("Failed to update menu item (no data returned). Maybe permissions issue.");
    }
  };

  const handleUpdateProfile = async () => {
    if (!currentUser) return;
    try {
      const { error } = await supabase.from('users').update({
        name: editProfile.name,
        phone: editProfile.phone
      }).eq('id', currentUser.id);
      if (error) throw error;
      alert("Profile updated successfully!");
      setCurrentUser((prev: any) => ({ ...prev, ...editProfile }));
    } catch (err: any) {
      alert("Error updating profile: " + err.message);
    }
  };

  const handleUpdateBookingStatus = async (id: string, newStatus: string) => {
    if (newStatus === 'Cancelled') {
      setCancelBookingId(id);
      setCancelBookingReason("wrong_date");
      setCancelBookingReasonOther("");
      setShowCancelBookingModal(true);
      return;
    }
    
    try {
      const { error } = await supabase.from('table_bookings').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      setTableBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
    } catch (err: any) {
      alert("Error updating status: " + err.message);
    }
  };

  const confirmCancelBooking = async () => {
    if (!cancelBookingId) return;
    const reason = cancelBookingReason === 'other' ? cancelBookingReasonOther : cancelBookingReason;
    if (!reason.trim()) {
      alert("Please provide a cancellation reason.");
      return;
    }
    try {
      const { error } = await supabase.from('table_bookings').update({ 
        status: 'Cancelled',
        cancel_reason: reason 
      }).eq('id', cancelBookingId);
      
      if (error) throw error;
      
      alert("Booking cancelled successfully.");
      setTableBookings(prev => prev.map(b => b.id === cancelBookingId ? { ...b, status: 'Cancelled', cancel_reason: reason } : b));
      setCustomerBookings(prev => prev.map(b => b.id === cancelBookingId ? { ...b, status: 'Cancelled', cancel_reason: reason } : b));
      setShowCancelBookingModal(false);
      setCancelBookingId(null);
      setCancelBookingReasonOther("");
    } catch (err: any) {
      alert("Error cancelling booking: " + err.message);
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if(!confirm("Are you sure you want to delete this booking?")) return;
    try {
      const { error } = await supabase.from('table_bookings').delete().eq('id', id);
      if (error) throw error;
      setTableBookings(prev => prev.filter(b => b.id !== id));
    } catch (err: any) {
      alert("Error deleting booking: " + err.message);
    }
  };

  const handleUpdateInquiryStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase.from('contact_inquiries').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      setContactInquiries(prev => prev.map(i => i.id === id ? { ...i, status: newStatus } : i));
    } catch (err: any) {
      alert("Error updating status: " + err.message);
    }
  };

  const handleUpdateOrderStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      setAdminOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
    } catch (err: any) {
      alert("Error updating order status: " + err.message);
    }
  };

  const handleDeleteInquiry = async (id: string) => {
    if(!confirm("Are you sure you want to delete this inquiry?")) return;
    try {
      const { error } = await supabase.from('contact_inquiries').delete().eq('id', id);
      if (error) throw error;
      setContactInquiries(prev => prev.filter(i => i.id !== id));
    } catch (err: any) {
      alert("Error deleting inquiry: " + err.message);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 2000); // 2 seconds debounce

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  useEffect(() => {
    // Read role from URL if available
    const searchParams = new URLSearchParams(window.location.search);
    const roleParam = searchParams.get('role');
    const emailParam = searchParams.get('email');
    const menuParam = searchParams.get('menu');
    
    if (roleParam) {
      setUserRole(roleParam);
    }
    
    if (menuParam) {
      setActiveMenu(menuParam);
    }

    if (emailParam) {
      supabase.from('users').select('*').eq('email', emailParam).maybeSingle().then(({ data }) => {
        if (data) {
          setCurrentUser(data);
          setEditProfile({
            name: data.name || '',
            phone: data.phone || ''
          });
        }
      });
    }
  }, [searchParams]);

  useEffect(() => {
    if (searchParams.get('menu') !== activeMenu) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('menu', activeMenu);
      window.history.replaceState(null, '', `?${params.toString()}`);
    }
  }, [activeMenu, router, searchParams]);

  useEffect(() => {
    async function fetchAnnouncements() {
      const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
      if (data) setAnnouncements(data);
    }
    fetchAnnouncements();
  }, [activeMenu]);

  useEffect(() => {
    async function fetchMenu() {
      setLoadingMenu(true);
      const { data: cats } = await supabase.from('categories').select('*').order('created_at', { ascending: false });
      const { data: items } = await supabase.from('menu_items').select('*').order('created_at', { ascending: false }).limit(menuLimit);
      if (cats && items) {
        // Sort cats based on the latest item added to them
        // Since items is already sorted by created_at desc, we just find the first occurrence of each category_id
        const sortedCats = [...cats].sort((a, b) => {
          const indexA = items.findIndex(item => item.category_id === a.id);
          const indexB = items.findIndex(item => item.category_id === b.id);
          
          const sortA = indexA === -1 ? Number.MAX_SAFE_INTEGER : indexA;
          const sortB = indexB === -1 ? Number.MAX_SAFE_INTEGER : indexB;
          
          return sortA - sortB;
        });
        setCategories(sortedCats);
      } else if (cats) {
        setCategories(cats);
      }
      
      if (items) setMenuItems(items);
      setLoadingMenu(false);
    }
    fetchMenu();
  }, [menuLimit]);

  useEffect(() => {
    if (activeMenu === "Dashboard" && userRole === "Admin") {
      setLoadingUsers(true);
      setLoadingDashboardData(true);
      fetch(`/api/admin/users?limit=${usersLimit}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.users) setAdminUsers(data.users);
          setLoadingUsers(false);
        })
        .catch(() => setLoadingUsers(false));
        
      const fetchDashboardData = async () => {
        const { data: bookings } = await supabase.from('table_bookings').select('*').order('created_at', { ascending: false }).limit(bookingsLimit);
        if (bookings) setTableBookings(bookings);

        const { data: inquiries } = await supabase.from('contact_inquiries').select('*').order('created_at', { ascending: false }).limit(inquiriesLimit);
        if (inquiries) setContactInquiries(inquiries);
        
        const { data: orders } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(adminOrdersLimit);
        if (orders) setAdminOrders(orders);

        setLoadingDashboardData(false);
      };
      fetchDashboardData();
    }
  }, [activeMenu, userRole, adminOrdersLimit, bookingsLimit, inquiriesLimit, usersLimit]); // Updated for pagination

  useEffect(() => {
    if ((activeMenu === "My Orders" || activeMenu === "Our Services") && currentUser?.email) {
      if (activeMenu === "My Orders") {
        setLoadingCustomerOrders(true);
        const fetchCustomerOrders = async () => {
          const { data: orders } = await supabase
            .from('orders')
            .select('*')
            .eq('user_email', currentUser.email)
            .order('created_at', { ascending: false })
            .limit(customerOrdersLimit);
          if (orders) setCustomerOrders(orders);
          setLoadingCustomerOrders(false);
        };
        fetchCustomerOrders();
      }

      setLoadingCustomerBookings(true);
      const fetchCustomerBookings = async () => {
        const { data: bookings } = await supabase
          .from('table_bookings')
          .select('*')
          .eq('user_email', currentUser.email)
          .order('created_at', { ascending: false })
          .limit(customerBookingsLimit);
        if (bookings) setCustomerBookings(bookings);
        setLoadingCustomerBookings(false);
      };
      fetchCustomerBookings();
    }
  }, [activeMenu, currentUser?.email, customerOrdersLimit, customerBookingsLimit]); // Updated for pagination

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    
    setIsFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await response.json();
          if (data && data.display_name) {
            setAddress(data.display_name);
          } else {
            setAddress(`${latitude}, ${longitude}`);
          }
        } catch (error) {
          alert("Could not fetch address details.");
        } finally {
          setIsFetchingLocation(false);
        }
      },
      (error) => {
        alert("Unable to retrieve your location. Please check your browser permissions.");
        setIsFetchingLocation(false);
      }
    );
  };

  const navItems = [
    { name: "Home", icon: Home, roles: ["Admin", "User", "Customer"] },
    { name: "Dashboard", icon: LayoutDashboard, roles: ["Admin"] },
    { name: "Categories", icon: Grid, roles: ["Admin", "User", "Customer"] },
    { name: "Services", icon: Utensils, roles: ["Admin", "User", "Customer"] },
    { name: "Cart", icon: ShoppingCart, roles: ["Admin", "User", "Customer"] },
    { name: "My Orders", icon: ClipboardList, roles: ["Admin", "User", "Customer"] },
    { name: "Profile", icon: User, roles: ["Admin", "User", "Customer"] },
    { name: "Settings", icon: Settings, roles: ["Admin"] },
    { name: "Help & Support", icon: HelpCircle, roles: ["Admin", "User", "Customer"] },
  ];

  const handleCancelOrder = async () => {
    if (!cancelOrderId) return;
    
    let reason = cancelReason;
    if (reason === "other") {
      const wordCount = cancelReasonOther.trim().split(/\s+/).filter(w => w.length > 0).length;
      if (wordCount === 0 || wordCount > 12) {
        alert("Reason must be between 1 and 12 words.");
        return;
      }
      reason = cancelReasonOther;
    }

    const { error } = await supabase
      .from('orders')
      .update({ status: 'Cancelled', cancel_reason: reason })
      .eq('id', cancelOrderId);

    if (error) {
      console.error(error);
      alert("Failed to cancel order.");
    } else {
      alert("Order cancelled successfully.");
      setCustomerOrders(prev => prev.map(o => o.id === cancelOrderId ? { ...o, status: 'Cancelled', cancel_reason: reason } : o));
      setAdminOrders(prev => prev.map(o => o.id === cancelOrderId ? { ...o, status: 'Cancelled', cancel_reason: reason } : o));
      setShowCancelModal(false);
      setCancelOrderId(null);
      setCancelReasonOther("");
    }
  };

  const visibleNavItems = navItems.filter(item => {
    if (item.name === "Profile" && !currentUser) return false;
    return item.roles.includes(userRole);
  });

  const renderCustomerBookings = () => (
    <div className="bg-[#181a1f] rounded-2xl shadow-sm border border-[#2c3038] overflow-hidden mt-8 max-w-6xl mx-auto w-full">
      <div className="p-6 border-b border-[#22252b] flex items-center justify-between">
        <h3 className="text-xl font-bold text-amber-50 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-amber-500" /> My Table Bookings
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-[#0f1115] text-slate-500 text-sm uppercase tracking-wider">
              <th className="px-6 py-4 font-semibold border-b border-[#2c3038]">ID</th>
              <th className="px-6 py-4 font-semibold border-b border-[#2c3038]">Date</th>
              <th className="px-6 py-4 font-semibold border-b border-[#2c3038]">Time</th>
              <th className="px-6 py-4 font-semibold border-b border-[#2c3038]">Guests</th>
              <th className="px-6 py-4 font-semibold border-b border-[#2c3038]">Status</th>
              <th className="px-6 py-4 font-semibold border-b border-[#2c3038]">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2c3038]">
            {loadingCustomerBookings ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">Loading your bookings...</td></tr>
            ) : customerBookings.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">You have no table bookings yet.</td></tr>
            ) : (
              customerBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-[#22252b] transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-amber-50"><span className="font-mono">{booking.id.substring(0,8)}</span></td>
                  <td className="px-6 py-4 text-sm text-slate-300">{booking.booking_date}</td>
                  <td className="px-6 py-4 text-sm text-slate-300">{booking.booking_time}</td>
                  <td className="px-6 py-4 text-sm text-slate-300 font-medium">{booking.guests}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                      booking.status === 'Confirmed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      booking.status === 'Cancelled' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                      'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {booking.status}
                    </span>
                    {booking.status === 'Cancelled' && booking.cancel_reason && (
                      <div className="text-xs text-red-400/80 mt-1 max-w-[200px] truncate" title={booking.cancel_reason}>
                        {booking.cancel_reason}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {booking.status !== 'Cancelled' && (
                      <button 
                        onClick={() => {
                          setCancelBookingId(booking.id);
                          setShowCancelBookingModal(true);
                        }}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                        title="Cancel Booking"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {customerBookings.length >= customerBookingsLimit && (
        <div className="flex justify-center my-6">
          <button onClick={() => setCustomerBookingsLimit(prev => prev + 10)} className="px-6 py-2 bg-[#2c3038] hover:bg-[#363b45] text-amber-400 rounded-full font-medium transition-colors border border-[#363b45]">
            Load More Bookings
          </button>
        </div>
      )}
    </div>
  );

  const headerNav = ["Home", "About", "Services", "Categories", "Contact"];

  return (
    <div suppressHydrationWarning className={`min-h-screen bg-[#0f1115] flex overflow-hidden`}>
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-20 md:hidden transition-opacity"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed md:static inset-y-0 left-0 z-30 bg-[#181a1f] border-r border-[#2c3038] transform transition-all duration-300 ease-in-out flex flex-col overflow-hidden ${
          sidebarOpen ? "w-64 translate-x-0" : "w-0 -translate-x-full md:w-20 md:translate-x-0"
        }`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#2c3038] min-w-max">
          <div className={`flex items-center gap-3 text-primary font-bold text-xl transition-opacity duration-300 opacity-100 ${!sidebarOpen ? "md:justify-center w-full" : ""}`}>
            {restaurantLogo ? (
              <img src={restaurantLogo} alt="Logo" className="w-8 h-8 rounded-lg object-cover bg-[#181a1f] shrink-0" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 flex items-center justify-center text-white shrink-0">
                <Utensils size={20} />
              </div>
            )}
            {sidebarOpen && <span className="truncate">{restaurantName}</span>}
          </div>
          <button className="md:hidden text-slate-500 hover:text-slate-700" onClick={toggleSidebar}>
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-3 min-w-max">
          {sidebarOpen && <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Main Menu</p>}
          <nav className="space-y-1">
            {visibleNavItems.map((item) => (
              <button
                key={item.name}
                onClick={() => setActiveMenu(item.name)}
                title={!sidebarOpen ? item.name : undefined}
                className={`flex items-center gap-4 px-3 py-2.5 rounded-lg transition-colors w-full ${
                  activeMenu === item.name 
                    ? "bg-amber-900/20 text-amber-400 font-medium" 
                    : "text-slate-400 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <item.icon size={20} className={`shrink-0 ${activeMenu === item.name ? "text-amber-500" : "text-slate-400"}`} />
                {sidebarOpen && <span>{item.name}</span>}
              </button>
            ))}
          </nav>
        </div>

        {currentUser && (
          <div className="p-4 border-t border-[#2c3038] min-w-max">
            <Link href="/login" className={`flex items-center gap-4 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors ${!sidebarOpen ? "justify-center px-0" : ""}`} title={!sidebarOpen ? "Logout" : undefined}>
              <LogOut size={20} className="shrink-0" />
              {sidebarOpen && <span className="font-medium">Logout</span>}
            </Link>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Header */}
        <header className="h-16 bg-[#181a1f] border-b border-[#2c3038] flex items-center justify-between px-4 sm:px-6 relative z-50 transition-all">
          <div className="flex items-center gap-4 sm:gap-6">
            
            <button 
              className="text-slate-500 hover:text-slate-700 focus:outline-none p-1 rounded-md hover:bg-slate-100 transition-colors" 
              onClick={toggleSidebar}
            >
              <Menu size={24} />
            </button>
            
            {/* Name (Right of Sidebar Button) */}
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-amber-500 tracking-wide">{restaurantName}</span>
            </div>

            {/* Desktop Navbar */}
            <nav className="hidden lg:flex items-center gap-1">
              {headerNav.map((item) => (
                <button 
                  key={item}
                  onClick={() => setActiveMenu(item)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeMenu === item 
                      ? "text-amber-400 bg-amber-900/20" 
                      : "text-slate-400 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  {item}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <div className="relative hidden sm:block">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search menu items..." 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.trim() !== "" && activeMenu !== "Categories") {
                    setActiveMenu("Categories");
                  }
                }}
                className="pl-9 pr-4 py-2 bg-[#22252b] border-transparent rounded-full text-sm text-slate-200 focus:text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 outline-none w-48 lg:w-64 transition-all"
              />
            </div>
            
            <button 
              onClick={() => setActiveMenu("Cart")}
              className="relative text-slate-500 hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-slate-100"
            >
              <ShoppingCart size={20} />
              {cart.length > 0 && <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full border-2 border-white"></span>}
            </button>
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative text-slate-500 hover:text-amber-500 transition-colors p-2 rounded-full hover:bg-slate-100/10"
              >
                <Bell size={20} />
                {announcements.filter(a => a.is_active).length > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#181a1f]"></span>
                )}
              </button>
              
              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#181a1f] border border-[#2c3038] rounded-xl shadow-2xl z-50 overflow-hidden">
                    <div className="p-4 border-b border-[#2c3038] bg-[#0f1115] flex justify-between items-center">
                      <h3 className="font-semibold text-white flex items-center gap-2">
                        <Bell className="w-4 h-4 text-amber-500" />
                        Notifications
                      </h3>
                      <button onClick={() => setShowNotifications(false)} className="text-slate-500 hover:text-white transition-colors">
                        <X size={16} />
                      </button>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                      {announcements.filter(a => a.is_active).length > 0 ? (
                        announcements.filter(a => a.is_active).map(ann => (
                          <div key={ann.id} className="p-4 border-b border-[#2c3038] last:border-0 hover:bg-[#22252b] transition-colors">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                <Bell className="w-4 h-4 text-amber-500" />
                              </div>
                              <div className="flex-1">
                                <h4 className="text-sm font-medium text-amber-500 mb-1">Announcement</h4>
                                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{ann.message}</p>
                                <p className="text-xs text-slate-500 mt-2">{new Date(ann.created_at).toLocaleString()}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 flex flex-col items-center justify-center text-slate-500 space-y-3">
                          <div className="w-12 h-12 rounded-full bg-[#2c3038]/50 flex items-center justify-center">
                            <Bell className="w-6 h-6 text-slate-400 opacity-50" />
                          </div>
                          <p>No new notifications</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {currentUser ? (
              <div 
                onClick={() => setActiveMenu("Profile")}
                className="flex items-center gap-2 cursor-pointer p-1 rounded-full hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
              >
                <div className="w-8 h-8 rounded-full bg-amber-900/40 flex items-center justify-center text-amber-400 font-bold border border-amber-900/50">
                  {currentUser?.name ? currentUser.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'JD'}
                </div>
                <span className="text-sm font-medium text-slate-300 hidden sm:block pr-2">
                  {currentUser?.name || 'John Doe'}
                </span>
              </div>
            ) : (
              <button 
                onClick={() => router.push('/login')}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-sm font-medium rounded-lg hover:from-amber-600 hover:to-amber-700 transition-colors shadow-sm"
              >
                Login
              </button>
            )}
          </div>
        </header>

        {/* Page Content (Hero Section) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className={`max-w-6xl mx-auto transition-opacity duration-300 ${!mounted ? 'opacity-0' : 'opacity-100'}`}>
            {activeMenu === "Cart" && (
              <div className="animate-in fade-in duration-300 max-w-4xl mx-auto">
                <div className="bg-[#181a1f] rounded-2xl shadow-sm border border-[#2c3038] p-6 md:p-10 mb-8">
                  <h2 className="text-2xl font-bold text-amber-50 mb-6 flex items-center gap-2">
                    <ShoppingCart className="text-amber-500" /> Your Cart
                  </h2>
                  {cart.length === 0 ? (
                    <div className="text-center py-10">
                      <div className="w-16 h-16 bg-[#22252b] rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShoppingCart className="h-8 w-8 text-slate-400" />
                      </div>
                      <p className="text-slate-500 mb-6 text-lg">Your cart is empty.</p>
                      <button onClick={() => setActiveMenu("Categories")} className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-amber-700 transition-colors shadow-sm">
                        Browse Menu
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="divide-y divide-[#2c3038] mb-6 border-t border-[#22252b] pt-4">
                        {cart.map((item, index) => (
                          <div key={index} className="py-4 flex justify-between items-center group hover:bg-[#2c3038] px-2 rounded-lg transition-colors">
                            <div className="flex items-center gap-4">
                              <img src={item.image_url} alt={item.name} className="w-16 h-16 object-cover rounded-lg shadow-sm" />
                              <div>
                                <h4 className="font-semibold text-amber-50">{item.name}</h4>
                                <div className="text-slate-500 text-sm flex items-center gap-4 mt-1">
                                  <span>₹{Number(item.price).toFixed(2)} each</span>
                                  <div className="flex items-center gap-2 bg-[#22252b] px-2 py-1 rounded-md">
                                    <span className="font-medium text-slate-300">Qty: {item.quantity}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-6">
                              <span className="font-semibold text-lg">₹{(Number(item.price) * item.quantity).toFixed(2)}</span>
                              <button onClick={() => setCart(cart.filter(c => c.id !== item.id))} className="text-red-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors" title="Remove from cart">
                                <Trash2 size={20} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-8 pt-6 border-t border-[#2c3038]">
                        <div className="flex justify-between items-center mb-6">
                          <span className="text-lg font-bold text-slate-300">Total Amount</span>
                          <span className="text-3xl font-bold text-amber-500">₹{cart.reduce((total, item) => total + Number(item.price) * item.quantity, 0).toFixed(2)}</span>
                        </div>
                        
                        {!checkoutStep ? (
                          <button 
                            onClick={() => {
                              if (!currentUser) {
                                router.push('/login');
                                return;
                              }
                              setCheckoutStep(true);
                            }} 
                            className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-lg font-bold rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg shadow-blue-600/30 transform hover:-translate-y-1"
                          >
                            Proceed to Checkout
                          </button>
                        ) : (
                          <div className="mt-6 p-5 border border-[#2c3038] rounded-xl bg-[#0f1115] space-y-4 animate-in fade-in slide-in-from-bottom-4">
                            <h3 className="font-bold text-lg text-slate-200">How would you like to receive your order?</h3>
                            
                            <div className="flex flex-col sm:flex-row gap-4">
                              <label className={`flex-1 flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${deliveryType === 'Dine-in' ? 'border-amber-500 bg-amber-900/20 text-amber-400' : 'border-[#2c3038] bg-[#181a1f] hover:bg-[#2c3038] text-slate-300'}`}>
                                <input 
                                  type="radio" 
                                  name="deliveryType" 
                                  checked={deliveryType === 'Dine-in'} 
                                  onChange={() => { setDeliveryType('Dine-in'); setDeliveryDetails(''); }}
                                  className="w-4 h-4 text-amber-500 border-[#363b45] focus:ring-amber-500"
                                />
                                <span className="font-medium">Dine-in (Table No.)</span>
                              </label>
                              
                              <label className={`flex-1 flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${deliveryType === 'Delivery' ? 'border-amber-500 bg-amber-900/20 text-amber-400' : 'border-[#2c3038] bg-[#181a1f] hover:bg-[#2c3038] text-slate-300'}`}>
                                <input 
                                  type="radio" 
                                  name="deliveryType" 
                                  checked={deliveryType === 'Delivery'} 
                                  onChange={() => { setDeliveryType('Delivery'); setDeliveryDetails(address); }}
                                  className="w-4 h-4 text-amber-500 border-[#363b45] focus:ring-amber-500"
                                />
                                <span className="font-medium">Delivery (Profile Address)</span>
                              </label>
                            </div>
                            
                            {deliveryType === 'Dine-in' && (
                              <div className="pt-2 animate-in fade-in">
                                <label className="block text-sm font-semibold text-slate-300 mb-1">Table Number</label>
                                <input 
                                  type="text" 
                                  value={deliveryDetails} 
                                  onChange={(e) => setDeliveryDetails(e.target.value)} 
                                  className="w-full px-4 py-2 border border-[#363b45] rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" 
                                  placeholder="e.g. 5" 
                                />
                              </div>
                            )}
                            
                            {deliveryType === 'Delivery' && (
                              <div className="pt-2 animate-in fade-in space-y-4">
                                <div>
                                  <label className="block text-sm font-semibold text-slate-300 mb-1">Delivery Address</label>
                                  <textarea 
                                    value={deliveryDetails} 
                                    onChange={(e) => setDeliveryDetails(e.target.value)} 
                                    className="w-full px-4 py-2 border border-[#363b45] rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" 
                                    placeholder="Enter your full delivery address" 
                                    rows={3}
                                  ></textarea>
                                </div>
                                
                                <div className="pt-2 border-t border-[#2c3038]">
                                  <label className="block text-sm font-semibold text-slate-300 mb-2">Payment Method</label>
                                  <div className="flex flex-col sm:flex-row gap-4">

                                    <label className={`flex-1 flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'Cash on Delivery' ? 'border-amber-500 bg-amber-900/20 text-amber-400' : 'border-[#2c3038] bg-[#181a1f] hover:bg-[#2c3038] text-slate-300'}`}>
                                      <input 
                                        type="radio" 
                                        name="paymentMethod" 
                                        checked={paymentMethod === 'Cash on Delivery'} 
                                        onChange={() => setPaymentMethod('Cash on Delivery')}
                                        className="w-4 h-4 text-amber-500 border-[#363b45] focus:ring-amber-500"
                                      />
                                      <span className="font-medium">Cash on Delivery</span>
                                    </label>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            <div className="flex gap-3 pt-4 border-t border-[#2c3038]">
                              <button 
                                onClick={() => setCheckoutStep(false)} 
                                className="px-6 py-3 bg-[#181a1f] border border-[#363b45] text-slate-300 font-semibold rounded-xl hover:bg-[#2c3038] transition-colors w-1/3"
                              >
                                Back
                              </button>
                              <button 
                                onClick={async () => {
                                  if (!deliveryDetails.trim()) {
                                    return alert("Please provide " + (deliveryType === 'Dine-in' ? "Table Number" : "Delivery Address"));
                                  }
                                  
                                  try {
                                    const totalAmount = cart.reduce((total, item) => total + Number(item.price) * item.quantity, 0);
                                    const userEmail = currentUser?.email || "guest@restoportal.com";
                                    
                                    const placeOrder = async () => {
                                      const { error } = await supabase.from('orders').insert({
                                        user_email: userEmail,
                                        total_amount: totalAmount,
                                        items: cart,
                                        delivery_type: deliveryType,
                                        delivery_details: deliveryDetails,
                                        payment_method: deliveryType === 'Delivery' ? paymentMethod : 'Not Specified'
                                      });
                                      if (error) throw error;
                                      
                                      if (deliveryType === 'Delivery' && deliveryDetails !== address) {
                                        setAddress(deliveryDetails);
                                      }
                                      
                                      alert("Order placed successfully!"); 
                                      setCart([]); 
                                      setCheckoutStep(false);
                                      setDeliveryDetails('');
                                      setActiveMenu("Home");
                                    };

                                    await placeOrder();
                                  } catch(err: any) {
                                    alert("Failed to place order: " + err.message);
                                  }
                                }} 
                                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold rounded-xl hover:from-amber-600 hover:to-amber-700 transition-colors w-2/3 shadow-md"
                              >
                                Confirm Order
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeMenu === "My Orders" && (
              <div className="animate-in fade-in duration-300 max-w-5xl mx-auto">
                <div className="bg-[#181a1f] rounded-2xl shadow-sm border border-[#2c3038] p-6 md:p-10 mb-8">
                  <h2 className="text-2xl font-bold text-amber-50 mb-6 flex items-center gap-2">
                    <ClipboardList className="text-amber-500" />
                    My Orders
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#0f1115] text-slate-500 text-sm uppercase tracking-wider">
                          <th className="px-6 py-4 font-semibold border-b border-[#2c3038]">ID</th>
                          <th className="px-6 py-4 font-semibold border-b border-[#2c3038]">Date</th>
                          <th className="px-6 py-4 font-semibold border-b border-[#2c3038]">Items</th>
                          <th className="px-6 py-4 font-semibold border-b border-[#2c3038]">Total</th>
                          <th className="px-6 py-4 font-semibold border-b border-[#2c3038]">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#2c3038]">
                        {loadingCustomerOrders ? (
                          <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading your orders...</td></tr>
                        ) : customerOrders.length === 0 ? (
                          <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">You have no orders yet.</td></tr>
                        ) : (
                          customerOrders.map((order) => (
                            <tr key={order.id} className="hover:bg-[#22252b] transition-colors">
                              <td className="px-6 py-4 text-sm font-medium text-amber-50"><span className="font-mono">{order.id.substring(0,8)}</span></td>
                              <td className="px-6 py-4 text-sm text-slate-300">{new Date(order.created_at).toLocaleDateString()}</td>
                              <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate" title={order.items.map((i: any) => `${i.quantity}x ${i.name}`).join(', ')}>
                                {order.items.map((i: any) => `${i.quantity}x ${i.name}`).join(', ')}
                              </td>
                              <td className="px-6 py-4 text-sm text-amber-50 font-bold">₹{order.total_amount}</td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                    order.status === 'Processing' ? 'bg-amber-900/40 text-amber-300' :
                                    order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {order.status}
                                  </span>
                                  {order.status === 'Pending' && (
                                    <button
                                      onClick={() => {
                                        setCancelOrderId(order.id);
                                        setCancelReason("wrong_order");
                                        setCancelReasonOther("");
                                        setShowCancelModal(true);
                                      }}
                                      className="text-xs text-red-600 hover:text-red-800 font-medium underline ml-2"
                                    >
                                      Cancel
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  {customerOrders.length >= customerOrdersLimit && (
                    <div className="flex justify-center mt-6">
                      <button onClick={() => setCustomerOrdersLimit(prev => prev + 10)} className="px-6 py-2 bg-[#2c3038] hover:bg-[#363b45] text-amber-400 rounded-full font-medium transition-colors border border-[#363b45]">
                        Load More Orders
                      </button>
                    </div>
                  )}
                </div>
                {renderCustomerBookings()}
              </div>
            )}

            {activeMenu === "Categories" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex flex-col gap-6 mb-8">
                  <div className="flex justify-between items-end">
                    <div>
                      <h2 className="text-3xl font-bold text-amber-50 mb-2">Menu Categories</h2>
                      <p className="text-slate-500">Explore our delicious veg and non-veg options</p>
                    </div>
                    {(currentUser?.role?.toLowerCase() === 'admin' || userRole === 'Admin') && (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setShowAddCategoryModal(true)}
                          className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors font-medium text-sm flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                          Add Category
                        </button>
                        <button 
                          onClick={() => setShowAddItemModal(true)}
                          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition-colors font-medium text-sm flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                          Add Menu Item
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex bg-[#22252b] p-1.5 rounded-xl overflow-x-auto w-full no-scrollbar border border-[#2c3038] shadow-sm">
                    <button 
                      onClick={() => setCategoryFilter("All")}
                      className={`px-5 py-2 text-sm font-semibold rounded-lg whitespace-nowrap transition-all ${categoryFilter === "All" ? "bg-[#181a1f] text-amber-400 shadow-sm" : "text-slate-400 hover:text-slate-900 hover:bg-slate-200"}`}
                    >
                      All
                    </button>
                    <button 
                      onClick={() => setCategoryFilter("Veg")}
                      className={`px-5 py-2 text-sm font-semibold rounded-lg whitespace-nowrap transition-all ${categoryFilter === "Veg" ? "bg-[#181a1f] text-green-700 shadow-sm" : "text-slate-400 hover:text-slate-900 hover:bg-slate-200"}`}
                    >
                      Veg
                    </button>
                    <button 
                      onClick={() => setCategoryFilter("Non-Veg")}
                      className={`px-5 py-2 text-sm font-semibold rounded-lg whitespace-nowrap transition-all ${categoryFilter === "Non-Veg" ? "bg-[#181a1f] text-red-700 shadow-sm" : "text-slate-400 hover:text-slate-900 hover:bg-slate-200"}`}
                    >
                      Non-Veg
                    </button>
                    
                    {categories.length > 0 && (
                      <>
                        <div className="w-px h-6 bg-slate-300 my-auto mx-3 flex-shrink-0"></div>
                        {categories.map((cat) => (
                          <button 
                            key={cat.id}
                            onClick={() => setCategoryFilter(cat.name)}
                            className={`px-5 py-2 text-sm font-semibold rounded-lg whitespace-nowrap transition-all ${categoryFilter === cat.name ? "bg-[#181a1f] text-amber-400 shadow-sm" : "text-slate-400 hover:text-slate-900 hover:bg-slate-200"}`}
                          >
                            {cat.name}
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                </div>



                {showAddItemModal && (
                  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-[#181a1f] rounded-2xl w-full max-w-md shadow-2xl p-6">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-amber-50">Add Menu Item</h3>
                        <button onClick={() => setShowAddItemModal(false)} className="text-slate-400 hover:text-slate-600">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                      </div>
                      <form onSubmit={handleAddMenuItem} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-1">Name</label>
                          <input type="text" required value={newItemForm.name} onChange={e => setNewItemForm({...newItemForm, name: e.target.value})} className="w-full px-4 py-2 border border-[#2c3038] rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="E.g., Paneer Tikka" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                          <textarea required value={newItemForm.description} onChange={e => setNewItemForm({...newItemForm, description: e.target.value})} className="w-full px-4 py-2 border border-[#2c3038] rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="Brief description..." rows={2}></textarea>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Price (₹)</label>
                            <input type="number" min="0" step="0.01" required value={newItemForm.price} onChange={e => setNewItemForm({...newItemForm, price: e.target.value})} className="w-full px-4 py-2 border border-[#2c3038] rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="0.00" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Type</label>
                            <select value={newItemForm.is_veg ? "veg" : "nonveg"} onChange={e => setNewItemForm({...newItemForm, is_veg: e.target.value === 'veg'})} className="w-full px-4 py-2 border border-[#2c3038] rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500">
                              <option value="veg">Veg</option>
                              <option value="nonveg">Non-Veg</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
                          <select required value={newItemForm.category_id} onChange={e => setNewItemForm({...newItemForm, category_id: e.target.value})} className="w-full px-4 py-2 border border-[#2c3038] rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500">
                            <option value="">Select a category...</option>
                            {categories.map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-1">Image URL (Optional)</label>
                          <input type="url" value={newItemForm.image_url} onChange={e => setNewItemForm({...newItemForm, image_url: e.target.value})} className="w-full px-4 py-2 border border-[#2c3038] rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="https://..." />
                        </div>
                        <button type="submit" disabled={isAddingItem} className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium rounded-lg hover:from-amber-600 hover:to-amber-700 transition-colors mt-4">
                          {isAddingItem ? "Adding..." : "Add Menu Item"}
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                {showEditItemModal && (
                  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-[#181a1f] rounded-2xl w-full max-w-md shadow-2xl p-6">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-amber-50">Edit Menu Item</h3>
                        <button onClick={() => setShowEditItemModal(false)} className="text-slate-400 hover:text-slate-600">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                      </div>
                      <form onSubmit={handleEditMenuItem} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-1">Name</label>
                          <input type="text" required value={editItemForm.name} onChange={e => setEditItemForm({...editItemForm, name: e.target.value})} className="w-full px-4 py-2 border border-[#2c3038] rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="E.g., Paneer Tikka" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                          <textarea required value={editItemForm.description} onChange={e => setEditItemForm({...editItemForm, description: e.target.value})} className="w-full px-4 py-2 border border-[#2c3038] rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="Brief description..." rows={2}></textarea>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Price (₹)</label>
                            <input type="number" min="0" step="0.01" required value={editItemForm.price} onChange={e => setEditItemForm({...editItemForm, price: e.target.value})} className="w-full px-4 py-2 border border-[#2c3038] rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="0.00" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Type</label>
                            <select value={editItemForm.is_veg ? "veg" : "nonveg"} onChange={e => setEditItemForm({...editItemForm, is_veg: e.target.value === 'veg'})} className="w-full px-4 py-2 border border-[#2c3038] rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500">
                              <option value="veg">Veg</option>
                              <option value="nonveg">Non-Veg</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
                          <select required value={editItemForm.category_id} onChange={e => setEditItemForm({...editItemForm, category_id: e.target.value})} className="w-full px-4 py-2 border border-[#2c3038] rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500">
                            <option value="">Select a category...</option>
                            {categories.map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-1">Image URL (Optional)</label>
                          <input type="url" value={editItemForm.image_url} onChange={e => setEditItemForm({...editItemForm, image_url: e.target.value})} className="w-full px-4 py-2 border border-[#2c3038] rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="https://..." />
                        </div>
                        <button type="submit" disabled={isEditingItem} className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium rounded-lg hover:from-amber-600 hover:to-amber-700 transition-colors mt-4">
                          {isEditingItem ? "Updating..." : "Update Menu Item"}
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                {showAddCategoryModal && (
                  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-[#181a1f] rounded-2xl w-full max-w-sm shadow-2xl p-6">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-amber-50">Add Category</h3>
                        <button onClick={() => setShowAddCategoryModal(false)} className="text-slate-400 hover:text-slate-600">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                      </div>
                      <form onSubmit={handleAddCategory} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-1">Category Name</label>
                          <input type="text" required value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} className="w-full px-4 py-2 border border-[#2c3038] rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="E.g., Special Thali" />
                        </div>
                        <button type="submit" disabled={isAddingCategory} className="w-full py-2.5 bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-900 transition-colors mt-4">
                          {isAddingCategory ? "Adding..." : "Add Category"}
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                {/* Dynamic Categories */}
                {loadingMenu ? (
                  <div className="flex justify-center items-center py-20">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  categories.map((category) => {
                    const items = menuItems.filter(item => {
                      if (item.category_id !== category.id) return false;
                      if (categoryFilter === "Veg" && !item.is_veg) return false;
                      if (categoryFilter === "Non-Veg" && item.is_veg) return false;
                      if (categoryFilter !== "All" && categoryFilter !== "Veg" && categoryFilter !== "Non-Veg" && categoryFilter !== category.name) return false;
                      if (debouncedSearchQuery && !item.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) && !item.description?.toLowerCase().includes(debouncedSearchQuery.toLowerCase())) return false;
                      return true;
                    });

                    if (items.length === 0) return null;

                    return (
                      <div key={category.id} className="mb-10 animate-in fade-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-xl font-bold text-slate-200 flex items-center gap-2">
                            {category.name}
                          </h3>
                          {(currentUser?.role?.toLowerCase() === 'admin' || userRole === 'Admin') && (
                            <button
                              onClick={() => handleDeleteCategory(category.id)}
                              className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1"
                              title="Delete Category"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                              Delete Category
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {items.map((item) => (
                            <div key={item.id} className="bg-[#181a1f] rounded-2xl overflow-hidden shadow-sm border border-[#2c3038] hover:shadow-lg transition-all group">
                              <div className="h-48 bg-[#2c3038] relative overflow-hidden">
                                {item.image_url ? (
                                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-[#22252b] text-slate-400">No Image</div>
                                )}
                                <div className={`absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold shadow-sm ${item.is_veg ? 'text-green-700' : 'text-red-700'}`}>
                                  ₹{item.price.toFixed(2)}
                                </div>
                                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm p-1.5 rounded-full shadow-sm">
                                  <div className={`w-3 h-3 rounded-full ${item.is_veg ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                </div>
                              </div>
                              <div className="p-5">
                                <h4 className="text-lg font-bold text-amber-50 mb-2">{item.name}</h4>
                                <p className="text-slate-400 text-sm mb-4 line-clamp-2">{item.description}</p>
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center border border-[#2c3038] rounded-lg bg-[#0f1115]">
                                    <button onClick={() => setQuantities(prev => ({...prev, [item.id]: Math.max(1, (prev[item.id] || 1) - 1)}))} className="px-3 py-2 text-slate-500 hover:text-slate-700">-</button>
                                    <span className="w-6 text-center text-sm font-semibold">{quantities[item.id] || 1}</span>
                                    <button onClick={() => setQuantities(prev => ({...prev, [item.id]: (prev[item.id] || 1) + 1}))} className="px-3 py-2 text-slate-500 hover:text-slate-700">+</button>
                                  </div>
                                  <button 
                                    onClick={() => {
                                      const quantity = quantities[item.id] || 1;
                                      const existingItem = cart.find(c => c.id === item.id);
                                      if (existingItem) {
                                        setCart(cart.map(c => c.id === item.id ? { ...c, quantity: c.quantity + quantity } : c));
                                      } else {
                                        setCart([...cart, { ...item, quantity }]);
                                      }
                                      alert(`Added ${quantity}x ${item.name} to cart!`);
                                    }}
                                    className="flex-1 py-2.5 bg-amber-900/20 text-amber-400 font-semibold rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
                                  >
                                    Add to Cart
                                  </button>
                                  {(currentUser?.role?.toLowerCase() === 'admin' || userRole === 'Admin') && (
                                    <>
                                      <button
                                        onClick={() => {
                                          setEditItemForm({
                                            id: item.id,
                                            name: item.name,
                                            description: item.description || '',
                                            price: String(item.price),
                                            is_veg: item.is_veg,
                                            image_url: item.image_url || '',
                                            category_id: String(item.category_id)
                                          });
                                          setShowEditItemModal(true);
                                        }}
                                        className="p-2.5 text-amber-500 bg-amber-900/20 rounded-lg hover:bg-blue-500 hover:text-white transition-colors"
                                        title="Edit Item"
                                      >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                      </button>
                                      <button
                                        onClick={() => handleDeleteMenuItem(item.id)}
                                        className="p-2.5 text-red-500 bg-red-50 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                                        title="Delete Item"
                                      >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
                {menuItems.length >= menuLimit && (
                  <div className="flex justify-center mt-8 pb-4">
                    <button onClick={() => setMenuLimit(prev => prev + 12)} className="px-6 py-2 bg-[#2c3038] hover:bg-[#363b45] text-amber-400 rounded-full font-medium transition-colors border border-[#363b45]">
                      Load More Items
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeMenu === "About" && (
              <div className="animate-in fade-in duration-300 bg-[#181a1f] rounded-2xl shadow-sm border border-[#2c3038] p-8 sm:p-12">
                <div className="max-w-3xl mx-auto text-center">
                  <div className="w-16 h-16 bg-amber-900/40 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Utensils size={32} />
                  </div>
                  {renderEditable('aboutTitle', 'h2', 'text-3xl font-bold text-amber-50 mb-6')}
                  {renderEditable('aboutText1', 'p', 'text-lg text-slate-400 leading-relaxed mb-8', true)}
                  {renderEditable('aboutText2', 'p', 'text-lg text-slate-400 leading-relaxed mb-8', true)}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-[#22252b]">
                    <div className="p-4">
                      <h4 className="text-3xl font-bold text-amber-500 mb-2">10K+</h4>
                      <p className="text-slate-500 font-medium">Happy Customers</p>
                    </div>
                    <div className="p-4">
                      <h4 className="text-3xl font-bold text-amber-500 mb-2">50+</h4>
                      <p className="text-slate-500 font-medium">Chef Specials</p>
                    </div>
                    <div className="p-4">
                      <h4 className="text-3xl font-bold text-amber-500 mb-2">4.9</h4>
                      <p className="text-slate-500 font-medium">Average Rating</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeMenu === "Contact" && (
              <div className="animate-in fade-in duration-300">
                <div className="mb-8 text-center">
                  <h2 className="text-3xl font-bold text-amber-50 mb-2">Contact Us</h2>
                  <p className="text-slate-500">We'd love to hear from you. Get in touch with our team.</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Contact Info */}
                  <div className="bg-black rounded-2xl p-8 sm:p-10 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-10">
                      <Utensils size={200} />
                    </div>
                    <div className="relative z-10">
                      <h3 className="text-2xl font-bold mb-6">Get in touch</h3>
                      <p className="text-slate-300 mb-10 leading-relaxed">
                        Have questions about our menu, services, or want to partner with us? Our team is always ready to assist you.
                      </p>
                      
                      <div className="space-y-6">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center shrink-0">
                            <MapPin size={20} className="text-blue-400" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-lg mb-1">Our Location</h4>
                            {renderEditable('contactAddress', 'div', 'text-slate-400')}
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center shrink-0">
                            <Phone size={20} className="text-blue-400" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-lg mb-1">Phone Number</h4>
                            {renderEditable('contactPhone', 'div', 'text-slate-400')}
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center shrink-0">
                            <Mail size={20} className="text-blue-400" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-lg mb-1">Email Address</h4>
                            {renderEditable('contactEmail', 'div', 'text-slate-400')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Contact Form */}
                  <div className="bg-[#181a1f] rounded-2xl p-8 sm:p-10 shadow-sm border border-[#2c3038]">
                    <h3 className="text-2xl font-bold text-amber-50 mb-6">Send a Message</h3>
                    <form className="space-y-5" onSubmit={async (e) => {
                      e.preventDefault();
                      try {
                        const { error } = await supabase.from('contact_inquiries').insert({
                          first_name: contactForm.firstName,
                          last_name: contactForm.lastName,
                          email: contactForm.email,
                          message: contactMessage
                        });
                        if (error) throw error;
                        alert("Thank you! Your message has been sent successfully.");
                        setContactMessage("");
                        setContactForm({ firstName: "", lastName: "", email: "" });
                      } catch (err: any) {
                        alert("Error: " + err.message);
                      }
                    }}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-1.5">First Name</label>
                          <input type="text" required 
                            value={contactForm.firstName}
                            onChange={(e) => setContactForm({ ...contactForm, firstName: e.target.value })}
                            className="w-full px-4 py-2.5 bg-[#0f1115] border border-[#2c3038] rounded-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors" placeholder="John" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-1.5">Last Name</label>
                          <input type="text" required 
                            value={contactForm.lastName}
                            onChange={(e) => setContactForm({ ...contactForm, lastName: e.target.value })}
                            className="w-full px-4 py-2.5 bg-[#0f1115] border border-[#2c3038] rounded-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors" placeholder="Doe" />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
                        <input type="email" required 
                          value={contactForm.email}
                          onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                          className="w-full px-4 py-2.5 bg-[#0f1115] border border-[#2c3038] rounded-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors" placeholder="john@example.com" />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Message</label>
                        <textarea 
                          rows={4} 
                          required
                          value={contactMessage}
                          onChange={(e) => setContactMessage(e.target.value)}
                          className="w-full px-4 py-2.5 bg-[#0f1115] border border-[#2c3038] rounded-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors resize-none" 
                          placeholder="How can we help you?"
                        ></textarea>
                      </div>
                      
                      <button type="submit" className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold rounded-lg transition-colors shadow-md shadow-blue-600/20">
                        Send Message
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {activeMenu === "Profile" && (
              <div className="animate-in fade-in duration-300">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-amber-50 mb-2">My Profile</h2>
                  <p className="text-slate-500">Manage your personal information and account settings</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Profile Card */}
                  <div className="lg:col-span-1">
                    <div className="bg-[#181a1f] rounded-2xl p-6 shadow-sm border border-[#2c3038] flex flex-col items-center text-center">
                      <div className="relative mb-6">
                        <div className="w-32 h-32 rounded-full bg-amber-900/40 flex items-center justify-center text-amber-500 text-4xl font-bold border-4 border-white shadow-lg overflow-hidden">
                          <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80" alt="Profile" className="w-full h-full object-cover" />
                        </div>
                        <button className="absolute bottom-0 right-0 w-10 h-10 bg-[#181a1f] border border-[#2c3038] rounded-full flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-200 shadow-sm transition-colors">
                          <User size={18} />
                        </button>
                      </div>
                      <h3 className="text-2xl font-bold text-amber-50 mb-1">
                        {currentUser?.name || 'John Doe'}
                      </h3>
                      <p className="text-slate-500 font-medium mb-4">{userRole === "Admin" ? "Admin / Restaurant Manager" : "Customer"}</p>
                      
                      <div className="w-full border-t border-[#22252b] pt-6 space-y-4 text-left">
                        <div>
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Email</p>
                          <p className="text-slate-300 font-medium truncate">{currentUser?.email || 'john.doe@restoportal.com'}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Joined</p>
                          <p className="text-slate-300 font-medium">
                            {currentUser?.created_at ? new Date(currentUser.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'October 2025'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Status</p>
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-50 text-green-700 text-sm font-medium border border-green-200/50">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span> Active
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Edit Profile Form */}
                  <div className="lg:col-span-2">
                    <div className="bg-[#181a1f] rounded-2xl shadow-sm border border-[#2c3038] overflow-hidden">
                      <div className="p-6 sm:p-8 border-b border-[#22252b] flex items-center justify-between">
                        <h3 className="text-xl font-bold text-amber-50">Personal Information</h3>
                        <button onClick={handleUpdateProfile} className="px-4 py-2 text-sm font-semibold text-amber-500 bg-amber-900/20 hover:bg-blue-100 rounded-lg transition-colors">
                          Save Changes
                        </button>
                      </div>
                      
                      <div className="p-6 sm:p-8">
                        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                          <div className="grid grid-cols-1 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                              <input type="text" value={editProfile.name} onChange={e => setEditProfile(prev => ({...prev, name: e.target.value}))} placeholder="John Doe" className="w-full px-4 py-2.5 bg-[#0f1115] border border-[#2c3038] rounded-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors" />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                              <input type="email" value={currentUser?.email || ""} readOnly className="w-full px-4 py-2.5 bg-[#0f1115] border border-[#2c3038] rounded-lg focus:outline-none opacity-80 transition-colors" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-2">Phone Number</label>
                              <input type="tel" value={editProfile.phone} onChange={e => setEditProfile(prev => ({...prev, phone: e.target.value}))} placeholder="+1 (555) 123-4567" className="w-full px-4 py-2.5 bg-[#0f1115] border border-[#2c3038] rounded-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors" />
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="block text-sm font-medium text-slate-300">Address</label>
                              <button 
                                type="button" 
                                disabled={isFetchingLocation}
                                className="flex items-center gap-1.5 text-xs font-semibold text-amber-500 hover:text-blue-700 bg-amber-900/20 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                                onClick={handleGetLocation}
                              >
                                {isFetchingLocation ? (
                                  <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <MapPin size={14} />
                                )}
                                {isFetchingLocation ? "Fetching..." : "Use Current Location"}
                              </button>
                            </div>
                            <textarea 
                              rows={2} 
                              value={address}
                              onChange={(e) => setAddress(e.target.value)}
                              className="w-full px-4 py-2.5 bg-[#0f1115] border border-[#2c3038] rounded-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors resize-none"
                            ></textarea>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Bio / Description</label>
                            <textarea rows={3} defaultValue="Passionate restaurant manager with 10 years of experience in hospitality." className="w-full px-4 py-2.5 bg-[#0f1115] border border-[#2c3038] rounded-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors resize-none"></textarea>
                          </div>
                          
                          <div className="pt-4 border-t border-[#22252b]">
                            <h4 className="text-lg font-bold text-amber-50 mb-4">Security</h4>
                            
                            {!isChangingPassword ? (
                              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-4 bg-[#0f1115] rounded-lg border border-[#2c3038]">
                                <div>
                                  <p className="font-semibold text-amber-50">Password</p>
                                  <p className="text-sm text-slate-500">Manage your account security</p>
                                </div>
                                <button 
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setIsChangingPassword(true);
                                  }}
                                  className="px-4 py-2 text-sm font-semibold text-slate-300 bg-[#181a1f] border border-[#363b45] hover:bg-[#2c3038] rounded-lg transition-colors shadow-sm"
                                >
                                  Change Password
                                </button>
                              </div>
                            ) : (
                              <div className="p-4 bg-[#0f1115] rounded-lg border border-[#2c3038] space-y-4">
                                <h5 className="font-semibold text-amber-50">Change Password</h5>
                                
                                <div>
                                  <label className="block text-sm font-medium text-slate-300 mb-1">Old Password</label>
                                  <input type="password" value={passwordForm.old} onChange={e => setPasswordForm({...passwordForm, old: e.target.value})} className="w-full px-3 py-2 border border-[#363b45] rounded-lg focus:ring-1 focus:ring-amber-500 outline-none" />
                                </div>
                                
                                <div>
                                  <label className="block text-sm font-medium text-slate-300 mb-1">New Password</label>
                                  <input type="password" value={passwordForm.new} onChange={e => setPasswordForm({...passwordForm, new: e.target.value})} className="w-full px-3 py-2 border border-[#363b45] rounded-lg focus:ring-1 focus:ring-amber-500 outline-none" />
                                </div>
                                
                                <div>
                                  <label className="block text-sm font-medium text-slate-300 mb-1">Confirm New Password</label>
                                  <input type="password" value={passwordForm.confirm} onChange={e => setPasswordForm({...passwordForm, confirm: e.target.value})} className="w-full px-3 py-2 border border-[#363b45] rounded-lg focus:ring-1 focus:ring-amber-500 outline-none" />
                                </div>
                                
                                <div className="flex gap-3 pt-2">
                                  <button 
                                    onClick={async (e) => {
                                      e.preventDefault();
                                      if (!passwordForm.old || !passwordForm.new || !passwordForm.confirm) {
                                        alert("Please fill all password fields.");
                                        return;
                                      }
                                      if (passwordForm.new !== passwordForm.confirm) {
                                        alert("New passwords do not match.");
                                        return;
                                      }
                                      if (passwordForm.new.length < 6) {
                                        alert("Password must be at least 6 characters long.");
                                        return;
                                      }
                                      
                                      // Verify old password
                                      if (passwordForm.old !== currentUser.password) {
                                        alert("Incorrect old password.");
                                        return;
                                      }
                                      
                                      try {
                                        const { error } = await supabase.from('users').update({ password: passwordForm.new }).eq('email', currentUser.email);
                                        if (error) throw error;
                                        alert("Password updated successfully!");
                                        setCurrentUser({...currentUser, password: passwordForm.new});
                                        localStorage.setItem("user", JSON.stringify({...currentUser, password: passwordForm.new}));
                                        setIsChangingPassword(false);
                                        setPasswordForm({ old: '', new: '', confirm: '' });
                                      } catch (err: any) {
                                        alert("Failed to update password: " + err.message);
                                      }
                                    }}
                                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium rounded-lg hover:from-amber-600 hover:to-amber-700 transition-colors text-sm"
                                  >
                                    Update Password
                                  </button>
                                  <button 
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setIsChangingPassword(false);
                                      setPasswordForm({ old: '', new: '', confirm: '' });
                                    }}
                                    className="px-4 py-2 bg-[#181a1f] text-slate-300 font-medium border border-[#363b45] rounded-lg hover:bg-[#2c3038] transition-colors text-sm"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeMenu === "Settings" && (
              <div className="animate-in fade-in duration-300">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-amber-50 mb-2">Settings</h2>
                  <p className="text-slate-500">Manage your app preferences and notification settings.</p>
                </div>
                
                <div className="bg-[#181a1f] rounded-2xl shadow-sm border border-[#2c3038] overflow-hidden">
                  <div className="p-6 sm:p-8 border-b border-[#22252b]">
                    <h3 className="text-xl font-bold text-amber-50 mb-4">Notifications</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-[#0f1115] rounded-lg border border-[#2c3038]">
                        <div>
                          <p className="font-semibold text-amber-50">Email Notifications</p>
                          <p className="text-sm text-slate-500">Receive booking confirmations and offers via email.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer bg-[#0f1115] text-slate-200" defaultChecked />
                          <div className="w-11 h-6 bg-[#2c3038] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-[#0f1115] rounded-lg border border-[#2c3038]">
                        <div>
                          <p className="font-semibold text-amber-50">SMS Notifications</p>
                          <p className="text-sm text-slate-500">Receive SMS alerts for your reservations.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer bg-[#0f1115] text-slate-200" />
                          <div className="w-11 h-6 bg-[#2c3038] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 sm:p-8 border-b border-[#22252b]">
                    <h3 className="text-xl font-bold text-amber-50 mb-4">Appearance</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-[#0f1115] rounded-lg border border-[#2c3038]">
                        <div>
                          <p className="font-semibold text-amber-50">Dark Mode</p>
                          <p className="text-sm text-slate-500">Toggle dark mode for the application.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer bg-[#0f1115] text-slate-200" 
                            checked={isDarkMode}
                            onChange={() => setIsDarkMode(!isDarkMode)}
                          />
                          <div className="w-11 h-6 bg-[#2c3038] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 sm:p-8">
                    <h3 className="text-xl font-bold text-amber-50 mb-4">Account Deletion</h3>
                    <p className="text-sm text-slate-500 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                    <button className="px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeMenu === "Help & Support" && (
              <div className="animate-in fade-in duration-300">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-amber-50 mb-2">Help & Support</h2>
                  <p className="text-slate-500">Get in touch with us for any questions or assistance.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Contact Form */}
                  <div className="lg:col-span-2 bg-[#181a1f] rounded-2xl shadow-sm border border-[#2c3038] p-6 sm:p-8">
                    <h3 className="text-xl font-bold text-amber-50 mb-6">Send us a Message</h3>
                    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-1">First Name</label>
                          <input type="text" className="w-full px-4 py-2 rounded-lg border border-[#2c3038] focus:outline-none focus:ring-2 focus:ring-amber-500 bg-[#0f1115] text-slate-200" placeholder="John" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-1">Last Name</label>
                          <input type="text" className="w-full px-4 py-2 rounded-lg border border-[#2c3038] focus:outline-none focus:ring-2 focus:ring-amber-500 bg-[#0f1115] text-slate-200" placeholder="Doe" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
                        <input type="email" className="w-full px-4 py-2 rounded-lg border border-[#2c3038] focus:outline-none focus:ring-2 focus:ring-amber-500 bg-[#0f1115] text-slate-200" placeholder="john@example.com" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Message</label>
                        <textarea rows={4} className="w-full px-4 py-2 rounded-lg border border-[#2c3038] focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none" placeholder="How can we help you?"></textarea>
                      </div>
                      <button type="submit" className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-amber-700 transition-colors">
                        Send Message
                      </button>
                    </form>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-6">
                    <div className="bg-[#181a1f] rounded-2xl shadow-sm border border-[#2c3038] p-6">
                      <h3 className="text-lg font-bold text-amber-50 mb-4">Contact Information</h3>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-amber-900/20 text-amber-500 rounded-lg shrink-0">
                            <Mail size={20} />
                          </div>
                          <div>
                            <p className="font-medium text-amber-50">Email Us</p>
                            {renderEditable('contactEmail', 'div', 'text-sm text-slate-500')}
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-amber-900/20 text-amber-500 rounded-lg shrink-0">
                            <Phone size={20} />
                          </div>
                          <div>
                            <p className="font-medium text-amber-50">Call Us</p>
                            {renderEditable('contactPhone', 'div', 'text-sm text-slate-500')}
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-amber-900/20 text-amber-500 rounded-lg shrink-0">
                            <MapPin size={20} />
                          </div>
                          <div>
                            <p className="font-medium text-amber-50">Visit Us</p>
                            {renderEditable('contactAddress', 'div', 'text-sm text-slate-500', true)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeMenu === "Home" && (
              <div className="animate-in fade-in duration-300">
                {/* Hero Section */}
                <div className="relative rounded-2xl overflow-hidden bg-black text-white shadow-xl mb-8">
                  <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80" alt="Restaurant Hero Background" className="absolute inset-0 w-full h-full object-cover opacity-50 z-0" />
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/70 to-transparent z-0"></div>


                  <div className="relative z-10 px-6 py-16 sm:px-12 sm:py-24 lg:w-2/3">
                    {renderEditable('homeTitle', 'h1', 'text-4xl sm:text-5xl font-extrabold tracking-tight mb-4', false, true)}
                    {renderEditable('homeSubtitle', 'p', 'text-lg sm:text-xl text-slate-300 mb-8 max-w-2xl leading-relaxed', true)}
                    <div className="flex flex-wrap items-center gap-4">
                      <button 
                        onClick={() => setActiveMenu("Services")}
                        className="px-6 py-3 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:bg-blue-500 text-white font-semibold transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2"
                      >
                        Get Started
                        <ChevronRight size={18} />
                      </button>
                      <button 
                        onClick={() => setActiveMenu("Categories")}
                        className="px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold backdrop-blur-sm transition-all border border-white/10"
                      >
                        Explore More
                      </button>
                    </div>
                  </div>
                  
                  {/* Client-side Timings Display */}
                  <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl flex items-center gap-2">
                    <Clock size={18} className="text-blue-400" />
                    <span className="text-sm font-medium">Opening Hours: {restaurantTimings}</span>
                  </div>
                </div>

                {/* High-End Restaurant Experience Gallery */}
                <div className="mb-8 mt-12">
                  <div className="flex justify-between items-end mb-6">
                    <div>
                      <h2 className="text-3xl font-bold text-amber-50 mb-2">The High-End Experience</h2>
                      <p className="text-slate-500">Immerse yourself in our world-class dining atmosphere.</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div onClick={() => setActiveMenu("Services")} className="relative rounded-2xl overflow-hidden shadow-md group aspect-[4/3] cursor-pointer">
                      <img src="/gallery/interior.jpg" alt="Luxurious Restaurant Interior" className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                        <span className="text-white font-bold text-xl drop-shadow-md">Exquisite Ambiance</span>
                        <span className="text-blue-300 font-medium text-sm mt-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">Book Table <ChevronRight size={14} /></span>
                      </div>
                    </div>
                    <div onClick={() => setActiveMenu("Services")} className="relative rounded-2xl overflow-hidden shadow-md group aspect-[4/3] cursor-pointer">
                      <img src="/gallery/plating.jpg" alt="Fine Dining Plating" className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                        <span className="text-white font-bold text-xl drop-shadow-md">Culinary Perfection</span>
                        <span className="text-blue-300 font-medium text-sm mt-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">Book Table <ChevronRight size={14} /></span>
                      </div>
                    </div>
                    <div onClick={() => setActiveMenu("Services")} className="relative rounded-2xl overflow-hidden shadow-md group aspect-[4/3] cursor-pointer">
                      <img src="/gallery/ambience.jpg" alt="Luxurious Restaurant Ambience" className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                        <span className="text-white font-bold text-xl drop-shadow-md">Stunning Views</span>
                        <span className="text-blue-300 font-medium text-sm mt-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">Book Table <ChevronRight size={14} /></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeMenu === "Services" && (
              <div className="animate-in fade-in duration-300">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-amber-50 mb-2">Our Services</h2>
                  <p className="text-slate-500">Experience the best of what we have to offer, including our new Table Booking feature.</p>
                </div>

                {/* Announcements / Notifications Section */}
                {announcements.filter(a => a.is_active).length > 0 && (
                  <div className="mb-8 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-amber-500 mb-4 flex items-center gap-2">
                      <Bell className="w-5 h-5" />
                      Please Read Before Booking
                    </h3>
                    <div className="space-y-3">
                      {announcements.filter(a => a.is_active).map(ann => (
                        <div key={ann.id} className="bg-[#181a1f] p-4 rounded-xl border border-[#2c3038]">
                          <p className="text-slate-300 whitespace-pre-wrap">{ann.message}</p>
                          <p className="text-xs text-slate-500 mt-2">{new Date(ann.created_at).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Table Booking Service */}
                  <div className="bg-[#181a1f] rounded-2xl shadow-sm border border-[#2c3038] overflow-hidden hover:shadow-md transition-shadow">
                    <div className="h-40 bg-gradient-to-r from-amber-500 to-amber-600 flex items-center justify-center relative overflow-hidden">
                       <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&q=80" alt="Table Booking" className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-overlay" />
                       <h3 className="relative z-10 text-3xl font-bold text-white">Table Booking</h3>
                    </div>
                    <div className="p-6">
                      <p className="text-slate-400 mb-6">Reserve your spot at our fine dining establishment. Skip the wait and enjoy a seamless dining experience.</p>
                      
                      <form className="space-y-4" onSubmit={async (e) => {
                        e.preventDefault();
                        if (!currentUser) {
                          router.push('/login');
                          return;
                        }
                        
                        const bookingDateTime = new Date(`${bookingForm.date}T${bookingForm.time}`);
                        if (bookingDateTime < new Date()) {
                          alert("Please select a valid future date and time for your booking.");
                          return;
                        }

                        const [hourStr, minStr] = bookingForm.time.split(':');
                        const hour = parseInt(hourStr, 10);
                        const minute = parseInt(minStr, 10);
                        
                        if (hour < 10 || hour > 23 || (hour === 23 && minute > 0)) {
                          alert("Table bookings are only available between 10:00 AM and 11:00 PM.");
                          return;
                        }

                        try {
                          const { error } = await supabase.from('table_bookings').insert({
                            customer_name: bookingForm.name,
                            booking_date: bookingForm.date,
                            booking_time: bookingForm.time,
                            guests: bookingForm.guests,
                            user_email: currentUser?.email || null
                          });
                          if (error) throw error;
                          alert("Your table booking request has been submitted! We will confirm your reservation shortly.");
                          setBookingForm({ name: "", date: "", time: "", guests: 2 });
                          
                          // Refresh customer bookings list immediately
                          if (currentUser?.email) {
                            const { data: updatedBookings } = await supabase
                              .from('table_bookings')
                              .select('*')
                              .eq('user_email', currentUser.email)
                              .order('created_at', { ascending: false })
                              .limit(customerBookingsLimit);
                            if (updatedBookings) setCustomerBookings(updatedBookings);
                          }
                          
                        } catch (err: any) {
                          alert("Error: " + err.message);
                        }
                      }}>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-1">Name</label>
                          <input type="text" required 
                            value={bookingForm.name}
                            onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                            placeholder="Enter your name"
                            className="w-full px-3 py-2 bg-[#0f1115] border border-[#2c3038] rounded-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Date</label>
                            <input type="date" required 
                              min={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0]}
                              value={bookingForm.date}
                              onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                              className="w-full px-3 py-2 bg-[#0f1115] border border-[#2c3038] rounded-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Time</label>
                            <input type="time" required min="10:00" max="23:00"
                              value={bookingForm.time}
                              onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })}
                              className="w-full px-3 py-2 bg-[#0f1115] border border-[#2c3038] rounded-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-1">Guests</label>
                          <select 
                            className="w-full px-3 py-2 bg-[#0f1115] border border-[#2c3038] rounded-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                            value={bookingForm.guests}
                            onChange={(e) => setBookingForm({ ...bookingForm, guests: Number(e.target.value) })}
                          >
                            {Array.from({ length: 20 }, (_, i) => i + 1).map(num => <option key={num} value={num}>{num} Person{num > 1 ? 's' : ''}</option>)}
                          </select>
                        </div>
                        <button type="submit" className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-amber-700 transition-colors shadow-sm">Book Table Now</button>
                      </form>
                    </div>
                  </div>

                  {/* Private Dining / Events */}
                  <div className="bg-[#181a1f] rounded-2xl shadow-sm border border-[#2c3038] overflow-hidden hover:shadow-md transition-shadow">
                    <div className="h-40 bg-purple-600 flex items-center justify-center relative overflow-hidden">
                       <img src="https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=500&q=80" alt="Private Events" className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-overlay" />
                       <h3 className="relative z-10 text-3xl font-bold text-white">Private Events</h3>
                    </div>
                    <div className="p-6">
                      <p className="text-slate-400 mb-4">Host your special occasions with us. From corporate dinners to anniversary celebrations, our private dining rooms offer exclusivity and customized menus.</p>
                      <ul className="space-y-2 mb-6">
                        <li className="flex items-center gap-2 text-sm text-slate-300"><div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div> Customized Menu Options</li>
                        <li className="flex items-center gap-2 text-sm text-slate-300"><div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div> Dedicated Service Staff</li>
                        <li className="flex items-center gap-2 text-sm text-slate-300"><div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div> Audio/Visual Equipment Support</li>
                      </ul>
                      <button 
                        onClick={() => {
                          setContactMessage("Hi, I would like to inquire about hosting a Private Event at your restaurant. Please provide me with more details.");
                          setActiveMenu("Contact");
                        }}
                        className="w-full py-2.5 bg-[#22252b] text-slate-200 font-semibold rounded-lg hover:bg-slate-200 transition-colors"
                      >
                        Inquire Now
                      </button>
                    </div>
                  </div>
                  
                  {/* Food Delivery Service */}
                  <div className="bg-[#181a1f] rounded-2xl shadow-sm border border-[#2c3038] overflow-hidden hover:shadow-md transition-shadow">
                    <div className="h-40 bg-orange-500 flex items-center justify-center relative overflow-hidden">
                       <img src="https://images.unsplash.com/photo-1526367790999-0150786686a2?w=500&q=80" alt="Food Delivery" className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-overlay" />
                       <h3 className="relative z-10 text-3xl font-bold text-white">Food Delivery</h3>
                    </div>
                    <div className="p-6">
                      <p className="text-slate-400 mb-4">Enjoy our exquisite culinary creations in the comfort of your home. Fast and reliable delivery to your doorstep.</p>
                      <ul className="space-y-2 mb-6">
                        <li className="flex items-center gap-2 text-sm text-slate-300"><div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div> Real-time Order Tracking</li>
                        <li className="flex items-center gap-2 text-sm text-slate-300"><div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div> Eco-friendly Packaging</li>
                        <li className="flex items-center gap-2 text-sm text-slate-300"><div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div> Contactless Delivery Option</li>
                      </ul>
                      <button 
                        onClick={() => setActiveMenu("Categories")}
                        className="w-full py-2.5 bg-orange-50 text-orange-600 font-semibold rounded-lg hover:bg-orange-500 hover:text-white transition-colors"
                      >
                        Order Now
                      </button>
                    </div>
                  </div>
                </div>
                {currentUser && renderCustomerBookings()}
              </div>
            )}

            {activeMenu === "Dashboard" && userRole === "Admin" && (
              <div className="animate-in fade-in duration-300">
                <div className="relative rounded-2xl overflow-hidden bg-black text-white shadow-xl mb-8 p-6 sm:p-10">
                  <img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80" alt="Dashboard Background" className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay" />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 via-slate-900/80 to-slate-900/40 z-0"></div>
                  
                  <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div>
                      <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-2 tracking-tight">Admin Dashboard</h2>
                      <p className="text-blue-100 text-lg">Manage your restaurant portal and operations.</p>
                    </div>
                    <div className="flex flex-wrap gap-4 w-full lg:w-auto">
                      <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 flex items-center gap-4 flex-1 min-w-[150px] shadow-lg">
                        <div className="w-12 h-12 bg-blue-500/20 text-blue-300 rounded-full flex items-center justify-center shrink-0 border border-blue-500/30">
                          <Users size={24} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-blue-100">Users</p>
                          <p className="text-2xl font-bold text-white">{adminUsers.length}</p>
                        </div>
                      </div>
                      
                      <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 flex items-center gap-4 flex-1 min-w-[150px] shadow-lg">
                        <div className="w-12 h-12 bg-indigo-500/20 text-indigo-300 rounded-full flex items-center justify-center shrink-0 border border-indigo-500/30">
                          <Utensils size={24} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-blue-100">Bookings</p>
                          <p className="text-2xl font-bold text-white">{tableBookings.length}</p>
                        </div>
                      </div>

                      <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 flex items-center gap-4 flex-1 min-w-[150px] shadow-lg">
                        <div className="w-12 h-12 bg-amber-500/20 text-amber-300 rounded-full flex items-center justify-center shrink-0 border border-amber-500/30">
                          <Clock size={24} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-blue-100">Pending</p>
                          <p className="text-2xl font-bold text-white">{tableBookings.filter(b => b.status === "Pending").length}</p>
                        </div>
                      </div>

                      <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 flex items-center gap-4 flex-1 min-w-[150px] shadow-lg">
                        <div className="w-12 h-12 bg-emerald-500/20 text-emerald-300 rounded-full flex items-center justify-center shrink-0 border border-emerald-500/30">
                          <CheckCircle size={24} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-blue-100">Confirmed</p>
                          <p className="text-2xl font-bold text-white">{tableBookings.filter(b => b.status === "Confirmed").length}</p>
                        </div>
                      </div>


                    </div>
                  </div>
                </div>

                {/* Announcements Management Section */}
                <div className="bg-[#181a1f] p-6 rounded-xl border border-[#2c3038] mb-8">
                  <h2 className="text-xl font-bold text-[#f8fafc] mb-6 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-amber-500" />
                    Manage Announcements
                  </h2>
                  
                  <div className="flex gap-4 mb-6">
                    <textarea 
                      value={newAnnouncement}
                      onChange={(e) => setNewAnnouncement(e.target.value)}
                      placeholder="Type a new announcement or notification..."
                      className="flex-1 bg-[#0f1115] text-slate-200 border border-[#2c3038] rounded-lg p-3 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <button 
                      onClick={async () => {
                        if (!newAnnouncement.trim()) return;
                        const { data, error } = await supabase.from('announcements').insert([{ message: newAnnouncement.trim(), is_active: true }]).select();
                        if (data) {
                          setAnnouncements([data[0], ...announcements]);
                          setNewAnnouncement('');
                        }
                      }}
                      className="bg-amber-500 hover:bg-amber-600 text-[#0f1115] px-6 py-2 rounded-lg font-medium transition-colors h-fit whitespace-nowrap"
                    >
                      Post Announcement
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {announcements.map(ann => (
                      <div key={ann.id} className="flex items-center justify-between p-4 bg-[#0f1115] rounded-lg border border-[#2c3038]">
                        <div className="flex-1 mr-4">
                          <p className="text-slate-300 mb-2">{ann.message}</p>
                          <span className="text-xs text-slate-500">
                            {new Date(ann.created_at).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={async () => {
                              const newStatus = !ann.is_active;
                              const { error } = await supabase.from('announcements').update({ is_active: newStatus }).eq('id', ann.id);
                              if (!error) {
                                setAnnouncements(announcements.map(a => a.id === ann.id ? {...a, is_active: newStatus} : a));
                              }
                            }}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                              ann.is_active 
                                ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20' 
                                : 'bg-slate-500/10 text-slate-400 hover:bg-slate-500/20'
                            }`}
                          >
                            {ann.is_active ? 'Active' : 'Inactive'}
                          </button>
                          <button
                            onClick={async () => {
                              const { error } = await supabase.from('announcements').delete().eq('id', ann.id);
                              if (!error) {
                                setAnnouncements(announcements.filter(a => a.id !== ann.id));
                              }
                            }}
                            className="text-red-400 hover:text-red-300 p-2 hover:bg-red-400/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {announcements.length === 0 && (
                      <p className="text-slate-500 text-center py-4">No announcements yet.</p>
                    )}
                  </div>
                </div>

                <div className="bg-[#181a1f] rounded-2xl shadow-sm border border-[#2c3038] overflow-hidden">
                  <div className="p-6 border-b border-[#22252b] flex items-center justify-between bg-[#181a1f]">
                    <h3 className="text-lg font-bold text-amber-50">Registered Users (Database)</h3>
                    <button 
                      onClick={() => {
                        setLoadingUsers(true);
                        fetch(`/api/admin/users?limit=${usersLimit}`)
                          .then(res => res.json())
                          .then(data => {
                            if(data.users) setAdminUsers(data.users);
                            setLoadingUsers(false);
                          });
                      }}
                      className="px-4 py-2 text-sm font-semibold text-amber-500 bg-amber-900/20 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      {loadingUsers ? "Refreshing..." : "Refresh Data"}
                    </button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#0f1115] text-slate-500 text-sm uppercase tracking-wider">
                          <th className="px-6 py-4 font-semibold border-b border-[#2c3038]">ID</th>
                          <th className="px-6 py-4 font-semibold border-b border-[#2c3038]">Email</th>
                          <th className="px-6 py-4 font-semibold border-b border-[#2c3038]">Role</th>
                          <th className="px-6 py-4 font-semibold border-b border-[#2c3038]">Joined</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#2c3038]">
                        {loadingUsers ? (
                          <tr>
                            <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                              <div className="flex flex-col items-center justify-center">
                                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                                Loading users...
                              </div>
                            </td>
                          </tr>
                        ) : adminUsers.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                              No users found in the database.
                            </td>
                          </tr>
                        ) : (
                          adminUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-[#22252b] transition-colors">
                              <td className="px-6 py-4 text-sm font-medium text-amber-50">
                                <span className="px-2 py-1 bg-[#22252b] text-slate-400 rounded-md font-mono text-xs">
                                  {user.id.substring(0, 8)}...
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-300">{user.email}</td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  user.role === "Admin" ? "bg-purple-100 text-purple-800" : "bg-amber-900/40 text-amber-300"
                                }`}>
                                  {user.role}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-500">
                                {new Date(user.created_at).toLocaleDateString()}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  {adminOrders.length >= adminOrdersLimit && (
                    <div className="p-4 border-t border-[#2c3038] flex justify-center">
                      <button onClick={() => setAdminOrdersLimit(prev => prev + 10)} className="px-5 py-1.5 text-sm font-medium bg-[#2c3038] hover:bg-[#363b45] text-amber-400 rounded-full transition-colors">
                        Load More Orders
                      </button>
                    </div>
                  )}
                </div>

                {/* Table Bookings */}
                <div className="bg-[#181a1f] rounded-2xl shadow-sm border border-[#2c3038] overflow-hidden mt-8">
                  <div className="p-6 border-b border-[#22252b] flex items-center justify-between bg-[#181a1f]">
                    <h3 className="text-lg font-bold text-amber-50">Table Bookings</h3>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#0f1115] text-slate-500 text-sm uppercase tracking-wider">
                          <th className="px-6 py-4 font-semibold border-b border-[#2c3038]">ID</th>
                          <th className="px-6 py-4 font-semibold border-b border-[#2c3038]">Name</th>
                          <th className="px-6 py-4 font-semibold border-b border-[#2c3038]">Date</th>
                          <th className="px-6 py-4 font-semibold border-b border-[#2c3038]">Time</th>
                          <th className="px-6 py-4 font-semibold border-b border-[#2c3038]">Guests</th>
                          <th className="px-6 py-4 font-semibold border-b border-[#2c3038]">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#2c3038]">
                        {loadingDashboardData ? (
                          <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">Loading bookings...</td></tr>
                        ) : tableBookings.length === 0 ? (
                          <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">No table bookings found.</td></tr>
                        ) : (
                          tableBookings.map((booking) => (
                            <tr key={booking.id} className="hover:bg-[#22252b] transition-colors">
                              <td className="px-6 py-4 text-sm font-medium text-amber-50"><span className="font-mono">{booking.id.substring(0,8)}</span></td>
                              <td className="px-6 py-4 text-sm text-slate-300 font-medium">{booking.customer_name}</td>
                              <td className="px-6 py-4 text-sm text-slate-300">{booking.booking_date}</td>
                              <td className="px-6 py-4 text-sm text-slate-300">{booking.booking_time}</td>
                              <td className="px-6 py-4 text-sm text-amber-50 font-medium">{booking.guests}</td>
                              <td className="px-6 py-4 flex items-center">
                                <select 
                                  value={booking.status} 
                                  onChange={(e) => handleUpdateBookingStatus(booking.id, e.target.value)}
                                  className="text-xs font-medium bg-[#0f1115] border border-[#2c3038] rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-amber-500 mr-2"
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="Confirmed">Confirmed</option>
                                  <option value="Cancelled">Cancelled</option>
                                </select>
                                <button onClick={() => handleDeleteBooking(booking.id)} className="text-red-500 hover:text-red-700 p-1" title="Delete">
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  {tableBookings.length >= bookingsLimit && (
                    <div className="p-4 border-t border-[#2c3038] flex justify-center">
                      <button onClick={() => setBookingsLimit(prev => prev + 10)} className="px-5 py-1.5 text-sm font-medium bg-[#2c3038] hover:bg-[#363b45] text-amber-400 rounded-full transition-colors">
                        Load More Bookings
                      </button>
                    </div>
                  )}
                </div>

                {/* Contact Inquiries */}
                <div className="bg-[#181a1f] rounded-2xl shadow-sm border border-[#2c3038] overflow-hidden mt-8">
                  <div className="p-6 border-b border-[#22252b] flex items-center justify-between bg-[#181a1f]">
                    <h3 className="text-lg font-bold text-amber-50">Contact & Event Inquiries</h3>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#0f1115] text-slate-500 text-sm uppercase tracking-wider">
                          <th className="px-6 py-4 font-semibold border-b border-[#2c3038]">ID</th>
                          <th className="px-6 py-4 font-semibold border-b border-[#2c3038]">Name</th>
                          <th className="px-6 py-4 font-semibold border-b border-[#2c3038]">Email</th>
                          <th className="px-6 py-4 font-semibold border-b border-[#2c3038]">Message</th>
                          <th className="px-6 py-4 font-semibold border-b border-[#2c3038]">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#2c3038]">
                        {loadingDashboardData ? (
                          <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading inquiries...</td></tr>
                        ) : contactInquiries.length === 0 ? (
                          <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No contact inquiries found.</td></tr>
                        ) : (
                          contactInquiries.map((inq) => (
                            <tr key={inq.id} className="hover:bg-[#22252b] transition-colors">
                              <td className="px-6 py-4 text-sm font-medium text-amber-50"><span className="font-mono">{inq.id.substring(0,8)}</span></td>
                              <td className="px-6 py-4 text-sm text-slate-300">{inq.first_name} {inq.last_name}</td>
                              <td className="px-6 py-4 text-sm text-slate-300">{inq.email}</td>
                              <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate" title={inq.message}>{inq.message}</td>
                              <td className="px-6 py-4 flex items-center">
                                <select 
                                  value={inq.status} 
                                  onChange={(e) => handleUpdateInquiryStatus(inq.id, e.target.value)}
                                  className="text-xs font-medium bg-[#0f1115] border border-[#2c3038] rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-amber-500 mr-2"
                                >
                                  <option value="New">New</option>
                                  <option value="In Progress">In Progress</option>
                                  <option value="Resolved">Resolved</option>
                                </select>
                                <button onClick={() => handleDeleteInquiry(inq.id)} className="text-red-500 hover:text-red-700 p-1" title="Delete">
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  {contactInquiries.length >= inquiriesLimit && (
                    <div className="p-4 border-t border-[#2c3038] flex justify-center">
                      <button onClick={() => setInquiriesLimit(prev => prev + 10)} className="px-5 py-1.5 text-sm font-medium bg-[#2c3038] hover:bg-[#363b45] text-amber-400 rounded-full transition-colors">
                        Load More Inquiries
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Orders */}
                <div className="bg-[#181a1f] rounded-2xl shadow-sm border border-[#2c3038] overflow-hidden mt-8">
                  <div className="p-6 border-b border-[#22252b] flex items-center justify-between bg-[#181a1f]">
                    <h3 className="text-lg font-bold text-amber-50">Recent Orders</h3>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#0f1115] text-slate-500 text-sm uppercase tracking-wider">
                          <th className="px-6 py-4 font-semibold border-b border-[#2c3038]">ID</th>
                          <th className="px-6 py-4 font-semibold border-b border-[#2c3038]">Customer Details</th>
                          <th className="px-6 py-4 font-semibold border-b border-[#2c3038]">Items</th>
                          <th className="px-6 py-4 font-semibold border-b border-[#2c3038]">Total</th>
                          <th className="px-6 py-4 font-semibold border-b border-[#2c3038]">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#2c3038]">
                        {loadingDashboardData ? (
                          <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading orders...</td></tr>
                        ) : adminOrders.length === 0 ? (
                          <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No orders found.</td></tr>
                        ) : (
                          adminOrders.map((order) => (
                            <tr key={order.id} className="hover:bg-[#22252b] transition-colors">
                              <td className="px-6 py-4 text-sm font-medium text-amber-50"><span className="font-mono">{order.id.substring(0,8)}</span></td>
                              <td className="px-6 py-4 text-sm text-slate-300">
                                <div>{order.user_email}</div>
                                {order.delivery_details && (
                                  <div className="text-xs text-amber-500/80 mt-1 font-medium">
                                    {order.delivery_type}: {order.delivery_details}
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate" title={order.items.map((i: any) => `${i.quantity}x ${i.name}`).join(', ')}>
                                {order.items.map((i: any) => `${i.quantity}x ${i.name}`).join(', ')}
                              </td>
                              <td className="px-6 py-4 text-sm text-amber-50 font-bold">₹{order.total_amount}</td>
                              <td className="px-6 py-4 flex flex-col justify-center">
                                <div className="flex items-center">
                                  <select 
                                    value={order.status} 
                                    onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                    className="text-xs font-medium bg-[#0f1115] border border-[#2c3038] rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-amber-500 mr-2"
                                  >
                                    <option value="Pending">Pending</option>
                                    <option value="Processing">Processing</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Cancelled">Cancelled</option>
                                  </select>
                                </div>
                                {order.status === 'Cancelled' && order.cancel_reason && (
                                  <span className="text-[10px] text-red-500 mt-1 max-w-[120px] truncate" title={order.cancel_reason}>
                                    Reason: {order.cancel_reason === 'wrong_order' ? 'Wrong Order' : order.cancel_reason === 'wrong_address' ? 'Wrong Address' : order.cancel_reason}
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  {adminUsers.length >= usersLimit && (
                    <div className="p-4 border-t border-[#2c3038] flex justify-center">
                      <button onClick={() => setUsersLimit(prev => prev + 10)} className="px-5 py-1.5 text-sm font-medium bg-[#2c3038] hover:bg-[#363b45] text-amber-400 rounded-full transition-colors">
                        Load More Users
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Restaurant Settings */}
                <div className="bg-[#181a1f] rounded-2xl shadow-sm border border-[#2c3038] overflow-hidden mt-8">
                  <div className="p-6 border-b border-[#22252b]">
                    <h3 className="text-lg font-bold text-amber-50 mb-4">Restaurant Settings</h3>
                    <div className="max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-1">Restaurant Name</label>
                        <div className="flex gap-3">
                          <input 
                            type="text" 
                            value={restaurantName}
                            onChange={(e) => setRestaurantName(e.target.value)}
                            className="w-full px-4 py-2 border border-[#363b45] rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                            placeholder="e.g. My Awesome Restaurant"
                          />
                        </div>
                        <p className="text-xs text-slate-500 mt-2 mb-4">This name will be displayed in the sidebar.</p>

                        <label className="block text-sm font-semibold text-slate-300 mb-1">Restaurant UPI ID</label>
                        <div className="flex gap-3">
                          <input 
                            type="text" 
                            value={restaurantUpiId}
                            onChange={(e) => setRestaurantUpiId(e.target.value)}
                            className="w-full px-4 py-2 border border-[#363b45] rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                            placeholder="e.g. restaurant@upi"
                          />
                        </div>
                        <p className="text-xs text-slate-500 mt-2 mb-4">This UPI ID will be used for payments.</p>

                        <label className="block text-sm font-semibold text-slate-300 mb-1">Logo Image URL</label>
                        <div className="flex gap-3">
                          <input 
                            type="text" 
                            value={restaurantLogo}
                            onChange={(e) => setRestaurantLogo(e.target.value)}
                            className="w-full px-4 py-2 border border-[#363b45] rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                            placeholder="https://example.com/logo.png"
                          />
                        </div>
                        <p className="text-xs text-slate-500 mt-2 mb-4">Provide a valid image URL.</p>

                        <label className="block text-sm font-semibold text-slate-300 mb-1">Restaurant Timings</label>
                        <div className="flex gap-3">
                          <input 
                            type="text" 
                            value={restaurantTimings}
                            onChange={(e) => setRestaurantTimings(e.target.value)}
                            className="w-full px-4 py-2 border border-[#363b45] rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                            placeholder="e.g. 10:00 AM - 11:00 PM"
                          />
                        </div>
                        <p className="text-xs text-slate-500 mt-2 mb-4">These timings will be shown to customers.</p>

                        <button 
                          onClick={() => {
                            localStorage.setItem("restaurantName", restaurantName);
                            localStorage.setItem("restaurantLogo", restaurantLogo);
                            localStorage.setItem("restaurantTimings", restaurantTimings);
                            localStorage.setItem("restaurantUpiId", restaurantUpiId);
                            alert("Settings updated successfully!");
                          }}
                          className="px-6 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium rounded-lg hover:from-amber-600 hover:to-amber-700 transition-colors"
                        >
                          Save Settings
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
        {showCancelModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-[#181a1f] rounded-2xl w-full max-w-md shadow-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-amber-50">Cancel Order</h3>
                <button onClick={() => setShowCancelModal(false)} className="text-slate-400 hover:text-slate-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
              <div className="space-y-4">
                <p className="text-sm text-slate-400">Please select a reason for cancellation:</p>
                <div className="flex items-center gap-2">
                  <input 
                    type="radio" 
                    id="reason_wrong" 
                    name="cancel_reason"
                    value="wrong_order"
                    checked={cancelReason === 'wrong_order'}
                    onChange={(e) => setCancelReason(e.target.value)}
                  />
                  <label htmlFor="reason_wrong" className="text-sm text-slate-300">Wrong order</label>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="radio" 
                    id="reason_address" 
                    name="cancel_reason"
                    value="wrong_address"
                    checked={cancelReason === 'wrong_address'}
                    onChange={(e) => setCancelReason(e.target.value)}
                  />
                  <label htmlFor="reason_address" className="text-sm text-slate-300">Wrong address</label>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="radio" 
                    id="reason_other" 
                    name="cancel_reason"
                    value="other"
                    checked={cancelReason === 'other'}
                    onChange={(e) => setCancelReason(e.target.value)}
                  />
                  <label htmlFor="reason_other" className="text-sm text-slate-300">Other</label>
                </div>
                {cancelReason === 'other' && (
                  <div className="mt-2">
                    <input 
                      type="text" 
                      value={cancelReasonOther}
                      onChange={(e) => setCancelReasonOther(e.target.value)}
                      placeholder="Enter reason (max 12 words)"
                      className="w-full px-4 py-2 border border-[#363b45] rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                    />
                    <p className="text-xs text-slate-500 mt-1">Maximum 12 words allowed.</p>
                  </div>
                )}
                <div className="flex gap-4 mt-6">
                  <button 
                    type="button" 
                    onClick={() => setShowCancelModal(false)}
                    className="flex-1 px-4 py-2 bg-[#22252b] text-slate-300 rounded-xl hover:bg-slate-200 transition-colors font-semibold"
                  >
                    Close
                  </button>
                  <button 
                    type="button"
                    onClick={handleCancelOrder}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold"
                  >
                    Confirm Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cancel Booking Modal */}
        {showCancelBookingModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-[#181a1f] rounded-2xl w-full max-w-md shadow-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-amber-50">Cancel Booking</h3>
                <button onClick={() => setShowCancelBookingModal(false)} className="text-slate-400 hover:text-slate-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
              <div className="space-y-4">
                <p className="text-sm text-slate-400">Please select a reason for cancellation:</p>
                <div className="flex items-center gap-2">
                  <input 
                    type="radio" 
                    id="reason_booking_wrong_date" 
                    name="cancel_booking_reason"
                    value="wrong_date"
                    checked={cancelBookingReason === 'wrong_date'}
                    onChange={(e) => setCancelBookingReason(e.target.value)}
                  />
                  <label htmlFor="reason_booking_wrong_date" className="text-sm text-slate-300">Wrong date</label>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="radio" 
                    id="reason_booking_wrong_time" 
                    name="cancel_booking_reason"
                    value="wrong_time"
                    checked={cancelBookingReason === 'wrong_time'}
                    onChange={(e) => setCancelBookingReason(e.target.value)}
                  />
                  <label htmlFor="reason_booking_wrong_time" className="text-sm text-slate-300">Wrong time</label>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="radio" 
                    id="reason_booking_other" 
                    name="cancel_booking_reason"
                    value="other"
                    checked={cancelBookingReason === 'other'}
                    onChange={(e) => setCancelBookingReason(e.target.value)}
                  />
                  <label htmlFor="reason_booking_other" className="text-sm text-slate-300">Other reason</label>
                </div>
                {cancelBookingReason === 'other' && (
                  <div className="mt-2">
                    <input 
                      type="text" 
                      value={cancelBookingReasonOther}
                      onChange={(e) => setCancelBookingReasonOther(e.target.value)}
                      placeholder="Enter reason (max 12 words)"
                      className="w-full px-4 py-2 bg-[#0f1115] text-amber-50 border border-[#363b45] rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                    />
                    <p className="text-xs text-slate-500 mt-1">Maximum 12 words allowed.</p>
                  </div>
                )}
                <div className="flex gap-4 mt-6">
                  <button 
                    type="button" 
                    onClick={() => setShowCancelBookingModal(false)}
                    className="flex-1 px-4 py-2 bg-[#22252b] text-slate-300 rounded-xl hover:bg-slate-200 hover:text-[#0f1115] transition-colors font-semibold"
                  >
                    Close
                  </button>
                  <button 
                    type="button"
                    onClick={confirmCancelBooking}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold"
                  >
                    Confirm Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
