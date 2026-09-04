import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from "react-router";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./providers/AuthProvider";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import ForgotPassword from "./pages/AuthPages/ForgotPassword";
import ResetPassword from "./pages/AuthPages/ResetPassword";
import NotFound from "./pages/OtherPage/NotFound";
import UnauthorizedPage from "./pages/OtherPage/UnauthorizedPage";
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
import RecentTransactionsPage from "./pages/Dashboard/RecentTransactionsPage";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./api/queryClient";
import AddCategory from "./pages/Categories/AddCategory";
import EditCategory from "./pages/Categories/EditCategory";
import UnitManagementPage from "./pages/Units/UnitManagementPage";
import AddUnit from "./pages/Units/AddUnit";
import EditUnit from "./pages/Units/EditUnit";
import AddSupplier from "./pages/Suppliers/AddSupplier";
import EditSupplier from "./pages/Suppliers/EditSupplier";
import CustomerGroupManagementPage from "./pages/CustomerGroups/CustomerGroupManagementPage";
import AddCustomerGroup from "./pages/CustomerGroups/AddCustomerGroup";
import EditCustomerGroup from "./pages/CustomerGroups/EditCustomerGroup";
import AddCustomer from "./pages/Customers/AddCustomer";
import EditCustomer from "./pages/Customers/EditCustomer";
import CustomerGroupPriceList from "./pages/CustomerGroupPrices/CustomerGroupPriceList";
import AddCustomerGroupPrice from "./pages/CustomerGroupPrices/AddCustomerGroupPrice";
import EditCustomerGroupPrice from "./pages/CustomerGroupPrices/EditCustomerGroupPrice";
import AddBrand from "./pages/Brands/AddBrand";
import EditBrand from "./pages/Brands/EditBrand";
import ProductManagementPage from "./pages/Products/ProductManagementPage";
import AddProduct from "./pages/Products/AddProduct";
import EditProduct from "./pages/Products/EditProduct";
import UnitConversionList from "./pages/UnitConversions/UnitConversionList";
import AddUnitConversion from "./pages/UnitConversions/AddUnitConversion";
import EditUnitConversion from "./pages/UnitConversions/EditUnitConversion";
import AddAtribute from "./pages/Atributes/AddAtribute";
import EditAtribute from "./pages/Atributes/EditAtribute";
import ProductVariantList from "./pages/ProductVariants/ProductVariantList";
import AddProductVariant from "./pages/ProductVariants/AddProductVariant";
import EditProductVariant from "./pages/ProductVariants/EditProductVariant";
import ProductPriceList from "./pages/ProductPrices/ProductPriceList";
import AddProductPrice from "./pages/ProductPrices/AddProductPrice";
import EditProductPrice from "./pages/ProductPrices/EditProductPrice";
import AddPriceTier from "./pages/PriceTiers/AddPriceTier";
import EditPriceTier from "./pages/PriceTiers/EditPriceTier";
import PromotionManagementPage from "./pages/Promotions/PromotionManagementPage";
import AddPromotion from "./pages/Promotions/AddPromotion";
import EditPromotion from "./pages/Promotions/EditPromotion";
import PromotionConditionList from "./pages/PromotionConditions/PromotionConditionList";
import AddPromotionCondition from "./pages/PromotionConditions/AddPromotionCondition";
import EditPromotionCondition from "./pages/PromotionConditions/EditPromotionCondition";
import PromotionActionList from "./pages/PromotionActions/PromotionActionList";
import AddPromotionAction from "./pages/PromotionActions/AddPromotionAction";
import EditPromotionAction from "./pages/PromotionActions/EditPromotionAction";
import PromotionProductList from "./pages/PromotionProducts/PromotionProductList";
import AddPromotionProduct from "./pages/PromotionProducts/AddPromotionProduct";
import EditPromotionProduct from "./pages/PromotionProducts/EditPromotionProduct";
import LocationList from "./pages/Locations/LocationList";
import AddLocation from "./pages/Locations/AddLocation";
import EditLocation from "./pages/Locations/EditLocation";
import BusinessList from "./pages/Businesses/BusinessList";
import AddBusiness from "./pages/Businesses/AddBusiness";
import EditBusiness from "./pages/Businesses/EditBusiness";
import VerifyEmail from "./pages/Auth/VerifyEmail";
import RoleList from "./pages/Roles/RoleList";
import PermissionList from "./pages/Roles/PermissionList";
import SubscriptionPlanForm from "./pages/SubscriptionPlans/SubscriptionPlanForm";
import InventoryList from "./pages/Inventory/InventoryList";
import InventoryOrphanedList from "./pages/Inventory/InventoryOrphanedList";
import InventoryDetail from "./pages/Inventory/InventoryDetail";
import InventoryMovements from "./pages/Inventory/InventoryMovements";
import InventoryAdjustment from "./pages/Inventory/InventoryAdjustment";
import POSPage from "./pages/POS/POSPage";
import OpenShiftPage from "./pages/POS/OpenShiftPage";
import POSPaymentPage from "./pages/POS/POSPaymentPage";
import FaceRegistrationPage from "./pages/absensi/FaceRegistrationPage";
import AttendanceScannerPage from "./pages/absensi/AttendanceScannerPage";
import AttendanceHistoryPage from "./pages/absensi/AttendanceHistoryPage";
import PricingPage from "./pages/Subscription/PricingPage";
import BillingHistoryPage from "./pages/Subscription/BillingHistoryPage";
import CheckoutPlanPage from "./pages/Subscription/CheckoutPlanPage";
import PaymentMethodListPage from "./pages/PaymentMethod/PaymentMethodListPage";
import PaymentMethodFormPage from "./pages/PaymentMethod/PaymentMethodFormPage";
import AdminSubscriptionVerificationPage from "./pages/Subscription/AdminSubscriptionVerificationPage";
import UserList from "./pages/Users/UserList";
import AddUser from "./pages/Users/AddUser";
import EditUser from "./pages/Users/EditUser";
import ScheduleSettingsPage from "./pages/scheduling/ScheduleSettingsPage";
import ScheduleCalendarPage from "./pages/scheduling/ScheduleCalendarPage";
import ScheduleGeneratePage from "./pages/scheduling/ScheduleGeneratePage";
import ScheduleBatchDetailPage from "./pages/scheduling/ScheduleBatchDetailPage";
import ScheduleBatchListPage from "./pages/scheduling/ScheduleBatchListPage";
import ProductSalesByLocationReport from "./pages/Reports/ProductSalesByLocationReport";
import AttendanceReportPage from "./pages/Reports/AttendanceReportPage";
import TaxListPage from "./pages/Taxes/TaxListPage";
import BusinessInactivePage from "./pages/Businesses/BusinessInactivePage";
import ProtectedRoute from "./components/auth/ProtectedRoute";

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
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/reset-password/:token/:email" element={<ResetPassword />} />
            <Route
              path="/business-inactive"
              element={
                <ProtectedRoute>
                  <BusinessInactivePage />
                </ProtectedRoute>
              }
            />

            {/* Dashboard Layout */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index path="/dashboard" element={<Home />} />
              <Route path="/403" element={<UnauthorizedPage />} />
              <Route
                element={
                  <ProtectedRoute allowedPermissions={["dashboard.view"]}>
                    <Outlet />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard/recent-transactions" element={<RecentTransactionsPage />} />
              </Route>

              {/* Master Data Permissions */}
              <Route element={<ProtectedRoute allowedPermissions={["category.view"]} requireActiveSubscription={true}><Outlet /></ProtectedRoute>}>
                <Route path="/categories/create" element={<AddCategory />} />
                <Route path="/categories/edit/:id" element={<EditCategory />} />
              </Route>

              <Route element={<ProtectedRoute allowedPermissions={["unit.view", "unit_conversion.view"]} requireActiveSubscription={true}><Outlet /></ProtectedRoute>}>
                <Route path="/units" element={<UnitManagementPage />} />
              </Route>

              <Route element={<ProtectedRoute allowedPermissions={["unit.view"]} requireActiveSubscription={true}><Outlet /></ProtectedRoute>}>
                <Route path="/units/create" element={<AddUnit />} />
                <Route path="/units/edit/:id" element={<EditUnit />} />
              </Route>

              <Route element={<ProtectedRoute allowedPermissions={["unit_conversion.view"]} requireActiveSubscription={true}><Outlet /></ProtectedRoute>}>
                <Route path="/unit-conversions" element={<UnitConversionList />} />
                <Route path="/unit-conversions/create" element={<AddUnitConversion />} />
                <Route path="/unit-conversions/edit/:id" element={<EditUnitConversion />} />
              </Route>

              <Route element={<ProtectedRoute allowedPermissions={["supplier.view"]} requireActiveSubscription={true}><Outlet /></ProtectedRoute>}>
                <Route path="/suppliers/create" element={<AddSupplier />} />
                <Route path="/suppliers/edit/:id" element={<EditSupplier />} />
              </Route>

              <Route element={<ProtectedRoute allowedPermissions={["customer_group.view", "customer_group_price.view", "customer.view"]} requireActiveSubscription={true}><Outlet /></ProtectedRoute>}>
                <Route path="/customer-groups" element={<CustomerGroupManagementPage />} />
                <Route path="/customers" element={<CustomerGroupManagementPage />} />
              </Route>

              <Route element={<ProtectedRoute allowedPermissions={["customer_group.view"]} requireActiveSubscription={true}><Outlet /></ProtectedRoute>}>
                <Route path="/customer-groups/create" element={<AddCustomerGroup />} />
                <Route path="/customer-groups/edit/:id" element={<EditCustomerGroup />} />
              </Route>

              <Route element={<ProtectedRoute allowedPermissions={["customer.create", "customer.view"]} requireActiveSubscription={true}><Outlet /></ProtectedRoute>}>
                <Route path="/customers/create" element={<AddCustomer />} />
              </Route>

              <Route element={<ProtectedRoute allowedPermissions={["customer.update", "customer.view"]} requireActiveSubscription={true}><Outlet /></ProtectedRoute>}>
                <Route path="/customers/edit/:id" element={<EditCustomer />} />
              </Route>

              <Route element={<ProtectedRoute allowedPermissions={["customer_group_price.view"]} requireActiveSubscription={true}><Outlet /></ProtectedRoute>}>
                <Route path="/customer-group-prices" element={<CustomerGroupPriceList />} />
                <Route path="/customer-group-prices/create" element={<AddCustomerGroupPrice />} />
                <Route path="/customer-group-prices/edit/:id" element={<EditCustomerGroupPrice />} />
              </Route>

              <Route element={<ProtectedRoute allowedPermissions={["location.view"]} requireActiveSubscription={true}><Outlet /></ProtectedRoute>}>
                <Route path="/locations" element={<LocationList />} />
                <Route path="/locations/create" element={<AddLocation />} />
                <Route path="/locations/edit/:id" element={<EditLocation />} />
              </Route>

              <Route element={<ProtectedRoute allowedPermissions={["inventory.view"]} requireActiveSubscription={true}><Outlet /></ProtectedRoute>}>
                <Route path="/inventory" element={<InventoryList />} />
                <Route path="/inventory/orphaned" element={<InventoryOrphanedList />} />
                <Route path="/inventory/movements" element={<InventoryMovements />} />
                <Route path="/inventory/adjustment" element={<InventoryAdjustment />} />
                <Route path="/inventory/:variantId" element={<InventoryDetail />} />
              </Route>

              <Route element={<ProtectedRoute allowedPermissions={["brand.view"]} requireActiveSubscription={true}><Outlet /></ProtectedRoute>}>
                <Route path="/brands/create" element={<AddBrand />} />
                <Route path="/brands/edit/:id" element={<EditBrand />} />
              </Route>

              <Route element={<ProtectedRoute allowedPermissions={["product.view", "product_variant.view", "product_price.view", "price_tier.view", "category.view", "supplier.view", "brand.view", "atribute.view"]} requireActiveSubscription={true}><Outlet /></ProtectedRoute>}>
                <Route path="/products" element={<ProductManagementPage />} />
              </Route>

              <Route element={<ProtectedRoute allowedPermissions={["product.view"]} requireActiveSubscription={true}><Outlet /></ProtectedRoute>}>
                <Route path="/products/create" element={<AddProduct />} />
                <Route path="/products/edit/:id" element={<EditProduct />} />
              </Route>

              <Route element={<ProtectedRoute allowedPermissions={["product_variant.view"]} requireActiveSubscription={true}><Outlet /></ProtectedRoute>}>
                <Route path="/product-variants" element={<ProductVariantList />} />
                <Route path="/product-variants/create" element={<AddProductVariant />} />
                <Route path="/product-variants/edit/:id" element={<EditProductVariant />} />
              </Route>

              <Route element={<ProtectedRoute allowedPermissions={["product_price.view"]} requireActiveSubscription={true}><Outlet /></ProtectedRoute>}>
                <Route path="/product-prices" element={<ProductPriceList />} />
                <Route path="/product-prices/create" element={<AddProductPrice />} />
                <Route path="/product-prices/edit/:id" element={<EditProductPrice />} />
              </Route>

              <Route element={<ProtectedRoute allowedPermissions={["price_tier.view"]} requireActiveSubscription={true}><Outlet /></ProtectedRoute>}>
                <Route path="/price-tiers/create" element={<AddPriceTier />} />
                <Route path="/price-tiers/edit/:id" element={<EditPriceTier />} />
              </Route>

              <Route element={<ProtectedRoute allowedPermissions={["promotion.view", "promotion_condition.view", "promotion_action.view", "promotion_product.view"]} requireActiveSubscription={true}><Outlet /></ProtectedRoute>}>
                <Route path="/promotions" element={<PromotionManagementPage />} />
              </Route>

              <Route element={<ProtectedRoute allowedPermissions={["promotion.view"]} requireActiveSubscription={true}><Outlet /></ProtectedRoute>}>
                <Route path="/promotions/create" element={<AddPromotion />} />
                <Route path="/promotions/edit/:id" element={<EditPromotion />} />
              </Route>

              <Route element={<ProtectedRoute allowedPermissions={["promotion_condition.view"]} requireActiveSubscription={true}><Outlet /></ProtectedRoute>}>
                <Route path="/promotion-conditions" element={<PromotionConditionList />} />
                <Route path="/promotion-conditions/create" element={<AddPromotionCondition />} />
                <Route path="/promotion-conditions/edit/:id" element={<EditPromotionCondition />} />
              </Route>

              <Route element={<ProtectedRoute allowedPermissions={["promotion_action.view"]} requireActiveSubscription={true}><Outlet /></ProtectedRoute>}>
                <Route path="/promotion-actions" element={<PromotionActionList />} />
                <Route path="/promotion-actions/create" element={<AddPromotionAction />} />
                <Route path="/promotion-actions/edit/:id" element={<EditPromotionAction />} />
              </Route>

              <Route element={<ProtectedRoute allowedPermissions={["promotion_product.view"]} requireActiveSubscription={true}><Outlet /></ProtectedRoute>}>
                <Route path="/promotion-products" element={<PromotionProductList />} />
                <Route path="/promotion-products/create" element={<AddPromotionProduct />} />
                <Route path="/promotion-products/edit/:id" element={<EditPromotionProduct />} />
              </Route>

              <Route element={<ProtectedRoute allowedPermissions={["atribute.view"]} requireActiveSubscription={true}><Outlet /></ProtectedRoute>}>
                <Route path="/atributes/create" element={<AddAtribute />} />
                <Route path="/atributes/edit/:id" element={<EditAtribute />} />
              </Route>

              {/* Work Scheduling */}
              <Route element={<ProtectedRoute allowedPermissions={["jadwal.view", "jadwal.create", "shift.view", "holiday.view", "rotation.view"]} requireActiveSubscription={true}><Outlet /></ProtectedRoute>}>
                <Route path="/scheduling" element={<ScheduleCalendarPage />} />
                <Route path="/scheduling/settings" element={<ScheduleSettingsPage />} />
                <Route path="/scheduling/shifts" element={<Navigate to="/scheduling/settings?tab=shifts" replace />} />
                <Route path="/scheduling/holidays" element={<Navigate to="/scheduling/settings?tab=holidays" replace />} />
                <Route path="/scheduling/rotation-patterns" element={<Navigate to="/scheduling/settings?tab=rotation" replace />} />
                <Route path="/scheduling/generate" element={<ScheduleGeneratePage />} />
                <Route path="/scheduling/batches" element={<ScheduleBatchListPage />} />
                <Route path="/scheduling/batches/:id" element={<ScheduleBatchDetailPage />} />
              </Route>

              <Route element={<ProtectedRoute allowedPermissions={["pos.view", "transaction.view"]} requireActiveSubscription={true}><Outlet /></ProtectedRoute>}>

                <Route path="/pos" element={<POSPage />} />
                <Route path="/pos/open-shift" element={<OpenShiftPage />} />
                <Route path="/pos/payment" element={<POSPaymentPage />} />
                <Route path="/transactions" element={<RecentTransactionsPage />} />
              </Route>

              {/* Reports */}
              <Route element={<ProtectedRoute allowedPermissions={["report.sales_by_location.view"]} requireActiveSubscription={true}><Outlet /></ProtectedRoute>}>
                <Route path="/reports/sales-by-location" element={<ProductSalesByLocationReport />} />
              </Route>
              <Route element={<ProtectedRoute allowedPermissions={["report.attendance.view"]} requireActiveSubscription={true}><Outlet /></ProtectedRoute>}>
                <Route path="/reports/attendance" element={<AttendanceReportPage />} />
              </Route>

              <Route element={<ProtectedRoute allowedPermissions={["absensi.enroll"]} requireActiveSubscription={true}><Outlet /></ProtectedRoute>}>
                <Route path="/absensi/register" element={<FaceRegistrationPage />} />
              </Route>
              <Route element={<ProtectedRoute allowedPermissions={["absensi.checkin", "absensi.checkout"]} requireActiveSubscription={true}><Outlet /></ProtectedRoute>}>
                <Route path="/absensi/scanner" element={<AttendanceScannerPage />} />
              </Route>
              <Route element={<ProtectedRoute allowedPermissions={["absensi.view"]} requireActiveSubscription={true}><Outlet /></ProtectedRoute>}>
                <Route path="/absensi/history" element={<AttendanceHistoryPage />} />
              </Route>

              {/* Roles, Permissions & Administration */}
              <Route element={<ProtectedRoute allowedPermissions={["tax.view", "view_taxes"]} requireActiveSubscription={true}><Outlet /></ProtectedRoute>}>
                <Route path="/taxes" element={<TaxListPage />} />
              </Route>
              <Route element={<ProtectedRoute allowedPermissions={["role.view"]}><Outlet /></ProtectedRoute>}>
                <Route path="/roles" element={<RoleList />} />
              </Route>
              <Route element={<ProtectedRoute allowedPermissions={["permission.view"]}><Outlet /></ProtectedRoute>}>
                <Route path="/permissions" element={<PermissionList />} />
              </Route>
              <Route element={<ProtectedRoute allowedPermissions={["subscription_plan.view"]}><Outlet /></ProtectedRoute>}>
                <Route path="/subscriptions-plans" element={<SubscriptionPlanForm />} />
              </Route>
              <Route element={<ProtectedRoute allowedPermissions={["business.view"]}><Outlet /></ProtectedRoute>}>
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/pricing/checkout/:planId" element={<CheckoutPlanPage />} />
                <Route path="/billing" element={<BillingHistoryPage />} />
                <Route path="/businesses" element={<BusinessList />} />
                <Route path="/businesses/create" element={<AddBusiness />} />
                <Route path="/businesses/edit/:id" element={<EditBusiness />} />
                <Route element={<ProtectedRoute allowedPermissions={["payment_method.view"]} requireActiveSubscription={true}><Outlet /></ProtectedRoute>}>
                  <Route path="/payment-methods" element={<PaymentMethodListPage />} />
                  <Route path="/payment-methods/create" element={<PaymentMethodFormPage />} />
                  <Route path="/payment-methods/edit/:id" element={<PaymentMethodFormPage />} />
                </Route>
                <Route element={<ProtectedRoute allowedPermissions={["user.view"]}><Outlet /></ProtectedRoute>}>
                  <Route path="/users" element={<UserList />} />
                  <Route path="/users/create" element={<AddUser />} />
                  <Route path="/users/edit/:id" element={<EditUser />} />
                </Route>
                <Route element={<ProtectedRoute allowedRoles={["admin"]}><Outlet /></ProtectedRoute>}>
                  <Route path="/subscriptions/verification" element={<AdminSubscriptionVerificationPage />} />
                </Route>
              </Route>

              <Route element={<ProtectedRoute allowedRoles={[]}><Outlet /></ProtectedRoute>}>
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

              {/* Others Page (All Auth Users) */}
              <Route path="/profile" element={<UserProfiles />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/blank" element={<Blank />} />
            </Route>

            {/* Fallback Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}
