"use client";

import React, { useState } from "react";
import { getClientGqlClient } from "@/lib/graphql/client";
import { CREATE_STAFF_ACCOUNT } from "@/lib/graphql/queries";
import { getErrorMessage } from "@/lib/errors";
import PasswordInput from "@/components/PasswordInput";

const ROLE_OPTIONS = ["ADMIN", "ACCOUNTANT", "LIBRARIAN", "PRINCIPAL", "TEACHER", "TRANSPORT_STAFF"];

const initialForm = {
  username: "",
  email: "",
  password: "",
  name: "",
  surname: "",
  phone: "",
  role: "ACCOUNTANT",
};

const CreateStaffPage = () => {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const client = await getClientGqlClient();
      const data = await client.request(CREATE_STAFF_ACCOUNT, { input: form });
      setSuccess(`Account created: ${data.createStaffAccount.username} (${data.createStaffAccount.role})`);
      setForm(initialForm);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to create account"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-lg">
      <h1 className="text-xl font-semibold mb-4">Create Staff Account</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 bg-white p-4 rounded-md shadow-sm">
        <div>
          <label className="block mb-1 text-sm text-gray-700">Role</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-50 border rounded outline-none text-sm"
          >
            {ROLE_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block mb-1 text-sm text-gray-700">First name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-50 border rounded outline-none text-sm"
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-sm text-gray-700">Surname</label>
            <input
              name="surname"
              value={form.surname}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-50 border rounded outline-none text-sm"
              required
            />
          </div>
        </div>

        <div>
          <label className="block mb-1 text-sm text-gray-700">Username</label>
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-50 border rounded outline-none text-sm"
            required
          />
        </div>

        <div>
          <label className="block mb-1 text-sm text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-50 border rounded outline-none text-sm"
            required
          />
        </div>

        <div>
          <label className="block mb-1 text-sm text-gray-700">Phone (optional)</label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-50 border rounded outline-none text-sm"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm text-gray-700">Temporary password</label>
         <PasswordInput
  autoComplete="new-password"
  name="password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-50 border rounded outline-none text-sm"
            required
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
        {success && <p className="text-sm text-green-600">{success}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-pink-600 text-white py-2 rounded text-sm hover:bg-pink-700 transition disabled:opacity-60"
        >
          {loading ? "Creating..." : "Create Account"}
        </button>
      </form>
    </div>
  );
};

export default CreateStaffPage;