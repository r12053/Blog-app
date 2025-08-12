import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useState } from "react";
import { postApi } from "../api/postApi";

export default function ViewPost() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [commentText, setCommentText] = useState("");

  // Fetch post details
  const { data, isLoading, isError } = useQuery(["post", id], () =>
    postApi.getById(id!)
  );

  const post = data?.data;
 
  let likedByCurrentUser =false;
  let totalLikes =0;
  let bookMarkedByCurrentUser = false;
  let totalBookmarks =0;
  if(post?.likes.length){
    likedByCurrentUser = post.likes.includes(id);
    totalLikes = post.likes.length;
  }
 if(post?.bookmarks.length){
    bookMarkedByCurrentUser = post.bookmarks.includes(id);
    totalBookmarks = post.bookmarks.length;
 }

  // Add comment
  const addCommentMutation = useMutation(
    () => postApi.addComment(id!, { text: commentText }),
    {
      onSuccess: () => {
        setCommentText("");
        queryClient.invalidateQueries(["post", id]);
      },
      onError: (err: any) => {
        alert(err.response?.data?.message || "Failed to add comment");
      },
    }
  );

  // Like / Bookmark
  const likeMutation = useMutation(() => postApi.toggleLike(id!), {
    onSuccess: () => queryClient.invalidateQueries(["post", id]),
  });

  const bookmarkMutation = useMutation(() => postApi.toggleBookmark(id!), {
    onSuccess: () => queryClient.invalidateQueries(["post", id]),
  });

  // Delete Post
  const deletePost = (isAdmin: boolean) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    const deleteFn = isAdmin ? postApi.deleteAsAdmin : postApi.delete;
    deleteFn(id!)
      .then(() => {
        alert("Post deleted successfully");
        navigate("/");
      })
      .catch((err) => {
        alert(err.response?.data?.message || "Failed to delete post");
      });
  };

  if (isLoading) return <p className="text-center mt-6">Loading...</p>;
  if (isError || !post) return <p className="text-center mt-6">Post not found</p>;

  return (
    <div className="max-w-3xl mx-auto mt-6 p-4">
      <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
      <p className="text-gray-500 mb-4">
        By {post.author.name} • {new Date(post.createdAt).toLocaleDateString()}
      </p>

      {post.coverImage && (
        <img
          src={post.coverImage}
          alt={post.title}
          className="w-full rounded-lg mb-4"
        />
      )}

      <div
        className="prose max-w-none mb-4"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Like & Bookmark */}
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => likeMutation.mutate()}
          className={`px-4 py-2 rounded ${
            likedByCurrentUser ? "bg-red-500 text-white" : "bg-gray-200"
          }`}
        >
          ❤️ {totalLikes}
        </button>
        <button
          onClick={() => bookmarkMutation.mutate()}
          className={`px-4 py-2 rounded ${
            bookMarkedByCurrentUser ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          🔖 Bookmark
        </button>
      </div>

      {/* Edit / Delete for Author or Admin */}
      {post.isAuthorOrAdmin && (
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => navigate(`/edit/${post._id}`)}
            className="bg-yellow-500 text-white px-4 py-2 rounded"
          >
            ✏️ Edit
          </button>
          <button
            onClick={() => deletePost(post.isAdmin)}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            🗑️ Delete
          </button>
        </div>
      )}

      {/* Comments */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-3">Comments</h2>

        {post.comments.map((c: any) => (
          <div key={c._id} className="border-b py-2">
            <p className="text-sm text-gray-500">
              {c.name} • {new Date(c.createdAt).toLocaleString()}
            </p>
            <p>{c.text}</p>
          </div>
        ))}

        {/* Add Comment */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (commentText.trim()) {
              addCommentMutation.mutate();
            }
          }}
          className="mt-4 flex gap-2"
        >
          <input
            type="text"
            placeholder="Write a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="flex-1 border p-2 rounded"
          />
          <button
            type="submit"
            disabled={addCommentMutation.isLoading}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            {addCommentMutation.isLoading ? "Adding..." : "Post"}
          </button>
        </form>
      </div>
    </div>
  );
}
