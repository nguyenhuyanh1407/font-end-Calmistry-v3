import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/calmistry";

export const blogService = {
    // Public - Get Published Blogs (Filtered)
    getPublishedBlogs: async () => {
        try {
            const response = await axios.get(`${API_URL}/blogs/published`);
            return response.data.result;
        } catch (error) {
            console.error("Error fetching published blogs:", error);
            throw error;
        }
    },

    // Public - Get Featured Blogs
    getFeaturedBlogs: async () => {
        try {
            const response = await axios.get(`${API_URL}/blogs/featured`);
            return response.data.result;
        } catch (error) {
            console.error("Error fetching featured blogs:", error);
            throw error;
        }
    },

    // Public - Get Blog Detail
    getBlogById: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/blogs/${id}`);
            return response.data.result;
        } catch (error) {
            console.error(`Error fetching blog ${id}:`, error);
            throw error;
        }
    },

    // Public - Search
    searchBlogs: async (params) => {
        try {
            // params: { title, categoryId, status }
            const response = await axios.get(`${API_URL}/blogs/search`, { params });
            return response.data.result;
        } catch (error) {
            console.error("Error searching blogs:", error);
            throw error;
        }
    },

    // Public - Get Categories
    getCategories: async () => {
        try {
            const response = await axios.get(`${API_URL}/blogs/categories`);
            return response.data.result;
        } catch (error) {
            console.error("Error fetching categories:", error);
            throw error;
        }
    },

    // Public - Upload Image
    uploadImage: async (file) => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            // Note: Since FileController is public, we don't strictly need a token, 
            // but we need 'Content-Type': 'multipart/form-data' which axios sets automatically when body is FormData
            const response = await axios.post(`${API_URL}/files/upload`, formData);
            console.log("Upload Response:", response.data); // DEBUG LOG


            // Construct full URL
            const result = response.data.result;
            // If result is already absolute (Cloudinary), return it as is
            if (result.startsWith('http://') || result.startsWith('https://')) {
                return result;
            }

            // Otherwise prepend API URL (for local files)
            const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
            return `${baseUrl}${result}`;
        } catch (error) {
            console.error("Error uploading image:", error);
            throw error;
        }
    },

    // Public - Upload Multiple Images
    uploadImages: async (files) => {
        try {
            const uploadPromises = Array.from(files).map(file =>
                blogService.uploadImage(file)
            );
            return await Promise.all(uploadPromises);
        } catch (error) {
            console.error("Error uploading images:", error);
            throw error;
        }
    },

    // Authenticated - Create Blog (accepts imageUrls array)
    createBlog: async (blogData, token) => {
        try {
            const response = await axios.post(`${API_URL}/blogs`, blogData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data.result;
        } catch (error) {
            console.error("Error creating blog:", error);
            throw error;
        }
    },

    // Authenticated - Update Blog
    updateBlog: async (id, blogData, token) => {
        try {
            const response = await axios.put(`${API_URL}/blogs/${id}`, blogData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data.result;
        } catch (error) {
            console.error(`Error updating blog ${id}:`, error);
            throw error;
        }
    },

    // Authenticated - Delete Blog
    deleteBlog: async (id, token) => {
        try {
            const response = await axios.delete(`${API_URL}/blogs/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data.result;
        } catch (error) {
            console.error(`Error deleting blog ${id}:`, error);
            throw error;
        }
    },

    // Authenticated (Expert) - Get my blogs or pending blogs (If backend supports)
    // Currently backend 'getAllBlogs' returns ALL. Expert might need a filter for 'Pending'.

    // Authenticated (Expert) - Approve Blog
    approveBlog: async (id, status, token) => {
        try {
            const response = await axios.put(
                `${API_URL}/blogs/${id}/approve`,
                null,
                {
                    params: { status },
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            return response.data.result;
        } catch (error) {
            console.error("Error approving blog:", error);
            throw error;
        }
    },

    // --- Interactions ---

    // Authenticated - Like Blog
    likeBlog: async (id, token) => {
        try {
            await axios.post(`${API_URL}/blogs/${id}/like`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            console.error("Error liking blog:", error);
            throw error;
        }
    },

    // Authenticated - Unlike Blog
    unlikeBlog: async (id, token) => {
        try {
            await axios.delete(`${API_URL}/blogs/${id}/like`, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            console.error("Error unliking blog:", error);
            throw error;
        }
    },

    // Public - Get Comments
    getComments: async (blogId) => {
        try {
            const response = await axios.get(`${API_URL}/blogs/${blogId}/comments`);
            // Assuming response.data.result is array of CommentResponse
            return response.data.result;
        } catch (error) {
            console.error("Error fetching comments:", error);
            throw error;
        }
    },

    // Authenticated - Create Comment
    createComment: async (blogId, content, token) => {
        try {
            const response = await axios.post(`${API_URL}/blogs/${blogId}/comments`,
                { content },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data.result;
        } catch (error) {
            console.error("Error creating comment:", error);
            throw error;
        }
    },

    // Authenticated - Like Comment
    likeComment: async (commentId, token) => {
        try {
            await axios.post(`${API_URL}/comments/${commentId}/like`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            console.error("Error liking comment:", error);
            throw error;
        }
    },

    // Authenticated - Unlike Comment
    unlikeComment: async (commentId, token) => {
        try {
            await axios.delete(`${API_URL}/comments/${commentId}/like`, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            console.error("Error unliking comment:", error);
            throw error;
        }
    }
};
