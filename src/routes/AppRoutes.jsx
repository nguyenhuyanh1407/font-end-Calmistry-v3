import { Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";
import { AnimatePresence } from "framer-motion";
import PrivateRoute from "./PrivateRoute";

// Client pages
import Home from "../pages/client/Home";
import Blog from "../pages/client/Blog";
import CreateBlog from "../pages/client/CreateBlog";
import BlogApproval from "../pages/client/BlogApproval";
import BlogDetail from "../pages/client/BlogDetail";
import EditBlog from "../pages/client/EditBlog";
import Journal from "../pages/client/Journal";
import SleepManagement from "../pages/client/SleepManagement";
import UserDashboard from "../pages/client/UserDashboard";
import ShareStories from "../pages/client/ShareStories";
import GroupChat from "../pages/client/GroupChat";
import Checkout from "../pages/client/Checkout";
import FuiedsQuiz from "../pages/client/FuiedsQuiz";

// Author pages
import AuthorDashboard from "../pages/author/AuthorDashboard";

// Expert pages
import ExpertDashboardPro from "../pages/expert/ExpertDashboardPro";

// Admin pages
import AccountManagement from "../pages/admin/AccountManagement";

// Auth pages
import Login from "../pages/auth/Login";

// AI Chat
import AiPersonalizedChat from "../pages/client/AiPersonalizedChat";

// Workshops
import WorkshopList from "../pages/client/WorkshopList";
import WorkshopManagement from "../pages/admin/WorkshopManagement";

// Common pages
import NotFound from "../pages/common/NotFound";
import Onboarding from "../pages/client/Onboarding";

import AIChatButton from "../components/features/chat/AIChatButton";

function AppRoutes() {
  return (
    <div style={{ position: "relative" }}>
      {/* Luon noi len tren moi pages */}
      <AIChatButton />

      <AnimatePresence mode="wait">
        <Routes>
          {/* MAIN LAYOUT */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:id" element={<BlogDetail />} />

            {/* Create Blog - Protected */}
            <Route path="/blog/create" element={
              <PrivateRoute>
                <CreateBlog />
              </PrivateRoute>
            } />

            {/* Edit Blog - Protected */}
            <Route path="/blog/edit/:id" element={
              <PrivateRoute>
                <EditBlog />
              </PrivateRoute>
            } />
            {/* Approve Blog - Protected (Ideally should verify role in PrivateRoute or component) */}
            <Route path="/blog/approval" element={
              <PrivateRoute>
                <BlogApproval />
              </PrivateRoute>
            } />
            {/* Protected Route - Requires Login */}
            <Route path="/journal" element={
              <PrivateRoute>
                <Journal />
              </PrivateRoute>
            } />
            <Route path="/login" element={<Login />} />
            <Route path="/sleepManagement" element={<SleepManagement />} />
            <Route path="/userDashboard" element={<UserDashboard />} />
            <Route path="/authorDashboard" element={<AuthorDashboard />} />
            <Route path="/expertDashboard" element={<ExpertDashboardPro />} />

            <Route path="/shareStories" element={<ShareStories />} />
            <Route path="/group-chat" element={<GroupChat />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/admin/accounts" element={<AccountManagement />} />

            {/* Admin Route - Account Management */}
            {/* Admin Route - Account Management
 <Route path="/admin/accounts" element={
              <PrivateRoute>
                <AccountManagement />
              </PrivateRoute>
            } /> */}

            {/* FUIEDS Quiz - Protected Route */}
            <Route path="/fuieds-quiz" element={
              <PrivateRoute>
                <FuiedsQuiz />
              </PrivateRoute>
            } />

            {/* Workshops */}
            <Route path="/workshops" element={<WorkshopList />} />
            <Route path="/admin/workshops" element={
              <PrivateRoute>
                <WorkshopManagement />
              </PrivateRoute>
            } />

            {/* AI Chat */}
            <Route path="/ai-chat" element={
              <PrivateRoute>
                <AiPersonalizedChat />
              </PrivateRoute>
            } />

            {/* Onboarding */}
            <Route path="/onboarding" element={
              <PrivateRoute>
                <Onboarding />
              </PrivateRoute>
            } />

          </Route>

          {/* AUTH */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

export default AppRoutes;

