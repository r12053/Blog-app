import axiosClient from "./axiosClient";

export const commentApi = {
  add: (postId: string, data: { content: string }) =>
    axiosClient.post(`/posts/${postId}/comments`, data),
  delete: (postId: string, commentId: string) =>
    axiosClient.delete(`/posts/${postId}/comments/${commentId}`),
};
