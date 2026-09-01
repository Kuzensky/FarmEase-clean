import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import Product from "@/models/Product";
import User from "@/models/User";
import Address from "@/models/Address";
import { inngest } from "@/config/inngest";
import connectDB from "@/config/db";
import mongoose from "mongoose";

export async function POST(request) {
    try {

        const { userId } = getAuth(request)
        const { address, items } = await request.json()

        if (!userId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        if (!address || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({
                success: false,
                message: "Invalid Data"
            }, { status: 400 })

        }

        const validItems = items.every(
            (item) => mongoose.isValidObjectId(item?.product) && Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= 99
        );

        if (!validItems || !mongoose.isValidObjectId(address)) {
            return NextResponse.json({ success: false, message: "Invalid order items" }, { status: 400 });
        }

        await connectDB();

        const [products, shippingAddress, user] = await Promise.all([
            Product.find({ _id: { $in: items.map((item) => item.product) } }).lean(),
            Address.findOne({ _id: address, userId }).lean(),
            User.findById(userId),
        ]);

        const productPrices = new Map(products.map((product) => [product._id.toString(), product.offerPrice]));
        const missingProduct = items.some((item) => !productPrices.has(item.product));

        if (missingProduct) {
            return NextResponse.json({ success: false, message: "One or more products are unavailable" }, { status: 400 });
        }

        if (!shippingAddress) {
            return NextResponse.json({ success: false, message: "Shipping address not found" }, { status: 400 });
        }

        if (!user) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }

        const amount = items.reduce(
            (total, item) => total + productPrices.get(item.product) * item.quantity,
            0
        );

        await inngest.send({
            name: "order/created",
            data: {
                userId,
                address,
                items,
                amount: amount + Math.floor(amount * 0.02 ),
                date: Date.now( )
            }
        })

        user.cartItems = {}
        await user.save()

        return NextResponse.json({
            success: true,
            message: 'Order Placed'
        })


    } catch (error) {
        return NextResponse.json({
            success: false,
            message: error.message
        })
    }
}
