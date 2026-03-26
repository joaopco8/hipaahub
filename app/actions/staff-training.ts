'use server';

import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { revalidatePath } from 'next/cache';

// ─── Types ───────────────────────────────────────────────────

export type RoleGroup = 'Clinical' | 'Admin' | 'Contractor' | 'Intern';
export type AssignmentStatus = 'not_started' | 'in_progress' | 'completed' | 'expired';

export interface Employee {
  id: string;
  org_id: string;
  first_name: string;
  last_name: string;
  email: string;
  role_group: RoleGroup;
  hire_date: string | null;
  is_active: boolean;
  created_at: string;
}

export interface TrainingModule {
  id: string;
  module_name: string;
  module_description: string | null;
  role_groups: string[];
  duration_minutes: number;
  expiration_months: number;
  is_required: boolean;
}

export interface TrainingAssignment {
  id: string;
  employee_id: string;
  module_id: string;
  org_id: string;
  assigned_at: string;
  due_date: string | null;
  started_at: string | null;
  completed_at: string | null;
  expires_at: string | null;
  status: AssignmentStatus;
  employee?: Employee;
  module?: TrainingModule;
  certificate?: { id: string; certificate_pdf_url: string | null } | null;
}

export interface EmployeeWithAssignments extends Employee {
  assignments: TrainingAssignment[];
  compliance_pct: number;
}

export interface TrainingOverviewStats {
  total_employees: number;
  fully_compliant: number;
  compliance_pct: number;
  total_assignments: number;
  completed: number;
  in_progress: number;
  not_started: number;
  expired: number;
}

// ─── Helpers ────────────────────────────────────────────────

async function getOrgId(userId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from('organizations')
    .select('id')
    .eq('user_id', userId)
    .single();
  return data?.id as string | undefined;
}

