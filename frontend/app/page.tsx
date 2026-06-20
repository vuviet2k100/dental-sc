export default function Home() {
  return (
    <main style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f0f9ff',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '15px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        textAlign: 'center',
        maxWidth: '500px'
      }}>
        <h1 style={{ color: '#0369a1', marginBottom: '10px' }}>DentalCare Pro</h1>
        <p style={{ color: '#64748b', marginBottom: '30px' }}>
          Hệ thống quản lý phòng khám nha khoa chuyên nghiệp và bảo mật.
        </p>
        
        <a 
          href="/login" 
          style={{
            display: 'inline-block',
            backgroundColor: '#0284c7',
            color: 'white',
            padding: '12px 30px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '16px',
            fontWeight: 'bold',
            transition: 'background 0.3s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0369a1'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#0284c7'}
        >
          Đăng nhập hệ thống
        </a>
      </div>
    </main>
  );
}