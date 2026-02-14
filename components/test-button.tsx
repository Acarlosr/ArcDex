'use client'

export function TestButton() {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        width: '5rem',
        height: '5rem',
        backgroundColor: '#7c3aed',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '2.5rem',
        cursor: 'pointer',
        zIndex: 999999,
        boxShadow: '0 25px 50px rgba(124, 58, 237, 0.8)',
        border: '4px solid white',
      }}
      onClick={() => {
        console.log('Botão clicado!')
        alert('✅ Botão teste funcionando!')
      }}
    >
      🤖
    </div>
  )
}
