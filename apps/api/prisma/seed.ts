import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding for 100% Exclusive Saree Store...');

  // Clean existing records if any
  await prisma.review.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  await prisma.banner.deleteMany();

  // Create Admin & Customer User
  const passwordHash = await bcrypt.hash('Admin@123', 10);
  
  await prisma.user.create({
    data: {
      email: 'admin@ramjicollection.com',
      passwordHash,
      firstName: 'Ram Ji',
      lastName: 'Owner',
      phone: '918815179854',
      role: Role.ADMIN,
    },
  });

  const customerPassword = await bcrypt.hash('User@123', 10);
  await prisma.user.create({
    data: {
      email: 'customer@example.com',
      passwordHash: customerPassword,
      firstName: 'Priya',
      lastName: 'Sharma',
      phone: '919876543211',
      role: Role.CUSTOMER,
    },
  });

  console.log('👤 Users created: Admin & Customer');

  // Saree Categories (Pure Saree Store)
  const categoriesData = [
    { name: 'Banarasi Sarees', slug: 'banarasi-sarees', imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80' },
    { name: 'Bandhani Sarees', slug: 'bandhani-sarees', imageUrl: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&auto=format&fit=crop&q=80' },
    { name: 'Organza Sarees', slug: 'organza-sarees', imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80' },
    { name: 'Kanjeevaram Silk', slug: 'kanjeevaram-silk', imageUrl: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=800&auto=format&fit=crop&q=80' },
    { name: 'Leheriya Sarees', slug: 'leheriya-sarees', imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80' },
    { name: 'Georgette Sarees', slug: 'georgette-sarees', imageUrl: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&auto=format&fit=crop&q=80' },
    { name: 'Chanderi Cotton', slug: 'chanderi-cotton', imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80' },
    { name: 'Patola Sarees', slug: 'patola-sarees', imageUrl: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=800&auto=format&fit=crop&q=80' },
  ];

  const categoryMap: Record<string, string> = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.create({ data: cat });
    categoryMap[cat.slug] = created.id;
  }

  console.log('📂 Saree Categories created');

  // Saree Products
  const sareeProducts = [
    {
      name: 'Royal Red Pure Silk Banarasi Saree',
      description: 'Exquisite Handwoven Pure Katan Silk Banarasi Saree featuring heavy Zari kadwa weave pallu and intricate floral jaal body. Comes with unstitched blouse piece.',
      brand: 'Ram Ji Heritage',
      categoryId: categoryMap['banarasi-sarees'],
      price: 12999,
      discount: 20,
      finalPrice: 10399,
      stock: 15,
      sku: 'RJC-BAN-001',
      sizes: ['Unstitched Blouse (0.8m)', 'Custom Stitched'],
      colors: ['Red', 'Golden'],
      material: 'Pure Katan Silk',
      fabric: 'Pure Silk',
      workType: 'Zardosi & Zari Weave',
      occasion: 'Bridal / Wedding',
      sareeStyle: 'Banarasi',
      blouseIncluded: true,
      blouseDetails: 'Unstitched 0.8 meter matching brocade blouse piece',
      sareeLength: '5.5 Meters Saree + 0.8 Meter Blouse',
      careInstructions: 'Dry Clean Only',
      featured: true,
      trending: true,
      newArrival: true,
      bestSeller: true,
      rating: 4.9,
      images: [
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1000&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=1000&auto=format&fit=crop&q=80'
      ]
    },
    {
      name: 'Traditional Jaipuri Bandhani Silk Saree',
      description: 'Authentic handcrafted Bandhej tie-and-dye Saree on Gaji Silk fabric with royal Gota Patti border and floral handwork pallu.',
      brand: 'Ram Ji Artisans',
      categoryId: categoryMap['bandhani-sarees'],
      price: 7499,
      discount: 15,
      finalPrice: 6374,
      stock: 20,
      sku: 'RJC-BND-002',
      sizes: ['Unstitched Blouse (0.8m)'],
      colors: ['Crimson Red', 'Mustard Yellow'],
      material: 'Gaji Silk',
      fabric: 'Gaji Silk',
      workType: 'Gota Patti Work',
      occasion: 'Festive & Pooja',
      sareeStyle: 'Bandhani',
      blouseIncluded: true,
      blouseDetails: 'Unstitched Gaji Silk Blouse with Gota Patti border',
      sareeLength: '5.5 Meters Saree + 0.8 Meter Blouse',
      careInstructions: 'Dry Clean Only. Keep wrapped in cotton cloth.',
      featured: true,
      trending: true,
      newArrival: true,
      bestSeller: true,
      rating: 4.8,
      images: [
        'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=1000&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1000&auto=format&fit=crop&q=80'
      ]
    },
    {
      name: 'Ethereal Floral Printed Organza Saree',
      description: 'Lightweight sheer Organza Saree adorned with hand-painted floral motifs and delicate scalloped embroidery border.',
      brand: 'Ram Ji Couture',
      categoryId: categoryMap['organza-sarees'],
      price: 4999,
      discount: 10,
      finalPrice: 4499,
      stock: 25,
      sku: 'RJC-ORG-003',
      sizes: ['Unstitched Blouse (0.8m)'],
      colors: ['Pastel Pink', 'Sage Green'],
      material: 'Organza Silk',
      fabric: 'Organza',
      workType: 'Embroidery & Handwork',
      occasion: 'Party Wear',
      sareeStyle: 'Organza',
      blouseIncluded: true,
      blouseDetails: 'Satin Silk Unstitched Blouse Piece included',
      sareeLength: '5.5 Meters Saree + 0.8 Meter Blouse',
      careInstructions: 'Gentle Dry Clean Only',
      featured: true,
      trending: true,
      newArrival: true,
      bestSeller: false,
      rating: 4.7,
      images: [
        'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1000&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=1000&auto=format&fit=crop&q=80'
      ]
    },
    {
      name: 'Grand Kanjeevaram Bridal Silk Saree',
      description: 'Opulent Kanchipuram Pure Mulberry Silk Saree featuring gold zari heavy temple border and rich brocade pallu. Perfect for bride and grand receptions.',
      brand: 'Ram Ji Heritage',
      categoryId: categoryMap['kanjeevaram-silk'],
      price: 18999,
      discount: 25,
      finalPrice: 14249,
      stock: 10,
      sku: 'RJC-KAN-004',
      sizes: ['Unstitched Heavy Blouse (0.8m)'],
      colors: ['Maroon Gold', 'Emerald Green'],
      material: 'Pure Mulberry Silk',
      fabric: 'Pure Silk',
      workType: 'Zari Weave',
      occasion: 'Bridal / Wedding',
      sareeStyle: 'Kanjeevaram',
      blouseIncluded: true,
      blouseDetails: 'Matching Heavy Brocade Blouse Piece',
      sareeLength: '5.5 Meters + 0.8 Meter Blouse',
      careInstructions: 'Dry Clean Only',
      featured: true,
      trending: true,
      newArrival: false,
      bestSeller: true,
      rating: 5.0,
      images: [
        'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=1000&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1000&auto=format&fit=crop&q=80'
      ]
    },
    {
      name: 'Multicolor Rajasthani Leheriya Georgette Saree',
      description: 'Vibrant wave-pattern Leheriya Saree crafted on fine pure Georgette with mirror work hand embroidery and silver gota border.',
      brand: 'Ram Ji Artisans',
      categoryId: categoryMap['leheriya-sarees'],
      price: 3999,
      discount: 10,
      finalPrice: 3599,
      stock: 30,
      sku: 'RJC-LHR-005',
      sizes: ['Unstitched Blouse (0.8m)'],
      colors: ['Multicolor', 'Pink & Orange'],
      material: 'Pure Georgette',
      fabric: 'Georgette',
      workType: 'Mirror Work & Gota',
      occasion: 'Haldi / Mehendi',
      sareeStyle: 'Leheriya',
      blouseIncluded: true,
      blouseDetails: 'Dupion Silk Unstitched Blouse',
      sareeLength: '5.5 Meters Saree + 0.8 Meter Blouse',
      careInstructions: 'Dry Clean Only',
      featured: false,
      trending: true,
      newArrival: true,
      bestSeller: false,
      rating: 4.6,
      images: [
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1000&auto=format&fit=crop&q=80'
      ]
    },
    {
      name: 'Designer Sequin Work Chiffon Saree',
      description: 'Glamorous Bollywood style Chiffon Saree fully embellished with tonal micro-sequins work. Lightweight drape that moves effortlessly.',
      brand: 'Ram Ji Couture',
      categoryId: categoryMap['georgette-sarees'],
      price: 5999,
      discount: 20,
      finalPrice: 4799,
      stock: 18,
      sku: 'RJC-CHI-006',
      sizes: ['Unstitched Blouse (0.8m)'],
      colors: ['Black', 'Midnight Blue'],
      material: 'Chiffon Georgette',
      fabric: 'Chiffon',
      workType: 'Sequins Work',
      occasion: 'Party Wear',
      sareeStyle: 'Bollywood / Designer',
      blouseIncluded: true,
      blouseDetails: 'Heavy Sequinned Velvet Blouse Piece',
      sareeLength: '5.5 Meters + 0.8 Meter Blouse',
      careInstructions: 'Dry Clean Only',
      featured: true,
      trending: true,
      newArrival: true,
      bestSeller: true,
      rating: 4.9,
      images: [
        'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=1000&auto=format&fit=crop&q=80'
      ]
    }
  ];

  for (const prod of sareeProducts) {
    const { images, ...prodFields } = prod;
    const createdProduct = await prisma.product.create({
      data: prodFields
    });

    for (let i = 0; i < images.length; i++) {
      await prisma.productImage.create({
        data: {
          productId: createdProduct.id,
          url: images[i],
          isPrimary: i === 0
        }
      });
    }
  }

  console.log('🛍️ Pure Saree Products created');

  // Create Hero Banners
  await prisma.banner.createMany({
    data: [
      {
        title: 'The Royal Saree Collection',
        subtitle: 'Handcrafted Banarasi, Bandhani & Organza Sarees woven with timeless elegance',
        imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1600&auto=format&fit=crop&q=80',
        linkUrl: '/shop',
        type: 'HERO'
      },
      {
        title: 'Bridal & Heritage Silk Specials',
        subtitle: 'Pure Kanjivaram & Heavy Zardosi Sarees for your special day',
        imageUrl: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=1600&auto=format&fit=crop&q=80',
        linkUrl: '/shop?occasion=Bridal',
        type: 'PROMO'
      }
    ]
  });

  console.log('🎨 Saree Hero Banners created');
  console.log('✅ 100% Saree Database seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
