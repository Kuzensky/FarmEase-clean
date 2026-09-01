import { getAuth } from "@clerk/nextjs/server";
import Address from "@/models/Address";
import connectDB from "@/config/db";
import { NextResponse } from "next/server";


export async function POST(request) {
    try {

        const { userId } = getAuth(request)
        const { address } = await request.json()

        if (!userId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const requiredFields = ["fullName", "phoneNumber", "pincode", "area", "city", "state"];
        if (!address || requiredFields.some((field) => !String(address[field] ?? "").trim())) {
            return NextResponse.json({ success: false, message: "Please complete every address field" }, { status: 400 });
        }

        await connectDB()
        const newAddress = await Address.create({...address, userId })

        return NextResponse.json({ success: true, message: "Address added successfully", newAddress })

    } catch (error) {
        return NextResponse.json({
            success: false,
            message: error.message
        })
    }
}
