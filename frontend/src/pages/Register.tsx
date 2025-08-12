import { useState } from "react";
import { useMutation } from "react-query";
import { authApi } from "../api/authApi";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const mutation = useMutation(authApi.register, {
    onSuccess: () => {
      alert("Registration successful! Please login.");
      navigate("/login");
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || "Registration failed");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4">Register</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full border p-2 rounded"
          required
        />
        <button
          type="submit"
          disabled={mutation.isLoading}
          className="bg-green-600 text-white px-4 py-2 rounded w-full"
        >
          {mutation.isLoading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
}
