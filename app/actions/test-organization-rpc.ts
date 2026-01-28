/**
 * TESTE DEFINITIVO - Organization RPC
 * 
 * Este script testa a função RPC upsert_organization_jsonb de forma completa
 * Execute via: await testOrganizationRPC()
 * 
 * 'use server' - Esta é uma Server Action
 */

'use server';

import { createClient } from '@/utils/supabase/server';

interface TestResult {
  success: boolean;
  step: string;
  error?: {
    layer: 'frontend' | 'rpc' | 'postgrest' | 'postgres';
    message: string;
    code?: string;
    details?: any;
    solution: string;
  };
  data?: any;
  logs: string[];
}

export async function testOrganizationRPC(): Promise<TestResult> {
  const logs: string[] = [];
  const log = (msg: string) => {
    console.log(`[TEST] ${msg}`);
    logs.push(`[${new Date().toISOString()}] ${msg}`);
  };

  try {
    // ========================================================================
    // PASSO 1: Criar cliente Supabase
    // ========================================================================
    log('PASSO 1: Criando cliente Supabase...');
    const supabase = createClient();
    log('✅ Cliente Supabase criado');

    // ========================================================================
    // PASSO 2: Verificar autenticação
    // ========================================================================
    log('PASSO 2: Verificando autenticação...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      log(`❌ Erro ao obter usuário: ${authError.message}`);
      return {
        success: false,
        step: 'authentication',
        error: {
          layer: 'frontend',
          message: authError.message,
          code: authError.status?.toString(),
          details: authError,
          solution: 'Verifique se o usuário está logado. Faça login novamente.'
        },
        logs
      };
    }

    if (!user) {
      log('❌ Usuário não autenticado');
      return {
        success: false,
        step: 'authentication',
        error: {
          layer: 'frontend',
          message: 'User not authenticated',
          solution: 'Faça login antes de testar a função RPC.'
        },
        logs
      };
    }

    log(`✅ Usuário autenticado: ${user.id}`);
    log(`   - Tipo de user.id: ${typeof user.id}`);
    log(`   - Valor de user.id: ${user.id}`);
    log(`   - É UUID válido: ${/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id)}`);

    // ========================================================================
    // PASSO 3: Verificar auth.uid() no backend (via RPC de teste)
    // ========================================================================
    log('PASSO 3: Verificando auth.uid() no backend...');
    
    // Criar payload mínimo válido
    const testPayload = {
      name: 'Test Organization',
      legal_name: 'Test Organization Legal Name',
      type: 'medical',
      state: 'CA',
      employee_count: 1,
      address_street: '123 Test St',
      address_city: 'Test City',
      address_state: 'CA',
      address_zip: '12345',
      security_officer_name: 'Test Security Officer',
      security_officer_email: 'security@test.com',
      security_officer_role: 'Security Officer',
      privacy_officer_name: 'Test Privacy Officer',
      privacy_officer_email: 'privacy@test.com',
      privacy_officer_role: 'Privacy Officer',
      has_employees: true,
      uses_contractors: false,
      stores_phi_electronically: true,
      uses_cloud_services: false
    };

    log('Payload criado:');
    log(JSON.stringify(testPayload, null, 2));
    log(`   - Tipo: ${typeof testPayload}`);
    log(`   - Keys: ${Object.keys(testPayload).join(', ')}`);

    // ========================================================================
    // PASSO 4: Chamar RPC
    // ========================================================================
    log('PASSO 4: Chamando RPC upsert_organization_jsonb...');
    log(`   - Função: upsert_organization_jsonb`);
    log(`   - Parâmetros: { p_data: ${JSON.stringify(testPayload).substring(0, 100)}... }`);
    log(`   - NÃO enviando p_user_id (correto)`);
    log(`   - NÃO enviando user_id no payload (correto)`);

    const rpcStartTime = Date.now();
    const { data: rpcResult, error: rpcError } = await supabase.rpc('upsert_organization_jsonb', {
      p_data: testPayload
    });
    const rpcEndTime = Date.now();
    const rpcDuration = rpcEndTime - rpcStartTime;

    log(`   - Duração: ${rpcDuration}ms`);

    // ========================================================================
    // PASSO 5: Analisar resultado
    // ========================================================================
    log('PASSO 5: Analisando resultado...');

    if (rpcError) {
      log(`❌ Erro na RPC: ${rpcError.message}`);
      log(`   - Code: ${rpcError.code}`);
      log(`   - Details: ${JSON.stringify(rpcError.details)}`);
      log(`   - Hint: ${rpcError.hint}`);

      // Diagnosticar camada do erro
      let errorLayer: 'frontend' | 'rpc' | 'postgrest' | 'postgres' = 'rpc';
      let solution = '';

      if (rpcError.code === '42883' || rpcError.message?.includes('does not exist')) {
        errorLayer = 'postgrest';
        solution = 'A função não existe no banco. Execute: scripts/VERIFY-AND-CREATE-CORRECT-FUNCTION.sql';
      } else if (rpcError.message?.includes('operator does not exist') && rpcError.message?.includes('text = uuid')) {
        errorLayer = 'postgres';
        solution = 'Ainda existe uma função antiga com parâmetro text. Execute: scripts/NUCLEAR-CLEAN-AND-RECREATE.sql';
      } else if (rpcError.message?.includes('User must be authenticated')) {
        errorLayer = 'postgres';
        solution = 'auth.uid() retornou NULL. Verifique se o token JWT está válido.';
      } else if (rpcError.message?.includes('null value') || rpcError.message?.includes('violates not-null constraint')) {
        errorLayer = 'postgres';
        solution = 'Campo obrigatório não foi fornecido no payload. Verifique o payload.';
      } else if (rpcError.code?.startsWith('42')) {
        errorLayer = 'postgres';
        solution = 'Erro de sintaxe SQL na função. Verifique a função no banco.';
      } else if (rpcError.code?.startsWith('PGRST')) {
        errorLayer = 'postgrest';
        solution = 'Erro do PostgREST. Execute: NOTIFY pgrst, \'reload schema\'; no Supabase SQL Editor.';
      }

      return {
        success: false,
        step: 'rpc_call',
        error: {
          layer: errorLayer,
          message: rpcError.message || 'Unknown RPC error',
          code: rpcError.code,
          details: {
            hint: rpcError.hint,
            details: rpcError.details,
            fullError: rpcError
          },
          solution
        },
        logs
      };
    }

    if (!rpcResult) {
      log('⚠️ RPC não retornou erro nem resultado');
      return {
        success: false,
        step: 'rpc_result',
        error: {
          layer: 'rpc',
          message: 'RPC returned neither error nor result',
          solution: 'A função pode não estar retornando dados. Verifique a função no banco.'
        },
        logs
      };
    }

    log('✅ RPC executou com sucesso!');
    log(`   - Tipo do resultado: ${typeof rpcResult}`);
    log(`   - É array: ${Array.isArray(rpcResult)}`);
    
    const organization = Array.isArray(rpcResult) ? rpcResult[0] : rpcResult;
    
    if (organization) {
      log(`   - Organização retornada: ${JSON.stringify(organization, null, 2).substring(0, 200)}...`);
      log(`   - ID: ${organization.id}`);
      log(`   - User ID: ${organization.user_id}`);
      log(`   - Name: ${organization.name}`);
      
      // Verificar se user_id da organização corresponde ao usuário autenticado
      if (organization.user_id !== user.id) {
        log(`⚠️ ATENÇÃO: user_id da organização (${organization.user_id}) não corresponde ao usuário autenticado (${user.id})`);
      } else {
        log(`✅ user_id corresponde corretamente ao usuário autenticado`);
      }
    } else {
      log('⚠️ Resultado está vazio');
    }

    // ========================================================================
    // SUCESSO
    // ========================================================================
    return {
      success: true,
      step: 'complete',
      data: organization,
      logs
    };

  } catch (error: any) {
    log(`❌ Erro inesperado: ${error.message}`);
    log(`   - Stack: ${error.stack}`);
    
    return {
      success: false,
      step: 'unexpected_error',
      error: {
        layer: 'frontend',
        message: error.message || 'Unknown error',
        details: {
          stack: error.stack,
          name: error.name
        },
        solution: 'Erro inesperado no frontend. Verifique o console para mais detalhes.'
      },
      logs
    };
  }
}

// Função removida - use testOrganizationRPC() diretamente
