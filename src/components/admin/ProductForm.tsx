'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminHeader from '@/components/admin/AdminHeader';
import { Save, ArrowLeft, Plus, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface Category {
  id: string;
  name: string;
}

export default function ProductForm({ 
  categories,
  product = null 
}: { 
  categories: Category[];
  product?: any;
}) {
  const router = useRouter();
  const isEditing = !!product;
  
  const [formData, setFormData] = useState({
    name: product?.name || '',
    slug: product?.slug || '',
    description: product?.description || '',
    short_description: product?.short_description || '',
    price: product?.price || '',
    compare_at_price: product?.compare_at_price || '',
    cost_price: product?.cost_price || '',
    sku: product?.sku || '',
    barcode: product?.barcode || '',
    stock_quantity: product?.stock_quantity || 0,
    low_stock_threshold: product?.low_stock_threshold || 5,
    category_id: product?.category_id || '',
    is_active: product?.is_active ?? true,
    is_featured: product?.is_featured ?? false,
    weight: product?.weight || '',
    meta_title: product?.meta_title || '',
    meta_description: product?.meta_description || '',
  });

  const [images, setImages] = useState<string[]>(
    product?.images?.map((img: any) => img.url) || []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      name,
      slug: prev.slug || generateSlug(name),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const url = isEditing 
        ? `/api/admin/products/${product.id}`
        : '/api/admin/products';
      
      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          images,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Er is iets misgegaan');
      }

      router.push('/admin/products');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addImageUrl = () => {
    const url = prompt('Voer de afbeelding URL in:');
    if (url) {
      setImages(prev => [...prev, url]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="admin-page">
      <AdminHeader 
        title={isEditing ? 'Product Bewerken' : 'Nieuw Product'}
        subtitle={isEditing ? `Bewerk ${product.name}` : 'Voeg een nieuw product toe aan je webshop'}
      />

      <form onSubmit={handleSubmit} className="admin-form">
        {error && (
          <div className="admin-alert admin-alert-error">
            {error}
          </div>
        )}

        <div className="admin-form-grid">
          <div className="admin-form-main">
            <div className="admin-card">
              <h3 className="admin-card-title">Basis Informatie</h3>
              
              <div className="admin-form-group">
                <label htmlFor="name">Productnaam *</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={handleNameChange}
                  required
                  placeholder="Bijv. Hartvormige Ketting"
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="slug">URL Slug</label>
                <input
                  type="text"
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="hartvormige-ketting"
                />
                <small>Wordt gebruikt in de URL: /products/{formData.slug || 'slug'}</small>
              </div>

              <div className="admin-form-group">
                <label htmlFor="short_description">Korte Beschrijving</label>
                <input
                  type="text"
                  id="short_description"
                  value={formData.short_description}
                  onChange={(e) => setFormData(prev => ({ ...prev, short_description: e.target.value }))}
                  placeholder="Een korte samenvatting van het product"
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="description">Beschrijving</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={5}
                  placeholder="Volledige productbeschrijving..."
                />
              </div>
            </div>

            <div className="admin-card">
              <h3 className="admin-card-title">Afbeeldingen</h3>
              
              <div className="admin-images-grid">
                {images.map((url, index) => (
                  <div key={index} className="admin-image-item">
                    <Image
                      src={url.startsWith('http') ? url : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${url}`}
                      alt={`Product ${index + 1}`}
                      width={120}
                      height={120}
                      style={{ objectFit: 'cover' }}
                    />
                    <button 
                      type="button"
                      onClick={() => removeImage(index)}
                      className="admin-image-remove"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                <button 
                  type="button"
                  onClick={addImageUrl}
                  className="admin-image-add"
                >
                  <Plus size={24} />
                  <span>Afbeelding toevoegen</span>
                </button>
              </div>
            </div>

            <div className="admin-card">
              <h3 className="admin-card-title">Prijzen</h3>
              
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label htmlFor="price">Prijs (EUR) *</label>
                  <input
                    type="number"
                    id="price"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    required
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                  />
                </div>

                <div className="admin-form-group">
                  <label htmlFor="compare_at_price">Vergelijkingsprijs (EUR)</label>
                  <input
                    type="number"
                    id="compare_at_price"
                    value={formData.compare_at_price}
                    onChange={(e) => setFormData(prev => ({ ...prev, compare_at_price: e.target.value }))}
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                  />
                  <small>Originele prijs voor kortingsweergave</small>
                </div>

                <div className="admin-form-group">
                  <label htmlFor="cost_price">Kostprijs (EUR)</label>
                  <input
                    type="number"
                    id="cost_price"
                    value={formData.cost_price}
                    onChange={(e) => setFormData(prev => ({ ...prev, cost_price: e.target.value }))}
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                  />
                  <small>Inkoopprijs (niet zichtbaar)</small>
                </div>
              </div>
            </div>

            <div className="admin-card">
              <h3 className="admin-card-title">Voorraad</h3>
              
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label htmlFor="sku">SKU</label>
                  <input
                    type="text"
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                    placeholder="PROD-001"
                  />
                </div>

                <div className="admin-form-group">
                  <label htmlFor="barcode">Barcode</label>
                  <input
                    type="text"
                    id="barcode"
                    value={formData.barcode}
                    onChange={(e) => setFormData(prev => ({ ...prev, barcode: e.target.value }))}
                    placeholder="1234567890"
                  />
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label htmlFor="stock_quantity">Voorraad Aantal</label>
                  <input
                    type="number"
                    id="stock_quantity"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, stock_quantity: parseInt(e.target.value) || 0 }))}
                    min="0"
                  />
                </div>

                <div className="admin-form-group">
                  <label htmlFor="low_stock_threshold">Lage Voorraad Drempel</label>
                  <input
                    type="number"
                    id="low_stock_threshold"
                    value={formData.low_stock_threshold}
                    onChange={(e) => setFormData(prev => ({ ...prev, low_stock_threshold: parseInt(e.target.value) || 5 }))}
                    min="0"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="admin-form-sidebar">
            <div className="admin-card">
              <h3 className="admin-card-title">Status</h3>
              
              <div className="admin-form-group">
                <label className="admin-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  />
                  <span>Product is actief</span>
                </label>
              </div>

              <div className="admin-form-group">
                <label className="admin-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                  />
                  <span>Uitgelicht product</span>
                </label>
              </div>
            </div>

            <div className="admin-card">
              <h3 className="admin-card-title">Categorie</h3>
              
              <div className="admin-form-group">
                <select
                  id="category_id"
                  value={formData.category_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                >
                  <option value="">Geen categorie</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="admin-card">
              <div className="admin-form-actions-sidebar">
                <button 
                  type="submit" 
                  className="admin-btn admin-btn-primary admin-btn-full"
                  disabled={isSubmitting}
                >
                  <Save size={18} />
                  {isSubmitting ? 'Opslaan...' : (isEditing ? 'Wijzigingen Opslaan' : 'Product Aanmaken')}
                </button>
                <Link 
                  href="/admin/products"
                  className="admin-btn admin-btn-secondary admin-btn-full"
                >
                  <ArrowLeft size={18} />
                  Annuleren
                </Link>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
