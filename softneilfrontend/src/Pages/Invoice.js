import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { 
  Package, LayoutDashboard, FileText, User, LogOut, 
  Search, Printer, Mail, Send, Trash2, Plus, Minus, CheckCircle
} from "lucide-react";
import Popup from "../Auth/Popup";
import "./Invoice.css";
import { useNavigate } from "react-router-dom";

function Invoice() {
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const userId = userData.userId;

  const goHome = () => (window.location.href = "/home");
  const goToProducts = () => (window.location.href = "/products");
  const goToInvoice = () => (window.location.href = "/invoice");
  const goToProfile = () => navigate("/profile");
  const logout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [invoiceProducts, setInvoiceProducts] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [popup, setPopup] = useState({ show: false, message: "" });
  const [currentBillId, setCurrentBillId] = useState(null);

  const showAlert = (msg) => setPopup({ show: true, message: msg });

  const searchProduct = useCallback(async () => {
    if (!search.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await axios.post("http://localhost:8080/products/search", { 
        productName: search,
        userId: userId 
      });
      const resultsWithQty = (res.data || []).map(p => ({ 
        ...p, 
        tempQty: 1 
      }));
      setSearchResults(resultsWithQty);
    } catch {
      setSearchResults([]);
    }
  }, [search, userId]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => searchProduct(), 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search, searchProduct]);

  const updateTempQty = (productId, delta) => {
    setSearchResults(prev => prev.map(p => {
      if (p.productId === productId) {
        const currentQty = p.tempQty || 1;
        const newQty = currentQty + delta;
        if (newQty >= 1 && newQty <= p.productQuantity) {
          return { ...p, tempQty: newQty };
        } else if (newQty > p.productQuantity) {
          showAlert(`Only ${p.productQuantity} units available.`);
          return p;
        }
      }
      return p;
    }));
  };

  const addToInvoice = async (product, qty) => {
    if (product.productQuantity === 0) return showAlert("Out of stock");
    try {
      const newStockCount = Number(product.productQuantity) - Number(qty);
      await axios.put("http://localhost:8080/products/update", { 
        ...product, 
        productQuantity: newStockCount 
      });

      const existing = invoiceProducts.find(p => p.productId === product.productId);
      if (existing) {
        setInvoiceProducts(invoiceProducts.map(p =>
          p.productId === product.productId 
            ? { ...p, quantity: Number(p.quantity) + Number(qty) } 
            : p
        ));
      } else {
        setInvoiceProducts([...invoiceProducts, {
          productId: product.productId,
          productName: product.productName,
          price: product.sellingPrice,
          quantity: Number(qty),
          originalProduct: { ...product } 
        }]);
      }

      setSearchResults(prev => prev.map(p => 
        p.productId === product.productId ? { ...p, productQuantity: newStockCount, tempQty: 1 } : p
      ));
    } catch (err) {
      showAlert("Error updating product stock.");
    }
  };

  const removeFromInvoice = async (productId) => {
    const itemToRemove = invoiceProducts.find(p => p.productId === productId);
    if (!itemToRemove) return;
    try {
      const masterProduct = searchResults.find(p => p.productId === productId) || itemToRemove.originalProduct;
      const restoredStock = Number(masterProduct.productQuantity) + Number(itemToRemove.quantity);
      await axios.put("http://localhost:8080/products/update", { 
        ...masterProduct, 
        productQuantity: restoredStock 
      });
      setInvoiceProducts(prev => prev.filter(p => p.productId !== productId));
      setSearchResults(prev => prev.map(p => 
        p.productId === productId ? { ...p, productQuantity: restoredStock } : p
      ));
      showAlert("Item removed and stock restored.");
    } catch (err) {
      showAlert("Failed to remove item.");
    }
  };

  const generateInvoice = async () => {
    if (!customerName || invoiceProducts.length === 0) {
      return showAlert("Fill customer name and add products");
    }
    try {
      const subtotal = invoiceProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0);
      const discPercent = parseInt(discount) || 0;
      const finalVal = subtotal - (subtotal * discPercent / 100);

      const payload = {
        customerName: customerName,
        customerEmail: email || "",
        customerContact: contact ? Number(contact) : 0,
        date: invoiceDate,
        userId: Number(userId),
        products: invoiceProducts.map(p => ({
          productId: p.productId,
          productName: p.productName,
          sellingPrice: Number(p.price),
          productQuantity: Number(p.quantity)
        })),
        discount: discPercent,
        totalAmmount: Math.round(subtotal),
        finalAmmount: parseFloat(finalVal.toFixed(2))
      };

      const response = await axios.post("http://localhost:8080/invoice/generateBill", payload);
      if (response.data && response.data.billId) {
        setCurrentBillId(response.data.billId);
        showAlert("Order Confirmed !!");
      }
    } catch (err) {
      showAlert("Error saving order");
    }
  };

  const totalAmount = invoiceProducts.reduce((sum, p) => sum + p.price * p.quantity, 0);
  const finalAmount = totalAmount - (totalAmount * (parseFloat(discount) || 0)) / 100;

