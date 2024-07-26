import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { RtnCode, RtnMsg, TradeNo, MerchantTradeNo, CheckMacValue } = await req.json() as { RtnCode: number; RtnMsg: string; TradeNo: string; MerchantTradeNo: string; CheckMacValue: string };

    return NextResponse.json({ status: 'success', message: 'Payment callback received' });
  } catch (err: any) {
    return NextResponse.json({ status: 'fail', message: err.message });
  }
}
