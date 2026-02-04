import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET single product
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createClient();
  
  const { data: product, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(id, name),
      images:product_images(id, url, alt_text, position)
    `)
    .eq('id', id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json(product);
}

// PUT update product
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
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

    // Update product
    const { data: product, error: productError } = await supabase
      .from('products')
      .update({
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
      .eq('id', id)
      .select()
      .single();

    if (productError) {
      return NextResponse.json({ error: productError.message }, { status: 500 });
    }

    // Update images if provided
    if (images) {
      // Delete existing images
      await supabase.from('product_images').delete().eq('product_id', id);

      // Add new images
      if (images.length > 0) {
        const imageRecords = images.map((url: string, index: number) => ({
          product_id: id,
          url,
          alt_text: productData.name,
          position: index,
        }));

        await supabase.from('product_images').insert(imageRecords);
      }
    }

    return NextResponse.json(product);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE product
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
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

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
