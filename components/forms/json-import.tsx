"use client"

import { useState } from 'react';
import { toast } from 'sonner';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';

const JSONImportForm = ({ onImport }: any) => {
  const [jsonInput, setJsonInput] = useState('');

  const handleSubmit = (e: any) => {
    e.preventDefault();
    try {
      const parsedJson = JSON.parse(jsonInput);
      onImport(parsedJson);
      setJsonInput('');
    } catch (error) {
      toast.error('Invalid JSON format');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <Textarea
        value={jsonInput}
        onChange={(e) => setJsonInput(e.target.value)}
        className="w-full p-2 border"
        rows={5}
        placeholder="Paste your JSON here"
      />
      <Button type="submit" className="mt-2">
        Import JSON
      </Button>
    </form>
  );
};

export default JSONImportForm;
