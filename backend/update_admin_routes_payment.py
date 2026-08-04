import os

file_path = r"c:\Users\church\Downloads\HHCLASER5.0-main\HHCLASER5.0-main\backend\src\routes\admin.routes.ts"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

new_routes = """
// PATCH /api/admin/bookings/:id/payment
router.patch('/bookings/:id/payment',
  authenticate,
  requireRole('owner', 'admin', 'manager', 'specialist'),
  async (req, res, next) => {
    try {
      const { payment_status, transaction_id } = req.body;
      const validStatuses = ['unpaid', 'pending_payment', 'paid_online', 'paid_in_store', 'failed', 'refunded'];
      if (!validStatuses.includes(payment_status)) throw new AppError('Invalid payment status.', 400);

      await executeUpdate(
        'UPDATE appointments SET payment_status = ?, transaction_id = ? WHERE id = ?',
        [payment_status, transaction_id || null, req.params['id']]
      );
      res.json(successResponse(undefined, `Booking payment updated to ${payment_status}.`));
    } catch (e) { next(e); }
  }
);
"""

content = content.replace("export default router;", new_routes + "\nexport default router;")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Admin routes updated successfully with payment endpoint!")
