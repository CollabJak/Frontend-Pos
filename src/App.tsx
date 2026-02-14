import { BrowserRouter as Router, Routes, Route } from "react-router";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./providers/AuthProvider";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import CategoryList from "./pages/Categories/CategoryList";
import AddCategory from "./pages/Categories/AddCategory";
import EditCategory from "./pages/Categories/EditCategory";
import UnitList from "./pages/Units/UnitList";
import AddUnit from "./pages/Units/AddUnit";
import EditUnit from "./pages/Units/EditUnit";
import SupplierList from "./pages/Suppliers/SupllierList";
import AddSupplier from "./pages/Suppliers/AddSupplier";
import EditSupplier from "./pages/Suppliers/EditSupplier";
import BrandList from "./pages/Brands/BrandList";
import AddBrand from "./pages/Brands/AddBrand";
import EditBrand from "./pages/Brands/EditBrand";
import ProductList from "./pages/Products/ProductList";
import AddProduct from "./pages/Products/AddProduct";
import EditProduct from "./pages/Products/EditProduct";
import UnitConversionList from "./pages/UnitConversions/UnitConversionList";
import AddUnitConversion from "./pages/UnitConversions/AddUnitConversion";
import EditUnitConversion from "./pages/UnitConversions/EditUnitConversion";
import AtributeList from "./pages/Atributes/AtributeList";
import AddAtribute from "./pages/Atributes/AddAtribute";
import EditAtribute from "./pages/Atributes/EditAtribute";
import ProductVariantList from "./pages/ProductVariants/ProductVariantList";
import AddProductVariant from "./pages/ProductVariants/AddProductVariant";
import EditProductVariant from "./pages/ProductVariants/EditProductVariant";
import ProductPriceList from "./pages/ProductPrices/ProductPriceList";
import AddProductPrice from "./pages/ProductPrices/AddProductPrice";
import EditProductPrice from "./pages/ProductPrices/EditProductPrice";
import LocationList from "./pages/Locations/LocationList";
import AddLocation from "./pages/Locations/AddLocation";
import EditLocation from "./pages/Locations/EditLocation";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="bottom-right" reverseOrder={false} />
      <Router>
        <AuthProvider>
          <ScrollToTop />
          <Routes>
            {/* Auth Layout */}
            <Route path="/" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />

            {/* Dashboard Layout */}
            <Route element={<AppLayout />}>
              <Route index path="/dashboard" element={<Home />} />

              <Route path="/categories" element={<CategoryList />} />
              <Route path="/categories/create" element={<AddCategory />} />
              <Route path="/categories/edit/:id" element={<EditCategory />} />

              <Route path="/units" element={<UnitList />} />
              <Route path="/units/create" element={<AddUnit />} />
              <Route path="/units/edit/:id" element={<EditUnit />} />

              <Route path="/suppliers" element={<SupplierList />} />
              <Route path="/suppliers/create" element={<AddSupplier />} />
              <Route path="/suppliers/edit/:id" element={<EditSupplier />} />

              <Route path="/locations" element={<LocationList />} />
              <Route path="/locations/create" element={<AddLocation />} />
              <Route path="/locations/edit/:id" element={<EditLocation />} />
              
              <Route path="/brands" element={<BrandList />} />
              <Route path="/brands/create" element={<AddBrand />} />
              <Route path="/brands/edit/:id" element={<EditBrand />} />

              <Route path="/products" element={<ProductList />} />
              <Route path="/products/create" element={<AddProduct />} />
              <Route path="/products/edit/:id" element={<EditProduct />} />
              <Route path="/product-variants" element={<ProductVariantList />} />
              <Route path="/product-variants/create" element={<AddProductVariant />} />
              <Route path="/product-variants/edit/:id" element={<EditProductVariant />} />
              <Route path="/product-prices" element={<ProductPriceList />} />
              <Route path="/product-prices/create" element={<AddProductPrice />} />
              <Route path="/product-prices/edit/:id" element={<EditProductPrice />} />

              <Route path="/unit-conversions" element={<UnitConversionList />} />
              <Route path="/unit-conversions/create" element={<AddUnitConversion />} />
              <Route path="/unit-conversions/edit/:id" element={<EditUnitConversion />} />

              <Route path="/atributes" element={<AtributeList />} />
              <Route path="/atributes/create" element={<AddAtribute />} />
              <Route path="/atributes/edit/:id" element={<EditAtribute />} />

              {/* Others Page */}
              <Route path="/profile" element={<UserProfiles />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/blank" element={<Blank />} />

              {/* Forms */}
              <Route path="/form-elements" element={<FormElements />} />

              {/* Tables */}
              <Route path="/basic-tables" element={<BasicTables />} />

              {/* Ui Elements */}
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/avatars" element={<Avatars />} />
              <Route path="/badge" element={<Badges />} />
              <Route path="/buttons" element={<Buttons />} />
              <Route path="/images" element={<Images />} />
              <Route path="/videos" element={<Videos />} />

              {/* Charts */}
              <Route path="/line-chart" element={<LineChart />} />
              <Route path="/bar-chart" element={<BarChart />} />
            </Route>

            {/* Fallback Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}
