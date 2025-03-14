'use client';

import { useEffect, useState, use, useRef, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Product } from '@/types/product';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Package, Pencil, Trash2, Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";

const IMAGE_SERVICE_URL = process.env.NEXT_PUBLIC_IMAGE_SERVICE_URL || 'http://localhost:3006';

interface ProductImage {
  id: string;
  url: string;
  position: number;
}

export default function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Partial<Product>>({});
    const [saving, setSaving] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [newImages, setNewImages] = useState<FileList | null>(null);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const currentImagesRef = useRef<ProductImage[]>([]);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await fetch(`/api/products/${id}`);
                if (!response.ok) throw new Error('Failed to fetch product');
                const data = await response.json();
                setProduct(data);
                setFormData(data);
                currentImagesRef.current = data.images?.map((image: any) => ({
                    id: image.id,
                    url: image.url,
                    position: image.position
                })) || [];
            } catch (err) {
                setError('Failed to load product details');
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    const handleImageSelect = (files: FileList | null) => {
        if (!files) return;
        setNewImages(files);
        setIsEditing(true);
        
        // Create preview URLs for the new images
        const previews = Array.from(files).map(file => URL.createObjectURL(file));
        setImagePreviews(previews);
    };

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
        if (!isEditing) {
            setFormData(product || {});
        } else {
            setFormData(product || {});
            setNewImages(null);
            // Cleanup preview URLs
            imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
            setImagePreviews([]);
        }
    };

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

            // Handle all images if there are any new ones
            if (newImages && newImages.length > 0) {
                const imageFormData = new FormData();
                
                // Add existing images' positions as a single JSON array
                if (currentImagesRef.current?.length) {
                    imageFormData.append('existingImages', JSON.stringify(
                        currentImagesRef.current.map((image, index) => ({
                            id: image.id,
                            position: index
                        }))
                    ));
                }

                // Add new images with their positions after existing images
                Array.from(newImages).forEach((file, index) => {
                    const position = (currentImagesRef.current?.length ?? 0) + index;
                    imageFormData.append('files', file);
                    imageFormData.append(`positions[${index}]`, position.toString());
                });

                // Make sure companyId is sent as a single string value
                imageFormData.append('entityId', id);
                imageFormData.append('entityType', 'product');
                imageFormData.append('companyId', updatedData.company_id);

                const imageResponse = await fetch(`/api/products/${id}/upload-images`, {
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
            // Clean up preview URLs
            imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
            setImagePreviews([]);
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
            setShowDeleteDialog(false);
        }
    };

    const handleImageDelete = async (imageId: string, position: number) => {
        try {
            const response = await fetch(`/api/products/${id}/images/${position}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete image');

            // Update the images ref and trigger a re-render
            currentImagesRef.current = currentImagesRef.current?.filter(img => img.id !== imageId) || [];
            // Force a re-render by updating the product state
            setProduct(prev => prev ? {
                ...prev,
                images: currentImagesRef.current
            } : null);

        } catch (error) {
            console.error('Failed to delete image:', error);
            toast.error('Failed to delete image');
        }
    };

    const renderField = (
        label: string, 
        value: string | number | null | undefined, 
        editField?: ReactNode
    ) => (
        <div className="flex flex-col space-y-1">
            <span className="text-xs text-muted-foreground">{label}</span>
            {isEditing && editField ? editField : (
                <span className="text-sm">
                    {value === undefined || value === null 
                        ? '—' 
                        : typeof value === 'number' && label.toLowerCase().includes('price') 
                            ? `£${value.toFixed(2)}` 
                            : value.toString()
                    }
                </span>
            )}
        </div>
    );

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex-shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex h-[59px] items-center px-6">
                    <div className="flex items-center flex-shrink-0 pr-6">
                        <Package className="h-5 w-5" />
                        <div className="ml-3">
                            <h1 className="text-sm font-medium leading-none">
                                {product?.name || 'Loading...'}
                            </h1>
                            <p className="text-xs text-muted-foreground mt-1">
                                Product Details
                            </p>
                        </div>
                    </div>
                    <Separator orientation="vertical" className="h-8" />
                    <div className="flex-1" />
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleEditToggle}
                        >
                            <Pencil className="h-4 w-4 mr-2" />
                            {isEditing ? 'Cancel' : 'Edit'}
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setShowDeleteDialog(true)}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6">
                <div className="max-w-7xl mx-auto">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            {/* Product Information */}
                            <Card className="shadow-none">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base">Product Information</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            {renderField('Product Name', product?.name,
                                                <Input
                                                    value={formData.name || ''}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                />
                                            )}
                                            {renderField('SKU', product?.sku,
                                                <Input
                                                    value={formData.sku || ''}
                                                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                                />
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            {renderField('Price', product?.price,
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    value={formData.price || ''}
                                                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                                />
                                            )}
                                            {renderField('Stock Quantity', product?.stock_quantity,
                                                <Input
                                                    type="number"
                                                    value={formData.stock_quantity || ''}
                                                    onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) })}
                                                />
                                            )}
                                        </div>
                                        <div>
                                            {renderField('Description', product?.description,
                                                <Textarea
                                                    value={formData.description || ''}
                                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                    className="mt-1.5"
                                                />
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Additional Information */}
                            <Card className="shadow-none">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base">Additional Information</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            {renderField('Created', 
                                                product?.created_at 
                                                    ? new Date(product.created_at).toLocaleDateString() 
                                                    : null
                                            )}
                                            {renderField('Last Updated', 
                                                product?.updated_at 
                                                    ? new Date(product.updated_at).toLocaleDateString() 
                                                    : null
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Save Button */}
                        {isEditing && (
                            <div className="flex justify-end">
                                <Button type="submit" disabled={saving}>
                                    {saving ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        'Save Changes'
                                    )}
                                </Button>
                            </div>
                        )}
                    </form>
                </div>
            </div>

            {/* Delete Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Product</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the product
                            <span className="font-medium"> {product?.name}</span>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                        <Input
                            value={deleteConfirmation}
                            onChange={(e) => setDeleteConfirmation(e.target.value)}
                            placeholder={`Type "${product?.name}" to confirm`}
                        />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={deleteConfirmation !== product?.name || isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete Product'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
} 