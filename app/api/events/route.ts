import { Event } from "@/database";
import connectDB from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from 'cloudinary';

export async function GET() {
    try {
        await connectDB();

        const events = await Event.find().sort({ createdAt: -1 });

        return NextResponse.json({ message: 'Events successfully fetching', events }, { status: 200 })
    } catch (error) {
        return NextResponse.json({message: 'Event Fetching fail', error}, {status: 500})
    }
}

export async function POST(req: NextRequest){
    try {
        await connectDB();

        const formData = await req.formData();
        let event;

        try {
            event = Object.fromEntries(formData.entries());
        } catch (error) {
            return NextResponse.json({ message: 'Invalid JSON data Format'}, { status: 400})
        }

        const file = formData.get('image') as File;

        if(!file) return NextResponse.json({ message: 'Image file is required'}, { status: 400 });

        let tags = JSON.parse(formData.get('tags') as string);
        let agenda = JSON.parse(formData.get('agenda') as string);

        const arrayBuffer = await file.arrayBuffer();
    
        const buffer = Buffer.from(arrayBuffer);

        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({ resource_type: 'image', folder: 'next-16'}, (error, result) => {
                if(error) return reject(error);

                resolve(result);
            }).end(buffer);
        });

        event.image = (uploadResult as { secure_url: string}).secure_url;

        const createdEvent = await Event.create({
            ...event,
            tags: tags,
            agenda: agenda,
        });

        return NextResponse.json({ message: 'Create event successfully', event: createdEvent}, {status: 201})
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Event Creation Failed', error: error instanceof Error ? error.message : 'Unknown'}, { status: 500})
    }
}