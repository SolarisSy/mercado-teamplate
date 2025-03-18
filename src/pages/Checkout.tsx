import { HiTrash as TrashIcon } from "react-icons/hi2";
import { Button } from "../components";
import { useAppDispatch, useAppSelector } from "../hooks";
import { removeProductFromTheCart } from "../features/cart/cartSlice";
import customFetch from "../axios/custom";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { checkCheckoutFormData } from "../utils/checkCheckoutFormData";
import { useState } from "react";

/*
address: "Marka Markovic 22"
apartment: "132"
cardNumber: "21313"
city: "Belgrade"
company: "Bojan Cesnak"
country: "United States"
cvc: "122"
emailAddress: "kuzma@gmail.com"
expirationDate: "12312"
firstName: "Aca22"
lastName: "Kuzma"
nameOnCard: "Aca JK"
paymentType: "on"
phone: "06123123132"
postalCode: "11080"
region: "Serbia"
*/

const paymentMethods = [
  { id: "credit-card", title: "Credit card" },
  { id: "paypal", title: "PayPal" },
  { id: "etransfer", title: "eTransfer" },
];

const Checkout = () => {
  const { productsInCart, subtotal } = useAppSelector((state) => state.cart);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    { id: 1, name: 'Contact' },
    { id: 2, name: 'Shipping' },
    { id: 3, name: 'Payment' }
  ];

  const handleCheckoutSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    const checkoutData = {
      data,
      products: productsInCart,
      subtotal: subtotal,
    };

    if (!checkCheckoutFormData(checkoutData)) return;

    let response;
    if (JSON.parse(localStorage.getItem("user") || "{}").email) {
      response = await customFetch.post("/orders", {
        ...checkoutData,
        user: {
          email: JSON.parse(localStorage.getItem("user") || "{}").email,
          id: JSON.parse(localStorage.getItem("user") || "{}").id,
        },
        orderStatus: "Processing",
        orderDate: new Date().toISOString(),
      });
    } else {
      response = await customFetch.post("/orders", {
        ...checkoutData,
        orderStatus: "Processing",
        orderDate: new Date().toLocaleDateString(),
      });
    }

    if (response.status === 201) {
      toast.success("Order has been placed successfully");
      navigate("/order-confirmation");
    } else {
      toast.error("Something went wrong, please try again later");
    }
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8 sm:py-16">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Checkout</h1>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-4">
          {steps.map((step) => (
            <div key={step.id} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === step.id 
                  ? 'bg-secondaryBrown text-white' 
                  : currentStep > step.id 
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {currentStep > step.id ? '✓' : step.id}
              </div>
              <span className="ml-2 text-sm hidden sm:block">{step.name}</span>
              {step.id !== steps.length && (
                <div className="w-12 h-1 mx-2 bg-gray-200">
                  <div className={`h-full ${currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'}`} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleCheckoutSubmit} className="space-y-8">
        {/* Step 1: Contact Information */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondaryBrown focus:ring-secondaryBrown"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondaryBrown focus:ring-secondaryBrown"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="emailAddress" className="block text-sm font-medium text-gray-700">Email Address</label>
                <input
                  type="email"
                  id="emailAddress"
                  name="emailAddress"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondaryBrown focus:ring-secondaryBrown"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondaryBrown focus:ring-secondaryBrown"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Shipping Information */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">Street Address</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondaryBrown focus:ring-secondaryBrown"
                />
              </div>
              <div>
                <label htmlFor="apartment" className="block text-sm font-medium text-gray-700">Apartment, suite, etc.</label>
                <input
                  type="text"
                  id="apartment"
                  name="apartment"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondaryBrown focus:ring-secondaryBrown"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondaryBrown focus:ring-secondaryBrown"
                  />
                </div>
                <div>
                  <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">Postal Code</label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondaryBrown focus:ring-secondaryBrown"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Payment Information */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label htmlFor="nameOnCard" className="block text-sm font-medium text-gray-700">Name on Card</label>
                <input
                  type="text"
                  id="nameOnCard"
                  name="nameOnCard"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondaryBrown focus:ring-secondaryBrown"
                />
              </div>
              <div>
                <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">Card Number</label>
                <input
                  type="text"
                  id="cardNumber"
                  name="cardNumber"
                  required
                  pattern="[0-9]{16}"
                  maxLength={16}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondaryBrown focus:ring-secondaryBrown"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="expirationDate" className="block text-sm font-medium text-gray-700">Expiration Date</label>
                  <input
                    type="text"
                    id="expirationDate"
                    name="expirationDate"
                    required
                    placeholder="MM/YY"
                    pattern="[0-9]{2}/[0-9]{2}"
                    maxLength={5}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondaryBrown focus:ring-secondaryBrown"
                  />
                </div>
                <div>
                  <label htmlFor="cvc" className="block text-sm font-medium text-gray-700">CVC</label>
                  <input
                    type="text"
                    id="cvc"
                    name="cvc"
                    required
                    pattern="[0-9]{3,4}"
                    maxLength={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondaryBrown focus:ring-secondaryBrown"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-6 py-3 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition duration-300 touch-manipulation"
            >
              Previous
            </button>
          )}
          {currentStep < steps.length ? (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep + 1)}
              className="ml-auto px-6 py-3 bg-secondaryBrown text-white rounded-md hover:bg-opacity-90 transition duration-300 touch-manipulation"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              className="ml-auto px-6 py-3 bg-secondaryBrown text-white rounded-md hover:bg-opacity-90 transition duration-300 touch-manipulation"
            >
              Place Order
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default Checkout;
