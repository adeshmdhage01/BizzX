import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  Users, Search, LogOut, UserCheck, UserX, Trash2,
  ChevronLeft, ChevronRight, Shield, Mail, Phone
} from "lucide-react"; 
import Popup from "../Auth/Popup"; // Corrected import path based on your folder structure
import "./Admin.css";

function Admin() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchBy, setSearchBy] = useState("username");
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  // Popup Management State
  const [showPopup, setShowPopup] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const logout = () => { window.location.href = "/login"; };

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = () => {
    axios.get("http://localhost:8080/admin/users")
      .then(res => setUsers(res.data))
      .catch(err => console.error(err));
  };

  const updateStatus = (userId, status) => {
    axios.put(`http://localhost:8080/admin/user/${userId}/status?status=${status}`)
      .then(() => {
        setUsers(prev => prev.map(u => u.userId === userId ? { ...u, isActive: status } : u));
        setSelectedUser(prev => prev ? { ...prev, isActive: status } : prev);
      })
      .catch(err => console.error("Status update failed", err));
  };

  const handleDeleteClick = (userId) => {
    setUserToDelete(userId);
    setShowPopup(true);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      axios.delete(`http://localhost:8080/admin/user/${userToDelete}`)
        .then(() => {
          setUsers(prev => prev.filter(u => u.userId !== userToDelete));
          setSelectedUser(null);
          setShowPopup(false);
          setUserToDelete(null);
        })
        .catch(err => console.error("Delete failed", err));
    }
  };

  const filteredUsers = users.filter(user =>
    user[searchBy]?.toString().toLowerCase().includes(searchValue.toLowerCase())
  );

  const indexOfLast = currentPage * usersPerPage;
  const indexOfFirst = indexOfLast - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="admin-container">
      {/* Custom Popup implementation */}
      <Popup 
        show={showPopup}
        title="Delete Account"
        message="Are you sure you want to permanently delete this user? This action cannot be undone."
        isConfirm={true}
        onClose={() => setShowPopup(false)}
        onConfirm={confirmDelete}
      />

      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo"><Shield size={24} fill="currentColor" /></div>
          <span>Softneil Admin</span>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-item active"><Users size={20} /> <span>Users</span></div>
        </nav>
        <button className="sidebar-logout" onClick={logout}>
          <LogOut size={18} /> <span>Logout</span>
        </button>
      </aside>

      <main className="main-content">
        <header className="content-header">
          <div className="header-title">
            <h1>User Management</h1>
            <p>Control system access and monitor user status</p>
          </div>
          
          <div className="search-composite">
            <div className="search-select-wrapper">
              <select value={searchBy} onChange={e => { setSearchBy(e.target.value); setSearchValue(""); }}>
                <option value="username">Username</option>
                <option value="email">Email</option>
                <option value="contact">Contact</option>
              </select>
            </div>
            <div className="search-input-wrapper">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder={`Search ${searchBy}...`}
                value={searchValue}
                onChange={e => { setSearchValue(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>
        </header>

        <div className="dashboard-layout">
          <section className="list-panel">
            <div className="glass-card table-container">
              <div className="table-header-grid">
                <span>Account details</span>
                <span>Status</span>
              </div>
              <div className="scrollable-rows">
                {currentUsers.length > 0 ? (
                  currentUsers.map(user => (
                    <div
                      key={user.userId}
                      className={`user-card-row ${selectedUser?.userId === user.userId ? "is-selected" : ""}`}
                      onClick={() => setSelectedUser(user)}
                    >
                      <div className="user-meta">
                        <div className="avatar-small">{user.ownerName.charAt(0)}</div>
                        <div className="text-group">
                          <span className="name">{user.ownerName}</span>
                          <span className="sub">@{user.username}</span>
                        </div>
                      </div>
                      <div className={`status-pill ${user.isActive === "A" ? "online" : "offline"}`}>
                        {user.isActive === "A" ? "Active" : "Inactive"}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-results">No users found matching your search.</div>
                )}
              </div>
              
              <div className="modern-pagination">
                <span className="count-text">Page {currentPage} of {totalPages || 1}</span>
                <div className="page-btns">
                  <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
                    <ChevronLeft size={18} />
                  </button>
                  {pageNumbers.map(n => (
                    <button key={n} className={currentPage === n ? 'active' : ''} onClick={() => setCurrentPage(n)}>
                      {n}
                    </button>
                  ))}
                  <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(currentPage + 1)}>
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="detail-panel">
            {selectedUser ? (
              <div className="glass-card detail-view">
                <div className="profile-header">
                  <div className="avatar-large">{selectedUser.ownerName.charAt(0)}</div>
                  <h2>{selectedUser.ownerName}</h2>
                  <div className="role-badge">{selectedUser.userRole}</div>
                </div>

                <div className="contact-info-card">
                  <div className="contact-row">
                    <Mail size={16} /> <span>{selectedUser.email}</span>
                  </div>
                  <div className="contact-row">
                    <Phone size={16} /> <span>{selectedUser.contact}</span>
                  </div>
                </div>

                <div className="action-area">
                  <button 
                    className={selectedUser.isActive === "A" ? "btn-status-deactivate" : "btn-primary"} 
                    onClick={() => updateStatus(selectedUser.userId, selectedUser.isActive === "A" ? "I" : "A")}
                    style={{ marginBottom: '12px' }}
                  >
                    {selectedUser.isActive === "A" ? <><UserX size={18} /> Deactivate Account</> : <><UserCheck size={18} /> Activate Account</>}
                  </button>

                  <button 
                    className="btn-danger-permanent"
                    onClick={() => handleDeleteClick(selectedUser.userId)}
                  >
                    <Trash2 size={18} /> Delete User Data
                  </button>
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <div className="pulse-icon"><Users size={40} /></div>
                <p>Select an account to view details</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default Admin;