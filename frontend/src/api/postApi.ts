// src/api/postApi.ts
import axiosClient from "./axiosClient";

/**
 * postApi mirrors your backend routes:
 * - GET    /api/posts
 * - GET    /api/posts/:id
 * - POST   /api/posts
 * - PUT    /api/posts/:id
 * - DELETE /api/posts/:id
 * - DELETE /api/posts/:id/admin
 * - POST   /api/posts/:id/comments
 * - DELETE /api/posts/:id/comments/:commentId
 * - POST   /api/posts/:id/like
 * - POST   /api/posts/:id/bookmark
 * - POST   /api/posts/upload
 */
export const postApi = {
  getAll: (search?: string) =>
    axiosClient.get(`/posts${search ? `?search=${encodeURIComponent(search)}` : ""}`),

  getById: (id: string) =>
    axiosClient.get(`/posts/${id}`),

  create: (data: FormData) =>
    axiosClient.post("/posts", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  update: (id: string, data: FormData) =>
    axiosClient.put(`/posts/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  delete: (id: string) =>
    axiosClient.delete(`/posts/${id}`),

  // Admin delete (matches your backend route)
  deleteAsAdmin: (id: string) =>
    axiosClient.delete(`/posts/${id}/admin`),

  // Comments
  addComment: (postId: string, payload: { text : string }) =>
    axiosClient.post(`/posts/${postId}/comments`, payload),

  deleteComment: (postId: string, commentId: string) =>
    axiosClient.delete(`/posts/${postId}/comments/${commentId}`),

  // Like / Bookmark toggles
  toggleLike: (id: string) =>
    axiosClient.post(`/posts/${id}/like`),

  toggleBookmark: (id: string) =>
    axiosClient.post(`/posts/${id}/bookmark`),

  // Upload cover image (route: POST /api/posts/upload)
  uploadCover: (file: File) => {
    const fd = new FormData();
    fd.append("coverImage", file);
    return axiosClient.post("/posts/upload", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export default postApi;
