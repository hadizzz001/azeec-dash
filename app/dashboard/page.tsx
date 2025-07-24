'use client';

import { useState, useEffect } from 'react';
import Upload from '../components/Upload';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import ExportToExcel from '../components/ExportToExcel';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

export default function ProductTable() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');


  // Fetch products and categories on load
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    const response = await fetch('/api/products');
    if (response.ok) {
      const data = await response.json();
      setProducts(data);
    } else {
      console.error('Failed to fetch Project');
    }
  };

  const fetchCategories = async () => {
    const response = await fetch('/api/category');
    if (response.ok) {
      const data = await response.json();
      setCategories(data);
    } else {
      console.error('Failed to fetch categories');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this Project?')) {
      try {
        const response = await fetch(`/api/products/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          alert('Project deleted successfully');
          fetchProducts();
        } else {
          console.error('Failed to delete Project');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
  };

  const handleUpdate = async (updatedProduct) => {
    try {
      const response = await fetch(`/api/products/${updatedProduct.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct),
      });

      if (response.ok) {
        alert('Project updated successfully');
        setEditingProduct(null);
        fetchProducts();
      } else {
        console.error('Failed to update Project');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Filter products by search query
  const filterBySearch = (product) => {
    return product.title.toLowerCase().includes(searchQuery.toLowerCase());
  };

  // Filter products by selected category
  const filterByCategory = (product) => {
    const isFilteredByCategory = selectedCategory ? product.category === selectedCategory : true;

    return isFilteredByCategory;
  };

  // Apply both search and category filters
  const filteredProducts = products.filter((product) => {
    return filterBySearch(product) && filterByCategory(product);
  });




  return (
    <div className="max-w-7xl mx-auto p-4 text-[12px]">
      {editingProduct && (
        <EditProductForm
          product={editingProduct}
          onCancel={() => setEditingProduct(null)}
          onSave={handleUpdate}
        />
      )}
      <h1 className="text-2xl font-bold mb-4">Projects List</h1>

      {/* Search Input */}
      <div className="mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full border p-2"
          placeholder="Search by title..."
        />
      </div>

      {/* Category Filter */}
      <div className="mb-4">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full border p-2"
        >
          <option value="">Select a category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <ExportToExcel products={products} />

      <table className="table-auto w-full border-collapse border border-gray-200 mb-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Title</th>
            <th className="border p-2">Pic</th> 
            <th className="border p-2">Category</th> 
            <th className="border p-2">Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredProducts.map((product) => {
            const fileUrl = product.img[0];
            const isVideo = /\.(mp4|webm|ogg)$/i.test(fileUrl);
            



            return (
              <tr key={product.id}  >

                <td className="border p-2">{product.title}</td>
                <td className="border p-2">
                  {isVideo ? (
                    <video controls className="w-24 h-auto">
                      <source src={fileUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <img src={fileUrl} alt="Product" className="w-24 h-auto" />
                  )}
                </td> 
                <td className="border p-2">{product.category}</td> 
  


                <td className="border p-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="bg-yellow-500 text-white px-2 py-1 mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="bg-red-500 text-white px-2 py-1"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>

      </table>


    </div>
  );
}




function EditProductForm({ product, onCancel, onSave }) {
  const [title, setTitle] = useState(product.title); 
  const [img, setImg] = useState(product.img || []);
  const [description, setDescription] = useState(product.description);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(product.category || "");
 
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const categoriesRes = await fetch("/api/category");
        setCategories(await categoriesRes.json());
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchOptions();
  }, []);









  const handleSubmit = (e) => {
    e.preventDefault();

    onSave({
      ...product,
      title,
      description, 
      img,
      category: selectedCategory,  
    });
  };





 



  return (
    <form onSubmit={handleSubmit} className="text-[12px] border p-4 bg-gray-100 rounded">
      <h2 className="text-xl font-bold mb-4">Edit Project</h2>

      {/* Title */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border p-2" required />
      </div>

      {/* Category */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Category</label>
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full border p-2">
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>{cat.name}</option>
          ))}
        </select>
      </div> 
      
      {/* Description */}
      <label className="block text-lg font-bold mb-2">Description</label>
      <ReactQuill value={description} onChange={setDescription} className="mb-4" theme="snow" placeholder="Write your Project description here..." />

 
      {/* Image Upload */}
      <Upload onFilesUpload={(url) => setImg(url)} />

      {/* Buttons */}
      <div className="flex gap-2 mt-4">
        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">Save</button>
        <button type="button" onClick={onCancel} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
      </div>
    </form>
  );
}

