'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Product {
    id: string;
    name: string;
    description: string;
    sku: string;
    price: number;
    stockQuantity: number;
    companyId: string;
    createdAt: string;
    updatedAt: string;
    images?: Array<{
        id: string;
        filename: string;
        originalName: string;
        mimeType: string;
    }>;
}

const IMAGE_SERVICE_URL = process.env.NEXT_PUBLIC_IMAGE_SERVICE_URL || 'http://localhost:3006';

export default function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Partial<Product>>({});
    const [saving, setSaving] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [newImages, setNewImages] = useState<FileList | null>(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await fetch(`/api/products/${id}`);
                if (!response.ok) throw new Error('Failed to fetch product');
                const data = await response.json();
                setProduct(data);
                setFormData(data);
            } catch (err) {
                setError('Failed to load product details');
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            // First update product details
            const response = await fetch(`/api/products/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error('Failed to update product');
            
            const updatedData = await response.json();

            // Then handle new images if any
            if (newImages && newImages.length > 0) {
                const imageFormData = new FormData();
                Array.from(newImages).forEach((file) => {
                    imageFormData.append('files', file);
                });
                imageFormData.append('entityId', id);
                imageFormData.append('entityType', 'product');
                imageFormData.append('companyId', updatedData.companyId);

                const imageResponse = await fetch('/api/products/upload-images', {
                    method: 'POST',
                    body: imageFormData
                });

                if (!imageResponse.ok) throw new Error('Failed to upload images');
            }

            // Refresh the page data
            const refreshResponse = await fetch(`/api/products/${id}`);
            const refreshedData = await refreshResponse.json();
            
            setProduct(refreshedData);
            setFormData(refreshedData);
            setIsEditing(false);
            setNewImages(null);
            router.refresh();
        } catch (error) {
            console.error('Failed to update product:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (deleteConfirmation !== product?.name) return;
        
        setIsDeleting(true);
        try {
            const response = await fetch(`/api/products/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete product');
            
            router.push('/products');
            router.refresh();
        } catch (error) {
            console.error('Failed to delete product:', error);
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00603A]"></div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-red-500">{error || 'Product not found'}</div>
            </div>
        );
    }

    const renderField = (label: string, value: string | number | undefined, fieldName: keyof Product) => (
        <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>
            {isEditing ? (
                <input
                    type={typeof value === 'number' ? 'number' : 'text'}
                    value={formData[fieldName]?.toString() || ''}
                    onChange={(e) => setFormData({ 
                        ...formData, 
                        [fieldName]: typeof value === 'number' ? parseFloat(e.target.value) : e.target.value 
                    })}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#00603A] focus:border-[#00603A] sm:text-sm"
                />
            ) : (
                <p className="text-sm text-gray-900">
                    {fieldName === 'price' ? `£${value?.toString() || '0'}` : value?.toString() || '-'}
                </p>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-white">
            {/* Header Section */}
            <div className="bg-[#00603A] text-white">
                <div className="px-12 py-16">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-semibold">{product.name}</h1>
                            <p className="mt-1 text-[#B8E1D3]">Product Details</p>
                        </div>
                        <div className="flex space-x-4">
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className="inline-flex items-center px-4 py-2 bg-white text-[#00603A] rounded-md hover:bg-[#E8F5F0] transition-colors"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                {isEditing ? 'Cancel' : 'Edit'}
                            </button>
                            <button
                                onClick={() => setShowDeleteModal(true)}
                                className="inline-flex items-center px-4 py-2 bg-[#9B2C2C] text-white rounded-md hover:bg-[#7C2222] transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="px-12 py-16">
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-12">
                        {/* Product Information */}
                        <section className="pt-8">
                            <h3 className="text-lg font-medium text-gray-900 mb-8 pb-2 border-b border-gray-200">Product Information</h3>
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    {renderField('Product Name', product.name, 'name')}
                                    {renderField('SKU', product.sku, 'sku')}
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    {renderField('Price', product.price, 'price')}
                                    {renderField('Stock Quantity', product.stockQuantity, 'stockQuantity')}
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    {isEditing ? (
                                        <textarea
                                            value={formData.description || ''}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            rows={4}
                                            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#00603A] focus:border-[#00603A] sm:text-sm"
                                        />
                                    ) : (
                                        <p className="text-sm text-gray-900">{product.description || '-'}</p>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* Images Section */}
                        <section className="pt-8">
                            <h3 className="text-lg font-medium text-gray-900 mb-8 pb-2 border-b border-gray-200">Product Images</h3>
                            <div className="space-y-6">
                                {isEditing && (
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Add New Images
                                        </label>
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={(e) => setNewImages(e.target.files)}
                                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#00603A] file:text-white hover:file:bg-[#004D2E]"
                                        />
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-4">
                                    {product.images?.map((image) => (
                                        <div key={image.id} className="relative">
                                            <Image
                                                src={`${IMAGE_SERVICE_URL}/api/media/file/${image.filename}`}
                                                alt={image.originalName}
                                                width={300}
                                                height={300}
                                                className="rounded-lg object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* Additional Information */}
                        <section className="pt-8">
                            <h3 className="text-lg font-medium text-gray-900 mb-8 pb-2 border-b border-gray-200">Additional Information</h3>
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                                        <p className="text-sm text-gray-900">{new Date(product.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
                                        <p className="text-sm text-gray-900">{new Date(product.updatedAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Action Buttons */}
                    {isEditing && (
                        <div className="flex justify-end space-x-3 mt-12">
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00603A]"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#00603A] hover:bg-[#004D2E] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00603A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    )}
                </form>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Product</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            This action cannot be undone. This will permanently delete the product
                            <span className="font-medium text-gray-900"> {product.name}</span>.
                        </p>
                        <p className="text-sm text-gray-500 mb-4">
                            Please type <span className="font-medium text-gray-900">{product.name}</span> to confirm.
                        </p>
                        <input
                            type="text"
                            value={deleteConfirmation}
                            onChange={(e) => setDeleteConfirmation(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#00603A] focus:border-[#00603A] mb-4"
                            placeholder="Type product name to confirm"
                        />
                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setDeleteConfirmation('');
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00603A]"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={deleteConfirmation !== product.name || isDeleting}
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isDeleting ? 'Deleting...' : 'Delete Product'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 