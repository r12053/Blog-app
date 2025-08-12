import { useMutation, useQueryClient } from "react-query";
import { postApi } from "../api/postApi";

export default function PostActions({
  postId,
  isLiked,
  isBookmarked,
}: {
  postId: string;
  isLiked: boolean;
  isBookmarked: boolean;
}) {
  const queryClient = useQueryClient();

  const likeMutation = useMutation(() => postApi.toggleLike(postId), {
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });

  const bookmarkMutation = useMutation(() => postApi.toggleBookmark(postId), {
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });

  return (
    <div className="flex gap-4 mt-4">
      <button
        onClick={() => likeMutation.mutate()}
        className={`px-3 py-1 rounded ${
          isLiked ? "bg-red-500 text-white" : "bg-gray-200"
        }`}
      >
        {isLiked ? "Unlike" : "Like"}
      </button>

      <button
        onClick={() => bookmarkMutation.mutate()}
        className={`px-3 py-1 rounded ${
          isBookmarked ? "bg-yellow-400 text-black" : "bg-gray-200"
        }`}
      >
        {isBookmarked ? "Unbookmark" : "Bookmark"}
      </button>
    </div>
  );
}
