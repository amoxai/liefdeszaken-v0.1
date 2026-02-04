import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET all products (admin)
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  
  // Check auth and admin role
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data: products, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(id, name),
      images:product_images(id, url, alt_text, position)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(products);
}

// POST create new product
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  
  // Check auth and admin role
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { images, ...productData } = body;

    // Create product
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({
        name: productData.name,
        slug: productData.slug,
        description: productData.description,
        short_description: productData.short_description,
        price: parseFloat(productData.price),
        compare_at_price: productData.compare_at_price ? parseFloat(productData.compare_at_price) : null,
        cost_price: productData.cost_price ? parseFloat(productData.cost_price) : null,
        sku: productData.sku || null,
        barcode: productData.barcode || null,
        stock_quantity: productData.stock_quantity || 0,
        low_stock_threshold: productData.low_stock_threshold || 5,
        category_id: productData.category_id || null,
        is_active: productData.is_active ?? true,
        is_featured: productData.is_featured ?? false,
        weight: productData.weight ? parseFloat(productData.weight) : null,
        meta_title: productData.meta_title || null,
        meta_description: productData.meta_description || null,
      })
      .select()
      .single();

    if (productError) {
      return NextResponse.json({ error: productError.message }, { status: 500 });
    }

    // Add images if provided
    if (images && images.length > 0) {
      const imageRecords = images.map((url: string, index: number) => ({
        product_id: product.id,
        url,
        alt_text: productData.name,
        position: index,
      }));

      await supabase.from('product_images').insert(imageRecords);
    }

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