const handlePrint = async () => {
if (!currentBillId) {
    return showAlert("Please Confirm Order before printing invoice.");
  }

  if (!customerName || invoiceProducts.length === 0) {
    return showAlert("No invoice data to print");
  }

  const payload = {
    billId: currentBillId,
    customerName: customerName,
    customerEmail: email || "",
    customerContact: contact ? Number(contact) : 0,
    date: invoiceDate,
    userId: Number(userId),
    products: invoiceProducts.map(p => ({
      productName: p.productName,
      sellingPrice: Number(p.price),
      productQuantity: Number(p.quantity)
    })),
    discount: parseInt(discount) || 0,
    totalAmmount: Math.round(totalAmount),
    finalAmmount: parseFloat(finalAmount.toFixed(2))
  };

  try {
    const response = await axios.post(
      "http://localhost:8080/invoice/downloadPDF",
      payload,
      { responseType: "blob" }
    );

    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);

    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.setAttribute("download", `Invoice_${customerName}.pdf`);
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();

    const printWindow = window.open(url, "_blank");
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }

    showAlert("Invoice processed successfully");

  } catch (err) {
    showAlert("Error processing invoice");
  }
};

  const handleWhatsApp = () => {
    return "This module is pending"
  };

const handleEmail = async () => {
  if (!currentBillId) {
    return showAlert("Please Confirm Order first to send the Email.");
  }

  try {
    await axios.post("http://localhost:8080/invoice/send-email", {
      billId: currentBillId,
      customerName,
      customerEmail: email,
      customerContact: contact ? Number(contact) : 0,
      date: invoiceDate,
      userId: Number(userId),
      products: invoiceProducts.map(p => ({
        productName: p.productName,
        sellingPrice: Number(p.price),
        productQuantity: Number(p.quantity)
      })),
      discount: parseInt(discount) || 0,
      totalAmmount: Math.round(totalAmount),
      finalAmmount: parseFloat(finalAmount.toFixed(2))
    });

    showAlert("Invoice PDF sent to Customer & Owner email ✔");
  } catch {
    showAlert("Failed to send invoice email");
  }
};


  return (
    <div className="app-container">
      <Popup show={popup.show} message={popup.message} onClose={() => setPopup({ show: false, message: "" })} />
      <aside className="sidebar no-print">
        <div className="sidebar-logo">
          <Package className="logo-icon" size={28} />
          <span>Softneil Billing</span>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-item" onClick={goHome}><LayoutDashboard size={20} /> Dashboard</div>
          <div className="nav-item" onClick={goToProducts}><Package size={20} /> Products</div>
          <div className="nav-item active" onClick={goToInvoice}><FileText size={20} /> Invoices</div>
          <div className="nav-item" onClick={goToProfile}><User size={20} /> Profile</div>
        </nav>
        <button className="logout-btn" onClick={logout}>
          <LogOut size={18} /> 
          <span>Logout</span>
        </button>
      </aside>
      <main className="main-content">
        <header className="content-header no-print">
          <div className="header-title">
            <h1>Create Invoice</h1>
            <p>Welcome, {userData.ownerName || "User"}. Managing billing for {userData.shopName}.</p>
          </div>
        </header>
        <div className="invoice-layout">
          <div className="invoice-left-panel no-print">
            <section className="modern-card">
              <div className="card-header-with-icon"><User size={18} /> <h3>Customer Information</h3></div>
              <div className="customer-grid">
                <div className="input-group">
                  <label>Billing Date</label>
                  <input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
                </div>
                <div className="input-group">
                  <label>Customer Name</label>
                  <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                </div>
                <div className="input-group">
                  <label>Email Address</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="input-group">
                  <label>Phone Number</label>
                  <input type="text" value={contact} onChange={(e) => setContact(e.target.value)} />
                </div>
              </div>
            </section>
            <section className="modern-card">
              <div className="card-header-with-icon"><Search size={18} /> <h3>Search Products</h3></div>
              <div className="search-box">
                <Search className="search-icon" size={18} />
                <input type="text" placeholder="Search products...." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <div className="product-selection-grid">
                {searchResults.map((p) => (
                  <div key={p.productId} className="product-selection-item">
                    <div className="item-info">
                      <span className="item-name">{p.productName}</span>
                      <span className="item-price">
                        ₹{p.sellingPrice} <small className="stock-label">({p.productQuantity} in stock)</small>
                      </span>
                    </div>
                    <div className="item-selection-actions">
                      <div className="stepper">
                        <button type="button" onClick={() => updateTempQty(p.productId, -1)}><Minus size={14}/></button>
                        <input type="number" value={p.tempQty || 1} readOnly className="qty-input" />
                        <button type="button" onClick={() => updateTempQty(p.productId, 1)}><Plus size={14}/></button>
                      </div>
                      <button className="add-btn-mini" onClick={() => addToInvoice(p, p.tempQty || 1)}>Add</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
          <aside className="invoice-sidebar">
            <div className="receipt-container">
              <div className="receipt-top">
                <div className="receipt-brand"><Package size={24} /> <span>Current Cart</span></div>
              </div>
              <div className="receipt-items">
                {invoiceProducts.length === 0 ? (
                  <div className="empty-state-receipt"><FileText size={40} /><p>No items added yet</p></div>
                ) : (
                  <table className="receipt-table">
                    <thead>
                      <tr>
                        <th className="col-item">ITEM</th>
                        <th className="col-qty text-center">QTY</th>
                        <th className="col-total text-right">TOTAL</th>
                        <th className="col-action no-print"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoiceProducts.map((p) => (
                        <tr key={p.productId}>
                          <td className="col-item">
                            <p className="p-name">{p.productName}</p>
                            <small className="p-unit-price">₹{p.price}</small>
                          </td>
                          <td className="col-qty text-center">{p.quantity}</td>
                          <td className="col-total text-right">₹{(p.price * p.quantity).toFixed(2)}</td>
                          <td className="col-action no-print">
                            <button className="remove-row-btn" onClick={() => removeFromInvoice(p.productId)}><Trash2 size={14}/></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              <div className="receipt-summary">
                <div className="summary-row"><span>Subtotal</span><span>₹{totalAmount.toFixed(2)}</span></div>
                <div className="summary-row">
                  <span>Discount (%)</span>
                  <input type="number" className="discount-input" value={discount} onChange={(e) => setDiscount(e.target.value)} />
                </div>
                <div className="summary-row grand-total"><span>Total</span><span>₹{finalAmount.toFixed(2)}</span></div>
                
                {/* --- NEW LOGIC: PREVIEW BANK DETAILS IN CART --- */}
                <div className="bank-preview no-print" style={{marginTop: '15px', padding: '10px', background: '#f8fafc', borderRadius: '8px', fontSize: '12px', border: '1px solid #e2e8f0'}}>
                   <div style={{fontWeight: '700', marginBottom: '5px', color: '#6366f1'}}>PAYMENT INFO (TO BE PRINTED)</div>
                   <div>A/C: {userData.bankAccountNumber || 'Not set'}</div>
                   <div>UPI: {userData.upiId || 'Not set'}</div>
                </div>
                {/* --- END NEW LOGIC --- */}
                
              </div>
              <div className="receipt-actions no-print">
                <button className="btn-confirm" onClick={generateInvoice}><CheckCircle size={18} /> Confirm Order</button>
                <div className="action-grid">
                  <button className="btn-secondary" onClick={handlePrint}><Printer size={16}/> Print</button>
                  <button className="btn-secondary whatsapp" onClick={handleWhatsApp}><Send size={16}/> whatsapp</button>
                  <button className="btn-secondary email" onClick={handleEmail}><Mail size={16}/> Email</button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default Invoice;