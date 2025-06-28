// scripts/adminSeeder.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Admin } from '../src/app/modules/Dashboard/admin/admin.model'; // admin model import

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL as string);

    const email = 'admin@gmail.com';
    const existing = await Admin.findOne({ email });
    if (existing) {
      console.log('⚠️ Admin already exists');
    } else {
      await Admin.create({
        fullName: 'Alamin',
        email,
        password: 'admin123', // pre-save hook e hash hobe
        role: 'admin',
      });
      console.log('✅ Admin seeded successfully');
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Error seeding admin:', err);
  }
};

seedAdmin();
