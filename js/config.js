const SUPABASE_URL = 'https://jllirmrpkayiyajwebbr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpsbGlybXJwa2F5aXlhandlYmJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MDI5NDMsImV4cCI6MjA5MjM3ODk0M30.1_DZoCymoVUwdPrv_cZQPkF4NT9Rcucw7kvONvcCs0A';
const { createClient } = window.supabase;
window.db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function getUser() {
  const { data: { user } } = await window.db.auth.getUser();
  return user;
}

async function requireAuth() {
  const user = await getUser();
  if (!user) { window.location.href = 'auth.html'; return null; }
  return user;
}

async function signOut() {
  await window.db.auth.signOut();
  window.location.href = 'index.html';
}

function formatVND(n) {
  return Number(n).toLocaleString('vi-VN') + '₫';
}

function formatSimNumber(s) {
  if (!s) return '';
  const d = s.replace(/\D/g, '');
  if (d.length === 10) return d.replace(/(\d{4})(\d{3})(\d{3})/, '$1.$2.$3');
  if (d.length === 11) return d.replace(/(\d{4})(\d{3})(\d{4})/, '$1.$2.$3');
  return s;
}
