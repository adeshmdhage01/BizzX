import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { 
  Package, Plus, Search, Edit3, Trash2, 
  ChevronLeft, ChevronRight, LogOut, LayoutDashboard, 
  FileText, User 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Popup from "../Auth/Popup"; 
import "./Product.css";

function Product() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;

  // Logic: Get logged in user's ID from localStorage
  const userData = JSON.parse(localStorage.getItem("userData"));
  const loggedUserId = userData?.userId;

  const [popup, setPopup] = useState({ 
    show: false, 
    message: "", 
    isConfirm: false, 
    targetId: null 
  });

  const [form, setForm] = useState({
    productId: null,
    productName: "",
    productPrice: "",
    sellingPrice: "",
    productQuantity: ""
  });

  // Navigation handlers
  const goHome = () => navigate("/home");
  const goToInvoice = () => navigate("/invoice");
  const goToProfile = () => navigate("/profile");
  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const showAlert = (msg) => {
    setPopup({ show: true, message: msg, isConfirm: false, targetId: null });
  };

  // Logic: Memoize fetchProducts to prevent infinite loops in useEffect
  const fetchProducts = useCallback(async () => {
    if (!loggedUserId) return;
    try {
      const res = await axios.get(`http://localhost:8080/products/get-all/${loggedUserId}`);
      const sortedProducts = res.data.sort((a, b) => a.productQuantity - b.productQuantity);
      setProducts(sortedProducts);
    } catch (err) {
      console.error("Error fetching products", err);
    }
  }, [loggedUserId]);

  // Logic: useEffect with proper dependencies
  useEffect(() => {
    if (!loggedUserId) {
      navigate("/login");
    } else {
      fetchProducts();
    }
  }, [loggedUserId, navigate, fetchProducts]);

  const submitProduct = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      userId: loggedUserId, // Logic: maintain user-product relationship
      productPrice: Number(form.productPrice),
      sellingPrice: Number(form.sellingPrice),
      productQuantity: Number(form.productQuantity),
    };

    try {
      if (form.productId) {
        await axios.put("http://localhost:8080/products/update", payload);
        showAlert("Product updated successfully!");
      } else {
        await axios.post("http://localhost:8080/products/add", payload);
        showAlert("Product added successfully!");
      }
      setShowForm(false);
      resetForm();
      fetchProducts();
    } catch (err) {
      showAlert("Error saving product");
    }
  };

  const resetForm = () => {
    setForm({ productId: null, productName: "", productPrice: "", sellingPrice: "", productQuantity: "" });
  };

  const deleteProduct = (id) => {
    setPopup({
      show: true,
      message: "Are you sure you want to delete this product?",
      isConfirm: true,
      targetId: id
    });
  };

  const handleConfirmDelete = async () => {
    const id = popup.targetId;
    try {
      await axios.delete("http://localhost:8080/products/delete", { data: { productId: id } });
      setPopup({ show: false, message: "", isConfirm: false, targetId: null });
      fetchProducts();
    } catch (err) {
      showAlert("Error deleting product");
    }
  };

  const editProduct = (p) => {
    setForm(p);
    setShowForm(true);
  };

  const filteredProducts = products.filter(p =>
    p.productName.toLowerCase().includes(search.toLowerCase())
  );

  const indexOfLast = currentPage * productsPerPage;
  const indexOfFirst = indexOfLast - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const getQuantityClass = (qty) => {
    if (qty === 0) return "qty-zero";
    if (qty <= 5) return "qty-low";
    return "qty-good";
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  };

  return (
    <div className="app-container">
      <Popup 
        show={popup.show} 
        message={popup.message} 
        isConfirm={popup.isConfirm}
        onClose={() => setPopup({ ...popup, show: false })}
        onConfirm={handleConfirmDelete}
      />

      <aside className="sidebar">
        <div className="sidebar-logo">
          <Package className="logo-icon" size={28} />
          <span>Softneil Billing</span>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-item" onClick={goHome}><LayoutDashboard size={20} /> Dashboard</div>
          <div className="nav-item active"><Package size={20} /> Products</div>
          <div className="nav-item" onClick={goToInvoice}><FileText size={20} /> Invoices</div>
          <div className="nav-item" onClick={goToProfile}><User size={20} /> Profile</div>
        </nav>
        <button className="logout-btn" onClick={logout}>
          <LogOut size={18} /> Logout
        </button>
      </aside>

      <main className="main-content">
        <header className="content-header">
          <div className="header-title">
            <h1>Product Inventory</h1>
            <p>Manage your stock and pricing details.</p>
          </div>
          <div className="header-actions">
            <div className="search-box">
              <Search className="search-icon" size={18} />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              />
            </div>
            <button className="add-main-btn" onClick={() => { resetForm(); setShowForm(true); }}>
              <Plus size={16} strokeWidth={2.5} /> Add Product
            </button>
          </div>
        </header>

        <section className="table-wrapper">
          <table className="product-table">
            <thead>
              <tr>
                <th>Product Details</th>
                <th>Cost</th>
                <th>Selling Price</th>
                <th>Stock Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentProducts.length > 0 ? (
                currentProducts.map(p => (
                  <tr key={p.productId}>
                    <td className="name-column">
                      <div className="avatar">{p.productName.charAt(0)}</div>
                      {p.productName}
                    </td>
                    <td>{formatPrice(p.productPrice)}</td>
                    <td className="price-bold">{formatPrice(p.sellingPrice)}</td>
                    <td>
                      <span className={`status-pill ${getQuantityClass(p.productQuantity)}`}>
                        {p.productQuantity === 0 ? "Out of Stock" : `${p.productQuantity} Units`}
                      </span>
                    </td>
                    <td className="action-column">
                      <button className="icon-btn edit" onClick={() => editProduct(p)}><Edit3 size={16}/></button>
                      <button className="icon-btn delete" onClick={() => deleteProduct(p.productId)}><Trash2 size={16}/></button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="empty-state">No products found.</td>
                </tr>
              )}
            </tbody>
          </table>

          <footer className="pagination-footer">
            <p>Page {currentPage} of {totalPages || 1}</p>
            <div className="pagination-controls">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
                <ChevronLeft size={18} />
              </button>
              <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(currentPage + 1)}>
                <ChevronRight size={18} />
              </button>
            </div>
          </footer>
        </section>
      </main>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{form.productId ? "Update Product" : "New Product"}</h2>
            </div>
            <form onSubmit={submitProduct} className="product-form">
              <div className="form-group">
                <label>Product Name</label>
                <input required value={form.productName} onChange={e => setForm({ ...form, productName: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Cost Price</label>
                  <input type="number" required value={form.productPrice} onChange={e => setForm({ ...form, productPrice: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Selling Price</label>
                  <input type="number" required value={form.sellingPrice} onChange={e => setForm({ ...form, sellingPrice: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Quantity</label>
                <input type="number" required value={form.productQuantity} onChange={e => setForm({ ...form, productQuantity: e.target.value })} />
              </div>
              <div className="modal-footer">
                <button type="button" className="secondary-btn" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="primary-btn">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Product;