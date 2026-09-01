import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Order from "@/models/Order";
import { getAuth } from "@clerk/nextjs/server";
import authSeller from '@/lib/authSeller';
import Address from "@/models/Address";


export async function GET(request) {
    try {
        const { userId } = getAuth(request);
        const isSeller = await authSeller(userId);

        if (!isSeller) {
            return NextResponse.json({
                success: false,
                message: "You are not authorized to view products"
            }, { status: 403 });
        }

        await connectDB();

        const orders = await Order.find({})
            .populate('address')
            .populate('items.product');

        // ✅ Sanitize orders: remove items with missing products
        const cleanedOrders = orders.map(order => {
            const cleanedItems = order.items.filter(item => item.product !== null);
            return {
                ...order.toObject(),
                items: cleanedItems
            };
        });

        return NextResponse.json({ success: true, orders: cleanedOrders });

    } catch (error) {
        return NextResponse.json({
            success: false,
            message: error.message
        });
    }
}
