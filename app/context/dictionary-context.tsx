"use client"

import React, { createContext, useContext } from 'react';

const DictContext = createContext<Record<string, any> | null>(null);

export const useDict = () => {
    const context = useContext(DictContext);
    if (!context) {
        throw new Error('useDictionary must be used within a DictProvider');
    }
    return context;
};

export const DictProvider = ({ children, dict }: { children: React.ReactNode; dict: Record<string, any> }) => {
    return <DictContext.Provider value={dict}>
        {children}
    </DictContext.Provider>;
};
