import React, { useEffect, useState } from 'react';
import userService from '../../services/userService';
import { toast } from 'react-toastify';
import { Loader, User, Shield, Users, Mail, Settings2, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

const AccountManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const brandGreen = '#324d3e';

    const fetchUsers = async () => {
        try {
            const data = await userService.getAllUsers();
            setUsers(data);
        } catch (error) {
            toast.error("Không thể tải danh sách người dùng");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRoleChange = async (userId, newRole) => {
        const action = newRole === 'EXPERT' ? 'nâng cấp' : 'hạ cấp';
        if (!window.confirm(`Bạn có chắc chắn muốn ${action} vai trò người dùng này?`)) return;

        try {
            await userService.updateUserRole(userId, newRole);
            toast.success("Cập nhật vai trò thành công");
            fetchUsers();
        } catch (error) {
            toast.error("Cập nhật thất bại");
        }
    };

    if (loading) return (
        <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
            <Loader className="animate-spin mb-3" size={40} color={brandGreen} />
            <p className="text-muted fw-medium">Đang tải dữ liệu...</p>
        </div>
    );

    return (
        <div className="container py-5 animate-fade-in"
        style={{
                     fontFamily: "'Rubik', sans-serif",
                     marginTop: '100px', // Đẩy nội dung xuống 100px để không bị Navbar che
                     minHeight: '80vh'
                 }}>
            {/* Header Section */}
            <div className="row align-items-end mb-5">
                <div className="col-md-8">
                    <div className="d-flex align-items-center gap-3 mb-2">
                        <div className="p-2 rounded-3" style={{ backgroundColor: 'rgba(50, 77, 62, 0.1)' }}>
                            <Shield size={28} style={{ color: brandGreen }} />
                        </div>
                        <h6 className="text-uppercase fw-bold mb-0 opacity-50" style={{ letterSpacing: '2px', fontSize: '12px' }}>
                            Admin Console
                        </h6>
                    </div>
                    <h1 style={{ fontFamily: "'Lora', serif", fontWeight: 700, color: brandGreen, fontSize: '2.5rem' }}>
                        Quản lý tài khoản
                    </h1>
                    <p className="text-muted mb-0">Hệ thống quản trị viên: Quản lý quyền hạn và phân quyền chuyên gia.</p>
                </div>
                <div className="col-md-4 text-md-end mt-4 mt-md-0">
                    <div className="d-inline-flex align-items-center gap-2 bg-white px-4 py-2 rounded-pill shadow-sm border">
                        <Users size={18} className="text-muted" />
                        <span className="fw-bold">{users.length}</span>
                        <span className="text-muted">Thành viên</span>
                    </div>
                </div>
            </div>

            {/* Main Table Card */}
            <div className="card border-0 shadow-lg rounded-4 overflow-hidden bg-white">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0 custom-table">
                        <thead>
                            <tr style={{ backgroundColor: '#f8faf9' }}>
                                <th className="ps-4 py-4 border-0 text-muted small fw-bold text-uppercase">Thông tin thành viên</th>
                                <th className="py-4 border-0 text-muted small fw-bold text-uppercase">Liên hệ</th>
                                <th className="py-4 border-0 text-muted small fw-bold text-uppercase">Vai trò hiện tại</th>
                                <th className="pe-4 py-4 border-0 text-muted small fw-bold text-uppercase text-end">Phân quyền</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td className="ps-4 py-4">
                                        <div className="d-flex align-items-center">
                                            <div className="avatar-wrapper shadow-sm" style={{ backgroundColor: brandGreen }}>
                                                <User size={20} color="#fff" />
                                            </div>
                                            <div className="ms-3">
                                                <div className="fw-bold text-dark mb-0" style={{ fontSize: '15px' }}>
                                                    {user.fullName || user.username}
                                                </div>
                                                <span className="text-muted" style={{ fontSize: '12px' }}>ID: #{user.id}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <div className="d-flex align-items-center gap-2 text-muted">
                                            <Mail size={14} />
                                            <span style={{ fontSize: '14px' }}>{user.email}</span>
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <span className={`role-badge ${
                                            user.roles.includes('ADMIN') ? 'rb-admin' :
                                            user.roles.includes('EXPERT') ? 'rb-expert' : 'rb-user'
                                        }`}>
                                            <span className="dot"></span>
                                            {user.roles.includes('ADMIN') ? 'Quản trị viên' :
                                             user.roles.includes('EXPERT') ? 'Chuyên gia' : 'Người dùng'}
                                        </span>
                                    </td>
                                    <td className="pe-4 py-4 text-end">
                                        {!user.roles.includes('ADMIN') ? (
                                            <div className="d-flex justify-content-end gap-2">
                                                {user.roles.includes('USER') && !user.roles.includes('EXPERT') ? (
                                                    <button
                                                        onClick={() => handleRoleChange(user.id, 'EXPERT')}
                                                        className="btn-action btn-promote"
                                                        title="Nâng cấp lên chuyên gia"
                                                    >
                                                        <ArrowUpCircle size={16} />
                                                        <span>Lên Chuyên gia</span>
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleRoleChange(user.id, 'USER')}
                                                        className="btn-action btn-demote"
                                                        title="Hạ cấp xuống người dùng"
                                                    >
                                                        <ArrowDownCircle size={16} />
                                                        <span>Hạ cấp User</span>
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-muted small italic px-3">Hệ thống khóa</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <style>{`
                .animate-fade-in {
                    animation: fadeIn 0.5s ease-in-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .avatar-wrapper {
                    width: 44px;
                    height: 44px;
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: transform 0.3s ease;
                }
                tr:hover .avatar-wrapper {
                    transform: scale(1.1) rotate(-5deg);
                }

                .custom-table tbody tr {
                    transition: all 0.2s ease;
                    border-bottom: 1px solid #f1f3f2;
                }
                .custom-table tbody tr:hover {
                    background-color: #fcfdfc !important;
                }

                .role-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 6px 16px;
                    border-radius: 50px;
                    font-size: 13px;
                    font-weight: 600;
                }
                .dot { width: 6px; height: 6px; border-radius: 50%; }

                .rb-admin { background: #fff1f2; color: #e11d48; }
                .rb-admin .dot { background: #e11d48; }

                .rb-expert { background: #f5f3ff; color: #7c3aed; }
                .rb-expert .dot { background: #7c3aed; }

                .rb-user { background: #f0fdf4; color: #16a34a; }
                .rb-user .dot { background: #16a34a; }

                .btn-action {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 16px;
                    border-radius: 10px;
                    font-size: 13px;
                    font-weight: 600;
                    border: none;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .btn-promote { background: #7c3aed; color: white; }
                .btn-promote:hover { background: #6d28d9; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3); }

                .btn-demote { background: #f1f5f9; color: #475569; }
                .btn-demote:hover { background: #e2e8f0; color: #0f172a; transform: translateY(-2px); }

                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}

export default AccountManagement;