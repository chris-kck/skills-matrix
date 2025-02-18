'use client';

import { useState } from 'react';
import { api } from '~/trpc/react';

export default function TestDbPage() {
  const [result, setResult] = useState<string>('');
  const testQuery = api.post.testNeo4j.useMutation({
    onSuccess: (data) => {
      setResult(JSON.stringify(data, null, 2));
    },
    onError: (error) => {
      setResult(`Error: ${error.message}`);
    },
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Neo4j Connection Test</h1>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={() => testQuery.mutate()}
      >
        Test Connection
      </button>
      {result && (
        <pre className="mt-4 p-4 bg-gray-100 rounded">
          {result}
        </pre>
      )}
    </div>
  );
}
