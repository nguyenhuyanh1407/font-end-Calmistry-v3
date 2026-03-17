import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import subscriptionService from '../../services/subscriptionService';
import userService from '../../services/userService';
import '../../styles/PlanCheckout.css';

const isGold = (me) => String(me?.plan || '').toUpperCase() === 'GOLD';

const PlanCheckout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isPaying, setIsPaying] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');

  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const authKey = token ? token.slice(-16) : 'anon';
  const meStorageKey = `me:${authKey}`;

  const { data: me } = useQuery({
    queryKey: ['me', authKey],
    queryFn: userService.getMyInfo,
    enabled: Boolean(token),
    initialData: () => {
      try {
        const raw = localStorage.getItem(meStorageKey);
        return raw ? JSON.parse(raw) : undefined;
      } catch {
        return undefined;
      }
    },
    staleTime: 30_000
  });
  const alreadyGold = isGold(me);

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const status = params.get('status');
  const plan = params.get('plan');

  useEffect(() => {
    if (plan !== 'gold') return;
    if (status === 'success') {
      // PayOS returnUrl can happen before webhook has updated plan => poll for a short time.
      let cancelled = false;
      const sync = async () => {
        setIsSyncing(true);
        try {
          for (let i = 0; i < 15; i += 1) {
            if (cancelled) return;
            const me = await userService.getMyInfo();
            queryClient.setQueryData(['me', authKey], me);
            if (isGold(me)) {
              toast.success('Thanh toán thành công! Tài khoản đã mở khóa gói Vàng.');
              const from = location.state?.from;
              navigate(from || '/userDashboard', { replace: true });
              return;
            }
            await new Promise((r) => setTimeout(r, 2000));
          }
          toast.info('Đã thanh toán thành công. Hệ thống đang đồng bộ gói Vàng, vui lòng chờ thêm hoặc tải lại trang.');
        } catch {
          toast.info('Đã thanh toán thành công. Vui lòng chờ vài giây rồi tải lại trang để thấy gói Vàng.');
        } finally {
          if (!cancelled) setIsSyncing(false);
        }
      };
      sync();
      return () => {
        cancelled = true;
      };
    }
    if (status === 'cancel') {
      toast.info('Bạn đã huỷ thanh toán. Bạn có thể thử lại bất cứ lúc nào.');
    }
  }, [status, plan, queryClient, authKey, location.state, navigate]);

  const handleUpgrade = async () => {
    try {
      if (alreadyGold) {
        toast.info('Tài khoản của bạn đã là gói Vàng.');
        return;
      }
      setIsPaying(true);
      const data = await subscriptionService.createGoldCheckout({ voucherCode });
      if (!data?.checkoutUrl) {
        toast.error('Không tạo được link thanh toán. Vui lòng thử lại.');
        return;
      }
      window.location.href = data.checkoutUrl;
    } catch (e) {
      toast.error(e?.message || 'Không thể tạo link thanh toán.');
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div className="plan-checkout-page">
      <div className="container">
        <div className="plan-checkout-banner">
          <h2>Hãy nâng cấp lên gói vàng để có thể trải nghiệm tính năng này! Calmistry xin cảm ơn!</h2>
          <p>
            Thanh toán qua PayOS (test) • Giá gói Vàng: <strong>2.000 VNĐ</strong>
            {isSyncing ? ' • Đang đồng bộ trạng thái gói Vàng…' : ''}
            {alreadyGold ? ' • Bạn đã là thành viên gói Vàng.' : ''}
          </p>
        </div>

        <div className="plan-checkout-grid">
          <div className="plan-card">
            <div className="plan-card-title">
              <h3>Thông tin khách hàng</h3>
              <span className="plan-pill">{alreadyGold ? 'Đã là Gói Vàng' : 'Gói Bạc → Gói Vàng'}</span>
            </div>

            <div className="plan-kv">
              <div className="k">Họ tên</div>
              <div className="v">{me?.fullName || '—'}</div>
              <div className="k">Email</div>
              <div className="v">{me?.email || '—'}</div>
              <div className="k">Số điện thoại</div>
              <div className="v">{me?.phoneNumber || '—'}</div>
            </div>

            <div className="plan-divider" />

            <div className="plan-card-title" style={{ marginBottom: 10 }}>
              <h3>Voucher</h3>
              <span className="plan-pill">Tuỳ chọn</span>
            </div>
            <div className="voucher-row">
              <input
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value)}
                placeholder="Nhập mã voucher (nếu có)"
              />
              <button
                className="btn btn-outline-secondary"
                style={{ borderRadius: 14, padding: '10px 14px', fontWeight: 800 }}
                type="button"
                onClick={() => toast.info('Voucher sẽ được gửi kèm đơn thanh toán (nếu có).')}
              >
                Áp dụng
              </button>
            </div>
            <div className="muted-note">Hiện tại voucher chỉ được ghi nhận cùng đơn thanh toán (chưa trừ tiền tự động).</div>
          </div>

          <div className="plan-card">
            <div className="plan-card-title">
              <h3>Đơn hàng</h3>
              <span className="plan-pill">PayOS</span>
            </div>

            <div className="plan-kv">
              <div className="k">Mặt hàng</div>
              <div className="v"><strong>Nâng cấp gói Vàng</strong></div>
              <div className="k">Giá tiền</div>
              <div className="v"><strong>2.000 VNĐ</strong></div>
              <div className="k">Hình thức</div>
              <div className="v">Chuyển khoản (PayOS)</div>
            </div>

            <div className="plan-divider" />

              <button
                className="checkout-btn"
                disabled={isPaying || isSyncing || alreadyGold}
                onClick={handleUpgrade}
                type="button"
              >
              {alreadyGold ? 'Bạn đã là gói Vàng' : isPaying ? 'Đang tạo link thanh toán…' : isSyncing ? 'Đang đồng bộ…' : 'Checkout (PayOS)'}
              </button>

            <div className="muted-note">
              Sau khi thanh toán xong, hệ thống sẽ tự cập nhật gói của bạn qua webhook PayOS.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanCheckout;
