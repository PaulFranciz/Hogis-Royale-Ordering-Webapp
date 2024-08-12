import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock, User, FileText  } from 'lucide-react';
import { IoMdArrowBack } from "react-icons/io";
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';
import { usePaystackPayment } from 'react-paystack';
import { useShoppingCart } from '../ShoppingCart/ShoppingCartContext';
import { getFlutterwaveConfig, getPaystackConfig } from '../FlutterWave/FlutterwaveConfig';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import './CheckOut.css';

const CheckoutPage = () => {
  const [paymentMethod, setPaymentMethod] = useState('flutterwave');
  const [saveInfo, setSaveInfo] = useState(false);
  const [payingForSomeone, setPayingForSomeone] = useState(false);
  const [isHogisGuest, setIsHogisGuest] = useState(null);
  const [deliveryOption, setDeliveryOption] = useState('');
  const [showInvoice, setShowInvoice] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [recipientName, setRecipientName] = useState('');

  const { cartItems } = useShoppingCart();

  const hogisLocations = {
    'Room Service': 0,
    'Within Hogis Royale': 0
  };

  const deliveryPrices = {
    'Calabar Municipality': 1500,
    'Calabar South': 1500,
    '8 miles': 2000,
    'Akpabuyo': 3000
  };

  const getDeliveryPrice = () => {
    if (isHogisGuest) {
      return hogisLocations[deliveryOption] || 0;
    } else {
      return deliveryPrices[deliveryOption] || 0;
    }
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryPrice = getDeliveryPrice();
  const finalAmount = totalPrice + deliveryPrice;

  const formatPrice = (price) => {
    return `₦${price.toLocaleString('en-NG', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })}`;
  };

  const customer = {
    email: email,
    phone_number: phone,
    name: name,
  };

  const flutterwaveConfig = getFlutterwaveConfig(finalAmount, customer);
  const handleFlutterPayment = useFlutterwave(flutterwaveConfig);

  const paystackConfig = getPaystackConfig(finalAmount, { email });
  const initializePaystackPayment = usePaystackPayment(paystackConfig);

  const generateInvoice = (orderDetails, customerInfo) => {
    const doc = new jsPDF();

    const logoUrl = '/Hogis.jpg'; // Updated path
    const logoWidth = 40;
    const logoHeight = 40;
    doc.addImage(logoUrl, 'PNG', 10, 10, logoWidth, logoHeight);

    // Company details
    doc.setFontSize(20);
    doc.setTextColor(0, 102, 204);
    doc.text('Hogis Royale', 105, 20, null, null, 'center');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('123 Royale Street, Calabar, Nigeria', 105, 30, null, null, 'center');
    doc.text('Phone: +234123456789 | Email: info@hogisroyale.com', 105, 35, null, null, 'center');

    // Invoice title and number
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('INVOICE', 20, 50);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.text(`Invoice Number: INV-${Date.now()}`, 20, 60);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 65);

    // Add customer information
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Bill To:', 20, 80);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.text(customerInfo.name, 20, 85);
    doc.text(customerInfo.email, 20, 90);
    doc.text(customerInfo.phone, 20, 95);
    doc.text(customerInfo.address, 20, 100);
    doc.text(customerInfo.city, 20, 105);

    // Create table for order items
    const tableColumn = ["Item", "Quantity", "Price", "Total"];
    const tableRows = orderDetails.items.map(item => [
      item.name,
      item.quantity,
      `₦${item.price.toFixed(2)}`,
      `₦${(item.quantity * item.price).toFixed(2)}`
    ]);

    doc.autoTable({
      startY: 120,
      head: [tableColumn],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [0, 102, 204], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 240, 240] }
    });

    // Add totals
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.text(`Subtotal: ₦${orderDetails.subtotal.toFixed(2)}`, 140, finalY);
    doc.text(`Delivery: ₦${orderDetails.deliveryFee.toFixed(2)}`, 140, finalY + 5);
    doc.setFont(undefined, 'bold');
    doc.text(`Total: ₦${orderDetails.total.toFixed(2)}`, 140, finalY + 10);

    // Add footer
    doc.setFontSize(10);
    doc.setFont(undefined, 'italic');
    doc.text('Thank you for dining with Hogis Royale!', 105, 280, null, null, 'center');

    // Save the PDF
    doc.save(`hogis_royale_invoice_${Date.now()}.pdf`);
  };

  const prepareInvoiceData = () => {
    const orderDetails = {
      items: cartItems.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      subtotal: totalPrice,
      deliveryFee: deliveryPrice,
      total: finalAmount
    };

    const customerInfo = {
      name: payingForSomeone ? recipientName : name,
      email,
      phone,
      address,
      city
    };

    return { orderDetails, customerInfo };
  };

  const onPaymentSuccess = (response) => {
    console.log(response);
    const { orderDetails, customerInfo } = prepareInvoiceData();
    generateInvoice(orderDetails, customerInfo);
    // Additional success handling...
  };

  const onPaystackSuccess = (reference) => {
    console.log(reference);
    onPaymentSuccess(reference);
  };

  const onPaystackClose = () => {
    console.log('Paystack payment closed');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!deliveryOption) {
      alert("Please select a delivery option before proceeding to payment.");
      return;
    }
    if (paymentMethod === 'flutterwave') {
      handleFlutterPayment({
        callback: (response) => {
          console.log(response);
          closePaymentModal();
          if (response.status === "successful") {
            onPaymentSuccess(response);
          } else {
            console.log("Flutterwave payment failed");
          }
        },
        onClose: () => {},
      });
    } else if (paymentMethod === 'paystack') {
      initializePaystackPayment(onPaystackSuccess, onPaystackClose);
    }
  };

  return (
    <div className="checkout-page">
    <div className="checkout-container">
      <div className="breadcrumb non-fixed">
        <Link to="/cart" className="breadcrumb-link">
          <IoMdArrowBack size={25} />
        </Link>
      </div>
      <h1 className="checkout-title">Checkout</h1>
        
        <div className="checkout-content">
          <div className="checkout-form-container">
            <form className="checkout-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input 
                  id="name" 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="John Doe" 
                  required 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input 
                  id="email" 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="john@example.com" 
                  required 
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input 
                  id="phone" 
                  type="tel" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  placeholder="+234567890469" 
                  required 
                />
              </div>

              <div className="form-group">
                <label htmlFor="address">Address</label>
                <input 
                  id="address" 
                  type="text" 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)} 
                  placeholder="123 Main St" 
                  required 
                />
              </div>

              <div className="form-group">
                <label htmlFor="city">City</label>
                <input 
                  id="city" 
                  type="text" 
                  value={city} 
                  onChange={(e) => setCity(e.target.value)} 
                  placeholder="Calabar" 
                  required 
                />
              </div>
              
              <div className="form-group">
                <label>Payment Method</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      value="flutterwave"
                      checked={paymentMethod === 'flutterwave'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    Flutterwave
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      value="paystack"
                      checked={paymentMethod === 'paystack'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    Paystack
                  </label>
                </div>
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={saveInfo}
                    onChange={() => setSaveInfo(!saveInfo)}
                  />
                  Save this information for next time
                </label>
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={payingForSomeone}
                    onChange={() => setPayingForSomeone(!payingForSomeone)}
                  />
                  Are you paying for someone else?
                </label>
              </div>

              {payingForSomeone && (
                <div className="form-group">
                  <label htmlFor="recipient">Recipient's Name</label>
                  <div className="recipient-input-wrapper">
                    <User className="recipient-icon" />
                    <input 
                      id="recipient" 
                      type="text" 
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="Recipient's name" 
                      required 
                    />
                  </div>
                </div>
              )}
            </form>
          </div>
          
          <div className="checkout-summary-container">
            <div className="order-summary">
              <h2>Order Summary</h2>
              <div className="order-items">
                <button className="view-invoice-btn" onClick={() => setShowInvoice(!showInvoice)}>
                  {showInvoice ? 'Hide Invoice' : 'View Invoice'}
                </button>
                {showInvoice && (
                  <ul className="invoice-list">
                    {cartItems.map((item, index) => (
                      <li key={index} className="invoice-item">
                        <span className="invoice-item-name">{item.name}</span>
                        <span className="invoice-item-quantity">Quantity: {item.quantity}</span>
                        <span className="invoice-item-price">{formatPrice(item.price * item.quantity)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="summary-row">
                <span className="items-amount">{cartItems.length} ITEMS</span>
                <span className="item-amount-price">{formatPrice(totalPrice)}</span>
              </div>
              <div className="summary-row">
                <span className="delivery">DELIVERY</span>
                {isHogisGuest === null ? (
                  <div>
                    <p>Are you a guest @Hogis Royale?</p>
                    <div className="guest-flex">
                      <button type="button" onClick={() => setIsHogisGuest(true)} className="isGuest-btn">Yes</button>
                      <button type="button" onClick={() => setIsHogisGuest(false)} className="isGuest-btn">No</button>
                    </div>
                  </div>
                ) : (
                  <select
                    value={deliveryOption} 
                    onChange={(e) => setDeliveryOption(e.target.value)}
                    className="delivery-select"
                  >
                    <option value="">Select a location</option>
                    {isHogisGuest
                      ? Object.entries(hogisLocations).map(([location, price]) => (
                          <option key={location} value={location}>
                            {location} - {formatPrice(price)}
                          </option>
                        ))
                      : Object.entries(deliveryPrices).map(([location, price]) => (
                          <option key={location} value={location}>
                            {location} - {formatPrice(price)}
                          </option>
                        ))
                    }
                  </select>
                )}
              </div>
              <div className="total-price">
                <span>TOTAL PRICE</span>
                <span>{formatPrice(finalAmount)}</span>
              </div>
            </div>
            
            <button type="submit" className="pay-button" onClick={handleSubmit}>
            Pay Now with {' '}
            <img 
              src={paymentMethod === 'flutterwave' 
                ? '/flutterwave-1.svg'  // Replace with actual path
                : '/paystack-2.svg'     // Replace with actual path
              } 
              alt={`${paymentMethod} logo`}
              className="payment-logo"
            />
            <Lock className="lock-icon" />
          </button>
            
            <button 
              type="button" 
              onClick={() => {
                const { orderDetails, customerInfo } = prepareInvoiceData();
                generateInvoice(orderDetails, customerInfo);
              }}
              className="generate-invoice-button"
            >
              Generate Invoice
              <FileText className="file-icon" />
            </button>
            
            <p className="secure-text">
              Secured by {paymentMethod === 'flutterwave' ? 'Flutterwave' : 'Paystack'}
            </p>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;