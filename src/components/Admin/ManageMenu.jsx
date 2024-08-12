import React, { useState, useEffect, useCallback } from 'react';
import { db, storage, auth } from '../Firebase/FirebaseConfig';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { useAuthState } from 'react-firebase-hooks/auth';
import Papa from 'papaparse';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './AdminDashboard.css';

const ManageMenu = () => {
  const [user, loading, error] = useAuthState(auth);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [newMenuItem, setNewMenuItem] = useState({
    category: '',
    name: '',
    price: '',
  });
  const [editItemId, setEditItemId] = useState(null);

  const fetchMenuItems = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'menu_items'));
      const menuItemsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMenuItems(menuItemsData);

      const uniqueCategories = [...new Set(menuItemsData.map(item => item.category))];
      setCategories(uniqueCategories.map(category => ({ id: category, title: category })));
    } catch (error) {
      toast.error('Failed to fetch menu items. Please try again later.');
    }
  }, []);

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      fetchMenuItems()
        .then(() => {
          setIsLoading(false);
        })
        .catch(() => {
          setIsLoading(false);
        });
    } else {
      setMenuItems([]);
      setCategories([]);
      setIsLoading(false);
    }
  }, [user, fetchMenuItems]);

  const handleAddMenuItem = async (e) => {
    e.preventDefault();
    try {
      if (editItemId) {
        const menuItemRef = doc(db, 'menu_items', editItemId);
        await updateDoc(menuItemRef, newMenuItem);
        toast.success('Menu item updated successfully!');
      } else {
        await addDoc(collection(db, 'menu_items'), newMenuItem);
        toast.success('New menu item added successfully!');
      }
      fetchMenuItems();
      setNewMenuItem({ category: '', name: '', price: '' });
      setEditItemId(null);
    } catch (error) {
      toast.error('Failed to add/update menu item. Please try again.');
    }
  };

  const handleEditMenuItem = (item) => {
    setEditItemId(item.id);
    setNewMenuItem({
      category: item.category,
      name: item.name,
      price: item.price,
    });
  };

  const handleDeleteMenuItem = async (itemId, imageUrl) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'Do you really want to delete this menu item?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
      });

      if (result.isConfirmed) {
        await deleteDoc(doc(db, 'menu_items', itemId));
        if (imageUrl) {
          const imageRef = ref(storage, imageUrl);
          await deleteObject(imageRef);
        }
        fetchMenuItems();
        toast.success('Menu item deleted successfully!');
      }
    } catch (error) {
      toast.error('Failed to delete menu item. Please try again.');
    }
  };

  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        complete: async (results) => {
          try {
            setIsLoading(true);
            for (const item of results.data) {
              if (item.category && item.name && item.price) {
                await addDoc(collection(db, 'menu_items'), {
                  category: item.category.trim(),
                  name: item.name.trim(),
                  price: parseFloat(item.price) || 0,
                });
              }
            }
            toast.success('CSV data imported successfully!');
            fetchMenuItems();
          } catch (error) {
            toast.error('Failed to import CSV data. Please try again.');
          } finally {
            setIsLoading(false);
          }
        },
      });
    }
  };

  const filteredMenuItems = menuItems.filter(item =>
    item?.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedCategory === 'All' || item.category === selectedCategory)
  );

  const formatPrice = (price) => {
    return price.toLocaleString('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!user) return <div className="manage-menu-container">Please log in to manage menu items.</div>;

  return (
    <div className="manage-menu-container">
      <h1 className="dashboard-title">Manage Menu</h1>

      <div className="controls">
        <input
          type="text"
          placeholder="Search menu items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="category-select"
        >
          <option value="All">All Categories</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>{category.title}</option>
          ))}
        </select>
        <input type="file" accept=".csv" onChange={handleCSVUpload} className="file-input" />
      </div>

      <form onSubmit={handleAddMenuItem} className="add-menu-item-form">
        <input
          type="text"
          placeholder="Category"
          value={newMenuItem.category}
          onChange={(e) => setNewMenuItem({...newMenuItem, category: e.target.value})}
          required
        />
        <input
          type="text"
          placeholder="Name"
          value={newMenuItem.name}
          onChange={(e) => setNewMenuItem({...newMenuItem, name: e.target.value})}
          required
        />
        <input
          type="number"
          placeholder="Price"
          value={newMenuItem.price}
          onChange={(e) => setNewMenuItem({...newMenuItem, price: e.target.value})}
          required
        />
        <button type="submit">{editItemId ? 'Update Menu Item' : 'Add Menu Item'}</button>
      </form>

      <div className="menu-item-grid">
        {isLoading ? (
          <div>Loading menu items...</div>
        ) : filteredMenuItems.length > 0 ? (
          filteredMenuItems.map(item => (
            <div key={item.id} className="menu-item-card">
              <h3 className='item-name'>{item.name}</h3>
              <p className='item-price'>Price: {formatPrice(parseFloat(item.price))}</p>
              <p className='item-category'>Category: {item.category}</p>
              <div className="actions">
                <button onClick={() => handleEditMenuItem(item)} className='btn-edit'>Edit</button>
                <button onClick={() => handleDeleteMenuItem(item.id, item.imageUrl)} className='btn-delete'>Delete</button>
              </div>
            </div>
          ))
        ) : (
          <div>No menu items found. Try adjusting your search or category filter.</div>
        )}
      </div>
    </div>
  );
};

export default ManageMenu;