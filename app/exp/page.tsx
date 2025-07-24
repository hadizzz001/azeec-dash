'use client';

import { useState, useEffect } from 'react';

const ManageCategory = () => {
  const [formData, setFormData] = useState({ ex: '', pro: '', gua: '' });
  const [message, setMessage] = useState('');

  const numberOnly = (value) => value.replace(/[^0-9]/g, '');

  const fetchData = async () => {
    try {
      const res = await fetch('/api/exp'); // <-- use GET all
      if (res.ok) {
        const data = await res.json();
        const item = data[0] || {}; // always take first item
        setFormData({
          ex: item.ex || '',
          pro: item.pro || '',
          gua: item.gua || '',
        });
      } else {
        console.error('Failed to fetch data');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/exp?id=688227e4e90edfbf2902d702', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setMessage('Updated successfully!');
        fetchData();
      } else {
        const errorData = await res.json();
        setMessage(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('An error occurred while updating the data.');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Edit data</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* EX */}
        <div>
          <label className="block mb-1">Experience Years</label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            className="border p-2 w-full"
            value={formData.ex}
            onChange={(e) => setFormData({ ...formData, ex: numberOnly(e.target.value) })}
            required
          />
        </div>
        {/* GUA */}
        <div>
          <label className="block mb-1">Years Guaranteed</label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            className="border p-2 w-full"
            value={formData.gua}
            onChange={(e) => setFormData({ ...formData, gua: numberOnly(e.target.value) })}
          />
        </div>
        {/* PRO */}
        <div>
          <label className="block mb-1">Projects Completed</label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            className="border p-2 w-full"
            value={formData.pro}
            onChange={(e) => setFormData({ ...formData, pro: numberOnly(e.target.value) })}
          />
        </div>

        <button type="submit" className="bg-blue-500 text-white px-4 py-2">
          Update
        </button>
      </form>
      {message && <p className="mt-4">{message}</p>}
    </div>
  );
};

export default ManageCategory;
