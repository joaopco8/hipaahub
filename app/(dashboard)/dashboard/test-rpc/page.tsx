'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { testOrganizationRPC } from '@/app/actions/test-organization-rpc';

export default function TestRPCPage() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleTest = async () => {
    setTesting(true);
    setResult(null);
    
    try {
      const testResult = await testOrganizationRPC();
      setResult(testResult);
    } catch (error: any) {
      setResult({
        success: false,
        error: {
          layer: 'frontend',
          message: error.message,
          solution: 'Erro ao executar teste'
        },
        logs: [`Erro: ${error.message}`, error.stack]
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Teste RPC - upsert_organization_jsonb</CardTitle>
          <CardDescription>
            Teste definitivo da função RPC para diagnosticar problemas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleTest} 
            disabled={testing}
            className="w-full"
          >
            {testing ? 'Testando...' : 'Executar Teste'}
          </Button>

          {result && (
            <div className="mt-6 space-y-4">
              <div className={`p-4 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <h3 className="font-semibold mb-2">
                  {result.success ? '✅ Teste Passou' : '❌ Teste Falhou'}
                </h3>
                <p className="text-sm">Etapa: {result.step}</p>
                
                {result.error && (
                  <div className="mt-3 space-y-2">
                    <p className="text-sm"><strong>Camada:</strong> {result.error.layer}</p>
                    <p className="text-sm"><strong>Erro:</strong> {result.error.message}</p>
                    {result.error.code && (
                      <p className="text-sm"><strong>Código:</strong> {result.error.code}</p>
                    )}
                    <div className="mt-2 p-2 bg-yellow-50 rounded">
                      <p className="text-sm font-semibold">Solução:</p>
                      <p className="text-sm">{result.error.solution}</p>
                    </div>
                  </div>
                )}

                {result.data && (
                  <div className="mt-3">
                    <p className="text-sm font-semibold">Dados retornados:</p>
                    <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              {result.logs && result.logs.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Logs Completos:</h4>
                  <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-xs overflow-auto max-h-96">
                    {result.logs.map((log: string, index: number) => (
                      <div key={index}>{log}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
