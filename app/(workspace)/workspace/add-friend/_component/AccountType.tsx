"use client";

import React from "react";

interface AccountTypeProps {
  accountType: string;
}

const AccountType: React.FC<AccountTypeProps> = ({ accountType }) => {
  return (
    <div className="flex items-center justify-center">
      <h1 className="text-center">You are a {accountType} account!</h1>
    </div>
  );
};

export default AccountType;
