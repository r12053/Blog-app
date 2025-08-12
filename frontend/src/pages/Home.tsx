import { useQuery } from "react-query";
import { postApi } from "../api/postApi";
import { Link } from "react-router-dom";
import PostActions from "../components/PostActions";

export default function Home() {
  const { data, isLoading } = useQuery("posts", () => postApi.getAll());

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Latest Posts</h1>
      <div className="space-y-4">
        {data?.data.map((post: any) => (
          <div key={post._id} className="border p-4 rounded-lg shadow">
            <Link to={`/post/${post._id}`} className="text-xl font-semibold text-blue-600">
              {post.title}
            </Link>
            <p className="text-gray-600"><div dangerouslySetInnerHTML={{ __html: post.content?.slice(0, 100) }} /></p>

            {localStorage.getItem("token") && (
              <PostActions
                postId={post._id}
                isLiked={post.isLiked}
                isBookmarked={post.isBookmarked}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
