'use client';
import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Edit2, Trash2, Ban, CheckCircle, 
  X, ChevronLeft, ChevronRight, UserCheck, UserX, Mail, 
  Phone, Calendar, DollarSign, Star, Briefcase, Building2,
  Shield, Clock, MapPin, TrendingUp, Loader2
} from 'lucide-react';

// Type definitions
interface User {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone?: string;
  avatar?: string;
  userType: 'freelancer' | 'client';
  isBanned: boolean;
  isActive: boolean;
  isEmailVerified: boolean;
  isPhoneVerified?: boolean;
  balance: number;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  lastSeen?: string;
  location?: string;
  
  // Freelancer specific fields
  rating?: number;
  completedOrders?: number;
  earnings?: number;
  withdrawableBalance?: number;
  pendingBalance?: number;
  reviewsCount?: number;
  responseTime?: string;
  skills?: string[];
  languages?: string[];
  
  // Client specific fields
  companyName?: string;
  spent?: number;
  companyDescription?: string;
}

interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  isActive: boolean;
  balance: number;
  withdrawableBalance: number;
  pendingBalance: number;
  rating: number;
  companyName: string;
  spent: number;
}

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'freelancer' | 'client'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'banned' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  // Individual loading states
  const [banLoading, setBanLoading] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState<string | null>(null);
  
  const usersPerPage = 10;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users');
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

 const handleBanToggle = async (userId: string, currentBanStatus: boolean) => {
  try {
    setBanLoading(userId);
    const response = await fetch(`/api/users/${userId}/ban`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isBanned: !currentBanStatus }),
    });
    
    if (response.ok) {
      // Option 1: Try to get the updated user from response
      try {
        const updatedUser = await response.json();
        console.log(updatedUser)
        
        // Update the user locally
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user._id === userId ? { ...user, ...updatedUser } : user
          )
        );
      } catch (jsonError) {
        // Option 2: If no response body, update just the isBanned field
        console.log('No response body, updating locally...', jsonError);
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user._id === userId ? { ...user, isBanned: !currentBanStatus } : user
          )
        );
      }
    }
  } catch (error) {
    console.error('Error toggling ban:', error);
  } finally {
    setBanLoading(null);
  }
};

  const handleDelete = async (userId: string) => {
    try {
      setDeleteLoading(userId);
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Remove the user locally without refetching all users
        setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
        setShowDeleteModal(false);
        setSelectedUser(null);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleEdit = async (userId: string, updates: Partial<UserFormData>) => {
    try {
      setEditLoading(userId);
      const response = await fetch(`/api/users/${userId}/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      
      if (response.ok) {
        const updatedUser = await response.json();
        
        // Update the user locally without refetching all users
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user._id === userId ? { ...user, ...updatedUser } : user
          )
        );
        setShowEditModal(false);
        setSelectedUser(null);
      }
    } catch (error) {
      console.error('Error updating user:', error);
    } finally {
      setEditLoading(null);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || user.userType === filterType;
    
    const matchesStatus = 
      filterStatus === 'all' || 
      (filterStatus === 'active' && !user.isBanned && user.isActive) ||
      (filterStatus === 'banned' && user.isBanned) ||
      (filterStatus === 'inactive' && !user.isActive);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const UserCard = ({ user }: { user: User }) => {
    const isBanLoading = banLoading === user._id;
    
    return (
      <div className="bg-white dark:bg-gray-800/10 backdrop-blur-lg rounded-xl p-6 border border-gray-200 dark:border-white/20 hover:border-purple-400/50 transition-all duration-300 shadow-lg">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img 
                src={user.avatar || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=8b5cf6&color=fff`}
                alt={`${user.firstName} ${user.lastName}`}
                className="w-16 h-16 rounded-full object-cover border-2 border-purple-400"
              />
              {user.isBanned && (
                <div className="absolute -top-1 -right-1 bg-red-500 rounded-full p-1">
                  <Ban className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                {user.firstName} {user.lastName}
                {user.isEmailVerified && (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                )}
              </h3>
              <p className="text-purple-600 dark:text-purple-300">@{user.username}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  user.userType === 'freelancer' 
                    ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400' 
                    : 'bg-green-500/20 text-green-600 dark:text-green-400'
                }`}>
                  {user.userType === 'freelancer' ? (
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3 h-3" /> Freelancer
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3 h-3" /> Client
                    </span>
                  )}
                </span>
                {user.isBanned ? (
                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-600 dark:text-red-400">
                    Banned
                  </span>
                ) : user.isActive ? (
                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-600 dark:text-green-400">
                    Active
                  </span>
                ) : (
                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-500/20 text-gray-600 dark:text-gray-400">
                    Inactive
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => {
                setSelectedUser(user);
                setShowDetailsModal(true);
              }}
              className="p-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg transition-colors"
              title="View Details"
            >
              <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </button>
            <button
              onClick={() => {
                setSelectedUser(user);
                setShowEditModal(true);
              }}
              className="p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors"
              title="Edit User"
            >
              <Edit2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </button>
            <button
              onClick={() => handleBanToggle(user._id, user.isBanned)}
              disabled={isBanLoading}
              className={`p-2 rounded-lg transition-colors ${
                user.isBanned 
                  ? 'bg-green-500/20 hover:bg-green-500/30' 
                  : 'bg-orange-500/20 hover:bg-orange-500/30'
              } ${isBanLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={user.isBanned ? 'Unban User' : 'Ban User'}
            >
              {isBanLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : user.isBanned ? (
                <UserCheck className="w-4 h-4 text-green-600 dark:text-green-400" />
              ) : (
                <UserX className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              )}
            </button>
            <button
              onClick={() => {
                setSelectedUser(user);
                setShowDeleteModal(true);
              }}
              className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
              title="Delete User"
            >
              <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-300">
            <Mail className="w-4 h-4" />
            <span className="text-sm truncate">{user.email}</span>
          </div>
          {user.phone && (
            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-300">
              <Phone className="w-4 h-4" />
              <span className="text-sm">{user.phone}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-300">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">{new Date(user.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-300">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm font-semibold">৳{user.balance?.toFixed(2) || '0.00'}</span>
          </div>
        </div>

        {user.userType === 'freelancer' && (
          <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="flex items-center justify-center gap-1 text-yellow-500 mb-1">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-sm font-bold">{user.rating?.toFixed(1) || '0.0'}</span>
                </div>
                <p className="text-xs text-purple-600 dark:text-purple-300">Rating</p>
              </div>
              <div>
                <p className="text-gray-900 dark:text-white font-bold text-sm">{user.completedOrders || 0}</p>
                <p className="text-xs text-purple-600 dark:text-purple-300">Orders</p>
              </div>
              <div>
                <p className="text-gray-900 dark:text-white font-bold text-sm">৳{user.earnings?.toFixed(0) || 0}</p>
                <p className="text-xs text-purple-600 dark:text-purple-300">Earnings</p>
              </div>
            </div>
          </div>
        )}

        {user.userType === 'client' && user.companyName && (
          <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/20">
            <p className="text-gray-900 dark:text-white font-semibold text-sm">{user.companyName}</p>
            <p className="text-purple-600 dark:text-purple-300 text-xs mt-1">Total Spent: ৳{user.spent?.toFixed(2) || '0.00'}</p>
          </div>
        )}
      </div>
    );
  };

  const DetailsModal = () => {
    if (!selectedUser) return null;

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-3xl w-full border border-purple-400/30 my-8 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">User Details</h3>
            <button
              onClick={() => setShowDetailsModal(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-white" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 border border-gray-200 dark:border-white/10">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                Basic Information
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 dark:text-purple-300 text-sm">Full Name</p>
                  <p className="text-gray-900 dark:text-white font-semibold">{selectedUser.firstName} {selectedUser.lastName}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-purple-300 text-sm">Username</p>
                  <p className="text-gray-900 dark:text-white font-semibold">@{selectedUser.username}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-purple-300 text-sm">Email</p>
                  <p className="text-gray-900 dark:text-white font-semibold">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-purple-300 text-sm">Phone</p>
                  <p className="text-gray-900 dark:text-white font-semibold">{selectedUser.phone || 'N/A'}</p>
                </div>
                {selectedUser.location && (
                  <div>
                    <p className="text-gray-600 dark:text-purple-300 text-sm">Location</p>
                    <p className="text-gray-900 dark:text-white font-semibold flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {selectedUser.location}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-gray-600 dark:text-purple-300 text-sm">User Type</p>
                  <p className="text-gray-900 dark:text-white font-semibold capitalize">{selectedUser.userType}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 border border-gray-200 dark:border-white/10">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                Account Status
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 dark:text-purple-300 text-sm">Email Verified</p>
                  <p className={`font-semibold ${selectedUser.isEmailVerified ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {selectedUser.isEmailVerified ? 'Yes' : 'No'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-purple-300 text-sm">Phone Verified</p>
                  <p className={`font-semibold ${selectedUser.isPhoneVerified ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {selectedUser.isPhoneVerified ? 'Yes' : 'No'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-purple-300 text-sm">Account Status</p>
                  <p className={`font-semibold ${selectedUser.isActive ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                    {selectedUser.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-purple-300 text-sm">Ban Status</p>
                  <p className={`font-semibold ${selectedUser.isBanned ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                    {selectedUser.isBanned ? 'Banned' : 'Not Banned'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-purple-300 text-sm">Last Login</p>
                  <p className="text-gray-900 dark:text-white font-semibold">
                    {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString() : 'Never'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-purple-300 text-sm">Last Seen</p>
                  <p className="text-gray-900 dark:text-white font-semibold">
                    {selectedUser.lastSeen ? new Date(selectedUser.lastSeen).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 border border-gray-200 dark:border-white/10">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                Financial Information
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-gray-600 dark:text-purple-300 text-sm">Balance</p>
                  <p className="text-gray-900 dark:text-white font-bold text-lg">৳{selectedUser.balance?.toFixed(2) || '0.00'}</p>
                </div>
                {selectedUser.userType === 'freelancer' && (
                  <>
                    <div>
                      <p className="text-gray-600 dark:text-purple-300 text-sm">Withdrawable</p>
                      <p className="text-green-600 dark:text-green-400 font-bold text-lg">৳{selectedUser.withdrawableBalance?.toFixed(2) || '0.00'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-purple-300 text-sm">Pending</p>
                      <p className="text-yellow-600 dark:text-yellow-400 font-bold text-lg">৳{selectedUser.pendingBalance?.toFixed(2) || '0.00'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-purple-300 text-sm">Total Earnings</p>
                      <p className="text-gray-900 dark:text-white font-bold text-lg">৳{selectedUser.earnings?.toFixed(2) || '0.00'}</p>
                    </div>
                  </>
                )}
                {selectedUser.userType === 'client' && (
                  <div>
                    <p className="text-gray-600 dark:text-purple-300 text-sm">Total Spent</p>
                    <p className="text-gray-900 dark:text-white font-bold text-lg">৳{selectedUser.spent?.toFixed(2) || '0.00'}</p>
                  </div>
                )}
              </div>
            </div>

            {selectedUser.userType === 'freelancer' && (
              <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 border border-gray-200 dark:border-white/10">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  Freelancer Stats
                </h4>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-gray-600 dark:text-purple-300 text-sm">Rating</p>
                    <p className="text-yellow-600 dark:text-yellow-400 font-bold text-lg flex items-center gap-1">
                      <Star className="w-5 h-5 fill-current" />
                      {selectedUser.rating?.toFixed(1) || '0.0'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-purple-300 text-sm">Completed Orders</p>
                    <p className="text-gray-900 dark:text-white font-bold text-lg">{selectedUser.completedOrders || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-purple-300 text-sm">Reviews Count</p>
                    <p className="text-gray-900 dark:text-white font-bold text-lg">{selectedUser.reviewsCount || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-purple-300 text-sm">Response Time</p>
                    <p className="text-gray-900 dark:text-white font-semibold">{selectedUser.responseTime || 'N/A'}</p>
                  </div>
                </div>
                {selectedUser.skills && selectedUser.skills.length > 0 && (
                  <div className="mb-4">
                    <p className="text-gray-600 dark:text-purple-300 text-sm mb-2">Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedUser.skills.map((skill, idx) => (
                        <span key={idx} className="px-3 py-1 bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {selectedUser.languages && selectedUser.languages.length > 0 && (
                  <div>
                    <p className="text-gray-600 dark:text-purple-300 text-sm mb-2">Languages</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedUser.languages.map((lang, idx) => (
                        <span key={idx} className="px-3 py-1 bg-green-500/20 text-green-600 dark:text-green-400 rounded-full text-sm">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedUser.userType === 'client' && selectedUser.companyName && (
              <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 border border-gray-200 dark:border-white/10">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  Company Information
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-gray-600 dark:text-purple-300 text-sm">Company Name</p>
                    <p className="text-gray-900 dark:text-white font-semibold text-lg">{selectedUser.companyName}</p>
                  </div>
                  {selectedUser.companyDescription && (
                    <div>
                      <p className="text-gray-600 dark:text-purple-300 text-sm">Company Description</p>
                      <p className="text-gray-900 dark:text-white">{selectedUser.companyDescription}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 border border-gray-200 dark:border-white/10">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                Timestamps
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 dark:text-purple-300 text-sm">Created At</p>
                  <p className="text-gray-900 dark:text-white font-semibold">{new Date(selectedUser.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-purple-300 text-sm">Updated At</p>
                  <p className="text-gray-900 dark:text-white font-semibold">{new Date(selectedUser.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const EditModal = () => {
    const [formData, setFormData] = useState<UserFormData>({
      firstName: selectedUser?.firstName || '',
      lastName: selectedUser?.lastName || '',
      email: selectedUser?.email || '',
      phone: selectedUser?.phone || '',
      location: selectedUser?.location || '',
      isActive: selectedUser?.isActive || false,
      balance: selectedUser?.balance || 0,
      withdrawableBalance: selectedUser?.userType === 'freelancer' ? (selectedUser?.withdrawableBalance || 0) : 0,
      pendingBalance: selectedUser?.userType === 'freelancer' ? (selectedUser?.pendingBalance || 0) : 0,
      rating: selectedUser?.userType === 'freelancer' ? (selectedUser?.rating || 0) : 0,
      companyName: selectedUser?.userType === 'client' ? (selectedUser?.companyName || '') : '',
      spent: selectedUser?.userType === 'client' ? (selectedUser?.spent || 0) : 0,
    });

    const isEditLoading = editLoading === selectedUser?._id;

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-2xl w-full border border-purple-400/30 my-8 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Edit User</h3>
            <button
              onClick={() => setShowEditModal(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-white" />
            </button>
          </div>

          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-600 dark:text-purple-300 text-sm mb-1 block">First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/20 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-purple-400"
                />
              </div>
              <div>
                <label className="text-gray-600 dark:text-purple-300 text-sm mb-1 block">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/20 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-purple-400"
                />
              </div>
            </div>
            
            <div>
              <label className="text-gray-600 dark:text-purple-300 text-sm mb-1 block">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/20 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-purple-400"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-600 dark:text-purple-300 text-sm mb-1 block">Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/20 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-purple-400"
                />
              </div>
              <div>
                <label className="text-gray-600 dark:text-purple-300 text-sm mb-1 block">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/20 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-purple-400"
                />
              </div>
            </div>

            <div>
              <label className="text-gray-600 dark:text-purple-300 text-sm mb-1 block">Balance</label>
              <input
                type="number"
                step="0.01"
                value={formData.balance}
                onChange={(e) => setFormData({...formData, balance: parseFloat(e.target.value)})}
                className="w-full bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/20 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-purple-400"
              />
            </div>

            {selectedUser?.userType === 'freelancer' && (
              <>
                <div className="grid grid-cols-2 gap-4">

                </div>
                <div>
                  <label className="text-gray-600 dark:text-purple-300 text-sm mb-1 block">Rating (2-5)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="2"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData({...formData, rating: parseFloat(e.target.value)})}
                    className="w-full bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/20 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-purple-400"
                  />
                </div>
              </>
            )}

            {selectedUser?.userType === 'client' && (
              <>
                <div>
                  <label className="text-gray-600 dark:text-purple-300 text-sm mb-1 block">Company Name</label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/20 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-purple-400"
                  />
                </div>
                <div>
                  <label className="text-gray-600 dark:text-purple-300 text-sm mb-1 block">Total Spent</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.spent}
                    onChange={(e) => setFormData({...formData, spent: parseFloat(e.target.value)})}
                    className="w-full bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/20 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-purple-400"
                  />
                </div>
              </>
            )}

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-400"
              />
              <label htmlFor="isActive" className="text-gray-600 dark:text-purple-300 text-sm">Active Account</label>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setShowEditModal(false)}
              disabled={isEditLoading}
              className="flex-1 py-2 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 rounded-lg text-gray-700 dark:text-white font-semibold transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={() => handleEdit(selectedUser!._id, formData)}
              disabled={isEditLoading}
              className="flex-1 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg text-white font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isEditLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEditLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const DeleteModal = () => {
    const isDeleteLoading = deleteLoading === selectedUser?._id;

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-red-400/30 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Delete User</h3>
            <button
              onClick={() => setShowDeleteModal(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-white" />
            </button>
          </div>

          <p className="text-gray-600 dark:text-purple-300 mb-6">
            Are you sure you want to delete <span className="text-gray-900 dark:text-white font-semibold">{selectedUser?.firstName} {selectedUser?.lastName}</span>? This action cannot be undone.
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleteLoading}
              className="flex-1 py-2 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 rounded-lg text-gray-700 dark:text-white font-semibold transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={() => handleDelete(selectedUser!._id)}
              disabled={isDeleteLoading}
              className="flex-1 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg text-white font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isDeleteLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isDeleteLoading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Users className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            <Users className="w-10 h-10 text-purple-600 dark:text-purple-400" />
            Users Management
          </h1>
          <p className="text-gray-600 dark:text-purple-300">Manage all users, freelancers, and clients</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800/10 backdrop-blur-lg rounded-xl p-4 border border-gray-200 dark:border-white/20 shadow-lg">
            <p className="text-gray-600 dark:text-purple-300 text-sm">Total Users</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{users.length}</p>
          </div>
          <div className="bg-blue-500/20 backdrop-blur-lg rounded-xl p-4 border border-blue-500/30 shadow-lg">
            <p className="text-blue-600 dark:text-blue-300 text-sm">Freelancers</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{users.filter(u => u.userType === 'freelancer').length}</p>
          </div>
          <div className="bg-green-500/20 backdrop-blur-lg rounded-xl p-4 border border-green-500/30 shadow-lg">
            <p className="text-green-600 dark:text-green-300 text-sm">Clients</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{users.filter(u => u.userType === 'client').length}</p>
          </div>
          <div className="bg-red-500/20 backdrop-blur-lg rounded-xl p-4 border border-red-500/30 shadow-lg">
            <p className="text-red-600 dark:text-red-300 text-sm">Banned Users</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{users.filter(u => u.isBanned).length}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800/10 backdrop-blur-lg rounded-2xl p-6 border border-gray-200 dark:border-white/20 shadow-lg mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-600 dark:text-purple-300" />
                <input
                  type="text"
                  placeholder="Search by name, email, or username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-white/10 border border-gray-200 dark:border-white/20 rounded-lg text-gray-900 dark:text-white placeholder-purple-600 dark:placeholder-purple-300 focus:outline-none focus:border-purple-400"
                />
              </div>
            </div>
            <div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as 'all' | 'freelancer' | 'client')}
                className="w-full px-4 py-3 bg-white dark:bg-white/10 border border-gray-200 dark:border-white/20 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-purple-400"
              >
                <option className='dark:text-gray-900' value="all">All Types</option>
                <option className='dark:text-gray-900' value="freelancer">Freelancers</option>
                <option className='dark:text-gray-900' value="client">Clients</option>
              </select>
            </div>
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'banned' | 'inactive')}
                className="w-full px-4 py-3 bg-white dark:bg-white/10 border border-gray-200 dark:border-white/20 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-purple-400"
                style={{color: filterStatus === 'all' ? '#9ca3af' : filterStatus === 'active' ? '#34c759' : filterStatus === 'banned' ? '#e11d48' : '#9ca3af'}}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="banned">Banned</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-purple-600 dark:text-purple-300">
            <p>Showing {currentUsers.length} of {filteredUsers.length} users</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {currentUsers.map(user => (
            <UserCard key={user._id} user={user} />
          ))}
        </div>

        {currentUsers.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-gray-800/10 backdrop-blur-lg rounded-2xl border border-gray-200 dark:border-white/20 shadow-lg">
            <Users className="w-16 h-16 text-purple-600 dark:text-purple-400 mx-auto mb-4" />
            <p className="text-gray-900 dark:text-white text-xl mb-2">No users found</p>
            <p className="text-gray-600 dark:text-purple-300">Try adjusting your filters or search term</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 bg-white dark:bg-white/10 hover:bg-gray-100 dark:hover:bg-white/20 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-white" />
            </button>
            
            {[...Array(totalPages)].map((_, idx) => {
              if (
                idx === 0 ||
                idx === totalPages - 1 ||
                (idx >= currentPage - 2 && idx <= currentPage)
              ) {
                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentPage(idx + 1)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      currentPage === idx + 1
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                        : 'bg-white dark:bg-white/10 hover:bg-gray-100 dark:hover:bg-white/20 text-gray-700 dark:text-white'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              } else if (idx === currentPage - 3 || idx === currentPage + 1) {
                return <span key={idx} className="text-gray-600 dark:text-white px-2">...</span>;
              }
              return null;
            })}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-2 bg-white dark:bg-white/10 hover:bg-gray-100 dark:hover:bg-white/20 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-white" />
            </button>
          </div>
        )}

        {showDetailsModal && <DetailsModal />}
        {showEditModal && <EditModal />}
        {showDeleteModal && <DeleteModal />}
      </div>
    </div>
  );
}