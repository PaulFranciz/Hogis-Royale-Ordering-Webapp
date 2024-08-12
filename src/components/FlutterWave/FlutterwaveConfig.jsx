// FlutterwaveConfig.js

export const getFlutterwaveConfig = (amount, customer) => ({
    public_key: import.meta.env.VITE_FLW_PUBLIC_KEY,
    tx_ref: Date.now().toString(),
    amount: amount,
    currency: 'NGN',
    payment_options: 'card,mobilemoney,ussd',
    customer: customer,
    customizations: {
      title: 'Hogis Royale Checkout',
      description: 'Payment for items in cart',
      logo: '/Hogis.jpg',
    },
  });
  
  export const getPaystackConfig = (amount, customer) => ({
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
    email: customer.email,
    amount: amount * 100, 
    currency: 'NGN',
    reference: (new Date()).getTime().toString(),
  });
  
  // Optional: You can add a function to get all payment configs if needed
  export const getPaymentConfigs = (amount, customer) => ({
    flutterwave: getFlutterwaveConfig(amount, customer),
    paystack: getPaystackConfig(amount, customer)
  });