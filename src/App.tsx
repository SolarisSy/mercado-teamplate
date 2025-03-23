import { RouterProvider, createBrowserRouter } from "react-router-dom";
import {
  Cart,
  Checkout,
  HomeLayout,
  Landing,
  Login,
  OrderConfirmation,
  OrderHistory,
  Register,
  Search,
  Shop,
  SingleOrderHistory,
  SingleProduct,
  UserProfile,
} from "./pages";
import { checkoutAction, searchAction } from "./actions/index";
import { shopCategoryLoader } from "./pages/Shop";
import { loader as orderHistoryLoader } from "./pages/OrderHistory";
import { loader as singleOrderLoader } from "./pages/SingleOrderHistory";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import { CategoryProvider } from "./context/CategoryContext";
import { TrackingProvider } from "./context/TrackingContext";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import DashboardHome from "./pages/admin/DashboardHome";
import ProductsList from "./pages/admin/ProductsList";
import ProductForm from "./pages/admin/ProductForm";
import ProductView from "./pages/admin/ProductView";
import CategoriesManager from "./pages/admin/CategoriesManager";
import CarouselManager from "./pages/admin/CarouselManager";
import TrackingManager from "./pages/admin/TrackingManager";
import ProductImporter from "./pages/admin/ProductImporter";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from 'react-hot-toast';
import { useEffect } from "react";
import { preloadCommonImages } from "./utils/imageUtils";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomeLayout />,
    children: [
      {
        index: true,
        element: <Landing />,
      },
      {
        path: "shop",
        element: <Shop />,
      },
      {
        path: "shop/:category",
        element: <Shop />,
        loader: shopCategoryLoader,
      },
      {
        path: "product/:id",
        element: <SingleProduct />,
      },
      {
        path: "cart",
        element: <Cart />,
      },
      {
        path: "checkout",
        element: (
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        ),
        action: checkoutAction,
      },
      {
        path: "search",
        action: searchAction,
        element: <Search />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
      {
        path: "order-confirmation",
        element: (
          <ProtectedRoute>
            <OrderConfirmation />
          </ProtectedRoute>
        ),
      },
      {
        path: "user-profile",
        element: (
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        ),
      },
      {
        path: "order-history",
        element: (
          <ProtectedRoute>
            <OrderHistory />
          </ProtectedRoute>
        ),
        loader: orderHistoryLoader,
      },
      {
        path: "order-history/:id",
        element: (
          <ProtectedRoute>
            <SingleOrderHistory />
          </ProtectedRoute>
        ),
        loader: singleOrderLoader
      },
    ],
  },
  // Admin Routes
  {
    path: "/admin/login",
    element: <AdminLogin />,
  },
  {
    path: "/admin",
    element: (
      <AdminProtectedRoute>
        <AdminDashboard />
      </AdminProtectedRoute>
    ),
    children: [
      {
        path: "dashboard",
        element: <DashboardHome />,
      },
      {
        path: "products",
        element: <ProductsList />,
      },
      {
        path: "products/new",
        element: <ProductForm />,
      },
      {
        path: "products/edit/:id",
        element: <ProductForm />,
      },
      {
        path: "products/view/:id",
        element: <ProductView />,
      },
      {
        path: "categories",
        element: <CategoriesManager />,
      },
      {
        path: "carousel",
        element: <CarouselManager />,
      },
      {
        path: "tracking",
        element: <TrackingManager />,
      },
      {
        path: "importer",
        element: <ProductImporter />,
      },
    ],
  },
]);

function App() {
  useEffect(() => {
    // Pré-carregar imagens comuns no início da aplicação
    preloadCommonImages();
  }, []);

  return (
    <AuthProvider>
      <AdminAuthProvider>
        <CategoryProvider>
          <TrackingProvider>
            <Toaster position="top-center" />
            <RouterProvider router={router} />
          </TrackingProvider>
        </CategoryProvider>
      </AdminAuthProvider>
    </AuthProvider>
  );
}

export default App;
