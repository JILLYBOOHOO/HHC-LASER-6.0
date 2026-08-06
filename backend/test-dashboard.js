const { executeQuery } = require('./dist/config/database');

async function test() {
  try {
    const r1 = await executeQuery("SELECT COALESCE(SUM(amount_jmd), 0) as total FROM transactions WHERE DATE(created_at) = CURRENT_DATE AND status = 'completed'");
    console.log('r1', r1);
    const r2 = await executeQuery("SELECT COALESCE(SUM(amount_jmd), 0) as total FROM transactions WHERE EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE) AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE) AND status = 'completed'");
    console.log('r2', r2);
    const r3 = await executeQuery("SELECT COUNT(*) as count FROM appointments WHERE scheduled_date = CURRENT_DATE AND status NOT IN ('cancelled', 'no_show')");
    console.log('r3', r3);
    const r4 = await executeQuery("SELECT COUNT(*) as count FROM user_roles WHERE role = 'customer'");
    console.log('r4', r4);
    const r5 = await executeQuery("SELECT ROUND(SUM(CASE WHEN status = 'no_show' THEN 1 ELSE 0 END)::numeric / COUNT(*) * 100, 1) as rate FROM appointments WHERE scheduled_date >= CURRENT_DATE - INTERVAL '30 days'");
    console.log('r5', r5);
    const r6 = await executeQuery("SELECT s.name, COUNT(aps.id) as bookings FROM appointment_services aps JOIN services s ON s.id = aps.service_id JOIN appointments a ON a.id = aps.appointment_id WHERE a.created_at >= CURRENT_TIMESTAMP - INTERVAL '30 days' GROUP BY s.id, s.name ORDER BY bookings DESC LIMIT 5");
    console.log('r6', r6);
    const r7 = await executeQuery("SELECT DATE(created_at) as date, SUM(amount_jmd) as revenue FROM transactions WHERE status = 'completed' AND created_at >= CURRENT_TIMESTAMP - INTERVAL '30 days' GROUP BY DATE(created_at) ORDER BY date ASC");
    console.log('r7', r7);
  } catch (e) {
    console.error("SQL ERROR:", e);
  }
  process.exit(0);
}

test();