function addDays(date: Date, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function addMonths(date: Date, months: number): string {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d.toISOString();
}

// ─── Employees ───────────────────────────────────────────────

export async function getEmployees(): Promise<Employee[]> {
  const supabase = createClient();
  const user = await getUser(supabase);
  if (!user) throw new Error('Unauthorized');
  const orgId = await getOrgId(user.id);
  if (!orgId) return [];

  const { data, error } = await (supabase as any)
    .from('employees')
    .select('*')
    .eq('org_id', orgId)
    .order('last_name');
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createEmployee(payload: {
  first_name: string;
  last_name: string;
  email: string;
  role_group: RoleGroup;
  hire_date?: string;
}): Promise<Employee> {
  const supabase = createClient();
  const user = await getUser(supabase);
  if (!user) throw new Error('Unauthorized');
  const orgId = await getOrgId(user.id);
  if (!orgId) throw new Error('No organization found');

  const { data, error } = await (supabase as any)
    .from('employees')
    .insert({ ...payload, org_id: orgId, created_by: user.id })
    .select()
    .single();
  if (error) throw new Error(error.message);

  // Auto-assign required modules for this role_group
  await autoAssignModules(data.id, payload.role_group, orgId);

  revalidatePath('/dashboard/training');
  return data;
}

export async function updateEmployee(
  id: string,
  payload: Partial<Pick<Employee, 'first_name' | 'last_name' | 'email' | 'role_group' | 'hire_date' | 'is_active'>>
): Promise<void> {
  const supabase = createClient();
  const user = await getUser(supabase);
  if (!user) throw new Error('Unauthorized');
  const orgId = await getOrgId(user.id);
  if (!orgId) throw new Error('No organization found');

  const { error } = await (supabase as any)
    .from('employees')
    .update(payload)
    .eq('id', id)
    .eq('org_id', orgId);
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/training');
}

export async function deactivateEmployee(id: string): Promise<void> {
  return updateEmployee(id, { is_active: false });
}

export async function bulkImportEmployees(
  rows: { first_name: string; last_name: string; email: string; role_group: RoleGroup }[]
): Promise<{ created: number; errors: string[] }> {
  const supabase = createClient();
  const user = await getUser(supabase);
  if (!user) throw new Error('Unauthorized');
  const orgId = await getOrgId(user.id);
  if (!orgId) throw new Error('No organization found');

  let created = 0;
  const errors: string[] = [];

  for (const row of rows) {
    try {
      const { data, error } = await (supabase as any)
        .from('employees')
        .insert({ ...row, org_id: orgId, created_by: user.id })
        .select()
        .single();
      if (error) {
        errors.push(`${row.email}: ${error.message}`);
      } else {
        await autoAssignModules(data.id, row.role_group, orgId);
        created++;
      }
    } catch (e: any) {
      errors.push(`${row.email}: ${e.message}`);
    }
  }

  revalidatePath('/dashboard/training');
  return { created, errors };
}

// ─── Modules ────────────────────────────────────────────────

export async function getTrainingModules(): Promise<TrainingModule[]> {
  const supabase = createClient();
  const user = await getUser(supabase);
  if (!user) throw new Error('Unauthorized');
  const orgId = await getOrgId(user.id);
  if (!orgId) return [];

  const { data, error } = await (supabase as any)
    .from('training_modules')
    .select('*')
    .eq('organization_id', orgId)
    .order('module_name');
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createTrainingModule(payload: {
  module_name: string;
  module_description?: string;
  role_groups: RoleGroup[];
  duration_minutes?: number;
  expiration_months?: number;
  is_required?: boolean;
}): Promise<void> {
  const supabase = createClient();
  const user = await getUser(supabase);
  if (!user) throw new Error('Unauthorized');
  const orgId = await getOrgId(user.id);
  if (!orgId) throw new Error('No organization found');

  const { error } = await (supabase as any)
    .from('training_modules')
    .insert({
      module_name: payload.module_name,
      module_description: payload.module_description ?? null,
      role_groups: payload.role_groups,
      duration_minutes: payload.duration_minutes ?? 30,
      expiration_months: payload.expiration_months ?? 12,
      is_required: payload.is_required ?? true,
      organization_id: orgId,
      user_id: user.id,
    });
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/training');
}

// ─── Assignments ─────────────────────────────────────────────

async function autoAssignModules(employeeId: string, roleGroup: RoleGroup, orgId: string) {
  const supabase = createClient();

  const { data: modules } = await (supabase as any)
    .from('training_modules')
    .select('id, expiration_months, role_groups')
    .eq('organization_id', orgId)
    .eq('is_required', true);

  if (!modules?.length) return;

  const now = new Date();
  const dueDate = addDays(now, 30);

  const toInsert = (modules as any[])
    .filter((m) => (m.role_groups as string[]).includes(roleGroup))
    .map((m) => ({
      employee_id: employeeId,
      module_id: m.id,
      org_id: orgId,
      due_date: dueDate,
      status: 'not_started',
    }));

  if (toInsert.length) {
    await (supabase as any).from('training_assignments').insert(toInsert);
  }
}

export async function getAssignments(filters?: {
  employeeId?: string;
  status?: AssignmentStatus;
  roleGroup?: RoleGroup;
}): Promise<TrainingAssignment[]> {
  const supabase = createClient();
  const user = await getUser(supabase);
  if (!user) throw new Error('Unauthorized');
  const orgId = await getOrgId(user.id);
  if (!orgId) return [];

  let query = (supabase as any)
    .from('training_assignments')
    .select(`
      *,
      employee:employees(*),
      module:training_modules(*),
      certificate:training_certificates(id, certificate_pdf_url)
    `)
    .eq('org_id', orgId);

  if (filters?.employeeId) query = query.eq('employee_id', filters.employeeId);
  if (filters?.status) query = query.eq('status', filters.status);

  const { data, error } = await query.order('assigned_at', { ascending: false });
  if (error) throw new Error(error.message);

  let result: TrainingAssignment[] = data ?? [];

  if (filters?.roleGroup) {
    result = result.filter((a: any) => a.employee?.role_group === filters.roleGroup);
  }

  return result;
}

export async function manualAssign(payload: {
  employee_id: string;
  module_id: string;
  due_date?: string;
}): Promise<void> {
  const supabase = createClient();
  const user = await getUser(supabase);
  if (!user) throw new Error('Unauthorized');
  const orgId = await getOrgId(user.id);
  if (!orgId) throw new Error('No organization found');

  const dueDate = payload.due_date ?? addDays(new Date(), 30);

  const { error } = await (supabase as any).from('training_assignments').insert({
    employee_id: payload.employee_id,
    module_id: payload.module_id,
    org_id: orgId,
    due_date: dueDate,
    status: 'not_started',
  });
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/training');
}

export async function markAssignmentComplete(assignmentId: string): Promise<void> {
  const supabase = createClient();
  const user = await getUser(supabase);
  if (!user) throw new Error('Unauthorized');
  const orgId = await getOrgId(user.id);
  if (!orgId) throw new Error('No organization found');

  const now = new Date();

  // Fetch module to know expiration_months
  const { data: assignment } = await (supabase as any)
    .from('training_assignments')
    .select('module:training_modules(expiration_months)')
    .eq('id', assignmentId)
    .eq('org_id', orgId)
    .single();

  const expirationMonths = (assignment as any)?.module?.expiration_months ?? 12;
  const expiresAt = addMonths(now, expirationMonths);

  const { error } = await (supabase as any)
    .from('training_assignments')
    .update({
      status: 'completed',
      completed_at: now.toISOString(),
      expires_at: expiresAt,
    })
    .eq('id', assignmentId)
    .eq('org_id', orgId);
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/training');
}

// ─── Stats ───────────────────────────────────────────────────

export async function getTrainingOverviewStats(): Promise<TrainingOverviewStats> {
  const supabase = createClient();
  const user = await getUser(supabase);
  if (!user) throw new Error('Unauthorized');
  const orgId = await getOrgId(user.id);
  if (!orgId) return {
    total_employees: 0, fully_compliant: 0, compliance_pct: 0,
    total_assignments: 0, completed: 0, in_progress: 0, not_started: 0, expired: 0,
  };

  const [{ data: employees }, { data: assignments }] = await Promise.all([
    (supabase as any).from('employees').select('id').eq('org_id', orgId).eq('is_active', true),
    (supabase as any).from('training_assignments').select('employee_id, status').eq('org_id', orgId),
  ]);

  const empList: string[] = (employees ?? []).map((e: any) => e.id);
  const assignList: { employee_id: string; status: string }[] = assignments ?? [];

  const counts = { completed: 0, in_progress: 0, not_started: 0, expired: 0 };
  for (const a of assignList) {
    counts[a.status as keyof typeof counts] = (counts[a.status as keyof typeof counts] ?? 0) + 1;
  }

  // Fully compliant = employee has no expired/not_started/in_progress assignments
  const badEmployees = new Set(
    assignList
      .filter((a) => a.status !== 'completed')
      .map((a) => a.employee_id)
  );
  const fullyCompliant = empList.filter((id) => !badEmployees.has(id)).length;

  return {
    total_employees: empList.length,
    fully_compliant: fullyCompliant,
    compliance_pct: empList.length ? Math.round((fullyCompliant / empList.length) * 100) : 0,
    total_assignments: assignList.length,
    ...counts,
  };
}

export async function getEmployeesWithAssignments(): Promise<EmployeeWithAssignments[]> {
  const supabase = createClient();
  const user = await getUser(supabase);
  if (!user) throw new Error('Unauthorized');
  const orgId = await getOrgId(user.id);
  if (!orgId) return [];

  const { data: employees, error: empError } = await (supabase as any)
    .from('employees')
    .select('*')
    .eq('org_id', orgId)
    .eq('is_active', true)
    .order('last_name');
  if (empError) throw new Error(empError.message);

  const { data: assignments } = await (supabase as any)
    .from('training_assignments')
    .select('*, module:training_modules(*), certificate:training_certificates(id)')
    .eq('org_id', orgId);

  const assignMap: Record<string, TrainingAssignment[]> = {};
  for (const a of (assignments ?? []) as TrainingAssignment[]) {
    if (!assignMap[a.employee_id]) assignMap[a.employee_id] = [];
    assignMap[a.employee_id].push(a);
  }

  return (employees ?? []).map((emp: Employee) => {
    const empAssignments = assignMap[emp.id] ?? [];
    const total = empAssignments.length;
    const completed = empAssignments.filter((a) => a.status === 'completed').length;
    return {
      ...emp,
      assignments: empAssignments,
      compliance_pct: total ? Math.round((completed / total) * 100) : 100,
    };
  });
}
