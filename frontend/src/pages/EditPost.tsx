import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { postApi } from "../api/postApi";
import { useNavigate, useParams } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export default function EditPost() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(["post", id], () => postApi.getById(id!), {
    enabled: !!id,
  });

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);

  useEffect(() => {
    if (data?.data) {
      setTitle(data.data.title);
      setContent(data.data.content);
    }
  }, [data]);

  const mutation = useMutation(
    (formData: FormData) => postApi.update(id!, formData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["post", id]);
        alert("Post updated successfully!");
        navigate(`/post/${id}`);
      },
      onError: (err: any) => {
        alert(err.response?.data?.message || "Failed to update post");
      },
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    if (image) formData.append("image", image);
    mutation.mutate(formData);
  };

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto mt-6 p-6 border rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4">Edit Post</h1>
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
          {mutation.isLoading ? "Updating..." : "Update Post"}
        </button>
      </form>
    </div>
  );
}
