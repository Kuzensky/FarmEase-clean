import connectDB from "@/config/db";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import User from "@/models/User";


export async function POST(request) {
    try {

        const { userId } = getAuth(request)

        if (!userId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const { cartData } = await request.json()

        if (!cartData || typeof cartData !== "object" || Array.isArray(cartData)) {
            return NextResponse.json({ success: false, message: "Invalid cart data" }, { status: 400 });
        }

        const quantitiesAreValid = Object.values(cartData).every(
            (quantity) => Number.isInteger(quantity) && quantity > 0 && quantity <= 99
        );
        if (!quantitiesAreValid) {
            return NextResponse.json({ success: false, message: "Invalid cart quantity" }, { status: 400 });
        }

        await connectDB()
        const user = await User.findById(userId)

        if (!user) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }

        user.cartItems= cartData
        await user.save()

        return NextResponse.json({
            success: true,
        })

    } catch (error) {
        return NextResponse.json({
            success: false,
            message: error.message
        })
    }
}
