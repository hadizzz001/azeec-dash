'use client';

import { useState, useEffect } from 'react';
import Upload from '../components/Upload';
import { redirect, useRouter } from 'next/navigation';

const ManageCategory = () => {
  const [formData, setFormData] = useState({ name: '', description: '', position: '', img: [] });
  const [editFormData, setEditFormData] = useState({ id: '', name: '', description: '', position: '', img: [] });
  const [message, setMessage] = useState('');
  const [categories, setCategories] = useState([]);
  const [img, setImg] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const router = useRouter();

  // Fetch all categories
  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/team', { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      } else {
        console.error('Failed to fetch data');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Add category
  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch('/api/team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      setMessage('Team added successfully!');
      setFormData({ name: '', description: '', position: '', img: [] });
      fetchCategories();
      window.location.href = '/team';
    } else {
      const errorData = await res.json();
      setMessage(`Error: ${errorData.error}`);
    }
  };

  // Edit category
  const handleEdit = (category) => {
    setEditMode(true);
    setEditFormData({
      id: category.id,
      name: category.name,
      description: category.description || '',
      position: category.position || '',
      img: category.img,
    });
    setImg(category.img);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`/api/team?id=${encodeURIComponent(editFormData.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editFormData.name,
          description: editFormData.description,
          position: editFormData.position,
          img: img,
        }),
      });

      if (res.ok) {
        window.location.reload();
        setEditFormData({ id: '', name: '', description: '', position: '', img: [] });
        setEditMode(false);
        fetchCategories();
      } else {
        const errorData = await res.json();
        setMessage(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('An error occurred while updating the data.');
    }
  };

  // Delete category
  const handleDelete = async (id) => {
    if (confirm(`Are you sure you want to delete this team?`)) {
      try {
        const res = await fetch(`/api/team?id=${encodeURIComponent(id)}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          setMessage('team deleted successfully!');
          fetchCategories();
          redirect('/team');
        } else {
          const errorData = await res.json();
          setMessage(`Error: ${errorData.error}`);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  const handleImgChange = (url) => {
    if (url) {
      setImg(url);
    }
  };

  useEffect(() => {
    if (!img.includes('')) {
      setFormData((prevState) => ({ ...prevState, img }));
    }
  }, [img]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{editMode ? 'Edit Team' : 'Add Team'}</h1>
      <form onSubmit={editMode ? handleEditSubmit : handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block mb-1">Name</label>
          <input
            type="text"
            className="border p-2 w-full"
            value={editMode ? editFormData.name : formData.name}
            onChange={(e) =>
              editMode
                ? setEditFormData({ ...editFormData, name: e.target.value })
                : setFormData({ ...formData, name: e.target.value })
            }
            required
          />
        </div>
        {/* Position (String Input) */}
<div>
  <label className="block mb-1">Position</label>
  <input
    type="text"   // <-- changed from "number" to "text"
    className="border p-2 w-full"
    value={editMode ? editFormData.position : formData.position}
    onChange={(e) =>
      editMode
        ? setEditFormData({ ...editFormData, position: e.target.value })
        : setFormData({ ...formData, position: e.target.value })
    }
  />
</div>

        {/* Description */}
        <div>
          <label className="block mb-1">Description</label>
          <textarea
            className="border p-2 w-full"
            value={editMode ? editFormData.description : formData.description}
            onChange={(e) =>
              editMode
                ? setEditFormData({ ...editFormData, description: e.target.value })
                : setFormData({ ...formData, description: e.target.value })
            }
          />
        </div>


        <Upload onFilesUpload={handleImgChange} />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2">
          {editMode ? 'Update Team' : 'Add Team'}
        </button>
      </form>
      {message && <p className="mt-4">{message}</p>}

      <h2 className="text-xl font-bold mt-8">All Team</h2>
      <table className="table-auto border-collapse border border-gray-300 w-full mt-4">
        <thead>
          <tr>
            <th className="border border-gray-300 p-2">Name</th> 
            <th className="border border-gray-300 p-2">Position</th>
            <th className="border border-gray-300 p-2">Image</th>
            <th className="border border-gray-300 p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.length > 0 ? (
            categories.map((category) => {
              const fileUrl = category.img[0];
              const isVideo = /\.(mp4|webm|ogg)$/i.test(fileUrl);
              return (
                <tr key={category.id}>
                  <td className="border border-gray-300 p-2">{category.name}</td> 
                  <td className="border border-gray-300 p-2">{category.position || '-'}</td>
                  <td className="border border-gray-300 p-2">
                    {isVideo ? (
                      <video controls className="w-24 h-auto">
                        <source src={fileUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <img src={fileUrl} alt="Product Image" className="w-24 h-auto" />
                    )}
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    <button
                      onClick={() => handleEdit(category)}
                      className="bg-yellow-500 text-white px-4 py-1 rounded mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="bg-red-500 text-white px-4 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={5} className="border border-gray-300 p-2 text-center">
                No data found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ManageCategory;
