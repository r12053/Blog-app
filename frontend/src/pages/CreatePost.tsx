import { useState } from "react";
import { useMutation } from "react-query";
import { postApi } from "../api/postApi";
import { useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export default function CreatePost() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);

  const mutation = useMutation(postApi.create, {
    onSuccess: () => {
      alert("Post created successfully!");
      navigate("/");
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || "Failed to create post");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return alert("Title and content are required");
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    if (image) formData.append("image", image);
    console.log(formData)
    mutation.mutate(formData);
  };

  return (
    <div className="max-w-2xl mx-auto mt-6 p-6 border rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4">Create New Post</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Post title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <ReactQuill value={content} onChange={setContent} className="bg-white" />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files?.[0] || null)}
        />
        <button
          type="submit"
          disabled={mutation.isLoading}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
        >
          {mutation.isLoading ? "Publishing..." : "Publish Post"}
        </button>
      </form>
    </div>
  );
}
