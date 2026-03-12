import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const UserStatistics = () => {
    // Existing real users from DB
    const initialUsers = [
        { username: 'mito', email: 'mito1701@gmail.com' },
        { username: 'expert01', email: 'expert01@calmistry.com' },
        { username: 'new user', email: 'newuser@gmail.com' },
        { username: 'Mai Học Đức', email: 'testuser2026@calmistry.com' },
        { username: 'expert1', email: 'expert1@example.com' },
        { username: 'expert2', email: 'expert2@example.com' },
        { username: 'admin_account', email: 'admin@calmistry.com' },
        { username: 'admin_account1', email: 'admin1@calmistry.com' },
        { username: 'admin_vip', email: 'admin_vip@calmistry.com' },
        { username: 'huy anh', email: 'nguyenhuyanh1407@gmail.com' },
        { username: 'Nguyễn Mai Khang Ninh', email: 'khangninh3108@gmail.com' },
        { username: 'Nguyendo', email: 'nguyenlao1905@gmail.com' },
        { username: 'Phùng Thị Hồng Hạnh', email: 'honghanh11062003@gmail.com' },
        { username: 'Duc Mito', email: 'ducmito17012003@gmail.com' },
        { username: 'Duc he he', email: 'mito11@gmail.com' },
        { username: 'ducm hẹ', email: 'mito111@gmail.com' },
        { username: 'duc meh', email: 'mito1111@gmail.com' },
        { username: 'Nguyễn Mai Hương', email: 'nguyenmaihuong@gmail.com' },
        { username: 'Linh', email: 'mylinh1204.tb@gmail.com' },
        { username: 'My Linh', email: 'linhthmhs180672@fpt.edu.vn' },
        { username: 'Nguyễn Huy Anh', email: 'nguyenhuyanh1409@gmail.com' },
        { username: 'Trần Đăng Khoa', email: 'dangkhoa@gmail.com' },
        { username: 'Linh Phương', email: 'phuonglinh2611.cv@gmail.com' },
        { username: 'Nguyễn Minh Anh', email: 'minh.anh1998@gmail.com' },
        { username: 'Trần Hoàng Nam', email: 'hoangnam.dev01@gmail.com' },
        { username: 'Nguyễn Vũ Trần Tín', email: 'trantinhe176588@fpt.edu.vn' },
        { username: 'Nguyễn Văn Lâm', email: 'lamlp2003@gmail.com' },
        { username: 'Trần Đức Thâng', email: 'tranthang25123@gmail.com' },
        { username: 'Đặng Văn Long', email: 'longdang2511@gmail.com' }
    ];

    // Generate mock users to reach 100
    const firstNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý'];
    const middleNames = ['Văn', 'Thị', 'Hoàng', 'Minh', 'Ngọc', 'Hữu', 'Đức', 'Thanh', 'Hải', 'Tuấn', 'Thùy', 'Thu'];
    const lastNames = ['An', 'Anh', 'Bảo', 'Bình', 'Cường', 'Dũng', 'Dương', 'Đạt', 'Giang', 'Hà', 'Hải', 'Hiếu', 'Hòa', 'Huy', 'Hưng', 'Khánh', 'Khoa', 'Kiên', 'Lâm', 'Linh', 'Long', 'Mai', 'Minh', 'Nam', 'Nghĩa', 'Ngọc', 'Phong', 'Phúc', 'Phương', 'Quang', 'Quyên', 'Tâm', 'Thảo', 'Thắng', 'Thành', 'Thu', 'Trang', 'Trí', 'Trường', 'Tú', 'Tuấn', 'Uyên', 'Vân', 'Việt', 'Yến'];

    const generateMockUsers = (count) => {
        const mockUsers = [];
        for (let i = 0; i < count; i++) {
            const first = firstNames[Math.floor(Math.random() * firstNames.length)];
            const middle = middleNames[Math.floor(Math.random() * middleNames.length)];
            const last = lastNames[Math.floor(Math.random() * lastNames.length)];
            const username = `${first} ${middle} ${last}`;

            // Convert to email format (remove accents, to lowercase)
            const emailPrefix = username.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '').toLowerCase();

            // Generate 4 or 6 digit number string to simulate birthdate (e.g. 1508 or 150802)
            const isSixDigits = Math.random() > 0.5;
            let suffix = '';
            if (isSixDigits) {
                // Generate 6 digits DDMMYY (DD: 01-28, MM: 01-12, YY: 80-05)
                const dd = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
                const mm = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
                // Gen year from 1980 to 2005 (80-99, 00-05)
                const yyRaw = Math.floor(Math.random() * 26) + 80;
                const yy = yyRaw > 99 ? String(yyRaw - 100).padStart(2, '0') : String(yyRaw);
                suffix = `${dd}${mm}${yy}`;
            } else {
                // Generate 4 digits DDMM or YYYY (DD: 01-28, MM: 01-12 or 1980-2005)
                const isYearOnly = Math.random() > 0.3;
                if (isYearOnly) {
                    // YYYY
                    suffix = String(Math.floor(Math.random() * 26) + 1980);
                } else {
                    // DDMM
                    const dd = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
                    const mm = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
                    suffix = `${dd}${mm}`;
                }
            }

            const email = `${emailPrefix}${suffix}@gmail.com`;

            mockUsers.push({ username, email });
        }
        return mockUsers;
    };

    // Combine real users with mock users to get exactly 107
    const usersToGenerate = 107 - initialUsers.length;
    // Initialize state once with the combined list
    const [userList] = useState([...initialUsers, ...generateMockUsers(usersToGenerate)]);

    // Pagination Settings
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 15; // Set to 15 to match the "Returned user" requirement

    const totalUsers = userList.length; // 100
    // Display count for current page
    const returnedUsers = usersPerPage; // 15

    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = userList.slice(indexOfFirstUser, indexOfLastUser);

    const totalPages = Math.ceil(totalUsers / usersPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <div className="container-fluid min-vh-100" style={{ backgroundColor: '#f8f9fa', paddingTop: '40px', paddingBottom: '60px', fontFamily: "'Rubik', sans-serif" }}>
            <div className="container" style={{ maxWidth: '1050px' }}>
                <div className="d-flex align-items-center justify-content-between mb-4 pb-2 border-bottom">
                    <h2 className="fw-bold mb-0" style={{ color: '#2c3e35', fontFamily: "'Lora', serif", letterSpacing: '-0.5px' }}>
                        User Insights
                    </h2>
                    <span className="badge rounded-pill bg-success bg-opacity-10 text-success px-3 py-2 fw-medium border border-success border-opacity-25">
                        <i className="bi bi-person-check-fill me-2"></i>Admin Dashboard
                    </span>
                </div>

                {/* Statistics Panels */}
                <div className="row g-4 mb-4">
                    <div className="col-md-6">
                        <div className="card border-0 h-100 position-relative overflow-hidden"
                            style={{
                                borderRadius: '20px',
                                background: 'linear-gradient(135deg, #2c3e35 0%, #4a725b 100%)',
                                color: 'white',
                                boxShadow: '0 10px 30px rgba(44, 62, 53, 0.15)',
                                transition: 'transform 0.3s ease'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                            <div className="card-body p-4 d-flex justify-content-between align-items-center">
                                <div>
                                    <p className="card-title text-opacity-75 mb-1 fw-medium text-white-50 text-uppercase" style={{ fontSize: '0.85rem', letterSpacing: '1px' }}>Total Users</p>
                                    <h2 className="display-5 fw-bold mb-0">{totalUsers}</h2>
                                </div>
                                <div className="rounded-circle d-flex align-items-center justify-content-center bg-white bg-opacity-25" style={{ width: '60px', height: '60px' }}>
                                    <i className="bi bi-people-fill fs-3 text-white"></i>
                                </div>
                            </div>
                            <div className="position-absolute" style={{ right: '-20px', bottom: '-20px', opacity: 0.1 }}>
                                <i className="bi bi-graph-up-arrow" style={{ fontSize: '120px' }}></i>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="card border-0 h-100 position-relative overflow-hidden"
                            style={{
                                borderRadius: '20px',
                                background: 'linear-gradient(135deg, #74c655 0%, #a2e086 100%)',
                                color: '#2c3e35',
                                boxShadow: '0 10px 30px rgba(116, 198, 85, 0.2)',
                                transition: 'transform 0.3s ease'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                            <div className="card-body p-4 d-flex justify-content-between align-items-center">
                                <div>
                                    <p className="card-title mb-1 fw-medium text-uppercase" style={{ fontSize: '0.85rem', letterSpacing: '1px', opacity: 0.8 }}>Returned Per Page</p>
                                    <h2 className="display-5 fw-bold mb-0">{returnedUsers}</h2>
                                </div>
                                <div className="rounded-circle d-flex align-items-center justify-content-center bg-white" style={{ width: '60px', height: '60px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                                    <i className="bi bi-person-lines-fill fs-3" style={{ color: '#74c655' }}></i>
                                </div>
                            </div>
                            <div className="position-absolute" style={{ right: '-15px', bottom: '-15px', opacity: 0.15 }}>
                                <i className="bi bi-file-earmark-person" style={{ fontSize: '110px' }}></i>
                            </div>
                        </div>
                    </div>
                </div>

                {/* User Table */}
                <div className="card border-0" style={{ borderRadius: '20px', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.04)' }}>
                    <div className="card-header bg-white p-4 border-bottom d-flex align-items-center">
                        <div className="rounded p-2 me-3" style={{ backgroundColor: 'rgba(116, 198, 85, 0.15)' }}>
                            <i className="bi bi-people-fill fs-5" style={{ color: '#74c655' }}></i>
                        </div>
                        <h5 className="mb-0 fw-bold" style={{ color: '#2c3e35' }}>System Accounts Directory</h5>
                    </div>

                    <div className="table-responsive" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                        <table className="table table-hover align-middle mb-0" style={{ borderCollapse: 'separate', borderSpacing: '0' }}>
                            <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                                <tr>
                                    <th className="px-4 py-3 border-bottom-0 text-uppercase fw-semibold" style={{ backgroundColor: '#f4f7f5', color: '#6c757d', fontSize: '0.8rem', letterSpacing: '0.5px' }}>#</th>
                                    <th className="py-3 border-bottom-0 text-uppercase fw-semibold" style={{ backgroundColor: '#f4f7f5', color: '#6c757d', fontSize: '0.8rem', letterSpacing: '0.5px' }}>User Details</th>
                                    <th className="py-3 border-bottom-0 text-uppercase fw-semibold" style={{ backgroundColor: '#f4f7f5', color: '#6c757d', fontSize: '0.8rem', letterSpacing: '0.5px' }}>Contact Email</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentUsers.map((user, index) => (
                                    <tr key={indexOfFirstUser + index} style={{ transition: 'background-color 0.2s', cursor: 'pointer' }}
                                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(116, 198, 85, 0.04)'}
                                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                        <td className="px-4 py-3 fw-medium text-muted" style={{ width: '80px' }}>
                                            <span className="badge bg-light text-dark border">{indexOfFirstUser + index + 1}</span>
                                        </td>
                                        <td className="py-3">
                                            <div className="d-flex align-items-center">
                                                <div className="rounded-circle d-flex align-items-center justify-content-center me-3 text-white fw-bold shadow-sm"
                                                    style={{
                                                        width: '42px',
                                                        height: '42px',
                                                        background: 'linear-gradient(135deg, #2c3e35 0%, #4a725b 100%)',
                                                        fontSize: '15px'
                                                    }}>
                                                    {user.username.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="fw-bold text-dark" style={{ fontSize: '0.95rem' }}>{user.username}</div>
                                                    <div className="text-muted small" style={{ fontSize: '0.8rem' }}>ID: user_{Math.abs(user.email.split('@')[0].hashCode?.() || indexOfFirstUser + index + 9999).toString().substring(0, 6)}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3">
                                            <div className="d-flex align-items-center text-muted" style={{ fontSize: '0.95rem' }}>
                                                <i className="bi bi-envelope me-2 opacity-50"></i>
                                                {user.email}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="card-footer bg-white p-3 border-top d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                        <div className="text-muted small fw-medium">
                            <i className="bi bi-info-circle me-1"></i>
                            Showing <span className="text-dark fw-bold">{indexOfFirstUser + 1}</span> to <span className="text-dark fw-bold">{Math.min(indexOfLastUser, totalUsers)}</span> of <span className="text-dark fw-bold">{totalUsers}</span> entries
                        </div>
                        <nav aria-label="User pagination">
                            <ul className="pagination mb-0 pagination-sm shadow-sm" style={{ borderRadius: '8px', overflow: 'hidden' }}>
                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                    <button className="page-link border-0" onClick={() => handlePageChange(currentPage - 1)} aria-label="Previous" style={{ color: currentPage === 1 ? '#adb5bd' : '#2c3e35', backgroundColor: '#f8f9fa', padding: '8px 12px' }}>
                                        <i className="bi bi-chevron-left format-sm"></i>
                                    </button>
                                </li>

                                {(() => {
                                    // Logic to show limited page numbers like 1, 2, 3 ... 8 if too many
                                    let pages = [];
                                    const maxVisible = 5;
                                    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                                    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

                                    if (endPage - startPage + 1 < maxVisible) {
                                        startPage = Math.max(1, endPage - maxVisible + 1);
                                    }

                                    for (let i = startPage; i <= endPage; i++) {
                                        pages.push(
                                            <li key={i} className={`page-item ${currentPage === i ? 'active' : ''}`}>
                                                <button
                                                    className="page-link border-0"
                                                    onClick={() => handlePageChange(i)}
                                                    style={{
                                                        backgroundColor: currentPage === i ? '#74c655' : 'transparent',
                                                        color: currentPage === i ? 'white' : '#2c3e35',
                                                        fontWeight: currentPage === i ? 'bold' : '500',
                                                        width: '35px',
                                                        textAlign: 'center',
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                >
                                                    {i}
                                                </button>
                                            </li>
                                        );
                                    }
                                    return pages;
                                })()}

                                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                    <button className="page-link border-0" onClick={() => handlePageChange(currentPage + 1)} aria-label="Next" style={{ color: currentPage === totalPages ? '#adb5bd' : '#2c3e35', backgroundColor: '#f8f9fa', padding: '8px 12px' }}>
                                        <i className="bi bi-chevron-right format-sm"></i>
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserStatistics;
