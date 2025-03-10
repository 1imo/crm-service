'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface CreateProductFormData {
  name: string;
  description: string;
  sku: string;
  price: number;
  stockQuantity: number;
  files: (File & { 
    preview?: string;
    rawFile: File;
  })[];
}

const initialFormData: CreateProductFormData = {
  name: '',
  description: '',
  sku: '',
  price: 0,
  stockQuantity: 0,
  files: [],
};

const steps = [
  { number: 1, title: 'Basic Details' },
  { number: 2, title: 'Product Image' },
  { number: 3, title: 'Inventory Details' }
];

function SortableItem({ 
  file, 
  index, 
  handleRemoveFile 
}: { 
  file: File & { preview?: string }, 
  index: number,
  handleRemoveFile: (index: number) => void 
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ 
    id: `${file.name}-${index}`
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.5 : undefined,
  };

  return (
    <div className="relative group">
      {/* Draggable content */}
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
      >
        <div className="aspect-[2/3] w-full relative overflow-hidden rounded-lg bg-gray-100">
          {file?.type?.startsWith('video/') ? (
            <video
              src={file.preview}
              className="h-full w-full object-cover"
              controls={false}
              muted
            />
          ) : (
            <Image
              src={file.preview || ''}
              alt={`Preview ${index + 1}`}
              className="object-cover"
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
              priority={index < 4}
              unoptimized
            />
          )}
          <div className="absolute bottom-2 left-2 text-xs text-white bg-black/50 px-2 py-1 rounded">
            {index + 1}
          </div>
        </div>
      </div>

      {/* Remove button with fixed hover state */}
      <div 
        onClick={() => handleRemoveFile(index)}
        className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 hover:opacity-100 transition-all cursor-pointer z-[100]"
        style={{ pointerEvents: 'auto' }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </div>
    </div>
  );
}

export function CreateProductForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<CreateProductFormData>(initialFormData);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Add a ref to store blob URLs
  const blobUrls = useRef<string[]>([]);

  useEffect(() => {
    return () => {
      // Cleanup all blob URLs when component unmounts
      blobUrls.current.forEach(url => {
        URL.revokeObjectURL(url);
      });
      blobUrls.current = [];
    };
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const filesWithPreviews = files.map(file => {
        const preview = URL.createObjectURL(file);
        blobUrls.current.push(preview);
        return {
            ...file,  // Keep the File object properties
            preview,  // Add the preview URL
            rawFile: file  // Store the original File object
        };
    });
    
    setFormData(prev => ({
        ...prev,
        files: [...prev.files, ...filesWithPreviews]
    }));
  };

  const handleRemoveFile = (index: number) => {
    setFormData(prev => {
      const newFiles = [...prev.files];
      const removedFile = newFiles[index];
      if (removedFile?.preview) {
        URL.revokeObjectURL(removedFile.preview);
        blobUrls.current = blobUrls.current.filter(url => url !== removedFile.preview);
      }
      newFiles.splice(index, 1);
      return {
        ...prev,
        files: newFiles
      };
    });
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const items = Array.from(e.clipboardData.items);
    const mediaItem = items.find(item => 
        item.type.startsWith('image/') || item.type.startsWith('video/')
    );

    if (!mediaItem) return;

    const file = mediaItem.getAsFile();
    if (!file) return;

    const preview = URL.createObjectURL(file);
    blobUrls.current.push(preview);
    const fileWithPreview = {
        ...file,  // Keep the File object properties
        preview,  // Add the preview URL
        rawFile: file  // Store the original File object
    };

    setFormData(prev => ({
        ...prev,
        files: [...prev.files, fileWithPreview]
    }));
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (active.id && over?.id && active.id !== over.id) {
      setFormData((prev) => {
        const oldIndex = parseInt(active.id.toString().split('-').pop() || '0');
        const newIndex = parseInt(over.id.toString().split('-').pop() || '0');
        
        // Move files while preserving all properties
        const newFiles = [...prev.files];
        const [movedFile] = newFiles.splice(oldIndex, 1);
        newFiles.splice(newIndex, 0, movedFile);
        
        return {
          ...prev,
          files: newFiles,
        };
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < 3) {
        setCurrentStep(currentStep + 1);
        return;
    }

    setError(null);
    setLoading(true);

    try {
        // Create FormData for multipart/form-data submission
        const formDataToSend = new FormData();
        
        // Add basic fields
        formDataToSend.append('name', formData.name);
        formDataToSend.append('description', formData.description);
        formDataToSend.append('sku', formData.sku);
        formDataToSend.append('price', formData.price.toString());
        formDataToSend.append('stockQuantity', formData.stockQuantity.toString());

        // Add files - use the rawFile property
        formData.files.forEach((file) => {
            if (file.rawFile instanceof File) {
                formDataToSend.append('files', file.rawFile);
            }
        });

        const response = await fetch('/api/products', {
            method: 'POST',
            body: formDataToSend,
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to create product');
        }

        router.push('/products');
        router.refresh();
    } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
        setLoading(false);
    }
  };

  const renderFormStep = () => {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {(() => {
            switch (currentStep) {
              case 1:
                return (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#00603A] focus:border-[#00603A] sm:text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={4}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#00603A] focus:border-[#00603A] sm:text-sm"
                        required
                      />
                    </div>
                  </div>
                );
              case 2:
                return (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product Media
                      </label>
                      <div 
                        className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 bg-gray-100 border-dashed rounded-md"
                        onPaste={handlePaste}
                        tabIndex={0}
                        role="button"
                        aria-label="Upload area. You can drag and drop files here, click to select files, or paste from clipboard."
                      >
                        <div className="space-y-1 text-center">
                          <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 48 48"
                            aria-hidden="true"
                          >
                            <path
                              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <div className="flex flex-col items-center text-sm text-gray-600">
                            <label
                              htmlFor="file-upload"
                              className="relative cursor-pointer bg-white rounded-md font-medium text-[#00603A] hover:text-[#004D2E] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#00603A]"
                            >
                              <span>Upload files</span>
                              <input
                                id="file-upload"
                                name="file-upload"
                                type="file"
                                className="sr-only"
                                accept="image/*,video/*"
                                multiple
                                onChange={handleImageChange}
                              />
                            </label>
                            <p className="mt-1">or drag and drop</p>
                            <p className="mt-1">or paste from clipboard</p>
                          </div>
                          <p className="text-xs text-gray-500">
                            Images (PNG, JPG, GIF) or Videos (MP4, WebM) up to 10MB each
                          </p>
                        </div>
                      </div>
                    </div>

                    {(formData?.files?.length ?? 0) > 0 && (
                      <div className="mt-6">
                        <DndContext 
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragEnd={handleDragEnd}
                        >
                          <SortableContext
                            items={formData.files.map((file, index) => `${file.name}-${index}`)}
                            strategy={horizontalListSortingStrategy}
                          >
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                              {formData.files.map((file, index) => (
                                <SortableItem 
                                  key={`${file.name}-${index}`} 
                                  file={file} 
                                  index={index} 
                                  handleRemoveFile={handleRemoveFile}
                                />
                              ))}
                              {(formData.files.length ?? 0) > 12 && (
                                <div className="aspect-[2/3] w-full rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                                  +{formData.files.length - 12} more
                                </div>
                              )}
                            </div>
                          </SortableContext>
                        </DndContext>
                      </div>
                    )}
                  </div>
                );
              case 3:
                return (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        SKU
                      </label>
                      <input
                        type="text"
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#00603A] focus:border-[#00603A] sm:text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price (£)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#00603A] focus:border-[#00603A] sm:text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Stock Quantity
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.stockQuantity}
                        onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) })}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#00603A] focus:border-[#00603A] sm:text-sm"
                        required
                      />
                    </div>
                  </div>
                );
              default:
                return null;
            }
          })()}
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div 
      className="max-w-2xl w-full mx-auto"
      onPaste={handlePaste}
      tabIndex={0}
      role="presentation"
    >
      {/* Progress Tracker */}
      <div className="bg-white">
        <div className="relative px-0">
          {/* Connecting Lines */}
          <div className="absolute top-6 left-6 right-6 h-0.5 bg-gray-200">
            <div 
              className="h-full bg-[#00603A] transition-all duration-300"
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            />
          </div>
          
          {/* Step Numbers */}
          <div className="flex justify-between relative z-10">
            {steps.map((step) => (
              <div key={step.number}>
                <motion.div 
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-medium ${
                    currentStep >= step.number 
                      ? 'bg-[#00603A] text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}
                  animate={{
                    scale: currentStep === step.number ? 1.1 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  {step.number}
                </motion.div>
                <div className="mt-2 text-xs text-center text-gray-600">{step.title}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 mt-8">
          {renderFormStep()}
          
          {error && (
            <div className="text-red-600 text-sm mt-2">
              {error}
            </div>
          )}
          
          <div className="flex justify-end pt-6 space-x-6">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00603A]"
              >
                Previous
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#00603A] hover:bg-[#004D2E] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00603A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </span>
              ) : (
                currentStep === 3 ? 'Create Product' : 'Next'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 