// "use client";

// import React from 'react'
// import { Button } from '../ui/button'
// import { generateSubscription } from '@/lib/actions/admin.actions';

// async function GenerateSPButton() {

//   const handleSubscriptionClick = async () => {
//     try {
//       await generateSubscription();
//     } catch (error) {
//       console.error('Error generating subscription.', error);
//     }
//   };

//   return (
//     <Button
//     className='px-0 w-full'
//     variant='outline'
//     onClick={handleSubscriptionClick}
//     >Create Super Account</Button>
//   )
// }

// export default GenerateSPButton

"use client";

import React, { useState } from "react";
import { Button } from "../ui/button";
import { generateSubscription } from "@/lib/actions/admin.actions";

function GenerateSPButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubscriptionClick = async () => {
    setLoading(true);
    setError(null);
    try {
      await generateSubscription();
    } catch (error) {
      console.error("Error generating subscription.", error);
      //setError("Failed to create super account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button
        className="px-0 w-full"
        variant="outline"
        onClick={handleSubscriptionClick}
        disabled={loading}>
        {loading ? "Creating..." : "Create Super Account"}
      </Button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}

export default GenerateSPButton;
