'use client';

import { useState, useEffect } from 'react';
import Upload from '../components/Upload';
import { redirect, useRouter } from 'next/navigation';

const ManageCategory = () => {
  const [formData, setFormData] = useState({  img: [] });
  const [editFormData, setEditFormData] = useState({ id: '',   img: [] });
  const [message, setMessage] = useState('');
  const [categories, setCategories] = useState([]);
  const [img, setImg] = useState([]); // Store images in an array
  const [editMode, setEditMode] = useState(false); 
  // Fetch all categories
  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/brand', { method: 'GET' });
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

    const res = await fetch('/api/brand', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
 
    

    if (res.ok) {
      setMessage('brand added successfully!');
      setFormData({   img: [] });
      fetchCategories();
      window.location.href = '/brand';
      
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
      img: category.img,
    });
    setImg(category.img); // Populate img state with existing images for editing
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`/api/brand?id=${encodeURIComponent(editFormData.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          img: img, // Ensure the updated image state is sent
        }),
      });

      if (res.ok) {
        window.location.reload(); 
        setEditFormData({ id: '',  img: [] });
        setEditMode(false);
        fetchCategories();
        
      } else {
        window.location.reload();
        const errorData = await res.json();
        setMessage(`Error: ${errorData.error}`); 
      }
    } catch (error) {
      window.location.reload();
      console.error('Error:', error);
      setMessage('An error occurred while updating the brand.'); 
    }
  };

  // Delete category
  const handleDelete = async (id) => {
    if (confirm(`Are you sure you want to delete this brand?`)) {
      try {
        const res = await fetch(`/api/brand?id=${encodeURIComponent(id)}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          setMessage('brand deleted successfully!');
          fetchCategories();
          redirect('/brand');
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
      setImg(url); // Update img state with new image URL
    }
  };

  useEffect(() => {
    if (!img.includes('')) {
      setFormData((prevState) => ({ ...prevState, img }));
    }
  }, [img]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{editMode ? 'Edit brand' : 'Add brand'}</h1>
      <form onSubmit={editMode ? handleEditSubmit : handleSubmit} className="space-y-4">
      
       
        <Upload onFilesUpload={handleImgChange} />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2">
          {editMode ? 'Update brand' : 'Add brand'}
        </button>
      </form>
      {message && <p className="mt-4">{message}</p>}

      <h2 className="text-xl font-bold mt-8">All Brands</h2>
      <table className="table-auto border-collapse border border-gray-300 w-full mt-4">
  <thead>
    <tr> 
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
        <td colSpan={3} className="border border-gray-300 p-2 text-center">
          No data found.
        </td>
      </tr>
    )}
  </tbody>
</table>

      <style
          dangerouslySetInnerHTML={{
            __html:
              "\n  .uploadcare--widget {\n    background:black;\n  }\n  ",
          }}
        />
    </div>
  );
};

export default ManageCategory;
