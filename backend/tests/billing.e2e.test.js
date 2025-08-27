/*
 E2E smoke tests for billing flows against a running backend at API_BASE
 Requires backend and DB up via docker compose; uses admin credentials.
*/

const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));

const API_BASE = process.env.API_BASE || 'http://localhost:3001';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@fitlife.co.mz';
const ADMIN_PASS = process.env.ADMIN_PASS || 'admin123';

jest.setTimeout(60000);

async function post(path, body, token) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body || {}),
  });
  const text = await res.text();
  let json; try { json = JSON.parse(text); } catch { json = text; }
  return { status: res.status, body: json };
}

async function get(path, token) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  const text = await res.text();
  let json; try { json = JSON.parse(text); } catch { json = text; }
  return { status: res.status, body: json };
}

describe('Billing E2E', () => {
  let token;
  let member;
  let plan;
  let invoice;

  test('auth: sign in or sign up admin', async () => {
    let res = await post('/api/auth/signin', { email: ADMIN_EMAIL, password: ADMIN_PASS });
    if (res.status === 401) {
      res = await post('/api/auth/signup', { email: ADMIN_EMAIL, password: ADMIN_PASS, role: 'admin', name: 'Admin' });
      expect([200,201]).toContain(res.status);
      token = res.body.token;
    } else {
      expect(res.status).toBe(200);
      token = res.body.token;
    }
    expect(typeof token).toBe('string');
  });

  test('plans: list', async () => {
    const res = await get('/api/plans', token);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    plan = res.body[0];
    expect(plan && plan.id).toBeTruthy();
  });

  test('members: create', async () => {
    const unique = Date.now();
    const res = await post('/api/members', {
      name: `Teste Membro ${unique}`,
      email: `m${unique}@example.com`,
      phone: '840000000',
      address: 'Maputo',
      birthDate: '1990-01-01',
      gender: 'male',
      emergencyContact: 'N/A',
      emergencyPhone: '840000001',
      plan: plan.name,
      status: 'active',
    }, token);
    expect(res.status).toBe(201);
    member = res.body;
    expect(member && member.id).toBeTruthy();
  });

  test('invoice: create', async () => {
    const res = await post('/api/billing/invoices', {
      member_id: member.id,
      plan_id: plan.id,
      descricao_servico: plan.name,
      quantidade: 1,
      preco_unitario: Number(plan.price || 1200),
    }, token);
    expect([200,201]).toContain(res.status);
    invoice = res.body;
    expect(invoice && invoice.id).toBeTruthy();
  });

  test('payment: pay in full and generate receipt', async () => {
    const res = await post('/api/billing/receipts', {
      factura_id: invoice.id,
      valor_pago: invoice.total,
      metodo_pagamento: 'mpesa',
      referencia_pagamento: `TEST-${Date.now()}`,
    }, token);
    expect([200,201]).toContain(res.status);
    expect(res.body && res.body.id).toBeTruthy();
  });

  test('credit note: create small credit and list member credits', async () => {
    const creditAmount = Math.min(50, Math.max(10, Math.round(Number(invoice.total) * 0.02)));
    const create = await post('/api/billing/credit-notes', {
      factura_id: invoice.id,
      motivo: 'Ajuste de teste',
      valor_credito: creditAmount,
      tipo: 'parcial',
    }, token);
    expect([200,201]).toContain(create.status);

    const credits = await get(`/api/billing/member-credits/${member.id}`, token);
    expect(credits.status).toBe(200);
    expect(Array.isArray(credits.body)).toBe(true);
  });
});


