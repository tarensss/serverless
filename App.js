// App.js
import React, { useState } from 'react';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import StripeCheckout from 'react-stripe-checkout';

firebase.initializeApp({
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
});

const db = firebase.firestore();

const App = () => {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    await firebase.auth().signInWithPopup(provider);
    setUser(firebase.auth().currentUser);
  };

  const handleSignOut = async () => {
    await firebase.auth().signOut();
    setUser(null);
  };

  const handleLoadProducts = async () => {
    setLoading(true);
    const productsRef = db.collection('products');
    const snapshot = await productsRef.get();
    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setProducts(products);
    setLoading(false);
  };

  const handleToken = async token => {
    const amount = products.reduce((total, product) => total + product.price, 0);
    const response = await fetch('/charge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, amount, currency: 'usd', description: 'Test payment' })
    });
    const data = await response.json();
    console.log(data);
  };

  return (
    <div>
      {user ? (
        <div>
          <button onClick={handleSignOut}>Sign Out</button>
          <h1>Welcome, {user.displayName}</h1>
          <button onClick={handleLoadProducts} disabled={loading}>
            {loading ? 'Loading...' : 'Load Products'}
          </button>
          <ul>
            {products.map(product => (
              <li key={product.id}>
                <h2>{product.name}</h2>
                <p>${product.price}</p>
                <StripeCheckout
                  stripeKey={process.env.REACT_APP_STRIPE_PUBLIC_KEY}
                  token={handleToken}
                  amount={product.price * 100}
                  currency="USD"
                  name={product.name}
                  description={product.description}
                  panelLabel={`Pay $${product.price}`}
                />
             
