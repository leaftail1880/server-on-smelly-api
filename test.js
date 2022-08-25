const a = ['Atyp:', 'top'], action = 'Atyp:run'
const res = a.find(e=>action.startsWith(e))
if (!res) console.log('error')