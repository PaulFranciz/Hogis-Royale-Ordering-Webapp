import React, { useState, useEffect } from 'react';
import { auth, db } from '../Firebase/FirebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './AdminDashboard.css'

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        const adminDoc = await getDoc(doc(db, 'admins', user.uid));
        if (adminDoc.exists() && adminDoc.data().isAdmin) {
          setIsAdmin(true);
        } else {
          navigate('/menu');
        }
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  if (!user || !isAdmin) {
    return <div>Loading...</div>;
  }

  return (
    <div className='dashboard'>
      <h1>ADMIN DASHBOARD</h1>
      <nav className='dashboard-nav'>
        <ul>
        <Link to="/admin/manage-menu" className='nav-links'>MANAGE MENU</Link>
         {/* <li><Link to="/admin/orders" className='nav-links'>ORDERS</Link></li>
          <li><Link to="/admin/users" className='nav-links'>USERS</Link></li>
          <li><Link to="/admin/sales-reports" className='nav-links'>SALES REPORTS</Link></li>
          <li><Link to="/admin/customer-inquiries" className='nav-links'>CUSTOMER INQUIRIES</Link></li> */}
        </ul>
      </nav>
      <ToastContainer />
    </div>
  );
};

export default AdminDashboard;