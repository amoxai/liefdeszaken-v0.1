import { createClient } from '@/lib/supabase/server';
import ProductForm from '@/components/admin/ProductForm';

async function getCategories() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('categories')
    .select('id, name')
    .eq('is_active', true)
    .order('name');
  
  return data || [];
}

export default async function NewProductPage() {
  const categories = await getCategories();

  return <ProductForm categories={categories} />;
}
