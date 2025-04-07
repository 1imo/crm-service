import { NextResponse } from 'next/server';
import { RoomRepository } from '@/repositories/RoomRepository';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const roomRepository = new RoomRepository();
    const rooms = await roomRepository.getRoomsByCustomer(params.id);
    return NextResponse.json(rooms);
  } catch (error) {
    console.error('Failed to fetch rooms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rooms' },
      { status: 500 }
    );
  }
} 