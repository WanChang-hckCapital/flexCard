import { redirect } from 'next/navigation';
import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { fetchTransactionStatusFromSubsciptionId } from '@/lib/actions/admin.actions';
import Link from 'next/link';

type Props = {
    params: { id: string },
    searchParams: { transactionId: string }
}

const RedirectPage = async ({ params, searchParams }: Props) => {
    const { id } = params;
    const { transactionId } = searchParams;

    if (!transactionId) {
        return (
            <div className="text-red-500">Missing transactionId</div>
        );
    }

    const paymentStatus = await fetchTransactionStatusFromSubsciptionId(id, transactionId);
    
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            {paymentStatus.success === true ? (
                <div className="p-8 rounded-lg shadow-md text-center max-w-md w-full">
                    <div className="flex justify-center mb-4">
                        <img src="/payment-success.png" alt="Success" className="h-48 w-48" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">
                        {paymentStatus.status === true ? 'Thank you for subscribing!' : 'Payment Failed'}
                    </h2>
                    <p className="text-gray-600 mb-4">
                        {paymentStatus.message}
                    </p>
                    <div className="flex justify-center space-x-4">
                        <Link href="/workspace/create-card" className="bg-blue-500 text-white px-4 py-2 rounded-lg">
                            flexCard Now
                        </Link>
                        <Link href="/" className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg">
                            Back to Home
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="p-8 rounded-lg shadow-md text-center max-w-md w-full">
                    <div className="flex justify-center mb-4">
                        <img src="/payment-failed.png" alt="Failed" className="h-48 w-48" />
                    </div>
                    <p className="text-gray-600 mb-4">
                        {paymentStatus.message}
                    </p>
                    <div className="flex justify-center space-x-4">
                        <Link href="/contact/customer-service" className="bg-blue-500 text-white px-4 py-2 rounded-lg">
                            Customer Service
                        </Link>
                        <Link href="/" className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg">
                            Back to Home
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RedirectPage;
