"use client"

import Link from 'next/link';
import { useState } from 'react';

interface SettingSidebarProps {
  setActiveComponent: (component: string) => void;
}

const SettingSidebar = ({ setActiveComponent }: SettingSidebarProps) => {
  const [active, setActive] = useState('edit-profile');

  const handleLinkClick = (component: string) => {
    setActive(component);
    setActiveComponent(component);
  };

  return (
    <aside className="w-64 bg-dark-2 h-screen p-6">
      <div className="text-light-2 mb-10">
        <h2 className="text-xl font-semibold">Settings</h2>
      </div>
      <nav>
        <ul className="space-y-4">
          <li>
            <Link href="#">
              <a
                onClick={() => handleLinkClick('edit-profile')}
                className={`block p-3 rounded-lg ${
                  active === 'edit-profile' ? 'bg-light-3' : ''
                }`}
              >
                Edit profile
              </a>
            </Link>
          </li>
          <li>
            <Link href="#">
              <a
                onClick={() => handleLinkClick('notifications')}
                className={`block p-3 rounded-lg ${
                  active === 'notifications' ? 'bg-light-3' : ''
                }`}
              >
                Notifications
              </a>
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default SettingSidebar;
