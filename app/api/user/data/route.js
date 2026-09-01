import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectDB } from "@/config/db";
import User from "@/models/User";
import Product from "@/models/Product";
import mongoose from "mongoose";

export async function GET(request) {
    try {
        const { userId } = getAuth(request);

        if (!userId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ success: false, message: "User not found" });
        }

        const cartItems = user.cartItems || {};
        const cleanedCart = {};
        const cartProductIds = Object.keys(cartItems).filter((itemId) => mongoose.isValidObjectId(itemId));
        const products = await Product.find({ _id: { $in: cartProductIds } })
            .select("_id offerPrice")
            .lean();
        const validProductIds = new Set(products.map((product) => product._id.toString()));

        for (const itemId of Object.keys(cartItems)) {
            if (validProductIds.has(itemId)) {
                cleanedCart[itemId] = cartItems[itemId];
            }
        }

        if (JSON.stringify(cartItems) !== JSON.stringify(cleanedCart)) {
            user.cartItems = cleanedCart;
            await user.save();
        }

        return NextResponse.json({ success: true, user });

    } catch (error) {
        return NextResponse.json({ success: false, message: error.message });
    }
}
