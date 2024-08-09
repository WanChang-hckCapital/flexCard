import React from 'react';

const TestForm = () => {
    return (
        <div>
            <h1>TEST</h1>
            <form method="post" action="https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5">
                <div>
                    <label>MerchantID:</label>
                    <input name="MerchantID" value="3002607" readOnly />
                </div>
                <div>
                    <label>MerchantTradeNo:</label>
                    <input name="MerchantTradeNo" value="202407301341" readOnly />
                </div>
                <div>
                    <label>MerchantTradeDate:</label>
                    <input name="MerchantTradeDate" value="2024/07/30 13:41:00" readOnly />
                </div>
                <div>
                    <label>PaymentType:</label>
                    <input name="PaymentType" value="aio" readOnly />
                </div>
                <div>
                    <label>TotalAmount:</label>
                    <input name="TotalAmount" value="5" readOnly />
                </div>
                <div>
                    <label>TradeDesc:</label>
                    <input name="TradeDesc" value="Test Transaction" readOnly />
                </div>
                <div>
                    <label>ItemName:</label>
                    <input name="ItemName" value="Hoo hoo" readOnly />
                </div>
                <div>
                    <label>ReturnURL:</label>
                    <input name="ReturnURL" value="http://localhost:3000/api/ecpay/callback" readOnly />
                </div>
                <div>
                    <label>ClientBackURL:</label>
                    <input name="ClientBackURL" value="http://localhost:3000/order-complete" readOnly />
                </div>
                <div>
                    <label>ChoosePayment:</label>
                    <input name="ChoosePayment" value="ALL" readOnly />
                </div>
                <div>
                    <label>EncryptType:</label>
                    <input name="EncryptType" value="1" readOnly />
                </div>
                <div>
                    <label>CheckMacValue:</label>
                    <input name="CheckMacValue" value="BF918798400BE5318E94E95EEE5DEDDABB07140480D55D228E76D7784F0EAC54" readOnly />
                </div>
                <div>
                    <input type="submit" value="Send" />
                </div>
            </form>
        </div>
    );
};

export default TestForm;
